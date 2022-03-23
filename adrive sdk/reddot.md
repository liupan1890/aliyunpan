#### 订阅的账号有更新

POST: `https://api.aliyundrive.com/adrive/v1/reddot/get`

```json
{}
```

Response:

```json
{
  "items": [
    {
      "code": "followed_user_has_new_activity",
      "context": {
        "creator": {
          "description": "中国国家地理景观官方账号，带你领略目酣神醉的壮美景观、发现中国各地独具特色的人文胜迹。",
          "avatar": "https://ccp-bj29-bj-1592982087.oss-cn-beijing.aliyuncs.com/2GhCur3G%2F...",
          "user_id": "9400000000bc480bbcbbb1e074f55a7f",
          "nick_name": "中国国家地理景观",
          "phone": "136***902"
        }
      }
    }
  ]
}
```

#### 标记已读

POST: `https://api.aliyundrive.com/adrive/v1/reddot/read`

```json
{"code":"followed_user_has_new_activity"}
```

Response:

```json
{}
```



