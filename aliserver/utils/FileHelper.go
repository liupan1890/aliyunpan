package utils

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
)

//PathExists 检测文件、文件夹是否存在
func PathExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil || os.IsExist(err)
}

func FileExists(path string) bool {
	info, err := os.Stat(path)

	if err != nil && !os.IsExist(err) {
		return false
	}
	if info != nil {
		return !info.IsDir()
	}
	return false
}

//IsDir 检测路径是否是文件夹
func IsDir(path string) bool {
	info, _ := os.Stat(path)
	if info != nil {
		return info.IsDir()
	}
	return false
}

//FileSize 读取文件大小
func FileSize(path string) int64 {
	info, _ := os.Stat(path)

	if info != nil { //文件存在
		return info.Size()
	}

	return -1
}

//CheckFileAndLen 检查文件是否存在，文件体积是否一致
func CheckFileAndLen(filePath string, fileSize int64) (isexist bool, issame bool, err error) {
	info, err := os.Stat(filePath)

	if info != nil { //文件存在
		isexist = true
		if info.Size() == fileSize {
			issame = true
		}
		err = nil
	}
	if err != nil && os.IsNotExist(err) { //文件不存在
		isexist = false
		issame = false
		err = nil
	}
	return isexist, issame, err
}

//FormateSizeString 格式化文件体积
func FormateSizeString(size int64) string {
	s := int64(0)
	switch {
	case size <= 0:
		return "0B"
	case size <= 1024: // B
		return fmt.Sprintf("%dB", size)
	case size < 1024*1024: // KB
		s = size / 1024
		if s > 99 {
			return strconv.FormatInt(s, 10) + "KB"
		}
		return fmt.Sprintf("%.1fKB", float64(size)/float64(1024))
	case size < 1024*1024*1024: // MB
		s = size / 1024 / 1024
		if s > 99 {
			return strconv.FormatInt(s, 10) + "MB"
		}
		return fmt.Sprintf("%.1fMB", float64(size)/float64(1024*1024))
	case size < 1024*1024*1024*1024: //GB
		s = size / 1024 / 1024 / 1024
		if s > 99 {
			return strconv.FormatInt(s, 10) + "GB"
		}
		return fmt.Sprintf("%.1fGB", float64(size)/float64(1024*1024*1024))
	default:
		s = size / 1024 / 1024 / 1024 / 1024
		if s > 99 {
			return strconv.FormatInt(s, 10) + "TB"
		}
		return fmt.Sprintf("%.1fTB", float64(size)/float64(1024*1024*1024*1024))
	}
}

//ExePath 程序启动目录 以/或\结尾
func ExePath() string {
	file, err := exec.LookPath(os.Args[0])
	if err == nil {
		file, _ = filepath.Split(file) //返回exe的完整路径，所以还要去掉文件名
	} else {
		file, err = os.Getwd() //返回所在文件夹
	}
	if err != nil {
		err = nil
		file = "./"
	}
	path, _ := filepath.Abs(file)
	//    Is Symlink
	fi, err := os.Lstat(path)
	if err == nil {
		if fi.Mode()&os.ModeSymlink == os.ModeSymlink {
			path2, err := os.Readlink(path)
			if err == nil {
				path = path2
			}
		}
	}
	var pathchar = string(os.PathSeparator)

	//结尾

	if !strings.HasSuffix(path, pathchar) {
		path = path + pathchar
	}

	return path
}

//ClearFileName 清理文件名
func ClearFileName(name string, file bool) string {
	if name != "." {
		name = filepath.Clean(name)
		if name == "." {
			return ""
		}
	}

	//< > / \ | :  * ?
	name = strings.Replace(name, "<", "_", -1)
	name = strings.Replace(name, ">", "_", -1)
	name = strings.Replace(name, "|", "_", -1)
	name = strings.Replace(name, ":", "_", -1)
	name = strings.Replace(name, "*", "_", -1)
	name = strings.Replace(name, "?", "_", -1)
	name = strings.Replace(name, "\\", "/", -1)
	//name = strings.Replace(name, "//", "/", -1)
	//name = strings.Replace(name, "//", "/", -1)
	//name = strings.Replace(name, "..", ".", -1)
	if file {
		name = strings.Replace(name, "/", "_", -1) //文件名清理掉/
	} else {
		var pathchar = string(os.PathSeparator) //mac linux
		if pathchar != "/" {
			name = strings.Replace(name, "/", pathchar, -1)
		}
	}
	return name
}

func JoinFilePath(dir string, file string) string {
	if file != "." {
		return filepath.Join(dir, file)
	}
	var pathchar = string(os.PathSeparator)
	return strings.TrimRight(strings.TrimRight(dir, "\\"), "/") + pathchar + file
}
