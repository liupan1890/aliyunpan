import fuzzysort from 'fuzzysort'
import { defineStore } from 'pinia'
import { GetSelectedList, GetFocusNext, SelectAll, MouseSelectOne, KeyboardSelectOne } from '@/utils/selecthelper'
import { HanToPin } from '@/utils/utils'


export interface IOtherShareLinkModel {
  share_id: string
  share_name: string
  description: string
  share_pwd: string
  expiration: string
  expired: boolean
  share_msg: string
  created_at: string
  updated_at: string
  saved_at: string
  saved_time: number
}

type Item = IOtherShareLinkModel
type State = OtherShareState
const KEY = 'share_id'

export interface OtherShareState {
  
  ListLoading: boolean
  
  ListDataRaw: Item[]
  
  ListDataShow: Item[]

  
  ListSelected: Set<string>
  
  ListOrderKey: string
  
  ListFocusKey: string
  
  ListSelectKey: string
  
  ListSearchKey: string
}

const useOtherShareStore = defineStore('othershare', {
  state: (): State => ({
    ListLoading: false,
    ListDataRaw: [],
    ListDataShow: [],
    ListSelected: new Set<string>(),
    ListOrderKey: 'time',
    ListFocusKey: '',
    ListSelectKey: '',
    ListSearchKey: ''
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
      
      let item: Item
      for (let i = 0, maxi = list.length; i < maxi; i++) {
        item = list[i]
        item.description = HanToPin(item.share_name)
      }
      this.ListDataRaw = this.mGetOrder(this.ListOrderKey, list)
      
      let oldSelected = this.ListSelected
      let newSelected = new Set<string>()
      let key = ''
      for (let i = 0, maxi = list.length; i < maxi; i++) {
        key = list[i][KEY]
        if (oldSelected.has(key)) newSelected.add(key) 
      }
      
      this.$patch({ ListSelected: newSelected, ListFocusKey: '', ListSelectKey: '', ListSearchKey: '' })
      this.mRefreshListDataShow(true) 
    },
    
    mSearchListData(value: string) {
      
      this.$patch({ ListSelected: new Set<string>(), ListFocusKey: '', ListSelectKey: '', ListSearchKey: value })
      this.mRefreshListDataShow(true) 
    },
    
    mOrderListData(value: string) {
      
      this.$patch({ ListOrderKey: value, ListSelected: new Set<string>(), ListFocusKey: '', ListSelectKey: '' })
      this.ListDataRaw = this.mGetOrder(value, this.ListDataRaw)
      this.mRefreshListDataShow(true) 
    },
    mGetOrder(order: string, list: Item[]) {
      if (order == 'state') list.sort((a, b) => a.share_msg.localeCompare(b.share_msg))
      if (order == 'update') list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()) 
      if (order == 'time') list.sort((a, b) => b.saved_time - a.saved_time) 
      return list
    },
    
    mRefreshListDataShow(refreshRaw: boolean) {
      if (!refreshRaw) {
        let ListDataShow = this.ListDataShow.concat() 
        Object.freeze(ListDataShow)
        this.ListDataShow = ListDataShow
        return
      }
      if (this.ListSearchKey) {
        
        let searchlist: Item[] = []
        let results = fuzzysort.go(this.ListSearchKey, this.ListDataRaw, {
          threshold: -200000,
          keys: ['share_name', 'description'],
          scoreFn: (a) => Math.max(a[0] ? a[0].score : -200000, a[1] ? a[1].score : -200000)
        })
        for (let i = 0, maxi = results.length; i < maxi; i++) {
          if (results[i].score > -200000) searchlist.push(results[i].obj)
        }
        Object.freeze(searchlist)
        this.ListDataShow = searchlist
      } else {
        
        let ListDataShow = this.ListDataRaw.concat() 
        Object.freeze(ListDataShow)
        this.ListDataShow = ListDataShow
      }
      
      let freezelist = this.ListDataShow
      let oldSelected = this.ListSelected
      let newSelected = new Set<string>()
      let key = ''
      for (let i = 0, maxi = freezelist.length; i < maxi; i++) {
        key = freezelist[i][KEY]
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
      const data = MouseSelectOne(this.ListDataShow, KEY, this.ListSelected, this.ListFocusKey, this.ListSelectKey, key, Ctrl, Shift)
      this.$patch({ ListSelected: data.selectedNew, ListFocusKey: data.focusLast, ListSelectKey: data.selectedLast })
      this.mRefreshListDataShow(false) 
    },
    mKeyboardSelect(key: string, Ctrl: boolean, Shift: boolean) {
      if (this.ListDataShow.length == 0) return
      const data = KeyboardSelectOne(this.ListDataShow, KEY, this.ListSelected, this.ListFocusKey, this.ListSelectKey, key, Ctrl, Shift)
      this.$patch({ ListSelected: data.selectedNew, ListFocusKey: data.focusLast, ListSelectKey: data.selectedLast })
      this.mRefreshListDataShow(false) 
    },

    
    GetSelected() {
      return GetSelectedList(this.ListDataShow, KEY, this.ListSelected)
    },
    
    GetSelectedFirst() {
      let list = GetSelectedList(this.ListDataShow, KEY, this.ListSelected)
      if (list.length > 0) return list[0]
      return undefined
    },
    mSetFocus(key: string) {
      this.ListFocusKey = key
      this.mRefreshListDataShow(false) 
    },
    
    mGetFocus() {
      if (this.ListFocusKey == '' && this.ListDataShow.length > 0) return this.ListDataShow[0][KEY]
      return this.ListFocusKey
    },
    
    mGetFocusNext(position: string) {
      return GetFocusNext(this.ListDataShow, KEY, this.ListFocusKey, position)
    },
    mDeleteFiles(shareidlist: string[]) {
      let filemap = new Set(shareidlist)
      let ListDataRaw = this.ListDataRaw
      let NewDataList: Item[] = []
      for (let i = 0, maxi = ListDataRaw.length; i < maxi; i++) {
        let item = ListDataRaw[i]
        if (!filemap.has(item.share_id)) {
          NewDataList.push(item)
        }
      }
      this.ListDataRaw = NewDataList
      this.mRefreshListDataShow(true) 
    }
  }
})

export default useOtherShareStore
