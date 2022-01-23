import { B64decode, b64decode, B64encode } from '@/store/format'
import { message, Modal } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import React from 'react'
import axios, { AxiosResponse } from 'axios'
import SettingConfig, { IShareSiteModel } from '@/setting/settingconfig'
import DB from '@/setting/db'

export interface IServerRespData {
  state: string
  msg: string
  [k: string]: any
}
export default class ServerHttp {
  static baseapi = b64decode('aHR0cDovLzEyMS41LjE0NC44NDo1MjgyLw==')
  static async PostToServer(postdata: any): Promise<IServerRespData> {
    postdata.appVersion = SettingConfig.appVersion
    const str = JSON.stringify(postdata)
    if (window.postdataFunc) {
      let enstr = ''
      try {
        enstr = window.postdataFunc(str)
      } catch {
        return { state: 'error', msg: '联网失败' }
      }
      return ServerHttp.Post(enstr).catch(() => {
        return { state: 'error', msg: '网络错误' }
      })
    } else {
      return { state: 'error', msg: '程序错误' }
    }
  }

  static async Post(postdata: any, isfirst = true): Promise<IServerRespData> {
    const url = ServerHttp.baseapi + 'xby2'
    return axios
      .post(url, postdata, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {}
      })
      .then((response: AxiosResponse) => {
        if (response.status != 200) return { state: 'error', msg: '网络错误' }
        const buff = response.data as ArrayBuffer
        const uint8array = new Uint8Array(buff)
        for (let i = 0, maxi = uint8array.byteLength; i < maxi; i++) {
          uint8array[i] ^= 9 + (i % 200)
        }
        const str = new TextDecoder().decode(uint8array)
        return JSON.parse(str) as IServerRespData
      })
      .catch(() => {
        return { state: 'error', msg: '网络错误' }
      })
      .then((resp) => {
        if (resp.state == 'error' && resp.msg == '网络错误' && isfirst == true) {
          return ServerHttp.Sleep(2000).then(() => {
            return ServerHttp.Post(postdata, false)
          })
        } else return resp
      })
  }
  static Sleep(msTime: number) {
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

  static configUrl = b64decode('aHR0cHM6Ly9naXRlZS5jb20vbGl1cGFueGlhb2JhaXlhbmcvYWxpeXVucGFuL3Jhdy9tYXN0ZXIvY29uZmlnMi5qc29u')

  static async CheckUpgrade(tip: boolean) {
    axios
      .get(ServerHttp.configUrl, {
        withCredentials: false,
        responseType: 'json',
        timeout: 30000
      })
      .then((response: AxiosResponse) => {
        if (response.data.SIP) {
          const SIP = B64decode(response.data.SIP)
          if (SIP.length > 0) ServerHttp.baseapi = SIP
        }
        if (response.data.SSList) {
          const ShareSiteList: IShareSiteModel[] = []
          for (let i = 0, maxi = response.data.SSList.length; i < maxi; i++) {
            const item = response.data.SSList[i]
            const add = { title: item.title, url: item.url, tip: item.tip }
            if (add.url.length > 0) ShareSiteList.push(add)
          }
          DB.saveValueObject('shareSiteList', ShareSiteList).catch(() => {})
          window.getDvaApp()._store.dispatch({ type: 'share/mSaveShareSiteList', ShareSiteList: ShareSiteList })
        }

        if (response.data.ExeVer) {
          const v1 = SettingConfig.appVersion.replaceAll('v', '').replaceAll('.', '').trim()
          const v2 = response.data.ExeVer.replaceAll('v', '').replaceAll('.', '').trim()
          const info = response.data.VerInfo as string
          const verurl = response.data.VerUrl

          if (parseInt(v2) > parseInt(v1)) {
            Modal.confirm({
              title: '有新版可以升级',
              icon: <ExclamationCircleOutlined />,
              content: <div dangerouslySetInnerHTML={{ __html: info }}></div>,
              okText: '确认',
              cancelText: '取消',
              width: '540px',
              onOk: (e) => {
                if (verurl.length > 0) window.Electron.shell.openExternal(B64decode(verurl))
              }
            })
          } else if (tip) {
            message.info('已经是最新版 ' + response.data.ExeVer + ' 一般每周日晚8-10点发布新版')
          }
        }
      })
      .catch(() => {})
  }
}


