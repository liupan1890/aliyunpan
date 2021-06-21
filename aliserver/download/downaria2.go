package download

import (
	"aliserver/aliyun"
	"aliserver/data"
	"aliserver/utils"
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

//MakeDownloadAria MakeDownload
func MakeDownloadAria(item *DownFileModel) {

	ThreadCountMax := 4
	FileCountMax, terr := strconv.Atoi(data.Setting.DownMax)
	if terr == nil {
		if FileCountMax >= 4 {
			ThreadCountMax = 12
		}
		if FileCountMax >= 8 {
			ThreadCountMax = 16
		}
	}
	go StartDownAsync(item, ThreadCountMax)
}

func openSaveFile(item *DownFileModel) (isexist bool, issame bool, err error) {
	if utils.IsWindows() && item.Name == "." {
		return false, false, errors.New("windows不允许文件名.") //未下载，路径错误
	}
	FileSave := utils.JoinFilePath(item.DownSavePath, item.Name)
	if utils.IsDir(FileSave) {
		return false, false, errors.New("SaveFile cannot be dir") //未下载，路径错误
	}

	isexist, issame, err = utils.CheckFileAndLen(FileSave, item.Size)
	if err != nil {
		return isexist, false, err //未下载，未知错误，可能是权限错误
	} else if issame {
		return true, true, nil //已下载，直接退出
	} else if isexist {
		//不允许自动重命名
		return true, false, errors.New("重名文件已存在") //未下载，重名冲突
	} else {
		//文件不存在,开始创建文件
		dir := item.DownSavePath
		//先创建所有文件夹
		errmk := os.MkdirAll(dir, 0777)
		if errmk != nil {
			return false, false, errmk //未下载，创建文件夹失败
		}
		if item.Size <= 0 {
			filePtr, erropen := os.OpenFile(FileSave, os.O_WRONLY|os.O_CREATE, 0666) //打开现有或重新创建
			if erropen != nil {
				return false, false, erropen //未下载，打开文件失败
			}
			filePtr.Close()
			return true, true, nil //已下载，直接退出
		}
		return false, false, nil //未下载，打开文件成功
	}
}

//StartDownAsync StartDownAsync
func StartDownAsync(item *DownFileModel, threadcount int) {
	item.AutoGID = -1 //标识，不需要刷新进度,在下面Aria2Rpc.AddURI成功后UpdateStateDowning时会置0
	if item.BoxID == "" {
		item.BoxID = aliyun.GetUserBoxID() //修正旧版本升级
	}

	//处理文件夹
	if item.Hash == "dir" {
		SavePathFull := filepath.Join(item.DownSavePath, item.Name) //创建本地文件夹
		os.MkdirAll(SavePathFull, 0777)
		UserID := aliyun.GetUserID()
		//遍历子文件，添加到下载队列，保存为已完成
		clist, cerr := aliyun.ApiFileListAllForDown(item.BoxID, item.Identity, "", false) //列出文件夹下的所有文件
		if cerr != nil {
			UpdateStateError(item, "解析文件夹失败:"+cerr.Error())
			return
		}
		if len(clist) > 0 {
			_DownFileAddList(UserID, SavePathFull, clist)
		}
		UpdateStateDowned(item)
		return
	}

	//创建文件夹，如果size=0创建空文件，最后判断是否已下载过，
	_, issame, err := openSaveFile(item)
	if err != nil {
		UpdateStateError(item, "创建文件失败:"+err.Error())
		return
	}
	if issame {
		UpdateStateDowned(item)
		log.Println("要下载的文件已存在直接成功:" + filepath.Join(item.DownSavePath, item.Name))
		return
	}

	url := ""
	//无法访问资源，可能需要登录
	for i := 0; i < 3; i++ {
		downurl, _, err := aliyun.ApiFileDownloadUrl(item.BoxID, item.Identity, 60*60*2)
		if err != nil {
			fmt.Println("DownloadAddress", err)
			time.Sleep(time.Duration(2) * time.Second)
			continue
		}
		url = downurl
		break
	}
	item.FailedMessage = ""
	if url == "" || err != nil {
		if err != nil && strings.Contains(err.Error(), "401") {
			UpdateStateError(item, "需要重新登录账号才能继续，用户名:"+aliyun.GetUserName()) //实际上是尝试重新登录失败，没法继续了
		} else {
			UpdateStateError(item, "获取下载地址失败")
		}
		return
	}
	uriData := []string{url}
	if len(item.GID) == 16 {
		_, ed := Aria2Rpc.TellStatus(item.GID)
		if ed == nil {
			Aria2Rpc.Remove(item.GID)
		} else {
			if !strings.Contains(ed.Error(), "is not found") {
				log.Println("aria2cerror4", ed) //GID 8d3ccdcde3c2e241 is not found
			}
			if strings.Contains(ed.Error(), "timeout awaiting response headers") {
				//aria2c正忙，稍后再重试
				UpdateStateError(item, "aria2c正忙稍后重试")
				return
			}
		}
	}

	dir := item.DownSavePath
	dir = strings.TrimRight(dir, "/")
	dir = strings.TrimRight(dir, "\\")
	file := item.Name
	item.GID = GetGID(item.DownID) + GetGID2()
	optionData := make(map[string]interface{})
	optionData["gid"] = item.GID
	optionData["dir"] = dir
	optionData["out"] = file + ".td"
	optionData["split"] = strconv.FormatInt(int64(threadcount), 10)
	optionData["min-split-size"] = "4M"
	optionData["referer"] = data.Config.AliDownReferer
	optionData["user-agent"] = data.Config.AliDownAgent
	optionData["check-certificate"] = "false"
	optionData["file-allocation"] = "trunc"
	if data.Setting.DownSha1Check && item.Hash != "" {
		optionData["checksum"] = "sha-1=" + item.Hash
	}

	infos, ed2 := Aria2Rpc.TellActive("gid", "status", "totalLength", "completedLength", "downloadSpeed")

	if ed2 != nil {
		log.Println("aria2cerror5", ed2)
		UpdateStateError(item, "aria2c正忙稍后重试")
		return
	}

	for j := 0; j < len(infos); j++ {
		if infos[j].Gid[0:10] == item.GID[0:10] {
			Aria2Rpc.Remove(infos[j].Gid)
		}
	}
	Aria2Rpc.RemoveDownloadResult(item.GID)

	_, erradd := Aria2Rpc.AddURI(uriData, optionData)

	if erradd != nil {
		log.Println("aria2cerroradd", erradd)
		msg := "创建aria任务失败:" + erradd.Error()
		if strings.Contains(msg, "No URI to") {
			msg = "创建aria任务失败，稍后自动重试"
		}
		UpdateStateError(item, msg)
		return
	} else {
		url = strings.ToLower(url)
		if strings.Contains(url, "//") {
			url = url[strings.Index(url, "//")+2:]
			url = url[0:strings.Index(url, "/")]
			item.DownServer = url
		}
		UpdateStateDowning(item)
	}
}
