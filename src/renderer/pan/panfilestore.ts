import { defineStore } from 'pinia'
import { IAliGetFileModel } from '../aliapi/alimodels'
import { ArrayToMap } from '../utils/utils'
import fuzzysort from 'fuzzysort'
import { GetFocusNext, GetSelectedList, GetSelectedListID, KeyboardSelectOne, MouseSelectOne, SelectAll } from '../utils/selecthelper'
import { IAliFileResp } from '../aliapi/dirfilelist'
import PanDAL from './pandal'
import TreeStore from '../store/treestore'
import { useFootStore } from '../store'

type Item = IAliGetFileModel
type State = PanFileState
const KEY = 'file_id'

export interface GridItem {
  file_id: string
  files: IAliGetFileModel[]
}

export interface PanFileState {
  DriveID: string
  DirID: string
  DirName: string
  
  ListLoading: boolean
  ListLoadingIndex: number
  
  ListDataRaw: Item[]
  
  ListDataShow: Item[]
  ListDataGrid: GridItem[]

  
  ListSelected: Set<string>
  
  ListOrderKey: string
  
  ListFocusKey: string
  
  ListSelectKey: string
  
  ListSearchKey: string
  
  ListShowMode: string
  ListShowColumn: number
}

const usePanFileStore = defineStore('panfile', {
  state: (): State => ({
    DriveID: '',
    DirID: '',
    DirName: '',

    ListLoading: false,
    ListLoadingIndex: 0,
    ListDataRaw: [],
    ListDataShow: [],
    ListDataGrid: [],
    ListSelected: new Set<string>(),
    ListOrderKey: 'name desc',
    ListFocusKey: '',
    ListSelectKey: '',
    ListSearchKey: '',
    ListShowMode: 'list',
    ListShowColumn: 1
  }),

  getters: {
    ListDataCount(state: State): number {
      return state.ListDataShow.length
    },
    
    IsListSelected(state: State): boolean {
      return state.ListSelected.size > 0
    },
    
    IsListSelectedMulti(state: State): boolean {
      return state.ListSelected.size > 1
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
    
    IsListSelectedFavAll(state: State): boolean {
      let list = state.ListDataShow
      let len = list.length
      let isAllFav = true

      for (let i = 0, maxi = len; i < maxi; i++) {
        if (state.ListSelected.has(list[i].file_id)) {
          if (!list[i].starred) {
            isAllFav = false 
            break
          }
        }
      }

      return isAllFav
    },
    SelectDirType(state: State): string {
      let file_id = state.DirID
      if (file_id == 'recover') return 'recover'
      if (file_id == 'trash') return 'trash'
      if (file_id == 'favorite') return 'favorite'
      if (file_id.startsWith('search')) return 'search'
      if (file_id.startsWith('color')) return 'color'
      if (file_id.startsWith('video')) return 'video'
      return 'pan'
    },
    FileOrderDesc(state: State): string {
      switch (state.ListOrderKey) {
        case 'name desc':
          return '名称 · 降'
        case 'name asc':
          return '名称 · 升'
        case 'updated_at desc':
          return '时间 · 降'
        case 'updated_at asc':
          return '时间 · 升'
        case 'size desc':
          return '大小 · 降'
        case 'size asc':
          return '大小 · 升'
      }
      return '选择文件排序'
    }
  },

  actions: {
    
    mSaveDirFileLoading(drive_id: string, dir_id: string, dir_name: string) {
      let order = TreeStore.GetDirOrder(drive_id, dir_id)
      if (this.DirID != dir_id || this.DriveID != drive_id) {
        this.$patch({
          DriveID: drive_id,
          DirID: dir_id,
          DirName: dir_name,
          ListOrderKey: order,
          ListLoading: true,
          ListLoadingIndex: 0,
          ListSearchKey: '',
          ListDataRaw: [],
          ListDataShow: [],
          ListDataGrid: [],
          ListSelected: new Set(),
          ListFocusKey: '',
          ListSelectKey: ''
        })
      } else {
        
        this.$patch({ DriveID: drive_id, DirID: dir_id, DirName: dir_name, ListOrderKey: order, ListLoading: true, ListLoadingIndex: 0, ListSearchKey: '', ListDataRaw: [], ListDataShow: [], ListDataGrid: [] })
      }
      useFootStore().mSaveDirInfo('pan', '文件列表加载中...')
    },
    
    mSaveDirFileLoadingPart(pageindex: number, partdir: IAliFileResp, itemsTotal: number = 0) {
      if (pageindex != this.ListLoadingIndex || partdir.m_drive_id != this.DriveID || partdir.m_dir_id != this.DirID) {
        
        partdir.next_marker = 'cancel'
      } else {
        this.ListLoadingIndex++
        this.ListDataRaw = this.ListDataRaw.concat(partdir.items)
        this.mRefreshListDataShow(true) 

        if (itemsTotal > 0) useFootStore().mSaveDirInfo('pan', '文件列表加载中...　总共:' + itemsTotal)
      }
    },
    
    mSaveDirFileLoadingFinish(drive_id: string, dir_id: string, list: Item[], itemsTotal: number = 0) {
      if (this.DirID && (drive_id != this.DriveID || dir_id != this.DirID)) return 

      if (list.length == 0) {
        
        this.ListDataRaw = []
        this.mRefreshListDataShow(true) 
      }

      this.$patch({ ListLoading: false, ListLoadingIndex: 0 })
      this.mRefreshListDataShow(true) 

      
      let paninfo = ''
      if (itemsTotal == -1) paninfo = ''
      else if (list.length == 0 && itemsTotal == 0) paninfo = '空文件夹'
      else {
        let dircount = 0
        let filecount = 0
        list.map((t) => {
          if (t.isdir) dircount++
          else filecount++
        })
        paninfo = '文件夹:' + dircount + '　文件:' + filecount + '　总共:' + itemsTotal
      }
      useFootStore().mSaveDirInfo('pan', paninfo)
    },
    
    mSearchListData(value: string) {
      
      this.$patch({ ListSelected: new Set<string>(), ListFocusKey: '', ListSelectKey: '', ListSearchKey: value })
      this.mRefreshListDataShow(true) 
    },
    
    mOrderListData(value: string) {
      if (!value || value == this.ListOrderKey) return 
      TreeStore.SaveDirOrder(this.DriveID, this.DirID, value)
      
      this.$patch({ ListOrderKey: value, ListSelected: new Set<string>(), ListFocusKey: '', ListSelectKey: '' })
      PanDAL.aReLoadOneDirToShow('', 'refresh', false) 
    },
    
    mGridListData(value: string, column: number) {
      if (this.ListShowMode == value && this.ListShowColumn == column) return 
      this.$patch({ ListShowMode: value == 'list' ? 'list' : 'grid', ListShowColumn: value == 'list' ? 1 : column })
      this.mRefreshListDataShow(true) 
    },

    
    mRefreshListDataShow(refreshRaw: boolean) {
      if (!refreshRaw) {
        let ListDataShow = this.ListDataShow.concat()
        Object.freeze(ListDataShow)
        let ListDataGrid = this.ListDataGrid.concat()
        Object.freeze(ListDataGrid)
        this.$patch({ ListDataShow: ListDataShow, ListDataGrid: ListDataGrid })
        return
      }
      let showlist: Item[] = []

      if (this.ListSearchKey) {
        
        let results = fuzzysort.go(this.ListSearchKey, this.ListDataRaw, {
          threshold: -200000,
          keys: ['name', 'namesearch'],
          scoreFn: (a) => Math.max(a[0] ? a[0].score : -200000, a[1] ? a[1].score : -200000)
        })
        for (let i = 0, maxi = results.length; i < maxi; i++) {
          if (results[i].score > -200000) showlist.push(results[i].obj)
        }
      } else {
        
        showlist = this.ListDataRaw.concat() 
      }

      Object.freeze(showlist)
      
      let gridlist: GridItem[] = []
      let column = this.ListShowColumn
      for (let i = 0, maxi = showlist.length; i < maxi; i += column) {
        let grid: GridItem = {
          file_id: showlist[i].file_id,
          files: [showlist[i]]
        }
        for (let j = 1; j < column && i + j < maxi; j++) {
          grid.files.push(showlist[i + j])
        }
        gridlist.push(grid)
      }
      Object.freeze(gridlist)
      
      let oldSelected = this.ListSelected
      let newSelected = new Set<string>()
      let key = ''
      for (let i = 0, maxi = showlist.length; i < maxi; i++) {
        key = showlist[i][KEY]
        if (oldSelected.has(key)) newSelected.add(key) 
      }
      this.$patch({ ListDataShow: showlist, ListDataGrid: gridlist, ListSelected: newSelected })
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
    mRangSelect(lastkey: string, fileidlist: string[]) {
      if (this.ListDataShow.length == 0) return
      let selectedNew = new Set<string>(this.ListSelected)
      for (let i = 0, maxi = fileidlist.length; i < maxi; i++) {
        selectedNew.add(fileidlist[i])
      }
      this.$patch({ ListSelected: selectedNew, ListFocusKey: lastkey, ListSelectKey: lastkey })
      this.mRefreshListDataShow(false) 
    },
    
    GetSelected() {
      return GetSelectedList(this.ListDataShow, KEY, this.ListSelected)
    },
    
    GetSelectedID() {
      return GetSelectedListID(this.ListDataShow, KEY, this.ListSelected)
    },
    
    GetSelectedParentDirID() {
      return GetSelectedListID(this.ListDataShow, 'parent_file_id', this.ListSelected)
    },
    
    GetSelectedFirst(): Item | undefined {
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
    
    mDeleteFiles(dir_id: string, fileidlist: string[], needDelDir: boolean) {
      if (this.DirID == dir_id || dir_id == 'any') {
        let filemap = new Set(fileidlist)
        let ListDataRaw = this.ListDataRaw
        let NewDataList: Item[] = []
        let diridlist: string[] = [] 
        let deleteCount = 0
        for (let i = 0, maxi = ListDataRaw.length; i < maxi; i++) {
          let item = ListDataRaw[i]
          if (filemap.has(item.file_id)) {
            
            deleteCount++
            if (item.isdir) diridlist.push(item.file_id)
          } else {
            NewDataList.push(item)
          }
        }
        if (deleteCount > 0) {
          this.ListDataRaw = NewDataList
          this.mRefreshListDataShow(true) 
        }
      }
      if (needDelDir) {
        
        TreeStore.DeleteDirs(this.DriveID, fileidlist)
        
        PanDAL.RefreshPanTreeAllNode(this.DriveID) 
      }
    },
    mFavorFiles(isfavor: boolean, fileidlist: string[]) {
      let ListDataRaw = this.ListDataRaw
      let isChange = false
      let filemap = new Set(fileidlist)
      for (let i = 0, maxi = ListDataRaw.length; i < maxi; i++) {
        let item = ListDataRaw[i]
        if (filemap.has(item.file_id)) {
          item.starred = isfavor
          isChange = true
        }
      }
      if (isChange) this.mRefreshListDataShow(false) 
    },
    mColorFiles(color: string, fileidlist: string[]) {
      let ListDataRaw = this.ListDataRaw
      let isChange = false
      let filemap = new Set(fileidlist)
      for (let i = 0, maxi = ListDataRaw.length; i < maxi; i++) {
        let item = ListDataRaw[i]
        if (filemap.has(item.file_id)) {
          item.description = color
          isChange = true
        }
      }
      if (isChange) this.mRefreshListDataShow(false) 
    },
    mRenameFiles(filelist: { file_id: string; parent_file_id: string; name: string; isdir: boolean }[]) {
      let ListDataRaw = this.ListDataRaw
      let isChange = false
      let filemap = ArrayToMap('file_id', filelist)
      for (let i = 0, maxi = ListDataRaw.length; i < maxi; i++) {
        let item = ListDataRaw[i]
        let newfile = filemap.get(item.file_id)
        if (newfile) {
          item.name = newfile.name
          isChange = true
        }
      }
      if (isChange) this.mRefreshListDataShow(false) 
    }
  }
})

export default usePanFileStore
