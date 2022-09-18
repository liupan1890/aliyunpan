import { defineStore } from 'pinia'
import { GetSelectedList, GetFocusNext, SelectAll, MouseSelectOne, KeyboardSelectOne } from '../utils/selecthelper'


export interface IUploadingModel {
  UploadID: string

  
  LocalFilePath: string
  
  name: string
  
  sizestr: string

  icon: string
  isDir: boolean

  
  UploadState: string

  
  SpeedStr: string
  
  Progress: number
  
  ProgressStr: string
  
  ErrorMessage: string
}

type Item = IUploadingModel
type State = UploadingState
const KEY = 'UploadID'

export interface UploadingState {
  
  ListLoading: boolean
  
  ListDataShow: Item[]

  
  ListSelected: Set<string>
  
  ListFocusKey: string
  
  ListSelectKey: string
  
  ListDataCount: number

  
  ShowDirKey: string
  
  ShowDirName: string
}

const useUploadingStore = defineStore('uploading', {
  state: (): UploadingState => ({
    ListLoading: false,
    ListDataShow: [],
    ListSelected: new Set<string>(),
    ListFocusKey: '',
    ListSelectKey: '',
    ListDataCount: 0,
    ShowDirKey: '',
    ShowDirName: ''
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
    
    aLoadListData(dirkey: string, dirname: string, list: Item[], count: number) {
      this.ListDataShow = list
      

      if (this.ShowDirKey == dirkey) {
        
        let oldSelected = this.ListSelected
        let newSelected = new Set<string>()
        let findFocusKey = false
        let key = ''
        let ListFocusKey = this.ListFocusKey
        for (let i = 0, maxi = list.length; i < maxi; i++) {
          key = list[i][KEY]
          if (oldSelected.has(key)) newSelected.add(key) 
          if (key == ListFocusKey) findFocusKey = true
        }
        
        this.$patch({ ListSelected: newSelected, ListFocusKey: findFocusKey ? ListFocusKey : '', ListSelectKey: '', ListDataCount: count })
      } else {
        
        
        this.$patch({ ShowDirKey: dirkey, ShowDirName: dirname, ListSelected: new Set<string>(), ListFocusKey: '', ListSelectKey: '', ListDataCount: count })
      }
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
    },
    mDeleteFiles(shareidlist: string[]) {
      let filemap = new Set(shareidlist)
      let ListDataRaw = this.ListDataShow
      let NewDataList: Item[] = []
      for (let i = 0, maxi = ListDataRaw.length; i < maxi; i++) {
        let item = ListDataRaw[i]
        if (!filemap.has(item.UploadID)) {
          NewDataList.push(item)
        }
      }
      this.ListDataShow = NewDataList
      this.mRefreshListDataShow(true) 
    }
  }
})

export default useUploadingStore
