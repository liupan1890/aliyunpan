export interface IAliFileVideoMeta {
  bitrate: string | undefined
  clarity: string | undefined
  code_name: string | undefined
  duration: string | undefined
  fps: string | undefined
}
export interface IAliFileAudioMeta {
  bit_rate: string | undefined
  channel_layout: string | undefined
  channels: number | undefined
  code_name: string | undefined
  duration: string | undefined
  sample_rate: string | undefined
}

export interface IAliFileItem {
  drive_id: string
  domain_id: string
  description: string | undefined
  file_id: string
  name: string
  type: string
  content_type: string
  created_at: string
  updated_at: string
  file_extension: string | undefined
  hidden: boolean
  size: number
  starred: boolean
  status: string
  upload_id: string
  parent_file_id: string
  crc64_hash: string
  content_hash: string
  content_hash_name: string
  download_url: string
  url: string
  category: string
  encrypt_mode: string
  punish_flag: number
  thumbnail: string | undefined
  mime_extension: string
  mime_type: string
  video_media_metadata:
    | {
        duration: string | number | undefined
        height: number | undefined
        width: number | undefined
        time: string | undefined
        video_media_video_stream: IAliFileVideoMeta[] | IAliFileVideoMeta | undefined
        video_media_audio_stream: IAliFileAudioMeta[] | IAliFileAudioMeta | undefined
      }
    | undefined
  video_preview_metadata:
    | {
        duration: string | number | undefined
        height: number | undefined
        width: number | undefined
        audio_format: string | undefined
        bitrate: string | undefined
        frame_rate: string | undefined
        video_format: string | undefined
        template_list: [{ template_id: string; status: string }] | undefined
        audio_template_list: [{ template_id: string; status: string }] | undefined
      }
    | undefined
  image_media_metadata:
    | {
        height: number
        width: number
      }
    | undefined
}

export interface IAliGetDirModel {
  drive_id: string
  file_id: string
  parent_file_id: string
  name: string
  size: number
  time: number
  description: string
}

export interface IAliGetFileModel {
  drive_id: string
  file_id: string
  parent_file_id: string
  name: string
  ext: string
  category: string
  icon: string
  size: number
  sizestr: string
  time: number
  timestr: string
  starred: boolean
  isdir: boolean
  download_url: string
  thumbnail: string
  description: string
}

export interface IDownloadUrl {
  drive_id: string
  file_id: string
  expire_sec: number
  url: string
  size: number
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

export interface IAliBatchResult {
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

export interface IShareInfoModel {
  shareinfo: {
    shareid: string
    creator_id: string
    creator_name: string
    creator_phone: string
    display_name: string
    expiration: string
    file_count: number
    share_name: string
    updated_at: string
    vip: string
  }
  shareinfojson: string
  error: string
}

export interface IAliShareItem {
  created_at: string
  creator: string
  description: string
  display_name: string
  download_count: number
  drive_id: string
  expiration: string
  expired: false
  file_id: string
  file_id_list: string[]
  icon: string
  first_file: IAliFileItem | undefined
  preview_count: number
  save_count: number
  share_id: string
  share_msg: string
  share_name: string
  share_policy: string
  share_pwd: string
  share_url: string
  status: string
  updated_at: string
}


export interface IBatchResult {
  count: number;
  task: {
    file_id: string;
    task_id: string;
    newdrive_id: string;
    newfile_id: string;
  }[];
  reslut: {
    id: string;
    file_id: string;
  }[];
  error: {
    id: string;
    code: string;
    message: string;
  }[];
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
