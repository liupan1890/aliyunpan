package download

import (
	"fmt"
	"hash/crc64"
	"time"
)

/*
{"filename":"新建文本文档.txt","sizestr":"572b","sizeint":572,
"key":"d6bfa93e23f9cfeb3d25897caa34a64e","path":"/2020062/新建文本文档.txt",
"datestr":"2020-10-19","dateint":1603038398091,"isdir":false,
}*/

//DownFileModel 下载上传
type DownFileModel struct {
	DownID string `json:"DownID"`
	GID    string `json:"GID"`
	UserID string `json:"UserID"`
	//本地文件路径
	DownSavePath string `json:"DownSavePath"`
	//下载域名
	DownServer string `json:"DownServer"`
	//FileInfo
	Identity string `json:"identity"`
	Name     string `json:"name"`
	Size     int64  `json:"size"`
	Path     string `json:"path"`
	Hash     string `json:"hash"`

	//downworker
	DownTime      int64  `json:"DownTime"`
	DownSize      int64  `json:"DownSize"`
	DownSpeed     int64  `json:"DownSpeed"`
	DownSpeedStr  string `json:"DownSpeedStr"`
	DownProcess   int64  `json:"DownProcess"`
	IsStop        bool   `json:"IsStop"`
	IsDowning     bool   `json:"IsDowning"`
	IsCompleted   bool   `json:"IsCompleted"`
	IsFailed      bool   `json:"IsFailed"`
	FailedMessage string `json:"FailedMessage"`
	AutoGID       int64
	AutoTry       int64
	FailedCode    int64
}

var crc64q = crc64.MakeTable(0xC96C5795D7870F42)

//GetGID GID前10位(crc64)
func GetGID(DownID string) string {
	hx := fmt.Sprintf("%010x", crc64.Checksum([]byte(DownID), crc64q))
	hx = hx[0:10]
	return hx
}

//GetGID2 GID后6位(时间)
func GetGID2() string {
	hx := fmt.Sprintf("%06x", time.Now().Unix())
	hx = hx[len(hx)-6:]
	return hx
}

//DownFileOrder 时间排序
type DownFileOrder []*DownFileModel

func (a DownFileOrder) Len() int           { return len(a) }
func (a DownFileOrder) Less(i, j int) bool { return a[i].DownTime > a[j].DownTime }
func (a DownFileOrder) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
