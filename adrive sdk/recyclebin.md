#### 列出回收站

POST: `https://api.aliyundrive.com/v2/recyclebin/list`

```json
{ "fields": "*", "all": false, "drive_id": "9600002", "limit": 50 }
```

Response:

```json
{
  "items": [
    {
      "drive_id": "9600002",
      "domain_id": "bj29",
      "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
      "name": "[1.3.1].mp4",
      "type": "file",
      "content_type": "application/oct-stream",
      "created_at": "2022-01-19T04:51:12.832Z",
      "updated_at": "2022-03-10T03:10:04.074Z",
      "trashed_at": "2022-03-10T03:10:04.074Z",
      "file_extension": "mp4",
      "mime_type": "application/octet-stream",
      "mime_extension": "unknown",
      "hidden": false,
      "size": 94814980,
      "starred": false,
      "status": "available",
      "labels": ["艺术品"],
      "parent_file_id": "613800000000336ae9164455b135a9729a298c9c",
      "crc64_hash": "1548000000008183211",
      "content_hash": "4DBF0000000023E6E756C29AF6AC487217921D53",
      "content_hash_name": "sha1",
      "url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "thumbnail": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "category": "video",
      "encrypt_mode": "none",
      "video_media_metadata": {
        "width": 1280,
        "height": 720,
        "video_media_video_stream": [{ "duration": "1530.680000", "clarity": "720", "fps": "25/1", "code_name": "h264" }],
        "video_media_audio_stream": [{ "duration": "1530.581333", "channels": 2, "channel_layout": "stereo", "bit_rate": "143625", "code_name": "aac", "sample_rate": "48000" }],
        "duration": "1530.701333"
      },
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
  "next_marker": ""
}
```

#### 恢复文件

POST: `https://api.aliyundrive.com/v2/recyclebin/restore`

```json
{ "file_id": "623b00000000d89ef21d4118838aed83de7575ba", "drive_id": "9600002" }
```

Response:

```text
HTTP/1.1 204 No Content
```

#### 删除文件(放入回收站)

POST: `https://api.aliyundrive.com/v2/recyclebin/trash`

```json
{ "drive_id": "9600002", "file_id": "623b00000000d89ef21d4118838aed83de7575ba" }
```

Response:

```text
HTTP/1.1 204 No Content
```

#### 删除文件(从回收站彻底删除)

POST: `https://api.aliyundrive.com/v3/file/delete`

```json
{ "permanently": true, "file_id": "623b00000000d89ef21d4118838aed83de7575ba", "drive_id": "9600002" }
```

Response:

```text
HTTP/1.1 204 No Content
```

#### 清空回收站

POST: `https://api.aliyundrive.com/v2/recyclebin/clear`

```json
{ "drive_id": "9600002" }
```

Response:

```json
{ "domain_id": "bj29", "drive_id": "9600002", "task_id": "e026000000007f609bcd6aa71b8fde94" }
```
