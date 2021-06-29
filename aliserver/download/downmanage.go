package download

import (
	"aliserver/aliyun"
	"aliserver/data"
	"aliserver/utils"
	"encoding/json"
	"log"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"
)

//DowningList 下载中文件列表(显示小->大)
func DowningList() string {
	var b strings.Builder

	DataDowningList := DataDowningReadCopy()
	needAppend := false
	LEN := len(DataDowningList) - 1
	b.Grow(350 * (LEN + 2))
	b.WriteString(`{"code":0,"message":"success","key":"downing","filecount":` + strconv.Itoa(len(DataDowning.List)) + `,"filelist":[ `)
	for i := LEN; i >= 0; i-- { //倒序 小->大
		if needAppend {
			b.WriteString(",")
		}
		//--------------------------
		item := DataDowningList[i]
		b.WriteString(`{"id":"`)
		b.WriteString(item.DownID)
		b.WriteString(`","name":"`)
		b.WriteString(utils.ToJSONString(item.Name))
		b.WriteString(`","sp":"`)
		b.WriteString(utils.ToJSONString(item.DownSavePath))
		b.WriteString(`","spd":"`)
		b.WriteString(item.DownSpeedStr)
		b.WriteString(`","fm":"`)
		b.WriteString(utils.ToJSONString(item.FailedMessage))
		b.WriteString(`","size":`)
		b.WriteString(strconv.FormatInt(item.Size, 10))
		b.WriteString(`,"dp":`)
		b.WriteString(strconv.FormatInt(item.DownProcess, 10))
		b.WriteString(`,"isd":`)
		b.WriteString(strconv.FormatBool(item.IsDowning))
		b.WriteString(`,"isf":`)
		b.WriteString(strconv.FormatBool(item.IsFailed))
		b.WriteString(`,"ds":`)
		b.WriteString(strconv.FormatInt(item.DownSize, 10))
		b.WriteString(`,"dpd":`)
		b.WriteString(strconv.FormatInt(item.DownSpeed, 10))
		b.WriteString(`}`)
		//--------------------------
		needAppend = true
		if (LEN - i) >= 298 {
			break
		}
	}
	b.WriteString("]}")
	jsonstr := b.String()
	b.Reset()
	return jsonstr
}

//DownedList 下载中文件列表(显示大->小)
func DownedList() string {
	var b strings.Builder
	DataDownedList := DataDownedReadCopy()
	needAppend := false
	LEN := len(DataDownedList)
	b.Grow(350 * (LEN + 2))
	b.WriteString(`{"code":0,"message":"success","key":"downed","filecount":` + strconv.Itoa(LEN) + `,"filelist":[ `)
	for i := 0; i < LEN; i++ { //正序，大->小
		if needAppend {
			b.WriteString(",")
		}
		//--------------------------
		item := DataDownedList[i]
		b.WriteString(`{"id":"`)
		b.WriteString(item.DownID)
		b.WriteString(`","name":"`)
		b.WriteString(utils.ToJSONString(item.Name))
		b.WriteString(`","sp":"`)
		b.WriteString(utils.ToJSONString(item.DownSavePath))
		b.WriteString(`","spd":"`)
		b.WriteString(item.DownSpeedStr)
		b.WriteString(`","fm":"`)
		b.WriteString(utils.ToJSONString(item.FailedMessage))
		b.WriteString(`","size":`)
		b.WriteString(strconv.FormatInt(item.Size, 10))
		b.WriteString(`,"dp":`)
		b.WriteString(strconv.FormatInt(item.DownProcess, 10))
		b.WriteString(`,"isd":`)
		b.WriteString(strconv.FormatBool(item.IsDowning))
		b.WriteString(`,"isf":`)
		b.WriteString(strconv.FormatBool(item.IsFailed))
		b.WriteString(`,"ds":`)
		b.WriteString(strconv.FormatInt(item.Size, 10))
		b.WriteString(`,"dpd":0`)
		b.WriteString(`}`)
		//--------------------------
		needAppend = true
	}
	b.WriteString("]}")
	jsonstr := b.String()
	b.Reset()
	return jsonstr
}

//DownFileMutil 下载一堆文件
//SavePath= DownSavePath+RootPath 下载保存位置 + 该文件相对root的路径 + filelist里每个文件名
//RealPath= D:\Down\    +新建文件夹\002\    + filelist[name]
func DownFileMutil(boxid string, ParentID string, SavePath string, keylist []string) string {
	if SavePath == "" {
		return utils.ToErrorMessageJSON("没有提供下载保存位置")
	}
	errmk := os.MkdirAll(SavePath, 0777)
	if errmk != nil {
		return utils.ToErrorMessageJSON("下载保存文件夹创建失败")
	}

	UserID := aliyun.GetUserID()
	if UserID == "" {
		return utils.ToErrorMessageJSON("还没有登录阿里云盘账号")
	}
	var wg sync.WaitGroup
	var lock sync.Mutex
	errnum := 0
	var list []*aliyun.FileUrlModel
	if len(keylist) <= 5 {
		//文件数量5个，单文件读取信息
		for k := 0; k < len(keylist); k++ {
			fileid := keylist[k]
			if fileid != "" {
				wg.Add(1)
				go func(fileid string) {
					finfo, ferr := aliyun.ApiFileGetUrl(boxid, fileid, "")
					if ferr != nil {
						errnum++
					} else {
						lock.Lock()
						list = append(list, &finfo)
						lock.Unlock()
					}
					defer wg.Done()
				}(fileid)
			}
		}
		wg.Wait()
		if errnum > 0 {
			return utils.ToErrorMessageJSON("列出文件信息时出错")
		}
	} else {
		//文件数量较多，批量读取文件信息
		flist, ferr := aliyun.ApiFileListAllForDown(boxid, ParentID, "", false)
		if ferr != nil {
			return utils.ToErrorMessageJSON("列出文件信息时出错")
		}
		for k := 0; k < len(keylist); k++ {
			fileid := keylist[k]
			if fileid != "" {
				for j := 0; j < len(flist); j++ {
					if flist[j].P_file_id == fileid { //找到了
						list = append(list, flist[j])
						break
					}
				}
			}
		}
	}

	LEN := len(list)
	if LEN == 0 {
		return utils.ToSuccessJSON("filecount", 0)
	}
	//下载文件
	filecount := _DownFileAddList(UserID, SavePath, list)
	return utils.ToSuccessJSON("filecount", filecount)
}

func _DownFileAddList(UserID string, SavePath string, list []*aliyun.FileUrlModel) (filecount int) {
	LEN := len(list)
	filecount = 0
	dtime := time.Now().UnixNano()
	downinglist := make([]*DownFileModel, 0, LEN)
	for i := 0; i < LEN; i++ {
		info := list[i]
		path := utils.ClearFileName(info.P_file_path, false)
		name := utils.ClearFileName(info.P_file_name, true)
		hash := info.P_sha1
		size := info.P_size
		if info.IsDir {
			hash = "dir"
			size = 0
		}
		downing, err := DowningAdd(UserID, SavePath, info.P_drive_id, info.P_file_id, name, path, hash, size, dtime)
		if err == nil {
			downinglist = append(downinglist, downing)
			filecount++
		}
		dtime++
	}

	DataDowning.Lock() //c8
	for n := 0; n < len(downinglist); n++ {
		isSame := false
		LEN := len(DataDowning.List)
		DownID := downinglist[n].DownID
		for x := 0; x < LEN; x++ {
			if DataDowning.List[x].DownID == DownID {
				isSame = true
				break
			}
		}
		if !isSame {
			//DataDowning.List是从大到小，add的dtime肯定是最大的，所以插入在最前面
			DataDowning.List = append([]*DownFileModel{downinglist[n]}, DataDowning.List...)
			b, _ := json.Marshal(downinglist[n])
			data.SetDown(DownID, string(b))
		}
	}
	DataDowning.Unlock() //c8
	return filecount
}

//DowningStartAll 开始全部
func DowningStartAll() string {
	DataDowningList := DataDowningReadCopy()
	LEN := len(DataDowningList)
	for i := 0; i < LEN; i++ {
		if DataDowningList[i].IsStop {
			UpdateStateInit(DataDowningList[i])
		}
	}
	return utils.ToSuccessJSON("", nil)
}

//DowningStopAll 停止全部
func DowningStopAll() string {

	if Aria2Rpc != nil {
		Aria2Rpc.ForcePauseAll()
	}

	list := []string{}
	DataDowningList := DataDowningReadCopy()
	LEN := len(DataDowningList)
	for i := 0; i < LEN; i++ {
		if DataDowningList[i].IsDowning {
			list = append(list, DataDowningList[i].DownID)
		}
		UpdateStateStop(DataDowningList[i])
	}

	for j := 0; j < len(list); j++ {
		cli, ok := mDown.Load(list[j])
		if ok && cli != nil {
			//cli.(*downloader.BigDownWorker).StopDownSync()
			mDown.Delete(list[j])
		}
	}

	return utils.ToSuccessJSON("", nil)
}

//DownedDeleteAll 删除全部
func DownedDeleteAll() string {

	rlist := DataDownedReadCopy()
	DataDowned.Lock()                                //c6
	DataDowned.List = make([]*DownFileModel, 0, 100) //空的
	DataDowned.Unlock()                              //c6
	LEN := len(rlist)
	for i := 0; i < LEN; i++ {
		data.DeleteDown(rlist[i].DownID)
	}
	return utils.ToSuccessJSON("", nil)
}

//DowningDeleteAll 删除全部
func DowningDeleteAll() string {

	//把所有已经暂停的提取出来
	DataDowning.Lock() //c7
	LEN := len(DataDowning.List)
	List := make([]*DownFileModel, 0, LEN)
	ListDel := make([]*DownFileModel, 0, LEN)
	for i := 0; i < LEN; i++ {
		if DataDowning.List[i].IsStop {
			ListDel = append(ListDel, DataDowning.List[i])
		} else {
			List = append(List, DataDowning.List[i])
		}
	}
	DataDowning.List = List
	DataDowning.Unlock() //c7
	//删除、清理已暂停的
	for j := 0; j < len(ListDel); j++ {
		//清理临时文件
		fileSaveTD := filepath.Join(ListDel[j].DownSavePath, ListDel[j].Name+".td")
		fileSaveAria := fileSaveTD + ".aria2"
		e1 := os.Remove(fileSaveTD)
		if e1 != nil {
			log.Println("delall td file ", "error=", e1)
		}
		e2 := os.Remove(fileSaveAria)
		if e2 != nil {
			log.Println("delall td.aria2 file ", "error=", e2)
		}
		data.DeleteDown(ListDel[j].DownID)
	}
	return utils.ToSuccessJSON("", nil)
}

//DowningStart 开始一个
func DowningStart(DownID string) string {
	isfind := false
	DataDowningList := DataDowningReadCopy()
	LEN := len(DataDowningList)
	for i := 0; i < LEN; i++ {
		if DataDowningList[i].DownID == DownID {
			isfind = true
			if DataDowningList[i].IsDowning || DataDowningList[i].IsCompleted {
				//正在下载或已完成 跳过
			} else {
				UpdateStateInit(DataDowningList[i])
			}
			break
		}
	}
	if isfind {
		return utils.ToSuccessJSON("DownID", DownID)
		//return `{"message":"success","code":0,"DownID":"` + DownID + `"}`
	}
	return utils.ToErrorMessageJSON("找不到下载中记录")
}

//DowningStop 暂停一个
func DowningStop(DownID string) string {
	isfind := false
	DataDowningList := DataDowningReadCopy()
	LEN := len(DataDowningList)
	for i := 0; i < LEN; i++ {
		item := DataDowningList[i]
		if item.DownID == DownID {
			isfind = true
			if item.IsDowning {
				//正在下载
				Aria2Rpc.Pause(item.GID)
				time.Sleep(time.Duration(50) * time.Millisecond)
			}
			UpdateStateStop(item)
			break
		}
	}
	if isfind {
		return utils.ToSuccessJSON("DownID", DownID)
		//return `{"message":"success","code":0,"DownID":"` + DownID + `"}`
	}
	return utils.ToErrorMessageJSON("找不到下载中文件")
}

//DowningDelete 删除一个
func DowningDelete(DownID string) string {

	DowningStop(DownID)
	isfind := false
	fileSaveTD := ""
	DataDowning.Lock() //c9
	LEN := len(DataDowning.List)
	for i := 0; i < LEN; i++ {
		if DataDowning.List[i].DownID == DownID {
			isfind = true
			if DataDowning.List[i].IsStop {
				//清理临时文件
				fileSaveTD = filepath.Join(DataDowning.List[i].DownSavePath, DataDowning.List[i].Name+".td")
				if i == LEN-1 {
					DataDowning.List = DataDowning.List[:LEN-1]
				} else {
					DataDowning.List = append(DataDowning.List[:i], DataDowning.List[i+1:]...)
				}
			}
			break
		}
	}
	DataDowning.Unlock() //c9
	if isfind {
		fileSaveAria := fileSaveTD + ".aria2"
		e1 := os.Remove(fileSaveTD)
		if e1 != nil {
			log.Println("del td file ", "error=", e1)
		}
		e2 := os.Remove(fileSaveAria)
		if e2 != nil {
			log.Println("del td.aria2 file ", "error=", e2)
		}
		data.DeleteDown(DownID)
		return utils.ToSuccessJSON("DownID", DownID)
		//return `{"message":"success","code":0,"DownID":"` + DownID + `"}`
	}
	return utils.ToErrorMessageJSON("找不到下载中记录")
}

//DownedDelete 删除一个
func DownedDelete(DownID string) string {
	isfind := false
	DataDowned.Lock() //c10
	LEN := len(DataDowned.List)
	for i := 0; i < LEN; i++ {
		if DataDowned.List[i].DownID == DownID {
			isfind = true
			if i == LEN-1 {
				DataDowned.List = DataDowned.List[:LEN-1]
			} else {
				DataDowned.List = append(DataDowned.List[:i], DataDowned.List[i+1:]...)
			}
			break
		}
	}
	DataDowned.Unlock() //c10
	if isfind {
		data.DeleteDown(DownID)
		return utils.ToSuccessJSON("DownID", DownID)
	}
	return utils.ToErrorMessageJSON("找不到已下载记录")
}

//DowningForder 打开保存文件夹
func DowningForder(DownID string) string {
	isfind := false
	DataDowningList := DataDowningReadCopy()
	LEN := len(DataDowningList)
	for i := 0; i < LEN; i++ {
		if DataDowningList[i].DownID == DownID {
			isfind = true
			utils.OpenForder(DataDowningList[i].DownSavePath, DataDowningList[i].Name)
			break
		}
	}
	if isfind {
		return utils.ToSuccessJSON("DownID", DownID)
		//return `{"message":"success","code":0,"DownID":"` + DownID + `"}`
	}
	return utils.ToErrorMessageJSON("找不到下载中记录")
}

//DownedForder 打开保存文件夹
func DownedForder(DownID string) string {
	isfind := false
	DataDownedList := DataDownedReadCopy()
	LEN := len(DataDownedList)
	for i := 0; i < LEN; i++ {
		if DataDownedList[i].DownID == DownID {
			isfind = true
			utils.OpenForder(DataDownedList[i].DownSavePath, DataDownedList[i].Name)
			break
		}
	}
	if isfind {
		return utils.ToSuccessJSON("DownID", DownID)
		//return `{"message":"success","code":0,"DownID":"` + DownID + `"}`
	}
	return utils.ToErrorMessageJSON("找不到下载中记录")
}
