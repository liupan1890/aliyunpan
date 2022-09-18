import { ApiGetAsyncTask, ApiGetAsyncTaskUnzip } from '../aliapi/utils'
import { IUploadingModel } from '../down/uploadingstore'
import PanDAL from '../pan/pandal'
import DebugLog from '../utils/debuglog'
import { humanTimeFM } from '../utils/format'
import { defineStore } from 'pinia'
import { ITokenInfo } from '../user/userstore'

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
  
  uploadingList: IUploadingModel[]
  
  downingList: IUploadingModel[]
  
  audiourl: string
  
  rightWidth: number
  
  pandirinfo: string
  
  picdirinfo: string
  
  loadinginfo: string
  
  panspaceinfo: string
  
  picspaceinfo: string
  
  appTab: string
}

const useFootStore = defineStore('foot', {
  state: (): FootState => ({
    taskVisible: false,
    taskList: [],
    uploadingList: [],
    downingList: [],
    audiourl: '',
    rightWidth: 301,
    pandirinfo: '',
    picdirinfo: '',
    loadinginfo: '',
    panspaceinfo: '',
    picspaceinfo: '',
    appTab: 'pan'
  }),

  getters: {
    GetIsRunning(state: FootState): boolean {
      let isrunning = false
      state.taskList.map((t) => {
        if (t.status == 'running') isrunning = true
      })
      return isrunning
    },
    GetSpaceInfo(state: FootState): string {
      if (state.loadinginfo) return '' 
      if (state.appTab == 'pan') return state.panspaceinfo
      if (state.appTab == 'pic') return state.panspaceinfo
      return ''
    },
    GetDirInfo(state: FootState): string {
      if (state.audiourl) return ''
      if (state.appTab == 'pan') return state.pandirinfo
      if (state.appTab == 'pic') return state.pandirinfo
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
      this.taskList = [{ user_id, todrive_id, tofile_id, zipdrive_id: '', zipfile_id: '', zipdomain_id: '', key, type, title: type + ' ' + title, status: 'running', starttime: new Date().getTime(), endtime: 0, usetime: '' }].concat(this.taskList)
      this.taskVisible = true
    },
    
    mAddTaskZip(user_id: string, key: string, type: AsyncType, title: string, todrive_id: string, tofile_id: string, zipdrive_id: string, zipfile_id: string, zipdomain_id: string) {
      this.taskList = [{ user_id, todrive_id, tofile_id, zipdrive_id, zipfile_id, zipdomain_id, key, type, title: type + ' ' + title, status: 'running', starttime: new Date().getTime(), endtime: 0, usetime: '' }].concat(this.taskList)
      this.taskVisible = true
    },
    
    aUpdateTask() {
      let list = this.taskList
      for (let i = 0, maxi = list.length; i < maxi; i++) {
        let item = list[i]
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
      let list = this.taskList
      let newlist: AsyncModel[] = []
      for (let i = 0, maxi = list.length; i < maxi; i++) {
        if (list[i].status == 'running') newlist.push(list[i])
      }
      this.taskList = newlist
    },
    mSaveUploadingList(list: IUploadingModel[]) {
      this.uploadingList = list
    },
    mSaveDowningList(list: IUploadingModel[]) {
      this.downingList = list
    },
    
    mSaveAudioUrl(url: string) {
      this.audiourl = url
    },
    
    mSaveLoading(title: string) {
      this.loadinginfo = title
    },
    mSaveUserInfo(token: ITokenInfo) {
      this.panspaceinfo = '总空间 ' + token.spaceinfo
    },
    mSaveDirInfo(drive: Drive, info: string) {
      if (drive == 'pan') this.pandirinfo = info
      if (drive == 'pic') this.picdirinfo = info
    }
  }
})

export default useFootStore
