package link

import (
	"aliserver/aliyun"
	"aliserver/utils"
	"errors"
	"log"
	"net/url"
	"regexp"
	"strconv"
	"strings"
	"sync"

	"github.com/tidwall/gjson"
)

/* File115Model
{"fid":"1862054705834608552","uid":84855794,"cid":1861939744516982705,"n":"\u795e\u96d5.mkv","s":3284977491,"t":"1591990218","d":1,"c":0,"e":"","ico":"mkv","sha":"56E4525713236D035092A34521F6403675DFFD8C","fl":[],"u":"","iv":1,"vdi":4,"play_long":2762}
{"pid":"0","p":0,"ns":"\u795e\u96d5\u4fa0\u4fa32006"}
*/
type File115Model struct {
	//文件时有 文件夹时没有
	P_fid string `json:"fid"`
	//文件夹时是文件夹ID 文件时是父文件夹ID
	P_cid uint64 `json:"cid"`
	//文件名
	P_name string `json:"n"`
	//文件大小
	P_size int64 `json:"s"`
	//文件时有 文件夹时没有
	P_sha1 string `json:"sha"`

	IsDir bool
}

func GetLinkStr115(linkstr string) string {
	reg := regexp.MustCompile(`115.com/s/([\w]+)`)
	params := reg.FindStringSubmatch(linkstr)
	if params == nil || len(params) < 2 {
		return ""
	}
	sid := params[1]
	return "https://115.com/s/" + sid
}
func GetLinkStr115SID(linkstr string) string {
	reg := regexp.MustCompile(`115.com/s/([\w]+)`)
	params := reg.FindStringSubmatch(linkstr)
	if params == nil || len(params) < 2 {
		return ""
	}
	sid := params[1]
	return sid
}

func GetLinkFiles115(linksid string, password string) (link *aliyun.LinkFileModel, err error) {
	defer func() {
		if errr := recover(); errr != nil {
			log.Println("GetLinkFiles115Error ", " error=", errr)
			err = errors.New("error")
		}
	}()

	link, err = ApiFileListAllFor115Link(linksid, password, "", linksid, true)
	return link, err
}

//ApiFileListAllFor115Link 读取一个文件夹的信息(文件列表)(遍历子文件夹)
func ApiFileListAllFor115Link(sid string, password string, cid string, name string, isroot bool) (link *aliyun.LinkFileModel, err error) {
	for i := 0; i < 3; i++ {
		link, err = _ApiFileListAllFor115Link(sid, password, cid, name, isroot)
		if err == nil {
			return link, nil
		} else {
			errmsg := err.Error()
			if errmsg != "error" {
				return nil, err
			}
		}
	}
	return nil, err
}

//_ApiFileListAllFor115Link  读取一个文件夹的信息(文件列表)(遍历子文件夹)
func _ApiFileListAllFor115Link(sid string, password string, cid string, name string, isroot bool) (link *aliyun.LinkFileModel, err error) {

	defer func() {
		if errr := recover(); errr != nil {
			log.Println("_ApiFileListAllFor115LinkError ", " error=", errr)
			err = errors.New("error")
		}
	}()

	link = &aliyun.LinkFileModel{
		DirList:  []*aliyun.LinkFileModel{},
		FileList: []string{},
		Name:     name,
		Message:  "",
		Size:     0,
	}
	var list = []*File115Model{}
	for i := 0; i < 10; i++ {

		var snapurl = "http://webapi.115.com/share/snap?share_code=" + sid + "&offset=" + strconv.FormatInt(int64(i*1150), 10) + "&limit=1150&receive_code=" + password + "&cid=" + cid
		var header = "Accept: application/json, text/javascript, */*; q=0.01\nUser-Agent: Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36\n"
		header += "Origin: http://115.com\nReferer: http://115.com/s/" + sid + "\nCookie: UM_distinctid=17a128ef7dc12f-080ccb4644bb72-45410429-18bb10-17a128ef7dd18e; acw_tc=784e2ca816247924164328480e337b502062e834f980928973a048a6ca27fe"

		code, _, body := utils.GetHTTPString(snapurl, header)
		if code != 200 || !gjson.Valid(body) {
			return nil, errors.New("code=" + strconv.FormatInt(int64(code), 10))
		}
		if gjson.Get(body, "state").Bool() == false {
			errmsg := gjson.Get(body, "error").String()
			if errmsg == "请输入访问码" && i == 0 && isroot {
				//第一次，尝试联网读取
				urldata := "&linkstr=" + url.QueryEscape("https://115.com/s/"+sid)
				password2 := aliyun.ApiShareLinkPwdToServer(urldata)
				if password2 != "error" {
					password = password2
					return _ApiFileListAllFor115Link(sid, password, cid, name, false) //重新开始
				}
			}
			return nil, errors.New(errmsg)
		}

		if i == 0 && isroot {
			sinfo := gjson.Get(body, "data.shareinfo")
			link.Message = sinfo.Raw
			link.Name = gjson.Get(sinfo.Raw, "share_title").String()
		}

		count := gjson.Get(body, "data.count").Int()
		items := gjson.Get(body, "data.list").Array()

		var max = len(items)
		for i := 0; i < max; i++ {
			info := items[i]
			P_fid := info.Get("fid").String() //file
			P_cid := info.Get("cid").Uint()
			P_name := utils.ClearFileName(info.Get("n").String(), true)
			if P_name == "" {
				return nil, errors.New("nameerror")
			}
			if P_fid != "" {
				P_size := info.Get("s").Int()
				P_sha1 := info.Get("sha").String() //E27EB7D983E212CDDF9149094E31E40CC47417D6

				list = append(list, &File115Model{P_fid: P_fid, P_cid: P_cid, P_name: P_name, P_sha1: P_sha1, P_size: P_size, IsDir: false})
			} else {
				list = append(list, &File115Model{P_fid: P_fid, P_cid: P_cid, P_name: P_name, P_sha1: "", IsDir: true})
			}
		}
		if int64(len(list)) >= count {
			break
		}
	}

	var wg sync.WaitGroup
	var lock sync.Mutex
	errnum := 0
	var max = len(list)
	for i := 0; i < max; i++ {
		var item = list[i]
		if item.IsDir {
			wg.Add(1)
			go func(item *File115Model) {
				dir, derr := ApiFileListAllFor115Link(sid, password, strconv.FormatUint(item.P_cid, 10), item.P_name, false)
				//注意这里，如果子文件夹遍历时出错了，直接退出，确保要么全部成功，要么全部失败，不丢失
				if derr != nil {
					errnum++
				} else {
					lock.Lock()
					link.DirList = append(link.DirList, dir)
					lock.Unlock()
				}
				defer wg.Done()
			}(item)
		} else {
			link.Size += item.P_size
			link.FileList = append(link.FileList, strings.ReplaceAll(item.P_name, "|", "｜")+"|"+strconv.FormatInt(item.P_size, 10)+"|"+item.P_sha1)
		}
	}
	wg.Wait()
	if errnum > 0 {
		return nil, errors.New("列出文件信息时出错")
	}
	return link, nil
}
