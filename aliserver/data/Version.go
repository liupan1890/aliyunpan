package data

import (
	"aliserver/utils"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/tidwall/gjson"
)

//UpdateVerGitee 从Gitee更新
func UpdateVerByTimer() (isUpdate bool) {
	defer func() {
		if err := recover(); err != nil {
			log.Println("UVerError ", " error=", err)
			isUpdate = false
		}
	}()
	//联网读取IP
	code := 0
	body := ""

	code, _, body = utils.GetHTTPString("https://gitee.com/liupanxiaobaiyang/aliyunpan/raw/master/config1.5.json", "User-Agent: Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198\nCookie: cv=1; cy2=3; cv33=e44\nAccept-Language: zh-CN,zh;q=0.9\n")

	if code == http.StatusOK {

		config := &IConfigModel{}
		err := json.Unmarshal([]byte(body), &config)
		if err == nil {

			SIP := gjson.Get(body, "SIP").String()
			if SIP != "" {
				config.ServerIP = utils.B64decode(SIP)
			}
			ExeVer := gjson.Get(body, "ExeVer").String()
			if SIP != "" {
				config.ServerExeVer = ExeVer
			}
			ExeVerUrl := gjson.Get(body, "ExeVerUrl").String()
			if ExeVerUrl != "" {
				config.ServerExeVerUrl = utils.B64decode(ExeVerUrl)
			}
			DownReferer := gjson.Get(body, "DownReferer").String()
			if DownReferer != "" {
				config.AliDownReferer = utils.B64decode(DownReferer)
			}
			DownAgent := gjson.Get(body, "DownAgent").String()
			if DownAgent != "" {
				config.AliDownAgent = utils.B64decode(DownAgent)
			}
			ApiAgent := gjson.Get(body, "ApiAgent").String()
			if ApiAgent != "" {
				config.AliApiAgent = utils.B64decode(ApiAgent)
			}
			Config = *config
			SaveConfig()
		}
	}
	return Config.ServerIP != ""
}

// UpdateVerAsync 启动后需要检查版本
func UpdateVerAsyncByStart() {
	//time.Sleep(time.Duration(15) * time.Second)
	//CrearAPI()
	var st = 1
	for {
		isok := UpdateVerByTimer()
		if isok {
			return //只要成功就退出
		}
		time.Sleep(time.Duration(st) * time.Second)
		if st < 30 { //每30秒重试一次
			st++
		}
	}
}
