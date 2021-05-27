package localhost

import (
	"aliserver/data"
	"aliserver/download"
	"aliserver/utils"
	"strconv"
)

func GoSetting(key, val string) string {

	switch key {
	case "downMax":
		data.Setting.DownMax = val
	case "downSha1Check":
		data.Setting.DownSha1Check, _ = strconv.ParseBool(val)
	case "downSpeed":
		data.Setting.DownSpeed = val
		download.Aria2ResetMax()
	case "regKey":
		data.Setting.RegKey = val
	case "savePath":
		data.Setting.SavePath = val
	case "savePathCheck":
		data.Setting.SavePathCheck, _ = strconv.ParseBool(val)
	case "textScale":
		data.Setting.TextScale = val
	case "theme":
		data.Setting.Theme = val
	case "threadMax":
		data.Setting.ThreadMax = val
	}
	if key != "load" {
		data.SaveSetting()
	}
	data.Setting.Ver = data.LocalExeVer
	if data.Config.ServerExeVer == "" {
		data.Setting.ServerVer = data.LocalExeVer
	} else {
		data.Setting.ServerVer = data.Config.ServerExeVer
	}
	//返回完整的setting
	return utils.ToSuccessJSON("setting", data.Setting)
}
