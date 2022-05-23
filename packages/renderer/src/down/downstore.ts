import { defineStore } from 'pinia'
import { IAliGetFileModel } from '@/aliapi/alimodels'

export interface DownState {
  logTime: number
}

const useDownStore = defineStore('down', {
  state: (): DownState => ({
    logTime: Date.now()
  }),

  getters: {},

  actions: {
    logRefresh(time: number) {
      this.logTime = time
    }
  }
})

export default useDownStore
