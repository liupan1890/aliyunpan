package upload

import (
	"errors"
	"os"
	"path/filepath"
)

//BigUploadInfo 要上传的文件的信息
type BigUploadInfo struct {
	//上传任务的ID
	UploadID   string
	UploadTime int64
	ParentID   string
	FileID     string

	//要上传的文件的本地完整地址
	FileFullPath string
	FileName     string
	FileSize     int64
	//sha1
	FileHash    string
	FilePreHash string
	//并发数
	ThreadMax int
	//默认是10MB
	BlockSize int64
	//上传文件所有分片信息
	BlockList []*BigUploadBlock
}

//BigUploadBlock 一个Block（4MB倍数）,Block可以并发上传
type BigUploadBlock struct {
	ID          int
	BeginOffset int64
	EndOffset   int64

	//是否已成功下载
	IsUploadSuccess bool
}

func (info *BigUploadInfo) getFileSize() error {
	if info.FileFullPath == "" {
		return errors.New("UploadFile cannot be nil")
	}
	file, err := os.Stat(info.FileFullPath)
	if err != nil {
		return err
	}
	info.FileSize = file.Size()
	return nil
}

//creatBlockList 创建所有的分片列表
func (info *BigUploadInfo) creatBlockList() error {
	if info.FileSize < 0 {
		return errors.New("fileSize cannot be -1")
	}
	//生成所有分片
	info.BlockList = []*BigUploadBlock{}
	var temp int64 = 0
	for (temp + info.BlockSize) < info.FileSize {
		info.BlockList = append(info.BlockList, &BigUploadBlock{
			ID:          len(info.BlockList),
			BeginOffset: temp,
			EndOffset:   temp + info.BlockSize - 1,
		})
		temp += info.BlockSize
	}
	endOffset := int64(0)
	if info.FileSize > 0 {
		endOffset = info.FileSize - 1
	}
	info.BlockList = append(info.BlockList, &BigUploadBlock{
		ID:          len(info.BlockList),
		BeginOffset: temp,
		EndOffset:   endOffset,
	})
	return nil
}

//NewBigUploadInfoAutoBlock 创建一个文件上传信息(根据threadMax自动计算分片大小)(err 没有文件大小联网请求大小出错)
func NewBigUploadInfoAutoBlock(ParentID string, FileFullPath string, FileName string, fileSize int64, blockSize int64, threadMax int) (info *BigUploadInfo, err error) {
	if blockSize <= 0 {
		blockSize = 1024 * 1024 * 4 //必须是4MB的倍数
	}
	if threadMax <= 0 {
		threadMax = 1
	}

	FileFullPath, _ = filepath.Abs(FileFullPath)
	info = &BigUploadInfo{
		UploadID:     "",
		ParentID:     ParentID,
		FileFullPath: FileFullPath,
		FileName:     FileName,
		FileSize:     fileSize,
		FileHash:     "",
		ThreadMax:    threadMax,
		BlockSize:    blockSize,
	}
	if info.FileSize <= 0 {
		info.getFileSize()
	}

	if err == nil {
		err = info.creatBlockList()
	}
	return info, err
}
