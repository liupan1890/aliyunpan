package aliyun

import (
	"aliserver/data"
	"aliserver/utils"
	"encoding/json"
	"errors"
	"log"
	"path/filepath"

	"github.com/tidwall/gjson"
)

type FileUrlModel struct {
	P_file_id string `json:"file_id"`
	//文件名
	P_file_name string `json:"name"`
	//文件相对路径
	P_file_path  string `json:"path"`
	P_url        string `json:"url"`
	P_domain_id  string `json:"domain_id"`
	P_crc64_hash string `json:"crc64_hash"`
	P_sha1       string `json:"sha1"`
	P_size       int64  `json:"size"`
	IsUrl        bool
	IsDir        bool
}

func DownloadAddress(userid string, fileid string) (string, int64, error) {
	return "downurl", 0, nil
}

func ApiFileGetUrl(file_id string, parentpath string) (urlinfo FileUrlModel, err error) {
	//https://api.aliyundrive.com/v2/file/get
	//{"drive_id":"8699982","file_id":"60a521893abc43ae8386480788b1016a214724ac"}
	//download_url  url 15分钟有效
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiFileGetUrlError ", " error=", errr)
			err = errors.New("error")
		}
	}()
	var apiurl = "https://api.aliyundrive.com/v2/file/get"

	var postjson = map[string]interface{}{"drive_id": _user.UserToken.P_default_drive_id,
		"file_id": file_id}

	b, _ := json.Marshal(postjson)
	postdata := string(b)

	code, _, body := utils.PostHTTPString(apiurl, GetAuthorization(), postdata)
	if code == 401 {
		//UserAccessToken 失效了，尝试刷新一次
		ApiTokenRefresh("")
		//刷新完了，重新尝试一遍
		code, _, body = utils.PostHTTPString(apiurl, GetAuthorization(), postdata)
		if code == 401 {
			return urlinfo, errors.New("401")
		}
	}
	if code != 200 || !gjson.Valid(body) {
		return urlinfo, errors.New("error")
	}
	info := gjson.Parse(body)
	filetype := info.Get("type").String() //folder
	name := utils.ClearFileName(info.Get("name").String(), true)
	if name == "" {
		return urlinfo, errors.New("error")
	}
	if filetype == "file" {
		//url := info.Get("url").String()
		url := info.Get("download_url").String()
		domain_id := info.Get("domain_id").String()
		size := info.Get("size").Int()
		crc64_hash := info.Get("crc64_hash").String()               //3837432253803654719
		content_hash := info.Get("content_hash").String()           //E27EB7D983E212CDDF9149094E31E40CC47417D6
		content_hash_name := info.Get("content_hash_name").String() //sha1
		if content_hash_name != "sha1" {
			content_hash = ""
		}
		return FileUrlModel{P_file_id: file_id, P_file_path: parentpath, P_file_name: name, P_url: url, P_domain_id: domain_id, P_crc64_hash: crc64_hash, P_sha1: content_hash, P_size: size, IsUrl: true, IsDir: false}, nil
	} else {
		return FileUrlModel{P_file_id: file_id, P_file_path: parentpath, P_file_name: name, IsUrl: false, IsDir: true}, nil
	}
}
func ApiFileListAllForDown(parentid string, parentpath string, isfull bool) (list []*FileUrlModel, err error) {
	for i := 0; i < 3; i++ {
		var list []*FileUrlModel
		list, err := _ApiFileListAllForDown(parentid, parentpath, isfull)
		if err == nil {
			return list, nil
		}
	}
	return nil, errors.New("error")
}
func _ApiFileListAllForDown(parentid string, parentpath string, isfull bool) (list []*FileUrlModel, err error) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("_ApiFileListAllForDownError ", " error=", errr)
			err = errors.New("error")
		}
	}()
	var marker = ""
	for {
		flist, next, ferr := ApiFileListUrl(parentid, parentpath, marker)
		if ferr != nil {
			return nil, errors.New("error") //有错误直接退出
		}
		if len(flist) > 0 {
			list = append(list, flist...)
		}
		marker = next
		if next == "" {
			break
		}
	}
	if isfull {
		var max = len(list)
		for i := 0; i < max; i++ {
			if list[i].IsDir {
				rlist, rerr := ApiFileListAllForDown(list[i].P_file_id, list[i].P_file_path+"/"+list[i].P_file_name, true)
				//注意这里，如果子文件夹遍历时出错了，直接退出，确保要么全部成功，要么全部失败，不丢失
				if rerr != nil {
					return nil, errors.New("error")
				}
				if len(rlist) > 0 {
					list = append(list, rlist...)
				}
			}
		}
	}
	return list, nil
}

//真的读取子文件列表，不能有catch，出错要直接崩溃，上级调用会catch
func ApiFileListUrl(parentid string, parentpath string, marker string) (list []*FileUrlModel, next_marker string, err error) {
	var apiurl = "https://api.aliyundrive.com/v2/file/list"

	var postjson = map[string]interface{}{"drive_id": _user.UserToken.P_default_drive_id,
		"parent_file_id":  parentid,
		"limit":           1500,
		"all":             false,
		"fields":          "thumbnail",
		"order_by":        "name",
		"order_direction": "ASC"}
	if marker != "" {
		postjson["marker"] = marker
	}
	b, _ := json.Marshal(postjson)
	postdata := string(b)

	//"image_thumbnail_process":"image/resize,w_160/format,jpeg",
	//"image_url_process":"image/resize,w_1920/format,jpeg",
	//"video_thumbnail_process":"video/snapshot,t_0,f_jpg,ar_auto,w_300",

	code, _, body := utils.PostHTTPString(apiurl, GetAuthorization(), postdata)
	if code == 401 {
		//UserAccessToken 失效了，尝试刷新一次
		ApiTokenRefresh("")
		//刷新完了，重新尝试一遍
		code, _, body = utils.PostHTTPString(apiurl, GetAuthorization(), postdata)
	}
	if code != 200 || !gjson.Valid(body) {
		return nil, "", errors.New("error")
	}
	infofull := gjson.Parse(body)
	next_marker = infofull.Get("next_marker").String()
	items := infofull.Get("items").Array()

	var max = len(items)
	for i := 0; i < max; i++ {
		info := items[i]
		filetype := info.Get("type").String() //folder
		file_id := info.Get("file_id").String()
		name := utils.ClearFileName(info.Get("name").String(), true)
		if name == "" {
			return nil, "", errors.New("error")
		}
		if filetype == "file" {
			//url := info.Get("url").String()
			url := info.Get("download_url").String()
			domain_id := info.Get("domain_id").String()
			size := info.Get("size").Int()
			crc64_hash := info.Get("crc64_hash").String()               //3837432253803654719
			content_hash := info.Get("content_hash").String()           //E27EB7D983E212CDDF9149094E31E40CC47417D6
			content_hash_name := info.Get("content_hash_name").String() //sha1
			if content_hash_name != "sha1" {
				content_hash = ""
			}
			list = append(list, &FileUrlModel{P_file_id: file_id, P_file_path: parentpath, P_file_name: name, P_url: url, P_domain_id: domain_id, P_crc64_hash: crc64_hash, P_sha1: content_hash, P_size: size, IsUrl: true, IsDir: false})
		} else {
			list = append(list, &FileUrlModel{P_file_id: file_id, P_file_path: parentpath, P_file_name: name, IsUrl: false, IsDir: true})
		}
	}

	return list, next_marker, nil
}

func ApiPlay(file_id string) string {
	mpvpath := ""
	if utils.IsWindows() {
		//检测是否有MPV\\mpv.exe文件
		mpvpath = filepath.Join(utils.ExePath(), "MPV", "mpv.exe")
		if !utils.FileExists(mpvpath) {
			return utils.ToErrorMessageJSON("找不到播放器" + mpvpath)
		}
	} else if utils.IsDarwin() {

		mpvpath = filepath.Join(utils.ExePath(), "mpv")
		if !utils.FileExists(mpvpath) {
			return utils.ToErrorMessageJSON("找不到播放器" + mpvpath)
		}
	} else if utils.IsLinux() {
		mpvpath = "mpv"
	}

	urlinfo, err := ApiFileGetUrl(file_id, "")
	if err != nil {
		return utils.ToErrorMessageJSON("获取视频链接失败")
	}
	err = utils.RunPlayer(mpvpath, urlinfo.P_url, data.Config.AliDownAgent)
	if err == nil {
		return utils.ToSuccessJSON("playerpath", mpvpath)
	}
	log.Println("player", err)
	return utils.ToErrorJSON(err)

}
