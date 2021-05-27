package aliyun

import (
	"aliserver/utils"
	"encoding/json"
	"log"
	"strconv"
	"strings"
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

func ApiFileList(parentid string, marker string) (retjsonstr string) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiFileListError ", " error=", errr)
			retjsonstr = utils.ToSuccessJSON2("next_marker", "", "items", "[]")
		}
	}()

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
		return utils.ToSuccessJSON2("next_marker", "", "items", "[]")
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
			if file_size < 102400 {
				if strings.Index(";.c.cpp.java.htm.html.css.js.vue.php.aspx.shtml.asp.jsp.json.url.txt.md.markdown.xml.md5.ini.nfo.info.config.cfg.bat.sh.cmd.log.debug.go.qrc.lrc.", ext) > 0 {
					file_icon = "txt"
				}
			}
		}
		if file_icon != "folder" && file_icon != "image" && file_icon != "video" && file_icon != "audio" && file_icon != "txt" {
			file_icon = "file"
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
		builder.WriteString(value.Get("status").String())

		if i >= (max - 1) {
			builder.WriteString(`"}`)
		} else {
			builder.WriteString(`"},`)
		}
	}
	builder.WriteString(`]}`)
	return builder.String()
}

func ApiFavorFileList(marker string) (retjsonstr string) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiFileListError ", " error=", errr)
			retjsonstr = utils.ToSuccessJSON2("next_marker", "", "items", "[]")
		}
	}()

	//https://api.aliyundrive.com/v2/file/list_by_custom_index_key
	//{"custom_index_key":"starred_yes","parent_file_id":"root","drive_id":"8699982","fields":"*","image_thumbnail_process":"image/resize,w_160/format,jpeg","image_url_process":"image/resize,w_1920/format,jpeg","video_thumbnail_process":"video/snapshot,t_0,f_jpg,ar_auto,w_300","order_by":"name","order_direction":"DESC"}

	var apiurl = "https://api.aliyundrive.com/v2/file/list_by_custom_index_key"

	var postjson = map[string]interface{}{"drive_id": _user.UserToken.P_default_drive_id,
		"custom_index_key": "starred_yes",
		"parent_file_id":   "root",
		"limit":            1500,
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
		return utils.ToSuccessJSON2("next_marker", "", "items", "[]")
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
			if strings.Index(";.3gp.3iv.asf.avi.cpk.divx.dv.hdv.fli.flv.f4v.f4p.h264.i263.m2t.m2ts.mts.ts.trp.m4v.mkv.mov.mp2.mp4.mpeg.mpg.mpg2.mpg4.nsv.nut.nuv.rm.rmvb.vcd.vob.webm.wmv.mk3d.hevc.yuv.y4m", ext) > 0 {
				file_icon = "video"
			} else if file_size < 102400 {
				if strings.Index(";.c.cpp.java.htm.html.css.js.vue.php.aspx.shtml.asp.jsp.json.url.txt.md.markdown.xml.md5.ini.nfo.info.config.cfg.bat.sh.cmd.log.debug.go.qrc.lrc.", ext) > 0 {
					file_icon = "txt"
				}
			}
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
		builder.WriteString(value.Get("status").String())

		if i >= (max - 1) {
			builder.WriteString(`"}`)
		} else {
			builder.WriteString(`"},`)
		}
	}
	builder.WriteString(`]}`)
	return builder.String()
}
func ApiTrashFileList(marker string) (retjsonstr string) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiTrashFileListError ", " error=", errr)
			retjsonstr = utils.ToSuccessJSON2("next_marker", "", "items", "[]")
		}
	}()
	//https://api.aliyundrive.com/v2/recyclebin/list
	//{"drive_id":"8699982","limit":100,"image_thumbnail_process":"image/resize,w_160/format,jpeg","image_url_process":"image/resize,w_1920/format,jpeg","video_thumbnail_process":"video/snapshot,t_0,f_jpg,ar_auto,w_300","order_by":"name","order_direction":"DESC"}

	var apiurl = "https://api.aliyundrive.com/v2/recyclebin/list"

	var postjson = map[string]interface{}{"drive_id": _user.UserToken.P_default_drive_id,
		"limit":           1500,
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
		return utils.ToSuccessJSON2("next_marker", "", "items", "[]")
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
	for i := 0; i < max; i++ {
		value = items[i]

		file_time = value.Get("trashed_at").Time()
		file_size = value.Get("size").Int()
		category = value.Get("category").String()
		file_icon = "folder"
		if value.Get("type").String() != "folder" {
			file_icon = category
		}

		if category == "others" || category == "doc" {
			ext = value.Get("file_extension").String()
			if file_size < 102400 {
				if strings.Index(";.c.cpp.java.htm.html.css.js.vue.php.aspx.shtml.asp.jsp.json.url.txt.md.markdown.xml.md5.ini.nfo.info.config.cfg.bat.sh.cmd.log.debug.go.qrc.lrc.", ext) > 0 {
					file_icon = "txt"
				}
			}
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
		builder.WriteString(value.Get("status").String())

		if i >= (max - 1) {
			builder.WriteString(`"}`)
		} else {
			builder.WriteString(`"},`)
		}
	}
	builder.WriteString(`]}`)
	return builder.String()
}

func ApiCreatForder(parentid string, name string) (retjsonstr string) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiCreatForderError ", " error=", errr)
			retjsonstr = utils.ToSuccessJSON2("file_id", "", "file_name", "")
		}
	}()
	var apiurl = "https://api.aliyundrive.com/v2/file/create"

	var postjson = map[string]interface{}{"drive_id": _user.UserToken.P_default_drive_id,
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

func ApiRename(file_id string, name string) (retjsonstr string) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiRenameError ", " error=", errr)
			retjsonstr = utils.ToSuccessJSON2("file_id", "", "file_name", "")
		}
	}()
	//https://api.aliyundrive.com/v2/file/update
	//{"drive_id":"8699982","file_id":"60a9265d37316002699a4d7285d2aa9ced3b6d2c","name":"ffffff222","check_name_mode":"refuse"}
	var apiurl = "https://api.aliyundrive.com/v2/file/update"

	var postjson = map[string]interface{}{"drive_id": _user.UserToken.P_default_drive_id,
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

func ApiFavor(file_id string, isfavor bool) (retjsonstr string) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiFavorError ", " error=", errr)
			retjsonstr = utils.ToSuccessJSON2("file_id", "", "file_name", "")
		}
	}()
	//https://api.aliyundrive.com/v2/file/update
	//收藏{"custom_index_key":"starred_yes","drive_id":"8699982","file_id":"60a9265d37316002699a4d7285d2aa9ced3b6d2c","starred":true}
	//取消收藏{"custom_index_key":"","drive_id":"8699982","file_id":"60a9265d37316002699a4d7285d2aa9ced3b6d2c","starred":false}

	var apiurl = "https://api.aliyundrive.com/v2/file/update"

	var postjson = map[string]interface{}{"drive_id": _user.UserToken.P_default_drive_id,
		"custom_index_key": "starred_yes",
		"file_id":          file_id,
		"starred":          true}
	if !isfavor {
		postjson = map[string]interface{}{"drive_id": _user.UserToken.P_default_drive_id,
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
func ApiTrashBatch(filelist []string) (retjsonstr string) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiTrashBatchError ", " error=", errr)
			retjsonstr = utils.ToSuccessJSON2("count", 0, "error", len(filelist))
		}
	}()
	//https://api.aliyundrive.com/v2/recyclebin/trash   {"drive_id":"8699982","file_id":"60a92692849dfed0c585482fa71aecd2e790ba64"}
	//https://api.aliyundrive.com/v2/batch {"requests":[{"body":{"drive_id":"8699982","file_id":"60a9276610ca470f2289432cada6e8336ba81e4a"},"headers":{"Content-Type":"application/json"},"id":"60a9276610ca470f2289432cada6e8336ba81e4a","method":"POST","url":"/recyclebin/trash"},{"body":{"drive_id":"8699982","file_id":"60a9275b7a25fc02f7e84f5ca170d8b0fc030878"},"headers":{"Content-Type":"application/json"},"id":"60a9275b7a25fc02f7e84f5ca170d8b0fc030878","method":"POST","url":"/recyclebin/trash"}],"resource":"file"}
	//删除文件是204 删除文件夹是202
	var apiurl = "https://api.aliyundrive.com/v2/batch"
	var postdata = `{"requests":[`
	var max = len(filelist) - 1
	for i := 0; i < len(filelist); i++ {
		postdata += `{"body":{"drive_id":"` + _user.UserToken.P_default_drive_id + `","file_id":"` + filelist[i] + `"},"headers":{"Content-Type":"application/json"},"id":"` + filelist[i] + `","method":"POST","url":"/recyclebin/trash"}`
		if i < max {
			postdata += ","
		}
	}
	postdata += `],"resource":"file"}`

	code, _, body := utils.PostHTTPString(apiurl, GetAuthorization(), postdata)
	if code == 401 {
		//UserAccessToken 失效了，尝试刷新一次
		ApiTokenRefresh("")
		//刷新完了，重新尝试一遍
		code, _, body = utils.PostHTTPString(apiurl, GetAuthorization(), postdata)
	}
	if code != 200 || !gjson.Valid(body) {
		return utils.ToSuccessJSON2("count", 0, "error", len(filelist))
	}
	info := gjson.Parse(body)
	count := 0
	info.Get("responses").ForEach(func(key, value gjson.Result) bool {
		var status = value.Get("status").Int()
		if status == 202 || status == 203 {
			count++
		}
		return true
	})
	return utils.ToSuccessJSON2("count", count, "error", len(filelist)-count)
}

func ApiFavorBatch(filelist []string, isfavor bool) (retjsonstr string) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiFavorBatchError ", " error=", errr)
			retjsonstr = utils.ToSuccessJSON2("count", 0, "error", len(filelist))
		}
	}()
	//https://api.aliyundrive.com/v2/recyclebin/trash   {"drive_id":"8699982","file_id":"60a92692849dfed0c585482fa71aecd2e790ba64"}
	//https://api.aliyundrive.com/v2/batch {"requests":[{"body":{"drive_id":"8699982","file_id":"60a9276610ca470f2289432cada6e8336ba81e4a"},"headers":{"Content-Type":"application/json"},"id":"60a9276610ca470f2289432cada6e8336ba81e4a","method":"POST","url":"/recyclebin/trash"},{"body":{"drive_id":"8699982","file_id":"60a9275b7a25fc02f7e84f5ca170d8b0fc030878"},"headers":{"Content-Type":"application/json"},"id":"60a9275b7a25fc02f7e84f5ca170d8b0fc030878","method":"POST","url":"/recyclebin/trash"}],"resource":"file"}
	//返回200
	var apiurl = "https://api.aliyundrive.com/v2/batch"
	var postdata = `{"requests":[`
	var max = len(filelist) - 1
	for i := 0; i < len(filelist); i++ {

		var favdata = `{"body":{"drive_id":"` + _user.UserToken.P_default_drive_id + `","file_id":"` + filelist[i] + `","custom_index_key":"starred_yes","starred":true},"headers":{"Content-Type":"application/json"},"id":"` + filelist[i] + `","method":"POST","url":"/file/update"}`
		if !isfavor {
			favdata = `{"body":{"drive_id":"` + _user.UserToken.P_default_drive_id + `","file_id":"` + filelist[i] + `","custom_index_key":"","starred":false},"headers":{"Content-Type":"application/json"},"id":"` + filelist[i] + `","method":"POST","url":"/file/update"}`

		}

		postdata += favdata
		if i < max {
			postdata += ","
		}
	}
	postdata += `],"resource":"file"}`

	code, _, body := utils.PostHTTPString(apiurl, GetAuthorization(), postdata)
	if code == 401 {
		//UserAccessToken 失效了，尝试刷新一次
		ApiTokenRefresh("")
		//刷新完了，重新尝试一遍
		code, _, body = utils.PostHTTPString(apiurl, GetAuthorization(), postdata)
	}
	if code != 200 || !gjson.Valid(body) {
		return utils.ToSuccessJSON2("count", 0, "error", len(filelist))
	}
	info := gjson.Parse(body)
	count := 0
	info.Get("responses").ForEach(func(key, value gjson.Result) bool {
		var status = value.Get("status").Int()
		if status == 200 {
			count++
		}
		return true
	})
	return utils.ToSuccessJSON2("count", count, "error", len(filelist)-count)
}

func ApiMoveBatch(movetoid string, filelist []string) (retjsonstr string) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiMoveBatchError ", " error=", errr)
			retjsonstr = utils.ToSuccessJSON2("count", 0, "error", len(filelist))
		}
	}()
	//https://api.aliyundrive.com/v2/batch
	//{"requests":[{"body":{"drive_id":"8699982","file_id":"60a9265d37316002699a4d7285d2aa9ced3b6d2c","to_parent_file_id":"60a937763fb6e0e751004ffcb1bb5168bd490ae4"},"headers":{"Content-Type":"application/json"},"id":"60a9265d37316002699a4d7285d2aa9ced3b6d2c","method":"POST","url":"/file/move"}],"resource":"file"}
	//移动文件 返回值200
	var apiurl = "https://api.aliyundrive.com/v2/batch"
	var postdata = `{"requests":[`
	var max = len(filelist) - 1
	for i := 0; i < len(filelist); i++ {
		postdata += `{"body":{"drive_id":"` + _user.UserToken.P_default_drive_id + `","file_id":"` + filelist[i] + `","to_parent_file_id":"` + movetoid + `"},"headers":{"Content-Type":"application/json"},"id":"` + filelist[i] + `","method":"POST","url":"/file/move"}`
		if i < max {
			postdata += ","
		}
	}
	postdata += `],"resource":"file"}`

	code, _, body := utils.PostHTTPString(apiurl, GetAuthorization(), postdata)
	if code == 401 {
		//UserAccessToken 失效了，尝试刷新一次
		ApiTokenRefresh("")
		//刷新完了，重新尝试一遍
		code, _, body = utils.PostHTTPString(apiurl, GetAuthorization(), postdata)
	}
	if code != 200 || !gjson.Valid(body) {
		return utils.ToSuccessJSON2("count", 0, "error", len(filelist))
	}
	info := gjson.Parse(body)
	count := 0
	info.Get("responses").ForEach(func(key, value gjson.Result) bool {
		var status = value.Get("status").Int()
		if status == 200 { //重名移动失败时,返回400
			count++
		}
		return true
	})
	return utils.ToSuccessJSON2("count", count, "error", len(filelist)-count)
}

func ApiTrashDeleteBatch(filelist []string) (retjsonstr string) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiTrashDeleteBatchError ", " error=", errr)
			retjsonstr = utils.ToSuccessJSON2("count", 0, "error", len(filelist))
		}
	}()
	//{"requests":[{"body":{"drive_id":"8699982","file_id":"60a5bb43bf60766feada4eca9d0da23a501eb7c8"},"headers":{"Content-Type":"application/json"},"id":"60a5bb43bf60766feada4eca9d0da23a501eb7c8","method":"POST","url":"/file/delete"}],"resource":"file"}
	//彻底删除返回204 202
	var apiurl = "https://api.aliyundrive.com/v2/batch"
	var postdata = `{"requests":[`
	var max = len(filelist) - 1
	for i := 0; i < len(filelist); i++ {
		postdata += `{"body":{"drive_id":"` + _user.UserToken.P_default_drive_id + `","file_id":"` + filelist[i] + `"},"headers":{"Content-Type":"application/json"},"id":"` + filelist[i] + `","method":"POST","url":"/file/delete"}`
		if i < max {
			postdata += ","
		}
	}
	postdata += `],"resource":"file"}`

	code, _, body := utils.PostHTTPString(apiurl, GetAuthorization(), postdata)
	if code == 401 {
		//UserAccessToken 失效了，尝试刷新一次
		ApiTokenRefresh("")
		//刷新完了，重新尝试一遍
		code, _, body = utils.PostHTTPString(apiurl, GetAuthorization(), postdata)
	}
	if code != 200 || !gjson.Valid(body) {
		return utils.ToSuccessJSON2("count", 0, "error", len(filelist))
	}
	info := gjson.Parse(body)
	count := 0
	info.Get("responses").ForEach(func(key, value gjson.Result) bool {
		var status = value.Get("status").Int()
		if status == 204 || status == 202 {
			count++
		}
		return true
	})
	return utils.ToSuccessJSON2("count", count, "error", len(filelist)-count)
}
func ApiTrashRestoreBatch(filelist []string) (retjsonstr string) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiTrashRestoreBatchError ", " error=", errr)
			retjsonstr = utils.ToSuccessJSON2("count", 0, "error", len(filelist))
		}
	}()
	//{"requests":[{"body":{"drive_id":"8699982","file_id":"60a5bb4394b2ad243fb84509a576506afc890397"},"headers":{"Content-Type":"application/json"},"id":"60a5bb4394b2ad243fb84509a576506afc890397","method":"POST","url":"/recyclebin/restore"}],"resource":"file"}
	//恢复文件返回204 202
	var apiurl = "https://api.aliyundrive.com/v2/batch"
	var postdata = `{"requests":[`
	var max = len(filelist) - 1
	for i := 0; i < len(filelist); i++ {
		postdata += `{"body":{"drive_id":"` + _user.UserToken.P_default_drive_id + `","file_id":"` + filelist[i] + `"},"headers":{"Content-Type":"application/json"},"id":"` + filelist[i] + `","method":"POST","url":"/recyclebin/restore"}`
		if i < max {
			postdata += ","
		}
	}
	postdata += `],"resource":"file"}`

	code, _, body := utils.PostHTTPString(apiurl, GetAuthorization(), postdata)
	if code == 401 {
		//UserAccessToken 失效了，尝试刷新一次
		ApiTokenRefresh("")
		//刷新完了，重新尝试一遍
		code, _, body = utils.PostHTTPString(apiurl, GetAuthorization(), postdata)
	}
	if code != 200 || !gjson.Valid(body) {
		return utils.ToSuccessJSON2("count", 0, "error", len(filelist))
	}
	info := gjson.Parse(body)
	count := 0
	info.Get("responses").ForEach(func(key, value gjson.Result) bool {
		var status = value.Get("status").Int()
		if status == 204 || status == 202 {
			count++
		}
		return true
	})
	return utils.ToSuccessJSON2("count", count, "error", len(filelist)-count)
}
