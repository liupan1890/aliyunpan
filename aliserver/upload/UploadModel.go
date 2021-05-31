package upload

import (
	"hash/crc64"
	"time"
)

//DownFileModel 上传上传
type UploadFileModel struct {
	UploadID string `json:"UploadID"`
	UserID   string `json:"UserID"`
	//FileInfo
	Name      string `json:"name"`
	Size      int64  `json:"size"`
	LocalPath string `json:"localpath"`
	ParentID  string `json:"ParentID"`
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
	AutoTry       int64
	FailedCode    int64

	Uploader *BigUploadInfo
}

var crc64q = crc64.MakeTable(0xC96C5795D7870F42)

//DownFileOrder 时间排序
type UploadFileOrder []*UploadFileModel

func (a UploadFileOrder) Len() int           { return len(a) }
func (a UploadFileOrder) Less(i, j int) bool { return a[i].DownTime > a[j].DownTime }
func (a UploadFileOrder) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }

//UpdateStateInit 初始化上传状态(点击start按钮)
func UpdateStateInit(item *UploadFileModel) {
	item.IsCompleted = false
	item.FailedMessage = ""
	item.DownSpeedStr = ""
	item.IsFailed = false
	item.IsDowning = false
	item.IsStop = false
	item.AutoTry = 0
	//item.FailedCode = 0 这里不能更新0,因为需要永久的识别是否需要单线程上传
}

//UpdateStateError 更新上传状态(失败时也设置暂停)
func UpdateStateError(item *UploadFileModel, FailedMessage string) {
	item.IsCompleted = false
	item.FailedMessage = FailedMessage
	item.DownSpeedStr = ""
	item.IsFailed = true
	item.IsDowning = false
	item.IsStop = true
	item.AutoTry = time.Now().Add(1 * time.Minute).Unix() //1分钟后自动重试
}

//UpdateStateUploading 更新上传状态(失败时也设置暂停)
func UpdateStateUploading(item *UploadFileModel) {
	item.IsCompleted = false
	item.FailedMessage = ""
	item.DownSpeedStr = ""
	item.IsFailed = false
	item.IsDowning = true
	item.IsStop = false
	//item.AutoTry = 0 这里不能更新0
	//item.FailedCode = 0
}

//UpdateStateUpload 更新上传状态(失败时也设置暂停)
func UpdateStateUpload(item *UploadFileModel) {
	item.IsCompleted = true
	item.FailedMessage = ""
	item.DownSpeedStr = ""
	item.IsFailed = false
	item.IsDowning = false
	item.IsStop = false
	item.AutoTry = 0
	item.FailedCode = 0
}

//UpdateStateStop 更新上传状态(失败时也设置暂停)
func UpdateStateStop(item *UploadFileModel) {
	item.IsCompleted = false
	item.FailedMessage = ""
	item.DownSpeedStr = ""
	item.IsFailed = false
	item.IsDowning = false
	item.IsStop = true
	item.AutoTry = 0
	//item.FailedCode = 0 这里不能更新0,因为需要永久的识别是否需要单线程上传
}
