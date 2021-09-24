export interface ITokenInfo {
  access_token: string;
  refresh_token: string;
  expires_in: number; 
  token_type: string; 
  user_id: string;
  user_name: string; 
  avatar: string;
  nick_name: string; 
  default_drive_id: string; 
  default_sbox_drive_id: string; 
  role: string;
  status: string;
  expire_time: string;
  state: string;
  pin_setup: boolean;
  is_first_login: boolean;
  need_rp_verify: boolean;

  //getpersonalinfo
  name: string; 
  spu_id: string; 
  is_expires: boolean; 
  used_size: number; 
  total_size: number; 
  spaceinfo: string; 

  //albums_info
  pic_drive_id: string; 
  share_token?: string; 
}

export interface IAliFileJson {
  items: IStatePanFile[];
  next_marker: string;

  m_time: number; 
  m_user_id: string; 
  m_drive_id: string; 
  m_dir_id: string; 
  m_dir_name: string; 
}

export interface IAliFileItem {
  drive_id: string; //
  domain_id: string; //
  file_id: string; //
  name: string; //
  type: string; //
  content_type: string;
  created_at: string;
  updated_at: string;
  file_extension: string | undefined; //
  hidden: boolean;
  size: number; //
  starred: boolean; //
  status: string; //
  upload_id: string;
  parent_file_id: string; //
  crc64_hash: string;
  content_hash: string;
  content_hash_name: string;
  download_url: string;
  url: string;
  category: string;
  encrypt_mode: string;
  punish_flag: number;
  thumbnail: string | undefined;
  mime_extension: string;
  video_media_metadata:
    | {
        duration: string | number | undefined;
        height: number | undefined;
        width: number | undefined;
        time: string;
      }
    | undefined;
  video_preview_metadata:
    | {
        duration: string | number | undefined;
        height: number | undefined;
        width: number | undefined;
        template_list: [{ template_id: string; status: string }] | undefined;
        audio_template_list: [{ template_id: string; status: string }] | undefined;
      }
    | undefined;
  image_media_metadata:
    | {
        height: number;
        width: number;
      }
    | undefined;
}

export interface IStatePanDir {
  drive_id: string;
  file_id: string;
  parent_file_id: string;
  name: string;
  //updated_at
  time: number;
  size: number;
  sizestr: string;
  timestr: string;
  isDir: true; 
  loading: number; 
  childrendir: string[];
}
export interface IStatePanDirSize {
  file_id: string;
  size: number;
}

export interface PanFileInfo {
  domainid: string;
  filetype: string;
  status: string; 
  crc64: string;
  url: string;
  downloadurl: string;
  isimage: boolean;
  isvideo: boolean;
  isvideopreview: boolean;
  isaudio: boolean;
  isWeiFa: boolean; 
}
export interface IStatePanFileList {
  file_id: string;
  rowitems: IStatePanFile[];
}
export interface IStatePanFile {
  drive_id: string;
  file_id: string;
  parent_file_id: string;
  name: string;
  ext: string;
  starred: boolean; 
  time: number;
  size: number;
  sizestr: string;
  timestr: string;
  sha1: string;
  thumbnail: string;
  width: number;
  height: number;
  duration: number;

  icon: string;
  info: string;
  isDir: boolean; 
  loading: number; 
}

export interface IStatePanFileByDir {
  user_id: string;
  drive_id: string;
  file_id: string;
  loading: number;
  filelist: IStatePanFile[];
}

export interface IStateTreeItem {
  key: string;
  label: string;
  icon: string;
  children: IStateTreeItem[];
  time: number;
  size: number;
  tickable?: boolean;
}

export interface IStateDownFile {
  DownID: string;
  Info: IStateDownInfo;
  
  Down: {
    
    DownState: string;
    DownTime: number;
    DownSize: number;
    DownSpeed: number;
    DownSpeedStr: string;
    DownProcess: number;
    IsStop: boolean;
    IsDowning: boolean;
    IsCompleted: boolean;
    IsFailed: boolean;
    FailedCode: number;
    FailedMessage: string;
    
    AutoTry: number;
    
    DownUrl: string;
  };
}

export interface IStateDowning {
  DownID: string;
  icon: string;
  DownSavePath: string;
  name: string;
  sizestr: string;
  DownState: string;
  IsDowning: boolean;
  IsCompleted: boolean;
  IsFailed: boolean;
  DownProcess: string;
  FailedMessage: string;
  DownSpeedStr: string;
}
export interface IStateDowned {
  DownID: string;
  icon: string;
  DownSavePath: string;
  name: string;
  sizestr: string;
  ariaRemote: boolean;
}

export interface IStateDownInfo {
  GID: string;
  userid: string;
  
  DownSavePath: string;
  ariaRemote: boolean;
  file_id: string;
  drive_id: string;
  name: string;
  size: number;
  sizestr: string;
  icon: string;
  isDir: boolean;
  sha1: string;
  crc64: string;
}

export interface IAriaDownProgress {
  gid: string;
  status: string;
  totalLength: string;
  completedLength: string;
  downloadSpeed: string;
  errorCode: string;
  errorMessage: string;
}

export interface IZtreeNode {
  open: boolean;
  checked: boolean;
  isParent: boolean;
  key: string;
  name: string;
  filename: string;
  filesha1: string;
  iconSkin: string;
  size: number;
  children?: IZtreeNode[];
}

export interface ILinkTxt {
  Key?: string;
  Name: string;
  Size: number;
  FileList: (ILinkTxtFile | string)[];
  DirList: ILinkTxt[];
}
export interface ILinkTxtFile {
  Key: string;
  Name: string;
  Size: number;
  Sha1: string;
}

export interface IStateUploadFile {
  UploadID: string;
  Info: {
    userid: string;
    localFilePath: string;
    parent_id: string;
    drive_id: string;

    path: string;
    name: string;
    size: number;
    sizestr: string;
    icon: string;
    isDir: boolean;
    isMiaoChuan: boolean;
    sha1: string;
    crc64: string;
  };
  Upload: {
    DownState: string;
    DownTime: number;
    DownSize: number;
    DownSpeed: number;
    DownSpeedStr: string;
    DownProcess: number;
    IsStop: boolean;
    IsDowning: boolean;
    IsCompleted: boolean;
    IsFailed: boolean;
    FailedCode: number;
    FailedMessage: string;
    AutoTry: number;
    upload_id: string;
    file_id: string;
  };
}
