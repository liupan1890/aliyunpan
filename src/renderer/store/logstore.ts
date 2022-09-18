import { defineStore } from 'pinia'

export interface LogState {
  logTime: number
}

const useLogStore = defineStore('log', {
  state: (): LogState => ({
    logTime: Date.now()
  }),

  getters: {},

  actions: {
    logRefresh(time: number) {
      this.logTime = time
    }
  }
})

export default useLogStore
