#### 上传文件 pre_hash

POST: `https://api.aliyundrive.com/v2/file/create_with_proof`

```json
{
  "auto_rename": true,
  "content_type": "application/octet-stream",
  "drive_id": "9600002",
  "hidden": false,
  "name": "Version 89",
  "parent_file_id": "root",
  "part_info_list": [{ "part_number": 1, "part_size": 4094816 }],
  "pre_hash": "BF9800000000645AAAE912D616759A7C96CC8BFA",
  "size": 4094816,
  "type": "file"
}
```

Response:

```json
{ "parent_file_id": "", "file_name": "Version 89", "pre_hash": "BF9800000000645AAAE912D616759A7C96CC8BFA", "code": "PreHashMatched", "message": "Pre hash matched." }
```

#### 上传文件

POST: `https://api.aliyundrive.com/v2/file/create_with_proof`

```json
{
  "auto_rename": true,
  "content_hash": "4DBF0000000023E6E756C29AF6AC487217921D53",
  "content_hash_name": "sha1",
  "content_type": "application/octet-stream",
  "drive_id": "9600002",
  "hidden": false,
  "name": "Version 89",
  "parent_file_id": "root",
  "part_info_list": [{ "part_number": 1, "part_size": 4094816 }],
  "proof_code": "h49KOtR0okk=",
  "proof_version": "v1",
  "size": 4094816,
  "type": "file"
}
```

Response:

```json
//秒传了
{
  "parent_file_id": "root",
  "upload_id": "ED12000000004724833D47B5D5D3C8B9",
  "rapid_upload": true,
  "type": "file",
  "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
  "domain_id": "bj29",
  "drive_id": "9600002",
  "file_name": "Version 89",
  "encrypt_mode": "none",
  "location": "cn-beijing"
}
```

```json
//正常上传
{
  "parent_file_id": "root",
  "part_info_list": [
    {
      "part_number": 1,
      "part_size": 950,
      "upload_url": "https://bj29.cn-beijing.data.alicloudccp.com/AfD0AB6n%2F9600002%2F623b00000000d89ef21d4118838aed83de7575ba%2F623b000000006480042148a5bb586d3c2f053ec8?partNumber=1&uploadId=1382108D9D2C4182B2D4B9AEBB53E2E4&x-oss-access-key-id=LTAIsE5mAn2F493Q&x-oss-expires=1648043319&x-oss-signature=rIWzJDDihQwWO%2FoAxPPjQV2Y0%2F8FXH3h7rd01w%2Biin8%3D&x-oss-signature-version=OSS2",
      "internal_upload_url": "http://ccp-bj29-bj-1592982087.oss-cn-beijing-internal.aliyuncs.com/AfD0AB6n%2F9600002%2F623b00000000d89ef21d4118838aed83de7575ba%2F623b000000006480042148a5bb586d3c2f053ec8?partNumber=1&uploadId=1382108D9D2C4182B2D4B9AEBB53E2E4&x-oss-access-key-id=LTAIsE5mAn2F493Q&x-oss-expires=1648043319&x-oss-signature=rIWzJDDihQwWO%2FoAxPPjQV2Y0%2F8FXH3h7rd01w%2Biin8%3D&x-oss-signature-version=OSS2",
      "content_type": ""
    }
  ],
  "upload_id": "ED12000000004724833D47B5D5D3C8B9",
  "rapid_upload": false,
  "type": "file",
  "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
  "domain_id": "bj29",
  "drive_id": "9600002",
  "file_name": "FiddlerRoot.crt",
  "encrypt_mode": "none",
  "location": "cn-beijing"
}
```

//循环上传分片数据

PUT `https://bj29.cn-beijing.data.alicloudccp.com/AfD0AB6n%2F9600002%2F623b00000000d89ef21d4118838aed83de7575ba%2F623b000000006480042148a5bb586d3c2f053ec8?partNumber=1&uploadId=1382108D9D2C4182B2D4B9AEBB53E2E4&x-oss-access-key-id=LTAIsE5mAn2F493Q&x-oss-expires=1648043319&x-oss-signature=rIWzJDDihQwWO%2FoAxPPjQV2Y0%2F8FXH3h7rd01w%2Biin8%3D&x-oss-signature-version=OSS2`

#### 合并分片

POST: `https://api.aliyundrive.com/v2/file/complete`

```json
{ "drive_id": "9600002", "file_id": "623b00000000d89ef21d4118838aed83de7575ba", "upload_id": "ED12000000004724833D47B5D5D3C8B9" }
```

Response:

```json
{
  "drive_id": "9600002",
  "domain_id": "bj29",
  "file_id": "623b00000000d89ef21d4118838aed83de7575ba",
  "name": "FiddlerRoot.crt",
  "type": "file",
  "content_type": "application/x-x509-ca-cert",
  "created_at": "2022-03-23T12:48:39.888Z",
  "updated_at": "2022-03-23T12:48:40.449Z",
  "file_extension": "crt",
  "hidden": false,
  "size": 950,
  "starred": false,
  "status": "available",
  "user_meta": "{\"client\":\"Android\"}",
  "upload_id": "ED12000000004724833D47B5D5D3C8B9",
  "parent_file_id": "root",
  "crc64_hash": "1548000000008183211",
  "content_hash": "4DBF0000000023E6E756C29AF6AC487217921D53",
  "content_hash_name": "sha1",
  "category": "others",
  "encrypt_mode": "none",
  "creator_type": "User",
  "creator_id": "9400000000bc480bbcbbb1e074f55a7f",
  "last_modifier_type": "User",
  "last_modifier_id": "9400000000bc480bbcbbb1e074f55a7f",
  "revision_id": "6138000000000b81a8164550b1e7cba1d7fbe111",
  "location": "cn-beijing"
}
```
