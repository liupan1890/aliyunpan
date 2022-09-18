import { GetFocusNext, GetSelectedList, KeyboardSelectOne, MouseSelectOne, SelectAll } from '../utils/selecthelper'
import { defineStore } from 'pinia'
import { IStateDownFile } from './downdal'

type Item = IStateDownFile
type State = DownState
const KEY = 'DownID'

export interface DownState {
  
  ListDataRaw: Item[]
  ListDataShow: Item[]

  
  ListSelected: Set<string>
  
  ListFocusKey: string
  
  ListSelectKey: string
}

const useDownStore = defineStore('downing', {
  state: (): DownState => ({
    ListDataRaw: [],
    ListDataShow: [],
    ListSelected: new Set<string>(),
    ListFocusKey: '',
    ListSelectKey: ''
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
      let stats = { preview: 0, download: 0, save: 0, previewMax: 0, forbidden: 0, expired: 0, expir2day: 0 }
      let list = state.ListDataShow
      let item: Item
      let exp = 0
      let day = new Date().getTime()
      for (let i = 0, maxi = list.length; i < maxi; i++) {
        item = list[i]
        /*
        stats.preview += item.preview_count
        stats.previewMax = Math.max(stats.previewMax, item.preview_count)
        stats.download += item.download_count
        stats.save += item.save_count
        if (item.status == 'forbidden') stats.forbidden++
        if (item.expired) stats.expired++
        else if (new Date(item.expiration).getTime() - day < 2 * 24 * 60 * 60 * 1000) stats.expir2day++
        */
      }
      return stats
    }
  },

  actions: {
    
    aLoadListData(list: Item[]) {
      
      let oldSelected = this.ListSelected
      let newSelected = new Set<string>()
      let key = ''
      let findFocusKey = false
      let ListFocusKey = this.ListFocusKey
      for (let i = 0, maxi = list.length; i < maxi; i++) {
        key = list[i][KEY]
        if (oldSelected.has(key)) newSelected.add(key) 
        if (key == ListFocusKey) findFocusKey = true
      }
      
      this.$patch({ ListSelected: newSelected, ListFocusKey: findFocusKey ? ListFocusKey : '', ListSelectKey: '' })
      this.mRefreshListDataShow(true) 
    },

    
    mRefreshListDataShow(refreshRaw: boolean) {
      if (!refreshRaw) {
        let ListDataShow = this.ListDataShow.concat() 
        Object.freeze(ListDataShow)
        this.ListDataShow = ListDataShow
        return
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
    }
  }
})

export default useDownStore
