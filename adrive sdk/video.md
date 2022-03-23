#### 放映室-列出全部专辑

POST: `https://api.aliyundrive.com/adrive/v2/video/list`

```json
{ "use_compilation": true, "duration": 0, "order_by": "created_at desc", "hidden_type": "NO_HIDDEN", "limit": 50 }
```

Response:

```json
{
  "items": [
    {
      "name": "hotel.2022.mp4",
      "thumbnail": "https://api.aliyundrive.com/v2/file/download?drive_id=9600002&file_id=623b00000000d89ef21d4118838aed83de7575ba&video_thumbnail_process=video/snapshot,t_120000,f_jpg,w_480,ar_auto,m_fast",
      "type": "file",
      "category": "video",
      "url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "size": 2623499628,
      "starred": false,
      "duration": "0",
      "independent": true,
      "parent_file_id": "root",
      "drive_id": "9600002",
      "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
      "file_extension": "mp4",
      "content_hash": "4DBF0000000023E6E756C29AF6AC487217921D53",
      "domain_id": "bj29",
      "download_url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "user_meta": "{\"client\":\"web\"}",
      "content_type": "application/oct-stream",
      "created_at": "2022-03-20T04:26:18.082+00:00",
      "updated_at": "2022-03-20T04:26:18.082+00:00",
      "trashed_at": null,
      "punish_flag": 1,
      "video_type": "COMMON",
      "video_hidden": false,
      "play_cursor": "0",
      "video_media_metadata": {},
      "video_preview_metadata": { "bitrate": "3996225", "duration": "5251.955000", "height": 1040, "width": 1920, "audio_format": "aac", "frame_rate": "24000/1001" },
      "compilation_id": "9600002_6236000000001b86cee34bdab3a5ad1d4d0cd676",
      "grand_parent_file_id": null
    },
    {
      "name": "总复习",
      "thumbnail": "https://api.aliyundrive.com/v2/file/download?drive_id=9600002&file_id=623b00000000d89ef21d4118838aed83de7575ba&video_thumbnail_process=video/snapshot,t_120000,f_jpg,w_480,ar_auto,m_fast",
      "created_at": "2022-01-23T04:21:54.470+00:00",
      "updated_at": "2022-01-23T04:21:54.743+00:00",
      "trashed_at": null,
      "video_type": "COMPILATION",
      "video_hidden": false,
      "video_nums": "7",
      "compilation_id": "9600002_61ec000000009a6068fe4c67936d781b6c2fced2"
    }
  ],
  "next_marker": ""
}
```

#### 放映室-最近播放

POST: `https://api.aliyundrive.com/adrive/v2/video/recentList`

```json
{}
```

Response:

```json
{
  "items": [
    {
      "name": "综合复习.mp4",
      "thumbnail": "https://api.aliyundrive.com/v2/file/download?drive_id=9600002&file_id=623b00000000d89ef21d4118838aed83de7575ba&video_thumbnail_process=video/snapshot,t_125201,f_jpg,w_480,ar_auto,m_fast",
      "size": 167238406,
      "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
      "file_extension": "mp4",
      "drive_id": "9600002",
      "duration": "1800.80",
      "play_cursor": "125.201",
      "last_played_at": "2022-03-19T13:46:04.000+00:00",
      "compilation_id": "9600002_61ec000000009a6068fe4c67936d781b6c2fced2"
    }
  ]
}
```

#### 列出一个专辑包含的文件

POST: `https://api.aliyundrive.com/adrive/v2/video/compilation/list`

```json
{ "duration": 0, "hidden_type": "NO_HIDDEN", "name": "总复习", "limit": 50 }
```

Response:

```json
{
  "items": [
    {
      "name": "热点复习.mp4",
      "thumbnail": "https://api.aliyundrive.com/v2/file/download?drive_id=9600002&file_id=623b00000000d89ef21d4118838aed83de7575ba&video_thumbnail_process=video/snapshot,t_120000,f_jpg,w_480,ar_auto,m_fast",
      "type": "file",
      "category": "video",
      "url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "size": 181714186,
      "starred": false,
      "duration": "1800.080000",
      "labels": ["其他场景", "内部场景"],
      "independent": false,
      "parent_file_id": "613800000000336ae9164455b135a9729a298c9c",
      "drive_id": "9600002",
      "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
      "file_extension": "mp4",
      "content_hash": "4DBF0000000023E6E756C29AF6AC487217921D53",
      "domain_id": "bj29",
      "download_url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "content_type": "application/oct-stream",
      "created_at": "2022-01-23T04:21:54.563+00:00",
      "updated_at": "2022-01-23T04:21:54.563+00:00",
      "trashed_at": null,
      "punish_flag": 0,
      "video_type": "COMMON",
      "video_hidden": false,
      "play_cursor": "0",
      "video_media_metadata": {
        "duration": "1800.080000",
        "height": 1080,
        "width": 1920
      },
      "video_preview_metadata": { "bitrate": "807582", "duration": "1800.080000", "height": 1080, "width": 1920, "audio_format": "aac", "frame_rate": "25/1", "template_list": [{ "status": "finished", "template_id": "HD" }] },
      "compilation_id": "9600002_61ec000000009a6068fe4c67936d781b6c2fced2",
      "grand_parent_file_id": null
    }
  ],
  "next_marker": ""
}
```

#### 从专辑里隐藏一个文件

POST: `https://api.aliyundrive.com/adrive/v2/video/update`

```json
{ "play_cursor": "0", "file_id": "623b00000000d89ef21d4118838aed83de7575ba", "drive_id": "9600002", "hidden": true }
```

Response:

```json
{
  "name": "热点复习.mp4",
  "thumbnail": "https://api.aliyundrive.com/v2/file/download?drive_id=9600002&file_id=623b00000000d89ef21d4118838aed83de7575ba&video_thumbnail_process=video/snapshot,t_0,f_jpg,w_480,ar_auto,m_fast",
  "type": "file",
  "category": "video",
  "url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
  "size": 181714186,
  "starred": false,
  "duration": "1800.080000",
  "labels": ["其他场景", "内部场景"],
  "independent": true,
  "parent_file_id": "613800000000336ae9164455b135a9729a298c9c",
  "drive_id": "9600002",
  "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
  "file_extension": "mp4",
  "content_hash": "4DBF0000000023E6E756C29AF6AC487217921D53",
  "domain_id": "bj29",
  "download_url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
  "content_type": "application/oct-stream",
  "created_at": "2022-01-23T04:21:54.563+00:00",
  "updated_at": "2022-01-23T04:21:54.563+00:00",
  "trashed_at": null,
  "punish_flag": 0,
  "video_hidden": true,
  "play_cursor": "0",
  "video_media_metadata": {
    "duration": "1800.080000",
    "height": 1080,
    "width": 1920
  },
  "video_preview_metadata": { "bitrate": "807582", "duration": "1800.080000", "height": 1080, "width": 1920, "audio_format": "aac", "frame_rate": "25/1", "template_list": [{ "status": "finished", "template_id": "HD" }] },
  "grand_parent_file_id": null
}
```

#### 播放列表（根据一个文件，列出同专辑的文件列表）

POST: `https://api.aliyundrive.com/adrive/v2/video/compilation/listByFileInfo`

```json
{ "file_id": "623b00000000d89ef21d4118838aed83de7575ba", "limit": "100", "drive_id": "9600002" }
```

Response:

```json
{
  "items": [
    {
      "name": "热点复习.mp4",
      "thumbnail": "https://api.aliyundrive.com/v2/file/download?drive_id=9600002&file_id=623b00000000d89ef21d4118838aed83de7575ba&video_thumbnail_process=video/snapshot,t_120000,f_jpg,w_480,ar_auto,m_fast",
      "type": "file",
      "category": "video",
      "url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "size": 181714186,
      "starred": false,
      "duration": "1800.080000",
      "labels": ["其他场景", "内部场景"],
      "independent": false,
      "parent_file_id": "613800000000336ae9164455b135a9729a298c9c",
      "drive_id": "9600002",
      "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
      "file_extension": "mp4",
      "content_hash": "4DBF0000000023E6E756C29AF6AC487217921D53",
      "domain_id": "bj29",
      "download_url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "user_meta": "{\"play_cursor\":\"0\"}",
      "content_type": "application/oct-stream",
      "created_at": "2022-01-23T04:21:54.563+00:00",
      "updated_at": "2022-03-21T09:39:07.226+00:00",
      "trashed_at": null,
      "punish_flag": 0,
      "video_type": "COMMON",
      "video_hidden": true,
      "play_cursor": "0",
      "video_media_metadata": {
        "duration": "1800.080000",
        "height": 1080,
        "width": 1920
      },
      "video_preview_metadata": { "bitrate": "807582", "duration": "1800.080000", "height": 1080, "width": 1920, "audio_format": "aac", "frame_rate": "25/1", "template_list": [{ "status": "finished", "template_id": "HD" }] },
      "compilation_id": "9600002_61ec000000009a6068fe4c67936d781b6c2fced2",
      "grand_parent_file_id": null
    }
  ],
  "next_marker": ""
}
//警告：无用的next_marker
```


#### 播放-更新播放进度

POST: `https://api.aliyundrive.com/adrive/v2/video/update`

```json
{"drive_id":"9600002","duration":"616.235","file_extension":"mp4","file_id":"623b00000000d89ef21d4118838aed83de7575ba","name":"样本.mp4","play_cursor":"148.298","thumbnail":"https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F..."}
```

Response:

```json
file
```