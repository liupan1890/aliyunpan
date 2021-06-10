// +build linux

package utils

import (
	"errors"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
)

func IsWindows() bool {
	return false
}
func IsLinux() bool {
	return true
}
func IsDarwin() bool {
	return false
}
func OpenForder(DirPath string, FileName string) {
	exec.Command("xdg-open", DirPath)
}

//RunDownFinish 下载完回调
func RunDownFinish(GID, FileNum, FilePath string) {
	shfilepath := filepath.Join(ExePath(), "downfinish.sh")
	//fmt.Println("shfilepath", shfilepath)
	if FileExists(shfilepath) {
		cmd := exec.Command("sh", shfilepath, GID, FileNum, FilePath)
		err := cmd.Start()
		if err != nil {
			log.Println("RunDownFinish", err)
		}
	}
}

//RunPlayer 调用播放器
func RunPlayer(playerpath string, url string, useragent string) error {
	useragent = strings.ReplaceAll(useragent, " ", "")
	cmd := exec.Command("sh", "-c", "mpv --force-window=yes --referrer=https://www.aliyundrive.com/ --user-agent="+useragent+" \""+url+"\"")
	return cmd.Start()
}

func RunAria() (bool, error) {
	dir := ExePath()
	aria := dir + "aria2c"
	aria2c := "./aria2c"

	if FileExists(aria) == false {
		return false, errors.New("aria2c not exist " + aria)
	}

	pid := strconv.Itoa(os.Getpid())
	args := []string{"--conf-path=aria2.conf", "--stop-with-process=" + pid}

	cmd := exec.Command(aria2c, args...)
	cmd.Dir = dir
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
