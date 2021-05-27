package data

import (
	"log"

	buntdb "github.com/tidwall/buntdb"
)

func _ValToStr6(val string) (bool, string) {
	if val == "" {
		return false, ""
	}
	v := []byte(val)
	l := len(v)
	for i := 0; i < l; i++ {
		v[i] ^= 6
	}
	return true, string(v)
}

// GetDownedAll 读取所有的已下载
func GetDownedAll() (bool, map[string]string) {

	isget := false
	list := make(map[string]string)
	str := ""
	APPDB.View(func(tx *buntdb.Tx) error {
		tx.Ascend("Downed", func(key, val string) bool {

			isget, str = _ValToStr6(val)
			if isget {
				list[key] = str
			}
			return true
		})
		return nil
	})
	return isget, list
}

// GetDowningAll 读取所有的正在下载
func GetDowningAll() (bool, map[string]string) {

	isget := false
	list := make(map[string]string)
	str := ""
	APPDB.View(func(tx *buntdb.Tx) error {
		tx.Ascend("Downing", func(key, val string) bool {
			isget, str = _ValToStr6(val)
			if isget {
				list[key] = str
			}
			return true
		})
		return nil
	})
	return isget, list
}

//SetDown 保存
func SetDown(downid, jsonval string) {
	defer func() {
		if err := recover(); err != nil {
			log.Println("SetDownError ", " error=", err)
		}
	}()
	APPDB.Update(func(tx *buntdb.Tx) error {
		v := []byte(jsonval)
		l := len(v)
		for i := 0; i < l; i++ {
			v[i] ^= 6
		}

		tx.Set(downid, string(v), nil)
		return nil
	})
}

//DeleteDown 删除
func DeleteDown(downid string) {
	defer func() {
		if err := recover(); err != nil {
			log.Println("DeleteDownError ", " error=", err)
		}
	}()
	APPDB.Update(func(tx *buntdb.Tx) error {
		tx.Delete(downid)
		return nil
	})
}
