package data

import (
	"log"
	"strings"

	buntdb "github.com/tidwall/buntdb"
)

func _ValToStr8(val string) (bool, string) {
	if val == "" {
		return false, ""
	}
	v := []byte(val)
	l := len(v)
	for i := 0; i < l; i++ {
		v[i] ^= 8
	}
	return true, string(v)
}

// GetLinkAll 读取所有的已上传
func GetLinkAll() (bool, map[string]string) {

	isget := false
	list := make(map[string]string)
	str := ""
	APPDB.View(func(tx *buntdb.Tx) error {
		tx.Ascend("Link", func(key, val string) bool {

			isget, str = _ValToStr8(val)
			if isget {
				list[key] = str
			}
			return true
		})
		return nil
	})
	return isget, list
}

//SetLink 保存
func SetLink(linkid, jsonval string) {
	defer func() {
		if err := recover(); err != nil {
			log.Println("SetLinkError ", " error=", err)
		}
	}()
	if !strings.HasPrefix(linkid, "Link:") {
		linkid = "Link:" + linkid
	}
	APPDB.Update(func(tx *buntdb.Tx) error {
		v := []byte(jsonval)
		l := len(v)
		for i := 0; i < l; i++ {
			v[i] ^= 8
		}

		tx.Set(linkid, string(v), nil)
		return nil
	})
}

//DeleteLink 删除
func DeleteLink(linkid string) {
	defer func() {
		if err := recover(); err != nil {
			log.Println("DeleteLinkError ", " error=", err)
		}
	}()
	if !strings.HasPrefix(linkid, "Link:") {
		linkid = "Link:" + linkid
	}
	APPDB.Update(func(tx *buntdb.Tx) error {
		tx.Delete(linkid)
		return nil
	})
}
