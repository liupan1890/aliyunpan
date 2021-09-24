import { IStateUploadFile, ITokenInfo } from 'src/store/models';
import AliHttp from './alihttp';
import { IUploadCreat } from './models';
import { createSHA1, sha1, md5 } from 'hash-wasm';
import HashWorker from 'worker-loader!./hash.worker';
import axios from 'axios';
import { FileHandle } from 'fs/promises';
import AliUser from './user';
import { DB } from 'src/store';
const fspromises = window.require('fs/promises');
function IsSuccess(code: number) {
  return code >= 200 && code <= 300;
}
const sha1list: Map<string, number> = new Map();
const filelist: Map<string, number> = new Map();
function Sleep(msTime: number) {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          success: true,
          time: msTime,
        }),
      msTime
    )
  );
}
export default class AliUpload {
  static async UploadCreatFile(drive_id: string, parentid: string, name: string, size: number, hash: string, prehash: string, token: ITokenInfo): Promise<IUploadCreat> {
    drive_id = drive_id == 'pan' || drive_id == token.default_drive_id ? token.default_drive_id : token.pic_drive_id;
    //const url = 'https://api.aliyundrive.com/adrive/v2/file/createWithFolders';
    const url = 'v2/file/create';
    const postdata: {
      drive_id: string;
      parent_file_id: string;
      name: string;
      type: string;
      check_name_mode: string;
      size: number;
      content_hash?: string;
      content_hash_name?: string;
      proof_code?: string;
      proof_version?: string;
      pre_hash?: string;
    } = {
      drive_id,
      parent_file_id: parentid,
      name,
      type: 'file',
      check_name_mode: 'refuse',
      size,
    };

    if (hash != '') {
      postdata.content_hash = hash.toUpperCase();
      postdata.content_hash_name = 'sha1';
    } else {
      postdata.pre_hash = prehash;
    }
    const resp = await AliHttp.Post(url, postdata, token);
    const result: IUploadCreat = {
      israpid: false,
      upload_id: '',
      file_id: '',
      part_info_list: [],
      errormsg: '',
    };

    if (typeof resp.body === 'object' && JSON.stringify(resp.body).indexOf('file size is exceed') > 0) {
      result.errormsg = '创建文件失败(单文件最大2TB)';
      return result;
    }
    if (resp.body.code && resp.body.code == 'PreHashMatched') {
      result.errormsg = 'PreHashMatched'; 
      return result;
    }
    if (resp.body.code && resp.body.code == 'QuotaExhausted.Drive') {
      result.errormsg = '网盘空间已满保存文件失败'; 
      return result;
    }
    if (IsSuccess(resp.code)) {
      result.file_id = resp.body.file_id;

      if (resp.body.exist) {
        const issame = await AliUpload.UploadFileCheckHash(drive_id, result.file_id, hash, token); 
        if (issame == false) {
          await AliUpload.UploadFileDelete(drive_id, result.file_id, token); 
          return await AliUpload.UploadCreatFile(drive_id, parentid, name, size, hash, prehash, token); 
        }
      }
      result.israpid = resp.body.rapid_upload || resp.body.exist || false; 
      result.upload_id = resp.body.upload_id || '';
      if (resp.body.part_info_list && resp.body.part_info_list.length > 0) {
        for (let i = 0; i < resp.body.part_info_list.length; i++) {
          const item = resp.body.part_info_list[i];
          result.part_info_list.push({ upload_url: item.upload_url, part_number: item.part_number, isupload: false });
        }
      }
      return result;
    } else {
      result.errormsg = '创建文件失败' + resp.code.toString();
      return result;
    }
  }
  static async UploadCreatFileWithFolders(drive_id: string, parentid: string, name: string, size: number, hash: string, proof_code: string, prehash: string, token: ITokenInfo): Promise<IUploadCreat> {
    drive_id = drive_id == 'pan' || drive_id == token.default_drive_id ? token.default_drive_id : token.pic_drive_id;
    const url = 'https://api.aliyundrive.com/adrive/v2/file/createWithFolders';
    const postdata: {
      drive_id: string;
      parent_file_id: string;
      name: string;
      type: string;
      check_name_mode: string;
      size: number;
      content_hash?: string;
      content_hash_name?: string;
      proof_code?: string;
      proof_version?: string;
      pre_hash?: string;
      part_info_list: { part_number: number }[];
    } = {
      drive_id,
      parent_file_id: parentid,
      name,
      type: 'file',
      check_name_mode: 'refuse',
      size,
      part_info_list: [],
    };

    if (hash != '') {
      postdata.content_hash = hash.toUpperCase();
      postdata.content_hash_name = 'sha1';
      postdata.proof_version = 'v1';
      postdata.proof_code = proof_code;
    } else {
      postdata.pre_hash = prehash;
    }
    let partindex = 0;
    while (partindex * 10485760 < size) {
      postdata.part_info_list.push({ part_number: partindex + 1 });
      partindex++;
    }

    const resp = await AliHttp.Post(url, postdata, token);
    const result: IUploadCreat = {
      israpid: false,
      upload_id: '',
      file_id: '',
      part_info_list: [],
      errormsg: '',
    };

    if (typeof resp.body === 'object' && JSON.stringify(resp.body).indexOf('file size is exceed') > 0) {
      result.errormsg = '创建文件失败(单文件最大2TB)';
      return result;
    }
    if (resp.body.code) {
      //
      if (resp.body.code == 'PreHashMatched') result.errormsg = 'PreHashMatched';
      else if (resp.body.code == 'QuotaExhausted.Drive') result.errormsg = '创建文件失败，网盘空间已满';
      else if (resp.body.code == 'InvalidRapidProof') {
        await AliUser.ApiTokenRefresh(token);
        result.errormsg = resp.body.code;
      } else result.errormsg = resp.body.code;
      return result;
    }
    if (IsSuccess(resp.code)) {
      result.file_id = resp.body.file_id;

      if (resp.body.exist) {
        const issame = await AliUpload.UploadFileCheckHash(drive_id, result.file_id, hash, token);
        if (issame == false) {
          await AliUpload.UploadFileDelete(drive_id, result.file_id, token); 
          return await AliUpload.UploadCreatFileWithFolders(drive_id, parentid, name, size, hash, proof_code, prehash, token); 
        }
      }
      result.israpid = resp.body.rapid_upload || resp.body.exist || false; 
      result.upload_id = resp.body.upload_id || '';
      if (resp.body.part_info_list && resp.body.part_info_list.length > 0) {
        for (let i = 0; i < resp.body.part_info_list.length; i++) {
          const item = resp.body.part_info_list[i];
          result.part_info_list.push({ upload_url: item.upload_url, part_number: item.part_number, isupload: false });
        }
      }
      return result;
    } else {
      result.errormsg = '创建文件失败' + resp.code.toString();
      return result;
    }
  }
  static async UploadFileCheckHash(drive_id: string, file_id: string, hash: string, token: ITokenInfo): Promise<boolean> {
    drive_id = drive_id == 'pan' || drive_id == token.default_drive_id ? token.default_drive_id : token.pic_drive_id;
    const url = 'v2/file/get';
    const postdata = {
      drive_id: drive_id,
      file_id: file_id,
    };
    const resp = await AliHttp.Post(url, postdata, token);
    if (IsSuccess(resp.code)) {
      const content_hash = resp.body.content_hash.toUpperCase();
      hash = hash.toUpperCase();
      return hash === content_hash;
    } else return false;
  }

  static async UploadFileDelete(drive_id: string, file_id: string, token: ITokenInfo): Promise<boolean> {
    drive_id = drive_id == 'pan' || drive_id == token.default_drive_id ? token.default_drive_id : token.pic_drive_id;
    const url = 'v2/recyclebin/trash';
    const postdata = {
      drive_id: drive_id,
      file_id: file_id,
    };
    const resp = await AliHttp.Post(url, postdata, token);
    if (IsSuccess(resp.code)) {
      return true;
    } else return false;
  }

  static async UploadFileComplete(drive_id: string, file_id: string, upload_id: string, filesize: number, token: ITokenInfo): Promise<boolean> {
    drive_id = drive_id == 'pan' || drive_id == token.default_drive_id ? token.default_drive_id : token.pic_drive_id;
    const url = 'v2/file/complete';
    const postdata: {
      drive_id: string;
      upload_id: string;
      file_id: string;
    } = {
      drive_id: drive_id,
      upload_id: upload_id,
      file_id: file_id,
    };
    const resp = await AliHttp.Post(url, postdata, token);
    if (IsSuccess(resp.code)) {
      if (resp.body.size == filesize) return true;
      else {
        await AliUpload.DeleteFile(drive_id, file_id, token);
        return false;
      }
    } else return false;
  }

  static async DeleteFile(drive_id: string, file_id: string, token: ITokenInfo): Promise<boolean> {
    drive_id = drive_id == 'pan' || drive_id == token.default_drive_id ? token.default_drive_id : token.pic_drive_id;
    const url = 'v2/file/delete';
    const postdata = {
      drive_id: drive_id,
      file_id: file_id,
      permanently: true,
    };
    const resp = await AliHttp.Post(url, postdata, token);
    if (IsSuccess(resp.code)) {
      return true;
    } else return false;
  }

  static async UploadFilePartUrl(drive_id: string, file_id: string, upload_id: string, filesize: number, result: IUploadCreat, token: ITokenInfo) {
    drive_id = drive_id == 'pan' || drive_id == token.default_drive_id ? token.default_drive_id : token.pic_drive_id;
    const url = 'v2/file/get_upload_url';
    const postdata: {
      drive_id: string;
      upload_id: string;
      file_id: string;
      part_info_list: { part_number: number }[];
    } = {
      drive_id: drive_id,
      upload_id: upload_id,
      file_id: file_id,
      part_info_list: [],
    };
    let partindex = 0;

    while (partindex * 10485760 < filesize) {
      postdata.part_info_list.push({ part_number: partindex + 1 });
      partindex++;
    }

    const resp = await AliHttp.Post(url, postdata, token);
    if (IsSuccess(resp.code)) {
      if (resp.body.part_info_list && resp.body.part_info_list.length > 0) {
        if (result.part_info_list.length == 0) {
          for (let i = 0; i < resp.body.part_info_list.length; i++) {
            const item = resp.body.part_info_list[i];
            result.part_info_list.push({ upload_url: item.upload_url, part_number: item.part_number, isupload: false });
          }
        } else {
          for (let i = 0; i < resp.body.part_info_list.length; i++) {
            const item = resp.body.part_info_list[i];
            result.part_info_list[item.part_number - 1].upload_url = item.upload_url;
          }
        }
      }
    }
  }

  static async UploadFilePartUrlFinished(drive_id: string, file_id: string, upload_id: string, part_number_marker: number, result: IUploadCreat, token: ITokenInfo) {
    drive_id = drive_id == 'pan' || drive_id == token.default_drive_id ? token.default_drive_id : token.pic_drive_id;
    const url = 'v2/file/list_uploaded_parts';
    const postdata: {
      drive_id: string;
      upload_id: string;
      file_id: string;
      part_number_marker: number;
    } = {
      drive_id: drive_id,
      upload_id: upload_id,
      file_id: file_id,
      part_number_marker, 
    };

    const resp = await AliHttp.Post(url, postdata, token);
    if (IsSuccess(resp.code)) {
      if (resp.body.uploaded_parts && resp.body.uploaded_parts.length > 0) {
        for (let i = 0; i < resp.body.uploaded_parts.length; i++) {
          const item = resp.body.uploaded_parts[i];
          const part_number = item.part_number;
          result.part_info_list[part_number - 1].isupload = true;
        }
      }
      if (resp.body.next_part_number_marker && parseInt(resp.body.next_part_number_marker) > 0) {
        const next = parseInt(resp.body.next_part_number_marker);
        await AliUpload.UploadFilePartUrlFinished(drive_id, file_id, upload_id, next, result, token);
      }
    }
  }

  static async GetFileHash(filepath: string, size: number): Promise<string> {
    let hash = '';
    if (size == 0) return 'DA39A3EE5E6B4B0D3255BFEF95601890AFD80709';
    const sha1 = await createSHA1();
    sha1.init();
    const filehandle = await fspromises.open(filepath, 'r');
    if (filehandle) {
      const buff = Buffer.alloc(64 * 1024);
      while (true) {
        const len = await filehandle.read(buff, 0, buff.length, null);
        if (len.bytesRead > 0 && len.bytesRead == buff.length) {
          sha1.update(buff);
        } else if (len.bytesRead > 0) {
          sha1.update(buff.slice(0, len.bytesRead));
        }
        if (len.bytesRead <= 0) break;
      }
      hash = sha1.digest('hex');
      hash = hash.toUpperCase();
      await filehandle?.close();
    } else {
      hash = 'error';
    }
    return hash;
  }
  static async GetFilePreHash(filepath: string): Promise<string> {
    let hash = '';
    const filehandle = await fspromises.open(filepath, 'r');
    if (filehandle) {
      const buff = Buffer.alloc(1024);
      await filehandle.read(buff, 0, buff.length, null);
      hash = await sha1(buff);
      hash = hash.toUpperCase();
      await filehandle?.close();
    } else {
      hash = 'error';
    }
    return hash;
  }

  static async GetBuffHash(buff: Buffer): Promise<string> {
    if (buff.length == 0) return 'DA39A3EE5E6B4B0D3255BFEF95601890AFD80709';
    const hash = await sha1(buff);
    return hash.toUpperCase();
  }
  static async GetBuffHashProof(access_token: string, buff: Buffer) {
    if (buff.length == 0) return { sha1: 'DA39A3EE5E6B4B0D3255BFEF95601890AFD80709', proof_code: '' };
    let hash = await sha1(buff);
    hash = hash.toUpperCase();
    const m = unescape(encodeURIComponent(access_token));
    const buffa = Buffer.from(m);
    const md5a = await md5(buffa);
    const start = Number(BigInt('0x' + md5a.substr(0, 16)) % BigInt(buff.length));
    const end = Math.min(start + 8, buff.length);
    const buffb = buff.slice(start, end);
    const proof_code = buffb.toString('base64');

    return { sha1: hash, proof_code };
  }

  static GetFileHashProofSpeed(UploadID: string) {
    return sha1list.get(UploadID) || 0;
  }
  static async GetFileHashProof(access_token: string, file: IStateUploadFile) {
    let hash = '';
    let proof_code = '';
    const size = file.Info.size;
    if (size == 0) return { sha1: 'DA39A3EE5E6B4B0D3255BFEF95601890AFD80709', proof_code: '' };

    if (size > 1024 * 1024 * 20) return this.GetFileHashProofBig(access_token, file); 

    file.Upload.FailedMessage = '等待计算sha1';

    const sha1 = await createSHA1();
    sha1.init();
    const filehandle = await fspromises.open(file.Info.localFilePath, 'r');
    if (filehandle) {
      const buff = Buffer.alloc(256 * 1024);
      let readlen = 0;
      while (true) {
        if (file.Upload.DownState !== 'active') break;
        const len = await filehandle.read(buff, 0, buff.length, null);
        if (len.bytesRead > 0 && len.bytesRead == buff.length) {
          sha1.update(buff);
        } else if (len.bytesRead > 0) {
          sha1.update(buff.slice(0, len.bytesRead));
        }
        readlen += len.bytesRead;
        file.Upload.FailedMessage = '计算sha1(' + Math.floor((readlen * 100) / size).toString() + '%)';
        if (len.bytesRead <= 0) break;
      }
      if (file.Upload.DownState == 'active') {
        hash = sha1.digest('hex');
        hash = hash.toUpperCase();
        const m = unescape(encodeURIComponent(access_token));
        const buffa = Buffer.from(m);
        const md5a = await md5(buffa);
        const start = Number(BigInt('0x' + md5a.substr(0, 16)) % BigInt(size));
        const end = Math.min(start + 8, size);
        const buffb = Buffer.alloc(end - start);
        await filehandle.read(buffb, 0, buffb.length, start);
        proof_code = buffb.toString('base64');
      } else {
        hash = 'error';
        proof_code = '';
      }
      await filehandle?.close();
      file.Upload.FailedMessage = '';
      return { sha1: hash, proof_code };
    } else {
      file.Upload.FailedMessage = '';
      return { sha1: 'error', proof_code: '' };
    }
  }

  static async GetFileHashProofBig(access_token: string, file: IStateUploadFile) {
    let hash = '';
    let proof_code = '';
    const size = file.Info.size;
    if (size == 0) return { sha1: 'DA39A3EE5E6B4B0D3255BFEF95601890AFD80709', proof_code: '' };
    file.Upload.FailedMessage = '等待计算sha1';
    while (sha1list.size > 2) {
      await Sleep(200);
    }
    sha1list.set(file.UploadID, 0);
    file.Upload.DownSize = 0; 
    await new Promise((resolve) => {
      const worker: any = new HashWorker();
      worker.postMessage({ hash: 'sha1', localFilePath: file.Info.localFilePath, access_token });
      worker.addEventListener('message', (event: any) => {
        if (event.data.hash == 'sha1') {
          if (event.data.readlen) {
            if (file.Upload.DownState !== 'active') worker.postMessage({ stop: true }); 
            sha1list.set(file.UploadID, event.data.readlen as number);
            file.Upload.FailedMessage = event.data.message;
            file.Info.size = event.data.size as number;
          }
          if (event.data.sha1) {
            hash = event.data.sha1;
            proof_code = event.data.proof_code;
            resolve(null);
          }
        }
      });
    });
    sha1list.delete(file.UploadID);
    file.Upload.DownSize = 0;
    file.Upload.FailedMessage = '';
    if (file.Upload.DownState !== 'active') return { sha1: 'error', proof_code: '' };
    return { sha1: hash, proof_code };
  }

  static GetUploadIDHex(full: string) {
    const buffa = Buffer.from(full);

    let h1b, k1;

    const remainder = buffa.length & 3; 
    const bytes = buffa.length - remainder;
    let h1 = 0;
    const c1 = 0xcc9e2d51;
    const c2 = 0x1b873593;
    let i = 0;

    while (i < bytes) {
      k1 = buffa.readUInt8(i) | (buffa.readUInt8(++i) << 8) | (buffa.readUInt8(++i) << 16) | (buffa.readUInt8(++i) << 24);
      ++i;
      k1 = ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 = ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
      h1 ^= k1;
      h1 = (h1 << 13) | (h1 >>> 19);
      h1b = ((h1 & 0xffff) * 5 + ((((h1 >>> 16) * 5) & 0xffff) << 16)) & 0xffffffff;
      h1 = (h1b & 0xffff) + 0x6b64 + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16);
    }

    k1 = 0;
    switch (remainder) {
      case 3:
        k1 ^= buffa.readUInt8(i + 2) << 16;
      case 2:
        k1 ^= buffa.readUInt8(i + 1) << 8;
      case 1:
        k1 ^= buffa.readUInt8(i);
        k1 = ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
        h1 ^= k1;
    }

    h1 ^= buffa.length;
    h1 ^= h1 >>> 16;
    h1 = ((h1 & 0xffff) * 0x85ebca6b + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
    h1 ^= h1 >>> 13;
    h1 = ((h1 & 0xffff) * 0xc2b2ae35 + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16)) & 0xffffffff;
    h1 ^= h1 >>> 16;
    return (h1 >>> 0).toString(16);
  }
  static GetFileUploadProofSpeed(UploadID: string) {
    return filelist.get(UploadID) || 0;
  }
  static async UploadOneFile(uploadinfo: IUploadCreat, file: IStateUploadFile, token: ITokenInfo): Promise<string> {
    if (uploadinfo.part_info_list.length > 1) return AliUpload.UploadOneFileBig(uploadinfo, file, token); //10MB 分片上传
    const upload_url = uploadinfo.part_info_list[0].upload_url;
    const filehandle = await fspromises.open(file.Info.localFilePath, 'r').catch(() => {
      return undefined;
    });
    if (!filehandle) return '打开文件失败，请重试';
    filelist.set(file.UploadID, 0);
    let isok = '';
    for (let j = 0; j < 3; j++) {
      isok = await AliUpload.UploadOneFilePart(file.UploadID, filehandle, 0, file.Info.size, upload_url, token);
      if (isok == 'success') {
        break;
      }
    }
    await filehandle?.close();
    filelist.delete(file.UploadID);
    return AliUpload.UploadFileComplete(file.Info.drive_id, file.Upload.file_id, file.Upload.upload_id, file.Info.size, token)
      .then((issuccess) => {
        if (issuccess) return 'success';
        else return '合并文件时出错，请重试';
      })
      .catch(() => {
        return '合并文件时出错，请重试';
      });
  }

  static UploadOneFilePart(UploadID: string, filehandle: FileHandle, partstart: number, partsize: number, upload_url: string, token: ITokenInfo) {
    const buff = Buffer.alloc(partsize);

    return filehandle
      .read(buff, 0, buff.length, partstart)
      .then((len: any) => {
        if (len && len.bytesRead == partsize) {
          return axios
            .put(upload_url, buff, {
              responseType: 'text',
              headers: {
                //timeout: 60000,
                'Content-Type': '',
                Authorization: token.token_type + ' ' + token.access_token,
              },
              onUploadProgress: function (progressEvent: ProgressEvent) {
                filelist.set(UploadID, partstart + progressEvent.loaded);
              },
            })
            .then(() => {
              return 'success';
            })
            .catch(function (error) {
              if (error.response?.status == 409 && error.response?.data && error.response?.data.indexOf('PartAlreadyExist') > 0) {
                return 'success'; 
              }
              return '网络错误 ' + error.toString() + '，请重试';
            });
        } else {
          return '读取文件数据失败，请重试';
        }
      })
      .catch(() => {
        return '读取文件数据失败，请重试';
      });
  }

  static async UploadOneFileBig(uploadinfo: IUploadCreat, file: IStateUploadFile, token: ITokenInfo): Promise<string> {
    filelist.set(file.UploadID, 0);
    const filehandle = await fspromises.open(file.Info.localFilePath, 'r').catch(() => {
      return undefined;
    });
    if (!filehandle) return '打开文件失败，请重试';
    const filesize = file.Info.size;
    for (let i = 0; i < uploadinfo.part_info_list.length; i++) {
      let part = uploadinfo.part_info_list[i];
      const partstart = (part.part_number - 1) * 10485760;
      const partend = partstart + 10485760;
      const part_size = partend > filesize ? filesize - partstart : 10485760;

      if (part.isupload) {
        filelist.set(file.UploadID, partstart + part_size); 
      } else {

        const url = part.upload_url;
        let expires = url.substr(url.indexOf('x-oss-expires=') + 'x-oss-expires='.length);
        expires = expires.substr(0, expires.indexOf('&'));
        const lasttime = parseInt(expires) - Date.now() / 1000; 

        if (lasttime < 5 * 60) {
          await AliUpload.UploadFilePartUrl(file.Info.drive_id, file.Upload.file_id, file.Upload.upload_id, file.Info.size, uploadinfo, token);
          part = uploadinfo.part_info_list[i];
        }
        let isok = '';
        for (let j = 0; j < 3; j++) {
          isok = await AliUpload.UploadOneFilePart(file.UploadID, filehandle, partstart, part_size, part.upload_url, token);
          if (isok == 'success') {
            part.isupload = true;
            break;
          }
          if (file.Upload.DownState != 'active') break; 
        }
        if (file.Upload.DownState != 'active') break; 
        if (part.isupload == false) {
          await filehandle?.close();
          filelist.delete(file.UploadID);
          return isok; 
        }
      }
    }
    await filehandle?.close();
    filelist.delete(file.UploadID);
    if (file.Upload.DownState != 'active') return ''; 

    for (let i = 0; i < uploadinfo.part_info_list.length; i++) {
      if (uploadinfo.part_info_list[i].isupload == false) {
        return '有分片上传失败，请重试'; 
      }
    }
    token = (await DB.getUser(token.user_id)) || token;
    return AliUpload.UploadFileComplete(file.Info.drive_id, file.Upload.file_id, file.Upload.upload_id, file.Info.size, token)
      .then((issuccess) => {
        if (issuccess) return 'success';
        else return '合并文件时出错，请重试';
      })
      .catch(() => {
        return '合并文件时出错，请重试';
      });
  }
}
