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

  
  scrollToFile: string
}

type State = PanFileState
const KEY = 'file_id'

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
    ListShowColumn: 1,
    scrollToFile: ''
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
      const list = state.ListDataShow
      const len = list.length
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
      const file_id = state.DirID
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
    
    mSaveDirFileLoading(drive_id: string, dirID: string, dirName: string) {
      const order = TreeStore.GetDirOrder(drive_id, dirID)
      if (this.DirID != dirID || this.DriveID != drive_id) {
        this.$patch({
          DriveID: drive_id,
          DirID: dirID,
          DirName: dirName,
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
        
        this.$patch({ DriveID: drive_id, DirID: dirID, DirName: dirName, ListOrderKey: order, ListLoading: true, ListLoadingIndex: 0, ListSearchKey: '', ListDataRaw: [], ListDataShow: [], ListDataGrid: [] })
      }
      useFootStore().mSaveDirInfo('pan', '文件列表加载中...')
    },
    
    mSaveDirFileLoadingPart(pageIndex: number, partDir: IAliFileResp, itemsTotal: number = 0) {
      if (pageIndex != this.ListLoadingIndex || partDir.m_drive_id != this.DriveID || partDir.dirID != this.DirID) {
        
        partDir.next_marker = 'cancel'
      } else {
        this.ListLoadingIndex++
        this.ListDataRaw = this.ListDataRaw.concat(partDir.items)
        this.mRefreshListDataShow(true) 

        if (itemsTotal > 0) useFootStore().mSaveDirInfo('pan', '文件列表加载中...　总:' + itemsTotal)
      }
    },
    
    mSaveDirFileLoadingFinish(drive_id: string, dirID: string, list: Item[], itemsTotal: number = 0) {
      if (this.DirID && (drive_id != this.DriveID || dirID != this.DirID)) return 

      if (list.length == 0) {
        
        this.ListDataRaw = []
        this.mRefreshListDataShow(true) 
      }

      this.$patch({ ListLoading: false, ListLoadingIndex: 0 })
      this.mRefreshListDataShow(true) 

      
      let panInfo = ''
      if (itemsTotal == -1) panInfo = ''
      else if (list.length == 0 && itemsTotal == 0) panInfo = '空文件夹'
      else {
        let dirCount = 0
        let fileCount = 0
        list.map((t) => {
          if (t.isDir) dirCount++
          else fileCount++
          return true
        })
        panInfo = '文件夹:' + dirCount + '　文件:' + fileCount + '　总:' + itemsTotal
      }
      useFootStore().mSaveDirInfo('pan', panInfo)
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
        const listDataShow = this.ListDataShow.concat()
        Object.freeze(listDataShow)
        const listDataGrid = this.ListDataGrid.concat()
        Object.freeze(listDataGrid)
        this.$patch({ ListDataShow: listDataShow, ListDataGrid: listDataGrid })
        return
      }
      let showList: Item[] = []

      if (this.ListSearchKey) {
        
        const results = fuzzysort.go(this.ListSearchKey, this.ListDataRaw, {
          threshold: -200000,
          keys: ['name', 'namesearch'],
          scoreFn: (a) => Math.max(a[0] ? a[0].score : -200000, a[1] ? a[1].score : -200000)
        })
        for (let i = 0, maxi = results.length; i < maxi; i++) {
          if (results[i].score > -200000) showList.push(results[i].obj)
        }
      } else {
        
        showList = this.ListDataRaw.concat() 
      }

      Object.freeze(showList)
      
      const gridList: GridItem[] = []
      const column = this.ListShowColumn
      for (let i = 0, maxi = showList.length; i < maxi; i += column) {
        const grid: GridItem = {
          file_id: showList[i].file_id,
          files: [showList[i]]
        }
        for (let j = 1; j < column && i + j < maxi; j++) {
          grid.files.push(showList[i + j])
        }
        gridList.push(grid)
      }
      Object.freeze(gridList)
      
      const oldSelected = this.ListSelected
      const newSelected = new Set<string>()
      let key = ''
      for (let i = 0, maxi = showList.length; i < maxi; i++) {
        key = showList[i][KEY]
        if (oldSelected.has(key)) newSelected.add(key) 
      }
      this.$patch({ ListDataShow: showList, ListDataGrid: gridList, ListSelected: newSelected })
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
    mRangSelect(lastkey: string, file_idList: string[]) {
      if (this.ListDataShow.length == 0) return
      const selectedNew = new Set<string>(this.ListSelected)
      for (let i = 0, maxi = file_idList.length; i < maxi; i++) {
        selectedNew.add(file_idList[i])
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
      const list = GetSelectedList(this.ListDataShow, KEY, this.ListSelected)
      if (list.length > 0) return list[0]
      return undefined
    },
    mSetFocus(key: string) {
      this.ListFocusKey = key
      this.mRefreshListDataShow(false) 
    },
    
    mGetFocus(): string {
      if (!this.ListFocusKey && this.ListDataShow.length > 0) return this.ListDataShow[0][KEY]
      return this.ListFocusKey
    },
    
    mGetFocusNext(position: string): string {
      return GetFocusNext(this.ListDataShow, KEY, this.ListFocusKey, position, '')
    },
    
    mDeleteFiles(dirID: string, file_idList: string[], needDelDir: boolean) {
      if (this.DirID == dirID || dirID == 'any') {
        const fileMap = new Set(file_idList)
        const listDataRaw = this.ListDataRaw
        const newDataList: Item[] = []
        const diridList: string[] = [] 
        let deleteCount = 0
        for (let i = 0, maxi = listDataRaw.length; i < maxi; i++) {
          const item = listDataRaw[i]
          if (fileMap.has(item.file_id)) {
            
            deleteCount++
            if (item.isDir) diridList.push(item.file_id)
          } else {
            newDataList.push(item)
          }
        }
        if (deleteCount > 0) {
          this.ListDataRaw = newDataList
          this.mRefreshListDataShow(true) 
        }
      }
      if (needDelDir) {
        
        TreeStore.DeleteDirs(this.DriveID, file_idList)
        
        PanDAL.RefreshPanTreeAllNode(this.DriveID) 
      }
    },
    mFavorFiles(isfavor: boolean, file_idList: string[]) {
      const listDataRaw = this.ListDataRaw
      let isChange = false
      const fileMap = new Set(file_idList)
      for (let i = 0, maxi = listDataRaw.length; i < maxi; i++) {
        const item = listDataRaw[i]
        if (fileMap.has(item.file_id)) {
          item.starred = isfavor
          isChange = true
        }
      }
      if (isChange) this.mRefreshListDataShow(false) 
    },
    mColorFiles(color: string, file_idList: string[]) {
      const listDataRaw = this.ListDataRaw
      let isChange = false
      const fileMap = new Set(file_idList)
      for (let i = 0, maxi = listDataRaw.length; i < maxi; i++) {
        const item = listDataRaw[i]
        if (fileMap.has(item.file_id)) {
          item.description = color
          isChange = true
        }
      }
      if (isChange) this.mRefreshListDataShow(false) 
    },
    mRenameFiles(fileList: { file_id: string; parent_file_id: string; name: string; isDir: boolean }[]) {
      const listDataRaw = this.ListDataRaw
      let isChange = false
      const fileMap = ArrayToMap('file_id', fileList)
      for (let i = 0, maxi = listDataRaw.length; i < maxi; i++) {
        const item = listDataRaw[i]
        const newFile = fileMap.get(item.file_id)
        if (newFile) {
          item.name = newFile.name
          isChange = true
        }
      }
      if (isChange) this.mRefreshListDataShow(false) 
    },
    mSaveFileScrollTo(file_id: string) {
      this.scrollToFile = file_id
    }
  }
})

export default usePanFileStore
