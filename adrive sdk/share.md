#### 我创建的分享链接

POST: `https://api.aliyundrive.com/adrive/v3/share_link/list`

```json
{ "category": "file,album", "order_direction": "DESC", "order_by": "created_at", "creator": "9400000000bc480bbcbbb1e074f55a7f", "limit": 100 }
```

Response:

```json
{
  "items": [
    {
      "popularity": 6,
      "share_id": "9Q00000000L",
      "share_msg": "「testali.alimc」，点击链接保存，或者复制本段内容，打开「阿里云盘」APP ，无需下载极速在线查看，视频原画倍速播放。",
      "share_name": "testali.alimc",
      "description": "",
      "expiration": "2022-04-08T10:29:22.000Z",
      "expired": false,
      "share_pwd": "",
      "share_url": "https://www.aliyundrive.com/s/9Q00000000L",
      "creator": "9400000000bc480bbcbbb1e074f55a7f",
      "drive_id": "9600002",
      "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
      "file_id_list": ["6228000000002c31be704ca28671f09712894f4f"],
      "preview_count": 2,
      "save_count": 0,
      "download_count": 0,
      "status": "enabled",
      "created_at": "2022-03-09T10:29:23.272Z",
      "updated_at": "2022-03-19T04:54:26.435Z",
      "first_file": {
        "trashed": false,
        "category": "others",
        "content_hash": "4DBF0000000023E6E756C29AF6AC487217921D53",
        "content_hash_name": "sha1",
        "content_type": "application/oct-stream",
        "crc64_hash": "1548000000008183211",
        "created_at": "2022-03-09T10:29:02.190Z",
        "domain_id": "bj29",
        "download_url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
        "drive_id": "9600002",
        "encrypt_mode": "none",
        "file_extension": "alimc",
        "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
        "hidden": false,
        "mime_type": "text/plain; charset=utf-8",
        "name": "testali.alimc",
        "parent_file_id": "613800000000336ae9164455b135a9729a298c9c",
        "punish_flag": 0,
        "size": 7318,
        "starred": false,
        "status": "available",
        "type": "file",
        "updated_at": "2022-03-09T10:29:51.415Z",
        "upload_id": "ED12000000004724833D47B5D5D3C8B9",
        "url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
        "user_meta": "{\"client\":\"web\"}"
      },
      "current_sync_status": 1,
      "next_sync_status": 2,
      "full_share_msg": "「testali.alimc」https://www.aliyundrive.com/s/9Q00000000L\n点击链接保存，或者复制本段内容，打开「阿里云盘」APP ，无需下载极速在线查看，视频原画倍速播放。",
      "popularity_str": "6",
      "display_name": "testali.alimc"
    },
    {
      "album": {
        "owner": "ccff000000004d75b5788a481eed8386",
        "name": "fff",
        "description": "",
        "album_id": "cfe400000000478599575b69356c5a4962383669",
        "file_count": 0,
        "image_count": 0,
        "video_count": 0,
        "created_at": 1642306691089,
        "updated_at": 1642306691089,
        "is_sharing": true
      },
      "popularity": 9,
      "share_id": "9Q00000000L",
      "share_msg": "我用阿里云盘分享了相簿「fff」，复制这段内容打开「阿里云盘」APP 即可获取。\n提取码: ni5u",
      "share_name": "fff",
      "description": "",
      "expiration": "2022-04-06T03:56:13.839Z",
      "expired": false,
      "share_pwd": "ni5u",
      "share_url": "https://www.aliyundrive.com/s/9Q00000000L",
      "creator": "9400000000bc480bbcbbb1e074f55a7f",
      "drive_id": "9600002",
      "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
      "album_id": "cfe400000000478599575b69356c5a4962383669",
      "preview_count": 4,
      "save_count": 0,
      "download_count": 0,
      "status": "enabled",
      "created_at": "2022-03-07T03:56:13.789Z",
      "updated_at": "2022-03-09T13:37:25.895Z",
      "full_share_msg": "相簿分享「fff」https://www.aliyundrive.com/s/9Q00000000L 提取码: ni5u\n点击链接保存，或者复制本段内容，打开「阿里云盘」APP，使用相册备份节省手机空间，体验智能分类和回忆自动生成。",
      "popularity_str": "9",
      "display_name": "相簿 ∙ fff"
    }
  ],
  "next_marker": ""
}
```

#### 读取一条自己的分享链接的信息

POST: `https://api.aliyundrive.com/adrive/v2/share_link/get`

```json
{ "share_id": "9Q00000000L" }
```

Response:

```json
{
  "popularity": 3,
  "share_id": "9Q00000000L",
  "share_msg": "「返回.gif」，点击链接保存，或者复制本段内容，打开「阿里云盘」APP ，无需下载极速在线查看，视频原画倍速播放。",
  "share_name": "返回.gif",
  "description": "",
  "expiration": "2022-04-20T04:41:04.509Z",
  "expired": false,
  "share_pwd": "",
  "share_url": "https://www.aliyundrive.com/s/9Q00000000L",
  "creator": "9400000000bc480bbcbbb1e074f55a7f",
  "drive_id": "9600002",
  "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
  "file_id_list": ["6228000000002c31be704ca28671f09712894f4f"],
  "preview_count": 0,
  "save_count": 0,
  "download_count": 0,
  "status": "enabled",
  "created_at": "2021-11-09T17:47:43.516Z",
  "updated_at": "2022-03-21T04:41:05.159Z",
  "first_file": {
    "trashed": false,
    "category": "image",
    "content_hash": "4DBF0000000023E6E756C29AF6AC487217921D53",
    "content_hash_name": "sha1",
    "content_type": "application/oct-stream",
    "crc64_hash": "1548000000008183211",
    "created_at": "2021-11-05T13:40:00.994Z",
    "domain_id": "bj29",
    "download_url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
    "drive_id": "9600002",
    "encrypt_mode": "none",
    "file_extension": "gif",
    "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
    "hidden": false,
    "image_media_metadata": {
      "exif": "{\"FileSize\":{\"value\":\"58391\"},\"Format\":{\"value\":\"gif\"},\"ImageHeight\":{\"value\":\"556\"},\"ImageWidth\":{\"value\":\"608\"}}",
      "height": 556,
      "image_quality": { "overall_score": 0.6453010439872742 },
      "width": 608
    },
    "labels": ["其他场景", "其他事物", "日常用品", "颜色", "文本", "手机截图", "信", "蓝色"],
    "mime_type": "image/gif",
    "name": "返回.gif",
    "parent_file_id": "root",
    "punish_flag": 0,
    "size": 58391,
    "starred": false,
    "status": "available",
    "thumbnail": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
    "type": "file",
    "updated_at": "2022-01-24T10:53:36.473Z",
    "upload_id": "ED12000000004724833D47B5D5D3C8B9",
    "url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
    "user_meta": "{\"client\":\"web\"}"
  },
  "current_sync_status": 1,
  "next_sync_status": 2,
  "popularity_str": "3",
  "full_share_msg": "「返回.gif」https://www.aliyundrive.com/s/9Q00000000L\n点击链接保存，或者复制本段内容，打开「阿里云盘」APP ，无需下载极速在线查看，视频原画倍速播放。",
  "display_name": "返回.gif"
}
```

#### 复制分享链接到剪切板

POST: `https://api.aliyundrive.com/adrive/v2/share_link/get_share_msg`

```json
{ "share_id": "9Q00000000L" }
```

Response:

```json
{ "full_share_msg": "「返回.gif」https://www.aliyundrive.com/s/9Q00000000L\n点击链接保存，或者复制本段内容，打开「阿里云盘」APP ，无需下载极速在线查看，视频原画倍速播放。", "share_url": "https://www.aliyundrive.com/s/9Q00000000L" }
```

#### 修改分享链接

POST: `https://api.aliyundrive.com/adrive/v2/share_link/update`

```json
{ "share_id": "9Q00000000L", "expiration": "2022-04-20T04:41:04.509Z" }
```

Response:

```json
{
  "popularity": 3,
  "share_id": "9Q00000000L",
  "share_msg": "「返回.gif」，点击链接保存，或者复制本段内容，打开「阿里云盘」APP ，无需下载极速在线查看，视频原画倍速播放。",
  "share_name": "返回.gif",
  "description": "",
  "expiration": "2022-04-20T04:41:04.509Z",
  "expired": false,
  "share_pwd": "",
  "share_url": "https://www.aliyundrive.com/s/9Q00000000L",
  "creator": "9400000000bc480bbcbbb1e074f55a7f",
  "drive_id": "9600002",
  "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
  "file_id_list": ["6228000000002c31be704ca28671f09712894f4f"],
  "preview_count": 0,
  "save_count": 0,
  "download_count": 0,
  "status": "enabled",
  "created_at": "2021-11-09T17:47:43.516Z",
  "updated_at": "2022-03-21T04:41:05.159Z",
  "first_file": {
    "trashed": false,
    "category": "image",
    "content_hash": "4DBF0000000023E6E756C29AF6AC487217921D53",
    "content_hash_name": "sha1",
    "content_type": "application/oct-stream",
    "crc64_hash": "1548000000008183211",
    "created_at": "2021-11-05T13:40:00.994Z",
    "domain_id": "bj29",
    "download_url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
    "drive_id": "9600002",
    "encrypt_mode": "none",
    "file_extension": "gif",
    "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
    "hidden": false,
    "image_media_metadata": {
      "height": 556,
      "image_quality": { "overall_score": 0.6453010439872742 },
      "width": 608
    },
    "labels": ["其他场景", "其他事物", "日常用品", "颜色", "文本", "手机截图", "信", "蓝色"],
    "mime_type": "image/gif",
    "name": "返回.gif",
    "parent_file_id": "root",
    "punish_flag": 0,
    "size": 58391,
    "starred": false,
    "status": "available",
    "thumbnail": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
    "type": "file",
    "updated_at": "2022-01-24T10:53:36.473Z",
    "upload_id": "ED12000000004724833D47B5D5D3C8B9",
    "url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
    "user_meta": "{\"client\":\"web\"}"
  },
  "current_sync_status": 1,
  "next_sync_status": 2,
  "popularity_str": "3",
  "full_share_msg": "「返回.gif」https://www.aliyundrive.com/s/9Q00000000L\n点击链接保存，或者复制本段内容，打开「阿里云盘」APP ，无需下载极速在线查看，视频原画倍速播放。",
  "display_name": "返回.gif"
}
```

#### 删除分享链接

POST: `https://api.aliyundrive.com/adrive/v2/share_link/cancel`

```json
{ "share_id": "9Q00000000L" }
```

Response:

```text
HTTP/1.1 200 OK
```

#### 创建分享链接

POST: `https://api.aliyundrive.com/adrive/v2/share_link/create`

```json
{ "drive_id": "9600002", "file_id_list": ["6228000000002c31be704ca28671f09712894f4f"], "expiration": "2022-04-20T08:01:05.278Z" }
```

Response:

```json
{
  "popularity": 3,
  "share_id": "9Q00000000L",
  "share_msg": "「dotull_x86.exe」，点击链接保存，或者复制本段内容，打开「阿里云盘」APP ，无需下载极速在线查看，视频原画倍速播放。",
  "share_name": "dotull_x86.exe",
  "description": "",
  "expiration": "2022-04-20T08:01:05.278Z",
  "expired": false,
  "share_pwd": "",
  "share_url": "https://www.aliyundrive.com/s/9Q00000000L",
  "creator": "9400000000bc480bbcbbb1e074f55a7f",
  "drive_id": "9600002",
  "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
  "file_id_list": ["6228000000002c31be704ca28671f09712894f4f"],
  "preview_count": 0,
  "save_count": 0,
  "download_count": 0,
  "status": "enabled",
  "created_at": "2022-03-21T08:01:03.739Z",
  "updated_at": "2022-03-21T08:01:03.739Z",
  "first_file": {
    "trashed": false,
    "category": "others",
    "content_hash": "4DBF0000000023E6E756C29AF6AC487217921D53",
    "content_hash_name": "sha1",
    "content_type": "application/oct-stream",
    "crc64_hash": "1548000000008183211",
    "created_at": "2021-12-05T02:05:08.125Z",
    "domain_id": "bj29",
    "download_url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
    "drive_id": "9600002",
    "encrypt_mode": "none",
    "file_extension": "exe",
    "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
    "hidden": false,
    "mime_type": "application/vnd.microsoft.portable-executable",
    "name": "dotull_x86.exe",
    "parent_file_id": "root",
    "punish_flag": 0,
    "size": 50449456,
    "starred": false,
    "status": "available",
    "type": "file",
    "updated_at": "2021-12-05T02:05:08.125Z",
    "upload_id": "ED12000000004724833D47B5D5D3C8B9",
    "url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
    "user_meta": "{\"client\":\"web\"}"
  },
  "is_photo_collection": false,
  "sync_to_homepage": false,
  "full_share_msg": "「dotull_x86.exe」https://www.aliyundrive.com/s/9Q00000000L\n点击链接保存，或者复制本段内容，打开「阿里云盘」APP ，无需下载极速在线查看，视频原画倍速播放。",
  "popularity_str": "3",
  "display_name": "dotull_x86.exe"
}
```

#### 检查是否可以分享

POST: `https://api.aliyundrive.com/adrive/v2/share_link/check_available`

```json
{ "drive_file_list": [{ "drive_id": "9600002", "file_id": "623b00000000d89ef21d4118838aed83de7575ba" }] }
```

Response:

```json
{
  "invalid_items": [
    {
      "trashed": false,
      "category": "others",
      "content_hash": "4DBF0000000023E6E756C29AF6AC487217921D53",
      "content_hash_name": "sha1",
      "content_type": "application/oct-stream",
      "crc64_hash": "1548000000008183211",
      "created_at": "2021-12-05T02:42:36.249Z",
      "domain_id": "bj29",
      "download_url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "drive_id": "9600002",
      "encrypt_mode": "none",
      "file_extension": "qrc",
      "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
      "hidden": false,
      "mime_type": "application/octet-stream",
      "name": "赵希予 - 克莱因蓝 - 186 - 克莱因蓝_qm.qrc",
      "parent_file_id": "613800000000336ae9164455b135a9729a298c9c",
      "punish_flag": 0,
      "size": 3979,
      "starred": false,
      "status": "available",
      "type": "file",
      "updated_at": "2022-03-21T13:16:16.209Z",
      "upload_id": "ED12000000004724833D47B5D5D3C8B9",
      "url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "user_meta": "{\"client\":\"web\"}"
    }
  ]
}
```

#### 分析出 shareid（必须是规范的格式）

POST: `https://api.aliyundrive.com/adrive/v2/share_link/extract_code`

```json
{ "content": "「The.Battle.at.L...获取更多免费资源.mkv」https://www.aliyundrive.com/s/9Q00000000L 提取码: f259\n点击链接保存，或者复制本段内容，打开「阿里云盘」APP ，无需下载极速在线查看，视频原画倍速播放。" }
```

Response:

```json
{ "code": "200", "message": "success", "data": { "share_id": "9Q00000000L", "share_pwd": "f259" }, "resultCode": "200" }
```

#### 读取分享链接信息

POST: `https://api.aliyundrive.com/adrive/v2/share_link/get_share_by_anonymous`

```json
{ "share_id": "9Q00000000L" }
```

Response:

```json
{
  "creator_id": "deb7000972d84bb6bfa74e42b22beb07",
  "creator_name": "霸***组",
  "creator_phone": "157***610",
  "expiration": "",
  "updated_at": "2022-03-22T03:16:01.088Z",
  "vip": "non-vip",
  "avatar": "https://ccp-bj29-bj-1592982087.oss-cn-beijing.aliyuncs.com/2GhCur3G%2F...",
  "share_name": "军检察官多伯曼犬",
  "file_count": 1,
  "allow_subscribe": false,
  "is_creator_followable": true,
  "is_following_creator": true,
  "display_name": "军检察官多伯曼犬",
  "file_infos": [{ "type": "folder", "file_id": "623b00000000d89ef21d4118838aed83de7575ba", "file_name": "军检察官多伯曼犬" }]
}
```

#### 打开分享链接

POST: `https://api.aliyundrive.com/v2/share_link/get_share_token`

```json
{ "share_id": "9Q00000000L", "share_pwd": "" }
```

Response:

```json
{
  "share_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXN0b21Kc29uIjoie1wiZG9tYWluX2lkXCI6XCJiajI5XCIsXCJzaGFyZV9pZFwiOlwiaTJRVllCVVVWQ1dcIixcImNyZWF0b3JcIjpcImNjZmY3ZDYwZWZkZjRkNzRiNTc4OGE0ODFlZWQ4Mzg2XCIsXCJ1c2VyX2lkXCI6XCJhbm9ueW1vdXNcIn0iLCJjdXN0b21UeXBlIjoic2hhcmVfbGluayIsImV4cCI6MTY0Nzg3NjM0MCwiaWF0IjoxNjQ3ODY5MDgwfQ.O-wrga-HmgbN4KUWFEhUDozvFu5qV0sn0ntjzbfGpExWQ9yzPCdxVNi-A-wmXtOHNJ5xwnA2GZnX-FsZZ1EQauaOjSswmcc5xsjEenx1ohJVpXPKgl0iKhd9BmmpURZ_4uByhgXFIcEux-Rob22wyt3_NvvfZotVKrvW-pn0Ne8",
  "expire_time": "2022-03-21T15:25:40.247Z",
  "expires_in": 7200
}
```

#### 分享链接内文件的下载地址

POST: `https://api.aliyundrive.com/v2/file/get_share_link_download_url`

```json
{ "drive_id": "9600002", "share_id": "9Q00000000L", "file_id": "623b00000000d89ef21d4118838aed83de7575ba", "expire_sec": 600 }
```

Response:

```json
{
  "download_url": "https://pdsapi.aliyundrive.com/v2/redirect?id=a8c5bda295434d4987610b391010bbd5",
  "url": "https://pdsapi.aliyundrive.com/v2/redirect?id=8b59b11717984cab801f651f6503f064",
  "thumbnail": "https://pdsapi.aliyundrive.com/v2/redirect?id=e511a261a19949399d9a2ab7cb0bc31a"
}
```

#### 分享链接内文件的预览地址

POST: `https://api.aliyundrive.com/v2/file/get_share_link_video_preview_play_info`

```json
{ "share_id": "9Q00000000L", "drive_id": "9600002", "file_id": "623b00000000d89ef21d4118838aed83de7575ba", "category": "live_transcoding", "template_id": "", "get_preview_url": true }
```

Response:

```json
{
  "share_id": "9Q00000000L",
  "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
  "video_preview_play_info": {
    "category": "live_transcoding",
    "meta": { "duration": 1464.669, "width": 672, "height": 504, "live_transcoding_meta": { "ts_segment": 10, "ts_total_count": 147, "ts_pre_count": 3 } },
    "live_transcoding_task_list": [
      {
        "template_id": "SD",
        "template_name": "pdsSD",
        "status": "finished",
        "stage": "stage_none",
        "url": "https://pdsapi.aliyundrive.com/v2/redirect?id=15b59a72f8904636bbca16bfa64fbd6d",
        "preview_url": "https://pdsapi.aliyundrive.com/v2/redirect?id=467363f46e1e490fa5811ba52c320744",
        "keep_original_resolution": true
      }
    ]
  }
}
```

#### 标记一个分享链接已读

POST: `https://api.aliyundrive.com/adrive/v1/share_link/subscription/update`

```json
{ "share_id": "9Q00000000L", "update_last_seen": true }
```

Response:

```json
{}
```

#### 导入分享

POST: `https://api.aliyundrive.com/adrive/v1/file/copy`

```json
{"body":{"auto_rename":true,"addition_data":{"umidtoken":"EmdLeXVLOsU9pTV/tFcskzsD8K4J80Ol"},"to_drive_id":"9600002","to_parent_file_id":"root","share_id":"ob7csMtYs9S","file_id":"619b000000006a42a4c143a99dd261777b2e149d"}
```

Response:

```json
{ "domain_id": "bj29", "drive_id": "9600002", "file_id": "623b00000000d89ef21d4118838aed83de7575ba", "async_task_id": "9fcb1e1d-0000-0000-b30d-387e04dcafcb" }
```

POST: `https://api.aliyundrive.com/v2/async_task/get`

```json
{ "async_task_id": "9fcb1e1d-0000-0000-b30d-387e04dcafcb" }
```

Response:

```json
{ "async_task_id": "9fcb1e1d-0000-0000-b30d-387e04dcafcb", "state": "Running", "message": "task is running", "total_process": 0, "consumed_process": 0, "punished_file_count": 0 }
```

```json
{ "async_task_id": "9fcb1e1d-0000-0000-b30d-387e04dcafcb", "state": "Succeed", "total_process": 0, "consumed_process": 0, "punished_file_count": 0 }
```
