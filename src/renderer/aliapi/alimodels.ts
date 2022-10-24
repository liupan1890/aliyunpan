export interface IAliFileVideoMeta {
  bitrate?: string
  clarity?: string
  code_name?: string
  duration?: string
  fps?: string
}
export interface IAliFileAudioMeta {
  bit_rate?: string
  channel_layout?: string
  channels?: number
  code_name?: string
  duration?: string
  sample_rate?: string
}


export interface IAliFileItem {
  drive_id: string
  domain_id: string
  description?: string
  file_id: string
  compilation_id?: string
  name: string
  type: string
  video_type?: string
  content_type: string
  created_at: string
  updated_at: string
  last_played_at?: string
  gmt_cleaned?: string
  gmt_deleted?: string
  file_extension?: string
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
  thumbnail?: string
  mime_extension: string
  mime_type: string
  play_cursor: number
  video_media_metadata?: {
    duration?: string | number
    height?: number
    width?: number
    time?: string
    video_media_video_stream?: IAliFileVideoMeta[] | IAliFileVideoMeta
    video_media_audio_stream?: IAliFileAudioMeta[] | IAliFileAudioMeta
  }

  video_preview_metadata?: {
    duration?: string | number
    height?: number
    width?: number
    time?: string
    audio_format?: string
    bitrate?: string
    frame_rate?: string
    video_format?: string
    template_list?: [{ template_id: string; status: string }]
    audio_template_list?: [{ template_id: string; status: string }]
  }

  image_media_metadata?: {
    height?: number
    width?: number
    time?: string
    exif?: string
  }

  user_meta?: string
}


export interface IAliOtherFollowingModel {
  avatar: string 
  description: string 
  is_following: boolean 
  nick_name: string 
  phone: string 
  user_id: string 
  follower_count: number
}

interface IAliMyFollowingMessageModel {
  action: string 
  content: {
    file_id_list: string[]
    share: { popularity: number; popularity_emoji: string; popularity_str: string; share_id: string; share_pwd: string }
  }
  created: number 
  createdstr: string 
  creator: IAliOtherFollowingModel
  creator_id: string 
  display_action: string 
  sequence_id: number 
}


export interface IAliMyFollowingModel {
  avatar: string 
  description: string 
  has_unread_message: boolean 
  is_following: boolean 
  latest_messages: IAliMyFollowingMessageModel[]
  nick_name: string 
  phone: string 
  user_id: string 
  SearchName: string
}


export interface IAliShareItem {
  created_at: string 
  creator: string 
  description: string 
  display_name: string 
  download_count: number
  drive_id: string 
  expiration: string 
  expired: boolean
  file_id: string 
  file_id_list: string[] 
  icon: string
  first_file?: IAliFileItem 
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

export interface IAliShareAnonymous {
  shareinfo: {
    share_id: string
    creator_id: string
    creator_name: string
    creator_phone: string
    display_name: string 
    expiration: string 
    file_count: number
    share_name: string 
    created_at: string 
    updated_at: string 
    vip: string 
    is_photo_collection: boolean 
    album_id: string 
  }
  shareinfojson: string
  error: string
}


export interface IAliShareFileItem {
  drive_id: string
  // domain_id: string
  file_id: string
  name: string
  type: string
  // created_at: string
  // updated_at: string
  // hidden: boolean
  // starred: boolean
  // status: string
  parent_file_id: string
  // encrypt_mode: string
  // revision_id: string
  
  file_extension?: string
  mime_extension: string
  mime_type: string
  size: number
  // content_hash: string
  // content_hash_name: string
  category: string
  punish_flag: number

  
  isDir: boolean
  sizeStr: string
  icon: string
}


export interface IAliGetForderSizeModel {
  size: number
  folder_count: number
  file_count: number
  reach_limit?: boolean
}


export interface IAliGetDirModel {
  __v_skip: true
  drive_id: string
  file_id: string
  parent_file_id: string
  name: string
  namesearch: string
  size: number
  time: number
  
  description: string
}


export interface IAliGetFileModel {
  __v_skip: true
  drive_id: string
  file_id: string
  parent_file_id: string
  name: string
  namesearch: string
  ext: string
  category: string
  icon: string
  size: number
  sizeStr: string
  time: number
  timeStr: string
  starred: boolean
  isDir: boolean
  thumbnail: string
  description: string
  compilation_id?: string
  download_url?: string
  media_width?: number
  media_height?: number
  media_duration?: string
  media_time?: string
}
