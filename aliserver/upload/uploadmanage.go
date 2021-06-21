package upload

import (
	"aliserver/aliyun"
	"aliserver/data"
	"aliserver/utils"
	"encoding/json"
	"io/ioutil"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

//UploadSelectModel UploadSelectModel
type UploadSelectModel struct {
	//FileInfo
	Size     int64  `json:"size"`
	Path     string `json:"path"`
	Name     string `json:"name"`
	IsDir    bool   `json:"IsDir"`
	ParentID string `json:"ParentID"`
	BoxID    string `json:"BoxID"`
}

//UploadingList 上传中文件列表(显示小->大)
func UploadingList() string {
	var b strings.Builder
	DataUploadingList := DataUploadingReadCopy()
	needAppend := false
	LEN := len(DataUploadingList) - 1
	b.WriteString(`{"code":0,"message":"success","key":"uploading","filecount":` + strconv.Itoa(len(DataUploading.List)) + `,"filelist":[ `)
	for i := LEN; i >= 0; i-- { //倒序 小->大
		if needAppend {
			b.WriteString(",")
		}
		//--------------------------
		item := DataUploadingList[i]
		b.WriteString(`{"id":"`)
		b.WriteString(item.UploadID)
		b.WriteString(`","name":"`)
		b.WriteString(utils.ToJSONString(item.Name))
		b.WriteString(`","sp":"`)
		if strings.HasPrefix(item.LocalPath, "miaochuan|") {
			b.WriteString("秒传")
		} else {
			b.WriteString(utils.ToJSONString(item.LocalPath))
		}
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

//UploadList 已上传文件列表(显示大->小)
func UploadList() string {
	var b strings.Builder
	DataUploadList := DataUploadReadCopy()
	needAppend := false
	LEN := len(DataUploadList)
	b.WriteString(`{"code":0,"message":"success","key":"upload","filecount":` + strconv.Itoa(len(DataUpload.List)) + `,"filelist":[ `)
	for i := 0; i < LEN; i++ { //正序，大->小
		if needAppend {
			b.WriteString(",")
		}
		//--------------------------
		item := DataUploadList[i]
		b.WriteString(`{"id":"`)
		b.WriteString(item.UploadID)
		b.WriteString(`","name":"`)
		b.WriteString(utils.ToJSONString(item.Name))
		b.WriteString(`","sp":"`)
		if strings.HasPrefix(item.LocalPath, "miaochuan|") {
			b.WriteString("秒传")
		} else {
			b.WriteString(utils.ToJSONString(item.LocalPath))
		}
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

//UploadFile 上传一堆文件(只有文件)
func UploadFile(boxid string, ParentID string, fileList []string) string {

	if ParentID == "" {
		ParentID = "root"
	}
	UserID := aliyun.GetUserID()
	if UserID == "" {
		return utils.ToErrorMessageJSON("还没有登录阿里云盘账号")
	}

	var SelectFileList = make([]*UploadSelectModel, 0, len(fileList))

	LEN := len(fileList)
	for m := 0; m < LEN; m++ {
		fi, err := os.Stat(fileList[m])
		if err == nil && fi != nil && fi.IsDir() == false {
			m := UploadSelectModel{
				Size:     fi.Size(),
				Path:     fileList[m],
				Name:     fi.Name(),
				ParentID: ParentID,
				BoxID:    boxid,
			}
			SelectFileList = append(SelectFileList, &m)
		}
	}
	return UploadSelectFile(UserID, ParentID, SelectFileList)
}

//UploadDir 上传一个文件夹（只有一个）
func UploadDir(boxid string, ParentID string, DirPath string) string {

	if ParentID == "" {
		ParentID = "root"
	}
	UserID := aliyun.GetUserID()
	if UserID == "" {
		return utils.ToErrorMessageJSON("还没有登录阿里云盘账号")
	}

	var SelectFileList = make([]*UploadSelectModel, 0, 100)
	fi, err := os.Stat(DirPath)
	if err == nil && fi != nil && fi.IsDir() == true {
		DirID, err3 := aliyun.UploadCreatForder(boxid, ParentID, fi.Name())
		if err3 != nil {
			return utils.ToErrorMessageJSON("网盘创建路径失败：" + fi.Name())
		}
		//遍历文件夹，获取文件树，并在网盘里创建对应的文件夹
		SelectFileList, err = GetFilesWithDir(boxid, DirID, DirPath)
		if err != nil {
			return utils.ToErrorMessageJSON(err.Error())
		}
	} else {
		return utils.ToErrorMessageJSON("无法访问路径：" + DirPath)
	}

	return UploadSelectFile(UserID, ParentID, SelectFileList)
}

func UploadFileAndDir(boxid string, ParentID string, fileList []string) string {

	if ParentID == "" {
		ParentID = "root"
	}
	UserID := aliyun.GetUserID()
	if UserID == "" {
		return utils.ToErrorMessageJSON("还没有登录阿里云盘账号")
	}

	var SelectFileList = make([]*UploadSelectModel, 0, 100)

	LEN := len(fileList)
	for m := 0; m < LEN; m++ {
		fi, err := os.Stat(fileList[m])
		if err == nil && fi != nil {
			if fi.IsDir() == false {
				m := UploadSelectModel{
					Size:     fi.Size(),
					Path:     fileList[m],
					Name:     fi.Name(),
					ParentID: ParentID,
					BoxID:    boxid,
				}
				SelectFileList = append(SelectFileList, &m)
			} else {
				DirID, err3 := aliyun.UploadCreatForder(boxid, ParentID, fi.Name())
				if err3 != nil {
					return utils.ToErrorMessageJSON("网盘创建路径失败：" + fi.Name())
				}
				//遍历文件夹，获取文件树，并在网盘里创建对应的文件夹
				clist, err := GetFilesWithDir(boxid, DirID, fileList[m])
				if err != nil {
					return utils.ToErrorMessageJSON(err.Error())
				}
				SelectFileList = append(SelectFileList, clist...)
			}
		}
	}

	return UploadSelectFile(UserID, ParentID, SelectFileList)
}

func UploadSelectFile(UserID string, ParentID string, SelectFileList []*UploadSelectModel) string {
	LEN := len(SelectFileList)
	if LEN == 0 {
		return utils.ToSuccessJSON("filecount", 0)
	}
	//上传文件
	filecount := 0
	dtime := time.Now().UnixNano()
	uploadinglist := make([]*UploadFileModel, 0, LEN)
	for i := 0; i < LEN; i++ {
		item := SelectFileList[i]
		uploading, err := UploadingAdd(UserID, item.Path, item.Name, item.BoxID, item.ParentID, item.Size, item.IsDir, dtime)
		if err == nil {
			uploadinglist = append(uploadinglist, uploading)
			filecount++
		}
		dtime++
	}

	DataUploading.Lock() //c8
	for n := 0; n < len(uploadinglist); n++ {
		isSame := false
		LEN := len(DataUploading.List)
		UploadID := uploadinglist[n].UploadID
		for x := 0; x < LEN; x++ {
			if DataUploading.List[x].UploadID == UploadID {
				isSame = true
				break
			}
		}
		if !isSame {
			//DataDowning.List是从大到小，add的dtime肯定是最大的，所以插入在最前面
			DataUploading.List = append([]*UploadFileModel{uploadinglist[n]}, DataUploading.List...)
			b, _ := json.Marshal(uploadinglist[n])
			data.SetUpload(UploadID, string(b))
		}
	}
	DataUploading.Unlock() //c8
	return utils.ToSuccessJSON("filecount", filecount)
}

// GetFilesWithDir 获取指定目录下的所有文件和目录
func GetFilesWithDir(boxid string, ParentID, DirPath string) (files []*UploadSelectModel, err error) {
	dir, err := ioutil.ReadDir(DirPath)
	if err != nil {
		return nil, err
	}

	files = make([]*UploadSelectModel, 0, len(dir))
	for _, fi := range dir {

		m := UploadSelectModel{
			Size:     fi.Size(),
			Path:     filepath.Join(DirPath, fi.Name()),
			Name:     fi.Name(),
			ParentID: ParentID,
			BoxID:    boxid,
		}
		if fi.IsDir() {
			m.IsDir = true
			m.Size = 0
		}
		files = append(files, &m)
	}
	return files, nil
}

//UploadingStartAll 开始全部
func UploadingStartAll() string {
	DataUploadingList := DataUploadingReadCopy()
	LEN := len(DataUploadingList)
	for i := 0; i < LEN; i++ {
		if DataUploadingList[i].IsStop {
			UpdateStateInit(DataUploadingList[i])
		}
	}
	return utils.ToSuccessJSON("", nil)
}

//UploadingStopAll 停止全部
func UploadingStopAll() string {
	list := []string{}
	DataUploadingList := DataUploadingReadCopy()
	LEN := len(DataUploadingList)
	for i := 0; i < LEN; i++ {
		if DataUploadingList[i].IsDowning {
			list = append(list, DataUploadingList[i].UploadID)
			//正在下载
			cli, ok := mUpload.Load(DataUploadingList[i].UploadID)
			if ok && cli != nil {
				cli.(*BigUploadWorker).StopUploadAsync()
				continue
			}
		}
		UpdateStateStop(DataUploadingList[i])
	}

	for j := 0; j < len(list); j++ {
		cli, ok := mUpload.Load(list[j])
		if ok && cli != nil {
			cli.(*BigUploadWorker).StopUploadSync() //等待上传停止
			mUpload.Delete(list[j])
		}
	}

	return utils.ToSuccessJSON("", nil)
}

//UploadDeleteAll 删除全部
func UploadDeleteAll() string {

	rlist := DataUploadReadCopy()
	DataUpload.Lock()                                  //c6
	DataUpload.List = make([]*UploadFileModel, 0, 100) //空的
	DataUpload.Unlock()                                //c6
	LEN := len(rlist)
	for i := 0; i < LEN; i++ {
		data.DeleteUpload(rlist[i].UploadID)
	}
	return utils.ToSuccessJSON("", nil)
}

//UploadingDeleteAll 删除全部
func UploadingDeleteAll() string {

	//把所有已经暂停的提取出来
	DataUploading.Lock() //c7
	LEN := len(DataUploading.List)
	List := make([]*UploadFileModel, 0, LEN)
	ListDel := make([]*UploadFileModel, 0, LEN)
	for i := 0; i < LEN; i++ {
		if DataUploading.List[i].IsStop {
			ListDel = append(ListDel, DataUploading.List[i])
		} else {
			List = append(List, DataUploading.List[i])
		}
	}
	DataUploading.List = List
	DataUploading.Unlock() //c7
	//删除、清理已暂停的
	for j := 0; j < len(ListDel); j++ {
		data.DeleteUpload(ListDel[j].UploadID)
	}
	return utils.ToSuccessJSON("", nil)
}

//UploadingStart 开始一个
func UploadingStart(UploadID string) string {
	isfind := false
	DataUploadingList := DataUploadingReadCopy()
	LEN := len(DataUploadingList)
	for i := 0; i < LEN; i++ {
		if DataUploadingList[i].UploadID == UploadID {
			isfind = true
			if DataUploadingList[i].IsDowning || DataUploadingList[i].IsCompleted {
				//正在上传或已完成 跳过
			} else {
				UpdateStateInit(DataUploadingList[i])
			}
			break
		}
	}
	if isfind {
		return utils.ToSuccessJSON("UploadID", UploadID)
	}
	return utils.ToErrorMessageJSON("找不到上传中记录")
}

//UploadingStop 暂停一个
func UploadingStop(UploadID string) string {
	isfind := false
	DataUploadingList := DataUploadingReadCopy()
	LEN := len(DataUploadingList)
	for i := 0; i < LEN; i++ {
		item := DataUploadingList[i]
		if item.UploadID == UploadID {
			isfind = true
			if item.IsDowning {
				//正在上传
				cli, ok := mUpload.Load(UploadID)
				if ok && cli != nil {
					cli.(*BigUploadWorker).StopUploadSync()
					mUpload.Delete(UploadID)
				}
			}
			UpdateStateStop(item)
			break
		}
	}
	if isfind {
		return utils.ToSuccessJSON("UploadID", UploadID)
	}
	return utils.ToErrorMessageJSON("找不到上传中记录")
}

//UploadingDelete 删除一个
func UploadingDelete(UploadID string) string {
	UploadingStop(UploadID)
	isfind := false
	DataUploading.Lock() //c9
	LEN := len(DataUploading.List)
	for i := 0; i < LEN; i++ {
		if DataUploading.List[i].UploadID == UploadID {
			isfind = true
			if DataUploading.List[i].IsStop {
				if i == LEN-1 {
					DataUploading.List = DataUploading.List[:LEN-1]
				} else {
					DataUploading.List = append(DataUploading.List[:i], DataUploading.List[i+1:]...)
				}
			}
			break
		}
	}
	DataUploading.Unlock() //c9
	if isfind {
		data.DeleteUpload(UploadID)
		return utils.ToSuccessJSON("UploadID", UploadID)
	}
	return utils.ToErrorMessageJSON("找不到上传中记录")
}

//UploadDelete 删除一个
func UploadDelete(UploadID string) string {
	isfind := false
	DataUpload.Lock() //c10
	LEN := len(DataUpload.List)
	for i := 0; i < LEN; i++ {
		if DataUpload.List[i].UploadID == UploadID {
			isfind = true
			if i == LEN-1 {
				DataUpload.List = DataUpload.List[:LEN-1]
			} else {
				DataUpload.List = append(DataUpload.List[:i], DataUpload.List[i+1:]...)
			}
			break
		}
	}
	DataUpload.Unlock() //c10
	if isfind {
		data.DeleteUpload(UploadID)
		return utils.ToSuccessJSON("UploadID", UploadID)
	}
	return utils.ToErrorMessageJSON("找不到已上传记录")
}

//UploadingForder 打开保存文件夹
func UploadingForder(UploadID string) string {
	isfind := false
	DataUploadingList := DataUploadingReadCopy()
	LEN := len(DataUploadingList)
	for i := 0; i < LEN; i++ {
		if DataUploadingList[i].UploadID == UploadID {
			isfind = true
			dir, name := filepath.Split(DataUploadingList[i].LocalPath)
			utils.OpenForder(dir, name)
			break
		}
	}
	if isfind {
		return utils.ToSuccessJSON("UploadID", UploadID)
	}
	return utils.ToErrorMessageJSON("找不到下载中记录")
}

//UploadForder 打开保存文件夹
func UploadForder(UploadID string) string {
	isfind := false
	DataUploadList := DataUploadReadCopy()
	LEN := len(DataUploadList)
	for i := 0; i < LEN; i++ {
		if DataUploadList[i].UploadID == UploadID {
			isfind = true
			dir, name := filepath.Split(DataUploadList[i].LocalPath)
			utils.OpenForder(dir, name)
			break
		}
	}
	if isfind {
		return utils.ToSuccessJSON("UploadID", UploadID)
	}
	return utils.ToErrorMessageJSON("找不到下载中记录")
}
