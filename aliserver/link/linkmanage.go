package link

import (
	"aliserver/aliyun"
	"aliserver/data"
	"aliserver/upload"
	"aliserver/utils"
	"bytes"
	"compress/gzip"
	"encoding/json"
	"errors"
	"log"
	"net/url"
	"strconv"
	"strings"
	"sync"
	"time"
)

func GoLinkList() string {
	var b strings.Builder
	isget, list := data.GetLinkAll()
	if isget == false || len(list) == 0 {
		return `{"code":0,"message":"success","key":"link","filecount":0,"filelist":[]}`
	}
	LEN := len(list) - 1
	needAppend := false
	b.WriteString(`{"code":0,"message":"success","key":"link","filecount":` + strconv.Itoa(len(list)) + `,"filelist":[ `)
	strlist := make([]string, 0, LEN+1)
	for ID := range list {
		strlist = append(strlist, list[ID])
	}

	for i := LEN; i >= 0; i-- { //倒序 小->大
		if needAppend {
			b.WriteString(",")
		}
		b.WriteString(strlist[i])
		needAppend = true
	}

	b.WriteString("]}")
	jsonstr := b.String()
	b.Reset()
	return jsonstr
}
func GoLinkDelete(link string) string {
	data.DeleteDown("Link:" + link)
	return utils.ToSuccessJSON("link", link)
}

func GoLinkCreat(jianjie string, ispublic bool, password, outday, outsave, parentid string, keylist []string) string {

	UserID := aliyun.GetUserID()
	if UserID == "" {
		return utils.ToErrorMessageJSON("还没有登录阿里云盘账号")
	}
	var wg sync.WaitGroup
	var lock sync.Mutex
	errnum := 0
	var list []*aliyun.FileUrlModel
	if len(keylist) <= 5 {
		//文件数量5个，单文件读取信息
		for k := 0; k < len(keylist); k++ {
			fileid := keylist[k]
			if fileid != "" {
				wg.Add(1)
				go func(fileid string) {
					finfo, ferr := aliyun.ApiFileGetUrl(fileid, "")
					if ferr != nil {
						errnum++
					} else {
						lock.Lock()
						list = append(list, &finfo)
						lock.Unlock()
					}
					wg.Done()
				}(fileid)
			}
		}
		wg.Wait()
		if errnum > 0 {
			return utils.ToErrorMessageJSON("列出文件信息时出错")
		}
	} else {
		//文件数量较多，批量读取文件信息
		flist, ferr := aliyun.ApiFileListAllForDown(parentid, "", false)
		if ferr != nil {
			return utils.ToErrorMessageJSON("列出文件信息时出错")
		}
		for k := 0; k < len(keylist); k++ {
			fileid := keylist[k]
			if fileid != "" {
				for j := 0; j < len(flist); j++ {
					if flist[j].P_file_id == fileid { //找到了
						list = append(list, flist[j])
						break
					}
				}
			}
		}
	}
	if jianjie == "" {
		jianjie = "无"
	}

	link := aliyun.LinkFileModel{
		DirList:  []*aliyun.LinkFileModel{},
		FileList: []string{},
		Name:     jianjie,
		Message:  "",
		Size:     0,
	}

	errnum = 0
	lmax := len(list)
	for m := 0; m < lmax; m++ {
		item := list[m]
		if item.IsDir {
			wg.Add(1)
			go func(m int) {
				dir, derr := aliyun.ApiFileListAllForLink(item.P_file_id, item.P_file_name)
				if derr != nil {
					errnum++
				} else {
					lock.Lock()
					link.DirList = append(link.DirList, dir)
					lock.Unlock()
				}
				wg.Done()
			}(m)
		} else {
			link.Size += item.P_size
			link.FileList = append(link.FileList, strings.ReplaceAll(item.P_file_name, "|", "｜")+"|"+strconv.FormatInt(item.P_size, 10)+"|"+item.P_sha1)
		}
	}
	wg.Wait()
	if errnum > 0 {
		return utils.ToErrorMessageJSON("列出文件信息时出错")
	}

	if link.GetFileCount() == 0 {
		return utils.ToErrorMessageJSON("短链接内不包含任何文件")
	}

	b, _ := json.Marshal(link)
	var buf bytes.Buffer
	zw := gzip.NewWriter(&buf)
	zw.Write(b)
	err := zw.Close()
	if err != nil {
		log.Println("zw.Close", err)
		return utils.ToErrorMessageJSON("gzip时出错")
	}
	bs := buf.Bytes()

	urldata := "password=" + password + "&outday=" + outday + "&outsave=" + outsave + "&filecount=" + strconv.FormatInt(int64(link.GetFileCount()), 10) + "&dircount=" + strconv.FormatInt(int64(link.GetDirCount()), 10)
	urldata += "&totalsize=" + strconv.FormatInt(int64(link.GetTotalSize()), 10)
	urldata += "&ispublic=" + strconv.FormatBool(ispublic) + "&jianjie=" + url.QueryEscape(jianjie)
	linkstr := aliyun.ApiPostLinkToServer(urldata, &bs)
	if linkstr != "error" {
		if linkstr != "" {
			linklog := LinkLogModel{
				Link:      linkstr,
				LogTime:   time.Now().Unix(),
				IsCreater: true,
			}
			b, _ := json.Marshal(linklog)
			data.SetLink("Link:"+linkstr, string(b))
		}
		return utils.ToSuccessJSON("link", linkstr)
	} else {
		log.Println("postlink", err)
		return utils.ToErrorMessageJSON("上传数据时出错")
	}
}

func GoLinkParse(linkstr string, password string) string {

	UserID := aliyun.GetUserID()
	if UserID == "" {
		return utils.ToErrorMessageJSON("还没有登录阿里云盘账号")
	}

	var buf bytes.Buffer
	zw := gzip.NewWriter(&buf)
	zw.Write([]byte(linkstr))
	err := zw.Close()
	if err != nil {
		log.Println("zw.Close", err)
		return utils.ToErrorMessageJSON("gzip时出错")
	}
	bs := buf.Bytes()

	urldata := "password=" + password
	link, xbylink := aliyun.ApiParseLinkToServer(urldata, &bs)
	if link.Message == "" {
		if xbylink != "" {
			linklog := LinkLogModel{
				Link:      xbylink,
				LogTime:   time.Now().Unix(),
				IsCreater: false,
			}
			b, _ := json.Marshal(linklog)
			data.SetLink("Link:"+xbylink, string(b))
		}
		return utils.ToSuccessJSON2("xbylink", xbylink, "link", link)
	} else {
		log.Println("parselink", err)
		return utils.ToErrorMessageJSON(link.Message)
	}
}
func GoLinkUpload(ParentID string, linkstr string) string {
	if ParentID == "" {
		ParentID = "root"
	}

	UserID := aliyun.GetUserID()
	if UserID == "" {
		return utils.ToErrorMessageJSON("还没有登录阿里云盘账号")
	}
	link := aliyun.LinkFileModel{
		DirList:  []*aliyun.LinkFileModel{},
		FileList: []string{},
		Name:     "",
		Size:     0,
		Message:  "",
	}

	err := json.Unmarshal([]byte(linkstr), &link)
	if err != nil {
		return utils.ToErrorMessageJSON("json格式化失败")
	}

	//生成SelectFileList []*UploadSelectModel
	SelectFileList, err := GetFilesWithDir(ParentID, &link)
	if err != nil {
		return utils.ToErrorMessageJSON("创建保存路径失败")
	}
	return upload.UploadSelectFile(UserID, ParentID, SelectFileList)
}
func GetFilesWithDir(ParentID string, link *aliyun.LinkFileModel) (files []*upload.UploadSelectModel, err error) {

	files = make([]*upload.UploadSelectModel, 0, len(link.FileList)+len(link.DirList))

	for i := 0; i < len(link.FileList); i++ {
		str := link.FileList[i]
		m := upload.UploadSelectModel{}
		index := strings.LastIndex(str, "|")
		hash := str[index+1:]
		str = str[0:index]
		index = strings.LastIndex(str, "|")
		m.Size, _ = strconv.ParseInt(str[index+1:], 10, 64)
		m.Name = str[0:index]
		m.Path = "miaochuan|" + hash
		m.ParentID = ParentID
		files = append(files, &m)
	}
	var wg sync.WaitGroup
	var lock sync.Mutex
	errnum := 0
	for n := 0; n < len(link.DirList); n++ {
		wg.Add(1)
		go func(n int) {
			dir := link.DirList[n]
			//先在网盘里创建对应的文件夹,获得文件夹ID
			DirID, err3 := aliyun.UploadCreatForder(ParentID, dir.Name)
			if err3 != nil {
				errnum++
			} else {
				// 然后递归遍历
				childfiles, err2 := GetFilesWithDir(DirID, dir)
				if err2 != nil {
					errnum++
				}
				if len(childfiles) > 0 {
					lock.Lock()
					files = append(files, childfiles...)
					lock.Unlock()
				}
			}
			wg.Done()
		}(n)
	}
	wg.Wait()
	if errnum > 0 {
		return nil, errors.New("向网盘内创建路径时出错")
	}
	return files, nil
}
