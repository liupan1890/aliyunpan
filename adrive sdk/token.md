#### 网页版登录

POST: `https://api.aliyundrive.com/token/get`

```json
{ "code": "f98788cef51641728f2aad9c64a96a63", "loginType": "normal", "deviceId": "CPH800000000AbfFPI5QSJjO" }
```

Response:

```json
{
  "default_sbox_drive_id": "9600002",
  "role": "user",
  "user_name": "151***111",
  "need_link": false,
  "expire_time": "2022-03-21T09:48:46Z",
  "pin_setup": true,
  "need_rp_verify": false,
  "avatar": "https://ccp-bj29-bj-1592982087.oss-cn-beijing.aliyuncs.com/2GhCur3G%2F...",
  "user_data": {
    "DingDingRobotUrl": "https://oapi.dingtalk.com/robot/send?access_token=0b4a00000000c08608cd99f693393c18fa905aa0868215485a28497501916fec",
    "EncourageDesc": "内测期间有效反馈前10名用户将获得终身免费会员",
    "FeedBackSwitch": true,
    "FollowingDesc": "34848372",
    "ding_ding_robot_url": "https://oapi.dingtalk.com/robot/send?access_token=0b4a00000000c08608cd99f693393c18fa905aa0868215485a28497501916fec",
    "encourage_desc": "内测期间有效反馈前10名用户将获得终身免费会员",
    "feed_back_switch": true,
    "following_desc": "34848372"
  },
  "token_type": "Bearer",
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9......aixJ4k",
  "default_drive_id": "9600002",
  "domain_id": "bj29",
  "refresh_token": "82ad000000004fbda61b01b5a5cf103b",
  "is_first_login": false,
  "user_id": "9400000000bc480bbcbbb1e074f55a7f",
  "nick_name": "mynane",
  "exist_link": [],
  "state": "",
  "expires_in": 7200,
  "status": "enabled"
}
```
