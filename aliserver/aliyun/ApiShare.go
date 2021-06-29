package aliyun

import (
	"aliserver/utils"
	"encoding/json"
	"errors"
	"log"
	"strconv"
	"strings"

	"github.com/tidwall/gjson"
)

func _APIHTTPS(apiurl string, sharetoken string, postdata *[]byte) (code int, bodybytes *[]byte) {
	code, _, bodybytes = utils.PostHTTPBytes2(apiurl, GetAuthorization()+"\nx-share-token: "+sharetoken, postdata)
	if code == 401 {
		//UserAccessToken 失效了，尝试刷新一次
		ApiTokenRefresh("")
		//刷新完了，重新尝试一遍
		code, _, bodybytes = utils.PostHTTPBytes2(apiurl, GetAuthorization()+"\nx-share-token: "+sharetoken, postdata)
	}
	return code, bodybytes
}

func ApiGetShareToken(sid, pwd string) (token string, err error) {
	//https://api.aliyundrive.com/v2/share_link/get_share_token
	//{"share_id":"BNGfGxA3NGq","share_pwd":""}
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiGetShareTokenError ", " error=", errr)
			err = errors.New("error")
		}
	}()
	var apiurl = "https://api.aliyundrive.com/v2/share_link/get_share_token"

	var postjson = map[string]interface{}{"share_id": sid,
		"share_pwd": pwd,
	}
	postdata, _ := json.Marshal(postjson)
	code, bodybytes := _APIHTTP(apiurl, &postdata)
	body := string(*bodybytes)
	if code != 200 || !gjson.Valid(body) {
		if strings.Contains(body, "share_pwd is not valid") {
			return "", errors.New("密码错误")
		}
		return "", errors.New("code=" + strconv.FormatInt(int64(code), 10))
	}
	token = gjson.Get(body, "share_token").String()
	if token != "" {
		return token, nil
	} else {
		return "", errors.New("tokenError")
	}
}

func ApiGetShareAnonymous(sid string) (sharename, shareinfo string, fileinfos string, err error) {
	//https://api.aliyundrive.com/v2/share_link/get_share_token
	//{"share_id":"BNGfGxA3NGq","share_pwd":""}
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiGetShareAnonymousError ", " error=", errr)
			err = errors.New("error")
		}
	}()
	var apiurl = "https://api.aliyundrive.com/adrive/v2/share_link/get_share_by_anonymous?share_id=" + sid

	var postjson = map[string]interface{}{"share_id": sid}
	postdata, _ := json.Marshal(postjson)
	code, bodybytes := _APIHTTP(apiurl, &postdata)
	body := string(*bodybytes)
	if code != 200 || !gjson.Valid(body) {
		return "", "", "", errors.New("code=" + strconv.FormatInt(int64(code), 10))
	}
	info := gjson.Parse(body)

	if info.Get("creator_id").Exists() {
		var oinfo = map[string]interface{}{}
		oinfo["sid"] = sid
		oinfo["creator_id"] = info.Get("creator_id").String()
		oinfo["expiration"] = info.Get("expiration").String()
		oinfo["file_count"] = info.Get("file_count").Int()
		oinfo["share_name"] = info.Get("share_name").String()
		oinfo["updated_at"] = info.Get("updated_at").String()
		fileinfos = info.Get("file_infos").Raw
		b1, _ := json.Marshal(oinfo)
		shareinfo = string(b1)
		sharename = info.Get("share_name").String()
		return sharename, shareinfo, fileinfos, nil
	} else {
		return "", "", "", errors.New("bodyError")
	}
}

func ApiSaveShareFilesBatch(shareid, boxid, parentid string, filelist []string) (retjsonstr string) {
	//{"requests":[{"body":{"file_id":"60d5aa14be9f9a3019bc4655803010090140f5cc","share_id":"BNGfGxA3NGq","file_id_list":["60d5aa14be9f9a3019bc4655803010090140f5cc"],"to_parent_file_id":"60d32777623547df8c0645c080e4545f4d8b038f","to_drive_id":"8699982","auto_rename":true},"headers":{"Content-Type":"application/json"},"id":"0","method":"POST","url":"/file/copy"}],"resource":"file"}
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiSaveShareFilesBatchError ", " error=", errr)
			retjsonstr = utils.ToSuccessJSON2("filecount", 0, "error", len(filelist))
		}
	}()
	//https://api.aliyundrive.com/v2/batch
	//{"responses":[{"body":{"domain_id":"bj29","drive_id":"8699982","file_id":"60d9c4ca9ed2d8c38038475dab7f28bc8a6d7564"},"id":"0","status":201}]}
	//保存文件 返回值201

	var postdata = `{"requests":[`
	var max = len(filelist) - 1
	var add = 0

	var blist = make([]string, 0)
	for i := 0; i < len(filelist); i++ {
		postdata += `{"body":{"share_id":"` + shareid + `","file_id_list":["` + filelist[i] + `"],"file_id":"` + filelist[i] + `","to_drive_id":"` + boxid + `","to_parent_file_id":"` + parentid + `","auto_rename":false},"headers":{"Content-Type":"application/json"},"id":"` + filelist[i] + `","method":"POST","url":"/file/copy"}`

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

	return utils.ToSuccessJSON2("filecount", count, "error", len(filelist)-int(count))
}

//ApiGetShareListAll 读取一个文件夹包含的文件列表 isfull==true时遍历所有子文件夹
func ApiGetShareListAll(sid, parentid, token string) (list []*FileUrlModel, err error) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("_ApiGetShareListAllError ", " error=", errr)
			err = errors.New("error")
		}
	}()
	var marker = ""
	for {
		flist, next, ferr := _ApiGetShareList(sid, token, parentid, marker)
		if ferr != nil {
			return nil, ferr //有错误直接退出
		}
		if len(flist) > 0 {
			list = append(list, flist...)
		}
		marker = next
		if next == "" {
			break
		}
	}
	return list, nil
}

func _ApiGetShareList(sid, token, parentid, marker string) (list []*FileUrlModel, next_marker string, err error) {
	//https://api.aliyundrive.com/v2/share_link/get_share_token
	//{"share_id":"BNGfGxA3NGq","parent_file_id":"root","limit":100,"image_thumbnail_process":"image/resize,w_160/format,jpeg","image_url_process":"image/resize,w_1920/format,jpeg","video_thumbnail_process":"video/snapshot,t_0,f_jpg,ar_auto,w_300","order_by":"name","order_direction":"DESC"}

	var apiurl = "https://api.aliyundrive.com/v2/file/list"

	var postjson = map[string]interface{}{"share_id": sid,
		"parent_file_id":  parentid,
		"limit":           100,
		"order_by":        "name",
		"order_direction": "ASC",
	}
	if marker != "" {
		postjson["marker"] = marker
	}
	postdata, _ := json.Marshal(postjson)
	code, bodybytes := _APIHTTPS(apiurl, token, &postdata)
	body := string(*bodybytes)
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
			return nil, "", errors.New("nameerror")
		}
		if filetype == "file" {
			size := info.Get("size").Int()
			list = append(list, &FileUrlModel{P_drive_id: "", P_file_id: file_id, P_file_name: name, P_size: size, IsUrl: true, IsDir: false})
		} else {
			list = append(list, &FileUrlModel{P_drive_id: "", P_file_id: file_id, P_file_name: name, IsUrl: false, IsDir: true})
		}
	}

	return list, next_marker, nil
}
