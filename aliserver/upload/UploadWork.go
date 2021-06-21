package upload

import (
	"aliserver/aliyun"
	"aliserver/data"
	"aliserver/utils"
	"encoding/json"
	"errors"
	"log"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
)

//DataUpload 全局的 已下载队列
var DataUpload = struct {
	sync.RWMutex
	List []*UploadFileModel
}{List: make([]*UploadFileModel, 0, 100)}

//DataUploading 全局的 下载中队列
var DataUploading = struct {
	sync.RWMutex
	List []*UploadFileModel
}{List: make([]*UploadFileModel, 0, 100)}

//DataUploadingReadCopy 确保加解锁安全
func DataUploadingReadCopy() []*UploadFileModel {
	DataUploading.RLock() //c1
	LEN := len(DataUploading.List)
	rlist := make([]*UploadFileModel, LEN)
	for i := 0; i < LEN; i++ {
		rlist[i] = DataUploading.List[i]
	}
	DataUploading.RUnlock() //c1
	return rlist
}

//DataUploadReadCopy 确保加解锁安全
func DataUploadReadCopy() []*UploadFileModel {
	DataUpload.RLock() //c2
	LEN := len(DataUpload.List)
	rlist := make([]*UploadFileModel, LEN)
	for i := 0; i < LEN; i++ {
		rlist[i] = DataUpload.List[i]
	}
	DataUpload.RUnlock() //c2
	return rlist
}

//LoadUploadList 加载列表(downtime大->小)
func LoadUploadList() {
	isget, list := data.GetUploadAll()
	if isget == false || len(list) == 0 {
		return
	}
	WeekAgo := time.Now().Add(-10 * 24 * time.Hour).UnixNano()
	List := make([]*UploadFileModel, 0, 100)
	for UploadID := range list {
		Item := &UploadFileModel{}
		err := json.Unmarshal([]byte(list[UploadID]), &Item)
		if err == nil {
			if Item.DownTime < WeekAgo { //10天前的记录删除掉
				data.DeleteUpload(UploadID)
			} else {
				UpdateStateUpload(Item)
				List = append(List, Item)
			}
		}
	}
	sort.Sort(UploadFileOrder(List))
	DataUpload.Lock() //c3
	DataUpload.List = List
	DataUpload.Unlock() //c3
}

//LoadUploadingList 加载列表(downtime大->小)
func LoadUploadingList() {
	isget, list := data.GetUploadingAll()
	if isget == false || len(list) == 0 {
		return
	}
	List := make([]*UploadFileModel, 0, 100)
	for UploadID := range list {
		Item := &UploadFileModel{}
		err := json.Unmarshal([]byte(list[UploadID]), &Item)
		if err == nil {
			Item.FailedCode = 0
			UpdateStateStop(Item) //初始化列表时，全部停止上传
			List = append(List, Item)
		}
	}
	sort.Sort(UploadFileOrder(List))
	DataUploading.Lock() //c4
	DataUploading.List = List
	DataUploading.Unlock() //c4
}

//UploadAdd 保存已上传
func UploadAdd(Item *UploadFileModel) error {
	timenow := time.Now().UnixNano()
	UploadingID := Item.UploadID
	UploadID := strings.Replace(Item.UploadID, "Uploading:", "Upload:", -1) + ":" + strconv.FormatInt(timenow, 10)
	Item.UploadID = UploadID
	Item.DownTime = timenow
	//DataUpload.List是从大到小，add的dtime肯定是最大的，所以插入在最前面
	DataUpload.List = append([]*UploadFileModel{Item}, DataUpload.List...)

	b, _ := json.Marshal(Item)
	data.SetUpload(UploadID, string(b)) //保存Upload
	data.DeleteUpload(UploadingID)      //删除Uploading
	return nil
}

//UploadingAdd 创建一个上传任务
func UploadingAdd(UserID, localpath, uptoname, boxid string, ParentID string, size int64, isdir bool, dtime int64) (upload *UploadFileModel, err error) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("UploadingAddError ", " error=", errr)
			err = errors.New("error")
		}
	}()
	var identity = utils.ToMd5(ParentID + "/" + localpath)
	if strings.HasPrefix(localpath, "miaochuan|") {
		identity = utils.ToMd5(ParentID + "/" + localpath + "/" + uptoname)
	}
	var UploadID = "Down:Uploading:" + UserID + ":" + identity

	var m = &UploadFileModel{
		UploadID: UploadID,
		UserID:   UserID,

		Name:      uptoname,
		Size:      size,
		LocalPath: localpath,
		IsDir:     isdir,
		ParentID:  ParentID,
		BoxID:     boxid,

		DownTime:      dtime, // time.Now().UnixNano()
		DownSpeedStr:  "",
		DownProcess:   0,
		IsStop:        false,
		IsDowning:     false,
		IsCompleted:   false,
		IsFailed:      false,
		FailedMessage: "",
		AutoTry:       0,
		FailedCode:    0,
	}
	return m, nil
}

var tUpload bool = false

//当前上传中任务
var mUpload sync.Map

func StartUploading() {
	tUpload = true
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("StartUploadingError ", " error=", errr)
		}
	}()

	for tUpload {
		time.Sleep(time.Duration(1) * time.Second)
		_StartUploading()
	}
}

//StartUploading 上传的主线程，轮训Uploading列表启动上传
func _StartUploading() {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("_StartUploadingError ", " error=", errr)
		}
	}()

	TaskCountMax, terr := strconv.Atoi(data.Setting.DownMax)
	if terr != nil {
		TaskCountMax = 1
	}
	rlist := DataUploadingReadCopy()
	LEN := len(rlist)
	UploadingCount := 0
	for i := LEN - 1; i >= 0; i-- {
		if rlist[i].IsDowning {
			UploadingCount++
		}
	}
	downingSaveDowned(TaskCountMax, UploadingCount)
	downingMakeDowning(TaskCountMax, UploadingCount)
}

//downingSaveDowned 整理保存已完成的
func downingSaveDowned(TaskCountMax int, UploadingCount int) {
	DataUploading.Lock() //c5
	DataUpload.Lock()    //c5
	LEN := len(DataUploading.List)
	ErrorCount := 0
	for i := LEN - 1; i >= 0; i-- {
		if DataUploading.List[i].IsCompleted {
			//1.保存到已下载
			aerr := UploadAdd(DataUploading.List[i])
			if aerr == nil {
				//2.从下载中删除
				if i == LEN-1 {
					DataUploading.List = DataUploading.List[:LEN-1]
				} else {
					DataUploading.List = append(DataUploading.List[:i], DataUploading.List[i+1:]...)
				}
				LEN = len(DataUploading.List)
			}
		} else if DataUploading.List[i].IsFailed && !DataUploading.List[i].IsDowning {
			ErrorCount++
		}
	}
	AutoTime := time.Now().Unix()                        //秒
	if UploadingCount < TaskCountMax && ErrorCount > 0 { //没有正在下载--说明全部下完了，剩下暂停的和失败的
		LEN = len(DataUploading.List)
		for i := LEN - 1; i >= 0; i-- {
			if DataUploading.List[i].IsFailed && DataUploading.List[i].AutoTry < AutoTime && !DataUploading.List[i].IsDowning { //对出错的自动重试5遍
				DataUploading.List[i].IsStop = false
				DataUploading.List[i].IsFailed = false
				DataUploading.List[i].FailedMessage = ""
				DataUploading.List[i].DownSpeedStr = ""
				DataUploading.List[i].AutoTry = time.Now().Add(24 * time.Hour).Unix() //开始重试，这里设置为超大值避免重复执行重试
			}
		}
	}
	DataUpload.Unlock()    //c5
	DataUploading.Unlock() //c5
}

//downingMakeDowning 执行需要下载的
func downingMakeDowning(TaskCountMax int, UploadingCount int) {
	if UploadingCount < TaskCountMax { //3任务并发
		DataUploadingList := DataUploadingReadCopy()
		LEN := len(DataUploadingList)
		for i := LEN - 1; i >= 0; i-- { //倒序
			item := DataUploadingList[i]
			if item.IsStop == false && item.IsDowning == false && item.IsFailed == false && item.IsCompleted == false { //没下载没出错没暂停
				//fmt.Println("StartDowning", "down", item.DownID, item)
				UploadingCount++
				UpdateStateUploading(item)

				MakeUpload(item)

				if UploadingCount >= TaskCountMax {
					break
				}
			}
		}
	}
}

func MakeUpload(item *UploadFileModel) {
	threadcount := int(1) //阿里云盘必须按顺序，同一个文件的全部分片一个一个的按顺序上传，不能并发
	if item.BoxID == "" {
		item.BoxID = aliyun.GetUserBoxID() //修正旧版本升级
	}
	if item.Uploader == nil {
		info, err := NewBigUploadInfoAutoBlock(item.BoxID, item.ParentID, item.LocalPath, item.Name, item.Size, item.IsDir, 1024*1024*10, threadcount)
		if err != nil {
			b, _ := json.Marshal(*item)
			log.Println("上传启动失败", string(b)) //不可能出现
			log.Println(err)
			UpdateStateError(item, "上传启动失败"+err.Error())
			return
		}
		item.Uploader = info
	}
	OnUpdate := func(worker *BigUploadWorker) {
		item.DownProcess = worker.UploadProcess
		item.DownSize = worker.UploadSize
		item.DownSpeed = worker.UploadSpeed
		item.DownSpeedStr = worker.UploadSpeedStr
	}
	OnCompleted := func(worker *BigUploadWorker) {
		item.DownProcess = 100
		UpdateStateUpload(item)
		mUpload.Delete(item.UploadID) //删除下载任务
	}
	OnFailed := func(worker *BigUploadWorker) {
		if worker.IsUploading == false || worker.UploadInfo.FileFullPath == "miaochuan" {
			UpdateStateStop(item) //主动停止，或者是秒传任务都强制停止
			item.FailedMessage = worker.FailedMessage
		} else {
			UpdateStateError(item, worker.FailedMessage) //出错稍后重试
		}
		mUpload.Delete(item.UploadID)
	}
	cli := NewBigUploadWorker(item.Uploader, OnUpdate, OnCompleted, OnFailed)
	mUpload.Store(item.UploadID, cli)
	cli.StartUploadAsync()
}

//StopUploading 停止上传主线程
func StopUploading() {
	tUpload = false
}
