#### 保险箱

POST: `https://api.aliyundrive.com/v2/sbox/get`

```json
{}
```

Response:

```json
{ "drive_id": "9600002", "sbox_used_size": 0, "sbox_real_used_size": 0, "sbox_total_size": 53687091200, "recommend_vip": "svip", "pin_setup": true, "locked": true, "insurance_enabled": false }
```

#### 解锁

POST: `https://api.aliyundrive.com/v2/sbox/unlock`

```json
{
  "drive_id": "9600002",
  "app_id": "25dzX3vbYqktVxyX",
  "encrypted_pin": "pteN00000000/gLZpQaFKA==",
  "encrypted_key": "nNaV......r13doYbpmJxag=="
}
```

Response:

```json
{ "drive_id": "9600002" }
```

#### 重新锁定

POST: `https://api.aliyundrive.com/v2/sbox/lock`

```json
{"drive_id":"9600002"}
```

Response:

```json
{ "drive_id": "9600002" }
```
