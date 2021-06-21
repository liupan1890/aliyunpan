package aliyun

import (
	"aliserver/utils"
	"encoding/json"
	"log"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/tidwall/gjson"
)

type FileItemModel struct {
	P_file_id      string `json:"file_id"`
	P_file_name    string `json:"file_name"`
	P_file_size    string `json:"file_size"`
	P_file_time    string `json:"file_time"`
	P_file_type    string `json:"file_type"`
	P_file_sizestr string `json:"file_sizestr"`
	P_file_timestr string `json:"file_timestr"`
	P_file_icon    string `json:"file_icon"`
}

func ApiFileList(boxid string, parentid string, marker string) (retjsonstr string) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiFileListError ", " error=", errr)
			retjsonstr = `{"code":503,"message":"error","next_marker":"","items":[]}`
		}
	}()

	var apiurl = "https://api.aliyundrive.com/v2/file/list"

	var postjson = map[string]interface{}{"drive_id": boxid,
		"parent_file_id":  parentid,
		"limit":           100,
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
		return `{"code":503,"message":"error","next_marker":"","items":[]}`
	}
	info := gjson.Parse(body)
	next_marker := info.Get("next_marker").String()
	items := info.Get("items").Array()
	var builder strings.Builder
	builder.Grow(300 * (len(items) + 1))
	builder.WriteString(`{"code":0,"message":"success","next_marker":"`)
	builder.WriteString(next_marker)
	builder.WriteString(`","items":[`)
	var max = len(items)
	var value = gjson.Result{}

	var file_time = time.Now()
	var file_size = int64(0)
	var file_icon = ""
	var category = ""
	var ext = ""
	var status = ""
	for i := 0; i < max; i++ {
		value = items[i]

		file_time = value.Get("updated_at").Time()
		file_size = value.Get("size").Int()
		category = value.Get("category").String()
		file_icon = "folder"
		if value.Get("type").String() != "folder" {
			file_icon = category
		}

		if category == "others" || category == "doc" {
			ext = value.Get("file_extension").String()
			if strings.Index(";.3gp.3iv.asf.avi.cpk.divx.dv.hdv.fli.flv.f4v.f4p.h264.i263.m2t.m2ts.mts.ts.trp.m4v.mkv.mov.mp2.mp4.mpeg.mpg.mpg2.mpg4.nsv.nut.nuv.rm.rmvb.vcd.vob.webm.wmv.mk3d.hevc.yuv.y4m.iso.", ext) > 0 {
				file_icon = "video"
			} else if file_size < 102400 {
				if strings.Index(";.c.cpp.java.htm.html.css.js.vue.php.aspx.shtml.asp.jsp.json.url.txt.md.markdown.xml.md5.ini.nfo.info.config.cfg.bat.sh.cmd.log.debug.go.lrc.", ext) > 0 {
					file_icon = "txt"
				}
			}
		}
		if strings.Index(";.zip.rar.", ext) > 0 {
			file_icon = "zip"
		}
		if file_icon != "folder" && file_icon != "image" && file_icon != "video" && file_icon != "audio" && file_icon != "txt" && file_icon != "zip" {
			file_icon = "file"
		}
		status = value.Get("status").String()
		if value.Get("thumbnail").Exists() && strings.Index(value.Get("thumbnail").String(), "illegal_thumbnail") > 0 {
			status = "illegal"
		}

		builder.WriteString(`{"key":"`)
		builder.WriteString(value.Get("file_id").String())
		builder.WriteString(`","name":"`)
		builder.WriteString(utils.ToJSONString(value.Get("name").String()))
		builder.WriteString(`","pid":"`)
		builder.WriteString(value.Get("parent_file_id").String())
		builder.WriteString(`","size":`)
		builder.WriteString(strconv.FormatInt(file_size, 10))
		builder.WriteString(`,"time":`)
		builder.WriteString(strconv.FormatInt(file_time.Unix(), 10))
		builder.WriteString(`,"type":"`)
		builder.WriteString(value.Get("type").String())
		builder.WriteString(`","sizestr":"`)
		builder.WriteString(utils.FormateSizeString(file_size))
		builder.WriteString(`","timestr":"`)
		builder.WriteString(file_time.Format("2006 01-02"))
		builder.WriteString(`","icon":"`)
		builder.WriteString(file_icon)
		builder.WriteString(`","starred":`)
		builder.WriteString(strconv.FormatBool(value.Get("starred").Bool()))
		builder.WriteString(`,"status":"`)
		builder.WriteString(status)

		if i >= (max - 1) {
			builder.WriteString(`"}`)
		} else {
			builder.WriteString(`"},`)
		}
	}
	builder.WriteString(`]}`)
	return builder.String()
}

func ApiDirList(boxid string, parentid string) (retjsonstr string) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiDirListError ", " error=", errr)
			retjsonstr = `{"code":503,"message":"error","next_marker":"","items":[]}`
		}
	}()

	var apiurl = "https://api.aliyundrive.com/v2/file/list"

	var postjson = map[string]interface{}{"drive_id": boxid,
		"parent_file_id":  parentid,
		"limit":           100,
		"all":             false,
		"fields":          "thumbnail",
		"order_by":        "name",
		"order_direction": "ASC"}
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
		return `{"code":503,"message":"error","next_marker":"","items":[]}`
	}
	info := gjson.Parse(body)
	next_marker := info.Get("next_marker").String()
	items := info.Get("items").Array()
	var builder strings.Builder
	builder.Grow(300 * (len(items) + 1))
	builder.WriteString(`{"code":0,"message":"success","next_marker":"`)
	builder.WriteString(next_marker)
	builder.WriteString(`","items":[`)
	var max = len(items)
	var value = gjson.Result{}

	var file_time = time.Now()
	var file_size = int64(0)
	var file_icon = "folder"
	for i := 0; i < max; i++ {
		value = items[i]
		if value.Get("type").String() == "folder" {
			file_time = value.Get("updated_at").Time()
			file_size = value.Get("size").Int()

			builder.WriteString(`{"key":"`)
			builder.WriteString(value.Get("file_id").String())
			builder.WriteString(`","name":"`)
			builder.WriteString(utils.ToJSONString(value.Get("name").String()))
			builder.WriteString(`","pid":"`)
			builder.WriteString(value.Get("parent_file_id").String())
			builder.WriteString(`","size":`)
			builder.WriteString(strconv.FormatInt(file_size, 10))
			builder.WriteString(`,"time":`)
			builder.WriteString(strconv.FormatInt(file_time.Unix(), 10))
			builder.WriteString(`,"type":"`)
			builder.WriteString(value.Get("type").String())
			builder.WriteString(`","sizestr":"`)
			builder.WriteString(utils.FormateSizeString(file_size))
			builder.WriteString(`","timestr":"`)
			builder.WriteString(file_time.Format("2006 01-02"))
			builder.WriteString(`","icon":"`)
			builder.WriteString(file_icon)
			builder.WriteString(`","starred":`)
			builder.WriteString(strconv.FormatBool(value.Get("starred").Bool()))
			builder.WriteString(`,"status":"`)
			builder.WriteString(value.Get("status").String())

			builder.WriteString(`"},`)
		}
	}

	builder.WriteString(`{"key":"break"}`)
	builder.WriteString(`]}`)
	return builder.String()
}
func ApiFavorFileList(boxid string, marker string) (retjsonstr string) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiFileListError ", " error=", errr)
			retjsonstr = `{"code":503,"message":"error","next_marker":"","items":[]}`
		}
	}()

	//https://api.aliyundrive.com/v2/file/list_by_custom_index_key
	//{"custom_index_key":"starred_yes","parent_file_id":"root","drive_id":"9999999","fields":"*","image_thumbnail_process":"image/resize,w_160/format,jpeg","image_url_process":"image/resize,w_1920/format,jpeg","video_thumbnail_process":"video/snapshot,t_0,f_jpg,ar_auto,w_300","order_by":"name","order_direction":"DESC"}

	var apiurl = "https://api.aliyundrive.com/v2/file/list_by_custom_index_key"

	var postjson = map[string]interface{}{"drive_id": boxid,
		"custom_index_key": "starred_yes",
		"parent_file_id":   "root",
		"limit":            100,
		"fields":           "thumbnail",
		"order_by":         "name",
		"order_direction":  "ASC"}
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
		return `{"code":503,"message":"error","next_marker":"","items":[]}`
	}
	info := gjson.Parse(body)
	next_marker := info.Get("next_marker").String()
	items := info.Get("items").Array()
	var builder strings.Builder
	builder.Grow(300 * (len(items) + 1))
	builder.WriteString(`{"code":0,"message":"success","next_marker":"`)
	builder.WriteString(next_marker)
	builder.WriteString(`","items":[`)
	var max = len(items)
	var value = gjson.Result{}

	var file_time = time.Now()
	var file_size = int64(0)
	var file_icon = ""
	var category = ""
	var ext = ""
	var status = ""
	for i := 0; i < max; i++ {
		value = items[i]

		file_time = value.Get("updated_at").Time()
		file_size = value.Get("size").Int()
		category = value.Get("category").String()
		file_icon = "folder"
		if value.Get("type").String() != "folder" {
			file_icon = category
		}

		if category == "others" || category == "doc" {
			ext = strings.ToLower(value.Get("file_extension").String())
			if strings.Index(";.3gp.3iv.asf.avi.cpk.divx.dv.hdv.fli.flv.f4v.f4p.h264.i263.m2t.m2ts.mts.ts.trp.m4v.mkv.mov.mp2.mp4.mpeg.mpg.mpg2.mpg4.nsv.nut.nuv.rm.rmvb.vcd.vob.webm.wmv.mk3d.hevc.yuv.y4m.iso.", ext) > 0 {
				file_icon = "video"
			} else if file_size < 102400 {
				if strings.Index(";.c.cpp.java.htm.html.css.js.vue.php.aspx.shtml.asp.jsp.json.url.txt.md.markdown.xml.md5.ini.nfo.info.config.cfg.bat.sh.cmd.log.debug.go.lrc.", ext) > 0 {
					file_icon = "txt"
				}
			}
		}
		if strings.Index(";.zip.rar.", ext) > 0 {
			file_icon = "zip"
		}
		if file_icon != "folder" && file_icon != "image" && file_icon != "video" && file_icon != "audio" && file_icon != "txt" && file_icon != "zip" {
			file_icon = "file"
		}

		status = value.Get("status").String()
		if value.Get("thumbnail").Exists() && strings.Index(value.Get("thumbnail").String(), "illegal_thumbnail") > 0 {
			status = "illegal"
		}

		builder.WriteString(`{"key":"`)
		builder.WriteString(value.Get("file_id").String())
		builder.WriteString(`","name":"`)
		builder.WriteString(utils.ToJSONString(value.Get("name").String()))
		builder.WriteString(`","pid":"`)
		builder.WriteString(value.Get("parent_file_id").String())
		builder.WriteString(`","size":`)
		builder.WriteString(strconv.FormatInt(file_size, 10))
		builder.WriteString(`,"time":`)
		builder.WriteString(strconv.FormatInt(file_time.Unix(), 10))
		builder.WriteString(`,"type":"`)
		builder.WriteString(value.Get("type").String())
		builder.WriteString(`","sizestr":"`)
		builder.WriteString(utils.FormateSizeString(file_size))
		builder.WriteString(`","timestr":"`)
		builder.WriteString(file_time.Format("2006 01-02"))
		builder.WriteString(`","icon":"`)
		builder.WriteString(file_icon)
		builder.WriteString(`","starred":`)
		builder.WriteString(strconv.FormatBool(value.Get("starred").Bool()))
		builder.WriteString(`,"status":"`)
		builder.WriteString(status)

		if i >= (max - 1) {
			builder.WriteString(`"}`)
		} else {
			builder.WriteString(`"},`)
		}
	}
	builder.WriteString(`]}`)
	return builder.String()
}
func ApiTrashFileList(boxid string, marker string) (retjsonstr string) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiTrashFileListError ", " error=", errr)
			retjsonstr = `{"code":503,"message":"error","next_marker":"","items":[]}`
		}
	}()
	//https://api.aliyundrive.com/v2/recyclebin/list
	//{"drive_id":"9999999","limit":100,"image_thumbnail_process":"image/resize,w_160/format,jpeg","image_url_process":"image/resize,w_1920/format,jpeg","video_thumbnail_process":"video/snapshot,t_0,f_jpg,ar_auto,w_300","order_by":"name","order_direction":"DESC"}

	var apiurl = "https://api.aliyundrive.com/v2/recyclebin/list"

	var postjson = map[string]interface{}{"drive_id": boxid,
		"limit":           100,
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
		return `{"code":503,"message":"error","next_marker":"","items":[]}`
	}
	info := gjson.Parse(body)
	next_marker := info.Get("next_marker").String()
	items := info.Get("items").Array()
	var builder strings.Builder
	builder.Grow(300 * (len(items) + 1))
	builder.WriteString(`{"code":0,"message":"success","next_marker":"`)
	builder.WriteString(next_marker)
	builder.WriteString(`","items":[`)
	var max = len(items)
	var value = gjson.Result{}

	var file_time = time.Now()
	var file_size = int64(0)
	var file_icon = ""
	var category = ""
	var ext = ""
	var status = ""
	for i := 0; i < max; i++ {
		value = items[i]

		file_time = value.Get("trashed_at").Time()
		file_size = value.Get("size").Int()
		category = value.Get("category").String()
		file_icon = "folder"
		if value.Get("type").String() != "folder" {
			file_icon = category
		}
		ext = value.Get("file_extension").String()
		if category == "others" || category == "doc" {
			if strings.Index(";.3gp.3iv.asf.avi.cpk.divx.dv.hdv.fli.flv.f4v.f4p.h264.i263.m2t.m2ts.mts.ts.trp.m4v.mkv.mov.mp2.mp4.mpeg.mpg.mpg2.mpg4.nsv.nut.nuv.rm.rmvb.vcd.vob.webm.wmv.mk3d.hevc.yuv.y4m.iso.", ext) > 0 {
				file_icon = "video"
			} else if file_size < 102400 {
				if strings.Index(";.c.cpp.java.htm.html.css.js.vue.php.aspx.shtml.asp.jsp.json.url.txt.md.markdown.xml.md5.ini.nfo.info.config.cfg.bat.sh.cmd.log.debug.go.lrc.", ext) > 0 {
					file_icon = "txt"
				}
			}
		}
		if strings.Index(";.zip.rar.", ext) > 0 {
			file_icon = "zip"
		}
		if file_icon != "folder" && file_icon != "image" && file_icon != "video" && file_icon != "audio" && file_icon != "txt" && file_icon != "zip" {
			file_icon = "file"
		}

		status = value.Get("status").String()
		if value.Get("thumbnail").Exists() && strings.Index(value.Get("thumbnail").String(), "illegal_thumbnail") > 0 {
			status = "illegal"
		}

		builder.WriteString(`{"key":"`)
		builder.WriteString(value.Get("file_id").String())
		builder.WriteString(`","name":"`)
		builder.WriteString(utils.ToJSONString(value.Get("name").String()))
		builder.WriteString(`","pid":"`)
		builder.WriteString(value.Get("parent_file_id").String())
		builder.WriteString(`","size":`)
		builder.WriteString(strconv.FormatInt(file_size, 10))
		builder.WriteString(`,"time":`)
		builder.WriteString(strconv.FormatInt(file_time.Unix(), 10))
		builder.WriteString(`,"type":"`)
		builder.WriteString(value.Get("type").String())
		builder.WriteString(`","sizestr":"`)
		builder.WriteString(utils.FormateSizeString(file_size))
		builder.WriteString(`","timestr":"`)
		builder.WriteString(file_time.Format("2006 01-02"))
		builder.WriteString(`","icon":"`)
		builder.WriteString(file_icon)
		builder.WriteString(`","starred":`)
		builder.WriteString(strconv.FormatBool(value.Get("starred").Bool()))
		builder.WriteString(`,"status":"`)
		builder.WriteString(status)

		if i >= (max - 1) {
			builder.WriteString(`"}`)
		} else {
			builder.WriteString(`"},`)
		}
	}
	builder.WriteString(`]}`)
	return builder.String()
}

func ApiCreatForder(boxid string, parentid string, name string) (retjsonstr string) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiCreatForderError ", " error=", errr)
			retjsonstr = utils.ToSuccessJSON2("file_id", "", "file_name", "")
		}
	}()
	var apiurl = "https://api.aliyundrive.com/v2/file/create"

	var postjson = map[string]interface{}{"drive_id": boxid,
		"parent_file_id":  parentid,
		"name":            name,
		"check_name_mode": "refuse",
		"type":            "folder"}

	b, _ := json.Marshal(postjson)
	postdata := string(b)

	code, _, body := utils.PostHTTPString(apiurl, GetAuthorization(), postdata)
	if code == 401 {
		//UserAccessToken 失效了，尝试刷新一次
		ApiTokenRefresh("")
		//刷新完了，重新尝试一遍
		code, _, body = utils.PostHTTPString(apiurl, GetAuthorization(), postdata)
	}
	if code != 201 || !gjson.Valid(body) { //注意这里是201
		return utils.ToErrorMessageJSON("创建文件夹失败")
	}
	info := gjson.Parse(body)
	file_id := info.Get("file_id").String()
	file_name := info.Get("file_name").String() //注意这里是file_name
	if len(file_id) < 20 {
		return utils.ToErrorMessageJSON("创建文件夹失败")
	}
	return utils.ToSuccessJSON2("file_id", file_id, "file_name", file_name)
}

func ApiUncompress(boxid string, file_id string, target_file_id string, password string) (retjsonstr string) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiUncompressError ", " error=", errr)
			retjsonstr = utils.ToErrorMessageJSON("解压缩失败：程序出错")
		}
	}()

	var apiurl = "https://api.aliyundrive.com/v2/file/get"

	var postjson = map[string]interface{}{"drive_id": boxid,
		"file_id": file_id}

	b, _ := json.Marshal(postjson)
	postdata := string(b)

	code, _, body := utils.PostHTTPString(apiurl, GetAuthorization(), postdata)
	if code == 401 {
		//UserAccessToken 失效了，尝试刷新一次
		ApiTokenRefresh("")
		//刷新完了，重新尝试一遍
		code, _, body = utils.PostHTTPString(apiurl, GetAuthorization(), postdata)
	}
	if code != 200 || !gjson.Valid(body) {
		return utils.ToErrorMessageJSON("获取文件信息失败")
	}
	info := gjson.Parse(body)
	domain_id := info.Get("domain_id").String()
	drive_id := info.Get("drive_id").String()
	file_extension := info.Get("file_extension").String()
	apiurl = "https://api.aliyundrive.com/v2/archive/uncompress"
	//{"drive_id":"9999999","file_id":"60c4caff927ef76afef1454e9ac6b5d57ec9d1e1","domain_id":"bj29","target_drive_id":"9999999","target_file_id":"60c3462fb1abcdd8c6e54de69843a26155e069c7","archive_type":"rar","password":"123456"}
	//202 {"state":"Running","task_id":"666ccf683eb915b372c82126cb2b4e90"}
	//403 {"code":"InvalidPassword","message":"Password is invalid"}
	postjson = map[string]interface{}{"drive_id": drive_id,
		"file_id":         file_id,
		"domain_id":       domain_id,
		"target_drive_id": drive_id, //只支持保存在网盘内，不支持保险箱
		"target_file_id":  target_file_id,
		"archive_type":    file_extension}
	if password != "" {
		postjson["password"] = password
	}
	b, _ = json.Marshal(postjson)
	postdata = string(b)

	code, _, body = utils.PostHTTPString(apiurl, GetAuthorization(), postdata)
	if code == 401 {
		//UserAccessToken 失效了，尝试刷新一次
		ApiTokenRefresh("")
		//刷新完了，重新尝试一遍
		code, _, body = utils.PostHTTPString(apiurl, GetAuthorization(), postdata)
	}
	if code != 202 && code != 400 && code != 500 || !gjson.Valid(body) { //注意这里是202
		return utils.ToErrorMessageJSON("创建解压缩任务失败")
	}
	info = gjson.Parse(body)
	if info.Get("state").Exists() {
		state := info.Get("state").String()
		task_id := info.Get("task_id").String()
		return utils.ToSuccessJSON4("state", state, "task_id", task_id, "domain_id", domain_id, "file_id", file_id)
	} else {
		message := info.Get("message").String()
		if message == "Password is invalid" {
			message = "解压密码错误"
		}
		if strings.Index(message, "ArchiveTypeNotSupported") > 0 {
			message = "不支持解压" + file_extension
		}
		if strings.Index(message, "some unknown error") > 0 {
			message = "解压时发生未知错误无法解压"
		}
		return utils.ToErrorMessageJSON("解压缩失败：" + message)
	}
}

func ApiUncompressCheck(boxid string, domain_id, file_id, task_id string) (retjsonstr string) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiUncompressCheckError ", " error=", errr)
			retjsonstr = utils.ToErrorMessageJSON("获取解压进度失败")
		}
	}()

	var apiurl = "https://api.aliyundrive.com/v2/archive/status"
	//{"drive_id":"9999999","domain_id":"bj29","file_id":"60c4ca099c494a23bae74349a7396c270b354c20","task_id":"220812f78dbd8375a7cad6d9c46102ef"}
	//200 {"state":"Running","file_list":{},"task_id":"220812f78dbd8375a7cad6d9c46102ef","progress":0}

	var postjson = map[string]interface{}{"drive_id": boxid,
		"domain_id": domain_id,
		"file_id":   file_id,
		"task_id":   task_id,
	}

	b, _ := json.Marshal(postjson)
	postdata := string(b)

	code, _, body := utils.PostHTTPString(apiurl, GetAuthorization(), postdata)
	if code == 401 {
		//UserAccessToken 失效了，尝试刷新一次
		ApiTokenRefresh("")
		//刷新完了，重新尝试一遍
		code, _, body = utils.PostHTTPString(apiurl, GetAuthorization(), postdata)
	}
	if code != 200 && code != 400 && code != 500 || !gjson.Valid(body) {
		return utils.ToErrorMessageJSON("获取解压缩进度失败")
	}
	info := gjson.Parse(body)

	if info.Get("state").Exists() {
		state := info.Get("state").String()
		progress := info.Get("progress").Int()
		return utils.ToSuccessJSON4("state", state, "progress", progress, "task_id", task_id, "file_id", file_id)
	} else {
		message := info.Get("message").String()
		if message == "Password is invalid" {
			message = "解压密码错误"
		}
		if strings.Index(message, "some unknown error") > 0 {
			message = "解压时发生未知错误无法解压"
		}
		return utils.ToErrorMessageJSON("解压缩失败：" + message)
	}
}

//https://api.aliyundrive.com/v2/archive/uncompress

func ApiRename(boxid string, file_id string, name string) (retjsonstr string) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiRenameError ", " error=", errr)
			retjsonstr = utils.ToSuccessJSON2("file_id", "", "file_name", "")
		}
	}()
	//https://api.aliyundrive.com/v2/file/update
	//{"drive_id":"9999999","file_id":"60a9265d37316002699a4d7285d2aa9ced3b6d2c","name":"ffffff222","check_name_mode":"refuse"}
	var apiurl = "https://api.aliyundrive.com/v2/file/update"

	var postjson = map[string]interface{}{"drive_id": boxid,
		"file_id":         file_id,
		"name":            name,
		"check_name_mode": "refuse"}

	b, _ := json.Marshal(postjson)
	postdata := string(b)

	code, _, body := utils.PostHTTPString(apiurl, GetAuthorization(), postdata)
	if code == 401 {
		//UserAccessToken 失效了，尝试刷新一次
		ApiTokenRefresh("")
		//刷新完了，重新尝试一遍
		code, _, body = utils.PostHTTPString(apiurl, GetAuthorization(), postdata)
	}
	if code != 200 || !gjson.Valid(body) {
		return utils.ToErrorMessageJSON("重命名失败")
	}
	info := gjson.Parse(body)
	file_id = info.Get("file_id").String()
	file_name := info.Get("name").String()
	if len(file_id) < 20 {
		return utils.ToErrorMessageJSON("重命名失败")
	}
	return utils.ToSuccessJSON2("file_id", file_id, "file_name", file_name)
}
func ApiRenameBatch(boxid string, keylist []string, namelist []string) (retjsonstr string) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiRenameBatchError ", " error=", errr)
			retjsonstr = utils.ToSuccessJSON2("count", 0, "error", len(keylist))
		}
	}()
	//https://api.aliyundrive.com/v2/recyclebin/trash   {"drive_id":"9999999","file_id":"60a92692849dfed0c585482fa71aecd2e790ba64"}
	//https://api.aliyundrive.com/v2/batch {"requests":[{"body":{"drive_id":"9999999","file_id":"60a9276610ca470f2289432cada6e8336ba81e4a"},"headers":{"Content-Type":"application/json"},"id":"60a9276610ca470f2289432cada6e8336ba81e4a","method":"POST","url":"/recyclebin/trash"},{"body":{"drive_id":"9999999","file_id":"60a9275b7a25fc02f7e84f5ca170d8b0fc030878"},"headers":{"Content-Type":"application/json"},"id":"60a9275b7a25fc02f7e84f5ca170d8b0fc030878","method":"POST","url":"/recyclebin/trash"}],"resource":"file"}
	//删除文件是204 删除文件夹是202

	var postdata = `{"requests":[`
	var max = len(keylist) - 1
	var add = 0

	var blist = make([]string, 0)
	for i := 0; i < len(keylist); i++ {
		postdata += `{"body":{"drive_id":"` + boxid + `","file_id":"` + keylist[i] + `","name":"` + utils.ToJSONString(namelist[i]) + `","check_name_mode":"refuse"},"headers":{"Content-Type":"application/json"},"id":"` + keylist[i] + `","method":"POST","url":"/file/update"}`
		add++
		if add == 90 && i < max {
			postdata += `],"resource":"file"}`
			blist = append(blist, postdata)
			postdata = `{"requests":[`
			add = 0
		} else if i < max {
			postdata += ","
		}
	}
	postdata += `],"resource":"file"}`

	blist = append(blist, postdata)
	count := _RunBatch(blist)

	return utils.ToSuccessJSON2("count", count, "error", len(keylist)-int(count))
}

func ApiFavor(boxid string, file_id string, isfavor bool) (retjsonstr string) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiFavorError ", " error=", errr)
			retjsonstr = utils.ToSuccessJSON2("file_id", "", "file_name", "")
		}
	}()
	//https://api.aliyundrive.com/v2/file/update
	//收藏{"custom_index_key":"starred_yes","drive_id":"9999999","file_id":"60a9265d37316002699a4d7285d2aa9ced3b6d2c","starred":true}
	//取消收藏{"custom_index_key":"","drive_id":"9999999","file_id":"60a9265d37316002699a4d7285d2aa9ced3b6d2c","starred":false}

	var apiurl = "https://api.aliyundrive.com/v2/file/update"

	var postjson = map[string]interface{}{"drive_id": boxid,
		"custom_index_key": "starred_yes",
		"file_id":          file_id,
		"starred":          true}
	if !isfavor {
		postjson = map[string]interface{}{"drive_id": boxid,
			"custom_index_key": "",
			"file_id":          file_id,
			"starred":          false}
	}

	b, _ := json.Marshal(postjson)
	postdata := string(b)

	code, _, body := utils.PostHTTPString(apiurl, GetAuthorization(), postdata)
	if code == 401 {
		//UserAccessToken 失效了，尝试刷新一次
		ApiTokenRefresh("")
		//刷新完了，重新尝试一遍
		code, _, body = utils.PostHTTPString(apiurl, GetAuthorization(), postdata)
	}
	if code != 200 || !gjson.Valid(body) {
		return utils.ToErrorMessageJSON("收藏失败")
	}
	info := gjson.Parse(body)
	file_id = info.Get("file_id").String()
	file_name := info.Get("name").String()
	if len(file_id) < 20 {
		return utils.ToErrorMessageJSON("收藏失败")
	}
	return utils.ToSuccessJSON2("file_id", file_id, "file_name", file_name)
}
func ApiTrashBatch(boxid string, filelist []string) (retjsonstr string) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiTrashBatchError ", " error=", errr)
			retjsonstr = utils.ToSuccessJSON2("count", 0, "error", len(filelist))
		}
	}()
	//https://api.aliyundrive.com/v2/recyclebin/trash   {"drive_id":"9999999","file_id":"60a92692849dfed0c585482fa71aecd2e790ba64"}
	//https://api.aliyundrive.com/v2/batch {"requests":[{"body":{"drive_id":"9999999","file_id":"60a9276610ca470f2289432cada6e8336ba81e4a"},"headers":{"Content-Type":"application/json"},"id":"60a9276610ca470f2289432cada6e8336ba81e4a","method":"POST","url":"/recyclebin/trash"},{"body":{"drive_id":"9999999","file_id":"60a9275b7a25fc02f7e84f5ca170d8b0fc030878"},"headers":{"Content-Type":"application/json"},"id":"60a9275b7a25fc02f7e84f5ca170d8b0fc030878","method":"POST","url":"/recyclebin/trash"}],"resource":"file"}
	//删除文件是204 删除文件夹是202

	var postdata = `{"requests":[`
	var max = len(filelist) - 1
	var add = 0

	var blist = make([]string, 0)
	for i := 0; i < len(filelist); i++ {
		postdata += `{"body":{"drive_id":"` + boxid + `","file_id":"` + filelist[i] + `"},"headers":{"Content-Type":"application/json"},"id":"` + filelist[i] + `","method":"POST","url":"/recyclebin/trash"}`
		add++
		if add == 90 && i < max {
			postdata += `],"resource":"file"}`
			blist = append(blist, postdata)
			postdata = `{"requests":[`
			add = 0
		} else if i < max {
			postdata += ","
		}
	}
	postdata += `],"resource":"file"}`

	blist = append(blist, postdata)
	count := _RunBatch(blist)

	return utils.ToSuccessJSON2("count", count, "error", len(filelist)-int(count))
}

func ApiFavorBatch(boxid string, filelist []string, isfavor bool) (retjsonstr string) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiFavorBatchError ", " error=", errr)
			retjsonstr = utils.ToSuccessJSON2("count", 0, "error", len(filelist))
		}
	}()
	//https://api.aliyundrive.com/v2/recyclebin/trash   {"drive_id":"9999999","file_id":"60a92692849dfed0c585482fa71aecd2e790ba64"}
	//https://api.aliyundrive.com/v2/batch {"requests":[{"body":{"drive_id":"9999999","file_id":"60a9276610ca470f2289432cada6e8336ba81e4a"},"headers":{"Content-Type":"application/json"},"id":"60a9276610ca470f2289432cada6e8336ba81e4a","method":"POST","url":"/recyclebin/trash"},{"body":{"drive_id":"9999999","file_id":"60a9275b7a25fc02f7e84f5ca170d8b0fc030878"},"headers":{"Content-Type":"application/json"},"id":"60a9275b7a25fc02f7e84f5ca170d8b0fc030878","method":"POST","url":"/recyclebin/trash"}],"resource":"file"}
	//返回200

	var postdata = `{"requests":[`
	var max = len(filelist) - 1
	var add = 0

	var blist = make([]string, 0)
	for i := 0; i < len(filelist); i++ {

		var favdata = `{"body":{"drive_id":"` + boxid + `","file_id":"` + filelist[i] + `","custom_index_key":"starred_yes","starred":true},"headers":{"Content-Type":"application/json"},"id":"` + filelist[i] + `","method":"POST","url":"/file/update"}`
		if !isfavor {
			favdata = `{"body":{"drive_id":"` + boxid + `","file_id":"` + filelist[i] + `","custom_index_key":"","starred":false},"headers":{"Content-Type":"application/json"},"id":"` + filelist[i] + `","method":"POST","url":"/file/update"}`
		}
		postdata += favdata
		add++
		if add == 90 && i < max {
			postdata += `],"resource":"file"}`
			blist = append(blist, postdata)
			postdata = `{"requests":[`
			add = 0
		} else if i < max {
			postdata += ","
		}
	}
	postdata += `],"resource":"file"}`

	blist = append(blist, postdata)
	count := _RunBatch(blist)

	return utils.ToSuccessJSON2("count", count, "error", len(filelist)-int(count))
}

func ApiMoveBatch(boxid string, filelist []string, movetobox, movetoid string) (retjsonstr string) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiMoveBatchError ", " error=", errr)
			retjsonstr = utils.ToSuccessJSON2("count", 0, "error", len(filelist))
		}
	}()
	//https://api.aliyundrive.com/v2/batch
	//{"requests":[{"body":{"drive_id":"9999999","file_id":"60a9265d37316002699a4d7285d2aa9ced3b6d2c","to_parent_file_id":"60a937763fb6e0e751004ffcb1bb5168bd490ae4"},"headers":{"Content-Type":"application/json"},"id":"60a9265d37316002699a4d7285d2aa9ced3b6d2c","method":"POST","url":"/file/move"}],"resource":"file"}
	//移动文件 返回值200

	var postdata = `{"requests":[`
	var max = len(filelist) - 1
	var add = 0

	var blist = make([]string, 0)
	for i := 0; i < len(filelist); i++ {
		if boxid == movetobox {
			postdata += `{"body":{"drive_id":"` + boxid + `","file_id":"` + filelist[i] + `","to_parent_file_id":"` + movetoid + `"},"headers":{"Content-Type":"application/json"},"id":"` + filelist[i] + `","method":"POST","url":"/file/move"}`
		} else {
			postdata += `{"body":{"drive_id":"` + boxid + `","file_id":"` + filelist[i] + `","to_drive_id":"` + movetobox + `","to_parent_file_id":"` + movetoid + `"},"headers":{"Content-Type":"application/json"},"id":"` + filelist[i] + `","method":"POST","url":"/file/move"}`
		}
		add++
		if add == 90 && i < max {
			postdata += `],"resource":"file"}`
			blist = append(blist, postdata)
			postdata = `{"requests":[`
			add = 0
		} else if i < max {
			postdata += ","
		}
	}
	postdata += `],"resource":"file"}`

	blist = append(blist, postdata)
	count := _RunBatch(blist)

	return utils.ToSuccessJSON2("count", count, "error", len(filelist)-int(count))
}

func ApiTrashDeleteBatch(boxid string, filelist []string) (retjsonstr string) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiTrashDeleteBatchError ", " error=", errr)
			retjsonstr = utils.ToSuccessJSON2("count", 0, "error", len(filelist))
		}
	}()
	//{"requests":[{"body":{"drive_id":"9999999","file_id":"60a5bb43bf60766feada4eca9d0da23a501eb7c8"},"headers":{"Content-Type":"application/json"},"id":"60a5bb43bf60766feada4eca9d0da23a501eb7c8","method":"POST","url":"/file/delete"}],"resource":"file"}
	//彻底删除返回204 202

	var postdata = `{"requests":[`
	var max = len(filelist) - 1
	var add = 0

	var blist = make([]string, 0)
	for i := 0; i < len(filelist); i++ {
		postdata += `{"body":{"drive_id":"` + boxid + `","file_id":"` + filelist[i] + `"},"headers":{"Content-Type":"application/json"},"id":"` + filelist[i] + `","method":"POST","url":"/file/delete"}`
		add++
		if add == 90 && i < max {
			postdata += `],"resource":"file"}`
			blist = append(blist, postdata)
			postdata = `{"requests":[`
			add = 0
		} else if i < max {
			postdata += ","
		}
	}
	postdata += `],"resource":"file"}`

	blist = append(blist, postdata)
	count := _RunBatch(blist)

	return utils.ToSuccessJSON2("count", count, "error", len(filelist)-int(count))
}
func ApiTrashRestoreBatch(boxid string, filelist []string) (retjsonstr string) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiTrashRestoreBatchError ", " error=", errr)
			retjsonstr = utils.ToSuccessJSON2("count", 0, "error", len(filelist))
		}
	}()
	//{"requests":[{"body":{"drive_id":"9999999","file_id":"60a5bb4394b2ad243fb84509a576506afc890397"},"headers":{"Content-Type":"application/json"},"id":"60a5bb4394b2ad243fb84509a576506afc890397","method":"POST","url":"/recyclebin/restore"}],"resource":"file"}
	//恢复文件返回204 202

	var postdata = `{"requests":[`
	var max = len(filelist) - 1
	var add = 0

	var blist = make([]string, 0)
	for i := 0; i < len(filelist); i++ {
		postdata += `{"body":{"drive_id":"` + boxid + `","file_id":"` + filelist[i] + `"},"headers":{"Content-Type":"application/json"},"id":"` + filelist[i] + `","method":"POST","url":"/recyclebin/restore"}`
		add++
		if add == 90 && i < max {
			postdata += `],"resource":"file"}`
			blist = append(blist, postdata)
			postdata = `{"requests":[`
			add = 0
		} else if i < max {
			postdata += ","
		}
	}
	postdata += `],"resource":"file"}`

	blist = append(blist, postdata)
	count := _RunBatch(blist)

	return utils.ToSuccessJSON2("count", count, "error", len(filelist)-int(count))
}

func _RunBatch(blist []string) (count int32) {
	count = 0
	var wg sync.WaitGroup
	for b := 0; b < len(blist); b++ {
		wg.Add(1)
		go func(b int) {
			add := _Batch(blist[b])
			atomic.AddInt32(&count, add)
			defer wg.Done()
		}(b)
	}
	wg.Wait()
	return count
}

var HTTPTOTAL = make(chan struct{}, 5) //batch操作不能太快
func _Batch(postdata string) (count int32) {
	defer func() {
		<-HTTPTOTAL //读取，执行完读取1次，让下一个请求可以执行
		if errr := recover(); errr != nil {
			log.Println("_BatchError ", " error=", errr)
			count = 0
		}
	}()
	HTTPTOTAL <- struct{}{} //写入，如果已经写入了5次，就会在这里阻塞住
	var apiurl = "https://api.aliyundrive.com/v2/batch"
	code, _, body := utils.PostHTTPString(apiurl, GetAuthorization(), postdata)
	if code == 401 {
		//UserAccessToken 失效了，尝试刷新一次
		ApiTokenRefresh("")
		//刷新完了，重新尝试一遍
		code, _, body = utils.PostHTTPString(apiurl, GetAuthorization(), postdata)
	}
	if code != 200 || !gjson.Valid(body) {
		return 0
	}
	info := gjson.Parse(body)
	count = 0
	info.Get("responses").ForEach(func(key, value gjson.Result) bool {
		var status = value.Get("status").Int()
		if status >= 200 && status <= 205 {
			count++
		}
		return true
	})
	return count
}
