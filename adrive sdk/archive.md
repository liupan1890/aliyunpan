#### 在线打开压缩包

POST: `https://api.aliyundrive.com/v2/archive/list`

```json
{ "archive_type": "zip", "domain_id": "bj29", "drive_id": "9600002", "file_id": "623b00000000d89ef21d4118838aed83de7575ba" }
```

Response:

```json
{ "state": "Running", "file_list": {}, "task_id": "e026000000007f609bcd6aa71b8fde94" }
```

#### 在线打开压缩包进度

POST: `https://api.aliyundrive.com/v2/archive/status`

```json
{ "domain_id": "bj29", "drive_id": "9600002", "file_id": "623b00000000d89ef21d4118838aed83de7575ba", "task_id": "e026000000007f609bcd6aa71b8fde94" }
```

Response:

```json
{ "code": "LimitArchive", "message": "Archive reach limit" }
{"code":"BadArchive","message":"Archive is bad"}
{"code":"InvalidPassword","message":"Password is invalid"}
```

```json
{ "state": "Running", "file_list": {}, "task_id": "e026000000007f609bcd6aa71b8fde94", "progress": 0 }
```

```json
{
  "state": "Succeed",
  "file_list": {
    "filezi": {
      "is_folder": true,
      "items": [
        {
          "is_folder": true,
          "items": [
            { "is_folder": false, "items": [], "name": "filezi/electron/electron", "size": 140256360, "updated_at": "2022-03-23T04:11:45.000Z" },
            { "is_folder": false, "items": [], "name": "filezi/electron/libvk_swiftshader.so", "size": 4168528, "updated_at": "2022-03-23T04:11:45.000Z" },
            {
              "is_folder": true,
              "items": [
                { "is_folder": false, "items": [], "name": "filezi/electron/swiftshader/libEGL.so", "size": 256032, "updated_at": "2022-03-23T04:11:45.000Z" },
                { "is_folder": false, "items": [], "name": "filezi/electron/swiftshader/libGLESv2.so", "size": 2580600, "updated_at": "2022-03-23T04:11:45.000Z" }
              ],
              "name": "filezi/electron/swiftshader",
              "size": 0,
              "updated_at": "1970-01-01T00:00:00.000Z"
            }
          ],
          "name": "filezi/electron",
          "size": 0,
          "updated_at": "1970-01-01T00:00:00.000Z"
        },
        { "is_folder": false, "items": [], "name": "filezi/linux使用帮助.txt", "size": 509, "updated_at": "2022-03-23T04:11:45.000Z" }
      ],
      "name": "filezi",
      "size": 0,
      "updated_at": "1970-01-01T00:00:00.000Z"
    }
  },
  "task_id": "e026000000007f609bcd6aa71b8fde94",
  "progress": 100
}
```

#### 在线打开压缩包(rar 带密码)

```js
//第一次，没有文件缓存

//POST: `https://api.aliyundrive.com/v2/archive/list`
{"code":"BadArchive","message":"Archive is bad"}//返回文件锁坏
//POST: `https://api.aliyundrive.com/v2/archive/list`  "password":"123"
//返回正常的 {  "state": "Succeed",  "file_list": { ...
```

```js
//第二次，有缓存

//POST: `https://api.aliyundrive.com/v2/archive/list`
{"code":"InvalidPassword","message":"Password is invalid"}//返回需要密码
//POST: `https://api.aliyundrive.com/v2/archive/list`  "password":"123"
//返回正常的 {  "state": "Succeed",  "file_list": { ...
```

#### 在线解压

POST: `https://api.aliyundrive.com/v2/archive/uncompress`

```json
{ "archive_type": "zip", "domain_id": "bj29", "drive_id": "9600002", "file_id": "623b00000000d89ef21d4118838aed83de7575ba", "target_drive_id": "9600002", "target_file_id": "61a300000000e67e5cf8489fab317ef345373b80" }
```

```json
{
  "archive_type": "zip",
  "domain_id": "bj29",
  "drive_id": "9600002",
  "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
  "file_list": ["lc-design-demo/assets/views/home.xml", "lc-design-demo/assets/views/layout"],
  "password": "123",
  "target_drive_id": "9600002",
  "target_file_id": "61a300000000e67e5cf8489fab317ef345373b80"
}
```

Response:

```json
{ "state": "Running", "task_id": "e026000000007f609bcd6aa71b8fde94" }
```

#### 在线解压进度

POST: `https://api.aliyundrive.com/v2/archive/status`

```json
{ "domain_id": "bj29", "drive_id": "9600002", "file_id": "623b00000000d89ef21d4118838aed83de7575ba", "task_id": "e026000000007f609bcd6aa71b8fde94" }
```

Response:

```json
{ "state": "Running", "file_list": {}, "task_id": "e026000000007f609bcd6aa71b8fde94", "progress": -1 }
```

```json
{ "state": "Running", "file_list": {}, "task_id": "e026000000007f609bcd6aa71b8fde94", "progress": 15 }
```

```json
{ "state": "Succeed", "file_list": {}, "task_id": "e026000000007f609bcd6aa71b8fde94", "progress": 100 }
```

#### 打包下载

POST: `https://api.aliyundrive.com/v2/file/archive_files`

```json
{ "name": "aname.zip", "drive_id": "9600002", "files": [{ "file_id": "623b00000000d89ef21d4118838aed83de7575ba" }] }
```

Response:

```json
{ "async_task_id": "9fcb1e1d-0000-0000-b30d-387e04dcafcb" }
```

#### 打包下载进度

POST: `https://api.aliyundrive.com/v2/async_task/get`

```json
{ "async_task_id": "9fcb1e1d-0000-0000-b30d-387e04dcafcb" }
```

Response:

```json
{
  "async_task_id": "9fcb1e1d-0000-0000-b30d-387e04dcafcb",
  "state": "Succeed",
  "err_code": 200,
  "total_process": 167238406,
  "consumed_process": 167238406,
  "url": "https://ccp-bj29-video-preview.oss-cn-beijing.aliyuncs.com/archive%2F9fcb1e1d-e9dd-43d0-b30d-387e04dcafcb?response-content-disposition=attachment%3B%20filename%2A%3DUTF-8%27%27aname.zip\u0026x-oss-access-key-id=LTAIsE5mAn2F493Q\u0026x-oss-expires=1648014906\u0026x-oss-signature=5E4UEDoNKoUFDKsH41BQxlsc0BvoTeMjS4QZv5x1U%2B0%3D\u0026x-oss-signature-version=OSS2",
  "punished_file_count": 0
}
```
