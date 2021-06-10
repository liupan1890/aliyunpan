// +build windows

package utils

import (
	"errors"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"syscall"
)

func IsWindows() bool {
	return true
}
func IsLinux() bool {
	return false
}
func IsDarwin() bool {
	return false
}

func OpenForder(DirPath string, FileName string) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("OpenForderError ", " error=", errr)
		}
	}()
	Full := filepath.Join(DirPath, FileName)
	if !PathExists(Full) {
		FileName = ""
	}
	if FileName != "" {
		cmd := exec.Command(`cmd`, `/c`, `explorer`, "/n,/select,", Full)
		cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
		cmd.Start()
	} else {
		cmd := exec.Command(`cmd`, `/c`, `explorer`, DirPath)
		cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
		cmd.Start()
	}
}

//RunDownFinish 下载完回调
func RunDownFinish(GID, FileNum, FilePath string) {
	shfilepath := filepath.Join(ExePath(), "downfinish.cmd")
	if FileExists(shfilepath) {
		cmd := exec.Command("cmd.exe")
		cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: false, CmdLine: "/c \"\"" + shfilepath + "\" " + GID + " " + FileNum + " \"" + FilePath + "\"\""}
		err := cmd.Start()
		if err != nil {
			log.Println("RunDownFinish", err)
		}
	}
}

//RunPlayer 调用播放器
func RunPlayer(playerpath string, url string, useragent string) error {
	cmd := exec.Command("cmd.exe")
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true, CmdLine: "/c \"\"" + playerpath + "\" --user-agent=\"" + useragent + "\" --force-window=yes --referrer=https://www.aliyundrive.com/ " + " \"" + url + "\"\""}
	return cmd.Start()
}

func RunAria() (bool, error) {
	dir := ExePath()
	aria := dir + "aria2c.exe"
	aria2c := "./aria2c.exe"

	if FileExists(aria) == false {
		return false, errors.New("aria2c not exist " + aria)
	}

	pid := strconv.Itoa(os.Getpid())
	args := []string{"--conf-path=aria2.conf", "--stop-with-process=" + pid}

	cmd := exec.Command(aria2c, args...)
	cmd.Dir = dir
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	err := cmd.Start()
	if err != nil {
		return true, err
	}
	return true, cmd.Process.Release()
}

func ProcessCheck() bool {
	applock := filepath.Join(ExePath(), "app.lock")
	fp, err := os.OpenFile(applock, os.O_CREATE|os.O_WRONLY, 2)
	if err != nil {
		//说明UI正在运行中
		return true
	} else {
		//说明UI退出了，后台服务进程也跟着退出
		fp.Close()
		return false
	}
}
