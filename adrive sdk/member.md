#### 列出已订阅

POST: `https://api.aliyundrive.com/adrive/v1/member/list_following`

```json
{ "limit": 50, "order_by": "updated_at", "order_direction": "DESC" }
```

Response:

```json
{
  "items": [
    {
      "description": "中国国家地理景观官方账号，带你领略目酣神醉的壮美景观、发现中国各地独具特色的人文胜迹。",
      "avatar": "https://ccp-bj29-bj-1592982087.oss-cn-beijing.aliyuncs.com/2GhCur3G%2F...",
      "user_id": "9400000000bc480bbcbbb1e074f55a7f",
      "nick_name": "中国国家地理景观",
      "phone": "136***902",
      "is_following": true,
      "has_unread_message": true,
      "latest_messages": [
        {
          "creator": {
            "description": "中国国家地理景观官方账号，带你领略目酣神醉的壮美景观、发现中国各地独具特色的人文胜迹。",
            "avatar": "https://ccp-bj29-bj-1592982087.oss-cn-beijing.aliyuncs.com/2GhCur3G%2F...",
            "user_id": "9400000000bc480bbcbbb1e074f55a7f",
            "nick_name": "中国国家地理景观",
            "phone": "136***902"
          },
          "action": "sharelink.create",
          "content": {
            "share": {
              "popularity": 6019,
              "share_id": "6RRP4gDWwzE",
              "share_msg": "「广东100个最美观景拍摄点-...拍摄季节：四季）.jpg」，点击链接保存，或者复制本段内容，打开「阿里云盘」APP ，无需下载极速在线查看，视频原画倍速播放。",
              "share_name": "广东100个最美观景拍摄点-...拍摄季节：四季）.jpg",
              "description": "",
              "expiration": "",
              "expired": false,
              "share_pwd": "",
              "share_url": "https://www.aliyundrive.com/s/6RRP4gDWwzE",
              "creator": "01d1ea604d644cfb83ac7e9be530db8e",
              "drive_id": "347756450",
              "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
              "file_id_list": ["6228000000002c31be704ca28671f09712894f4f"],
              "preview_count": 2139,
              "save_count": 802,
              "download_count": 27,
              "status": "enabled",
              "created_at": "2022-03-20T13:55:42.630Z",
              "updated_at": "2022-03-21T08:04:11.464Z",
              "first_file": {
                "trashed": false,
                "category": "image",
                "content_hash": "4DBF0000000023E6E756C29AF6AC487217921D53",
                "content_hash_name": "sha1",
                "content_type": "application/oct-stream",
                "crc64_hash": "1548000000008183211",
                "created_at": "2022-02-28T09:09:54.329Z",
                "domain_id": "bj29",
                "download_url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
                "drive_id": "347756450",
                "encrypt_mode": "none",
                "file_extension": "jpg",
                "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
                "hidden": false,
                "image_media_metadata": {
                  "height": 1464,
                  "image_quality": { "overall_score": 0.6488162279129028 },

                  "width": 2500
                },
                "labels": ["旅游&地理", "体育运动", "植物", "徒步", "自然景观", "植被", "高地", "山脊", "山峰", "丘陵", "山", "云", "山中避暑地", "山脉", "雾", "天空", "荒野", "雾景", "森林"],
                "mime_type": "image/jpeg",
                "name": "广东100个最美观景拍摄点-油岭瑶寨（最佳拍摄季节：四季）.jpg",
                "parent_file_id": "613800000000336ae9164455b135a9729a298c9c",
                "punish_flag": 0,
                "size": 3829229,
                "starred": false,
                "status": "available",
                "thumbnail": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
                "type": "file",
                "updated_at": "2022-02-28T09:09:57.283Z",
                "upload_id": "ED12000000004724833D47B5D5D3C8B9",
                "url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
                "user_meta": "{\"client\":\"desktop\"}"
              },
              "allow_subscribe": false,
              "current_sync_status": 3,
              "popularity_str": "6K",
              "popularity_emoji": "\uD83D\uDD25",
              "full_share_msg": "「广东100个最美观景拍摄点-...拍摄季节：四季）.jpg」https://www.aliyundrive.com/s/6RRP4gDWwzE\n点击链接保存，或者复制本段内容，打开「阿里云盘」APP ，无需下载极速在线查看，视频原画倍速播放。",
              "display_name": "广东100个最美观景拍摄点-油岭瑶寨（最佳拍摄季节：四季）.jpg"
            },
            "share_id": "6RRP4gDWwzE",
            "drive_id": "347756450",
            "file_id_list": ["6228000000002c31be704ca28671f09712894f4f"],
            "file_list": [
              {
                "category": "image",
                "created_at": "2022-02-28T09:09:54.329Z",
                "domain_id": "bj29",
                "drive_id": "347756450",
                "file_extension": "jpg",
                "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
                "image_media_metadata": { "height": 1464, "width": 2500 },
                "mime_type": "image/jpeg",
                "name": "广东100个最美观景拍摄点-油岭瑶寨（最佳拍摄季节：四季）.jpg",
                "parent_file_id": "root",
                "punish_flag": 0,
                "share_id": "6RRP4gDWwzE",
                "size": 3829229,
                "thumbnail": "https://pdsapi.aliyundrive.com/v2/redirect?id=5c2b8c638c27409f8516c5fce2c320bc",
                "type": "file",
                "updated_at": "2022-02-28T09:09:57.283Z"
              }
            ]
          },
          "created": 1647784542657,
          "creator_id": "01d1ea604d644cfb83ac7e9be530db8e",
          "sequence_id": 1647784542661000,
          "display_action": "分享了 广东100个最美观景拍摄点-油岭瑶寨（最佳拍摄季节：四季）.jpg"
        }
      ]
    }
  ],
  "total_count": 2
}
```

#### 标记已读（订阅的一个用户有动态）

POST: `https://api.aliyundrive.com/adrive/v1/member/mark_read`

```json
{ "user_id": "9400000000bc480bbcbbb1e074f55a7f" }
```

Response:

```json
{}
```

#### 取消订阅

POST: `https://api.aliyundrive.com/adrive/v1/member/unfollow_user`

```json
{ "user_id": "9400000000bc480bbcbbb1e074f55a7f" }
```

Response:

```json
{}
```

#### 增加订阅

POST: `https://api.aliyundrive.com/adrive/v1/member/follow_user`

```json
{ "user_id": "9400000000bc480bbcbbb1e074f55a7f" }
```

Response:

```json
{}
```
