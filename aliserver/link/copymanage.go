package link

import (
	"aliserver/aliyun"
	"aliserver/upload"
	"aliserver/utils"
	"strconv"
	"strings"
	"sync"
)

func GoCopyCreat(boxid string, parentid string, keylist []string, copytobox string, copytoid string) string {

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
		flist, ferr := aliyun.ApiFileListAllForDown(boxid, parentid, "", false)
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

	link := aliyun.LinkFileModel{
		DirList:  []*aliyun.LinkFileModel{},
		FileList: []string{},
		Name:     "",
		Message:  "",
		Size:     0,
	}

	errnum = 0
	lmax := len(list)
	for m := 0; m < lmax; m++ {
		item := list[m]
		if item.IsDir {
			wg.Add(1)
			go func(m int) {
				dir, derr := aliyun.ApiFileListAllForLink(boxid, item.P_file_id, item.P_file_name)
				if derr != nil {
					errnum++
				} else {
					lock.Lock()
					link.DirList = append(link.DirList, dir)
					lock.Unlock()
				}
				defer wg.Done()
			}(m)
		} else {
			link.Size += item.P_size
			link.FileList = append(link.FileList, strings.ReplaceAll(item.P_file_name, "|", "｜")+"|"+strconv.FormatInt(item.P_size, 10)+"|"+item.P_sha1)
		}
	}
	wg.Wait()
	if errnum > 0 {
		return utils.ToErrorMessageJSON("列出文件信息时出错")
	}

	if link.GetFileCount() == 0 {
		return utils.ToErrorMessageJSON("不能复制空文件夹")
	}
	//生成SelectFileList []*UploadSelectModel
	SelectFileList, err := GetFilesWithDir(copytobox, copytoid, &link)
	if err != nil {
		return utils.ToErrorMessageJSON("创建保存路径失败")
	}
	return upload.UploadSelectFile(UserID, copytoid, SelectFileList)
}
