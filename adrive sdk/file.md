#### 一个文件的信息

POST: `https://api.aliyundrive.com/v2/file/get`

```json
{
  "drive_id": "9600002",
  "office_thumbnail_process": "image/resize,m_lfit,w_256,limit_0/format,jpg",
  "image_thumbnail_process": "image/resize,m_lfit,w_256,limit_0/format,jpg",
  "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
  "video_thumbnail_process": "video/snapshot,t_0,f_jpg,m_lfit,w_256,ar_auto,m_fast",
  "permanently": false,
  "image_url_process": "image/resize,m_lfit,w_1080/format,webp",
  "url_expire_sec": 1800
}
```

Response:

```json
{
  "drive_id": "9600002",
  "domain_id": "bj29",
  "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
  "name": "父文件夹23",
  "type": "folder",
  "created_at": "2021-11-05T12:23:02.914Z",
  "updated_at": "2022-01-24T10:53:36.469Z",
  "hidden": false,
  "starred": false,
  "status": "available",
  "user_meta": "{\"shares\":[\"2eVphedN4QT\"],\"client\":\"web\"}",
  "parent_file_id": "root",
  "encrypt_mode": "none",
  "creator_type": "User",
  "creator_id": "9400000000bc480bbcbbb1e074f55a7f",
  "last_modifier_type": "User",
  "last_modifier_id": "9400000000bc480bbcbbb1e074f55a7f",
  "revision_id": "",
  "ex_fields_info": { "image_count": 0 },
  "trashed": false
}
```

#### 一个文件的信息 get_by_path

POST: `https://api.aliyundrive.com/v2/file/get_by_path`

```json
{ "drive_id": "9600002", "file_path": "/zip23" }
```

Response:

```json
{
  "drive_id": "9600002",
  "domain_id": "bj29",
  "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
  "name": "zip23",
  "type": "folder",
  "created_at": "2021-08-28T02:54:02.561Z",
  "updated_at": "2022-01-24T10:53:36.474Z",
  "hidden": false,
  "starred": false,
  "status": "available",
  "user_meta": "{\"shares\":[\"mUo000000ka\"]}",
  "parent_file_id": "root",
  "encrypt_mode": "none",
  "last_modifier_type": "User",
  "last_modifier_id": "9400000000bc480bbcbbb1e074f55a7f",
  "revision_id": "",
  "trashed": false
}
```

#### 一个文件的路径（root[不含] -> file_id 本身）

POST: `https://api.aliyundrive.com/adrive/v1/file/get_path`

```json
{ "drive_id": "9600002", "file_id": "623b00000000d89ef21d4118838aed83de7575ba" }
```

Response:

```json
{
  "items": [
    {
      "trashed": false,
      "created_at": "2021-11-06T02:51:06.833Z",
      "domain_id": "bj29",
      "drive_id": "9600002",
      "encrypt_mode": "none",
      "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
      "hidden": false,
      "name": "donghua",
      "parent_file_id": "613800000000336ae9164455b135a9729a298c9c",
      "starred": false,
      "status": "available",
      "type": "folder",
      "updated_at": "2021-11-06T02:51:06.833Z",
      "user_meta": "{\"client\":\"web\"}",
      "ex_fields_info": { "image_count": 0 }
    },
    {
      "trashed": false,
      "created_at": "2021-11-05T12:23:02.914Z",
      "domain_id": "bj29",
      "drive_id": "9600002",
      "encrypt_mode": "none",
      "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
      "hidden": false,
      "name": "父文件夹23",
      "parent_file_id": "root",
      "starred": false,
      "status": "available",
      "type": "folder",
      "updated_at": "2022-01-24T10:53:36.469Z",
      "user_meta": "{\"shares\":[\"mUo000000ka\"],\"client\":\"web\"}",
      "ex_fields_info": { "image_count": 0 }
    }
  ]
}
```

#### 直接下载

GET: `https://api.aliyundrive.com/v2/file/download?drive_id=9600002&file_id=623b00000000d89ef21d4118838aed83de7575ba&image_thumbnail_process=image%2Fresize%2Cm_lfit%2Cw_256%2Climit_0%2Fformat%2Cjpg%7Cimage%2Fformat%2Cwebp`

```json

```

Response:

```text
<a href="https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...">Moved Permanently</a>.
```

#### 单个下载地址

GET: `https://api.aliyundrive.com/v2/file/get_download_url`

```json
{ "drive_id": "9600002", "expires_sec": 0, "file_id": "623b00000000d89ef21d4118838aed83de7575ba" }
```

Response:

```json
{
  "method": "GET",
  "url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
  "internal_url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
  "expiration": "2022-03-22T14:54:28.057Z",
  "size": 13,
  "ratelimit": { "part_speed": -1, "part_size": -1 },
  "crc64_hash": "1548000000008183211",
  "content_hash": "4DBF0000000023E6E756C29AF6AC487217921D53",
  "content_hash_name": "sha1"
}
```

#### 打包下载(失效)

GET: `https://api.aliyundrive.com/adrive/v1/file/multiDownloadUrl`

```json
{ "archive_name": "archive_name", "download_infos": [{ "drive_id": "9600002", "files": [{ "file_id": "623b00000000d89ef21d4118838aed83de7575ba" }] }] }
```

Response:

```json
{ "download_url": "https://file.aliyundrive.com/files/archive?task_id=c3f2cd02-0000-0000-8c5a-e80fb1e6f35d&uid=ccff000000004d74b5788a481eed8386" }
```

#### 预览地址(Office)

POST: `https://api.aliyundrive.com/v2/file/get_office_preview_url`

```json
{ "drive_id": "9600002", "file_id": "623b00000000d89ef21d4118838aed83de7575ba" }
```

Response:

```json
{ "preview_url": "https://office-cn-beijing.imm.aliyuncs.com/office/w/623b00000000d89ef21d4118838aed83de7575ba?_w_tokentype=1&hidecmb=1&simple=1", "access_token": "9eedf665d2464dfcbcabcef640211f0av3" }
```

#### 预览地址(OfficeEdit)

POST: `https://api.aliyundrive.com/v2/file/get_office_edit_url`

```json
{ "drive_id": "9600002", "file_id": "623b00000000d89ef21d4118838aed83de7575ba", "option": { "readonly": false } }
```

Response:

```json
{
  "edit_url": "https://office-cn-beijing.imm.aliyuncs.com/office/p/623b00000000d89ef21d4118838aed83de7575ba?_w_tokentype=1",
  "office_access_token": "75d3976f75a44e4980439ae8ac58ccf1v3",
  "office_refresh_token": "ca61bb7e51394b62924a09552de868e3v3"
}
```

#### 预览地址(Video)

POST: `https://api.aliyundrive.com/v2/file/get_video_preview_play_info`

```json
{ "file_id": "623b00000000d89ef21d4118838aed83de7575ba", "template_id": "", "url_expire_sec": 3600, "get_subtitle_info": true, "category": "live_transcoding", "drive_id": "9600002" }
```

Response:

```json
{
  "domain_id": "bj29",
  "drive_id": "9600002",
  "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
  "video_preview_play_info": {
    "category": "live_transcoding",
    "meta": { "duration": 6728.747, "width": 3840, "height": 2160, "live_transcoding_meta": { "ts_segment": 10, "ts_total_count": 673, "ts_pre_count": 3 } },
    "live_transcoding_task_list": [
      {
        "template_id": "SD",
        "template_name": "pdsSD",
        "status": "finished",
        "stage": "stage_all",
        "url": "https://ccp-bj29-video-preview.oss-cn-beijing.aliyuncs.com/lt/E85700000000F9AF45055D714AF43EE744E7262F_51495704429__sha1_bj29/SD/media.m3u8?di=bj29&dr=9600002&f=623b00000000d89ef21d4118838aed83de7575ba&u=9400000000bc480bbcbbb1e074f55a7f&x-oss-access-key-id=LTAIsE5mAn2F493Q&x-oss-expires=1648039409&x-oss-process=hls%2Fsign&x-oss-signature=qBAS4aI%2F3hT7TFv2mAlgeigtDNtoEK2Vk3BHkCYMXUI%3D&x-oss-signature-version=OSS2"
      },
      {
        "template_id": "HD",
        "template_name": "pdsHD",
        "status": "finished",
        "stage": "stage_all",
        "url": "https://ccp-bj29-video-preview.oss-cn-beijing.aliyuncs.com/lt/E85700000000F9AF45055D714AF43EE744E7262F_51495704429__sha1_bj29/HD/media.m3u8?di=bj29&dr=9600002&f=623b00000000d89ef21d4118838aed83de7575ba&u=9400000000bc480bbcbbb1e074f55a7f&x-oss-access-key-id=LTAIsE5mAn2F493Q&x-oss-expires=1648039409&x-oss-process=hls%2Fsign&x-oss-signature=xv2x1WcvwqHpadUysuVyG%2FqsC4SGemy8kuXTUQ6G8qA%3D&x-oss-signature-version=OSS2"
      },
      {
        "template_id": "FHD",
        "template_name": "pdsFHD",
        "status": "finished",
        "stage": "stage_all",
        "url": "https://ccp-bj29-video-preview.oss-cn-beijing.aliyuncs.com/lt/E85700000000F9AF45055D714AF43EE744E7262F_51495704429__sha1_bj29/FHD/media.m3u8?di=bj29&dr=9600002&f=623b00000000d89ef21d4118838aed83de7575ba&u=9400000000bc480bbcbbb1e074f55a7f&x-oss-access-key-id=LTAIsE5mAn2F493Q&x-oss-expires=1648039409&x-oss-process=hls%2Fsign&x-oss-signature=EK6lF3iznE9mW7PHfAQDT5vUZfQRV99aQ%2BS06Ir5P9I%3D&x-oss-signature-version=OSS2"
      }
    ],
    "live_transcoding_subtitle_task_list": [
      {
        "language": "chi",
        "status": "finished",
        "url": "https://ccp-bj29-video-preview.oss-cn-beijing.aliyuncs.com/lt/E85700000000F9AF45055D714AF43EE744E7262F_51495704429__sha1_bj29/subtitle/chi_0.vtt?di=bj29&dr=9600002&f=623b00000000d89ef21d4118838aed83de7575ba&u=9400000000bc480bbcbbb1e074f55a7f&x-oss-access-key-id=LTAIsE5mAn2F493Q&x-oss-expires=1648039409&x-oss-signature=%2Bywa3xJQWhSbqwhfj0namnSgH0Da5mYg%2F7cEU6hbsOI%3D&x-oss-signature-version=OSS2"
      }
    ]
  }
}
```

#### 预览地址(VideoUrl)

POST: `https://api.aliyundrive.com/v2/file/get_video_preview_url`

```json
{ "drive_id": "9600002", "file_id": "623b00000000d89ef21d4118838aed83de7575ba", "template_id": "HD", "url_expire_sec": 14400 }
```

Response:

```json
{
  "preview_url": "https://ccp-bj29-video-preview.oss-cn-beijing.aliyuncs.com/bj29/sha1_1ADDEFFAB9820EDC1ECEAFA8F9D6511456A4053C_167238406_/HD/master.mp4?di=bj29&dr=9600002&f=623b00000000d89ef21d4118838aed83de7575ba&u=9400000000bc480bbcbbb1e074f55a7f&x-oss-access-key-id=LTAIsE5mAn2F493Q&x-oss-expires=1648018799&x-oss-signature=KZikIyRSw4c9WkYa2M3Mk4NQjAkdmmg60R6z3I2UJDY%3D&x-oss-signature-version=OSS2"
}
```

#### 预览地址(Audio)

POST: `https://api.aliyundrive.com/v2/databox/get_audio_play_info`

```json
{ "drive_id": "9600002", "file_id": "623b00000000d89ef21d4118838aed83de7575ba" }
```

Response:

```json
{
  "template_list": [
    {
      "template_id": "LQ",
      "status": "finished",
      "url": "https://ccp-bj29-video-preview.oss-cn-beijing.aliyuncs.com/bj29/sha1_4E2B9BBE6B93AE7DAAF932966EDF43CD307EC5A1_4030744_/LQ/master.mp3?di=bj29\u0026dr=9600002\u0026f=623b00000000d89ef21d4118838aed83de7575ba\u0026u=9400000000bc480bbcbbb1e074f55a7f\u0026x-oss-access-key-id=LTAIsE5mAn2F493Q\u0026x-oss-expires=1647960250\u0026x-oss-signature=S5pC%2BAje9NY4%2FYCYchj%2BC5LnsLZffAezK3%2F24CEjrvk%3D\u0026x-oss-signature-version=OSS2\u0026x-oss-traffic-limit=31457280"
    }
  ]
}
```

#### 重命名

POST: `https://api.aliyundrive.com/v3/file/update`

```json
{ "drive_id": "9600002", "file_id": "623b00000000d89ef21d4118838aed83de7575ba", "name": "Screenshot_2021-11-23-09-34-20-248_com.tencet.mm.jpg", "check_name_mode": "refuse" }
```

Response:

```json
file
```

#### 移动

POST: `https://api.aliyundrive.com/v3/file/move`

```json
{ "auto_rename": false, "overwrite": false, "drive_id": "9600002", "to_drive_id": "9600002", "to_parent_file_id": "613800000000336ae9164455b135a9729a298c9c", "file_id": "623b00000000d89ef21d4118838aed83de7575ba" }
```

Response:

```json
{ "domain_id": "bj29", "drive_id": "9600002", "file_id": "623b00000000d89ef21d4118838aed83de7575ba" }
```

#### 复制

POST: `https://api.aliyundrive.com/v3/file/copy`

```json
{ "auto_rename": false, "drive_id": "9600002", "to_drive_id": "9600002", "to_parent_file_id": "root", "file_id": "623b00000000d89ef21d4118838aed83de7575ba", "new_name": "" }
```

Response:

```json
{ "domain_id": "bj29", "drive_id": "9600002", "file_id": "623b00000000d89ef21d4118838aed83de7575ba" }
```

#### 列表 list

POST: `https://api.aliyundrive.com/v2/file/list`

```json
{
  "fields": "*",
  "drive_id": "9600002",
  "office_thumbnail_process": "image/resize,m_lfit,w_256,limit_0/format,jpg",
  "order_direction": "DESC",
  "image_thumbnail_process": "image/resize,m_lfit,w_256,limit_0/format,jpg",
  "order_by": "name",
  "limit": 50,
  "video_thumbnail_process": "video/snapshot,t_0,f_jpg,m_lfit,w_256,ar_auto,m_fast",
  "parent_file_id": "613800000000336ae9164455b135a9729a298c9c",
  "all": false,
  "image_url_process": "image/resize,m_lfit,w_1080/format,webp"
}
```

Response:

```json
{
  "items": [
    {
      "drive_id": "9600002",
      "domain_id": "bj29",
      "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
      "name": "试看版",
      "type": "folder",
      "created_at": "2021-11-06T03:15:19.060Z",
      "updated_at": "2021-11-06T03:15:19.060Z",
      "hidden": false,
      "starred": false,
      "status": "available",
      "user_meta": "{\"client\":\"web\"}",
      "parent_file_id": "613800000000336ae9164455b135a9729a298c9c",
      "encrypt_mode": "none",
      "creator_type": "User",
      "creator_id": "9400000000bc480bbcbbb1e074f55a7f",
      "creator_name": "myname",
      "last_modifier_type": "User",
      "last_modifier_id": "9400000000bc480bbcbbb1e074f55a7f",
      "last_modifier_name": "myname",
      "revision_id": ""
    },
    {
      "drive_id": "9600002",
      "domain_id": "bj29",
      "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
      "name": "压缩包.zip",
      "type": "file",
      "content_type": "application/oct-stream",
      "created_at": "2021-11-06T03:31:13.518Z",
      "updated_at": "2021-11-06T03:31:13.518Z",
      "file_extension": "zip",
      "mime_type": "application/zip",
      "mime_extension": "zip",
      "hidden": false,
      "size": 604818808,
      "starred": false,
      "status": "available",
      "user_meta": "{\"client\":\"web\"}",
      "upload_id": "ED12000000004724833D47B5D5D3C8B9",
      "parent_file_id": "613800000000336ae9164455b135a9729a298c9c",
      "crc64_hash": "1548000000008183211",
      "content_hash": "4DBF0000000023E6E756C29AF6AC487217921D53",
      "content_hash_name": "sha1",
      "download_url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "category": "zip",
      "encrypt_mode": "none",
      "punish_flag": 0,
      "creator_type": "User",
      "creator_id": "9400000000bc480bbcbbb1e074f55a7f",
      "creator_name": "myname",
      "last_modifier_type": "User",
      "last_modifier_id": "9400000000bc480bbcbbb1e074f55a7f",
      "last_modifier_name": "myname",
      "revision_id": "6138000000000b81a8164550b1e7cba1d7fbe111"
    },
    {
      "drive_id": "9600002",
      "domain_id": "bj29",
      "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
      "name": "夫知間.jpg",
      "type": "file",
      "content_type": "application/oct-stream",
      "created_at": "2021-11-06T03:16:33.170Z",
      "updated_at": "2021-11-06T03:16:33.390Z",
      "file_extension": "jpg",
      "mime_type": "image/jpeg",
      "mime_extension": "jpg",
      "hidden": false,
      "size": 294767,
      "starred": false,
      "status": "available",
      "user_meta": "{\"client\":\"web\"}",
      "labels": ["其他事物", "艺术品"],
      "upload_id": "ED12000000004724833D47B5D5D3C8B9",
      "parent_file_id": "613800000000336ae9164455b135a9729a298c9c",
      "crc64_hash": "1548000000008183211",
      "content_hash": "4DBF0000000023E6E756C29AF6AC487217921D53",
      "content_hash_name": "sha1",
      "download_url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "thumbnail": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "category": "image",
      "encrypt_mode": "none",
      "image_media_metadata": {
        "width": 1627,
        "height": 2310,
        "exif": "{\"FileSize\":{\"value\":\"294767\"},\"Format\":{\"value\":\"jpg\"},\"ImageHeight\":{\"value\":\"2310\"},\"ImageWidth\":{\"value\":\"1627\"},\"ResolutionUnit\":{\"value\":\"2\"},\"XResolution\":{\"value\":\"300/1\"},\"YResolution\":{\"value\":\"300/1\"}}",
        "image_quality": { "overall_score": 0.7194659113883972 }
      },
      "punish_flag": 2,
      "last_modifier_type": "User",
      "last_modifier_id": "9400000000bc480bbcbbb1e074f55a7f",
      "last_modifier_name": "myname",
      "revision_id": "6138000000000b81a8164550b1e7cba1d7fbe111"
    },
    {
      "drive_id": "9600002",
      "domain_id": "bj29",
      "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
      "name": "麻冬.zip",
      "type": "file",
      "content_type": "application/oct-stream",
      "created_at": "2021-11-06T03:16:58.189Z",
      "updated_at": "2021-11-06T03:16:58.189Z",
      "file_extension": "zip",
      "mime_type": "application/zip",
      "mime_extension": "zip",
      "hidden": false,
      "size": 575786476,
      "starred": false,
      "status": "available",
      "user_meta": "{\"client\":\"web\"}",
      "upload_id": "ED12000000004724833D47B5D5D3C8B9",
      "parent_file_id": "613800000000336ae9164455b135a9729a298c9c",
      "crc64_hash": "1548000000008183211",
      "content_hash": "4DBF0000000023E6E756C29AF6AC487217921D53",
      "content_hash_name": "sha1",
      "download_url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "category": "zip",
      "encrypt_mode": "none",
      "punish_flag": 0,
      "creator_type": "User",
      "creator_id": "9400000000bc480bbcbbb1e074f55a7f",
      "creator_name": "myname",
      "last_modifier_type": "User",
      "last_modifier_id": "9400000000bc480bbcbbb1e074f55a7f",
      "last_modifier_name": "myname",
      "revision_id": "6138000000000b81a8164550b1e7cba1d7fbe111"
    }
  ],
  "next_marker": "",
  "punished_file_count": 0
}
```

#### 列表 walk

POST: `https://api.aliyundrive.com/v2/file/walk`

```json
{
  "all": false,
  "drive_id": "9600002",
  "fields": "*",
  "image_thumbnail_process": "image/resize,m_lfit,w_256,limit_0/format,jpg|image/format,webp",
  "image_url_process": "image/resize,m_lfit,w_1080/format,webp",
  "limit": 1000,
  "marker": "",
  "office_thumbnail_process": "image/resize,m_lfit,w_256,limit_0/format,jpg|image/format,webp",
  "parent_file_id": "613800000000336ae9164455b135a9729a298c9c",
  "video_thumbnail_process": "video/snapshot,t_120000,f_jpg,m_lfit,w_256,ar_auto,m_fast"
}
```

```json
{
  "all": false,
  "drive_id": "9600002",
  "fields": "*",
  "image_thumbnail_process": "image/resize,m_lfit,w_256,limit_0/format,jpg|image/format,webp",
  "image_url_process": "image/resize,m_lfit,w_1080/format,webp",
  "limit": 800,
  "marker": "",
  "office_thumbnail_process": "image/resize,m_lfit,w_256,limit_0/format,jpg|image/format,webp",
  "parent_file_id": "613800000000336ae9164455b135a9729a298c9c",
  "video_thumbnail_process": "video/snapshot,t_120000,f_jpg,m_lfit,w_256,ar_auto,m_fast",
  "return_total_count": true,
  "type": "folder"
}
```

Response:

```json
filelist
```

#### 列表(全量) scan

POST: `https://api.aliyundrive.com/v2/file/scan`

```json
{
  "drive_id": "9600002",
  "category": "image",
  "limit": 1000
}
```

Response:

```json
filelist
```

#### 收藏列表

POST: `https://api.aliyundrive.com/v2/file/list_by_custom_index_key`

```json
{
  "fields": "*",
  "drive_id": "9600002",
  "image_thumbnail_process": "image/resize,m_lfit,w_256,limit_0/format,jpg",
  "limit": 50,
  "video_thumbnail_process": "video/snapshot,t_0,f_jpg,m_lfit,w_256,ar_auto,m_fast",
  "parent_file_id": "root",
  "all": false,
  "image_url_process": "image/resize,m_lfit,w_1080/format,webp",
  "custom_index_key": "starred_yes"
}
```

Response:

```json
filelist
```

#### 收藏文件

POST: `https://api.aliyundrive.com/v3/file/update`

```json
{ "hidden": false, "drive_id": "9600002", "starred": false, "file_id": "623b00000000d89ef21d4118838aed83de7575ba", "custom_index_key": "" }
```

```json
{ "hidden": false, "drive_id": "9600002", "starred": true, "file_id": "623b00000000d89ef21d4118838aed83de7575ba", "custom_index_key": "starred_yes" }
```

Response:

```json
file
```

#### 删除文件（从回收站彻底删除）

POST: `https://api.aliyundrive.com/v3/file/delete`

```json
{ "file_id": "623b00000000d89ef21d4118838aed83de7575ba", "drive_id": "9600002" }
```

Response:

```text
HTTP/1.1 204 No Content
```

#### 增加文件 user_tags

POST: `https://api.aliyundrive.com/v2/file/put_usertags`

```json
{ "file_id": "623b00000000d89ef21d4118838aed83de7575ba", "drive_id": "9600002", "user_tags": [{ "key": "k", "value": "0" }] }
```

Response:

```json
{ "file_id": "623b00000000d89ef21d4118838aed83de7575ba" }
```

#### 删除文件 user_tags

POST: `https://api.aliyundrive.com/v2/file/delete_usertags`

```json
{ "file_id": "623b00000000d89ef21d4118838aed83de7575ba", "drive_id": "9600002", "key_list": ["k"] }
```

Response:

```text
HTTP/1.1 204 No Content
```

#### 未知 list_delta(向相册中上传文件时触发)

POST: `https://api.aliyundrive.com/v2/file/list_delta`

```json
{ "cursor": "MDAwMDAwMDA6MDAwNWRhYjNiYjQ2YTFkMzowMDAwMDAwMQ==", "drive_id": "9600002", "limit": 1000 }
```

Response:

```json
{
  "items": [
    {
      "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
      "op": "create",
      "file": {
        "drive_id": "9600002",
        "domain_id": "bj29",
        "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
        "name": "ic_acloud_launcher.png",
        "type": "file",
        "content_type": "image/png",
        "created_at": "2022-03-22T04:28:47.498Z",
        "updated_at": "2022-03-22T04:28:47.498Z",
        "file_extension": "png",
        "hidden": false,
        "size": 6414,
        "starred": false,
        "status": "available",        
        "upload_id": "ED12000000004724833D47B5D5D3C8B9",
        "parent_file_id": "root",
        "crc64_hash": "1548000000008183211",
        "content_hash": "4DBF0000000023E6E756C29AF6AC487217921D53",
        "content_hash_name": "sha1",
        "category": "image",
        "encrypt_mode": "none",
        "image_media_metadata": { "image_quality": {} },
        "characteristic_hash": "e14f000000004eb4ae91b8a4a723c2a11361928f",
        "revision_id": ""
      },
      "current_category": "image"
    },
    {
      "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
      "op": "update",
      "file": {
        "drive_id": "9600002",
        "domain_id": "bj29",
        "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
        "labels": ["其他事物", "蓝色"],
        "category": "image",
        "image_media_metadata": {
          "width": 108,
          "height": 108,          
          "image_quality": { "overall_score": 0.4490000009536743 }
        },
        "revision_id": ""
      },
      "current_category": "image"
    }
  ],
  "has_more": false,
  "cursor": "MDAwMDAwMDA6MDAwNWRhYzcwYzk2ZTM4OTowMDAwMDAwMQ=="
}
```
