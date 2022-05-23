import { defineStore } from 'pinia'
import { IAliGetFileModel } from '@/aliapi/alimodels'

export interface UploadState {
  logTime: number
}

const useUploadStore = defineStore('upload', {
  state: (): UploadState => ({
    logTime: Date.now()
  }),

  getters: {},

  actions: {
    logRefresh(time: number) {
      this.logTime = time
    }
  }
})

export default useUploadStore
