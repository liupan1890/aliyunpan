package data

import (
	"encoding/json"

	buntdb "github.com/tidwall/buntdb"
)

//GetSetting 从数据库中读取文件数据
func GetSetting(key string) (bool, string) {

	isget := false
	str := ""
	APPDB.View(func(tx *buntdb.Tx) error {
		val, _ := tx.Get("Config:" + key)

		if val != "" {
			v := []byte(val)
			l := len(v)
			for i := 0; i < l; i++ {
				v[i] ^= 2
			}
			str = string(v)
			isget = true
		}
		return nil
	})
	return isget, str
}

//SetSetting 保存到数据库
func SetSetting(key string, val string) {
	APPDB.Update(func(tx *buntdb.Tx) error {

		v := []byte(val)
		l := len(v)
		for i := 0; i < l; i++ {
			v[i] ^= 2
		}

		tx.Set("Config:"+key, string(v), nil)
		return nil
	})
}

//ISettingModel ISettingModel
type ISettingModel struct {
	SavePath      string `json:"savePath"`
	SavePathCheck bool   `json:"savePathCheck"`
	TextScale     string `json:"textScale"`
	Theme         string `json:"theme"`
	DownSpeed     string `json:"downSpeed"`
	DownMax       string `json:"downMax"`
	ThreadMax     string `json:"threadMax"`
	DownSha1Check bool   `json:"downSha1Check"`
	RegKey        string `json:"regKey"`
	Ver           string `json:"ver"`
	ServerVer     string `json:"serverVer"`
}

//Setting 全局
var Setting = ISettingModel{
	SavePath:      "",
	SavePathCheck: false,
	TextScale:     "1.0",
	Theme:         "day",
	DownSpeed:     "0", //全局不限速
	DownMax:       "3", //3文件
	ThreadMax:     "2", //2线程 阿里云不限速时，实测1线程都可以跑满宽带
	RegKey:        "",
	DownSha1Check: false,
	Ver:           LocalExeVer,
	ServerVer:     LocalExeVer,
}

//IConfigModel IConfigModel
type IConfigModel struct {
	ServerIP        string
	ServerExeVer    string
	ServerExeVerUrl string
	AliDownReferer  string
	AliDownAgent    string
	AliApiAgent     string
}

//LocalExeVer 文件版本
const LocalExeVer = "1.6.10.0"

//Config 全局，serverconfig
var Config = IConfigModel{
	ServerIP:        "",
	ServerExeVer:    LocalExeVer,
	ServerExeVerUrl: "",
	AliDownReferer:  "https://www.aliyundrive.com/",
	AliDownAgent:    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) ????/2.1.3 Chrome/89.0.4389.128 Electron/12.0.5 Safari/537.36",
	AliApiAgent:     "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) ????/2.1.3 Chrome/89.0.4389.128 Electron/12.0.5 Safari/537.36",
}

//LoadSettingAndConfig 加载设置
func LoadSettingAndConfig() {

	_, SettingConfig := GetSetting("SettingConfig")
	if SettingConfig != "" {
		setting := ISettingModel{}
		err := json.Unmarshal([]byte(SettingConfig), &setting)
		if err == nil {
			setting.Ver = LocalExeVer
			Setting = setting
		}
	}

	Config = LoadConfig()
}

func SaveSetting() {
	jsonbs, err := json.Marshal(Setting)
	if err == nil {
		SetSetting("SettingConfig", string(jsonbs))
	}
}

//LoadConfig LoadConfig
func LoadConfig() IConfigModel {
	_, ServerConfig := GetSetting("ServerConfig")
	config := IConfigModel{}
	json.Unmarshal([]byte(ServerConfig), &config)
	return config
}

//SaveConfig 保存serverconfig
func SaveConfig() {
	jsonbs, err := json.Marshal(Config)
	if err == nil {
		SetSetting("ServerConfig", string(jsonbs))
	}
}
