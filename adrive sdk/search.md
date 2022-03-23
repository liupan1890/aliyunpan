#### 首页 widgets

POST: `https://api.aliyundrive.com/v2/file/search`

```json
//截图
{
  "return_total_count": true,
  "image_thumbnail_process": "image/resize,m_lfit,w_256,limit_0/format,jpg",
  "order_by": "last_access_at DESC,updated_at DESC,image_time DESC",
  "query": "(label = '手机截图' or label = '截图') and category in ['video','image']  and status = 'available' and hidden = false",
  "limit": 100,
  "drive_id": "9600002"
}
```

```json
//证件
{
  "return_total_count": true,
  "image_thumbnail_process": "image/resize,m_lfit,w_256,limit_0/format,jpg",
  "order_by": "last_access_at DESC,updated_at DESC,image_time DESC",
  "query": "(label = '身份证明' or label = '证件' or label = '身份证' or label = '银行卡' or label = '护照') and category in ['video','image']  and status = 'available' and hidden = false",
  "limit": 100,
  "drive_id": "9600002"
}
```

```json
//最近图片
{
  "return_total_count": true,
  "image_thumbnail_process": "image/resize,m_lfit,w_256,limit_0/format,jpg",
  "order_by": "last_access_at DESC,updated_at DESC,image_time DESC",
  "query": "category = 'image'  and status = 'available' and hidden = false",
  "limit": 100,
  "drive_id": "9600002"
}
```

```json
//最近视频
{
  "return_total_count": true,
  "image_thumbnail_process": "image/resize,m_lfit,w_256,limit_0/format,jpg",
  "order_by": "last_access_at DESC,updated_at DESC,image_time DESC",
  "query": "category = 'video'  and status = 'available' and hidden = false",
  "limit": 100,
  "drive_id": "9600002"
}
```

Response:

```json
filelist
```

#### 列出人物(face)的图片

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
filelist
```
