
export interface IDownloadUrl {
  drive_id: string
  file_id: string
  expire_sec: number
  url: string
  size: number
}


export interface IVideoPreviewUrl {
  drive_id: string
  file_id: string
  expire_sec: number
  url: string
  duration: number
  width: number
  height: number
  urlFHD: string
  urlHD: string
  urlSD: string
  urlLD: string
  subtitles: {
    language: string
    url: string
  }[]
}


export interface IOfficePreViewUrl {
  drive_id: string
  file_id: string
  access_token: string
  preview_url: string
}


export interface IVideoXBTUrl {
  time: string
  url: string
}


export interface IUploadCreat {
  user_id: string
  drive_id: string
  file_id: string
  israpid: boolean
  isexist: boolean
  upload_id: string
  part_info_list: {
    upload_url: string
    part_number: number
    part_size: number
    isupload: boolean
  }[]
  errormsg: string
}

export interface IUploadInfo {
  token_type: string
  access_token: string
  sha1: string
  israpid: boolean
  isexist: boolean
  part_info_list: {
    upload_url: string
    part_number: number
    part_size: number
    isupload: boolean
  }[]
}

export interface IAliBatchResult {
  count: number
  async_task: {
    drive_id: string
    file_id: string
    task_id: string
    newdrive_id: string
    newfile_id: string
  }[]
  reslut: {
    id: string
    file_id?: string
    
    name?: string
    type?: string
    parent_file_id?: string
    
    share_id?: string
    share_pwd?: string
    share_url?: string
    expiration?: string
    share_name?: string
    
    body?: any
  }[]
  error: {
    id: string
    code: string
    message: string
  }[]
}

export interface IBatchResult {
  count: number
  task: {
    file_id: string
    task_id: string
    newdrive_id: string
    newfile_id: string
  }[]
  reslut: {
    id: string
    file_id: string
  }[]
  error: {
    id: string
    code: string
    message: string
  }[]
}


export interface IAliGetAlbumModel {
  album_id: string 
  created_at: number 
  description: string 
  file_count: number 
  image_count: number 
  name: string 
  owner: string 
  updated_at: number 
  video_count: number 
}

export interface IAliUserDriveDetails {
  drive_used_size: number
  drive_total_size: number
  default_drive_used_size: number
  album_drive_used_size: number
  note_drive_used_size: number
  sbox_drive_used_size: number
  share_album_drive_used_size: number
}

export interface IAliUserDriveCapacity {
  type: string 
  size: number
  sizeStr: string
  expired: string 
  expiredstr: string 
  description: string 
  latest_receive_time: string /* "2022-05-02T00:50:51.379Z" */
}


export interface IStateUploadFile {
  UploadID: string
  Info: {
    user_id: string
    
    localFilePath: string
    
    parent_file_id: string
    drive_id: string

    path: string
    
    name: string
    
    size: number
    sizeStr: string
    icon: string
    isDir: boolean
    isMiaoChuan: boolean
    
    sha1: string
    
    crc64: string
  }
  
  Upload: {
    
    DownState: string
    DownTime: number
    DownSize: number
    DownSpeed: number
    DownSpeedStr: string
    DownProcess: number
    IsStop: boolean
    IsDowning: boolean
    IsCompleted: boolean
    IsFailed: boolean
    failedCode: number
    failedMessage: string
    
    AutoTry: number
    
    upload_id: string
    
    file_id: string
    
    IsBreakExist: boolean
  }
}
