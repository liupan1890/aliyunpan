export interface ITokenInfo {
  tokenfrom: 'token' | 'account'

  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  user_id: string
  user_name: string
  avatar: string
  nick_name: string
  default_drive_id: string
  default_sbox_drive_id: string
  role: string
  status: string
  expire_time: string
  state: string
  pin_setup: boolean
  is_first_login: boolean
  need_rp_verify: boolean

  name: string
  spu_id: string
  is_expires: boolean
  used_size: number
  total_size: number
  spaceinfo: string

  pic_drive_id: string
}

export interface IStateDownFile {
  DownID: string
  Info: IStateDownInfo
  Down: {
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
    FailedCode: number
    FailedMessage: string
    AutoTry: number
    DownUrl: string
  }
}
export interface IStateDownInfo {
  GID: string
  user_id: string
  DownSavePath: string
  ariaRemote: boolean
  file_id: string
  drive_id: string
  name: string
  size: number
  sizestr: string
  icon: string
  isDir: boolean
  sha1: string
  crc64: string
}

export interface IStateUploadFile {
  UploadID: string
  Info: {
    user_id: string
    localFilePath: string
    parent_id: string
    drive_id: string

    path: string
    name: string
    size: number
    sizestr: string
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
    FailedCode: number
    FailedMessage: string
    AutoTry: number
    upload_id: string
    file_id: string
    IsBreakExist: boolean
  }
}

export interface IShareLinkModel {
  share_id: string
  share_name: string
  share_pwd: string
  expiration: string
  expired: boolean
  share_msg: string
  updated_at: string
  logtime?: number
}

export interface IAriaDownProgress {
  gid: string
  status: string
  totalLength: string
  completedLength: string
  downloadSpeed: string
  errorCode: string
  errorMessage: string
}
export interface IStateSelectedItem {
  drive_id: string
  parent_id: string
  file_id: string
}
