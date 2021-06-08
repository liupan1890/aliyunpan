package utils

import (
	"log"
	"os"
	"path/filepath"
)

var logFile *os.File = nil

//OpenLog 打开日志文件
func OpenLog() {
	if logFile != nil {
		return //已经打开了直接退出
	}

	exepath := ExePath()

	debuglog := filepath.Join(exepath, "debug.log")
	fi, err := os.Stat(debuglog)
	if err == nil && fi != nil {
		if fi.Size() > int64(3*1024*1024) {
			//3MB 自动删除
			os.Remove(debuglog)
		}
	}
	logFile, _ = os.OpenFile(debuglog, os.O_RDWR|os.O_CREATE|os.O_APPEND, 0766)
	log.SetOutput(logFile)
	log.SetPrefix("\r\n")
	log.SetFlags(log.LstdFlags | log.Lshortfile | log.Ldate)
}

//CloseLog 关闭日志文件
func CloseLog() {
	if logFile != nil {
		logFile.Sync()
		logFile.Close()
		logFile = nil
	}
}
