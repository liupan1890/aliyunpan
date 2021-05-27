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
	exec.Command("open", DirPath)
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
	if strings.HasPrefix(strings.ToLower(playerpath), "/applications/") == false {
		return errors.New("mac player 必须类似/Applications/xxx.app")
	}
	err := open.StartWith(url, playerpath)
	return err
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
