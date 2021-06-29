package localhost

import (
	"aliserver/aliyun"
	"aliserver/download"
	"aliserver/link"
	"aliserver/upload"
	"aliserver/utils"
	"encoding/base64"
	"io/ioutil"
	"log"
	"net/http"
	"strings"

	"github.com/tidwall/gjson"
)

//ActionPing 返回ping
func ActionPing(w http.ResponseWriter, req *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("x-md-by", "xiaobaiyang")
	w.WriteHeader(200)
	w.Write([]byte("success"))
}

//ActionURL 拉取url内容返回
func ActionURL(w http.ResponseWriter, req *http.Request) {

	jsonstr := ""
	defer func() {
		if err := recover(); err != nil {
			log.Println("ActionURLError ", " input=", jsonstr, " error=", err)
		}
	}()

	var jsonbs []byte
	if req.Body != nil {
		bodyBytes, _ := ioutil.ReadAll(req.Body)
		decodeBytes, _ := base64.StdEncoding.DecodeString(string(bodyBytes))
		jsonstr = string(decodeBytes)

		url := gjson.Get(jsonstr, "url").String()
		method := gjson.Get(jsonstr, "method").String()
		header := gjson.Get(jsonstr, "header").String()
		postdata := gjson.Get(jsonstr, "postdata").String()
		//println("postdata=", postdata)
		if strings.HasPrefix(strings.ToLower(url), "http") {
			jsonbs = []byte(HookURL(url, method, header, postdata, req.UserAgent()))
		} else {
			ishook, hookresult := HookAction(url, postdata)
			if ishook {
				jsonbs = []byte(`{"code":200, "header": "", "body": ` + hookresult + `}`)
				//jsonbs = []byte(utils.ToSuccessJSON3("code", 200, "header", "", "body", hookresult))
			} else {
				jsonbs = []byte(`{"code":200, "header": "` + utils.ToJSONString(jsonstr) + `", "body": {"code":503,"message":"不支持的操作"}}`)
				//jsonbs = []byte(utils.ToSuccessJSON3("code", 200, "header", jsonstr, "body", utils.ToErrorMessageJSON("不支持的操作")))
			}
		}
	}
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("x-md-by", "xiaobaiyang")
	w.WriteHeader(200)
	if len(jsonbs) > 0 {
		w.Write(jsonbs)
	}
}

//HookURL 联网加载指定的url数据
func HookURL(url string, method string, header string, postdata string, useragent string) string {

	if useragent != "" && !strings.Contains(header, "User-Agent") {
		header = "User-Agent: " + useragent + "\n" + header
	}
	if strings.ToLower(method) == "get" {
		respcode, resphead, respbody := utils.GetHTTPString(url, header)
		if respcode != 200 {
			resphead = url + header
		}
		return utils.ToSuccessJSON3("code", respcode, "header", resphead, "body", respbody)
	}
	respcode, resphead, respbody := utils.PostHTTPString(url, header, postdata)
	if respcode != 200 {
		resphead = url + header + postdata
	}
	return utils.ToSuccessJSON3("code", respcode, "header", resphead, "body", respbody)
}

//HookAction 拦截自定义命令
func HookAction(url string, postdata string) (ishook bool, hookresult string) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("HookActionError ", " error=", errr)
			ishook = true
			hookresult = utils.ToErrorMessageJSON("HookActionError")
		}
	}()
	switch url {
	case "Ping":
		return true, utils.ToSuccessJSON("Ping", "success")
	case "ApiUserInfo":
		return true, aliyun.ApiUserInfo()
	case "ApiUserLogoff":
		return true, aliyun.ApiUserLogoff()
	case "ApiQrcodeGenerate":
		return true, aliyun.ApiQrcodeGenerate()
	case "ApiQrcodeQuery":
		return true, aliyun.ApiQrcodeQuery()
	case "ApiTokenRefresh":
		refreshToken := gjson.Get(postdata, "refreshToken").String()
		return true, aliyun.ApiTokenRefresh(refreshToken)
	case "ApiFileList":
		boxid := GetBoxID(gjson.Get(postdata, "box").String())
		parentid := gjson.Get(postdata, "parentid").String()
		marker := gjson.Get(postdata, "marker").String()
		return true, HookActionFileList(boxid, parentid, marker)
	case "ApiDirList":
		boxid := GetBoxID(gjson.Get(postdata, "box").String())
		parentid := gjson.Get(postdata, "parentid").String()
		return true, aliyun.ApiDirList(boxid, parentid)
	case "ApiCreatForder":
		boxid := GetBoxID(gjson.Get(postdata, "box").String())
		parentid := gjson.Get(postdata, "parentid").String()
		name := gjson.Get(postdata, "name").String()
		return true, aliyun.ApiCreatForder(boxid, parentid, name)
	case "ApiRename":
		boxid := GetBoxID(gjson.Get(postdata, "box").String())
		file_id := gjson.Get(postdata, "file_id").String()
		name := gjson.Get(postdata, "name").String()
		return true, aliyun.ApiRename(boxid, file_id, name)
	case "ApiRenameBatch":
		boxid := GetBoxID(gjson.Get(postdata, "box").String())
		keylist := gjson.Get(postdata, "keylist").Array()
		keylist2 := make([]string, len(keylist))
		for i := 0; i < len(keylist); i++ {
			keylist2[i] = keylist[i].String()
		}
		namelist := gjson.Get(postdata, "namelist").Array()
		namelist2 := make([]string, len(namelist))
		for i := 0; i < len(namelist); i++ {
			namelist2[i] = namelist[i].String()
		}
		return true, aliyun.ApiRenameBatch(boxid, keylist2, namelist2)

	case "ApiUncompress":
		boxid := GetBoxID(gjson.Get(postdata, "box").String())
		file_id := gjson.Get(postdata, "file_id").String()
		target_file_id := gjson.Get(postdata, "target_file_id").String()
		password := gjson.Get(postdata, "password").String()
		return true, aliyun.ApiUncompress(boxid, file_id, target_file_id, password)
	case "ApiUncompressCheck":
		boxid := GetBoxID(gjson.Get(postdata, "box").String())
		file_id := gjson.Get(postdata, "file_id").String()
		domain_id := gjson.Get(postdata, "domain_id").String()
		task_id := gjson.Get(postdata, "task_id").String()
		return true, aliyun.ApiUncompressCheck(boxid, domain_id, file_id, task_id)
	case "ApiMoveBatch":
		boxid := GetBoxID(gjson.Get(postdata, "box").String())
		movetobox := GetBoxID(gjson.Get(postdata, "movetobox").String())
		movetoid := gjson.Get(postdata, "movetoid").String()
		filelist := gjson.Get(postdata, "filelist").Array()
		list := make([]string, len(filelist))
		for i := 0; i < len(filelist); i++ {
			list[i] = filelist[i].String()
		}
		return true, aliyun.ApiMoveBatch(boxid, list, movetobox, movetoid)
	case "ApiCopyBatch":
		boxid := GetBoxID(gjson.Get(postdata, "box").String())
		copytobox := GetBoxID(gjson.Get(postdata, "copytobox").String())
		copytoid := gjson.Get(postdata, "copytoid").String()
		parentid := gjson.Get(postdata, "parentid").String()
		filelist := gjson.Get(postdata, "filelist").Array()
		list := make([]string, len(filelist))
		for i := 0; i < len(filelist); i++ {
			list[i] = filelist[i].String()
		}
		return true, link.GoCopyCreat(boxid, parentid, list, copytobox, copytoid)
	case "ApiTrashBatch":
		boxid := GetBoxID(gjson.Get(postdata, "box").String())
		filelist := gjson.Get(postdata, "filelist").Array()
		list := make([]string, len(filelist))
		for i := 0; i < len(filelist); i++ {
			list[i] = filelist[i].String()
		}
		return true, aliyun.ApiTrashBatch(boxid, list)
	case "ApiTrashDeleteBatch":
		boxid := GetBoxID(gjson.Get(postdata, "box").String())
		filelist := gjson.Get(postdata, "filelist").Array()
		list := make([]string, len(filelist))
		for i := 0; i < len(filelist); i++ {
			list[i] = filelist[i].String()
		}
		return true, aliyun.ApiTrashDeleteBatch(boxid, list)
	case "ApiTrashRestoreBatch":
		boxid := GetBoxID(gjson.Get(postdata, "box").String())
		filelist := gjson.Get(postdata, "filelist").Array()
		list := make([]string, len(filelist))
		for i := 0; i < len(filelist); i++ {
			list[i] = filelist[i].String()
		}
		return true, aliyun.ApiTrashRestoreBatch(boxid, list)
	case "ApiTrashFileList":
		boxid := GetBoxID(gjson.Get(postdata, "box").String())
		marker := gjson.Get(postdata, "marker").String()
		return true, aliyun.ApiTrashFileList(boxid, marker)
	case "ApiFavorFileList":
		boxid := GetBoxID(gjson.Get(postdata, "box").String())
		marker := gjson.Get(postdata, "marker").String()
		return true, aliyun.ApiFavorFileList(boxid, marker)
	case "ApiFavor":
		boxid := GetBoxID(gjson.Get(postdata, "box").String())
		file_id := gjson.Get(postdata, "file_id").String()
		isfavor := gjson.Get(postdata, "isfavor").Bool()
		return true, aliyun.ApiFavor(boxid, file_id, isfavor)
	case "ApiFavorBatch":
		boxid := GetBoxID(gjson.Get(postdata, "box").String())
		filelist := gjson.Get(postdata, "filelist").Array()
		list := make([]string, len(filelist))
		for i := 0; i < len(filelist); i++ {
			list[i] = filelist[i].String()
		}
		isfavor := gjson.Get(postdata, "isfavor").Bool()
		return true, aliyun.ApiFavorBatch(boxid, list, isfavor)
	case "GoPlay":
		boxid := GetBoxID(gjson.Get(postdata, "box").String())
		file_id := gjson.Get(postdata, "file_id").String()
		return true, aliyun.ApiPlay(boxid, file_id)
	case "GoImage":
		boxid := GetBoxID(gjson.Get(postdata, "box").String())
		file_id := gjson.Get(postdata, "file_id").String()
		return true, aliyun.ApiImage(boxid, file_id)
	case "GoText":
		boxid := GetBoxID(gjson.Get(postdata, "box").String())
		file_id := gjson.Get(postdata, "file_id").String()
		return true, aliyun.ApiText(boxid, file_id)
	case "GoDownFile":
		boxid := GetBoxID(gjson.Get(postdata, "box").String())
		filelist := gjson.Get(postdata, "filelist").Array()
		list := make([]string, len(filelist))
		for i := 0; i < len(filelist); i++ {
			list[i] = filelist[i].String()
		}
		savepath := gjson.Get(postdata, "savepath").String() //DownSavePath+RootPath 下载保存位置+该文件相对root的路径
		parentid := gjson.Get(postdata, "parentid").String() //D:\Down\     +新建文件夹\002\    + filelist[name]
		return true, download.DownFileMutil(boxid, parentid, savepath, list)
	case "GoDowningList":
		return true, download.DowningList()
	case "GoDownedList":
		return true, download.DownedList()

	case "GoDowningStart":
		downid := gjson.Get(postdata, "downid").String()
		if downid == "all" {
			return true, download.DowningStartAll()
		}
		return true, download.DowningStart(downid)
	case "GoDowningStop":
		downid := gjson.Get(postdata, "downid").String()
		if downid == "all" {
			return true, download.DowningStopAll()
		}
		return true, download.DowningStop(downid)
	case "GoDowningDelete":
		downid := gjson.Get(postdata, "downid").String()
		if downid == "all" {
			return true, download.DowningDeleteAll()
		}
		return true, download.DowningDelete(downid)
	case "GoDownedDelete":
		downid := gjson.Get(postdata, "downid").String()
		if downid == "all" {
			return true, download.DownedDeleteAll()
		}
		return true, download.DownedDelete(downid)
	case "GoDowningForder":
		downid := gjson.Get(postdata, "downid").String()
		return true, download.DowningForder(downid)
	case "GoDownedForder":
		downid := gjson.Get(postdata, "downid").String()
		return true, download.DownedForder(downid)

	case "GoUploadFile":
		boxid := GetBoxID(gjson.Get(postdata, "box").String())
		filelist := gjson.Get(postdata, "filelist").Array()
		list := make([]string, len(filelist))
		for i := 0; i < len(filelist); i++ {
			list[i] = filelist[i].String()
		}
		parentid := gjson.Get(postdata, "parentid").String()
		return true, upload.UploadFile(boxid, parentid, list)
	case "GoUploadDir":
		boxid := GetBoxID(gjson.Get(postdata, "box").String())
		parentid := gjson.Get(postdata, "parentid").String()
		dirpath := gjson.Get(postdata, "dirpath").String()
		return true, upload.UploadDir(boxid, parentid, dirpath)
	case "GoUploadFileAndDir":
		boxid := GetBoxID(gjson.Get(postdata, "box").String())
		filelist := gjson.Get(postdata, "filelist").Array()
		list := make([]string, len(filelist))
		for i := 0; i < len(filelist); i++ {
			list[i] = filelist[i].String()
		}
		parentid := gjson.Get(postdata, "parentid").String()
		return true, upload.UploadFileAndDir(boxid, parentid, list)
	case "GoUploadingList":
		return true, upload.UploadingList()
	case "GoUploadList":
		return true, upload.UploadList()

	case "GoUploadingStart":
		uploadid := gjson.Get(postdata, "uploadid").String()
		if uploadid == "all" {
			return true, upload.UploadingStartAll()
		}
		return true, upload.UploadingStart(uploadid)
	case "GoUploadingStop":
		uploadid := gjson.Get(postdata, "uploadid").String()
		if uploadid == "all" {
			return true, upload.UploadingStopAll()
		}
		return true, upload.UploadingStop(uploadid)
	case "GoUploadingDelete":
		uploadid := gjson.Get(postdata, "uploadid").String()
		if uploadid == "all" {
			return true, upload.UploadingDeleteAll()
		}
		return true, upload.UploadingDelete(uploadid)
	case "GoUploadDelete":
		uploadid := gjson.Get(postdata, "uploadid").String()
		if uploadid == "all" {
			return true, upload.UploadDeleteAll()
		}
		return true, upload.UploadDelete(uploadid)
	case "GoUploadingForder":
		uploadid := gjson.Get(postdata, "uploadid").String()
		return true, upload.UploadingForder(uploadid)
	case "GoUploadForder":
		uploadid := gjson.Get(postdata, "uploadid").String()
		return true, upload.UploadForder(uploadid)

	case "GoSetting":
		key := gjson.Get(postdata, "key").String()
		val := gjson.Get(postdata, "val").String()
		return true, GoSetting(key, val)
	case "GoLinkList":
		return true, link.GoLinkList()
	case "GoLinkDelete":
		linkstr := gjson.Get(postdata, "link").String()
		return true, link.GoLinkDelete(linkstr)
	case "GoLinkCreatFile":
		boxid := GetBoxID(gjson.Get(postdata, "box").String())
		filename := gjson.Get(postdata, "filename").String()
		jianjie := gjson.Get(postdata, "jianjie").String()
		parentid := gjson.Get(postdata, "parentid").String()
		filelist := gjson.Get(postdata, "filelist").Array()
		list := make([]string, len(filelist))
		for i := 0; i < len(filelist); i++ {
			list[i] = filelist[i].String()
		}
		return true, link.GoLinkCreatFile(filename, jianjie, boxid, parentid, list)

	case "GoLinkParse":
		linkstr := gjson.Get(postdata, "link").String()
		password := gjson.Get(postdata, "password").String()
		ispublic := gjson.Get(postdata, "ispublic").Bool()
		return true, link.GoLinkParse(linkstr, password, ispublic)

	case "GoLinkShare":
		linkstr := gjson.Get(postdata, "link").String()
		password := gjson.Get(postdata, "password").String()
		return true, link.GoLinkShare(linkstr, password)
	case "GoLinkShareUpload":
		shareid := gjson.Get(postdata, "shareid").String()
		boxid := GetBoxID(gjson.Get(postdata, "box").String())
		parentid := gjson.Get(postdata, "parentid").String()
		linkstr := gjson.Get(postdata, "linkstr").String()
		return true, link.GoLinkShareUpload(boxid, parentid, shareid, linkstr)
	case "GoLinkUpload":
		boxid := GetBoxID(gjson.Get(postdata, "box").String())
		parentid := gjson.Get(postdata, "parentid").String()
		linkstr := gjson.Get(postdata, "linkstr").String()
		return true, link.GoLinkUpload(boxid, parentid, linkstr)

	case "GoLinkSearch":
		search := gjson.Get(postdata, "search").String()
		pageindex := gjson.Get(postdata, "pageindex").Int()
		return true, link.GoLinkSearch(search, pageindex)

	}
	return false, ""
}

//HookActionFileList 特殊处理 1.识别回收站、收藏夹、保险箱、最近访问 2.出错自动重试3次
func HookActionFileList(boxid, parentid string, marker string) string {
	jsonstr := ""
	for i := 0; i < 3; i++ {
		if parentid == "trash" {
			jsonstr = aliyun.ApiTrashFileList(boxid, marker)
			if len(jsonstr) > 60 {
				break
			}
		} else if parentid == "favorite" {
			jsonstr = aliyun.ApiFavorFileList(boxid, marker)
			if len(jsonstr) > 60 {
				break
			}
		} else if strings.HasPrefix(parentid, "xiangce:") {
			parentid = parentid[len("xiangce:"):]
			jsonstr = aliyun.ApiFileList(boxid, parentid, marker)
			if len(jsonstr) > 60 {
				break
			}
		} else if parentid == "safebox" {
			jsonstr = `{"code":0,"message":"success","next_marker":"","items":[]}`
			break
		} else if parentid == "calendar" {
			jsonstr = `{"code":0,"message":"success","next_marker":"","items":[]}`
			break
		} else {
			jsonstr = aliyun.ApiFileList(boxid, parentid, marker)
			if len(jsonstr) > 60 {
				break
			}
		}
	}
	return jsonstr
}

func GetBoxID(box string) string {
	if box == "box" {
		return aliyun.GetUserBoxID()
	} else if box == "sbox" {
		return aliyun.GetUserSBoxID()
	} else if box == "xiangce" {
		return aliyun.GetUserXiangCeID()
	}
	return ""
}
