#### 探索-列出图片分类最多的前几个分类

POST: `https://api.aliyundrive.com/v2/aims/list_hints`

```json
{ "user_id": "9400000000bc480bbcbbb1e074f55a7f", "limit": 5 }
```

Response:

```json
["白色", "鞋", "服装", "颜色", "黑色"]
```

#### 探索-列出图片分类(对应的是 label)

POST: `https://api.aliyundrive.com/v2/aims/list_tags`

```json
{ "all": false, "image_thumbnail_process": "image/resize,m_lfit,w_256,limit_0/format,jpg", "video_thumbnail_process": "video/snapshot,t_7000,f_jpg,w_800,h_600,ar_auto,m_fast", "drive_id": "9600002" }
```

Response:

```json
{
  "tags": [
    {
      "count": 22,
      "cover_file_category": "",
      "cover_file_id": "6061000000001af7c3034e3590ea7d5a50f58015",
      "cover_overall_score": 0.7444725632667542,
      "cover_tag_confidence": 0.9806441068649292,
      "cover_url": "https://ccp-bj29-bj-1592982087.oss-cn-beijing.aliyuncs.com/HCBUxQOF%2F...",
      "name": "截图"
    },
    {
      "count": 6,
      "cover_file_category": "",
      "cover_file_id": "6061000000001af7c3034e3590ea7d5a50f58015",
      "cover_overall_score": 0.660460352897644,
      "cover_tag_confidence": 0.8765541911125183,
      "cover_url": "https://ccp-bj29-bj-1592982087.oss-cn-beijing.aliyuncs.com/HCBUxQOF%2F...",
      "name": "健身"
    }
  ]
}
```

#### 探索-列出一个分类(label)的全部图片

POST: `https://api.aliyundrive.com/v2/file/search`

```json
{
  "return_total_count": true,
  "image_thumbnail_process": "image/resize,m_lfit,w_256,limit_0/format,jpg",
  "order_by": "last_access_at DESC,updated_at DESC,image_time DESC",
  "query": "(label = '截图') and category in ['video','image']  and status = 'available' and hidden = false",
  "limit": 100,
  "drive_id": "9600002"
}
```

Response:

```json
filelist
```

#### 探索-列出全部回忆

POST: `https://api.aliyundrive.com/v2/aims/list_stories`

```json
{ "drive_id": "9600002", "skip_stories_creation": false, "cover_image_thumbnail_process": "image/resize,m_lfit,w_800/format,jpg" }
```

Response:

```json
{
  "items": [
    {
      "cover_file_id": "6061000000001af7c3034e3590ea7d5a50f58015",
      "cover_file_thumbnail_url": "https://ccp-bj29-bj-1592982087.oss-cn-beijing.aliyuncs.com/aUDpMBAO%2F...",
      "created_at": "2022-03-13T21:31:47.210563978+08:00",
      "face_group_ids": ["Group-00000000-1703-4fc8-4f56-369478ed14df"],
      "story_end_time": "",
      "story_file_list": [
        { "file_id": "623b00000000d89ef21d4118838aed83de7575ba" },
        { "file_id": "623b00000000d89ef21d4118838aed83de7575ba" }       
      ],
      "story_id": "903C5705-0000-0000-4fc8-42B97E29C65C",
      "story_name": "熟悉的TA",
      "story_start_time": "",
      "story_sub_type": "ImportantPerson",
      "story_type": "ImportantPerson",
      "updated_at": "2022-03-13T21:31:47.21056415+08:00",
      "cover_file": {
        "category": "image",
        "content_hash": "4DBF0000000023E6E756C29AF6AC487217921D53",
        "content_hash_name": "sha1",
        "content_type": "application/oct-stream",
        "crc64_hash": "1548000000008183211",
        "created_at": "2021-09-08T13:45:59.755Z",
        "domain_id": "bj29",
        "download_url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
        "drive_id": "9600002",
        "encrypt_mode": "none",
        "file_extension": "jpg",
        "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
        "hidden": false,
        "image_media_metadata": {
          "faces": "[{\"FaceConfidence\":0.9646940231323242,\"EmotionConfidence\":0.974002480506897,\"ImageUri\":\"\",\"FaceQuality\":0.8240875005722046,\"Similarity\":0,\"ExternalId\":\"\",\"Attractive\":0.95,\"AttractiveConfidence\":0,\"Age\":19,\"AgeConfidence\":0,\"Gender\":\"FEMALE\",\"Emotion\":\"SAD\",\"GenderConfidence\":1,\"FaceId\":\"45f700000000ac19ffbf56adcaa98e3944f28c087cd36b9bc1acde5ae5829fa3\",\"GroupId\":\"Group-00000000-1703-4fc8-5f56-369478ed14df\",\"FaceAttributes\":{\"Glasses\":\"NONE\",\"MaskConfidence\":0.9999961853027344,\"Mask\":\"NONE\",\"GlassesConfidence\":1,\"Beard\":\"NONE\",\"BeardConfidence\":1,\"FaceBoundary\":{\"Width\":558,\"Height\":787,\"Top\":318,\"Left\":1075},\"HeadPose\":{\"Pitch\":8.109945297241211,\"Roll\":-11.779093742370605,\"Yaw\":-12.086345672607422}},\"EmotionDetails\":{\"SURPRISED\":0.0010840623872354627,\"HAPPY\":0.0072783417999744415,\"ANGRY\":0.00025470455875620246,\"DISGUSTED\":0.0018990141106769443,\"SAD\":0.974002480506897,\"CALM\":0.005655393470078707,\"SCARED\":0.006041224580258131},\"SimilarFaces\":null}]",
          "faces_thumbnail": [
            {
              "face_group_id": "Group-00000000-1703-4fc8-5f56-369478ed14df",
              "face_id": "45f700000000ac19ffbf56adcaa98e3944f28c087cd36b9bc1acde5ae5829fa3",
              "face_thumbnail": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F..."
            }
          ],
          "height": 3600,
          "image_quality": { "overall_score": 0.639841616153717 },
          "time": "2022-03-13T21:31:47.210563978+08:00",
          "width": 2400
        },
        "labels": ["面部", "日常行为"],
        "mime_extension": "jpg",
        "mime_type": "image/jpeg",
        "name": "44.jpg",
        "parent_file_id": "613800000000336ae9164455b135a9729a298c9c",
        "punish_flag": 2,
        "revision_id": "6138000000000b81a8164550b1e7cba1d7fbe111",
        "size": 1974176,
        "starred": false,
        "status": "available",
        "thumbnail": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
        "trashed": false,
        "type": "file",
        "updated_at": "2021-09-08T13:46:01.896Z",
        "url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F..."
      }
    }
  ]
}
```

#### 探索-读取一个回忆的信息(名称、人物、图片)

POST: `https://api.aliyundrive.com/v2/aims/get_story`

```json
{ "drive_id": "9600002", "story_id": "903C5705-0000-0000-4fc8-42B97E29C65C" }
```

Response:

```json
{
  "cover_file_id": "6061000000001af7c3034e3590ea7d5a50f58015",
  "cover_file_thumbnail_url": "https://bj29.cn-beijing.data.alicloudccp.com/RV5OBihM%2F...",
  "created_at": "2022-03-13T21:31:47.210563978+08:00",
  "face_group_ids": ["Group-00000000-1763-4fc8-bf56-369478ed14df"],
  "story_end_time": "",
  "story_file_list": [
    {
      "category": "image",
      "content_hash": "4DBF0000000023E6E756C29AF6AC487217921D53",
      "content_hash_name": "sha1",
      "content_type": "application/oct-stream",
      "crc64_hash": "1548000000008183211",
      "created_at": "2021-09-08T13:45:59.755Z",
      "domain_id": "bj29",
      "download_url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "drive_id": "9600002",
      "encrypt_mode": "none",
      "file_extension": "jpg",
      "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
      "hidden": false,
      "image_media_metadata": {
        "faces": "[{\"FaceConfidence\":0.9646940231323242,\"EmotionConfidence\":0.974002480506897,\"ImageUri\":\"\",\"FaceQuality\":0.8240875005722046,\"Similarity\":0,\"ExternalId\":\"\",\"Attractive\":0.95,\"AttractiveConfidence\":0,\"Age\":19,\"AgeConfidence\":0,\"Gender\":\"FEMALE\",\"Emotion\":\"SAD\",\"GenderConfidence\":1,\"FaceId\":\"45f700000000ac19ffbf56adcaa98e3944f28c087cd36b9bc1acde5ae5829fa3\",\"GroupId\":\"Group-00000000-1703-4fc6-bf56-369478ed14df\",\"FaceAttributes\":{\"Glasses\":\"NONE\",\"MaskConfidence\":0.9999961853027344,\"Mask\":\"NONE\",\"GlassesConfidence\":1,\"Beard\":\"NONE\",\"BeardConfidence\":1,\"FaceBoundary\":{\"Width\":558,\"Height\":787,\"Top\":318,\"Left\":1075},\"HeadPose\":{\"Pitch\":8.109945297241211,\"Roll\":-11.779093742370605,\"Yaw\":-12.086345672607422}},\"EmotionDetails\":{\"SURPRISED\":0.0010840623872354627,\"HAPPY\":0.0072783417999744415,\"ANGRY\":0.00025470455875620246,\"DISGUSTED\":0.0018990141106769443,\"SAD\":0.974002480506897,\"CALM\":0.005655393470078707,\"SCARED\":0.006041224580258131},\"SimilarFaces\":null}]",
        "faces_thumbnail": [
          {
            "face_group_id": "Group-00000000-1703-4fc8-bf56-369478ed14df",
            "face_id": "45f700000000ac19ffbf56adcaa98e3944f28c087cd36b9bc1acde5ae5829fa3",
            "face_thumbnail": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F..."
          }
        ],
        "height": 3600,
        "image_quality": { "overall_score": 0.639841616153717 },        
        "width": 2400
      },
      "labels": [
        "面部",
        "日常行为"
      ],
      "name": "44.jpg",
      "parent_file_id": "613800000000336ae9164455b135a9729a298c9c",
      "size": 1974176,
      "starred": false,
      "status": "available",
      "thumbnail": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "type": "file",
      "updated_at": "2021-09-08T13:46:01.896Z",
      "url": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F..."
    }
  ],
  "story_id": "903C5705-0000-0000-4fc8-42B97E29C65C",
  "story_name": "fang的高光时刻",
  "story_start_time": "",
  "story_sub_type": "ImportantPerson",
  "story_type": "ImportantPerson",
  "updated_at": "2022-03-13T21:31:47.21056415+08:00"
}
```

#### 清理空间-统计数量

POST: `https://api.aliyundrive.com/v2/aims/clutter_removal/count`

```json
{ "drive_id": "9600002" }
```

Response:

```json
{ "screenshot": 20, "text": 26 }
```

#### 清理空间-清理屏幕截图

POST: `https://api.aliyundrive.com/v2/aims/clutter_removal/list`

```json
{ "type": "screenshot", "drive_id": "9600002" }
```

Response:

```json
filelist
```

#### 清理空间-清理文本图片

POST: `https://api.aliyundrive.com/v2/aims/clutter_removal/list`

```json
{ "type": "text", "drive_id": "9600002" }
```

Response:

```json
filelist
```
