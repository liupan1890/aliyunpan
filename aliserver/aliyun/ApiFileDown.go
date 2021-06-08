package aliyun

import (
	"aliserver/data"
	"aliserver/utils"
	"encoding/json"
	"errors"
	"log"
	"path/filepath"
	"strconv"
	"strings"
	"sync"

	"github.com/chennqqi/chardet"
	"github.com/tidwall/gjson"
)

type FileUrlModel struct {
	P_file_id string `json:"file_id"`
	//文件名
	P_file_name string `json:"name"`
	//文件相对路径
	P_file_path string `json:"path"`
	//P_url        string `json:"url"`
	//P_domain_id  string `json:"domain_id"`
	//P_crc64_hash string `json:"crc64_hash"`
	P_sha1 string `json:"sha1"`
	P_size int64  `json:"size"`
	IsUrl  bool
	IsDir  bool
}

func ApiFileDownloadUrl(file_id string, expire_sec int) (downurl string, size int64, err error) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiFileDownloadUrlError ", " error=", errr)
			err = errors.New("error")
		}
	}()
	var apiurl = "https://api.aliyundrive.com/v2/file/get_download_url"

	var postjson = map[string]interface{}{"drive_id": _user.UserToken.P_default_drive_id,
		"file_id":    file_id,
		"expire_sec": expire_sec,
	}

	b, _ := json.Marshal(postjson)
	postdata := string(b)

	code, _, body := utils.PostHTTPString(apiurl, GetAuthorization(), postdata)
	if code == 401 {
		//UserAccessToken 失效了，尝试刷新一次
		ApiTokenRefresh("")
		//刷新完了，重新尝试一遍
		code, _, body = utils.PostHTTPString(apiurl, GetAuthorization(), postdata)
		if code == 401 {
			return "", 0, errors.New("401")
		}
	}
	if code != 200 || !gjson.Valid(body) {
		return "", 0, errors.New("error")
	}
	info := gjson.Parse(body)
	url := info.Get("url").String()
	size = info.Get("size").Int()
	return url, size, nil
}

//ApiFileGetUrl 读取一个文件的信息
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
		//url := info.Get("download_url").String()
		//domain_id := info.Get("domain_id").String()
		size := info.Get("size").Int()
		//crc64_hash := info.Get("crc64_hash").String()               //3837432253803654719
		content_hash := info.Get("content_hash").String()           //E27EB7D983E212CDDF9149094E31E40CC47417D6
		content_hash_name := info.Get("content_hash_name").String() //sha1
		if content_hash_name != "sha1" {
			content_hash = ""
		}
		return FileUrlModel{P_file_id: file_id, P_file_path: parentpath, P_file_name: name, P_sha1: content_hash, P_size: size, IsUrl: true, IsDir: false}, nil
	} else {
		return FileUrlModel{P_file_id: file_id, P_file_path: parentpath, P_file_name: name, IsUrl: false, IsDir: true}, nil
	}
}

//ApiFileListAllForDown 读取一个文件夹包含的文件列表 isfull==true时遍历所有子文件夹
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

//_ApiFileListAllForDown 读取一个文件夹包含的文件列表 isfull==true时遍历所有子文件夹
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
		var wg sync.WaitGroup
		var lock sync.Mutex
		errnum := 0
		var max = len(list)
		for i := 0; i < max; i++ {
			if list[i].IsDir {
				wg.Add(1)
				go func(i int) {
					rlist, rerr := ApiFileListAllForDown(list[i].P_file_id, list[i].P_file_path+"/"+list[i].P_file_name, true)
					//注意这里，如果子文件夹遍历时出错了，直接退出，确保要么全部成功，要么全部失败，不丢失
					if rerr != nil {
						errnum++
					} else if len(rlist) > 0 {
						lock.Lock()
						list = append(list, rlist...)
						lock.Unlock()
					}
					wg.Done()
				}(i)
			}
		}
		wg.Wait()
		if errnum > 0 {
			return nil, errors.New("列出文件信息时出错")
		}
	}
	return list, nil
}

//ApiFileListUrl 真的读取子文件列表，不能有catch，出错要直接崩溃，上级调用会catch
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
			//url := info.Get("download_url").String()
			//domain_id := info.Get("domain_id").String()
			size := info.Get("size").Int()
			//crc64_hash := info.Get("crc64_hash").String()               //3837432253803654719
			content_hash := info.Get("content_hash").String()           //E27EB7D983E212CDDF9149094E31E40CC47417D6
			content_hash_name := info.Get("content_hash_name").String() //sha1
			if content_hash_name != "sha1" {
				content_hash = ""
			}
			list = append(list, &FileUrlModel{P_file_id: file_id, P_file_path: parentpath, P_file_name: name, P_sha1: content_hash, P_size: size, IsUrl: true, IsDir: false})
		} else {
			list = append(list, &FileUrlModel{P_file_id: file_id, P_file_path: parentpath, P_file_name: name, IsUrl: false, IsDir: true})
		}
	}

	return list, next_marker, nil
}

//ApiPlay 调用本地播放器
func ApiPlay(file_id string) string {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiPlayError ", " error=", errr)
		}
	}()
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

	downurl, _, err := ApiFileDownloadUrl(file_id, 60*60*4)
	if err != nil {
		return utils.ToErrorMessageJSON("获取视频链接失败")
	}
	err = utils.RunPlayer(mpvpath, downurl, data.Config.AliDownAgent)
	if err == nil {
		return utils.ToSuccessJSON("playerpath", mpvpath)
	}
	log.Println("player", err)
	return utils.ToErrorJSON(err)

}

//ApiImage 在线预览图片
func ApiImage(file_id string) string {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiImageError ", " error=", errr)
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
			return utils.ToErrorMessageJSON("获取图片链接失败")
		}
	}
	if code != 200 || !gjson.Valid(body) {
		return utils.ToErrorMessageJSON("获取图片链接失败")
	}
	info := gjson.Parse(body)
	url := info.Get("url").String()
	/*
		code, _, bodybs := utils.GetHTTPBytes(thumbnail, GetAuthorization())
		if code != 200 {
			return utils.ToErrorMessageJSON("获取图片链接失败")
		}
		b64str := base64.StdEncoding.EncodeToString(*bodybs)
	*/
	return utils.ToSuccessJSON("url", url)
}

//ApiText 在线预览文本
func ApiText(file_id string) string {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiTextError ", " error=", errr)
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
			return utils.ToErrorMessageJSON("获取文本链接失败")
		}
	}
	if code != 200 || !gjson.Valid(body) {
		return utils.ToErrorMessageJSON("获取文本链接失败")
	}
	info := gjson.Parse(body)
	url := info.Get("url").String()

	code, _, bodybs1 := utils.GetHTTPBytes(url, GetAuthorization())
	if code != 200 {
		return utils.ToErrorMessageJSON("获取文本链接失败")
	}
	bodybs := *bodybs1
	if bodybs[0] == 0xFF && bodybs[1] == 0xFE {
		conbs, err := utils.UTF16LEToUtf8(bodybs)
		if err == nil {
			bodybs = conbs
		}
	} else if bodybs[0] == 0xFE && bodybs[1] == 0xFF {
		conbs, err := utils.UTF16BEToUtf8(bodybs)
		if err == nil {
			bodybs = conbs
		}
	} else if bodybs[0] == 0xEF && bodybs[1] == 0xBB && bodybs[2] == 0xBF {
		//utf8
	} else {
		plist := chardet.Possible(bodybs)
		if utils.IsContain(plist, "utf-8") {
			//utf8
		} else if utils.IsContain(plist, "gb18030") {
			conbs, err := utils.GB18030ToUtf8(bodybs)
			if err == nil {
				bodybs = conbs
			}
		} else if utils.IsContain(plist, "gbk") {
			conbs, err := utils.GbkToUtf8(bodybs)
			if err == nil {
				bodybs = conbs
			}
		} else if utils.IsContain(plist, "big5") {
			conbs, err := utils.Big5ToUtf8(bodybs)
			if err == nil {
				bodybs = conbs
			}
		}
	}
	text := string(bodybs)
	temp := []rune(text)
	length4 := len(temp)
	if length4 > 20480 { //1万字
		text = string(temp[0:20480]) + "\n\n\n\n剩余" + strconv.FormatInt(int64(length4-20480), 10) + "字被省略.....\n\n\n\n"
	}
	text = strings.ReplaceAll(text, "	", " ")
	return utils.ToSuccessJSON("text", text)
}
