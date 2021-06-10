// +build darwin

package utils

import (
	"errors"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/skratchdot/open-golang/open"
)

func IsWindows() bool {
	return false
}
func IsLinux() bool {
	return false
}
func IsDarwin() bool {
	return true
}

func OpenForder(DirPath string, FileName string) {
	open.Start(DirPath)
	//exec.Command("/bin/sh", "-c", "open", DirPath)
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

	dir := ExePath()
	aria := dir + "mpv"
	aria2c := "./mpv"

	if FileExists(aria) == false {
		return errors.New("mpv not exist " + aria)
	}
	args := []string{"--force-window=yes", "--referrer=https://www.aliyundrive.com/", "--user-agent=\"" + useragent + "\"", url}

	cmd := exec.Command(aria2c, args...)
	cmd.Dir = dir
	err := cmd.Start()
	if err != nil {
		return err
	}
	cmd.Process.Release()
	return nil
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
	//mac 因为沙盒不支持文件锁
	result, err := exec.Command("/bin/sh", "-c", "ps ux").Output()
	if err != nil {
		return true
	}
	log.Println(string(result))
	var index = strings.Index(string(result), "/Contents/MacOS/alixby")
	return index > 0
}
