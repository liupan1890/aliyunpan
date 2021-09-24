export interface IDownloadUrl {
  drive_id: string;
  file_id: string;
  expire_sec: number;
  url: string;
  size: number;
}

export interface IOfficePreViewUrl {
  drive_id: string;
  file_id: string;
  access_token: string;
  preview_url: string;
}

export interface IVideoXBTUrl {
  time: string;
  url: string;
}

export interface IUploadCreat {
  israpid: boolean;
  upload_id: string;
  file_id: string;
  part_info_list: {
    upload_url: string;
    part_number: number;
    isupload: boolean;
  }[];
  errormsg: string;
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
  }[];
}
