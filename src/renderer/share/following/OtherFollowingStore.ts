import { defineStore } from 'pinia'
import { IAliOtherFollowingModel } from '../../aliapi/alimodels'

export declare interface FollowingState {
  
  TuiJianLoading: boolean
  
  TuiJianLoaded: boolean
  
  TuiJianList: { key: string; color: string; list: IAliOtherFollowingModel[] }[]
}

const useFollowingStore = defineStore('following', {
  state: (): FollowingState => ({
    TuiJianLoading: false,
    TuiJianLoaded: false,
    TuiJianList: [{ key: '官方推荐', color: 'arcoblue', list: [] }]
  }),
  getters: {},
  actions: {
    
    aSaveOtherFollowingList(key: string, color: string, list: IAliOtherFollowingModel[]) {
      list.sort((a, b) => b.follower_count - a.follower_count)
      for (let i = 0, maxi = this.TuiJianList.length; i < maxi; i++) {
        if (this.TuiJianList[i].key == key) {
          this.TuiJianList[i].color = color
          this.TuiJianList[i].list = list
          return
        }
      }
      this.TuiJianList.push({ key, color, list })
    }
  }
})

export default useFollowingStore
