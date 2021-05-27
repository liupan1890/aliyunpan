package download

import (
	"aliserver/data"
	"aliserver/rpc"
	"aliserver/utils"
	"context"
	"fmt"
	"log"
	"time"
)

var Aria2Rpc rpc.Client

//Aria2Server IP:port
var Aria2Server = "http://localhost:29386/jsonrpc"

//Aria2Token token
var Aria2Token = "S4znWTaZYQ!i3cp^RN_b"

//AriaOnline 是否使用Aria
var AriaOnline = false

// LaunchAria2c launchs aria2 daemon to listen for RPC calls, locally.
func LaunchAria2c() error {
	log.Println("LaunchAria2c", Aria2Server, Aria2Token, AriaOnline)
	var err error
	AriaOnline, err = utils.RunAria()
	if err != nil {
		log.Println("LaunchAria2cError", err)
		return err
	}
	return err
}

//Aria2Connect 程序启动时，链接到aria
func Aria2Connect() error {
	if AriaOnline {
		var err error
		Aria2Rpc, err = rpc.New(context.Background(), Aria2Server, Aria2Token, time.Second*10, nil)
		if err != nil {
			return err
		}
		version, err := Aria2Rpc.GetVersion()
		if err != nil {
			log.Println("Aria2ConnectError", err)
			return err
		}
		option := rpc.Option{}
		if data.Setting.DownSpeed != "" {
			option["max-overall-download-limit"] = data.Setting.DownSpeed + "M"
		} else {
			option["max-overall-download-limit"] = 0
		}
		Aria2Rpc.ChangeGlobalOption(option)
		log.Println("connectTo", Aria2Server, version.Version)

		go ariaDisconnectionMonitoring()
	}
	return nil
}

//Aria2Close 程序退出时，关闭aria
func Aria2Close() {
	if Aria2Rpc != nil {
		Aria2Rpc.Close()
	}
}

func Aria2ResetMax() {
	option := rpc.Option{}
	if data.Setting.DownSpeed != "" {
		option["max-overall-download-limit"] = data.Setting.DownSpeed + "M"
	} else {
		option["max-overall-download-limit"] = 0
	}
	set1, _ := Aria2Rpc.ChangeGlobalOption(option)
	log.Println("Reset DownSpeed", set1, data.Setting.DownSpeed)
}

/**
断线自动重连
*/
func ariaDisconnectionMonitoring() {
	timeout := 1
	for {
		time.Sleep(time.Second * time.Duration(2))
		_, terr := Aria2Rpc.GetVersion()
		if terr != nil {
			log.Println("ariaDisconnect")
			fmt.Println("ariaDisconnect")
			Aria2Rpc.Close()
			LaunchAria2c()
			time.Sleep(time.Second * time.Duration(5))
			aria2Rpc, err := rpc.New(context.Background(), Aria2Server, Aria2Token, time.Second*10, nil)
			version, err2 := Aria2Rpc.GetVersion()
			for err != nil || err2 != nil {
				log.Println("reconnectionFailed", timeout, timeout)
				fmt.Println("reconnectionFailed", timeout, timeout)
				if timeout > 60 {
					timeout = 60
				}
				time.Sleep(time.Second * time.Duration(timeout))
				timeout++
				aria2Rpc.Close()
				LaunchAria2c()
				time.Sleep(time.Second * time.Duration(5))
				aria2Rpc, err = rpc.New(context.Background(), Aria2Server, Aria2Token, time.Second*10, nil)
				version, err2 = aria2Rpc.GetVersion()
			}
			option := rpc.Option{}
			if data.Setting.DownSpeed != "" {
				option["max-overall-download-limit"] = data.Setting.DownSpeed + "M"
			} else {
				option["max-overall-download-limit"] = 0
			}
			aria2Rpc.ChangeGlobalOption(option)
			log.Println("reconnectSuccess", version.Version)
			fmt.Println("reconnectSuccess", version.Version)
			timeout = 1
		}
	}
}
