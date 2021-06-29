package aliyun

import (
	"aliserver/data"
	"aliserver/utils"
	"encoding/json"
	"log"
	"time"

	"github.com/tidwall/gjson"
)

func GetUserName() string {
	return _user.UserName
}
func GetUserID() string {
	return _user.UserID
}
func CheckUserID(userid string) bool {
	return _user.UserID == userid
}

func GetUserBoxID() string {
	return _user.UserToken.P_default_drive_id
}
func GetUserSBoxID() string {
	return _user.UserToken.P_default_sbox_drive_id
}
func GetUserXiangCeID() string {
	return _user.UserXiangCeID
}

var _user = data.UserLoginModel{
	UserLoginType:    "",
	UserID:           "",
	UserName:         "",
	UserFace:         "",
	UserXiangCeID:    "",
	UserAccessToken:  "",
	UserRefreshToken: "",
	UserToken:        data.UserTokenModel{},
	UserInfo:         data.UserInfoModel{},
}

func SetUserToken(logintype string, token data.UserTokenModel) {
	var userLogin = data.UserLoginModel{
		UserLoginType:    logintype,
		UserID:           token.P_user_id,
		UserName:         token.P_nick_name, //昵称
		UserFace:         token.P_avatar,    //头像
		UserXiangCeID:    "",                //相册ID
		UserAccessToken:  token.P_access_token,
		UserRefreshToken: token.P_refresh_token,
		UserToken:        token,
		UserInfo:         data.UserInfoModel{},
	}
	if _user.UserID == token.P_user_id {
		userLogin.UserInfo = _user.UserInfo
	}
	_user = userLogin                        //先登录
	_user.UserXiangCeID = ApiUserXiangCeID() //后相册

	b, _ := json.Marshal(_user)
	data.SetUser(_user.UserID, string(b))
}

func GetAuthorization() string {
	return "User-Agent: Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36\n" +
		"Origin: https://www.aliyundrive.com\n" +
		"Referer: https://www.aliyundrive.com/\n" +
		"Authorization: " + _user.UserToken.P_token_type + " " + _user.UserToken.P_access_token
}

//ApiUserInfo 联网读取用户信息，空间用量
func ApiUserInfo() (retjsonstr string) {

	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiUserInfoError ", " error=", errr)
			retjsonstr = utils.ToSuccessJSON("info", "")
		}
	}()

	if _user.UserID == "" {
		return utils.ToSuccessJSON("info", "")
	}
	var checktime = time.Now().Unix() - 600 //秒 - 10分钟
	if _user.UserInfo.P_total_size == "" || _user.UserInfo.M_info_time < checktime {
		var apiurl = "https://api.aliyundrive.com/v2/databox/get_personal_info"
		postdata := []byte("")
		code, bodybytes := _APIHTTP(apiurl, &postdata)
		body := string(*bodybytes)

		if code != 200 || !gjson.Valid(body) {
			return utils.ToSuccessJSON("info", "")
		}

		var userinfo = data.UserInfoModel{}
		var info = gjson.Parse(body)
		userinfo.P_used_size = utils.FormateSizeString(info.Get("personal_space_info.used_size").Int())
		userinfo.P_total_size = utils.FormateSizeString(info.Get("personal_space_info.total_size").Int())
		userinfo.P_spu_id = info.Get("personal_rights_info.spu_id").String()
		userinfo.P_name = info.Get("personal_rights_info.name").String()
		userinfo.P_is_expires = info.Get("personal_rights_info.is_expires").Bool()
		var privileges = info.Get("personal_rights_info.privileges")

		userinfo.P_download_speed = utils.FormateSizeString(privileges.Get(`#(feature_id="download").quota`).Int())
		userinfo.P_drive_size = utils.FormateSizeString(privileges.Get(`#(feature_id="drive").quota`).Int())
		userinfo.P_safe_box_size = utils.FormateSizeString(privileges.Get(`#(feature_id="safe_box").quota`).Int())
		userinfo.P_upload_size = utils.FormateSizeString(privileges.Get(`#(feature_id="upload").quota`).Int())

		userinfo.M_info_time = time.Now().Unix()
		_user.UserInfo = userinfo
		b, _ := json.Marshal(_user)
		data.SetUser(_user.UserID, string(b))
	}

	if _user.UserXiangCeID == "" {
		_user.UserXiangCeID = ApiUserXiangCeID()
	}

	var infostr = `{"userID":"` + _user.UserID + `","userName":"` + utils.ToJSONString(_user.UserName) + `","panUsed":"` + _user.UserInfo.P_used_size + `","panTotal":"` + _user.UserInfo.P_total_size + `",`
	infostr = infostr + `"drive_size":"` + _user.UserInfo.P_drive_size + `","safe_box_size":"` + _user.UserInfo.P_safe_box_size + `","upload_size":"` + _user.UserInfo.P_upload_size + `","userFace":"` + utils.ToJSONString(_user.UserFace) + `"}`
	return utils.ToSuccessJSON("info", infostr)
}

func ApiUserXiangCeID() (driveId string) {

	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiUserXiangCeIDError ", " error=", errr)
			driveId = ""
		}
	}()

	if _user.UserID == "" {
		return ""
	}
	var apiurl = "https://api.aliyundrive.com/adrive/v1/user/albums_info"
	//{"code":"200","message":"success","data":{"driveId":"","driveName":"alibum"},"resultCode":"200"}
	postdata := []byte("{}")
	code, bodybytes := _APIHTTP(apiurl, &postdata)
	body := string(*bodybytes)

	if code != 200 || !gjson.Valid(body) {
		return ""
	}
	var info = gjson.Parse(body)
	driveId = info.Get("data.driveId").String()
	return driveId
}

func ApiUserSboxID() (driveId string) {

	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiUserSboxError ", " error=", errr)
			driveId = ""
		}
	}()

	if _user.UserID == "" {
		return ""
	}
	var apiurl = "https://api.aliyundrive.com/v2/sbox/get"
	//{"drive_id":"","sbox_used_size":5725023,"sbox_total_size":53687091200,"recommend_vip":"svip","pin_setup":true,"locked":false,"insurance_enabled":false}
	postdata := []byte("{}")
	code, bodybytes := _APIHTTP(apiurl, &postdata)
	body := string(*bodybytes)

	if code != 200 || !gjson.Valid(body) {
		return ""
	}
	var info = gjson.Parse(body)
	driveId = info.Get("drive_id").String()
	return driveId
}

func ApiUserLogoff() string {
	data.DelUser(_user.UserID)
	_user = data.UserLoginModel{}
	return utils.ToSuccessJSON("", nil)
}

//AutoRefreshUserInfo 自动刷新一个用户的信息
func AutoRefreshUserInfo() {
	defer func() {
		if err := recover(); err != nil {
			log.Println("ARUserError ", " error=", err)
		}
	}()
	ApiUserInfo()
}

func LoadUserFromDB() {
	isget, jsonstr := data.GetUserFirst()
	if isget {
		var user = data.UserLoginModel{}
		err := json.Unmarshal([]byte(jsonstr), &user)
		if err == nil && user.UserID != "" {
			ApiTokenRefresh(user.UserRefreshToken) //使用UserRefreshToken刷新UserAccessToken
			var result = ApiUserInfo()
			if result == `{"code":0,"info":"","message":"success"}` {
				ApiUserLogoff() //刷新失败，退出登录
			}
		}
	}
}
