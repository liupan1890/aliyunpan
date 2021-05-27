package main

import (
	"fmt"
	"log"
	"os"

	"aliserver/aliyun"
	"aliserver/data"
	"aliserver/download"
	"aliserver/localhost"
	"aliserver/utils"
)

func main() {
	defer func() {
		if err := recover(); err != nil {
			fmt.Println("MainError ", " error=", err)
			log.Println("MainError ", " error=", err)
		}
	}()
	//打开日志文件
	utils.OpenLog()
	log.Println("\r\n\r\n\r\n\r\naliserver start ")

	//检测其他实例
	if localhost.GetPing() {
		fmt.Println("Start Break An instance is already running")
		log.Println("Start Break An instance is already running")
	}
	//打开数据库
	if !data.Open() {
		fmt.Println("Start Database Error")
		log.Println("Start Database Error")
		return //打不开说明文件被占用，就是有其他实例正在运行中，直接退出
	}
	//连接到远程服务器检查版本
	go data.UpdateVerAsyncByStart()
	go localhost.UpdateTimeAsync()
	//读取用户数据
	aliyun.LoadUserFromDB()
	download.LoadDownedList()
	download.LoadDowningList()
	//download.LoadUploadList()
	//download.LoadUploadingList()
	log.Println("all userdata loaded")
	// 启动监听
	go localhost.ListenServer()

	download.LaunchAria2c()
	download.Aria2Connect() //只能在这里调用一次
	//开始下载主线程
	go download.StartDowning()
	//开始上传主线程
	//go localhost.StartUploading()
	//一直阻塞,等待结束
	localhost.WaitingUntilStopServer()

	download.Aria2Close()
	download.StopDowning()
	//localhost.StUploading()
	data.Close()
	//程序退出
	fmt.Println("aliserver exit")
	log.Println("alirver exit")
	utils.CloseLog()

	os.Exit(0)
}
