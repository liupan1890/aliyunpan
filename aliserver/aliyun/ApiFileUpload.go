package aliyun

//https://api.aliyundrive.com/v2/file/create
//referer: https://www.aliyundrive.com/
/*
{
    "drive_id": "8699982",
    "name": "resources.pak",
    "parent_file_id": "60aa4e418fece81aab0844fd93c7331dacdb5829",
    "type": "file",
    "size": 5140611,
    "check_name_mode": "auto_rename",
    "content_hash_name": "sha1",
    "content_hash": "fb809cfe535b907a5ef0d5a552d34ec209277bbb"
}*/

/*return
{"parent_file_id":"60aa4e418fece81aab0844fd93c7331dacdb5829","upload_id":"rapid-c74a02cb-e1b5-4c83-9854-0013c311eb2b","rapid_upload":true,"type":"file","file_id":"60ac92ae1a8ca1a9d88c43e29ae170f02dd1bd42","domain_id":"bj29","drive_id":"8699982","file_name":"resources.pak","encrypt_mode":"none","location":"cn-beijing"}
*/

//https://api.aliyundrive.com/v2/file/complete
/*
{
    "drive_id": "8699982",
    "upload_id": "rapid-c74a02cb-e1b5-4c83-9854-0013c311eb2b",
    "file_id": "60ac92ae1a8ca1a9d88c43e29ae170f02dd1bd42",
    "parent_file_id": "60aa4e418fece81aab0844fd93c7331dacdb5829",
    "type": "file",
    "name": "resources.pak",
    "content_type": ""
}*/

/*return
{"drive_id":"8699982","domain_id":"bj29","file_id":"60ac92ae1a8ca1a9d88c43e29ae170f02dd1bd42","name":"resources.pak","type":"file","content_type":"application/oct-stream","created_at":"2021-05-25T06:01:18.165Z","updated_at":"2021-05-25T06:01:18.165Z","file_extension":"pak","hidden":false,"size":5140611,"starred":false,"status":"available","upload_id":"rapid-c74a02cb-e1b5-4c83-9854-0013c311eb2b","parent_file_id":"60aa4e418fece81aab0844fd93c7331dacdb5829","crc64_hash":"15265797113528566976","content_hash":"FB809CFE535B907A5EF0D5A552D34EC209277BBB","content_hash_name":"sha1","category":"others","encrypt_mode":"none","location":"cn-beijing"}*/

//上传文件
/*
{
    "drive_id": "8699982",
    "name": "aDrive.7z",
    "parent_file_id": "60aa4e418fece81aab0844fd93c7331dacdb5829",
    "type": "file",
    "size": 34243822,
    "check_name_mode": "auto_rename",
    "content_hash_name": "sha1",
    "content_hash": "8b4b35475150d1eb7833d6287b8f6e9dfcde2f97"
}*/
