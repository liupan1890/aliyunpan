import { IAliGetDirModel } from '@/aliapi/models'
import { CrownIcon, DeleteIcon, FolderIcon, SearchIcon } from '@/components/folder'
import PanDAL from '@/store/pandal'
import PanStore from '@/store/panstore'
import UserDAL from '@/store/userdal'
import { DataNode } from 'antd/lib/tree'
import Tree from 'rc-tree/lib/Tree'
import React from 'react'
import { Effect, ImmerReducer, PanFileGridRef, PanFileListRef } from 'umi'

export const PanTreeRef = React.createRef<Tree>()

let History: IAliGetDirModel[] = []
export interface TreeDirModelState {
  treeData: DataNode[]
  treeExpandedKeys: string[]
  selectDir: IAliGetDirModel
  selectDirPath: IAliGetDirModel[]
  selectDirFileOrder: string
  refresh: number
}
export interface TreeDirModelType {
  namespace: 'treedir'
  state: TreeDirModelState
  effects: {
    aSelectDir: Effect
    aRefreshDirPath: Effect
    aClearSelectDir: Effect
    aExpandedTree: Effect
  }
  reducers: {
    mSaveTreeData: ImmerReducer<TreeDirModelState>
    mTreeExpandedKeys: ImmerReducer<TreeDirModelState>
    mSaveSelectDir: ImmerReducer<TreeDirModelState>
    mClearSelectDir: ImmerReducer<TreeDirModelState>
  }
}

const TreeDirModel: TreeDirModelType = {
  namespace: 'treedir',
  state: {
    treeData: [
      { title: '回收站', key: 'trash', icon: DeleteIcon, isLeaf: true },
      { title: '收藏夹', key: 'favorite', icon: CrownIcon, isLeaf: true },
      { title: '搜索', key: 'search', icon: SearchIcon, isLeaf: true },
      { title: '根目录', key: 'root', icon: FolderIcon }
    ],
    treeExpandedKeys: ['root'],
    selectDir: {
      drive_id: '',
      file_id: '',
      parent_file_id: '',
      name: '',
      size: 0,
      time: 0,
      description: ''
    },
    selectDirPath: [],
    selectDirFileOrder: '',
    refresh: 0
  },
  effects: {
    *aSelectDir({ drive_id, file_id, force }, { put, select }) {
      const { userID, selectDir, treeExpandedKeys } = yield select((state: any) => {
        return { userID: state.user.userID, selectDir: state.treedir.selectDir, treeExpandedKeys: state.treedir.treeExpandedKeys }
      })
      if (!drive_id) drive_id = selectDir.drive_id
      if (!drive_id) return
      if (file_id == 'order') {
        file_id = selectDir.file_id
        PanStore.RefreshTreeData(drive_id, 'order')
      }
      if (file_id == 'refresh') {
        file_id = selectDir.file_id
      }
      const token = UserDAL.GetUserToken(userID)
      if (!token || !token.access_token) return false
      let isBack = file_id == 'back'
      if (isBack) {
        if (History.length > 0) {
          History.splice(0, 1)
          if (History.length > 0) {
            drive_id = History[0].drive_id
            file_id = History[0].file_id
          }
        }
        if (file_id == 'back') {
          History = []
          file_id = 'root'
        }
      }
      const dir = PanStore.GetDir(drive_id, file_id)
      const dirPath = PanStore.GetDirPath(drive_id, file_id)
      if (!dir.file_id || (dirPath.length == 0 && file_id != 'root')) return false
      console.log('aSelectDir', dir)
      if (!isBack && selectDir.file_id != dir.file_id) {
        let history: IAliGetDirModel[] = [dir]
        for (let i = 0, maxi = History.length; i < maxi; i++) {
          const his = History[i]
          history.push(his)
          if (history.length >= 50) break
        }
        History = history
      }

      const samedir = selectDir.file_id == file_id
      PanTreeRef.current?.scrollTo({ key: file_id })
      if (samedir == false) {
        let find = document.getElementsByClassName('ReactVirtualized__Grid')
        if (find && find.length > 0) {
          find[0].scrollTop = 0
        }
      }
      yield put({ type: 'mSaveSelectDir', dir, dirPath })
      console.log(file_id, [...dirPath])
      if (!samedir) yield put({ type: 'file/mClearSelectedFiles' })
      yield put({ type: 'file/mSaveSelectDirFiles', loading: true, items: [] })

      let keys: string[] = ['root'].concat(treeExpandedKeys as string[])
      for (let i = 0; i < dirPath.length; i++) {
        if (keys.includes(dirPath[i].file_id) == false) keys.push(dirPath[i].file_id)
      }
      yield put({ type: 'mTreeExpandedKeys', keys })
      PanDAL.GetDirFileList(userID, dir.drive_id, dir.file_id, force || false)
    },
    *aRefreshDirPath({}, { put, select }) {
      const { selectDir } = yield select((state: any) => {
        return { selectDir: state.treedir.selectDir }
      })
      const dir = PanStore.GetDir(selectDir.drive_id, selectDir.file_id)
      const dirPath = PanStore.GetDirPath(selectDir.drive_id, selectDir.file_id)
      yield put({ type: 'mSaveSelectDir', dir, dirPath })
    },
    *aExpandedTree({ keys }, { put, select }) {
      const { selectDir } = yield select((state: any) => {
        return { selectDir: state.treedir.selectDir }
      })

      if (keys.length == 0) {
        setTimeout(() => {
          PanTreeRef.current?.scrollTo({ key: selectDir.file_id })
        }, 200)
      }

      const dirPath = PanStore.GetDirPath(selectDir.drive_id, selectDir.file_id)
      if (keys.includes('root') == false) keys.push('root')
      for (let i = 0; i < dirPath.length - 1; i++) {
        if (keys.includes(dirPath[i].file_id) == false) keys.push(dirPath[i].file_id)
      }

      yield put({ type: 'mTreeExpandedKeys', keys })
    },
    *aClearSelectDir({}, { put }) {
      History = []
      yield put({ type: 'mClearSelectDir' })
      yield put({ type: 'file/mClearSelectDirFiles' })
    }
  },
  reducers: {
    mSaveTreeData(state, action) {
      if (state.selectDir.drive_id == action.drive_id) {
        let dt = Date.now()
        let list: DataNode[] = []
        for (let i = 0, maxi = state.treeData.length; i < maxi; i++) {
          if (state.treeData[i].key == action.node.key) {
            list.push(action.node)
          } else list.push(state.treeData[i])
        }
        state.treeData = list
        state.treeExpandedKeys = [...state.treeExpandedKeys]
        console.log('updateTreeData', Date.now() - dt, state.treeExpandedKeys)
        state.refresh++
      }
    },
    mTreeExpandedKeys(state, action) {
      if (action.keys) {
        state.treeExpandedKeys = action.keys
        state.refresh++
      }
    },

    mSaveSelectDir(state, action) {
      if (action.dir) {
        state.selectDir = action.dir
        state.selectDirPath = action.dirPath
        state.refresh++
      }
    },

    mClearSelectDir(state, action) {
      state.treeData = [
        { title: '回收站', key: 'trash', icon: DeleteIcon, isLeaf: true },
        { title: '收藏夹', key: 'favorite', icon: CrownIcon, isLeaf: true },
        { title: '搜索', key: 'search', icon: SearchIcon, isLeaf: true },
        { title: '根目录', key: 'root', icon: FolderIcon }
      ]
      state.treeExpandedKeys = ['root']
      state.selectDir = {
        drive_id: '',
        file_id: '',
        parent_file_id: '',
        name: '',
        size: 0,
        time: 0,
        description: ''
      }
      state.selectDirPath = []
      state.selectDirFileOrder = ''
      state.refresh = 0
    }
  }
}

export default TreeDirModel
