import fuzzysort from 'fuzzysort'
import { defineStore } from 'pinia'
import { IAliMyFollowingModel } from '../../aliapi/alimodels'
import { GetSelectedList, GetFocusNext, SelectAll, MouseSelectOne, KeyboardSelectOne } from '../../utils/selecthelper'
import { HanToPin } from '../../utils/utils'

type Item = IAliMyFollowingModel

export interface MyFollowingState {
  
  ListLoading: boolean
  
  ListDataRaw: Item[]
  
  ListDataShow: Item[]

  
  ListSelected: Set<string>
  
  ListOrderKey: string
  
  ListFocusKey: string
  
  ListSelectKey: string
  
  ListSearchKey: string

  
  FollowingKeys: Set<string>
}

type State = MyFollowingState
const KEY = 'user_id'

const useMyFollowingStore = defineStore('myfollowing', {
  state: (): State => ({
    ListLoading: false,
    ListDataRaw: [],
    ListDataShow: [],
    ListSelected: new Set<string>(),
    ListOrderKey: 'time desc',
    ListFocusKey: '',
    ListSelectKey: '',
    ListSearchKey: '',
    FollowingKeys: new Set<string>()
  }),

  getters: {
    ListDataCount(state: State): number {
      return state.ListDataShow.length
    },
    
    IsListSelected(state: State): boolean {
      return state.ListSelected.size > 0
    },
    ListSelectedCount(state: State): number {
      return state.ListSelected.size
    },
    ListDataSelectCountInfo(state: State): string {
      return '已选中 ' + state.ListSelected.size + ' / ' + state.ListDataShow.length + ' 个'
    },
    IsListSelectedAll(state: State): boolean {
      return state.ListSelected.size > 0 && state.ListSelected.size == state.ListDataShow.length
    }
  },

  actions: {
    
    aLoadListData(list: Item[]) {
      
      list.sort((a, b) => b.latest_messages[0].created - a.latest_messages[0].created)
      let item: Item
      for (let i = 0, maxi = list.length; i < maxi; i++) {
        item = list[i]
        item.SearchName = HanToPin(item.nick_name)
      }
      this.ListDataRaw = list
      
      const oldSelected = this.ListSelected
      const newSelected = new Set<string>()
      const map = new Set<string>()
      let key = ''
      let findFocusKey = false
      let findSelectKey = false
      let listFocusKey = this.ListFocusKey
      let listSelectKey = this.ListSelectKey
      for (let i = 0, maxi = list.length; i < maxi; i++) {
        key = list[i][KEY]
        if (oldSelected.has(key)) newSelected.add(key) 
        if (key == listFocusKey) findFocusKey = true
        if (key == listSelectKey) findSelectKey = true
        map.add(key) 
      }
      if (!findFocusKey) listFocusKey = ''
      if (!findSelectKey) listSelectKey = ''
      
      this.$patch({ FollowingKeys: map, ListSelected: newSelected, ListFocusKey: listFocusKey, ListSelectKey: listSelectKey, ListSearchKey: '' })
      this.mRefreshListDataShow(true) 
    },
    
    mSearchListData(value: string) {
      
      this.$patch({ ListSelected: new Set<string>(), ListFocusKey: '', ListSelectKey: '', ListSearchKey: value })
      this.mRefreshListDataShow(true) 
    },
    
    mSetFollowing(followingid: string, isFollowing: boolean) {
      
      if (isFollowing) this.FollowingKeys.add(followingid)
      else if (this.FollowingKeys.has(followingid)) this.FollowingKeys.delete(followingid)
      
      if (isFollowing) {
        
      } else {
        
        const listNew: Item[] = []
        const listOld = this.ListDataRaw 
        for (let i = 0, maxi = listOld.length; i < maxi; i++) {
          if (listOld[i].user_id !== followingid) {
            listNew.push(listOld[i])
          }
        }
        if (listNew.length != listOld.length) {
          this.ListDataRaw = listNew
          this.mRefreshListDataShow(true) 
        }
        if (this.ListSelected.has(followingid)) this.ListSelected.delete(followingid) 
      }
    },
    
    mRefreshListDataShow(refreshRaw: boolean) {
      if (!refreshRaw) {
        const listDataShow = this.ListDataShow.concat() 
        Object.freeze(listDataShow)
        this.ListDataShow = listDataShow
        return
      }
      if (this.ListSearchKey) {
        
        const searchList: Item[] = []
        const results = fuzzysort.go(this.ListSearchKey, this.ListDataRaw, {
          threshold: -200000,
          keys: ['nick_name', 'SearchName', 'description'],
          scoreFn: (a) => Math.max(a[0] ? a[0].score : -200000, a[1] ? a[1].score : -200000, a[2] ? a[2].score - 100 : -200000)
        })
        for (let i = 0, maxi = results.length; i < maxi; i++) {
          if (results[i].score > -200000) searchList.push(results[i].obj)
        }
        Object.freeze(searchList)
        this.ListDataShow = searchList
      } else {
        
        const listDataShow = this.ListDataRaw.concat() 
        Object.freeze(listDataShow)
        this.ListDataShow = listDataShow
      }
      
      const freezeList = this.ListDataShow
      const oldSelected = this.ListSelected
      const newSelected = new Set<string>()
      let key = ''
      for (let i = 0, maxi = freezeList.length; i < maxi; i++) {
        key = freezeList[i][KEY]
        if (oldSelected.has(key)) newSelected.add(key) 
      }
      this.ListSelected = newSelected
    },
    
    mSelectAll() {
      this.$patch({ ListSelected: SelectAll(this.ListDataShow, KEY, this.ListSelected), ListFocusKey: '', ListSelectKey: '' })
      this.mRefreshListDataShow(false) 
    },
    mMouseSelect(key: string, Ctrl: boolean, Shift: boolean) {
      if (this.ListDataShow.length == 0) return
      const data = MouseSelectOne(this.ListDataShow, KEY, this.ListSelected, this.ListFocusKey, this.ListSelectKey, key, Ctrl, Shift, '')
      this.$patch({ ListSelected: data.selectedNew, ListFocusKey: data.focusLast, ListSelectKey: data.selectedLast })
      this.mRefreshListDataShow(false) 
    },
    mKeyboardSelect(key: string, Ctrl: boolean, Shift: boolean) {
      if (this.ListDataShow.length == 0) return
      const data = KeyboardSelectOne(this.ListDataShow, KEY, this.ListSelected, this.ListFocusKey, this.ListSelectKey, key, Ctrl, Shift, '')
      this.$patch({ ListSelected: data.selectedNew, ListFocusKey: data.focusLast, ListSelectKey: data.selectedLast })
      this.mRefreshListDataShow(false) 
    },

    
    GetSelected() {
      return GetSelectedList(this.ListDataShow, KEY, this.ListSelected)
    },
    
    GetSelectedFirst() {
      const list = GetSelectedList(this.ListDataShow, KEY, this.ListSelected)
      if (list.length > 0) return list[0]
      return undefined
    },
    mSetFocus(key: string) {
      this.ListFocusKey = key
      this.mRefreshListDataShow(false) 
    },
    
    mGetFocus() {
      if (!this.ListFocusKey && this.ListDataShow.length > 0) return this.ListDataShow[0][KEY]
      return this.ListFocusKey
    },
    
    mGetFocusNext(position: string) {
      return GetFocusNext(this.ListDataShow, KEY, this.ListFocusKey, position, '')
    }
  }
})

export default useMyFollowingStore
