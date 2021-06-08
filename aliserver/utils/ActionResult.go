package utils

import (
	"encoding/json"
	"strings"
)

//ToErrorJSON 转成字符串
func ToErrorJSON(err error) string {
	return ToErrorMessageJSON(err.Error())
	//return `{"message":"` + ToJSONString(message) + `","code":503}`
}

//ToErrorMessageJSON 转成字符串
func ToErrorMessageJSON(message string) string {
	if strings.Contains(message, "No connection could be made") {
		message = "联网失败,请重试"
	}
	mapInstance := make(map[string]interface{})
	mapInstance["message"] = message
	mapInstance["code"] = 503
	jsonStr, _ := json.Marshal(mapInstance)
	return string(jsonStr)
}

//ToSuccessJSON 转成字符串
func ToSuccessJSON(key string, val interface{}) string {
	mapInstance := make(map[string]interface{})
	mapInstance["message"] = "success"
	mapInstance["code"] = 0
	if key != "" {
		mapInstance[key] = val
	}
	jsonStr, _ := json.Marshal(mapInstance)
	return string(jsonStr)
}

//ToSuccessJSON2 转成字符串
func ToSuccessJSON2(key string, val interface{}, key2 string, val2 interface{}) string {
	mapInstance := make(map[string]interface{})
	mapInstance["message"] = "success"
	mapInstance["code"] = 0
	if key != "" {
		mapInstance[key] = val
	}
	if key2 != "" {
		mapInstance[key2] = val2
	}
	jsonStr, _ := json.Marshal(mapInstance)
	return string(jsonStr)
}

//ToSuccessJSON3 转成字符串
func ToSuccessJSON3(key string, val interface{}, key2 string, val2 interface{}, key3 string, val3 interface{}) string {
	mapInstance := make(map[string]interface{})
	mapInstance["message"] = "success"
	mapInstance["code"] = 0
	if key != "" {
		mapInstance[key] = val
	}
	if key2 != "" {
		mapInstance[key2] = val2
	}
	if key3 != "" {
		mapInstance[key3] = val3
	}
	jsonStr, _ := json.Marshal(mapInstance)
	return string(jsonStr)
}

//ToSuccessJSON4 转成字符串
func ToSuccessJSON4(key string, val interface{}, key2 string, val2 interface{}, key3 string, val3 interface{}, key4 string, val4 interface{}) string {
	mapInstance := make(map[string]interface{})
	mapInstance["message"] = "success"
	mapInstance["code"] = 0
	if key != "" {
		mapInstance[key] = val
	}
	if key2 != "" {
		mapInstance[key2] = val2
	}
	if key3 != "" {
		mapInstance[key3] = val3
	}
	if key4 != "" {
		mapInstance[key4] = val4
	}
	jsonStr, _ := json.Marshal(mapInstance)
	return string(jsonStr)
}

//ToJSONString 处理转义字符
func ToJSONString(str string) string {
	if str == "" {
		return ""
	}
	str = strings.Replace(str, `\`, `\\`, -1)
	str = strings.Replace(str, `"`, `\"`, -1)
	str = strings.Replace(str, `\r`, `\\r`, -1)
	str = strings.Replace(str, `\n`, `\\n`, -1)
	return str
}
