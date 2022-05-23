import AliFile from '@/aliapi/file'
import { ApiGetAsyncTask } from '@/aliapi/utils'
import PanDAL from '@/pan/pandal'
import usePanFileStore from '@/pan/panfilestore'
import { humanTime } from '@/utils/format'
import { defineStore } from 'pinia'

export interface AsyncModel {
  user_id: string
  key: string
  title: string
  starttime: number
  endtime: number
  usetime: string
  status: string
  file_id: string
  drive_id: string
  type: string
}

export interface FootState {
  visible: boolean
  tasklist: AsyncModel[]
  audiourl: string
}

const useFootStore = defineStore('foot', {
  state: (): FootState => ({
    visible: false,
    tasklist: [],
    audiourl: ''
  }),

  getters: {
    GetIsRunning(state: FootState): boolean {
      return state.tasklist.length > 0
    }
  },

  actions: {
    updateStore(partial: Partial<FootState>) {
      this.$patch(partial)
    },
    mDeleteTask(key: string) {
      this.tasklist = this.tasklist.filter((t) => t.key != key)
    },
    mAddTask(user_id: string, key: string, type: string, title: string, drive_id: string, file_id: string) {
      this.tasklist = [{ user_id, drive_id, file_id, key, type, title: type + ' ' + title, status: 'running', starttime: new Date().getTime(), endtime: 0, usetime: '' }].concat(this.tasklist)
      this.visible = true
    },
    
    aUpdateTask() {
      let list = this.tasklist
      for (let i = 0, maxi = list.length; i < maxi; i++) {
        let item = list[i]
        if (item.status == 'running') {
          ApiGetAsyncTask(item.user_id, item.key).then((resp) => {
            item.status = resp
            list[i].endtime = new Date().getTime()
            list[i].usetime = humanTime((list[i].endtime - list[i].starttime) / 1000)
            if (item.status != 'running') {
              //复制 导入分享 需要刷新dir_id
              if (item.type == '复制' || item.type == '导入分享' || item.type == '从回收站还原') {
                PanDAL.GetDirFileList(item.user_id, item.drive_id, item.file_id, '')
              }
            }
          })
        }
      }
    },
    
    mClearTask() {
      let list = this.tasklist
      let newlist: AsyncModel[] = []
      for (let i = 0, maxi = list.length; i < maxi; i++) {
        if (list[i].status == 'running') newlist.push(list[i])
      }
      this.tasklist = newlist
    },
    mSaveAudioUrl(url: string) {
      this.audiourl = url
    }
  }
})

export default useFootStore
