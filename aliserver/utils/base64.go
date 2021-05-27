package utils

import (
	"encoding/base64"
	"strings"
)

// B64decode 解码base64字符串
func B64decode(b64str string) string {
	if b64str == "" {
		return ""
	}
	b64str = strings.ReplaceAll(b64str, "-", "+")
	b64str = strings.ReplaceAll(b64str, "_", "/")
	b64str = strings.ReplaceAll(b64str, "*", "=")
	decodeBytes, err := base64.StdEncoding.DecodeString(b64str)
	if err != nil {
		b64str = ""
	} else {
		b64str = string(decodeBytes)
	}
	return b64str
}

func B64encode(str string) string {
	if str == "" {
		return ""
	}
	b64str := base64.StdEncoding.EncodeToString([]byte(str))
	b64str = strings.ReplaceAll(b64str, "+", "-")
	b64str = strings.ReplaceAll(b64str, "/", "_")
	b64str = strings.ReplaceAll(b64str, "=", "*")
	return b64str
}
