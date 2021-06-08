package aliyun

import (
	"errors"
	"log"
	"strconv"
	"strings"
	"sync"
)

type LinkFileModel struct {
	DirList  []*LinkFileModel `json:"DirList"`
	FileList []string         `json:"FileList"`
	Name     string           `json:"Name"`
	Size     int64            `json:"Size"`
	Message  string
}

func (b LinkFileModel) GetDirCount() int {
	count := len(b.DirList)
	for i := 0; i < len(b.DirList); i++ {
		count += b.DirList[i].GetDirCount()
	}
	return count
}
func (b LinkFileModel) GetFileCount() int {
	count := len(b.FileList)
	for i := 0; i < len(b.DirList); i++ {
		count += b.DirList[i].GetFileCount()
	}
	return count
}
func (b LinkFileModel) GetTotalSize() int64 {
	count := b.Size
	for i := 0; i < len(b.DirList); i++ {
		count += b.DirList[i].GetTotalSize()
	}
	return count
}

//ApiFileListAllForLink 读取一个文件夹的信息(文件列表)(遍历子文件夹)
func ApiFileListAllForLink(file_id string, name string) (link *LinkFileModel, err error) {
	for i := 0; i < 3; i++ {
		link, err = _ApiFileListAllForLink(file_id, name)
		if err == nil {
			return link, nil
		}
	}
	return nil, errors.New("error")
}

//_ApiFileListAllForLink  读取一个文件夹的信息(文件列表)(遍历子文件夹)
func _ApiFileListAllForLink(file_id string, name string) (link *LinkFileModel, err error) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("_ApiFileListAllForLinkError ", " error=", errr)
			err = errors.New("error")
		}
	}()
	var marker = ""
	var list = []*FileUrlModel{}
	for {
		flist, next, ferr := ApiFileListUrl(file_id, name, marker)
		if ferr != nil {
			return nil, errors.New("error") //有错误直接退出
		}
		if len(flist) > 0 {
			list = append(list, flist...)
		}
		marker = next
		if next == "" {
			break
		}
	}
	link = &LinkFileModel{
		DirList:  []*LinkFileModel{},
		FileList: []string{},
		Name:     name,
		Message:  "",
		Size:     0,
	}
	var wg sync.WaitGroup
	var lock sync.Mutex
	errnum := 0
	var max = len(list)
	for i := 0; i < max; i++ {
		var item = list[i]
		if item.IsDir {
			wg.Add(1)
			go func(item *FileUrlModel) {
				dir, derr := ApiFileListAllForLink(item.P_file_id, item.P_file_name)
				//注意这里，如果子文件夹遍历时出错了，直接退出，确保要么全部成功，要么全部失败，不丢失
				if derr != nil {
					errnum++
				} else {
					lock.Lock()
					link.DirList = append(link.DirList, dir)
					lock.Unlock()
				}
				wg.Done()
			}(item)
		} else {
			link.Size += item.P_size
			link.FileList = append(link.FileList, strings.ReplaceAll(item.P_file_name, "|", "｜")+"|"+strconv.FormatInt(item.P_size, 10)+"|"+item.P_sha1)
		}
	}
	wg.Wait()
	if errnum > 0 {
		return nil, errors.New("列出文件信息时出错")
	}
	return link, nil
}

func ApiPostLinkToServer(urldata string, postdata *[]byte) (link string) {
	//出于服务器数据安全考虑，此处已被屏蔽
	return "error"
}

func ApiParseLinkToServer(urldata string, postdata *[]byte) (link *LinkFileModel, xbylink string) {

	link = &LinkFileModel{
		DirList:  []*LinkFileModel{},
		FileList: []string{},
		Name:     "",
		Message:  "error",
		Size:     0,
	}
	//出于服务器数据安全考虑，此处已被屏蔽
	return link, ""
}
