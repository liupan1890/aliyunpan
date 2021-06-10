package download

import (
	"aliserver/data"
	"aliserver/rpc"
	"aliserver/utils"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
	"unicode/utf8"
)

//DataDowned 全局的 已下载队列
var DataDowned = struct {
	sync.RWMutex
	List []*DownFileModel
}{List: make([]*DownFileModel, 0, 100)}

//DataDowning 全局的 下载中队列
var DataDowning = struct {
	sync.RWMutex
	List []*DownFileModel
}{List: make([]*DownFileModel, 0, 100)}

//DataDowningReadCopy 确保加解锁安全
func DataDowningReadCopy() []*DownFileModel {
	DataDowning.RLock() //c1
	LEN := len(DataDowning.List)
	rlist := make([]*DownFileModel, LEN)
	for i := 0; i < LEN; i++ {
		rlist[i] = DataDowning.List[i]
	}
	DataDowning.RUnlock() //c1
	return rlist
}

//DataDownedReadCopy 确保加解锁安全
func DataDownedReadCopy() []*DownFileModel {
	DataDowned.RLock() //c2
	LEN := len(DataDowned.List)
	rlist := make([]*DownFileModel, LEN)
	for i := 0; i < LEN; i++ {
		rlist[i] = DataDowned.List[i]
	}
	DataDowned.RUnlock() //c2
	return rlist
}

//LoadDownedList 加载列表(downtime大->小)
func LoadDownedList() {
	isget, list := data.GetDownedAll()
	if !isget || len(list) == 0 {
		return
	}
	WeekAgo := time.Now().Add(-10 * 24 * time.Hour).UnixNano()
	List := make([]*DownFileModel, 0, 100)
	for DownID := range list {
		Item := &DownFileModel{}
		err := json.Unmarshal([]byte(list[DownID]), &Item)
		if err == nil {
			if Item.DownTime < WeekAgo { //10天前的记录删除掉
				data.DeleteDown(DownID)
			} else {
				UpdateStateDowned(Item)
				List = append(List, Item)
			}
		}
	}
	sort.Sort(DownFileOrder(List))
	DataDowned.Lock() //c3
	DataDowned.List = List
	DataDowned.Unlock() //c3
}

//LoadDowningList 加载列表(downtime大->小)
func LoadDowningList() {
	isget, list := data.GetDowningAll()
	if !isget || len(list) == 0 {
		return
	}
	List := make([]*DownFileModel, 0, 100)
	for DownID := range list {
		Item := &DownFileModel{}
		err := json.Unmarshal([]byte(list[DownID]), &Item)
		if err == nil {
			Item.FailedCode = 0
			UpdateStateStop(Item) //初始化列表时，全部停止下载
			List = append(List, Item)
		}
	}
	sort.Sort(DownFileOrder(List))
	DataDowning.Lock() //c4
	DataDowning.List = List
	DataDowning.Unlock() //c4
}

//DownedAdd 保存已下载
func DownedAdd(Item *DownFileModel) error {
	timenow := time.Now().UnixNano()
	DowningID := Item.DownID
	DownedID := strings.Replace(Item.DownID, "Downing:", "Downed:", -1) + ":" + strconv.FormatInt(timenow, 10)
	Item.DownID = DownedID
	Item.DownTime = timenow
	//DataDowned.List是从大到小，add的dtime肯定是最大的，所以插入在最前面
	DataDowned.List = append([]*DownFileModel{Item}, DataDowned.List...)

	b, _ := json.Marshal(Item)
	data.SetDown(DownedID, string(b)) //保存Downed
	data.DeleteDown(DowningID)        //删除Downing
	return nil
}

//DowningAdd 创建一个下载任务
func DowningAdd(userid, savepath, identity, name, path, hash string, size int64, dtime int64) (downing *DownFileModel, err error) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("DowningAddError ", " error=", errr)
			err = errors.New("error")
		}
	}()
	var DownID = "Down:Downing:" + userid + ":" + identity

	//计算出最终完整的下载地址
	d := string(os.PathSeparator)
	dlist := strings.Split(path, d)
	lendlist := len(dlist) - 1
	fname := dlist[lendlist] //最后一层文件夹名
	SavePathFull := savepath
	for i := 0; i < lendlist; i++ {
		tname := filepath.Join(SavePathFull, dlist[i], fname)
		if utf8.RuneCountInString(tname) > 254 { //处理长文件名
			break //break意味着抛弃剩余的中间层级的文件夹
		}
		SavePathFull = filepath.Join(SavePathFull, dlist[i])
	}
	SavePathFull = filepath.Join(SavePathFull, fname)

	downing = &DownFileModel{
		DownID:       DownID,
		GID:          "",
		UserID:       userid,
		DownSavePath: SavePathFull,

		Name:     name,
		Size:     size,
		Identity: identity,
		//Path:     path,
		Hash: hash,

		DownTime:      dtime, // time.Now().UnixNano()
		DownSize:      0,
		DownSpeed:     0,
		DownSpeedStr:  "",
		DownProcess:   0,
		IsStop:        false,
		IsDowning:     false,
		IsCompleted:   false,
		IsFailed:      false,
		FailedMessage: "",
		AutoGID:       0,
		AutoTry:       0,
		FailedCode:    0,
	}
	return downing, nil
}

//FailedMessage 格式化一下错误信息
func FailedMessage(FailedMessage string) string {
	if strings.Index(FailedMessage, "unexpected EOF") > 0 {
		return "链接被中断"
	}
	if strings.Index(FailedMessage, "target machine actively refused") > 0 {
		return "链接被拒绝"
	}
	if strings.Index(FailedMessage, "closed by the remote host") > 0 {
		return "链接被拒绝"
	}
	if strings.Index(FailedMessage, "certificate") > 0 {
		return "ssl证书错误"
	}
	if strings.HasPrefix(FailedMessage, "Get") && strings.HasSuffix(FailedMessage, "EOF") {
		return "链接被拒绝"
	}
	return FailedMessage
}

var tDown bool = false

//当前下载中任务
var mDown sync.Map

//StartDowning 下载的主线程，轮询Downing列表启动下载
func StartDowning() {
	tDown = true
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("StartDowningError ", " error=", errr)
		}
	}()

	for tDown {
		time.Sleep(time.Duration(1) * time.Second)
		_StartDowning()
	}
}
func _StartDowning() {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("_StartDowningError ", " error=", errr)
		}
	}()

	if Aria2Rpc != nil {
		downingUpdateProgress()

		TaskCountMax, terr := strconv.Atoi(data.Setting.DownMax)
		if terr != nil {
			TaskCountMax = 1
		}
		LEN := len(DataDowning.List)
		DowningCount := 0
		for i := LEN - 1; i >= 0; i-- {
			if DataDowning.List[i].IsDowning {
				DowningCount++
			}
		}
		downingSaveDowned(TaskCountMax, DowningCount)
		downingMakeDowning(TaskCountMax, DowningCount)
	}
}

//downingSaveDowned 整理保存已完成的
func downingSaveDowned(TaskCountMax int, DowningCount int) {
	DataDowning.Lock() //c5
	DataDowned.Lock()  //c5
	LEN := len(DataDowning.List)
	ErrorCount := 0
	for i := LEN - 1; i >= 0; i-- {
		if DataDowning.List[i].IsCompleted {
			//1.保存到已下载
			aerr := DownedAdd(DataDowning.List[i])
			if aerr == nil {
				//2.从下载中删除
				if i == LEN-1 {
					DataDowning.List = DataDowning.List[:LEN-1]
				} else {
					DataDowning.List = append(DataDowning.List[:i], DataDowning.List[i+1:]...)
				}
				LEN = len(DataDowning.List)
			}
		} else if DataDowning.List[i].IsFailed && !DataDowning.List[i].IsDowning {
			ErrorCount++
		}
	}
	AutoTime := time.Now().Unix()                      //秒
	if DowningCount < TaskCountMax && ErrorCount > 0 { //没有正在下载--说明全部下完了，剩下暂停的和失败的
		LEN = len(DataDowning.List)
		for i := LEN - 1; i >= 0; i-- {
			if DataDowning.List[i].IsFailed && DataDowning.List[i].AutoTry < AutoTime && !DataDowning.List[i].IsDowning { //对出错的自动重试5遍
				DataDowning.List[i].IsStop = false
				DataDowning.List[i].IsFailed = false
				DataDowning.List[i].FailedMessage = ""
				DataDowning.List[i].DownSpeedStr = ""
				DataDowning.List[i].AutoGID = 0
				DataDowning.List[i].AutoTry = time.Now().Add(24 * time.Hour).Unix() //开始重试，这里设置为超大值避免重复执行重试
			}
		}
	}
	DataDowned.Unlock()  //c5
	DataDowning.Unlock() //c5
}

//downingMakeDowning 执行需要下载的
func downingMakeDowning(TaskCountMax int, DowningCount int) {
	if DowningCount < TaskCountMax { //3任务并发
		DataDowningList := DataDowningReadCopy()
		LEN := len(DataDowningList)
		for i := LEN - 1; i >= 0; i-- { //倒序
			item := DataDowningList[i]
			if item.IsStop == false && item.IsDowning == false && item.IsFailed == false && item.IsCompleted == false { //没下载没出错没暂停
				//fmt.Println("StartDowning", "down", item.DownID, item)
				DowningCount++
				UpdateStateDowning(item)

				MakeDownloadAria(item)

				if DowningCount >= TaskCountMax {
					break
				}
			}
		}
	}
}

//downingUpdateProgress 更新下载速度(只有aria引擎需要执行)
func downingUpdateProgress() {

	//1. 读取tellActive获得list
	infos, _ := Aria2Rpc.TellActive("gid", "status", "totalLength", "completedLength", "downloadSpeed", "errorCode", "errorMessage")
	infos2, _ := Aria2Rpc.TellStopped(0, 100, "gid", "status", "totalLength", "completedLength", "downloadSpeed", "errorCode", "errorMessage")
	infos = append(infos, infos2...)
	//2. 遍历队列，对downing的item，匹配list更新下载速度，不存在就tellStatus(失败、已完成)
	DataDowningList := DataDowningReadCopy()
	LEN := len(DataDowningList)
	for i := LEN - 1; i >= 0; i-- {
		item := DataDowningList[i]
		if item.IsDowning && item.AutoGID != -1 { //下载中的任务
			//fmt.Println("StartDowning", "down", item.DownID, item)
			isFind := false
			for j := 0; j < len(infos); j++ {
				if infos[j].Gid == item.GID {
					isFind = true
					UpdateStateTell(item, infos[j])
					break
				}
			}

			if !isFind { //找不到匹配，可能是已停止（出错、失败、完成）
				info, err2 := Aria2Rpc.TellStatus(item.GID, "gid", "status", "totalLength", "completedLength", "downloadSpeed", "errorCode", "errorMessage")
				if err2 == nil && info.Gid == item.GID {
					isFind = true
					UpdateStateTell(item, info)
				}
			}

			if !isFind { //最后找不到信息，说明丢失了，比如aria崩溃重启
				item.AutoGID++
				item.DownSpeed = 0
				item.DownSpeedStr = ""
				item.FailedMessage = "connecting"
				if item.AutoGID > 10 {
					//尝试下载10次还失败的,更新错误信息，停止下载，会在所有任务都下载完以后，自动重置错误状态的任务重新尝试下载
					item.AutoGID = 0
					UpdateStateError(item, "下载失败，稍后自动重试")
				}
			}
		}
	}
}

//UpdateStateTellStatus UpdateStateTellStatus
func UpdateStateTellStatus(GID string, Status string) {
	info := rpc.StatusInfo{}
	info.Gid = GID
	info.Status = Status
	info.DownloadSpeed = "0"
	info.CompletedLength = "0"

	if Status == "error" {
		info2, err2 := Aria2Rpc.TellStatus(GID, "gid", "status", "totalLength", "completedLength", "downloadSpeed", "errorCode", "errorMessage")
		fmt.Println("error", info2)
		if err2 == nil {
			info.ErrorCode = info2.ErrorCode
			info.ErrorMessage = info2.ErrorMessage
		} else {
			info.ErrorCode = "-1"
			info.ErrorMessage = "下载失败，稍后自动重试"
		}
	}

	DataDowningList := DataDowningReadCopy()
	LEN := len(DataDowningList)
	for i := LEN - 1; i >= 0; i-- {
		item := DataDowningList[i]
		if item.GID == GID { //下载中的任务
			info.TotalLength = strconv.FormatInt(item.Size, 10)
			UpdateStateTell(item, info)
			break
		}
	}
}

//UpdateStateTell UpdateStateTell
func UpdateStateTell(item *DownFileModel, info rpc.StatusInfo) {
	//error complete removed waiting paused active
	if info.Status == "active" {
		UpdateStateDowning(item)
		if item.AutoGID > 0 {
			item.AutoGID = 0
		}
		if info.DownloadSpeed == "0" && info.CompletedLength == "0" {
			item.FailedMessage = "连接中..."
		}
		item.DownSpeed, _ = strconv.ParseInt(info.DownloadSpeed, 10, 64)
		item.DownSpeedStr = utils.FormateSizeString(item.DownSpeed) + "/s"
	} else {
		item.DownSpeed = 0
		item.DownSpeedStr = ""
	}
	if info.TotalLength != "0" && info.CompletedLength != "0" {
		item.DownSize, _ = strconv.ParseInt(info.CompletedLength, 10, 64)
		TotalLength, _ := strconv.ParseInt(info.TotalLength, 10, 64)
		item.DownProcess = item.DownSize * 100 / (TotalLength + 1)
		if item.DownProcess > 99 {
			item.DownProcess = 99
		}
	}

	if info.Status == "complete" {
		item.DownProcess = 100
		Aria2Rpc.RemoveDownloadResult(item.GID) //删除下载任务
		go oncomplete(item)
	} else if info.Status == "removed" {
		item.AutoGID = 0
		UpdateStateStop(item)
		Aria2Rpc.RemoveDownloadResult(item.GID) //删除下载任务
	} else if info.Status == "paused" {
		item.AutoGID = 0
		UpdateStateStop(item)
		Aria2Rpc.RemoveDownloadResult(item.GID) //删除下载任务
	} else if info.Status == "waiting" || info.Status == "active" {
		//什么也不做
	} else if info.Status == "error" {
		if info.ErrorMessage == "" {
			info.ErrorMessage = FormateAriaError(info.ErrorCode)
		}
		log.Println("Aria2DownError", item.DownID, item.Name, info.ErrorMessage)
		item.AutoGID = 0
		Aria2Rpc.RemoveDownloadResult(item.GID) //删除下载任务
		if strings.Index(info.ErrorMessage, "=503") > 0 {
			item.FailedCode = 503
			UpdateStateError(item, "503下载失败，稍后自动重试")
		} else if strings.Index(info.ErrorMessage, "=403") > 0 {
			item.FailedCode = 403
			UpdateStateError(item, "403下载失败，稍后自动重试")
		} else {
			UpdateStateError(item, info.ErrorCode+":"+info.ErrorMessage)
		}
	}
}

func FormateAriaError(code string) string {

	switch code {
	case "1":
		return "aria2c未知错误"
	case "2":
		return "aria2c网络超时"
	case "3":
		return "aria2c网络文件404"
	case "4":
		return "aria2c网络文件404"
	case "5":
		return "aria2c下载缓慢自动退出"
	case "6":
		return "aria2c发生网络中断"
	case "7":
		return "aria2c被强制退出错误"
	case "8":
		return "aria2c服务器不支持断点续传"
	case "9":
		return "aria2c本地硬盘空间不足"
	case "10":
		return "aria2c分片大小更改"
	case "11":
		return "aria2c重复任务"
	case "12":
		return "aria2c重复BT任务"
	case "13":
		return "aria2c文件已存在且不能覆盖"
	case "14":
		return "aria2c文件重命名失败"
	case "15":
		return "aria2c打开文件失败"
	case "16":
		return "aria2c创建文件大小时失败"
	case "17":
		return "aria2c文件写入失败"
	case "18":
		return "aria2c创建文件夹失败"
	case "19":
		return "aria2cDNS解析失败"
	case "20":
		return "aria2c解析磁力失败"
	case "21":
		return "aria2cFTP不支持的命令"
	case "22":
		return "aria2cHTTP响应头错误"
	case "23":
		return "aria2cHTTP重定向失败"
	case "24":
		return "aria2cHTTP认证失败"
	case "25":
		return "aria2c格式化种子失败"
	case "26":
		return "aria2c读取种子信息失败"
	case "27":
		return "aria2c磁力链接错误"
	case "28":
		return "aria2c提供了错误的参数"
	case "29":
		return "aria2c服务器超载暂时无法处理请求"
	case "30":
		return "aria2cRPC传输参数错误"
	case "31":
		return "aria2c多余的响应数据"
	case "32":
		return "aria2c文件sha1校验失败"
	default:
		return "aria2c未知错误"
	}
}

func oncomplete(item *DownFileModel) {
	item.AutoGID = -1 //标识，不需要刷新进度
	fileSaveTD := filepath.Join(item.DownSavePath, item.Name+".td")
	fileSaveAria := fileSaveTD + ".aria2"
	fileSave := filepath.Join(item.DownSavePath, item.Name)
	if !utils.PathExists(fileSave) {
		err := os.Rename(fileSaveTD, fileSave)
		if err != nil { //移动文件时出错
			UpdateStateError(item, "移动文件失败")
		}
	} else if utils.PathExists(fileSaveTD) {
		os.Remove(fileSaveTD)
	}

	if utils.PathExists(fileSaveAria) {
		os.Remove(fileSaveAria)
	}

	UpdateStateDowned(item)

}

//StopDowning 停止下载主线程
func StopDowning() {
	tDown = false
}
