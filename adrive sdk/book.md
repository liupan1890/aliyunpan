#### 列出图书

POST: `https://api.aliyundrive.com/adrive/v2/book/list`

```json
{ "book_progress_type": "ALL", "limit": 1, "marker": "", "order_by": "name asc", "show_hidden": false }
```

Response:

```json
{
  "items": [
    {
      "category": "doc",
      "content_hash": "4DBF0000000023E6E756C29AF6AC487217921D53",
      "content_hash_name": "sha1",
      "content_type": "application/oct-stream",
      "crc64_hash": "1548000000008183211",
      "created_at": "2021-11-22T03:36:19.680Z",
      "domain_id": "bj29",
      "download_url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "drive_id": "9600002",
      "encrypt_mode": "none",
      "file_extension": "epub",
      "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
      "hidden": false,
      "name": "Republic.epub",
      "parent_file_id": "613800000000336ae9164455b135a9729a298c9c",
      "punish_flag": 0,
      "size": 128000,
      "starred": false,
      "status": "available",
      "type": "file",
      "updated_at": "2022-01-12T12:44:16.835Z",
      "upload_id": "ED12000000004724833D47B5D5D3C8B9",
      "url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "user_meta": "{\"client\":\"web\"}",
      "user_tags": { "book_show": "true" }
    }
  ],
  "next_marker": ""
}
```

#### 列出最近阅读的图书

POST: `https://api.aliyundrive.com/adrive/v2/book/recentList`

```json
{ "book_progress_type": "ALL", "limit": 1, "marker": "", "order_by": "name asc", "show_hidden": false }
```

Response:

```json
{
  "items": [
    {
      "category": "doc",
      "content_hash": "4DBF0000000023E6E756C29AF6AC487217921D53",
      "content_hash_name": "sha1",
      "content_type": "application/oct-stream",
      "crc64_hash": "1548000000008183211",
      "created_at": "2021-09-24T12:50:00.905Z",
      "domain_id": "bj29",
      "download_url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "drive_id": "9600002",
      "encrypt_mode": "none",
      "file_extension": "epub",
      "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
      "hidden": false,
      "name": "无声告白.epub",
      "parent_file_id": "613800000000336ae9164455b135a9729a298c9c",
      "punish_flag": 0,
      "size": 1027423,
      "starred": false,
      "status": "available",
      "type": "file",
      "updated_at": "2022-03-22T14:59:12.333Z",
      "url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "book_progress": "{\"bookName\":\"无声告白\",\"chapterNumber\":1,\"chapterPercent\":0.0,\"currentPageNumber\":-1,\"progress\":29,\"totalPageNumber\":-1,\"uid\":\"9400000000bc480bbcbbb1e074f55a7f\",\"updateTime\":1647961151874}",
      "user_tags": {
        "book_progress": "{\"bookName\":\"无声告白\",\"chapterNumber\":1,\"chapterPercent\":0.0,\"currentPageNumber\":-1,\"progress\":29,\"totalPageNumber\":-1,\"uid\":\"9400000000bc480bbcbbb1e074f55a7f\",\"updateTime\":1647961151874}",
        "book_progress_percentage": "35",
        "book_show": "true",
        "epub_book_progress": "{\"uid\":\"9400000000bc480bbcbbb1e074f55a7f\",\"href\":\"\\/text\\/part0000.html\",\"type\":\"application\\/xhtml+xml\",\"locations\":{\"progression\":0,\"position\":2,\"totalProgression\":8.873114463176575E-4}}",
        "start_read": "true"
      },
      "book_name": "无声告白",
      "book_progress_percentage": 29
    }
  ]
}
```

#### 添加到阅读室

POST: `https://api.aliyundrive.com/adrive/v2/book/update`

```json
{ "file_ids": ["623b00000000d89ef21d4118838aed83de7575ba"], "operation": 1 }
```

Response:

```text
HTTP/1.1 200 OK
```

#### 从阅读室移除

POST: `https://api.aliyundrive.com/adrive/v2/book/update`

```json
{ "file_ids": ["623b00000000d89ef21d4118838aed83de7575ba"], "operation": 2 }
```

Response:

```text
HTTP/1.1 200 OK
```
