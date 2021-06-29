package link

import (
	"aliserver/aliyun"
	"aliserver/utils"
	"errors"
	"log"
	"net/url"
	"regexp"
	"strconv"
	"strings"
	"sync"

	"github.com/tidwall/gjson"
)

type FileAliModel struct {
	//文件时有 文件夹时没有
	P_fid string `json:"fid"`
	//文件夹时是文件夹ID 文件时是父文件夹ID
	P_cid uint64 `json:"cid"`
	//文件名
	P_name string `json:"n"`
	//文件大小
	P_size int64 `json:"s"`
	//文件时有 文件夹时没有
	P_sha1 string `json:"sha"`

	IsDir bool
}

func GetLinkStrAli(linkstr string) string {
	//https://www.aliyundrive.com/s/FGtXkA5SVZM
	reg := regexp.MustCompile(`aliyundrive.com/s/([\w]+)`)
	params := reg.FindStringSubmatch(linkstr)
	if params == nil || len(params) < 2 {
		return ""
	}
	sid := params[1]
	return "https://www.aliyundrive.com/s/" + sid
}
func GetLinkStrAliSID(linkstr string) string {
	reg := regexp.MustCompile(`aliyundrive.com/s/([\w]+)`)
	params := reg.FindStringSubmatch(linkstr)
	if params == nil || len(params) < 2 {
		return ""
	}
	sid := params[1]
	return sid
}

func GetLinkFilesAli(linksid string, password string) (link *aliyun.LinkFileModel, err error) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("GetLinkFilesAliError ", " error=", errr)
			err = errors.New("error")
		}
	}()

	sharename, shareinfo, fileinfos, err := aliyun.ApiGetShareAnonymous(linksid)
	if err != nil {
		return nil, err
	}

	token, err := aliyun.ApiGetShareToken(linksid, password)
	if err != nil {
		errmsg := err.Error()
		if errmsg == "密码错误" {
			//尝试联网读取
			urldata := "&linkstr=" + url.QueryEscape("https://www.aliyundrive.com/s/"+linksid)
			password2 := aliyun.ApiShareLinkPwdToServer(urldata)
			if password2 != "error" {
				password = password2
				token, err = aliyun.ApiGetShareToken(linksid, password)
			}
		}
		if err != nil {
			err2 := errors.New("error")
			link, err2 = _ApiFileListAllForAliLink2(linksid, shareinfo, fileinfos) //文件数量<3时尝试绕过密码
			if err2 != nil {
				return nil, err
			}
		}
	}

	link, err = ApiFileListAllForAliLink(linksid, token, "root", linksid)
	if err != nil {
		return nil, err
	}
	link.Name = sharename
	link.Message = shareinfo
	return link, err

}

//ApiFileListAllForAliLink 读取一个文件夹的信息(文件列表)(遍历子文件夹)
func ApiFileListAllForAliLink(sid string, token string, parentid string, name string) (link *aliyun.LinkFileModel, err error) {
	for i := 0; i < 3; i++ {
		link, err = _ApiFileListAllForAliLink(sid, token, parentid, name)
		if err == nil {
			return link, nil
		} else {
			errmsg := err.Error()
			if errmsg != "error" {
				return nil, err
			}
		}
	}
	return nil, err
}

//_ApiFileListAllForAliLink  读取一个文件夹的信息(文件列表)(遍历子文件夹)
func _ApiFileListAllForAliLink(sid string, token string, parentid string, name string) (link *aliyun.LinkFileModel, err error) {

	defer func() {
		if errr := recover(); errr != nil {
			log.Println("_ApiFileListAllForAliLinkError ", " error=", errr)
			err = errors.New("error")
		}
	}()

	link = &aliyun.LinkFileModel{
		DirList:  []*aliyun.LinkFileModel{},
		FileList: []string{},
		Name:     name,
		Message:  "",
		Size:     0,
	}
	list, err := aliyun.ApiGetShareListAll(sid, parentid, token)
	if err != nil {
		return nil, err
	}

	var wg sync.WaitGroup
	var lock sync.Mutex
	errnum := 0
	var max = len(list)
	for i := 0; i < max; i++ {
		var item = list[i]
		if item.IsDir {
			wg.Add(1)
			go func(item *aliyun.FileUrlModel) {
				dir, derr := ApiFileListAllForAliLink(sid, token, item.P_file_id, item.P_file_name)
				//注意这里，如果子文件夹遍历时出错了，直接退出，确保要么全部成功，要么全部失败，不丢失
				if derr != nil {
					errnum++
				} else {
					lock.Lock()
					link.DirList = append(link.DirList, dir)
					lock.Unlock()
				}
				defer wg.Done()
			}(item)
		} else {
			link.Size += item.P_size
			link.FileList = append(link.FileList, strings.ReplaceAll(item.P_file_name, "|", "｜")+"|"+strconv.FormatInt(item.P_size, 10)+"|"+item.P_file_id)
		}
	}
	wg.Wait()
	if errnum > 0 {
		return nil, errors.New("列出文件信息时出错")
	}
	return link, nil
}

func _ApiFileListAllForAliLink2(sid, shareinfo, fileinfos string) (link *aliyun.LinkFileModel, err error) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("_ApiFileListAllForAliLinkError ", " error=", errr)
			err = errors.New("error")
		}
	}()

	info := gjson.Parse(shareinfo)
	count := info.Get("file_count").Int()

	files := gjson.Parse(fileinfos).Array()
	if count == int64(len(files)) {
		//文件数量<3
		link = &aliyun.LinkFileModel{
			DirList:  []*aliyun.LinkFileModel{},
			FileList: []string{},
			Name:     sid,
			Message:  "",
			Size:     0,
		}
		var max = len(files)
		for i := 0; i < max; i++ {
			info := files[i]
			filetype := info.Get("type").String() //folder
			file_id := info.Get("file_id").String()
			name := utils.ClearFileName(info.Get("name").String(), true)
			if name == "" {
				return nil, errors.New("nameerror")
			}
			if filetype == "file" {
				size := info.Get("size").Int()
				link.Size += size
				link.FileList = append(link.FileList, strings.ReplaceAll(name, "|", "｜")+"|"+strconv.FormatInt(size, 10)+"|"+file_id)
			} else {
				return nil, errors.New("direrror")
			}
		}
		return link, nil
	}
	return nil, errors.New("error")
}
