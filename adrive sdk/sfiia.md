#### 文件中的图片

POST: `https://api.aliyundrive.com/adrive/v1/sfiia/get_recommends`

```json
{ "drive_id": "9600002" }
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
      "created_at": "2021-10-16T02:10:51.625Z",
      "domain_id": "bj29",
      "download_url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "drive_id": "9600002",
      "encrypt_mode": "none",
      "file_extension": "png",
      "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
      "hidden": false,     
      "labels": ["衣服", "外貌特征", "其他事物", "艺术品", "笑脸", "墨镜", "护目镜", "微笑", "颜色", "动画", "黄色"],
      "mime_type": "image/png",
      "name": "cool_11.png",
      "parent_file_id": "613800000000336ae9164455b135a9729a298c9c",
      "punish_flag": 0,
      "size": 80480,
      "starred": false,
      "status": "available",
      "thumbnail": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "type": "file",
      "updated_at": "2021-10-16T02:10:51.625Z",
      "upload_id": "ED12000000004724833D47B5D5D3C8B9",
      "url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F..."
    }
  ],
  "total_image_count": 28943
}
```
