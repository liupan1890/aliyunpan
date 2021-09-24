import axios, { AxiosResponse } from 'axios';
import { ITokenInfo } from 'src/store/models';
import AliUser from './user';
import jschardet from 'jschardet';
import { NotifyError } from './notify';
export interface IUrlRespData {
  code: number;
  header: string;
  body: any;
}
function BlobToString(body: Blob, encoding: string): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsText(body, encoding);
    reader.onload = function () {
      resolve((reader.result as string) || '');
    };
  });
}

function BlobToBuff(body: Blob): Promise<ArrayBuffer | undefined> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(body);
    reader.onload = function () {
      resolve(reader.result as ArrayBuffer);
    };
  });
}

function HttpCodeBreak(code: number) {
  if (code >= 200 && code <= 300) return true; 
  if (code == 400) return true; 
  if (code == 401) return true; 
  if (code == 403) return true; 
  if (code == 404) return true; 
  if (code == 409) return true; 
  return false;
}
function HttpCodeRetry(code: number) {
  if (code == 429) return true; 
  if (code == 500) return true; 
  if (code == 501) return true; 
  if (code == 502) return true; 
  if (code == 503) return true; 
  return false;
}
const isdebughttp = false;
export default class AliHttp {
  static baseapi = 'https://api.aliyundrive.com/';

  static Get(url: string, token: ITokenInfo, isfirst = true): Promise<IUrlRespData> {
    if (url.startsWith('http') == false) url = AliHttp.baseapi + url;

    return axios
      .get(url, {
        withCredentials: false,
        responseType: 'json',
        headers: {
          timeout: 30000,
          Authorization: token.token_type + ' ' + token.access_token,
        },
      })
      .then((response: AxiosResponse) => {
        return {
          code: response.status,
          header: JSON.stringify(response.headers),
          body: response.data,
        };
      })
      .catch(function (error) {
        if (isdebughttp) console.log('CALLURLError ', error);
        if (error.response) {

          if (error.response.status == 401) {
            return AliUser.ApiTokenRefresh(token).then((data) => {
              if (data) {
                return AliHttp.Get(url, token, true);
              } else {
                NotifyError('账号 ' + token.user_name + ' ' + token.nick_name + ' 需要退出后重新登录');

                return {
                  code: 401,
                  header: '',
                  body: 'NetError 账号需要重新登录',
                };
              }
            });
          }
          return {
            code: error.response.status,
            header: error.response.headers,
            body: error.response.data,
          };
        } else if (error.request) {
          return {
            code: 600,
            header: '',
            body: 'NetError ' + error.message,
          };
        } else {
          if (isdebughttp) console.log('Error', error.message);
          return {
            code: 601,
            header: '',
            body: 'NetError ' + error.message,
          };
        }
      })
      .then((resp) => {
        if (HttpCodeBreak(resp.code) || isfirst == false) return resp;
        return AliHttp.Sleep(2000).then(() => {
          return AliHttp.Get(url, token, HttpCodeRetry(resp.code));
        });
      });
  }
  static GetString(url: string, token: ITokenInfo, isfirst = true, filesize: number, maxsize: number): Promise<IUrlRespData> {
    if (url.startsWith('http') == false) url = AliHttp.baseapi + url;

    return axios
      .get(url, {
        withCredentials: false,
        responseType: 'blob',
        headers: {
          timeout: 30000,
          Authorization: token.token_type + ' ' + token.access_token,
          Range: 'bytes=0-' + (Math.min(filesize, maxsize) - 1).toString(),
        },
      })
      .then((response: AxiosResponse) => {
        const data = response.data as Blob;
        if (data.size == 0) {
          response.data = '文件是空的';
          return response;
        }
        const test = data.slice(0, data.size > 10240 ? 10240 : data.size - 1);
        return BlobToBuff(test).then((abuff: ArrayBuffer | undefined) => {
          let encoding = 'utf-8';
          if (abuff != undefined && abuff.byteLength > 3) {
            const buff = Buffer.from(abuff);
            if (buff[0].toString(16).toLowerCase() == 'ef' && buff[1].toString(16).toLowerCase() == 'bb' && buff[2].toString(16).toLowerCase() == 'bf') {
              //ok
              encoding = 'utf-8';
            } else if (buff[0] == 239 && buff[1] == 191 && buff[2] == 189) {
              encoding = 'GB2312';
            } else {
              const info = jschardet.detect(buff);
              encoding = info.encoding;
              if (encoding == 'ascii') encoding = 'utf-8';
            }
          }
          return BlobToString(data, encoding).then((str) => {
            response.data = str;
            return response;
          });
        });
      })
      .then((response: AxiosResponse) => {
        const r = {
          code: response.status,
          header: JSON.stringify(response.headers),
          body: response.data,
        };

        if (typeof r.body === 'string' && r.body.length > 5) {
          if (r.body.indexOf('{') >= 0 && r.body.indexOf(':') > 0 && r.body.indexOf('}') > 0 && r.body.indexOf('"') > 0) {
            try {
              r.body = JSON.stringify(JSON.parse(r.body), undefined, 2);
            } catch {} 
          }
        }
        return r;
      })
      .catch(function (error) {
        if (isdebughttp) console.log('CALLURLError ', error);
        if (error.response) {

          if (error.response.status == 401) {
            return AliUser.ApiTokenRefresh(token).then((data) => {
              if (data) {
                return AliHttp.GetString(url, token, true, filesize, maxsize);
              } else {
                NotifyError('账号 ' + token.user_name + ' ' + token.nick_name + ' 需要退出后重新登录');
                return {
                  code: 401,
                  header: '',
                  body: 'NetError 账号需要重新登录',
                };
              }
            });
          }
          return {
            code: error.response.status,
            header: error.response.headers,
            body: error.response.data,
          };
        } else if (error.request) {
         
          return {
            code: 600,
            header: '',
            body: 'NetError ' + error.message,
          };
        } else {
          
          if (isdebughttp) console.log('Error', error.message);
          return {
            code: 601,
            header: '',
            body: 'NetError ' + error.message,
          };
        }
      })
      .then((resp) => {
        if (HttpCodeBreak(resp.code) || isfirst == false) return resp;
        return AliHttp.Sleep(2000).then(() => {
          return AliHttp.GetString(url, token, HttpCodeRetry(resp.code), filesize, maxsize);
        });
      });
  }
  static Down(url: string, token: ITokenInfo, isfirst = true): Promise<IUrlRespData> {
    if (url.startsWith('http') == false) url = AliHttp.baseapi + url;

    return axios
      .get(url, {
        withCredentials: false,
        responseType: 'blob',
        headers: {
          timeout: 30000,
          Authorization: token.token_type + ' ' + token.access_token,
        },
      })
      .then((response: AxiosResponse) => {
        return {
          code: response.status,
          header: JSON.stringify(response.headers),
          body: response.data,
        };
      })
      .catch(function (error) {
        if (isdebughttp) console.log('CALLURLError ', error);
        if (error.response) {

          if (error.response.status == 401) {
            return AliUser.ApiTokenRefresh(token).then((data) => {
              if (data) {
                return AliHttp.Down(url, token, true);
              } else {
                NotifyError('账号 ' + token.user_name + ' ' + token.nick_name + ' 需要退出后重新登录');
                return {
                  code: 401,
                  header: '',
                  body: 'NetError 账号需要重新登录',
                };
              }
            });
          }
          return {
            code: error.response.status,
            header: error.response.headers,
            body: error.response.data,
          };
        } else if (error.request) {
         
          return {
            code: 600,
            header: '',
            body: 'NetError ' + error.message,
          };
        } else {
          if (isdebughttp) console.log('Error', error.message);
          return {
            code: 601,
            header: '',
            body: 'NetError ' + error.message,
          };
        }
      })
      .then((resp) => {
        if (HttpCodeBreak(resp.code) || isfirst == false) return resp;
        return AliHttp.Sleep(2000).then(() => {
          return AliHttp.Down(url, token, HttpCodeRetry(resp.code));
        });
      });
  }

  static Post(url: string, postdata: any, token: ITokenInfo, isfirst = true): Promise<IUrlRespData> {
    if (url.startsWith('http') == false) url = AliHttp.baseapi + url;

    return axios
      .post(url, postdata, {
        withCredentials: false,
        responseType: 'json',
        headers: {
          timeout: 30000,
          Authorization: token.token_type + ' ' + token.access_token,
          'x-share-token': token.share_token || '',
        },
      })
      .then((response: AxiosResponse) => {
        return {
          code: response.status,
          header: JSON.stringify(response.headers),
          body: response.data,
        };
      })
      .catch(function (error) {
        if (isdebughttp) console.log('CALLURLError ', error);
        if (error.response) {

          if (error.response.status == 401) {
            return AliUser.ApiTokenRefresh(token).then((data) => {
              if (data) {
                return AliHttp.Post(url, postdata, token, true);
              } else {
                NotifyError('账号 ' + token.user_name + ' ' + token.nick_name + ' 需要退出后重新登录');
                return {
                  code: 401,
                  header: '',
                  body: 'NetError 账号需要重新登录',
                };
              }
            });
          }
          return {
            code: error.response.status,
            header: error.response.headers,
            body: error.response.data,
          };
        } else if (error.request) {
          
          return {
            code: 600,
            header: '',
            body: 'NetError ' + error.message,
          };
        } else {
          if (isdebughttp) console.log('Error', error.message);
          return {
            code: 601,
            header: '',
            body: 'NetError ' + error.message,
          };
        }
      })
      .then((resp) => {
        if (HttpCodeBreak(resp.code) || isfirst == false) return resp;
        return AliHttp.Sleep(2000).then(() => {
          return AliHttp.Post(url, postdata, token, HttpCodeRetry(resp.code));
        });
      });
  }

  static Sleep(msTime: number) {
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
}
