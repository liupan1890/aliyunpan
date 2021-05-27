package localhost

import (
	"aliserver/aliyun"
	"aliserver/data"
	"aliserver/utils"
	"log"
	"os"
	"path/filepath"
	"time"
)

//UpdateTimeAsync 执行一些定时的操作
func UpdateTimeAsync() {
	//1. 定时刷新公告
	//2. 定时刷新用户
	var GongGaoTime = 0
	var UserTime = 0
	var ReportTime = 0
	for {
		time.Sleep(time.Duration(3) * time.Second)
		GongGaoTime += 3
		UserTime += 3
		ReportTime += 3

		applock := filepath.Join(utils.ExePath(), "app.lock")
		fp, err := os.OpenFile(applock, os.O_CREATE|os.O_WRONLY, 2)
		if err != nil {
			//说明UI正在运行中
		} else {
			//说明UI退出了，后台服务进程也跟着退出
			log.Println("aliserver stop")
			fp.Close()
			StopServer()
		}

		if GongGaoTime >= 6*60*60 { //6小时刷新一次
			data.UpdateVerByTimer()
			GongGaoTime = 0
		}
		if UserTime >= 60 { //1分钟刷新一次(这里时间不重要，因为ApiUserInfo里会强制10分钟才真的刷新一次)
			aliyun.AutoRefreshUserInfo()
			UserTime = 0
		}

		if ReportTime >= 10*60 { //10分钟上报一次
			utils.ReportLog()
			ReportTime = 0
		}
	}
}
