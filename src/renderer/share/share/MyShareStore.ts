import fuzzysort from 'fuzzysort'
import { defineStore } from 'pinia'
import { IAliShareItem } from '../../aliapi/alimodels'
import { GetSelectedList, GetFocusNext, SelectAll, MouseSelectOne, KeyboardSelectOne } from '../../utils/selecthelper'
import { HanToPin } from '../../utils/utils'
import { UpdateShareModel } from '../../aliapi/share'
import { humanExpiration } from '../../utils/format'

type Item = IAliShareItem

export interface MyShareState {
  
  ListLoading: boolean
  
  ListDataRaw: Item[]
  
  ListDataShow: Item[]

  
  ListSelected: Set<string>
  
  ListOrderKey: string
  
  ListFocusKey: string
  
  ListSelectKey: string
  
  ListSearchKey: string
}
type State = MyShareState
const KEY = 'share_id'

const useMyShareStore = defineStore('myshare', {
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
    },

    ListStats(state: State) {
      const stats = { preview: 0, download: 0, save: 0, previewMax: 0, forbidden: 0, expired: 0, expir2day: 0 }
      const list = state.ListDataShow
      let item: Item
      const day = new Date().getTime()
      for (let i = 0, maxi = list.length; i < maxi; i++) {
        item = list[i]
        stats.preview += item.preview_count
        stats.previewMax = Math.max(stats.previewMax, item.preview_count)
        stats.download += item.download_count
        stats.save += item.save_count
        if (item.status == 'forbidden') stats.forbidden++
        if (item.expired) stats.expired++
        else if (new Date(item.expiration).getTime() - day < 2 * 24 * 60 * 60 * 1000) stats.expir2day++
      }
      return stats
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
      
      const oldSelected = this.ListSelected
      const newSelected = new Set<string>()
      let key = ''
      let findFocusKey = false
      let findSelectKey = false
      let ListFocusKey = this.ListFocusKey
      let ListSelectKey = this.ListSelectKey
      for (let i = 0, maxi = list.length; i < maxi; i++) {
        key = list[i][KEY]
        if (oldSelected.has(key)) newSelected.add(key) 
        if (key == ListFocusKey) findFocusKey = true
        if (key == ListSelectKey) findSelectKey = true
      }
      if (!findFocusKey) ListFocusKey = ''
      if (!findSelectKey) ListSelectKey = ''
      
      this.$patch({ ListSelected: newSelected, ListFocusKey: ListFocusKey, ListSelectKey: ListSelectKey, ListSearchKey: '' })
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
      if (order == 'time') list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) 
      if (order == 'preview') list.sort((a, b) => b.preview_count - a.preview_count)
      if (order == 'download') list.sort((a, b) => b.download_count - a.download_count)
      if (order == 'save') list.sort((a, b) => b.save_count - a.save_count)
      if (order == 'state')
        list.sort((a, b) => {
          const s = a.share_msg.localeCompare(b.share_msg)
          if (s == 0) {
            if (a.first_file && b.first_file) return 0
            if (a.first_file) return 1
            if (b.first_file) return -1
            return 0
          }
          return s
        })
      return list
    },
    
    mRefreshListDataShow(refreshRaw: boolean) {
      if (!refreshRaw) {
        const ListDataShow = this.ListDataShow.concat() 
        Object.freeze(ListDataShow)
        this.ListDataShow = ListDataShow
        return
      }
      if (this.ListSearchKey) {
        
        const searchList: Item[] = []
        const results = fuzzysort.go(this.ListSearchKey, this.ListDataRaw, {
          threshold: -200000,
          keys: ['share_name', 'description'],
          scoreFn: (a) => Math.max(a[0] ? a[0].score : -200000, a[1] ? a[1].score : -200000)
        })
        for (let i = 0, maxi = results.length; i < maxi; i++) {
          if (results[i].score > -200000) searchList.push(results[i].obj as IAliShareItem)
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
    },
    mDeleteFiles(share_idList: string[]) {
      const fileMap = new Set(share_idList)
      const listDataRaw = this.ListDataRaw
      const newDataList: Item[] = []
      for (let i = 0, maxi = listDataRaw.length; i < maxi; i++) {
        const item = listDataRaw[i]
        if (!fileMap.has(item.share_id)) {
          newDataList.push(item)
        }
      }
      if (this.ListDataRaw.length != newDataList.length) {
        this.ListDataRaw = newDataList
        this.mRefreshListDataShow(true) 
      }
    },
    mUpdateShare(success: UpdateShareModel[]) {
      const listDataRaw = this.ListDataRaw
      const timeNow = new Date().getTime()
      for (let j = 0, jmax = success.length; j < jmax; j++) {
        const info = success[j]
        for (let i = 0, maxi = listDataRaw.length; i < maxi; i++) {
          const item = listDataRaw[i]
          if (item.share_id == info.share_id) {
            item.share_pwd = info.share_pwd
            item.share_name = info.share_name
            item.description = HanToPin(info.share_name)
            item.expiration = info.expiration
            item.share_msg = humanExpiration(info.expiration, timeNow)
            item.expired = item.share_msg == '过期失效'
            break
          }
        }
      }
      this.mRefreshListDataShow(false) 
    }
  }
})

export default useMyShareStore
