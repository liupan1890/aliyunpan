#### 全部 drive

POST: `https://api.aliyundrive.com/v2/drive/list`

```json
{ "owner": "ccff000000004d75b5788a481eed8386" }
```

Response:

```json
{
  "items": [
    {
      "domain_id": "bj29",
      "drive_id": "9600002",
      "drive_name": "alibum",
      "description": "",
      "creator": "",
      "owner": "ccff000000004d75b5788a481eed8386",
      "owner_type": "user",
      "drive_type": "normal",
      "status": "enabled",
      "used_size": 739272268,
      "total_size": -1,
      "store_id": "b5e90000000041d084733b520ea8b57d",
      "relative_path": "",
      "encrypt_mode": "none",
      "encrypt_data_access": false,
      "created_at": "2021-03-29T04:02:57.981Z",
      "permission": null,
      "subdomain_id": ""
    },
    {
      "domain_id": "bj29",
      "drive_id": "9600002",
      "drive_name": "Default",
      "description": "Created by system",
      "creator": "System",
      "owner": "ccff000000004d75b5788a481eed8386",
      "owner_type": "user",
      "drive_type": "normal",
      "status": "enabled",
      "used_size": 7186746146291,
      "total_size": 10737418240,
      "store_id": "b5e90000000041d084733b520ea8b57d",
      "relative_path": "",
      "encrypt_mode": "none",
      "encrypt_data_access": false,
      "created_at": "2021-03-18T04:55:06.893Z",
      "permission": null,
      "subdomain_id": ""
    },
    {
      "domain_id": "bj29",
      "drive_id": "9600002",
      "drive_name": "note_drive",
      "description": "",
      "creator": "",
      "owner": "ccff000000004d75b5788a481eed8386",
      "owner_type": "user",
      "drive_type": "normal",
      "status": "enabled",
      "used_size": 502382874,
      "total_size": -1,
      "store_id": "b5e90000000041d084733b520ea8b57d",
      "relative_path": "",
      "encrypt_mode": "none",
      "encrypt_data_access": false,
      "created_at": "2021-10-24T11:29:12.773Z",
      "permission": null,
      "subdomain_id": ""
    },
    {
      "domain_id": "bj29",
      "drive_id": "9600002",
      "drive_name": "Default",
      "description": "Created by system",
      "creator": "System",
      "owner": "ccff000000004d75b5788a481eed8386",
      "owner_type": "user",
      "drive_type": "normal",
      "status": "enabled",
      "used_size": 227511979353,
      "total_size": 10737418240,
      "store_id": "b5e90000000041d084733b520ea8b57d",
      "relative_path": "",
      "encrypt_mode": "none",
      "encrypt_data_access": false,
      "created_at": "2021-03-18T04:55:06.936Z",
      "permission": null,
      "subdomain_id": ""
    }
  ],
  "next_marker": ""
}
```

#### 全部 drive

POST: `https://api.aliyundrive.com/v2/drive/list_my_drives`

```json
{ "owner": "ccff000000004d75b5788a481eed8386" }
```

Response:

```json
同上
```

#### 默认 drive(网盘)

POST: `https://api.aliyundrive.com/v2/drive/get_default_drive`

```json

```

Response:

```json
{
  "domain_id": "bj29",
  "drive_id": "9600002",
  "drive_name": "Default",
  "description": "Created by system",
  "creator": "System",
  "owner": "ccff000000004d75b5788a481eed8386",
  "owner_type": "user",
  "drive_type": "normal",
  "status": "enabled",
  "used_size": 7186746146291,
  "total_size": 17536351469568,
  "store_id": "b5e90000000041d084733b520ea8b57d",
  "relative_path": "",
  "encrypt_mode": "none",
  "encrypt_data_access": false,
  "created_at": "2021-03-18T04:55:06.893Z",
  "permission": null,
  "subdomain_id": ""
}
```

#### 指定 drive

POST: `https://api.aliyundrive.com/v2/drive/get`

```json
{ "drive_id": "9600002" }
```

Response:

```json
{
  "domain_id": "bj29",
  "drive_id": "9600002",
  "drive_name": "alibum",
  "description": "",
  "creator": "",
  "owner": "ccff000000004d75b5788a481eed8386",
  "owner_type": "user",
  "drive_type": "normal",
  "status": "enabled",
  "used_size": 742962124,
  "total_size": 17536351469568,
  "store_id": "b5e90000000041d084733b520ea8b57d",
  "relative_path": "",
  "encrypt_mode": "none",
  "encrypt_data_access": false,
  "created_at": "2021-03-29T04:02:57.981Z",
  "permission": null,
  "subdomain_id": ""
}
```
