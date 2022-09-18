import { defineStore } from 'pinia'

export interface WinState {
  width: number
  height: number
}

const useWinStore = defineStore('win', {
  state: (): WinState => ({
    width: 0,
    height: 0
  }),

  getters: {
    GetListHeight(state: WinState): string {
      return (state.height - 192).toString() + 'px'
    },
    GetListHeightNumber(state: WinState): number {
      return state.height - 192
    }
  },

  actions: {
    updateStore(partial: Partial<WinState>) {
      this.$patch(partial)
    }
  }
})

export default useWinStore
