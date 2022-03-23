#### 笔记-drive_id

POST: `https://api.aliyundrive.com/anote/v1/drive/info`

```json

```

Response:

```json
{ "user_id": "9400000000bc480bbcbbb1e074f55a7f", "drive_id": "9600002" }
```

#### 笔记列表

POST: `https://api.aliyundrive.com/anote/v1/note/list`

```json
{ "order_direction": "desc", "order_by": 2, "media_category_list": ["image"], "limit": 100, "status": 0 }
```

Response:

```json
{
  "result": [
    {
      "status": 0,
      "top": 0,
      "title": "高三总复习CETV.mp4",
      "summary": "  回顾改革\n三生俄文\n",
      "media": "[]",
      "type": "common",
      "value": null,
      "version": null,
      "user_id": "9400000000bc480bbcbbb1e074f55a7f",
      "doc_id": "feb400000000a0a7f69588aeed0567c8e5c31d1d",
      "drive_id": "9600002",
      "created_at": 1647859789126,
      "updated_at": 1647860036653,
      "media_list": []
    },
    {
      "status": 0,
      "top": 0,
      "title": "iyvxb",
      "summary": "",
      "media": "[]",
      "type": "common",
      "value": null,
      "version": null,
      "user_id": "9400000000bc480bbcbbb1e074f55a7f",
      "doc_id": "feb400000000a0a7f69588aeed0567c8e5c31d1d",
      "drive_id": "9600002",
      "created_at": 1635075204623,
      "updated_at": 1635075211182,
      "media_list": []
    },
    {
      "status": 0,
      "top": 0,
      "title": "ggg",
      "summary": "ggc\n",
      "media": "[]",
      "type": "common",
      "value": null,
      "version": null,
      "user_id": "9400000000bc480bbcbbb1e074f55a7f",
      "doc_id": "feb400000000a0a7f69588aeed0567c8e5c31d1d",
      "drive_id": "9600002",
      "created_at": 1635074956002,
      "updated_at": 1635074983777,
      "media_list": []
    },
    {
      "status": 0,
      "top": 0,
      "title": "欢迎使用笔记",
      "summary": "阿里云盘「笔记」是你在数字生活中的又一个伙伴，帮助你随时记录生活、学习、工作中的各种重要信息。你的每一次起心动念，都会留下属于自己的思想痕迹。抓住它们、记录它们，它们会是你在数字世界中重要的资产。 · 笔记能做什么？\n · 阿里云盘「笔记」将有两大核心能力：\n · 1. 在云盘中跨云服务记录想法 · 1. 管理信息、知识 · \uD83D\uDC47下面我们简单为大家介绍一下笔记的具体功能：\n · 灵活强大的编辑器\n",
      "media": "[]",
      "type": "common",
      "value": null,
      "version": null,
      "user_id": "9400000000bc480bbcbbb1e074f55a7f",
      "doc_id": "feb400000000a0a7f69588aeed0567c8e5c31d1d",
      "drive_id": "9600002",
      "created_at": 1635074953183,
      "updated_at": 1635074953183,
      "media_list": [
        { "fileId": "61754388dab29ac982464de485c38a5f67d07bc1", "driveId": "9600002", "resourceType": null, "dataPreviewUrl": null, "dataSrc": null, "dataAppId": null, "dataObjectId": null, "dataCategory": null },
        { "fileId": "61754389b1a68525c17d4235af597722dbd32370", "driveId": "9600002", "resourceType": null, "dataPreviewUrl": null, "dataSrc": null, "dataAppId": null, "dataObjectId": null, "dataCategory": null },
        { "fileId": "61754389ead68e4cce6b4499b5512585d94a011b", "driveId": "9600002", "resourceType": null, "dataPreviewUrl": null, "dataSrc": null, "dataAppId": null, "dataObjectId": null, "dataCategory": null }
      ]
    }
  ],
  "marker": "",
  "total_count": 4
}
```

#### 一个笔记的简介

POST: `https://api.aliyundrive.com/anote/v1/note/getNote`

```json
{ "exclude_fields": ["value"], "doc_id": "feb400000000a0a7f69588aeed0567c8e5c31d1d" }
```

Response:

```json
{
  "status": 0,
  "top": 0,
  "title": "欢迎使用笔记",
  "summary": "阿里云盘「笔记」是你在数字生活中的又一个伙伴，帮助你随时记录生活、学习、工作中的各种重要信息。你的每一次起心动念，都会留下属于自己的思想痕迹。抓住它们、记录它们，它们会是你在数字世界中重要的资产。 · 笔记能做什么？\n · 阿里云盘「笔记」将有两大核心能力：\n · 1. 在云盘中跨云服务记录想法 · 1. 管理信息、知识 · \uD83D\uDC47下面我们简单为大家介绍一下笔记的具体功能：\n · 灵活强大的编辑器\n",
  "media": "[]",
  "type": "common",
  "value": null,
  "version": 1,
  "user_id": "9400000000bc480bbcbbb1e074f55a7f",
  "doc_id": "feb400000000a0a7f69588aeed0567c8e5c31d1d",
  "drive_id": "9600002",
  "created_at": 1635074953183,
  "updated_at": 1635074953183,
  "media_list": [
    {
      "fileId": null,
      "driveId": null,
      "resourceType": null,
      "dataPreviewUrl": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "dataSrc": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "dataAppId": "anote",
      "dataObjectId": "9600002_61754389ead68e4cce6b4499b5512585d94a011b",
      "dataCategory": "image"
    }
  ]
}
```

#### 一个笔记的完整内容

POST: `https://api.aliyundrive.com/anote/v1/note/getNote`

```json
{ "doc_id": "feb400000000a0a7f69588aeed0567c8e5c31d1d" }
```

Response:

```json
{
  "status": 0,
  "top": 0,
  "title": "欢迎使用笔记",
  "summary": "阿里云盘「笔记」是你在数字生活中的又一个伙伴，帮助你随时记录生活、学习、工作中的各种重要信息。你的每一次起心动念，都会留下属于自己的思想痕迹。抓住它们、记录它们，它们会是你在数字世界中重要的资产。 · 笔记能做什么？\n · 阿里云盘「笔记」将有两大核心能力：\n · 1. 在云盘中跨云服务记录想法 · 1. 管理信息、知识 · \uD83D\uDC47下面我们简单为大家介绍一下笔记的具体功能：\n · 灵活强大的编辑器\n",
  "media": "[]",
  "type": "common",
  "value": [
    "root",
    {},
    [
      "p",
      {},
      [
        "span",
        { "data-type": "text" },
        [
          "span",
          { "data-type": "leaf" },
          "阿里云盘「笔记」是你在数字生活中的又一个伙伴，帮助你随时记录生活、学习、工作中的各种重要信息。你的每一次起心动念，都会留下属于自己的思想痕迹。抓住它们、记录它们，它们会是你在数字世界中重要的资产。"
        ]
      ]
    ],
    [
      "h2",
      { "spacing": { "before": 14.666666666666668, "after": 14.666666666666668, "line": 0.8529411764705882 } },
      ["span", { "data-type": "text" }, ["span", { "bold": true, "sz": 16, "szUnit": "pt", "data-type": "leaf" }, "笔记能做什么？\n"]]
    ],
    ["p", { "ind": { "left": 0 } }, ["span", { "data-type": "text" }, ["span", { "data-type": "leaf" }, "阿里云盘「笔记」将有两大核心能力：\n"]]],
    [
      "p",
      {
        "ind": { "left": 0 },
        "list": { "listId": "kak98pl4pzh", "level": 0, "isOrdered": true, "isTaskList": false, "listStyleType": "DEC_LEN_LROM_P", "symbolStyle": {}, "listStyle": { "format": "decimal", "text": "%1.", "align": "left" }, "hideSymbol": false }
      },
      ["span", { "data-type": "text" }, ["span", { "data-type": "leaf" }, "在云盘中跨"], ["span", { "bold": true, "data-type": "leaf" }, "云服务"], ["span", { "data-type": "leaf" }, "记录想法"]]
    ],

    [
      "p",
      {},
      ["span", { "data-type": "text" }, ["span", { "data-type": "leaf" }, ""]],
      [
        "object",
        {
          "dataCategory": "image",
          "dataId": "0079012b-d4c9-43b0-ad46-a394ef944aa4",
          "dataAppId": "anote",
          "dataObjectId": "9600002_61754388dab29ac982464de485c38a5f67d07bc1",
          "dataResourceType": "file",
          "dataMetadata": { "drive_id": "9600002", "file_id": "623b00000000d89ef21d4118838aed83de7575ba" },
          "aslMetadata": {},
          "dataPreviewUrl": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
          "dataSrc": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F..."
        },
        ["span", { "data-type": "text" }, ["span", { "data-type": "leaf" }, ""]]
      ],
      ["span", { "data-type": "text" }, ["span", { "data-type": "leaf" }, "\n"]]
    ]
  ],
  "version": 1,
  "user_id": "9400000000bc480bbcbbb1e074f55a7f",
  "doc_id": "feb400000000a0a7f69588aeed0567c8e5c31d1d",
  "drive_id": "9600002",
  "created_at": 1635074953183,
  "updated_at": 1635074953183,
  "media_list": [
    {
      "fileId": null,
      "driveId": null,
      "resourceType": null,
      "dataPreviewUrl": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "dataSrc": "https://bj29.cn-beijing.data.alicloudccp.com/2GhCur3G%2F...",
      "dataAppId": "anote",
      "dataObjectId": "9600002_61754389b1a68525c17d4235af597722dbd32370",
      "dataCategory": "image"
    }
  ]
}
```

#### 更新一个笔记标题

POST: `https://api.aliyundrive.com/anote/v1/note/updateTitle`

```json
{ "doc_id": "feb400000000a0a7f69588aeed0567c8e5c31d1d", "title": "我" }
```

Response:

```text
HTTP/1.1 200 OK
```

#### 更新一个笔记内容

POST: `https://api.aliyundrive.com/anote/v1/note/patch`

```json
{
  "ops": [
    { "op": "add", "path": "/5", "value": ["p", {}, ["span", { "data-type": "text" }, ["span", { "data-type": "leaf" }, "三生俄文将和 v 将祸福倚伏具有肌肤光滑"]]] },
    { "op": "remove", "path": "/6" }
  ],
  "doc_id": "feb400000000a0a7f69588aeed0567c8e5c31d1d",
  "version": 7,
  "summary": "  回顾改革\n三生俄文将和 v 将祸福倚伏具有肌肤光滑\n"
}
```

Response:

```json
{ "docId": "feb400000000a0a7f69588aeed0567c8e5c31d1d", "version": 8 }
```

https://www.aliyundrive.com/static/note-mobile-editor?docId=feb4c7c1f55fa0a7f69588aeed0567c8e5c31d1d

#### 置顶一个笔记

POST: `https://api.aliyundrive.com/anote/v1/note/batchUpdate`

```json
{ "doc_ids": ["feb400000000a0a7f69588aeed0567c8e5c31d1d"], "operation": 1 }
```

Response:

```json
{ "result": [] }
```

#### 删除一个笔记

POST: `https://api.aliyundrive.com/anote/v1/note/batchUpdate`

```json
{ "doc_ids": ["feb400000000a0a7f69588aeed0567c8e5c31d1d"], "operation": 2 }
```

Response:

```json
{ "result": [] }
```

#### 新建一个笔记

POST: `https://api.aliyundrive.com/anote/v1/note/create`

```json
{ "value": ["root", {}], "title": "", "drive_id": "" }
```

Response:

```json
{
  "status": 0,
  "top": 0,
  "title": "",
  "summary": "",
  "media": "[]",
  "type": "common",
  "user_id": "9400000000bc480bbcbbb1e074f55a7f",
  "doc_id": "feb400000000a0a7f69588aeed0567c8e5c31d1d",
  "drive_id": "9600002",
  "created_at": 1647862805027,
  "updated_at": 1647862805027,
  "media_list": null
}
```
