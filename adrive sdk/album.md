#### 创建相册

POST: `https://api.aliyundrive.com/adrive/v1/album/create`

```json
{ "name": "未命名", "description": "" }
```

Response:

```json
{
  "owner": "ccff000000004d75b5788a481eed8386",
  "name": "未命名",
  "description": "",
  "album_id": "cfe400000000478599575b69356c5a4962383669",
  "file_count": 0,
  "image_count": 0,
  "video_count": 0,
  "created_at": 1647851113891,
  "updated_at": 1647851113891
}
```

#### 修改相册

POST: `https://api.aliyundrive.com/adrive/v1/album/update`

```json
{ "album_id": "cfe400000000478599575b69356c5a4962383669", "description": "ff", "name": "未命名" }
```

Response:

```json
{
  "owner": "ccff000000004d75b5788a481eed8386",
  "name": "未命名",
  "description": "",
  "album_id": "cfe400000000478599575b69356c5a4962383669",
  "file_count": 0,
  "image_count": 0,
  "video_count": 0,
  "created_at": 1647851113891,
  "updated_at": 1647851113891
}
```

#### 删除相册(不会删除相册内文件)

POST: `https://api.aliyundrive.com/adrive/v1/album/delete`

```json
{ "album_id": "cfe400000000478599575b69356c5a4962383669" }
```

Response:

```json
{}
```

#### 读取相册

POST: `https://api.aliyundrive.com/adrive/v1/album/get`

```json
{ "album_id": "cfe400000000478599575b69356c5a4962383669" }
```

Response:

```json
{
  "owner": "ccff000000004d75b5788a481eed8386",
  "name": "未命名",
  "description": "",
  "cover": {
    "list": [
      {
        "trashed": false,
        "category": "image",
        "content_hash": "4DBF0000000023E6E756C29AF6AC487217921D53",
        "content_hash_name": "sha1",
        "content_type": "application/oct-stream",
        "crc64_hash": "1548000000008183211",
        "created_at": "2022-03-21T08:27:15.671Z",
        "domain_id": "bj29",
        "download_url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
        "drive_id": "9600002",
        "encrypt_mode": "none",
        "file_extension": "jpeg",
        "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
        "hidden": false,
        "image_media_metadata": { "image_quality": {} },
        "mime_type": "image/jpeg",
        "name": "fa9cb4682043bb141b48dd82.jpeg",
        "parent_file_id": "root",
        "punish_flag": 0,
        "size": 586988,
        "starred": false,
        "status": "available",
        "thumbnail": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
        "type": "file",
        "updated_at": "2022-03-21T08:27:16.226Z",
        "upload_id": "ED12000000004724833D47B5D5D3C8B9",
        "url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
        "ex_fields_info": {}
      }
    ]
  },
  "album_id": "cfe400000000478599575b69356c5a4962383669",
  "file_count": 1,
  "image_count": 1,
  "video_count": 0,
  "created_at": 1647851113891,
  "updated_at": 1647851236638
}
```

#### 添加文件到相册

POST: `https://api.aliyundrive.com/adrive/v1/album/add_files`

```json
{ "album_id": "cfe400000000478599575b69356c5a4962383669", "drive_file_list": [{ "drive_id": "9600002", "file_id": "623b00000000d89ef21d4118838aed83de7575ba" }] }
```

Response:

```json
{
  "file_list": [
    {
      "trashed": false,
      "category": "image",
      "content_hash": "4DBF0000000023E6E756C29AF6AC487217921D53",
      "content_hash_name": "sha1",
      "content_type": "application/oct-stream",
      "crc64_hash": "1548000000008183211",
      "created_at": "2022-03-21T08:27:15.671Z",
      "domain_id": "bj29",
      "download_url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "drive_id": "9600002",
      "encrypt_mode": "none",
      "file_extension": "jpeg",
      "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
      "hidden": false,
      "image_media_metadata": { "image_quality": {} },
      "mime_type": "image/jpeg",
      "name": "fa9cb4682043bb141b48dd82.jpeg",
      "parent_file_id": "root",
      "punish_flag": 0,
      "size": 586988,
      "starred": false,
      "status": "available",
      "thumbnail": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "type": "file",
      "updated_at": "2022-03-21T08:27:16.226Z",
      "upload_id": "ED12000000004724833D47B5D5D3C8B9",
      "url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "ex_fields_info": {}
    }
  ]
}
```

#### 从相册移除文件

POST: `https://api.aliyundrive.com/adrive/v1/album/delete_files`

```json
{ "album_id": "cfe400000000478599575b69356c5a4962383669", "drive_file_list": [{ "drive_id": "9600002", "file_id": "623b00000000d89ef21d4118838aed83de7575ba" }] }
```

Response:

```json
{}
```

#### 列出相册内文件

POST: `https://api.aliyundrive.com/adrive/v1/album/list_files`

```json
{
  "album_id": "cfe400000000478599575b69356c5a4962383669",
  "image_thumbnail_process": "image/resize,w_400/format,jpeg",
  "video_thumbnail_process": "video/snapshot,t_0,f_jpg,ar_auto,w_1000",
  "image_url_process": "image/resize,w_1920/format,jpeg",
  "filter": "",
  "fields": "*",
  "limit": 100,
  "order_by": "file_image_time",
  "order_direction": "DESC"
}
```

Response:

```json
{
  "items": [
    {
      "category": "image",
      "content_hash": "4DBF0000000023E6E756C29AF6AC487217921D53",
      "content_hash_name": "sha1",
      "content_type": "application/oct-stream",
      "crc64_hash": "1548000000008183211",
      "created_at": "2022-03-21T08:27:15.671Z",
      "domain_id": "bj29",
      "download_url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "drive_id": "9600002",
      "encrypt_mode": "none",
      "file_extension": "jpeg",
      "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
      "hidden": false,
      "image_media_metadata": { "image_quality": {} },
      "name": "fa9cb4682043bb141b48dd82.jpeg",
      "parent_file_id": "root",
      "size": 586988,
      "starred": false,
      "status": "available",
      "thumbnail": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "type": "file",
      "updated_at": "2022-03-21T08:27:16.226Z",
      "upload_id": "ED12000000004724833D47B5D5D3C8B9",
      "url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F..."
    }
  ]
}
```

#### 上传文件到相册

POST: `https://api.aliyundrive.com/adrive/v1/biz/albums/file/create`

```json
{
  "drive_id": "9600002",
  "part_info_list": [{ "part_number": 1 }],
  "parent_file_id": "root",
  "name": "fa9cb4682043bb141b48dd82.jpeg",
  "type": "file",
  "check_name_mode": "auto_rename",
  "size": 586988,
  "content_hash": "4DBF0000000023E6E756C29AF6AC487217921D53",
  "content_hash_name": "sha1",
  "proof_code": "TIo2j2wSMV4=",
  "proof_version": "v1"
}
```

Response:

```json
{
  "type": "file",
  "parent_file_id": "root",
  "drive_id": "9600002",
  "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
  "domain_id": "bj29",
  "trashed_at": null,
  "file_name": "fa9cb4682043bb141b48dd82.jpeg",
  "upload_id": "ED12000000004724833D47B5D5D3C8B9",
  "encrypt_mode": "none",
  "location": "cn-beijing",
  "rapid_upload": false,
  "part_info_list": [
    {
      "part_number": 1,
      "upload_url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "internal_upload_url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "content_type": ""
    }
  ]
}
```
