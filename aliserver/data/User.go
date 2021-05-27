package data

import (
	"strings"

	buntdb "github.com/tidwall/buntdb"
)

type UserTokenModel struct {
	P_access_token          string `json:"access_token"`
	P_refresh_token         string `json:"refresh_token"`
	P_expires_in            int64  `json:"expires_in"`
	P_token_type            string `json:"token_type"`
	P_user_id               string `json:"user_id"`
	P_user_name             string `json:"user_name"`
	P_avatar                string `json:"avatar"`
	P_nick_name             string `json:"nick_name"`
	P_default_drive_id      string `json:"default_drive_id"`
	P_default_sbox_drive_id string `json:"default_sbox_drive_id"`
	P_role                  string `json:"role"`
	P_status                string `json:"status"`
	P_expire_time           string `json:"expire_time"`
	P_state                 string `json:"state"`
	P_need_link             bool   `json:"need_link"`
	P_pin_setup             bool   `json:"pin_setup"`
	P_is_first_login        bool   `json:"is_first_login"`
	P_need_rp_verify        bool   `json:"need_rp_verify"`
}

type UserInfoModel struct {
	P_spu_id         string `json:"spu_id"` //non-vip
	P_name           string `json:"name"`   //普通用户
	P_is_expires     bool   `json:"is_expires"`
	P_used_size      string `json:"used_size"`
	P_total_size     string `json:"total_size"`
	P_download_speed string `json:"download_speed"` //-1
	P_drive_size     string `json:"drive_size"`     //100GB
	P_safe_box_size  string `json:"safe_box_size"`  //50GB
	P_upload_size    string `json:"upload_size"`    //30GB
	M_info_time      int64
}

type UserLoginModel struct {
	UserLoginType    string         `json:"UserLoginType"`
	UserID           string         `json:"UserID"`
	UserName         string         `json:"UserName"`
	UserAccessToken  string         `json:"UserAccessToken"`
	UserRefreshToken string         `json:"UserRefreshToken"`
	UserToken        UserTokenModel `json:"UserToken"`
	UserInfo         UserInfoModel  `json:"UserInfo"`
}

func _ValToStr5(val string) (bool, string) {
	if val == "" {
		return false, ""
	}
	v := []byte(val)
	l := len(v)
	for i := 0; i < l; i++ {
		v[i] ^= 5
	}
	return true, string(v)
}

//GetUser 读取用户信息
func GetUser(key string) (isget bool, jsonstr string) {
	if !strings.HasPrefix(key, "AliUser:") {
		key = "AliUser:" + key
	}

	isget = false
	jsonstr = ""
	APPDB.View(func(tx *buntdb.Tx) error {
		val, _ := tx.Get(key)
		isget, jsonstr = _ValToStr5(val)
		return nil
	})
	return isget, jsonstr
}

// GetUserFirst 读取第一个用户信息
func GetUserFirst() (isget bool, jsonstr string) {
	APPDB.View(func(tx *buntdb.Tx) error {
		tx.Ascend("AliUser", func(key, val string) bool {
			isget, jsonstr = _ValToStr5(val)
			return true
		})
		return nil
	})
	return isget, jsonstr
}

// SetUser 保存用户信息
func SetUser(key string, jsonval string) {
	if !strings.HasPrefix(key, "AliUser:") {
		key = "AliUser:" + key
	}
	APPDB.Update(func(tx *buntdb.Tx) error {
		v := []byte(jsonval)
		l := len(v)
		for i := 0; i < l; i++ {
			v[i] ^= 5
		}
		sval := string(v)
		val, _ := tx.Get(key)
		if val != sval {
			tx.Set(key, sval, nil)
		}
		return nil
	})
}

// DelUser 删除用户信息
func DelUser(key string) {
	if !strings.HasPrefix(key, "AliUser:") {
		key = "AliUser:" + key
	}
	APPDB.Update(func(tx *buntdb.Tx) error {
		tx.Delete(key)
		return nil
	})
}
