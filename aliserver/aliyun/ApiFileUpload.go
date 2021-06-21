package aliyun

import (
	"aliserver/utils"
	"encoding/json"
	"errors"
	"log"
	"strings"

	"github.com/tidwall/gjson"
)

func UploadCreatForder(boxid string, parentid string, name string) (dirid string, err error) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("UploadCreatForderError ", " error=", errr)
			dirid = ""
			err = errors.New("UploadCreatForderError")
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

func UploadCreatFile(boxid string, parentid string, name string, size int64, hash string) (israpid bool, upload_id string, file_id string, uploadurl string, err error) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("UploadCreatForderError ", " error=", errr)
			upload_id = ""
			file_id = ""
			uploadurl = ""
			err = errors.New("UploadCreatForderError")
		}
	}()
	var apiurl = "https://api.aliyundrive.com/v2/file/create"

	var postjson = map[string]interface{}{"drive_id": boxid,
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
		return false, "", "", "", errors.New("创建文件失败")
	}
	info := gjson.Parse(body)
	//如果文件已存在，也会正常返回，只是多了一个 exist=True
	file_id = info.Get("file_id").String()

	if info.Get("exist").Exists() {
		//已存在同名文件
		Same, err := UploadFileCheckHash(boxid, file_id, hash) //检查hash是否一致
		if err != nil {
			return false, "", "", "", err
		}
		if Same {
			return true, "", "", "", nil //成功秒传保存了
		}
		UploadFileDelete(boxid, file_id)                          //删除
		return UploadCreatFile(boxid, parentid, name, size, hash) //重新上传
	}
	rapid_upload := info.Get("rapid_upload").Bool()
	if rapid_upload {
		return true, "", "", "", nil //成功秒传保存了
	}
	upload_id = info.Get("upload_id").String()

	uploadurl = info.Get("part_info_list").Array()[0].Get("upload_url").String()

	return false, upload_id, file_id, uploadurl, nil //返回上传ID，继续上传
}

func UploadFileCheckHash(boxid string, file_id string, hash string) (Same bool, err error) {
	//https://api.aliyundrive.com/v2/file/get
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiFileCheckHash ", " error=", errr)
			err = errors.New("error")
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

func UploadFileDelete(boxid string, file_id string) (Delete bool, err error) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiFileDelete ", " error=", errr)
			err = errors.New("error")
		}
	}()
	var apiurl = "https://api.aliyundrive.com/v2/recyclebin/trash"

	var postjson = map[string]interface{}{"drive_id": boxid,
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

func UploadFileComplete(boxid string, parentid string, name string, file_id string, upload_id string) (err error) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiFileComplete ", " error=", errr)
			err = errors.New("error")
		}
	}()
	var apiurl = "https://api.aliyundrive.com/v2/file/complete"

	var postjson = map[string]interface{}{"drive_id": boxid,
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

func UploadFilePartUrl(boxid string, parentid string, name string, file_id string, upload_id string, part_number int, part_size int64) (url string, err error) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("UploadFilePartUrl ", " error=", errr)
			err = errors.New("error")
			url = ""
		}
	}()
	var apiurl = "https://api.aliyundrive.com/v2/file/get_upload_url"

	var postjson = map[string]interface{}{"drive_id": boxid,
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
	//upload_url = strings.Replace(upload_url, "bj29.cn-beijing.data.alicloudccp.com", "ccp-bj29-bj-1592982087.oss-cn-beijing-internal.aliyuncs.com", -1)//内网
	return upload_url, nil
}
