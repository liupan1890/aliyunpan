package data

import (
	"log"

	buntdb "github.com/tidwall/buntdb"
)

func _ValToStr7(val string) (bool, string) {
	if val == "" {
		return false, ""
	}
	v := []byte(val)
	l := len(v)
	for i := 0; i < l; i++ {
		v[i] ^= 7
	}
	return true, string(v)
}

// GetUploadAll 读取所有的已上传
func GetUploadAll() (bool, map[string]string) {

	isget := false
	list := make(map[string]string)
	str := ""
	APPDB.View(func(tx *buntdb.Tx) error {
		tx.Ascend("Upload", func(key, val string) bool {

			isget, str = _ValToStr7(val)
			if isget {
				list[key] = str
			}
			return true
		})
		return nil
	})
	return isget, list
}

// GetUploadingAll 读取所有的正在下载
func GetUploadingAll() (bool, map[string]string) {

	isget := false
	list := make(map[string]string)
	str := ""
	APPDB.View(func(tx *buntdb.Tx) error {
		tx.Ascend("Uploading", func(key, val string) bool {
			isget, str = _ValToStr7(val)
			if isget {
				list[key] = str
			}
			return true
		})
		return nil
	})
	return isget, list
}

//SetUpload 保存
func SetUpload(downid, jsonval string) {
	defer func() {
		if err := recover(); err != nil {
			log.Println("SetUploadError ", " error=", err)
		}
	}()
	APPDB.Update(func(tx *buntdb.Tx) error {
		v := []byte(jsonval)
		l := len(v)
		for i := 0; i < l; i++ {
			v[i] ^= 7
		}

		tx.Set(downid, string(v), nil)
		return nil
	})
}

//DeleteUpload 删除
func DeleteUpload(downid string) {
	defer func() {
		if err := recover(); err != nil {
			log.Println("DeleteUploadError ", " error=", err)
		}
	}()
	APPDB.Update(func(tx *buntdb.Tx) error {
		tx.Delete(downid)
		return nil
	})
}
