#### 探索-人物列表

POST: `https://api.aliyundrive.com/v2/image/list_facegroups`

```json
{ "drive_id": "9600002", "limit": 100 }
```

Response:

```json
{
  "items": [
    {
      "group_id": "Group-00000000-1703-4fc0-bf56-369478ed14df",
      "group_name": " ",
      "image_count": 15,
      "created_at": "2021-09-08T21:46:02.413048705+08:00",
      "updated_at": "2021-11-08T13:58:11.452257679+08:00",
      "group_cover_url": "https://ccp-bj29-bj-1592982087.oss-cn-beijing.aliyuncs.com/nIaV4oIe%2F...",
      "group_cover_file_id": "613800000000c99442f44b99b93b3bdd40e21836",
      "group_cover_face_boundary": { "Width": 445, "Height": 532, "Top": 328, "Left": 650 }
    }
  ],
  "next_marker": ""
}
```

#### 探索-人物照片列表

POST: `https://api.aliyundrive.com/v2/file/search`

```json
{
  "drive_id": "9600002",
  "limit": 100,
  "order_by": "created_at DESC",
  "query": "type = 'file' and category in ['image', 'video'] and face_group_id = 'Group-00000000-1703-4fc0-bf56-369478ed14df' and status = 'available' and hidden = false",
  "return_total_count": true
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
      "name": "43.jpg",
      "type": "file",
      "content_type": "application/oct-stream",
      "created_at": "2021-09-08T13:46:00.764Z",
      "updated_at": "2021-09-08T13:46:02.889Z",
      "file_extension": "jpg",
      "mime_type": "image/jpeg",
      "mime_extension": "jpg",
      "hidden": false,
      "size": 2178603,
      "starred": false,
      "status": "available",
      "labels": ["日常行为", "职业&角色"],
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
        "width": 2400,
        "height": 3600,
        "faces": "[{\"FaceConfidence\":0.9466279149055481,\"EmotionConfidence\":0.9990111589431763,\"ImageUri\":\"\",\"FaceQuality\":0.7725782990455627,\"Similarity\":0,\"ExternalId\":\"\",\"Attractive\":0.93,\"AttractiveConfidence\":0,\"Age\":23,\"AgeConfidence\":0,\"Gender\":\"FEMALE\",\"Emotion\":\"HAPPY\",\"GenderConfidence\":1,\"FaceId\":\"45f700000000ac19ffbf56adcaa98e3944f28c087cd36b9bc1acde5ae5829fa3\",\"GroupId\":\"Group-00000000-1703-4fc0-bf56-369478ed14df\",\"FaceAttributes\":{\"Glasses\":\"NONE\",\"MaskConfidence\":1,\"Mask\":\"NONE\",\"GlassesConfidence\":1,\"Beard\":\"NONE\",\"BeardConfidence\":1,\"FaceBoundary\":{\"Width\":445,\"Height\":532,\"Top\":328,\"Left\":650},\"HeadPose\":{\"Pitch\":18.937170028686523,\"Roll\":30.32413101196289,\"Yaw\":9.59316635131836}},\"EmotionDetails\":{\"SURPRISED\":0.0000041519870137562975,\"HAPPY\":0.9990111589431763,\"ANGRY\":0.0000027373464490665356,\"DISGUSTED\":0.000007709058991167694,\"SAD\":0.0001263682497665286,\"CALM\":0.0008296924061141908,\"SCARED\":0.0000020987527022953145},\"SimilarFaces\":null}]",
        "faces_thumbnail": [
          {
            "face_id": "45f700000000ac19ffbf56adcaa98e3944f28c087cd36b9bc1acde5ae5829fa3",
            "face_group_id": "Group-00000000-1703-4fc0-bf56-369478ed14df",
            "face_thumbnail": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F..."
          }
        ],
        "image_quality": { "overall_score": 0.6911791563034058 }
      },
      "punish_flag": 2,
      "revision_id": "6138000000000b81a8164550b1e7cba1d7fbe111"
    }
  ],
  "next_marker": "",
  "total_count": 15
}
```

#### 探索-从人物的照片中移除一张

POST: `https://api.aliyundrive.com/v2/albums/unassign_facegroup_item`

```json
{ "face_group_id": "Group-00000000-1703-4fc0-bf56-369478ed14df", "file_id": "623b00000000d89ef21d4118838aed83de7575ba", "drive_id": "9600002" }
```

Response:

```text
HTTP/1.1 204 No Content
```

#### 探索-修改人物 name，头像，remarks

POST: `https://api.aliyundrive.com/v2/image/update_facegroup_info`

```json
{ "drive_id": "9600002", "group_cover_face_id": "45f700000000ac19ffbf56adcaa98e3944f28c087cd36b9bc1acde5ae5829fa3", "group_id": "Group-00000000-1703-4fc0-bf56-369478ed14df", "group_name": "fang", "remarks": "-" }
```

Response:

```json
{ "drive_id": "9600002", "group_id": "Group-00000000-1703-4fc0-bf56-369478ed14df" }
```

#### 探索-地点列表

POST: `https://api.aliyundrive.com/v2/image/list_address_groups`

```json
{ "all": false, "image_thumbnail_process": "image/resize,m_lfit,w_256,limit_0/format,jpg", "video_thumbnail_process": "video/snapshot,t_7000,f_jpg,w_800,h_600,ar_auto,m_fast", "drive_id": "9600002" }
```

Response:

```json
{ "items": [], "next_marker": "" }
```

#### 探索-地点列表

POST: `https://api.aliyundrive.com/v2/image/list_address_groups`

```json
{ "drive_id": "9600002", "address_names": ["杭州市", "北京市"] }
```

Response:

```json
{ "items": [] }
```

#### 探索-标记列表

POST: `https://api.aliyundrive.com/v2/image/list_tags`

```json
{ "all": false, "image_thumbnail_process": "image/resize,m_lfit,w_256,limit_0/format,jpg", "video_thumbnail_process": "video/snapshot,t_7000,f_jpg,w_800,h_600,ar_auto,m_fast", "drive_id": "9600002" }
```

Response:

```json
{
  "tags": [
    {
      "name": "摄影",
      "count": 75,
      "cover_url": "https://ccp-bj29-bj-1592982087.oss-cn-beijing.aliyuncs.com/ew5HgHNJ%2F...",
      "cover_file_id": "6061000000001af7c3034e3590ea7d5a50f58015",
      "cover_file_category": "",
      "cover_tag_confidence": 1,
      "cover_overall_score": 0.7421030402183533
    }
  ]
}
```

#### drive 内图片总数

POST: `https://api.aliyundrive.com/v2/image/get_photo_count`

```json
{ "drive_id": "9600002" }
```

Response:

```json
{ "image_count": 126 }
```
