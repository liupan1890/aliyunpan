#### 文件夹大小

POST: `https://api.aliyundrive.com/adrive/v1/file/get_folder_size_info`

```json
{ "drive_id": "9600002", "file_id": "623b00000000d89ef21d4118838aed83de7575ba" }
```

Response:

```json
{ "size": 67200, "folder_count": 0, "file_count": 600, "reach_limit": true }
```

#### 批量读取文件夹封面

POST: `https://api.aliyundrive.com/adrive/v1/file/cover/batchGet`

```json
{ "drive_id": "9600002", "file_ids": ["623b00000000d89ef21d4118838aed83de7575ba", "6061000000001af7c3034e3590ea7d5a50f58015"] }
```

Response:

```json
{
  "items": [
    {
      "folder_file_id": "623b00000000d89ef21d4118838aed83de7575ba",
      "cover_file_id": "6061000000001af7c3034e3590ea7d5a50f58015",
      "cover_file_thumbnail": "https://bj29.cn-beijing.data.alicloudccp.com/RV5OBihM%2F...",
      "cover_file_name": "反贪5.mp4",
      "cover_file_category": "video"
    },
    { "folder_file_id": "623b00000000d89ef21d4118838aed83de7575ba", "cover_file_id": "6061000000001af7c3034e3590ea7d5a50f58015", "cover_file_name": "bbbc", "cover_file_category": "others" }
  ]
}
```

#### 读取文件夹封面

POST: `https://api.aliyundrive.com/adrive/v1/file/cover/get`

```json
{ "drive_id": "9600002", "file_id": "623b00000000d89ef21d4118838aed83de7575ba" }
```

Response:

```json
{
  "folder_file_id": "623b00000000d89ef21d4118838aed83de7575ba",
  "cover_file_id": "6061000000001af7c3034e3590ea7d5a50f58015",
  "cover_file_thumbnail": "https://bj29.cn-beijing.data.alicloudccp.com/RV5OBihM%2F...",
  "cover_file_name": "firmware.3911(1).dat",
  "cover_file_category": "video"
}
```

#### 设置-读取开启文件夹封面

POST: `https://api.aliyundrive.com/adrive/v1/file/cover/config/get`

```json
{}
```

Response:

```json
{"enable":true}
```

#### 设置-保存开启文件夹封面

POST: `https://api.aliyundrive.com/adrive/v1/file/cover/config/set`

```json
{"enable":true}
```

Response:

```text
HTTP/1.1 200 OK
```
