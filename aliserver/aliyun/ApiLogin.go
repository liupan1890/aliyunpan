package aliyun

import (
	"aliserver/data"
	"aliserver/utils"
	"encoding/base64"
	"encoding/json"
	"log"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/tidwall/gjson"
)

type AliLoginParames struct {
	P_t              string
	P_ck             string
	P_codeContent    string
	P_ua             string //固定是空的，应该是转换后的UA
	P_appName        string //"aliyun_drive"
	P_appEntrance    string //"web"
	P_csrf_token     string
	P_umidToken      string
	P_isMobile       bool   //false
	P_lang           string //"zh_CN"
	P_returnUrl      string
	P_hsiz           string
	P_fromSite       string
	P_bizParams      string
	P_navlanguage    string //"zh-CN"
	P_navUserAgent   string //HttpHelper.getUA
	P_navPlatform    string //"Win32"
	P_bx_v           string //"2.0.31" //固定死
	M_client_id      string
	M_client_id_time int64 //获取client_id的时间
	M_token_time     int64 //获取html的时间
}

const UA = "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36"
const minilogin = "https://passport.aliyundrive.com/mini_login.htm?lang=zh_cn&appName=aliyun_drive&appEntrance=web&styleType=auto&bizParams=&notLoadSsoView=false&notKeepLogin=false&isMobile=false&hidePhoneCode=true&rnd=0.6526621980999825"

var parame = AliLoginParames{P_appName: "aliyun_drive", P_appEntrance: "web", P_isMobile: false, P_lang: "zh-CN", P_navlanguage: "zh-CN", P_navUserAgent: UA, P_navPlatform: "Win32", P_bx_v: "2.0.31"}

func authurl() string {
	return "https://auth.aliyundrive.com/v2/oauth/authorize?client_id=" +
		parame.M_client_id +
		"&redirect_uri=https%3A%2F%2Fwww.aliyundrive.com%2Fsign%2Fcallback&response_type=code&login_type=custom&state=%7B%22origin%22%3A%22https%3A%2F%2Fwww.aliyundrive.com%22%7D"
}

func apiMiniLogin() {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("apiMiniLoginError ", " error=", errr)
		}
	}()
	var checktime = time.Now().Unix() - 3600                             //秒 - 1小时
	if parame.M_client_id == "" || parame.M_client_id_time < checktime { //client_id第一次先读取
		_, _, body := utils.GetHTTPString("https://www.aliyundrive.com/sign/in", "User-Agent: "+UA+"\nReferer: "+minilogin)
		index := strings.Index(body, "client_id")
		if index > 0 {
			client_id := body[index+len("client_id"):]
			var s1 = strings.Index(client_id, "\"")
			var s2 = strings.Index(client_id, "'")
			if s1 == -1 && s2 >= 0 || s2 >= 0 && s2 < s1 {
				//'
				client_id = client_id[s2+1:]
				client_id = client_id[0:strings.Index(client_id, "'")]
				if len(client_id) > 12 && len(client_id) < 20 { //应该是16位
					parame.M_client_id = client_id
					parame.M_client_id_time = time.Now().Unix()
				}
			} else if s2 == -1 && s1 >= 0 || s1 >= 0 && s1 < s2 {
				//"
				client_id = client_id[s1+1:]
				client_id = client_id[0:strings.Index(client_id, "\"")]
				if len(client_id) > 12 && len(client_id) < 20 { //应该是16位
					parame.M_client_id = client_id
					parame.M_client_id_time = time.Now().Unix()
				}
			}

			utils.GetHTTPString(authurl(), "User-Agent: "+UA+"\nReferer: "+minilogin)
		}
	}
	//刷新参数
	if parame.P_csrf_token == "" || parame.M_token_time < checktime {
		code, _, html := utils.GetHTTPString(minilogin, "User-Agent: "+UA+"\nReferer: "+minilogin)
		if code == 200 {
			parame.P_csrf_token = utils.SubStr(html, "_csrf_token")
			parame.P_umidToken = utils.SubStr(html, "umidToken")
			parame.P_hsiz = utils.SubStr(html, "hsiz")
			parame.P_fromSite = utils.SubInt(html, "fromSite")
			parame.P_bizParams = utils.SubStr(html, "bizParams")
			parame.M_token_time = time.Now().Unix()
		}
	}
}

func ApiQrcodeGenerate() (retjsonstr string) {
	apiMiniLogin()
	parame.P_codeContent = ""
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiQrcodeGenerateError ", " error=", errr)
			retjsonstr = utils.ToSuccessJSON("codeContent", "")
		}
	}()

	var url = "https://passport.aliyundrive.com/newlogin/qrcode/generate.do?appName=" +
		parame.P_appName +
		"&fromSite=" +
		parame.P_fromSite +
		"&appName=aliyun_drive&appEntrance=web&_csrf_token=" +
		parame.P_csrf_token +
		"&umidToken=" +
		parame.P_umidToken +
		"&isMobile=false&lang=zh_CN&returnUrl=&hsiz=" +
		parame.P_hsiz +
		"&bizParams=" +
		parame.P_bizParams +
		"&_bx-v=" +
		parame.P_bx_v
	code, _, body := utils.GetHTTPString(url, "User-Agent: "+UA+"\nReferer: "+minilogin)
	if code == 200 {
		info := gjson.Parse(body)
		if info.Get("content").Exists() {
			data := info.Get("content").Get("data")
			resultCode := data.Get("resultCode").Int()
			println("resultCode=", resultCode)
			if resultCode == 100 {
				parame.P_codeContent = data.Get("codeContent").String() //成功读取到二维码url
				parame.P_ck = data.Get("ck").String()
				parame.P_t = data.Get("t").String()
			}
		}
	}
	return utils.ToSuccessJSON("codeContent", parame.P_codeContent)
}

//ApiQrcodeQuery 轮询二维码状态 retry==需要重新生成二维码，nothing==什么也不做，success==登陆成功
func ApiQrcodeQuery() (retjsonstr string) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiQrcodeGenerateError ", " error=", errr)
			retjsonstr = utils.ToSuccessJSON("loginResult", "nothing")
		}
	}()

	var loginurl = "https://passport.aliyundrive.com/newlogin/qrcode/query.do?appName=" +
		parame.P_appName +
		"&fromSite=" +
		parame.P_fromSite +
		"&_bx-v=" +
		parame.P_bx_v
		//根据二维码url的 t 和 ck 查询二维码状态
	postdata := strings.Join([]string{"t=", parame.P_t,
		"&ck=", parame.P_ck,
		"&ua=", parame.P_ua,
		"&appName=", parame.P_appName,
		"&appEntrance=", parame.P_appEntrance,
		"&_csrf_token=", parame.P_csrf_token,
		"&umidToken=", parame.P_umidToken,
		"&isMobile=", strconv.FormatBool(parame.P_isMobile),
		"&lang=", parame.P_lang,
		"&returnUrl=", parame.P_returnUrl,
		"&hsiz=", parame.P_hsiz,
		"&fromSite=", parame.P_fromSite,
		"&bizParams=", parame.P_bizParams,
		"&navlanguage=", parame.P_navlanguage,
		"&navUserAgent=", url.QueryEscape(parame.P_navUserAgent),
		"&navPlatform=", parame.P_navPlatform,
	}, "")
	code, _, body := utils.PostHTTPString(loginurl, "User-Agent: "+UA+"\nReferer: "+minilogin+"\nContent-Type: application/x-www-form-urlencoded", postdata)
	if code != 200 {
		return utils.ToSuccessJSON("loginResult", "retry")
	}

	info := gjson.Parse(body)
	if !info.Get("content").Exists() || !info.Get("content").Get("data").Exists() {
		return utils.ToSuccessJSON("loginResult", "retry")
	}
	data := info.Get("content").Get("data")
	//检查返回结果,如果出错就显示刷新按钮，loadQrcode=false
	var qrCodeStatus = data.Get("qrCodeStatus").String() //NEW  SCANED  CONFIRMED  CANCELED EXPIRED
	qrCodeStatus = strings.ToUpper(qrCodeStatus)

	if qrCodeStatus == "CONFIRMED" {
		//判断如果登录成功,刷新userToken,并关闭弹窗
		var loginResult = data.Get("loginResult").String()
		if loginResult == "success" {
			var bizExt = data.Get("bizExt").String()
			if bizExt != "" {
				buff, _ := base64.StdEncoding.DecodeString(bizExt)
				var txt = string(buff)
				var accessToken = utils.SubStr(txt, "accessToken")
				//执行刷新token
				println(accessToken)
				return ApiTokenLogin(accessToken)
			}
		}
		//token不正确，重新登录
		return utils.ToSuccessJSON("loginResult", "retry")
	} else if qrCodeStatus == "NEW" || qrCodeStatus == "SCANED" {
		//什么也不做
		return utils.ToSuccessJSON("loginResult", "nothing")
	} else if qrCodeStatus == "EXPIRED" || qrCodeStatus == "CANCELED" {
		//大约500秒，二维码失效，重新登录
		return utils.ToSuccessJSON("loginResult", "retry")
	}

	return utils.ToSuccessJSON("loginResult", "nothing")
}

//ApiTokenLogin 刷新用户信息
func ApiTokenLogin(accessToken string) (retjsonstr string) {
	if accessToken == "" {
		return utils.ToSuccessJSON("loginResult", "retry")
	}
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiTokenLoginError ", " error=", errr)
			retjsonstr = utils.ToSuccessJSON("loginResult", "retry")
		}
	}()
	postdata := utils.BodyString(utils.Body{
		"token": accessToken,
	})
	code, _, body := utils.PostHTTPString("https://auth.aliyundrive.com/v2/oauth/token_login", "User-Agent: "+UA+"\nReferer: "+authurl()+"\nContent-Type: application/json", postdata)
	if code != 200 {
		return utils.ToSuccessJSON("loginResult", "retry")
	}
	info := gjson.Parse(body)
	if !info.Get("goto").Exists() {
		return utils.ToSuccessJSON("loginResult", "retry")
	}

	_goto := info.Get("goto").String()
	//https://www.aliyundrive.com/sign/callback?code=2f23cae60b9844eda4c4dd48e4f207c4&state=%7B%22origin%22%3A%22https%3A%2F%2Fwww.aliyundrive.com%22%7D

	_code := _goto[strings.Index(_goto, "code=")+len("code="):]
	_code = _code[0:strings.Index(_code, "&")]

	postdata = utils.BodyString(utils.Body{
		"code": _code,
	})
	code, _, body = utils.PostHTTPString("https://websv.aliyundrive.com/token/get", "User-Agent: "+UA+"\nReferer: "+authurl()+"\nContent-Type: application/json", postdata)
	if code != 200 {
		return utils.ToSuccessJSON("loginResult", "retry")
	}
	var token = data.UserTokenModel{}
	json.Unmarshal([]byte(body), &token)
	SetUserToken("qrcode", token)
	return utils.ToSuccessJSON("loginResult", "success")
}

func ApiTokenRefresh(refreshToken string) (retjsonstr string) {
	if refreshToken == "" {
		refreshToken = _user.UserRefreshToken
	}
	if refreshToken == "" {
		return utils.ToSuccessJSON("loginResult", "retry")
	}
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("ApiTokenRefreshError ", " error=", errr)
			retjsonstr = utils.ToSuccessJSON("loginResult", "retry")
		}
	}()

	aliurl := "https://www.aliyundrive.com/"
	postdata := utils.BodyString(utils.Body{
		"refresh_token": refreshToken,
	})
	code, _, body := utils.PostHTTPString("https://websv.aliyundrive.com/token/refresh", "User-Agent: "+UA+"\nReferer: "+aliurl+"\nContent-Type: application/json", postdata)
	if code != 200 {
		return utils.ToSuccessJSON("loginResult", "retry")
	}
	if !gjson.Valid(body) {
		return utils.ToSuccessJSON("loginResult", "retry")
	}
	var token = data.UserTokenModel{}
	json.Unmarshal([]byte(body), &token)
	SetUserToken("qrcode", token)
	return utils.ToSuccessJSON("loginResult", "success")
}
