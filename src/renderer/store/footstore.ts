import { ApiGetAsyncTask, ApiGetAsyncTaskUnzip, AsyncType, Drive } from '../aliapi/utils'
import PanDAL from '../pan/pandal'
import DebugLog from '../utils/debuglog'
import { humanTimeFM } from '../utils/format'
import { defineStore } from 'pinia'
import { ITokenInfo } from '../user/userstore'
import useAppStore from './appstore'

export interface AsyncModel {
  user_id: string
  key: string
  title: string
  starttime: number
  endtime: number
  usetime: string
  status: string
  tofile_id: string
  todrive_id: string
  zipfile_id: string
  zipdrive_id: string
  zipdomain_id: string
  type: AsyncType
}

export interface FootState {
  
  taskVisible: boolean
  
  taskList: AsyncModel[]

  
  audioUrl: string
  
  rightWidth: number
  
  panDirInfo: string
  
  picDirInfo: string
  
  uploadingInfo: string
  
  downloadingInfo: string
  
  loadingInfo: string
  
  panSpaceInfo: string
  
  picSpaceInfo: string
}

const useFootStore = defineStore('foot', {
  state: (): FootState => ({
    taskVisible: false,
    taskList: [],
    audioUrl: '',
    rightWidth: 301,
    panDirInfo: '',
    picDirInfo: '',
    uploadingInfo: '',
    downloadingInfo: '',
    loadingInfo: '',
    panSpaceInfo: '',
    picSpaceInfo: ''
  }),

  getters: {
    GetIsRunning(state: FootState): boolean {
      let isRunning = false
      state.taskList.map((t) => {
        if (t.status == 'running') isRunning = true
        return true
      })
      return isRunning
    },
    GetSpaceInfo(state: FootState): string {
      if (state.loadingInfo) return '' 
      const appTab = useAppStore().appTab
      if (appTab == 'pan') return state.panSpaceInfo
      if (appTab == 'pic') return state.panSpaceInfo
      return ''
    },
    GetInfo(state: FootState): string {
      if (state.audioUrl) return ''
      const appTab = useAppStore().appTab
      const appPage = useAppStore().GetAppTabMenu
      if (appTab == 'pan') return state.panDirInfo
      if (appTab == 'pic') return state.panDirInfo
      if (appPage == 'DowningRight') return state.downloadingInfo
      if (appPage == 'UploadingRight') return state.uploadingInfo
      return ''
    }
  },

  actions: {
    updateStore(partial: Partial<FootState>) {
      this.$patch(partial)
    },

    
    mDeleteTask(key: string) {
      this.taskList = this.taskList.filter((t) => t.key != key)
    },
    
    mAddTask(user_id: string, key: string, type: AsyncType, title: string, todrive_id: string, tofile_id: string) {
      this.taskList = [{ user_id, todrive_id, tofile_id, zipdrive_id: '', zipfile_id: '', zipdomain_id: '', key, type, title: type + ' ' + title, status: 'running', starttime: new Date().getTime(), endtime: 0, usetime: '' } as AsyncModel].concat(this.taskList)
      this.taskVisible = true
    },
    
    mAddTaskZip(user_id: string, key: string, type: AsyncType, title: string, todrive_id: string, tofile_id: string, zipdrive_id: string, zipfile_id: string, zipdomain_id: string) {
      this.taskList = [{ user_id, todrive_id, tofile_id, zipdrive_id, zipfile_id, zipdomain_id, key, type, title: type + ' ' + title, status: 'running', starttime: new Date().getTime(), endtime: 0, usetime: '' } as AsyncModel].concat(this.taskList)
      this.taskVisible = true
    },
    
    aUpdateTask() {
      const list = this.taskList
      for (let i = 0, maxi = list.length; i < maxi; i++) {
        const item = list[i]
        if (item.status == 'running') {
          let result
          if (item.type == '解压') {
            result = ApiGetAsyncTaskUnzip(item.user_id, item.zipdrive_id, item.zipfile_id, item.zipdomain_id, item.key)
          } else {
            
            result = ApiGetAsyncTask(item.user_id, item.key)
          }
          result
            .then((resp) => {
              item.status = resp
              list[i].endtime = new Date().getTime()
              list[i].usetime = humanTimeFM((list[i].endtime - list[i].starttime) / 1000)
              if (item.status != 'running') {
                
                if (item.type == '解压' || item.type == '复制' || item.type == '导入分享' || item.type == '回收站还原') {
                  PanDAL.GetDirFileList(item.user_id, item.todrive_id, item.tofile_id, '')
                }
              }
            })
            .catch((err: any) => {
              DebugLog.mSaveDanger('aUpdateTask' + item.title, err)
            })
        }
      }
    },
    
    mClearTask() {
      const list = this.taskList
      const newList: AsyncModel[] = []
      for (let i = 0, maxi = list.length; i < maxi; i++) {
        if (list[i].status == 'running') newList.push(list[i])
      }
      this.taskList = newList
    },
    mSaveUploadingInfo(total: number) {
      this.uploadingInfo = total > 1000 ? '前 1000 / ' + total + ' 个' : ''
    },
    
    mSaveAudioUrl(url: string) {
      this.audioUrl = url
    },
    
    mSaveLoading(title: string) {
      this.loadingInfo = title
    },
    mSaveUserInfo(token: ITokenInfo) {
      this.panSpaceInfo = '总空间 ' + token.spaceinfo
    },
    mSaveDirInfo(drive: Drive, info: string) {
      if (drive == 'pan') this.panDirInfo = info
      if (drive == 'pic') this.picDirInfo = info
    }
  }
})

export default useFootStore
