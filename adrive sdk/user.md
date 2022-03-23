#### 首页 widgets

POST: `https://api.aliyundrive.com/apps/v1/users/apps/widgets`

```json

```

Response:

```json
最近转存,你订阅的分享者有更新了...
```

#### 用户信息

POST: `https://api.aliyundrive.com/v2/user/get`

```json
{}
```

Response:

```json
{
  "domain_id": "bj29",
  "user_id": "9400000000bc480bbcbbb1e074f55a7f",
  "avatar": "https://ccp-bj29-bj-1592982087.oss-cn-beijing.aliyuncs.com/2GhCur3G%2F...",
  "created_at": 1623212076923,
  "updated_at": 1636164094577,
  "email": "",
  "nick_name": "mynane",
  "phone": "15100000111",
  "role": "user",
  "status": "enabled",
  "user_name": "151***111",
  "description": "",
  "default_drive_id": "9600002",
  "user_data": {},
  "deny_change_password_by_self": false,
  "need_change_password_next_login": false,
  "creator": "",
  "permission": null
}
```

#### 用户信息

POST: `https://api.aliyundrive.com/v2/user/update`

```json
{ "user_id": "9400000000bc480bbcbbb1e074f55a7f", "nick_name": "n_mynane4" }
//用户可以修改自己的description，nick_name，avatar
```

Response:

```json
同上userinfo
```

#### 已用空间

POST: `https://api.aliyundrive.com/adrive/v1/user/driveCapacityDetails`

```json

```

Response:

```json
{ "drive_used_size": 7436100078094 }
```

#### 相册 driveId

POST: `https://api.aliyundrive.com/adrive/v1/user/albums_info`

```json
{}
```

Response:

```json
{ "code": "200", "message": "success", "data": { "driveId": "9600002", "driveName": "alibum" }, "resultCode": "200" }
```

#### 实名信息

POST: `https://api.aliyundrive.com/adrive/v1/user_verify/get`

```json
{}
```

Response:

```json
{ "name": "*名子", "rp_verify_status": "pass", "card_number": "1****************3" }
```

#### 用户信息（vip+空间）

POST: `https://api.aliyundrive.com/v2/databox/get_personal_info`

```json
{}
```

Response:

```json
{
  "personal_rights_info": {
    "spu_id": "non-vip",
    "name": "普通用户",
    "is_expires": false,
    "privileges": [
      { "feature_id": "download", "feature_attr_id": "speed_limit", "quota": -1 },
      { "feature_id": "drive", "feature_attr_id": "size_limit", "quota": 107374182400 },
      { "feature_id": "safe_box", "feature_attr_id": "size_limit", "quota": 53687091200 },
      { "feature_id": "upload", "feature_attr_id": "size_limit", "quota": 2199023255552 },
      { "feature_id": "video", "feature_attr_id": "backup", "quota": 1 },
      { "feature_id": "video", "feature_attr_id": "clarity_limit", "quota": 3 }
    ]
  },
  "personal_space_info": { "used_size": 7436100078094, "total_size": 8946416877568 }
}
```

#### 云服务授权管理

POST: `https://api.aliyundrive.com/apps/v1/users/list_app_permissions`

```json

```

Response:

```json
{ "result": [] }
```

#### 登录设备列表

POST: `https://api.aliyundrive.com/users/v1/users/device_list`

```json

```

Response:

```json
{
  "result": [
    { "deviceId": "q2e900000000ASdqMZ/pXgt7", "deviceName": "Chrome浏览器", "modelName": "Windows网页版", "city": "北京市", "loginTime": "2022-03-20 08:52" },
    { "deviceId": "SyQo00000000AbfHgMQi2AXv", "deviceName": "Chrome浏览器", "modelName": "Windows网页版", "city": "北京市", "loginTime": "2022-03-01 08:28" }
  ]
}
```

#### 登录设备列表下线

> 需要先短信验证，获取 umidToken
> POST: `https://api.aliyundrive.com/users/v1/users/device_offline`

```json
{ "deviceId": "q2e900000000ASdqMZ/pXgt7", "token": "CN-SPLIT-AQiE_......zdaLa2BOqAzuwCl3TS5Vp68qw", "umidToken": "dhhL00000000BzV/qXrSsXhU3k6buc1a" }
```

Response:

```json
{ "result": true }
```

#### 未知（相册合并?）

POST: `https://api.aliyundrive.com/adrive/v1/user/albums_migration`

```json
{}
```

Response:

```json
{ "code": "200", "message": "success", "data": { "hasMigrateData": false, "drive": { "driveId": "9600002", "driveName": "alibum" } }, "resultCode": "200" }
```

#### 上报登录设备

POST: `https://api.aliyundrive.com/users/v1/users/device`

```json
{
  "modelName": "iPad4,4",
  "refreshToken": "3b920000000043f19fbc6b65c8dea11c",
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9......",
  "deviceName": "iPad"
}
```

Response:

```json
{ "result": true }
```

#### 兑换福利码

POST: `https://member.aliyundrive.com/v1/users/rewards`

```json
{ "code": "山山水水" }
```

Response:

```json
{ "success": false, "code": "30002", "message": "请输入有效的福利码", "totalCount": null, "nextToken": null, "maxResults": null, "result": { "message": "请输入有效的福利码" }, "arguments": null }
```

#### 容量明细

https://pages.aliyundrive.com/mobile-page/capacitymanager.html?disableNav=YES

POST: `https://api.aliyundrive.com/adrive/v1/user/capacityDetails`

```json

```

Response:

```json
{
  "capacity_details": [
    { "type": "MEMBER_TASK", "size": 107374182400, "expired": "2022-10-14T05:01:48.935Z", "description": "完成福利社任务", "latest_receive_time": "2021-07-09T11:15:42.845Z" },
    { "type": "NEW_USER", "size": 107374182400, "expired": "permanent", "description": "新用户赠礼", "latest_receive_time": "2021-05-14T07:11:03.521Z" },
    { "type": "REWARD_CODE", "size": 536870912000, "expired": "permanent", "description": "兑换福利码", "latest_receive_time": "2022-02-21T12:08:58.000Z" },
    { "type": "BETA", "size": 3298534883328, "expired": "permanent_condition", "description": "内测专享", "latest_receive_time": "2021-03-18T05:01:21.118Z" },
    { "type": "MEMBER_TASK", "size": 107374182400, "expired": "2021-07-08T11:15:42.905Z", "description": "完成福利社任务", "latest_receive_time": "2021-03-18T05:02:28.160Z" }
  ]
}
```

#### 福利社任务列表

POST: `https://member.aliyundrive.com/v1/users/task_list`

```json

```

Response:

```json
{
  "success": true,
  "code": null,
  "message": null,
  "totalCount": null,
  "nextToken": null,
  "maxResults": null,
  "result": [
    {
      "idempotent": "5dd6000000004283a4be19f4a5ab647a",
      "position": 10,
      "id": "51",
      "name": "邀请好友用云盘",
      "code": "referral",
      "actionType": "openLink",
      "action": "smartdrive://vipcenter/referral",
      "url": "https://pages.aliyundrive.com/mobile-page/web/invitefriends.html",
      "appName": null,
      "description": "+800G/人",
      "backgroundImage": "https://img.alicdn.com/imgextra/i4/O1CN016LFIjK1SRL72iovyX_!!6000000002243-2-tps-819-456.png",
      "backgroundColor": "#D9E8FF",
      "darkBackgroundColor": "#D9E8FF",
      "textColor": "#6FBEEB",
      "darkTextColor": "#6FBEEB",
      "status": "unfinished",
      "createdAt": 1644718396417,
      "finishedAt": null,
      "notice": "容量一年有效",
      "topRightCorner": "限时任务",
      "detailName": "",
      "detailDescription": "https://pages.aliyundrive.com/mobile-page/web/beinvited.html?code=",
      "detailBackgroundImage": "",
      "detailIntroduction": null,
      "rewards": [{ "icon": "https://img.alicdn.com/imgextra/i1/O1CN015KvMU11Yj65cGXGCp_!!6000000003094-2-tps-72-72.png", "name": "", "description": "有效期一年" }],
      "detailRewardNotice": "",
      "process": { "current": 0, "max": 0 },
      "statusNotice": "",
      "explain": null,
      "referral": null,
      "monthlyCard": null,
      "popUps": null,
      "shareFissions": null,
      "subTasks": null,
      "shareAction": null,
      "darenShareViewModel": null
    },
    {
      "idempotent": "80bf00000000442b90368c27a7ec3443",
      "position": 3,
      "id": "66",
      "name": "第四周·周任务",
      "code": "adrive",
      "actionType": "openNative",
      "action": "smartdrive://vipcenter/opentaskcarddetail?taskId=66",
      "url": "",
      "appName": null,
      "description": "阿里云盘VIP免费领",
      "backgroundImage": "https://img.alicdn.com/imgextra/i3/O1CN01HK76N21tBlGdfXcjm_!!6000000005864-2-tps-1029-612.png",
      "backgroundColor": null,
      "darkBackgroundColor": null,
      "textColor": "#FFD601",
      "darkTextColor": "#FFD601",
      "status": "finished",
      "createdAt": 1645953637620,
      "finishedAt": 1647857247562,
      "notice": "一个月 VIP",
      "topRightCorner": "周年庆",
      "detailName": "第四周·周任务",
      "detailDescription": "阿里云盘VIP免费领",
      "detailBackgroundImage": "https://img.alicdn.com/imgextra/i3/O1CN01HK76N21tBlGdfXcjm_!!6000000005864-2-tps-1029-612.png",
      "detailIntroduction": null,
      "rewards": [{ "icon": "https://gw.alicdn.com/imgextra/i3/O1CN01nl3rNq1PWQc5cpUWQ_!!6000000001848-2-tps-72-72.png", "name": "阿里云盘VIP", "description": "完成两个任务即可获得1个月阿里云盘VIP " }],
      "detailRewardNotice": "",
      "process": { "current": 2, "max": 0 },
      "statusNotice": "领取阿里云盘VIP",
      "explain": { "title": "活动说明：\r\n1.  活动期为2022年3月21日-3月27日。\r\n2. 任务福利将于4月30日开启兑换，所有会员福利最晚兑换时间为2022年6月30日，过期后不可兑换。", "description": "" },
      "referral": null,
      "monthlyCard": null,
      "popUps": null,
      "shareFissions": null,
      "subTasks": null,
      "shareAction": null,
      "darenShareViewModel": null
    }
  ],
  "arguments": null
}
```

#### 福利社任务详情

POST: `https://member.aliyundrive.com/v1/users/task_detail`

```json
{ "taskId": "51" }
```

Response:

```json
{
  "idempotent": "5dd6000000004283a4be19f4a5ab647a",
  "position": 10,
  "id": "51",
  "name": "邀请好友用云盘",
  "code": "referral",
  "actionType": "openLink",
  "action": "smartdrive://vipcenter/referral",
  "url": "https://pages.aliyundrive.com/mobile-page/web/invitefriends.html",
  "appName": null,
  "description": "+800 GB/人 一年有效",
  "backgroundImage": "https://img.alicdn.com/imgextra/i4/O1CN016LFIjK1SRL72iovyX_!!6000000002243-2-tps-819-456.png",
  "backgroundColor": "#D9E8FF",
  "darkBackgroundColor": "#D9E8FF",
  "textColor": "#FFD601",
  "darkTextColor": "#FFD601",
  "status": "unfinished",
  "createdAt": 1644718396417,
  "finishedAt": null,
  "notice": "",
  "topRightCorner": "限时任务",
  "detailName": "",
  "detailDescription": "https://pages.aliyundrive.com/mobile-page/web/beinvited.html?code=",
  "detailBackgroundImage": "",
  "detailIntroduction": null,
  "rewards": [{ "icon": "https://img.alicdn.com/imgextra/i1/O1CN015KvMU11Yj65cGXGCp_!!6000000003094-2-tps-72-72.png", "name": "", "description": "有效期一年" }],
  "detailRewardNotice": "",
  "process": { "current": 0, "max": 0 },
  "statusNotice": "",
  "explain": null,
  "referral": {
    "reward": 300,
    "userSignupAmount": 10,
    "userAmount": 10,
    "newUserTask": 10,
    "availableReward": 0,
    "verificationReward": 8000,
    "limitReward": 8000,
    "shortURL": "https://pages.aliyundrive.com/mobile-page/web/beinvited.html?code=0000007"
  },
  "monthlyCard": null,
  "popUps": null,
  "shareFissions": null,
  "subTasks": null,
  "shareAction": null,
  "darenShareViewModel": null
}
```

#### 福利社任务批量详情

POST: `https://member.aliyundrive.com/v1/users/batch_task_detail`

```json
{ "taskIds": ["52", "55", "58", "66", "69"] }
```

Response:

```json
[
  {
    "idempotent": "80bf00000000442b90368c27a7ec3443",
    "position": 3,
    "id": "66",
    "name": "第四周·周任务",
    "code": "adrive",
    "actionType": "openNative",
    "action": "smartdrive://vipcenter/opentaskcarddetail?taskId=66",
    "url": "",
    "appName": null,
    "description": "阿里云盘VIP免费领",
    "backgroundImage": "https://img.alicdn.com/imgextra/i3/O1CN01HK76N21tBlGdfXcjm_!!6000000005864-2-tps-1029-612.png",
    "backgroundColor": null,
    "darkBackgroundColor": null,
    "textColor": "#FFD601",
    "darkTextColor": "#FFD601",
    "status": "finished",
    "createdAt": 1645953637620,
    "finishedAt": 1647857247562,
    "notice": "一个月 VIP",
    "topRightCorner": "周年庆",
    "detailName": "第四周·周任务",
    "detailDescription": "阿里云盘VIP免费领",
    "detailBackgroundImage": "https://img.alicdn.com/imgextra/i3/O1CN01HK76N21tBlGdfXcjm_!!6000000005864-2-tps-1029-612.png",
    "detailIntroduction": null,
    "rewards": [{ "icon": "https://gw.alicdn.com/imgextra/i3/O1CN01nl3rNq1PWQc5cpUWQ_!!6000000001848-2-tps-72-72.png", "name": "阿里云盘VIP", "description": "完成两个任务即可获得1个月阿里云盘VIP " }],
    "detailRewardNotice": "",
    "process": { "current": 2, "max": 0 },
    "statusNotice": "领取阿里云盘VIP",
    "explain": { "title": "活动说明：\r\n1.  活动期为2022年3月21日-3月27日。\r\n2. 任务福利将于4月30日开启兑换，所有会员福利最晚兑换时间为2022年6月30日，过期后不可兑换。", "description": "" },
    "referral": null,
    "monthlyCard": null,
    "popUps": null,
    "shareFissions": null,
    "subTasks": [
      {
        "id": 67,
        "name": "订阅一个云盘订阅号",
        "actionType": "openNative",
        "action": "smartdrive://app/subscription",
        "url": "",
        "idempotent": "0c260000000042d493714b53fc6da210",
        "status": "finished",
        "statusNotice": "已完成",
        "position": 0
      },
      {
        "id": 68,
        "name": "转存一个订阅号分享的文件",
        "actionType": "openNative",
        "action": "smartdrive://userpage/openroot?userId=ec11691148db442aa7aa374ca707543c",
        "url": "",
        "idempotent": "369f000000004f188d85e7f682f9633f",
        "status": "finished",
        "statusNotice": "已完成",
        "position": 0
      }
    ],
    "shareAction": null,
    "darenShareViewModel": null
  }
]
```
