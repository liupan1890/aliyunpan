package aliyun

import (
	"aliserver/utils"
	"encoding/json"
	"errors"
	"log"
	"strings"

	"github.com/tidwall/gjson"
)

func UploadCreatForder(parentid string, name string) (dirid string, err error) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("UploadCreatForderError ", " error=", errr)
			dirid = ""
			err = errors.New("UploadCreatForderError")
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
		return "", errors.New("创建文件夹失败")
	}
	info := gjson.Parse(body)
	//如果文件夹已存在，也会正常返回，只是多了一个 exist=True
	//exist := info.Get("exist").Bool()
	file_id := info.Get("file_id").String()
	if len(file_id) < 20 {
		return "", errors.New("创建文件夹失败file_id")
	}
	return file_id, nil
}

func UploadCreatFile(parentid string, name string, size int64, hash string) (israpid bool, upload_id string, file_id string, err error) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("UploadCreatForderError ", " error=", errr)
			upload_id = ""
			file_id = ""
			err = errors.New("UploadCreatForderError")
		}
	}()
	var apiurl = "https://api.aliyundrive.com/v2/file/create"

	var postjson = map[string]interface{}{"drive_id": _user.UserToken.P_default_drive_id,
		"parent_file_id":    parentid,
		"name":              name,
		"size":              size,
		"check_name_mode":   "refuse",
		"type":              "file",
		"content_hash_name": "sha1",
		"content_hash":      strings.ToLower(hash),
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
	if code != 201 || !gjson.Valid(body) { //注意这里是201
		return false, "", "", errors.New("创建文件失败")
	}
	info := gjson.Parse(body)
	//如果文件已存在，也会正常返回，只是多了一个 exist=True
	file_id = info.Get("file_id").String()

	if info.Get("exist").Exists() {
		//已存在同名文件
		Same, err := UploadFileCheckHash(file_id, hash) //检查hash是否一致
		if err != nil {
			return false, "", "", err
		}
		if Same {
			return true, "", "", nil //成功秒传保存了
		}
		UploadFileDelete(file_id)                          //删除
		return UploadCreatFile(parentid, name, size, hash) //重新上传
	}
	rapid_upload := info.Get("rapid_upload").Bool()
	if rapid_upload {
		return true, "", "", nil //成功秒传保存了
	}
	upload_id = info.Get("upload_id").String()

	return false, upload_id, file_id, nil //返回上传ID，继续上传
}

func UploadFileCheckHash(file_id string, hash string) (Same bool, err error) {
	//https://api.aliyundrive.com/v2/file/get
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiFileCheckHash ", " error=", errr)
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
			return false, errors.New("401")
		}
	}
	if code != 200 || !gjson.Valid(body) {
		return false, errors.New("error")
	}
	info := gjson.Parse(body)

	content_hash := info.Get("content_hash").String() //E27EB7D983E212CDDF9149094E31E40CC47417D6
	content_hash = strings.ToUpper(content_hash)
	hash = strings.ToUpper(hash)
	return content_hash == hash, nil
}

func UploadFileDelete(file_id string) (Delete bool, err error) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiFileDelete ", " error=", errr)
			err = errors.New("error")
		}
	}()
	var apiurl = "https://api.aliyundrive.com/v2/recyclebin/trash"

	var postjson = map[string]interface{}{"drive_id": _user.UserToken.P_default_drive_id,
		"file_id": file_id}

	b, _ := json.Marshal(postjson)
	postdata := string(b)

	code, _, _ := utils.PostHTTPString(apiurl, GetAuthorization(), postdata)
	if code == 401 {
		//UserAccessToken 失效了，尝试刷新一次
		ApiTokenRefresh("")
		//刷新完了，重新尝试一遍
		code, _, _ = utils.PostHTTPString(apiurl, GetAuthorization(), postdata)
		if code == 401 {
			return false, errors.New("401")
		}
	}
	if code != 204 && code != 202 {
		return false, errors.New("error")
	}
	return true, nil
}

func UploadFileComplete(parentid string, name string, file_id string, upload_id string) (err error) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiFileComplete ", " error=", errr)
			err = errors.New("error")
		}
	}()
	var apiurl = "https://api.aliyundrive.com/v2/file/complete"

	var postjson = map[string]interface{}{"drive_id": _user.UserToken.P_default_drive_id,
		"upload_id":      upload_id,
		"file_id":        file_id,
		"parent_file_id": parentid,
		"type":           "file",
		"name":           name,
		"content_type":   "",
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
			return errors.New("401")
		}
	}
	if code != 200 || !gjson.Valid(body) {
		return errors.New("error")
	}
	info := gjson.Parse(body)
	if !info.Get("updated_at").Exists() {
		return errors.New("updated_at")
	}
	return nil
}

func UploadFilePartUrl(parentid string, name string, file_id string, upload_id string, part_number int, part_size int64) (url string, err error) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("UploadFilePartUrl ", " error=", errr)
			err = errors.New("error")
			url = ""
		}
	}()
	var apiurl = "https://api.aliyundrive.com/v2/file/get_upload_url"

	var postjson = map[string]interface{}{"drive_id": _user.UserToken.P_default_drive_id,
		"upload_id":      upload_id,
		"file_id":        file_id,
		"parent_file_id": parentid,
		"type":           "file",
		"name":           name,
		"content_type":   "",
		"part_info_list": []map[string]interface{}{
			{"part_size": part_size, "part_number": part_number},
		},
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
			return "", errors.New("401")
		}
	}
	if code != 200 || !gjson.Valid(body) {
		return "", errors.New("error")
	}
	info := gjson.Parse(body)
	uinfo := info.Get("part_info_list").Array()[0]
	upload_url := uinfo.Get("upload_url").String()
	return upload_url, nil
}

//https://api.aliyundrive.com/v2/file/create
//referer: https://www.aliyundrive.com/
/*
{
    "drive_id": "8699982",
    "name": "resources.pak",
    "parent_file_id": "60aa4e418fece81aab0844fd93c7331dacdb5829",
    "type": "file",
    "size": 5140611,
    "check_name_mode": "auto_rename",
    "content_hash_name": "sha1",
    "content_hash": "fb809cfe535b907a5ef0d5a552d34ec209277bbb"
}*/

/*return
{"parent_file_id":"60aa4e418fece81aab0844fd93c7331dacdb5829","upload_id":"rapid-c74a02cb-e1b5-4c83-9854-0013c311eb2b","rapid_upload":true,"type":"file","file_id":"60ac92ae1a8ca1a9d88c43e29ae170f02dd1bd42","domain_id":"bj29","drive_id":"8699982","file_name":"resources.pak","encrypt_mode":"none","location":"cn-beijing"}
*/

//https://api.aliyundrive.com/v2/file/complete
/*
{
    "drive_id": "8699982",
    "upload_id": "rapid-c74a02cb-e1b5-4c83-9854-0013c311eb2b",
    "file_id": "60ac92ae1a8ca1a9d88c43e29ae170f02dd1bd42",
    "parent_file_id": "60aa4e418fece81aab0844fd93c7331dacdb5829",
    "type": "file",
    "name": "resources.pak",
    "content_type": ""
}*/

/*return
{"drive_id":"8699982","domain_id":"bj29","file_id":"60ac92ae1a8ca1a9d88c43e29ae170f02dd1bd42","name":"resources.pak","type":"file","content_type":"application/oct-stream","created_at":"2021-05-25T06:01:18.165Z","updated_at":"2021-05-25T06:01:18.165Z","file_extension":"pak","hidden":false,"size":5140611,"starred":false,"status":"available","upload_id":"rapid-c74a02cb-e1b5-4c83-9854-0013c311eb2b","parent_file_id":"60aa4e418fece81aab0844fd93c7331dacdb5829","crc64_hash":"15265797113528566976","content_hash":"FB809CFE535B907A5EF0D5A552D34EC209277BBB","content_hash_name":"sha1","category":"others","encrypt_mode":"none","location":"cn-beijing"}*/

//上传文件
/*
{
    "drive_id": "8699982",
    "name": "aDrive.7z",
    "parent_file_id": "60aa4e418fece81aab0844fd93c7331dacdb5829",
    "type": "file",
    "size": 34243822,
    "check_name_mode": "auto_rename",
    "content_hash_name": "sha1",
    "content_hash": "8b4b35475150d1eb7833d6287b8f6e9dfcde2f97"
}*/
