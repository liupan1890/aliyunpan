import { IAliGetFileModel } from '@/aliapi/models'
import React from 'react'
import Grid from 'react-virtualized/dist/commonjs/Grid'
import VList from 'react-virtualized/dist/commonjs/List'
import { Effect, ImmerReducer } from 'umi'

export interface FileModelState {
  selectDirFileLoading: boolean
  selectedFiles: Map<string, boolean>
  selectedFileLast: string
  refresh: number
}

export interface FileModelType {
  namespace: 'file'
  state: FileModelState
  effects: {
    aLoadDirFiles: Effect
  }
  reducers: {
    mClearSelectDirFiles: ImmerReducer<FileModelState>
    mClearSelectedFiles: ImmerReducer<FileModelState>
    mSaveSelectDirFiles: ImmerReducer<FileModelState>
    mChangSelectedFile: ImmerReducer<FileModelState>
    mChangSelectedFileRang: ImmerReducer<FileModelState>
    mFavor: ImmerReducer<FileModelState>
    mDescription: ImmerReducer<FileModelState>
  }
}
export const PanFileListRef = React.createRef<VList>()
export const PanFileGridRef = React.createRef<Grid>()

export let selectDirFileList: IAliGetFileModel[] = []
const FileModel: FileModelType = {
  namespace: 'file',
  state: {
    selectDirFileLoading: false,
    selectedFiles: new Map<string, boolean>(),
    selectedFileLast: '',
    refresh: 0
  },
  effects: {
    *aLoadDirFiles({ loading, drive_id, file_id, items }, { call, put, select }) {
      const { selectDir } = yield select((state: any) => {
        return { selectDir: state.treedir.selectDir }
      })
      if (selectDir.drive_id == drive_id && selectDir.file_id == file_id) {
        yield put({ type: 'mSaveSelectDirFiles', loading, items })
      }
    }
  },
  reducers: {
    mClearSelectDirFiles(state, action) {
      selectDirFileList = []
      state.selectDirFileLoading = false
      state.selectedFiles = new Map<string, boolean>()
      state.selectedFileLast = ''
      state.refresh++
    },
    mClearSelectedFiles(state, action) {
      state.selectedFiles = new Map<string, boolean>()
      state.selectedFileLast = ''
      state.refresh++
    },
    mSaveSelectDirFiles(state, action) {
      state.selectDirFileLoading = action.loading
      if (action.items.length == 0) selectDirFileList = []
      else {
        selectDirFileList = action.items
        const selectedFiles = new Map<string, boolean>()
        const selected = state.selectedFiles
        for (let i = 0, maxi = selectDirFileList.length; i < maxi; i++) {
          if (selected.has(selectDirFileList[i].file_id)) selectedFiles.set(selectDirFileList[i].file_id, true)
        }
        state.selectedFiles = selectedFiles
      }
      state.refresh++
    },

    mChangSelectedFile(state, action) {
      const file_id = action.file_id
      if (file_id === 'all') {
        state.selectedFileLast = ''
        const s = new Map<string, boolean>()
        if (state.selectedFiles.size != selectDirFileList.length) {
          const children = selectDirFileList
          for (let i = 0, maxi = children.length; i < maxi; i++) {
            s.set(children[i].file_id, true)
          }
        }
        state.selectedFiles = s
        state.refresh = state.refresh + 1
        return
      }

      let shift = action.shift as boolean
      let ctrl = action.ctrl as boolean
      let add = action.add as boolean
      if (shift) {
        if (!state.selectedFileLast || state.selectedFileLast == file_id) {
          ctrl = true
        } else {
          const s = new Map(state.selectedFiles)
          const children = selectDirFileList
          let a = -1
          let b = -1
          for (let i = 0, maxi = children.length; i < maxi; i++) {
            if (children[i].file_id == file_id) a = i
            if (children[i].file_id == state.selectedFileLast) b = i
            if (a > 0 && b > 0) break
          }
          if (a < 0 || b < 0 || a == b) {
            ctrl = true
          } else {
            if (a > b) [a, b] = [b, a]
            for (let n = a; n <= b; n++) {
              s.set(children[n].file_id, true)
            }
            state.selectedFileLast = file_id
            Object.freeze(s)
            state.selectedFiles = s
            state.refresh = state.refresh + 1
            return
          }
        }
      }

      if (ctrl) {
        if (state.selectedFiles.has(file_id)) state.selectedFiles.delete(file_id)
        else state.selectedFiles.set(file_id, true)
        state.selectedFileLast = file_id
        state.refresh = state.refresh + 1
        return
      }

      if (add) {
        state.selectedFiles.set(file_id, true)
        state.selectedFileLast = file_id
        state.refresh = state.refresh + 1
        return
      }

      if (!file_id) state.selectedFiles = new Map<string, boolean>()
      else if (action.forceselect) state.selectedFiles = new Map<string, boolean>([[file_id, true]])
      else if (state.selectedFiles.has(file_id) && state.selectedFiles.size == 1) state.selectedFiles = new Map<string, boolean>()
      else state.selectedFiles = new Map<string, boolean>([[file_id, true]])

      state.selectedFileLast = file_id
      state.refresh = state.refresh + 1
    },
    mChangSelectedFileRang(state, action) {
      state.selectedFileLast = ''
      const s = new Map(state.selectedFiles)
      const filelist = action.filelist
      for (let i = 0, maxi = filelist.length; i < maxi; i++) {
        s.set(filelist[i], true)
      }
      state.selectedFiles = s
      state.refresh = state.refresh + 1
    },
    mFavor(state, action) {
      const isfavor = action.isfavor
      const fileidlist = action.fileidlist as string[]
      const fileidobj = new Map<string, boolean>()
      for (let i = 0, maxi = fileidlist.length; i < maxi; i++) {
        fileidobj.set(fileidlist[i], true)
      }

      for (let i = 0, maxi = selectDirFileList.length; i < maxi; i++) {
        if (fileidobj.has(selectDirFileList[i].file_id)) selectDirFileList[i].starred = isfavor
      }
      state.refresh = state.refresh + 1
    },
    mDescription(state, action) {
      const description = action.description
      const fileidlist = action.fileidlist as string[]
      const fileidobj = new Map<string, boolean>()
      for (let i = 0, maxi = fileidlist.length; i < maxi; i++) {
        fileidobj.set(fileidlist[i], true)
      }

      for (let i = 0, maxi = selectDirFileList.length; i < maxi; i++) {
        if (fileidobj.has(selectDirFileList[i].file_id)) selectDirFileList[i].description = description
      }
      state.refresh = state.refresh + 1
    }
  }
}

export default FileModel
