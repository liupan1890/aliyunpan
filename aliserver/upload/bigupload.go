package upload

import (
	"aliserver/aliyun"
	"aliserver/utils"
	"bytes"
	"crypto/tls"
	"errors"
	"log"
	"math"
	"net/http"
	"os"
	"sync"
	"time"
)

//BigUploadWorker 一个上传文件的Worker
type BigUploadWorker struct {
	UploadInfo       *BigUploadInfo
	client           *http.Client
	filePtr          *os.File
	fileLock         sync.Mutex
	UploadSpeed      int64
	UploadSpeedStr   string
	UploadSize       int64
	UploadSizeStr    string
	UploadProcess    int64
	UploadProcessStr string
	IsUpdateing      int64
	IsUploading      bool
	IsCompleted      bool
	IsMakeFile       bool
	IsFailed         bool
	FailedMessage    string
	WaitUploading    sync.WaitGroup

	//每隔1s调用一次更新进度(主要用来保存进度json)
	OnUpdate func(worker *BigUploadWorker)
	//完成回调 全部下载结束后调用
	OnCompleted func(worker *BigUploadWorker)
	//失败回调 全部下载结束后调用
	OnFailed func(worker *BigUploadWorker)
}

//chekcAllCompleted 检测是否全部分片都已经成功下载
func (worker *BigUploadWorker) chekcAllBlockCompleted() bool {
	for _, block := range worker.UploadInfo.BlockList {
		if block.IsUploadSuccess == false {
			return false
		}
	}
	return true
}

//openUploadFile 打开要上传的文件
func (worker *BigUploadWorker) openUploadFile() error {
	if utils.IsDir(worker.UploadInfo.FileFullPath) {
		return errors.New("UploadFile cannot be dir") //路径错误
	}

	filePtr, erropen := os.OpenFile(worker.UploadInfo.FileFullPath, os.O_RDONLY, 0666)
	if erropen != nil {
		return erropen //打开文件失败
	}
	worker.filePtr = filePtr
	return nil //打开文件成功
}

//NewBigUploadWorker 创建一个worker去上传一个文件
func NewBigUploadWorker(info *BigUploadInfo,
	onUpdate func(worker *BigUploadWorker),
	onCompleted func(worker *BigUploadWorker),
	onFailed func(worker *BigUploadWorker)) *BigUploadWorker {

	client := &BigUploadWorker{
		UploadInfo: info,
		client: &http.Client{
			Transport: &http.Transport{
				DisableKeepAlives:     true,
				ResponseHeaderTimeout: time.Second * 30,
			},
		},
		OnUpdate:    onUpdate,
		OnCompleted: onCompleted,
		OnFailed:    onFailed,
	}
	return client
}

//StopUploadSync 同步的，停止上传
func (worker *BigUploadWorker) StopUploadSync() {
	if worker.IsUploading {
		worker.IsUploading = false
	}
	worker.WaitUploading.Wait() //因为是暂停，所以不会执行OnCompleted,会执行OnFaile
	//fmt.Println(time.Now(), "StopUploadSync Wait")
}

//StopUploadAsync 异步的，停止上传
func (worker *BigUploadWorker) StopUploadAsync() {
	if worker.IsUploading {
		worker.IsUploading = false
	}
}

//StartUploadAsync 异步的，开始上传，立即返回
func (worker *BigUploadWorker) StartUploadAsync(AutoRange bool) {
	go worker.StartUploadSync(AutoRange)
}

//StartUploadSync 同步的，开始下载，等待下载结束(出错返回err)
func (worker *BigUploadWorker) StartUploadSync(AutoRange bool) {
	worker.IsUploading = true //标记开始下载这一个文件

	if worker.UploadInfo.FileFullPath == "miaochuan" {
		//单独执行秒传
		same, _, _, err := aliyun.UploadCreatFile(worker.UploadInfo.ParentID, worker.UploadInfo.FileName, worker.UploadInfo.FileSize, worker.UploadInfo.FileHash)
		if err != nil {
			worker.IsFailed = true             //会导致全部blockWorker停止
			worker.FailedMessage = err.Error() //更新错误信息
			worker.IsCompleted = false
		} else if same {
			worker.IsCompleted = true //秒传成功了
			worker.IsMakeFile = true  //不需要合并
		} else {
			worker.IsFailed = true        //会导致全部blockWorker停止
			worker.FailedMessage = "秒传失败" //更新错误信息
			worker.IsCompleted = false
		}
		worker.finishUpload()
		return
	}

	err := worker.openUploadFile()
	if err != nil { //打开文件时出错了
		worker.IsFailed = true             //会导致全部blockWorker停止
		worker.FailedMessage = err.Error() //更新错误信息
		worker.IsCompleted = false
		worker.finishUpload()
		return
	}

	//统计每个分片已经下载的体积
	listlen := len(worker.UploadInfo.BlockList)
	if worker.UploadInfo.UploadTime > 0 && worker.UploadInfo.UploadTime < (time.Now().Unix()-60*60*4) {
		//超过4个小时的，不断点续传了，重新开始
		worker.UploadInfo.UploadID = ""
		worker.UploadInfo.FileID = ""
		for i := 0; i < listlen; i++ {
			block := worker.UploadInfo.BlockList[i]
			block.IsUploadSuccess = false
		}
	}
	worker.UploadSize = 0
	for i := 0; i < listlen; i++ {
		block := worker.UploadInfo.BlockList[i]
		blockLen := block.EndOffset - block.BeginOffset + 1
		if block.EndOffset == block.BeginOffset {
			blockLen = 0
		}
		if block.IsUploadSuccess == true {
			worker.UploadSize += blockLen
		}
	}

	if worker.UploadInfo.FileHash == "" {
		worker.FailedMessage = "计算sha1中"
		hash, err := aliyun.ComputeAliFileSha1(worker.filePtr, worker.UploadInfo.FileSize)
		if err != nil {
			worker.IsFailed = true             //会导致全部blockWorker停止
			worker.FailedMessage = err.Error() //更新错误信息
			worker.IsCompleted = false
			worker.finishUpload()
			return
		}
		worker.UploadInfo.FileHash = hash.Hash
		worker.UploadInfo.FilePreHash = hash.Pre_hash
		worker.FailedMessage = ""
	}
	//这里是，联网获取阿里的UploadID，检测是否能秒传
	if worker.UploadInfo.UploadID == "" {
		same, uploadid, fileid, err := aliyun.UploadCreatFile(worker.UploadInfo.ParentID, worker.UploadInfo.FileName, worker.UploadInfo.FileSize, worker.UploadInfo.FileHash)
		if err != nil {
			worker.IsFailed = true             //会导致全部blockWorker停止
			worker.FailedMessage = err.Error() //更新错误信息
			worker.IsCompleted = false
			worker.finishUpload()
			return
		}
		worker.UploadInfo.UploadID = uploadid
		worker.UploadInfo.UploadTime = time.Now().Unix() //秒
		worker.UploadInfo.FileID = fileid
		if same {
			worker.IsCompleted = true
			worker.IsMakeFile = true //不需要合并
		}
	}

	if worker.IsFailed || worker.IsCompleted { //有秒传
		worker.finishUpload()
		return
	}
	//获取上传URL失败
	if worker.UploadInfo.UploadID == "" || worker.UploadInfo.FileID == "" { //没有下载地址
		worker.IsFailed = true
		worker.FailedMessage = "上传地址不能为空"
		worker.IsCompleted = false
		worker.finishUpload()
		return
	}
	worker.IsUpdateing = 1
	go func() { //计算下载速度
		oldSize := worker.UploadSize
		time.Sleep(time.Duration(1) * time.Second)
		for worker.IsUpdateing > 0 {
			worker.IsUpdateing++
			if worker.UploadSize > worker.UploadInfo.FileSize {
				worker.UploadSize = worker.UploadInfo.FileSize
			}
			worker.UploadSpeed = (worker.UploadSize - oldSize + worker.UploadSpeed) / 2 //下载速度
			worker.UploadSpeedStr = utils.FormateSizeString(worker.UploadSpeed) + "/s"
			//worker.UploadSizeStr = utils.FormateSizeString(worker.UploadSize)
			worker.UploadProcess = oldSize * 100 / (worker.UploadInfo.FileSize + 1)
			if worker.UploadProcess > 99 {
				worker.UploadProcess = 99
			}
			//worker.UploadProcessStr = strconv.Itoa(int(oldSize*100/(worker.UploadInfo.FileSize+1))%100) + "%" //可能会超过100%所以要%100取余
			oldSize = worker.UploadSize

			if worker.OnUpdate != nil {
				worker.OnUpdate(worker) //可以用来保存json进度
			}
			time.Sleep(time.Duration(1) * time.Second)
		}
	}()

	//最大并发数,多线程并发下载
	threadMax := int(math.Min(float64(worker.UploadInfo.ThreadMax), float64(len(worker.UploadInfo.BlockList))))
	//fmt.Println("threadReal=", threadMax)
	blockIndex := make(chan int)
	for i := 0; i < threadMax; i++ { //初始化启动threadMax个协程
		go blockWorker(worker, blockIndex) //协程开始去轮询下载一个分片
	}
	//按顺序循环下载所有分片
	for i := 0; i < listlen; i++ {
		block := worker.UploadInfo.BlockList[i]
		if worker.IsUploading == false || worker.IsFailed {
			//fmt.Println("stop", worker.UploadInfo)
			break //手动停止              有一个分片出错  都会导致退出
			//退出是安全的，会等所有正在 下载中 的分片都处理完才真的退出
		}

		if block.IsUploadSuccess == false { //下载这个分片
			worker.WaitUploading.Add(1) //每分配一个分片，都要wait计数
			blockIndex <- i             //可能会阻塞
		}
	}

	worker.WaitUploading.Wait() //等待所有正在 下载中 的分片都处理完
	close(blockIndex)           //关闭blockIndex,进而关闭所有blockWorker
	worker.IsUpdateing = 0
	//执行最终的回调(OnFailed,OnCompleted)

	worker.finishUpload() //worker.IsUploading = false
}

//finishUpload 全部分块结束上传后执行回调
func (worker *BigUploadWorker) finishUpload() {
	//fmt.Println(time.Now(), "finishUpload begin")
	//1 有一个分片上传出错时IsFailed=true
	//2 手动停止时IsFailed=false IsUploading=false(没用),chekcAllBlockCompleted==false

	//先关闭文件句柄
	if worker.filePtr != nil {
		worker.filePtr.Close()
		worker.filePtr = nil
	}

	if worker.IsFailed == false && worker.IsCompleted == false && worker.chekcAllBlockCompleted() {
		worker.IsCompleted = true //确认全部分块上传成功
	}

	if worker.IsCompleted && worker.IsMakeFile == false { //合并文件
		worker.FailedMessage = "正在合并文件"
		errmk := aliyun.UploadFileComplete(worker.UploadInfo.ParentID, worker.UploadInfo.FileName, worker.UploadInfo.FileID, worker.UploadInfo.UploadID)
		worker.FailedMessage = ""
		//fmt.Println(time.Now(), "MakeFile", errmk)
		if errmk != nil {
			//合并出错，清除所有，重新上传
			worker.UploadInfo.UploadID = ""
			worker.UploadInfo.FileID = ""
			for i := 0; i < len(worker.UploadInfo.BlockList); i++ {
				block := worker.UploadInfo.BlockList[i]
				block.IsUploadSuccess = false
			}

			worker.IsFailed = true               //会导致全部blockWorker停止
			worker.FailedMessage = errmk.Error() //更新错误信息
			worker.IsCompleted = false
		} else {
			worker.IsMakeFile = true
		}
	}

	if worker.IsCompleted {
		//修正已下载的文件大小
		//多线程可能导致worker.UploadSize丢失变少
		worker.UploadSize = worker.UploadInfo.FileSize
		worker.UploadSizeStr = utils.FormateSizeString(worker.UploadInfo.FileSize)
	}
	//已经下载完了，先回调OnCompleted，可以计算md5之类，如果出错还可以设置worker.IsFailed=true
	if worker.IsCompleted && worker.IsMakeFile && worker.OnCompleted != nil {
		worker.OnCompleted(worker)
		return
	}
	//最后检查是否有错误
	if worker.IsFailed {
		//先修正错误提示
		worker.FailedMessage = utils.NetErrorMessage(worker.FailedMessage)
	}
	if worker.OnFailed != nil {
		worker.OnFailed(worker)
	}
	worker.IsUploading = false
	//fmt.Println(time.Now(), "finishUpload exit")
}

//blockWorker 分片上传线程
func blockWorker(worker *BigUploadWorker, blockIndex <-chan int) {
	defer func() {
		if err := recover(); err != nil {
			log.Println("UPblockWorkerError ", " error=", err)
			worker.IsFailed = true
			worker.FailedMessage = utils.NetErrorMessage("异常崩溃")
			worker.IsCompleted = false
		}
	}()

	for i := range blockIndex { //循环等待获得一个分片开始下载,或者close(chan)

		var err error = nil
		for t := 0; t < 5; t++ {
			err = blockWorkerUpload(worker, i)
			//fmt.Println(i, "blockWorkerUpload", err)
			if err == nil {
				break //成功下载或者被取消下载
			}
		}
		//多次下载失败，最后这里会有失败信息
		if err != nil && worker.IsFailed == false {
			worker.IsFailed = true                                    //会导致全部blockWorker停止
			worker.FailedMessage = utils.NetErrorMessage(err.Error()) //更新错误信息
			worker.IsCompleted = false
		}
		worker.WaitUploading.Done() //每个分片下载结束时，都清理wait
	}
}

//blockWorkerUpload 真的上传一个分片,上传失败返回错误信息,上传成功或者被取消都返回nil
func blockWorkerUpload(worker *BigUploadWorker, blockIndex int) (err error) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("blockWorkerUploadError ", " error=", errr)
			err = errors.New("error")

		}
	}()

	if worker.IsUploading == false {
		return nil
	}

	block := worker.UploadInfo.BlockList[blockIndex]

	if block.IsUploadSuccess {
		return nil
	}
	//fmt.Println(block.ID)
	//读取文件数据
	readed := false
	blockSize := block.EndOffset - block.BeginOffset + 1
	if block.EndOffset == block.BeginOffset {
		blockSize = 0
	}
	buff := make([]byte, blockSize)
	worker.fileLock.Lock()
	_, werr := worker.filePtr.Seek(block.BeginOffset, 0)
	if werr == nil {
		n, werr := worker.filePtr.Read(buff)
		if werr == nil && n == len(buff) {
			readed = true
		}
	}
	worker.fileLock.Unlock()
	if readed == false {
		return errors.New("upload Read Buff From File Error")
	}
	//联网读取url
	uploadurl, err := aliyun.UploadFilePartUrl(worker.UploadInfo.ParentID, worker.UploadInfo.FileName, worker.UploadInfo.FileID, worker.UploadInfo.UploadID, blockIndex+1, blockSize)
	if err != nil {
		return err
	}
	//分片执行上传写入操作
	body := &ProgressReader{bytes.NewReader(buff), func(r int64) bool {
		worker.UploadSize += r
		return worker.IsUploading
	}}
	request, err := http.NewRequest("PUT", uploadurl, body)
	request.Header.Set("Expect", "100-continue")

	//var proxyurl, _ = url.Parse("http://192.168.31.75:8888")
	tr := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		//	Proxy:           http.ProxyURL(proxyurl),
	}
	resp, err := (&http.Client{Transport: tr}).Do(request)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	block.IsUploadSuccess = true
	return nil //上传成功
}

type ProgressReader struct {
	*bytes.Reader
	Reporter func(r int64) bool
}

func (pr *ProgressReader) Read(p []byte) (n int, err error) {
	n, err = pr.Reader.Read(p)
	if pr.Reporter(int64(n)) == false {
		return 0, errors.New("user stop")
	}
	return n, err
}
