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
	//要下载的文件名--IMG_2020_01.jpg
	Name string `json:"name"`
	//要下载的文件大小
	Size int64 `json:"size"`
	//
	//Path string `json:"path"`
	//dir 或者 文件sha1
	Hash string `json:"hash"`

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

//UpdateStateInit 初始化下载状态(点击start按钮)
func UpdateStateInit(item *DownFileModel) {
	item.IsCompleted = false
	item.FailedMessage = ""
	item.DownSpeedStr = ""
	item.IsFailed = false
	item.IsDowning = false
	item.IsStop = false
	item.AutoGID = 0
	item.AutoTry = 0
	//item.FailedCode = 0 这里不能更新0,因为需要永久的识别是否需要单线程下载
}

//UpdateStateError 更新下载状态(失败时也设置暂停)
func UpdateStateError(item *DownFileModel, FailedMessage string) {
	item.IsCompleted = false
	item.FailedMessage = FailedMessage
	item.DownSpeedStr = ""
	item.IsFailed = true
	item.IsDowning = false
	item.IsStop = true
	item.AutoTry = time.Now().Add(1 * time.Minute).Unix() //1分钟后自动重试
}

//UpdateStateDowning 更新下载状态(失败时也设置暂停)
func UpdateStateDowning(item *DownFileModel) {
	item.IsCompleted = false
	item.FailedMessage = ""
	item.DownSpeedStr = ""
	item.IsFailed = false
	item.IsDowning = true
	item.IsStop = false
	item.AutoGID = 0
	//item.AutoTry = 0 这里不能更新0
	//item.FailedCode = 0
}

//UpdateStateDowned 更新下载状态(失败时也设置暂停)
func UpdateStateDowned(item *DownFileModel) {
	item.IsCompleted = true
	item.FailedMessage = ""
	item.DownSpeedStr = ""
	item.IsFailed = false
	item.IsDowning = false
	item.IsStop = false
	item.AutoGID = 0
	item.AutoTry = 0
	item.FailedCode = 0
}

//UpdateStateStop 更新下载状态(失败时也设置暂停)
func UpdateStateStop(item *DownFileModel) {
	item.IsCompleted = false
	item.FailedMessage = ""
	item.DownSpeedStr = ""
	item.IsFailed = false
	item.IsDowning = false
	item.IsStop = true
	item.AutoGID = 0
	item.AutoTry = 0
	//item.FailedCode = 0 这里不能更新0,因为需要永久的识别是否需要单线程下载
}
