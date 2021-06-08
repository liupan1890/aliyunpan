package data

import (
	"aliserver/utils"
	"log"
	"path/filepath"

	buntdb "github.com/tidwall/buntdb"
)

//APPDB APP数据库
var APPDB *buntdb.DB = nil

//Open 打开数据库
func Open() bool {
	exepath := utils.ExePath()
	log.Println("Start Path", exepath)
	var err error
	if APPDB != nil {
		return true
	}
	APPDB, err = buntdb.Open(filepath.Join(exepath, "user.db"))
	if APPDB != nil && err == nil {
		initData()
	}
	return APPDB != nil //打不开说明文件被占用，就是有其他实例正在运行中，直接退出
}

//Close 关闭数据库
func Close() {
	if APPDB != nil {
		APPDB.Close()
		APPDB = nil
	}
}

// 初始化数据库
func initData() {
	defer func() {
		if err := recover(); err != nil {
			log.Println("initDataError ", " error=", err)
		}
	}()
	var config buntdb.Config
	config.SyncPolicy = buntdb.Always
	APPDB.SetConfig(config)

	APPDB.Update(func(tx *buntdb.Tx) error {
		tx.CreateIndex("AliUser", "AliUser:*", buntdb.IndexString)
		tx.CreateIndex("Downing", "Down:Downing:*", buntdb.IndexJSON("DownTime"))
		tx.CreateIndex("Downed", "Down:Downed:*", buntdb.IndexJSON("DownTime"))
		tx.CreateIndex("Uploading", "Down:Uploading:*", buntdb.IndexJSON("DownTime"))
		tx.CreateIndex("Upload", "Down:Upload:*", buntdb.IndexJSON("DownTime"))
		tx.CreateIndex("Link", "Link:*", buntdb.IndexJSON("LogTime"))
		return nil
	})

	LoadSettingAndConfig() //启动后加载设置
}
