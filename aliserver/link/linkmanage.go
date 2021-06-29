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

func GoLinkCreatFile(filename, jianjie string, boxid string, parentid string, keylist []string) string {

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
					finfo, ferr := aliyun.ApiFileGetUrl(boxid, fileid, "")
					if ferr != nil {
						errnum++
					} else {
						lock.Lock()
						list = append(list, &finfo)
						lock.Unlock()
					}
					defer wg.Done()
				}(fileid)
			}
		}
		wg.Wait()
		if errnum > 0 {
			return utils.ToErrorMessageJSON("列出文件信息时出错")
		}
	} else {
		//文件数量较多，批量读取文件信息
		flist, ferr := aliyun.ApiFileListAllForDown(boxid, parentid, "", false)
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
				dir, derr := aliyun.ApiFileListAllForLink(boxid, item.P_file_id, item.P_file_name)
				if derr != nil {
					errnum++
				} else {
					lock.Lock()
					link.DirList = append(link.DirList, dir)
					lock.Unlock()
				}
				defer wg.Done()
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
	/*不需要了
	var outlist = link.GetAliyun()
	var builder strings.Builder
	builder.Grow(100 * (len(outlist) + 1))
	for o := 0; o < len(outlist); o++ {
		oitem := strings.Split(outlist[o], "|")
		builder.WriteString("aliyunpan://" + oitem[0] + "|" + oitem[2] + "|" + oitem[1] + "|\r\n")
	}
	var outstring = builder.String()
	builder.Reset()
	*/
	infostr := strconv.FormatInt(int64(link.GetFileCount()), 10) + "个文件 " + utils.FormateSizeString(link.GetTotalSize())
	b, err := json.Marshal(link) //需要把文件数据上传
	for i := 0; i < 3; i++ {
		err = aliyun.MemUpload(boxid, parentid, filename, &b)
		if err == nil {
			break
		}
	}
	//执行上传操作
	if err == nil {
		return utils.ToSuccessJSON2("info", infostr, "aliyun", "")
	} else {
		log.Println("postlink", err)
		return utils.ToErrorMessageJSON("向网盘内创建文件" + filename + "时出错")
	}
}

func GoLinkParse(linkstr string, password string, ispublic bool) string {

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

	urldata := "password=" + password + "&ispublic=" + strconv.FormatBool(ispublic)
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
		infostr := strconv.FormatInt(int64(link.GetFileCount()), 10) + "个文件 " + utils.FormateSizeString(link.GetTotalSize())
		return utils.ToSuccessJSON3("xbylink", xbylink, "info", infostr, "link", link)
	} else {
		log.Println("parselink", err)
		return utils.ToErrorMessageJSON(link.Message)
	}
}

func GoLinkShare(linkstr string, password string) string {

	UserID := aliyun.GetUserID()
	if UserID == "" {
		return utils.ToErrorMessageJSON("还没有登录阿里云盘账号")
	}
	if strings.Contains(linkstr, " ") {
		linkstr = linkstr[0:strings.Index(linkstr, " ")]
	}
	if strings.Contains(linkstr, "\t") {
		linkstr = linkstr[0:strings.Index(linkstr, "\t")]
	}
	if strings.Contains(linkstr, "\n") {
		linkstr = linkstr[0:strings.Index(linkstr, "\n")]
	}
	if strings.Contains(linkstr, "?") {
		linkstr = linkstr[0:strings.Index(linkstr, "?")]
	}
	if strings.Contains(linkstr, "#") {
		linkstr = linkstr[0:strings.Index(linkstr, "#")]
	}
	//根据link解析出文件列表
	linkfile := ""
	linkstate := "success"
	linksid := ""
	if strings.Contains(linkstr, "115.com/s/") {
		linkstr = GetLinkStr115(linkstr)
		if linkstr == "" {
			return utils.ToErrorMessageJSON("错误的115链接格式")
		}
		linksid = GetLinkStr115SID(linkstr)
		if linksid == "" {
			return utils.ToErrorMessageJSON("错误的115链接格式")
		}
		link, err := GetLinkFiles115(linksid, password)
		if err != nil {
			linkstate = "error"
			linkfile = err.Error()
		} else {
			b, _ := json.Marshal(link)
			linkfile = string(b)
		}
	} else if strings.Contains(linkstr, "aliyundrive.com/s/") {
		linkstr = GetLinkStrAli(linkstr)
		if linkstr == "" {
			return utils.ToErrorMessageJSON("错误的阿里云盘链接格式")
		}
		linksid = GetLinkStrAliSID(linkstr)
		if linksid == "" {
			return utils.ToErrorMessageJSON("错误的阿里云盘链接格式")
		}
		link, err := GetLinkFilesAli(linksid, password)
		if err != nil {
			linkstate = "error"
			linkfile = err.Error()
		} else {
			b, _ := json.Marshal(link)
			linkfile = string(b)
		}
	} else {
		return utils.ToErrorMessageJSON("错误的链接格式")
	}

	var buf bytes.Buffer
	zw := gzip.NewWriter(&buf)
	zw.Write([]byte(linkfile))
	err := zw.Close()
	if err != nil {
		log.Println("zw.Close", err)
		return utils.ToErrorMessageJSON("gzip时出错")
	}
	bs := buf.Bytes()

	urldata := "password=" + password + "&linkstr=" + url.QueryEscape(linkstr) + "&linkstate=" + url.QueryEscape(linkstate)
	link := aliyun.ApiShareLinkToServer(urldata, &bs)
	if link.Message == "" {
		xbylink := linkstr
		if password != "" {
			xbylink = xbylink + " 密码：" + password
		}
		linklog := LinkLogModel{
			Link:      xbylink,
			LogTime:   time.Now().Unix(),
			IsCreater: false,
		}
		b, _ := json.Marshal(linklog)
		data.SetLink("Link:"+linkstr, string(b))
		infostr := strconv.FormatInt(int64(link.GetFileCount()), 10) + "个文件 " + utils.FormateSizeString(link.GetTotalSize())
		return utils.ToSuccessJSON4("shareid", linksid, "xbylink", xbylink, "info", infostr, "link", link)
	} else {
		log.Println("sharelink", err)
		return utils.ToErrorMessageJSON(link.Message)
	}
}
func GoLinkShareUpload(boxid string, parentid string, shareid, linkstr string) string {
	if parentid == "" {
		parentid = "root"
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
	//当前阿里云盘只开放了文件分享

	filelist := make([]string, len(link.FileList))

	for i := 0; i < len(link.FileList); i++ {
		var item = link.FileList[i]
		filelist[i] = item[strings.LastIndex(item, "|")+1:]
	}

	return aliyun.ApiSaveShareFilesBatch(shareid, boxid, parentid, filelist)
}
func GoLinkUpload(boxid string, ParentID string, linkstr string) string {
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
	SelectFileList, err := GetFilesWithDir(boxid, ParentID, &link)
	if err != nil {
		return utils.ToErrorMessageJSON("创建保存路径失败")
	}
	return upload.UploadSelectFile(UserID, ParentID, SelectFileList)
}
func GetFilesWithDir(boxid string, ParentID string, link *aliyun.LinkFileModel) (files []*upload.UploadSelectModel, err error) {

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
		m.BoxID = boxid
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
			DirID, err3 := aliyun.UploadCreatForder(boxid, ParentID, dir.Name)
			if err3 != nil {
				errnum++
			} else {
				// 然后递归遍历
				childfiles, err2 := GetFilesWithDir(boxid, DirID, dir)
				if err2 != nil {
					errnum++
				}
				if len(childfiles) > 0 {
					lock.Lock()
					files = append(files, childfiles...)
					lock.Unlock()
				}
			}
			defer wg.Done()
		}(n)
	}
	wg.Wait()
	if errnum > 0 {
		return nil, errors.New("向网盘内创建路径时出错")
	}
	return files, nil
}

func GoLinkSearch(search string, pageindex int64) string {
	if search == "" {
		search = "search"
	}
	if pageindex < 1 {
		pageindex = 1
	}
	if pageindex > 9 {
		pageindex = 9
	}
	var buf bytes.Buffer
	zw := gzip.NewWriter(&buf)
	zw.Write([]byte(search))
	err := zw.Close()
	if err != nil {
		log.Println("zw.Close", err)
		return utils.ToErrorMessageJSON("gzip时出错")
	}
	bs := buf.Bytes()

	urldata := "pageindex=" + strconv.FormatInt(pageindex, 10)
	result, err := aliyun.ApiSearchLinkToServer(urldata, &bs)
	if err != nil {
		return utils.ToErrorMessageJSON("gzip时出错")
	}
	return utils.ToSuccessJSON2("fileCount", result.Count, "items", result.FileList)

}
