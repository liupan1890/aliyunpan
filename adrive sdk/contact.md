#### 通讯录列出

POST: `https://api.aliyundrive.com/adrive/v1/contact/list`

```json
{}
```

Response:

```json
{
  "items": [
    {
      "id": 223963400,
      "content": {
        "format": "vcard",
        "hash": "1a48648e8b140ae80be048f1681cfbe24a7b9579c2ffbabe2686eb79338dfe14",
        "value": "BEGIN:VCARD\r\nVERSION:4.0\r\nPRODID:ez-vcard 0.11.2\r\nKIND:individual\r\nFN:高青\r\nN:高;青;;;\r\nTEL;TYPE=cell:15000065001\r\nEND:VCARD\r\n",
        "version": "4.0"
      },
      "gmt_create": 1647864044589
    },
    {
      "id": 224054214,
      "content": {
        "format": "vcard",
        "hash": "978edd2d967b94b34d3a90c00cbd4819e239f21a6f72f6a2f87b522fe81a62f4",
        "value": "BEGIN:VCARD\r\nVERSION:4.0\r\nPRODID:ez-vcard 0.11.2\r\nKIND:individual\r\nFN:木门\r\nN:木;门;;;\r\nTEL;TYPE=cell:03100000981\r\nEND:VCARD\r\n",
        "version": "4.0"
      },
      "gmt_create": 1647864055972
    }    
  ],
  "total_count": 2
}
```

#### 通讯录删除

POST: `https://api.aliyundrive.com/adrive/v1/contact/delete`

```json
{ "ids": [224206708] }
```

Response:

```json
{}
```

#### 通讯录备份添加

POST: `https://api.aliyundrive.com/adrive/v1/contact/add`

```json
{
  "items": [
    {
      "hash": "978edd2d967b94b34d3a90c00cbd4819e239f21a6f72f6a2f87b522fe81a62f4",
      "version": "4.0",
      "value": "BEGIN:VCARD\r\nVERSION:4.0\r\nN:木;门\r\nTEL;TYPE=cell:03000080981\r\nKIND:individual\r\nEND:VCARD\r\n",
      "avatar": "",
      "format": "vcard"
    }
  ]
}
```

Response:

```json
{ "items": [{ "id": 223963801, "content": { "format": "vcard", "hash": "978edd2d967b94b34d3a90c00cbd4819e239f21a6f72f6a2f87b522fe81a62f4", "version": "4.0" } }] }
```
