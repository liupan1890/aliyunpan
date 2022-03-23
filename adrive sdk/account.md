#### 刷新 token

POST: `https://auth.aliyundrive.com/v2/account/token`

```json
{ "grant_type": "refresh_token", "app_id": "pJZInNHN2dZWk8qg", "refresh_token": "c65bf6d104ac510885c0124d74c4a099" }
```

Response:

```json
{
  "default_sbox_drive_id": "9600002",
  "role": "user",
  "device_id": "2909000000004f01aa28264bfc30e4ed",
  "user_name": "151***111",
  "need_link": false,
  "expire_time": "2022-03-21T06:33:21Z",
  "pin_setup": true,
  "need_rp_verify": false,
  "avatar": "https://ccp-bj29-bj-1592982087.oss-cn-beijing.aliyuncs.com/2GhCur3G%2F...",
  "user_data": {
    "DingDingRobotUrl": "https://oapi.dingtalk.com/robot/send?access_token=0b4a936d0e...",
    "EncourageDesc": "内测期间有效反馈前10名用户将获得终身免费会员",
    "FeedBackSwitch": true,
    "FollowingDesc": "34848372",
    "back_up_config": {
      "手机备份": { "folder_id": "605c0c29b7acf78b6ee34bf095594f7654e57d68", "photo_folder_id": "605c0c299af37539f3d34879b2f0d1c5543f27d5", "sub_folder": {}, "video_folder_id": "605c0c29e520154c22644bed904b76b25ced317a" }
    },
    "ding_ding_robot_url": "https://oapi.dingtalk.com/robot/send?access_token=0b4a936d0e...",
    "encourage_desc": "内测期间有效反馈前10名用户将获得终身免费会员",
    "feed_back_switch": true,
    "following_desc": "34848372"
  },
  "token_type": "Bearer",
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..................",
  "default_drive_id": "9600002",
  "domain_id": "bj29",
  "refresh_token": "b2d9c244d8a24df38aa1a5dec59e2a92",
  "is_first_login": false,
  "user_id": "9400000000bc480bbcbbb1e074f55a7f",
  "nick_name": "myname",
  "exist_link": [],
  "state": "",
  "expires_in": 7200,
  "status": "enabled"
}
```

#### 退出登录

POST: `https://auth.aliyundrive.com/v2/account/revoke`

```json

```

Response:

```json

```

#### 检查账号是否存在 x

POST: `https://auth.aliyundrive.com/v2/account/mobile/check_exist`

```json
{ "app_id": "pJZInNHN2dZWk8qg", "phone_number": "151***111", "phone_region": "86" }
```

Response:

```json
{ "is_exist": true }
```
