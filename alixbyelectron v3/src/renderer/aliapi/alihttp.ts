import SettingLog from '@/setting/settinglog'
import { ITokenInfo } from '@/store/models'
import UserDAL from '@/store/userdal'
import { message } from 'antd'
import axios, { AxiosRequestHeaders, AxiosResponse } from 'axios'
import jschardet from 'jschardet'
import AliUser from './user'

export interface IUrlRespData {
  code: number
  header: string
  body: any
}
function BlobToString(body: Blob, encoding: string): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsText(body, encoding)
    reader.onload = function () {
      resolve((reader.result as string) || '')
    }
  })
}

function BlobToBuff(body: Blob): Promise<ArrayBuffer | undefined> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsArrayBuffer(body)
    reader.onload = function () {
      resolve(reader.result as ArrayBuffer)
    }
  })
}

function HttpCodeBreak(code: number) {
  if (code >= 200 && code <= 300) return true
  if (code == 400) return true
  if (code >= 402 && code <= 428) return true
  if (code == 403) return true
  if (code == 404) return true
  if (code == 409) return true
  return false
}

function HttpCodeRetry(code: number) {
  if (code == 429) return true
  if (code == 500) return true
  if (code == 501) return true
  if (code == 502) return true
  if (code == 503) return true
  return false
}

function Sleep(msTime: number) {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          success: true,
          time: msTime
        }),
      msTime
    )
  )
}

const isdebughttp = false
export default class AliHttp {
  static LimitMax = 100
  static baseapi = 'https://api.aliyundrive.com/'

  static CatchError(error: any, token: ITokenInfo | undefined) {
    try {
      if (isdebughttp) console.log('CALLURLError ', error)
      let errormessage = error.message || ''
      if (error.response) {
        let islog = true
        if (error.response.status == 429) islog = false
        if (error.response.data) {
          if (error.response.data.code == 'InvalidParameter.Limit') islog = false
          if (error.response.data.code == 'ForbiddenFileInTheRecycleBin') islog = false
          if (error.response.data.code == 'PreHashMatched') islog = false
          if (error.response.data.code == 'InvalidResource.SharePwd') islog = false
          if (error.response.data.code == 'ShareLink.Expired') islog = false
          if (error.response.data.code == 'FileShareNotAllowed') islog = false
        }
        if (islog) SettingLog.mSaveLog('warning', 'HttpError4 status=' + error.response.status + ' code=' + error.response.data?.code + ' message=' + errormessage)

        if (token && error.response.status == 401 && error.response.data && error.response.data.code == 'AccessTokenInvalid') {
          return AliUser.ApiTokenRefreshAccount(token, true).then((islogin: boolean) => {
            return { code: 401, header: '', body: 'NetError 账号需要重新登录' }
          })
        }

        return {
          code: error.response.status,
          header: error.response.headers,
          body: error.response.data
        }
      } else if (error.request) {
        message.error('网络请求超时，似乎网络不太顺畅')
        SettingLog.mSaveLog('warning', 'HttpError1 message=' + errormessage)
        return { code: 601, header: '', body: 'NetError ' + errormessage }
      } else if (error.message) {
        SettingLog.mSaveLog('warning', 'HttpError3 status=' + error.response?.status || '' + ' message=' + errormessage)
        return { code: 603, header: '', body: 'NetError ' + errormessage }
      } else {
        SettingLog.mSaveLog('warning', 'HttpError2 message=' + errormessage)
        return { code: 602, header: '', body: 'NetError ' + errormessage }
      }
    } catch (e: any) {
      SettingLog.mSaveLog('warning', 'HttpError5  message=' + (e.message || ''))
      return { code: 605, header: '', body: 'NetError catch=' + (e.message || '') }
    }
  }

  static async Get(url: string, user_id: string): Promise<IUrlRespData> {
    if (url.startsWith('http') == false) url = AliHttp.baseapi + url
    for (let i = 0; i <= 5; i++) {
      let resp = await AliHttp._Get(url, user_id)
      if (HttpCodeBreak(resp.code)) return resp
      else if (i == 5) return resp
      else await Sleep(2000)
    }
    return { code: 607, header: '', body: 'NetError GetLost' }
  }

  static _Get(url: string, user_id: string): Promise<IUrlRespData> {
    return UserDAL.GetUserTokenFromDB(user_id).then((token) => {
      const headers: AxiosRequestHeaders = {}
      if (token) {
        headers.Authorization = token.token_type + ' ' + token.access_token
      }
      return axios
        .get(url, {
          withCredentials: false,
          responseType: 'json',
          timeout: 30000,
          headers: headers
        })
        .then((response: AxiosResponse) => {
          return {
            code: response.status,
            header: JSON.stringify(response.headers),
            body: response.data
          }
        })
        .catch(function (error: any) {
          return AliHttp.CatchError(error, token)
        })
    })
  }

  static async GetString(url: string, user_id: string, filesize: number, maxsize: number): Promise<IUrlRespData> {
    if (url.startsWith('http') == false) url = AliHttp.baseapi + url
    for (let i = 0; i <= 5; i++) {
      let resp = await AliHttp._GetString(url, user_id, filesize, maxsize)
      if (HttpCodeBreak(resp.code)) return resp
      else if (i == 5) return resp
      else await Sleep(2000)
    }
    return { code: 609, header: '', body: 'NetError GetStringLost' }
  }

  static _GetString(url: string, user_id: string, filesize: number, maxsize: number): Promise<IUrlRespData> {
    return UserDAL.GetUserTokenFromDB(user_id).then((token) => {
      const headers: AxiosRequestHeaders = {}
      if (token) {
        headers.Authorization = token.token_type + ' ' + token.access_token
      }
      headers.Range = 'bytes=0-' + (Math.min(filesize, maxsize) - 1).toString()

      return axios
        .get(url, {
          withCredentials: false,
          responseType: 'blob',
          timeout: 30000,
          headers: headers
        })
        .then((response: AxiosResponse) => {
          const data = response.data as Blob
          if (data.size == 0) {
            response.data = '文件是空的'
            return response
          }
          const test = data.slice(0, data.size > 10240 ? 10240 : data.size - 1)
          return BlobToBuff(test).then((abuff: ArrayBuffer | undefined) => {
            let encoding = 'utf-8'
            if (abuff != undefined && abuff.byteLength > 3) {
              const buff = Buffer.from(abuff)
              if (buff[0].toString(16).toLowerCase() == 'ef' && buff[1].toString(16).toLowerCase() == 'bb' && buff[2].toString(16).toLowerCase() == 'bf') {
                encoding = 'utf-8'
              } else if (buff[0] == 239 && buff[1] == 191 && buff[2] == 189) {
                encoding = 'GB2312'
              } else {
                const info = jschardet.detect(buff)
                encoding = info.encoding
                if (encoding == 'ascii') encoding = 'utf-8'
              }
            }
            return BlobToString(data, encoding).then((str) => {
              response.data = str
              return response
            })
          })
        })
        .then((response: AxiosResponse) => {
          const r = {
            code: response.status,
            header: JSON.stringify(response.headers),
            body: response.data
          }

          if (typeof r.body === 'string' && r.body.length > 5) {
            if (r.body.indexOf('{') >= 0 && r.body.indexOf(':') > 0 && r.body.indexOf('}') > 0 && r.body.indexOf('"') > 0) {
              try {
                r.body = JSON.stringify(JSON.parse(r.body), undefined, 2)
              } catch {}
            }
          }
          return r
        })
        .catch(function (error: any) {
          return AliHttp.CatchError(error, token)
        })
    })
  }

  static async GetBlob(url: string, user_id: string): Promise<IUrlRespData> {
    if (url.startsWith('http') == false) url = AliHttp.baseapi + url
    for (let i = 0; i <= 5; i++) {
      let resp = await AliHttp._GetBlob(url, user_id)
      if (HttpCodeBreak(resp.code)) return resp
      else if (i == 5) return resp
      else await Sleep(2000)
    }
    return { code: 611, header: '', body: 'NetError GetBlobLost' }
  }

  static _GetBlob(url: string, user_id: string): Promise<IUrlRespData> {
    return UserDAL.GetUserTokenFromDB(user_id).then((token) => {
      const headers: AxiosRequestHeaders = {}
      if (token) {
        headers.Authorization = token.token_type + ' ' + token.access_token
      }
      return axios
        .get(url, {
          withCredentials: false,
          responseType: 'blob',
          timeout: 30000,
          headers: headers
        })
        .then((response: AxiosResponse) => {
          return {
            code: response.status,
            header: JSON.stringify(response.headers),
            body: response.data
          }
        })
        .catch(function (error) {
          return AliHttp.CatchError(error, token)
        })
    })
  }

  static async Post(url: string, postdata: any, user_id: string, share_token: string): Promise<IUrlRespData> {
    if (url.startsWith('http') == false) url = AliHttp.baseapi + url
    for (let i = 0; i <= 5; i++) {
      let resp = await AliHttp._Post(url, postdata, user_id, share_token)
      if (HttpCodeBreak(resp.code)) return resp
      else if (i == 5) return resp
      else await Sleep(2000)
    }
    return { code: 608, header: '', body: 'NetError PostLost' }
  }

  static _Post(url: string, postdata: any, user_id: string, share_token: string): Promise<IUrlRespData> {
    return UserDAL.GetUserTokenFromDB(user_id).then((token) => {
      const headers: AxiosRequestHeaders = {}
      if (token) {
        headers.Authorization = token.token_type + ' ' + token.access_token
      }
      if (share_token) {
        headers['x-share-token'] = share_token
      }
      if (url.includes('ali')) headers['content-type'] = 'application/json;charset-utf-8'

      return axios
        .post(url, postdata, {
          withCredentials: false,
          responseType: 'json',
          timeout: 30000,
          headers: headers
        })
        .then((response: AxiosResponse) => {
          return {
            code: response.status,
            header: JSON.stringify(response.headers),
            body: response.data
          }
        })
        .catch(function (error: any) {
          return AliHttp.CatchError(error, token)
        })
    })
  }

  static async PostString(url: string, postdata: any, user_id: string, share_token: string): Promise<IUrlRespData> {
    if (url.startsWith('http') == false) url = AliHttp.baseapi + url
    for (let i = 0; i <= 5; i++) {
      let resp = await AliHttp._PostString(url, postdata, user_id, share_token)
      if (HttpCodeBreak(resp.code)) return resp
      else if (i == 5) return resp
      else await Sleep(2000)
    }
    return { code: 610, header: '', body: 'NetError PostStringLost' }
  }

  static _PostString(url: string, postdata: any, user_id: string, share_token: string): Promise<IUrlRespData> {
    const headers: AxiosRequestHeaders = {}
    return UserDAL.GetUserTokenFromDB(user_id).then((token) => {
      if (token) {
        headers.Authorization = token.token_type + ' ' + token.access_token
      }
      if (share_token) {
        headers['x-share-token'] = share_token
      }
      return axios
        .post(url, postdata, {
          withCredentials: false,
          responseType: 'text',
          timeout: 50000,
          headers: headers
        })
        .then((response: AxiosResponse) => {
          return {
            code: response.status,
            header: JSON.stringify(response.headers),
            body: response.data
          }
        })
        .catch(function (error) {
          return AliHttp.CatchError(error, token)
        })
    })
  }
}
