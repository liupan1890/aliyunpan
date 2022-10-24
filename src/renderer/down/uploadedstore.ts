import { defineStore } from 'pinia'
import { GetSelectedList, GetFocusNext, SelectAll, MouseSelectOne, KeyboardSelectOne } from '../utils/selecthelper'
import { IStateUploadTask } from '../utils/dbupload'

type Item = IStateUploadTask

export interface UploadedState {
  
  ListLoading: boolean
  
  ListDataShow: Item[]

  
  ListSelected: Set<number>
  
  ListFocusKey: number
  
  ListSelectKey: number
  
  ListDataCount: number
}

type State = UploadedState
const KEY = 'TaskID'

const useUploadedStore = defineStore('uploaded', {
  state: (): UploadedState => ({
    ListLoading: false,
    ListDataShow: [],
    ListSelected: new Set<number>(),
    ListFocusKey: 0,
    ListSelectKey: 0,
    ListDataCount: 0
  }),

  getters: {
    
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
    
    aLoadListData(list: Item[], count: number) {
      this.ListDataShow = list
      
      const oldSelected = this.ListSelected
      const newSelected = new Set<number>()
      let key = 0
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
      if (!findFocusKey) listFocusKey = 0
      if (!findSelectKey) listSelectKey = 0
      
      this.$patch({ ListSelected: newSelected, ListFocusKey: listFocusKey, ListSelectKey: listSelectKey, ListDataCount: count })
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
      const newSelected = new Set<number>()
      let key = 0
      for (let i = 0, maxi = freezeList.length; i < maxi; i++) {
        key = freezeList[i][KEY]
        if (oldSelected.has(key)) newSelected.add(key) 
      }
      this.ListSelected = newSelected
    },

    
    mSelectAll() {
      this.$patch({ ListSelected: SelectAll(this.ListDataShow, KEY, this.ListSelected), ListFocusKey: 0, ListSelectKey: 0 })
      this.mRefreshListDataShow(false) 
    },
    mMouseSelect(key: number, Ctrl: boolean, Shift: boolean) {
      if (this.ListDataShow.length == 0) return
      const data = MouseSelectOne(this.ListDataShow, KEY, this.ListSelected, this.ListFocusKey, this.ListSelectKey, key, Ctrl, Shift, 0)
      this.$patch({ ListSelected: data.selectedNew, ListFocusKey: data.focusLast, ListSelectKey: data.selectedLast })
      this.mRefreshListDataShow(false) 
    },
    mKeyboardSelect(key: number, Ctrl: boolean, Shift: boolean) {
      if (this.ListDataShow.length == 0) return
      const data = KeyboardSelectOne(this.ListDataShow, KEY, this.ListSelected, this.ListFocusKey, this.ListSelectKey, key, Ctrl, Shift, 0)
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
    mSetFocus(key: number) {
      this.ListFocusKey = key
      this.mRefreshListDataShow(false) 
    },
    
    mGetFocus() {
      if (this.ListFocusKey > 0 && this.ListDataShow.length > 0) return this.ListDataShow[0][KEY]
      return this.ListFocusKey
    },
    
    mGetFocusNext(position: string) {
      return GetFocusNext<number>(this.ListDataShow, KEY, this.ListFocusKey, position, 0)
    },
    mDeleteFiles(taskidlist: number[]) {
      const fileMap = new Set(taskidlist)
      const listDataRaw = this.ListDataShow
      const newDataList: Item[] = []
      for (let i = 0, maxi = listDataRaw.length; i < maxi; i++) {
        const item = listDataRaw[i]
        if (!fileMap.has(item.TaskID)) {
          newDataList.push(item)
        }
      }
      this.ListDataShow = newDataList
      this.mRefreshListDataShow(true) 
    }
  }
})

export default useUploadedStore
