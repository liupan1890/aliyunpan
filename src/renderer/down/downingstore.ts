import { GetFocusNext, GetSelectedList, KeyboardSelectOne, MouseSelectOne, SelectAll } from '../utils/selecthelper'
import { defineStore } from 'pinia'
import { IStateDownFile } from './downdal'

type Item = IStateDownFile

export interface DownState {
  
  ListDataRaw: Item[]
  ListDataShow: Item[]

  
  ListSelected: Set<string>
  
  ListFocusKey: string
  
  ListSelectKey: string
}
type State = DownState
const KEY = 'DownID'

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
      const stats = { preview: 0, download: 0, save: 0, previewMax: 0, forbidden: 0, expired: 0, expir2day: 0 }

      return stats
    }
  },

  actions: {
    
    aLoadListData(list: Item[]) {
      
      const oldSelected = this.ListSelected
      const newSelected = new Set<string>()
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
      }
      if (!findFocusKey) listFocusKey = ''
      if (!findSelectKey) listSelectKey = ''
      
      this.$patch({ ListSelected: newSelected, ListFocusKey: listFocusKey, ListSelectKey: listSelectKey })
      this.mRefreshListDataShow(true) 
    },

    
    mRefreshListDataShow(refreshRaw: boolean) {
      if (!refreshRaw) {
        const listDataShow = this.ListDataShow.concat() 
        Object.freeze(listDataShow)
        this.ListDataShow = listDataShow
        return
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

export default useDownStore
