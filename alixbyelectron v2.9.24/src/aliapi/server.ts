import axios, { AxiosResponse } from 'axios';
export interface IServerRespData {
  state: string;
  msg: string;
  [k: string]: any;
}
export default class ServerHttp {
  static baseapi = 'http://121.5.144.84:5282/';
  static appVersion = 'v2.9.24';
  static async PostToServer(postdata: any): Promise<IServerRespData> {
    postdata.appVersion = ServerHttp.appVersion;
    const str = JSON.stringify(postdata);
    if (window.postdataFunc) {
      let enstr = '';
      try {
        enstr = window.postdataFunc(str);
      } catch {
        return { state: 'error', msg: '联网失败' };
      }
      return ServerHttp.Post(enstr).catch(() => {
        return { state: 'error', msg: '网络错误' };
      });
    } else {
      return { state: 'error', msg: '程序错误' };
    }
  }

  static async Post(postdata: any, isfirst = true): Promise<IServerRespData> {
    const url = ServerHttp.baseapi + 'xby2';
    return axios
      .post(url, postdata, {
        responseType: 'arraybuffer',
        headers: {
          timeout: 30000,
        },
      })
      .then((response: AxiosResponse) => {
        if (response.status != 200) return { state: 'error', msg: '网络错误' };
        const buff = response.data as ArrayBuffer;
        const uint8array = new Uint8Array(buff);
        for (let i = 0; i < uint8array.byteLength; i++) {
          uint8array[i] ^= 9 + (i % 200);
        }
        const str = new TextDecoder().decode(uint8array);
        return JSON.parse(str) as IServerRespData;
      })
      .catch(() => {
        return { state: 'error', msg: '网络错误' };
      })
      .then((resp) => {
        if (resp.state == 'error' && resp.msg == '网络错误' && isfirst == true) {
          return ServerHttp.Sleep(2000).then(() => {
            return ServerHttp.Post(postdata, false);
          });
        } else return resp;
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
