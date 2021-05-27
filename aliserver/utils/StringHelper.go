package utils

import (
	"bytes"
	"crypto/md5"
	"encoding/hex"
	"io/ioutil"
	"strings"

	"golang.org/x/text/encoding/simplifiedchinese"
	"golang.org/x/text/encoding/traditionalchinese"
	"golang.org/x/text/encoding/unicode"
	"golang.org/x/text/transform"
)

//ToMd5 计算字符串的md5
func ToMd5(str string) string {
	m := md5.New()
	m.Write([]byte(str))
	return hex.EncodeToString(m.Sum(nil))
}

//IsContain 是否包含
func IsContain(items []string, item string) bool {
	for _, eachItem := range items {
		if eachItem == item {
			return true
		}
	}
	return false
}

//Big5ToUtf8 big5
func Big5ToUtf8(s []byte) ([]byte, error) {
	reader := transform.NewReader(bytes.NewReader(s), traditionalchinese.Big5.NewDecoder())
	d, e := ioutil.ReadAll(reader)
	if e != nil {
		return nil, e
	}
	return d, nil
}

//GbkToUtf8 GBK转UTF8
func GbkToUtf8(s []byte) ([]byte, error) {
	reader := transform.NewReader(bytes.NewReader(s), simplifiedchinese.GBK.NewDecoder())
	d, e := ioutil.ReadAll(reader)
	if e != nil {
		return nil, e
	}
	return d, nil
}

//GB18030ToUtf8 GB转UTF8
func GB18030ToUtf8(s []byte) ([]byte, error) {
	reader := transform.NewReader(bytes.NewReader(s), simplifiedchinese.GB18030.NewDecoder())
	d, e := ioutil.ReadAll(reader)
	if e != nil {
		return nil, e
	}
	return d, nil
}

//UTF16LEToUtf8 小端
func UTF16LEToUtf8(s []byte) ([]byte, error) {
	decoder := unicode.UTF16(unicode.LittleEndian, unicode.IgnoreBOM).NewDecoder()
	d, e := decoder.Bytes(s)
	if e != nil {
		return nil, e
	}
	return d, nil
}

// UTF16BEToUtf8 大端
func UTF16BEToUtf8(s []byte) ([]byte, error) {
	decoder := unicode.UTF16(unicode.BigEndian, unicode.IgnoreBOM).NewDecoder()
	d, e := decoder.Bytes(s)
	if e != nil {
		return nil, e
	}
	return d, nil
}

func SubStr(html, key string) string {
	var findkey = "\"" + key + "\":\""
	var findindex = strings.Index(html, findkey)
	if findindex < 0 {
		return ""
	}
	var find = html[findindex+len(findkey):]
	return find[0:strings.Index(find, "\"")]
}

func SubInt(html, key string) string {
	var findkey = "\"" + key + "\":"
	var findindex = strings.Index(html, findkey)
	if findindex < 0 {
		return ""
	}
	var find = html[findindex+len(findkey):]

	var f1 = strings.Index(find, ",")
	var f2 = strings.Index(find, "}")
	var f0 = 0
	if f1 >= 0 {
		f0 = f1
	}
	if f2 >= 0 && f2 < f0 {
		f0 = f2
	}
	return find[0:f0]
}
