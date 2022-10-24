import { defineStore } from 'pinia'
import { IAliGetDirModel } from '../aliapi/alimodels'
import { h } from 'vue'
import PanDAL from './pandal'
import TreeStore, { TreeNodeData } from '../store/treestore'

export interface PanTreeState {
  user_id: string
  drive_id: string
  
  History: IAliGetDirModel[]
  
  selectDir: IAliGetDirModel
  
  selectDirPath: IAliGetDirModel[]
  
  treeData: TreeNodeData[]
  
  treeExpandedKeys: string[]
  
  treeSelectedKeys: string[]
  
  quickData: TreeNodeData[]
  
  scrollToDir: string
}
let treeDataMap = new Map<string, TreeNodeData>()
type State = PanTreeState

export const fileiconfn = (icon: string) => h('i', { class: 'iconfont ' + icon })

const usePanTreeStore = defineStore('pantree', {
  state: (): State => ({
    user_id: '',
    drive_id: '',
    History: [],
    selectDir: {
      __v_skip: true,
      drive_id: '',
      file_id: '',
      parent_file_id: '',
      name: '',
      namesearch: '',
      size: 0,
      time: 0,
      description: ''
    },
    selectDirPath: [],
    treeData: [
      { __v_skip: true, title: '文件恢复', namesearch: '', key: 'recover', icon: () => fileiconfn('iconrecover'), isLeaf: true, children: [] },
      { __v_skip: true, title: '回收站', namesearch: '', key: 'trash', icon: () => fileiconfn('icondelete'), isLeaf: true, children: [] },
      { __v_skip: true, title: '收藏夹', namesearch: '', key: 'favorite', icon: () => fileiconfn('iconcrown'), isLeaf: true, children: [] },
      { __v_skip: true, title: '全盘搜索', namesearch: '', key: 'search', icon: () => fileiconfn('iconsearch'), isLeaf: true, children: [] },
      { __v_skip: true, title: '根目录', namesearch: '', key: 'root', children: [] }
    ],
    treeExpandedKeys: ['root'],
    treeSelectedKeys: [],
    quickData: [],
    scrollToDir: ''
  }),

  getters: {},

  actions: {
    
    mTreeSelected(key: string) {
      console.log('mTreeSelected', key)
      PanDAL.aReLoadOneDirToShow('', key, true)
    },
    
    mTreeExpand(key: string) {
      console.log('mTreeExpand', key)
      const arr = this.treeExpandedKeys
      if (arr.includes(key)) {
        
        const dirPath = TreeStore.GetDirPath(this.drive_id, this.selectDir.file_id)
        const needSelectNew = dirPath.filter((t) => t.parent_file_id == key).length > 0
        this.treeExpandedKeys = arr.filter((t) => t != key)
        if (needSelectNew) PanDAL.aReLoadOneDirToShow('', key, false) 
      } else {
        
        this.treeExpandedKeys = arr.concat([key])
        PanDAL.RefreshPanTreeAllNode(this.drive_id) 
      }
    },
    
    mTreeExpandAll(keyList: string[], isExpaned: boolean) {
      const arr = new Set(this.treeExpandedKeys)
      if (isExpaned) {
        for (let i = 0, maxi = keyList.length; i < maxi; i++) {
          arr.add(keyList[i])
        }
      } else {
        for (let i = 0, maxi = keyList.length; i < maxi; i++) {
          arr.delete(keyList[i])
        }
      }
      this.treeExpandedKeys = Array.from(arr)
      if (isExpaned) PanDAL.RefreshPanTreeAllNode(this.drive_id) 
    },
    
    mSaveUser(user_id: string, drive_id: string) {
      this.$reset()
      this.$patch({ user_id, drive_id })
    },
    
    mShowDir(dir: IAliGetDirModel, dirPath: IAliGetDirModel[], treeSelectedKeys: string[], treeExpandedKeys: string[]) {
      this.$patch({ selectDir: dir, selectDirPath: dirPath, treeSelectedKeys: treeSelectedKeys, treeExpandedKeys: treeExpandedKeys })
    },
    
    mSaveTreeAllNode(drive_id: string, root: TreeNodeData, rootMap: Map<string, TreeNodeData>) {
      if (this.drive_id !== drive_id) return

      const list: TreeNodeData[] = []
      for (let i = 0, maxi = this.treeData.length; i < maxi; i++) {
        if (this.treeData[i].key == root.key) {
          list.push(root)
        } else list.push(this.treeData[i])
      }

      this.treeData = list
      treeDataMap = rootMap
    },
    
    mSaveTreeOneDirNode(drive_id: string, dirID: string, dirNode: TreeNodeData, dirMap: Map<string, TreeNodeData>) {
      console.log('刷新Tree', dirNode)
      if (this.drive_id !== drive_id) return

      
      const findDir = treeDataMap.get(dirID)
      if (findDir) {
        findDir.children = dirNode.children
        const keys = dirMap.entries()
        for (let i = 0, maxi = dirMap.size; i < maxi; i++) {
          const key = keys.next().value
          treeDataMap.set(key[0], key[1])
        }
        this.treeData = this.treeData.concat()
      }
    },
    
    mRenameFiles(fileList: { file_id: string; parent_file_id: string; name: string; isDir: boolean }[]) {
      let isChange = false
      let isPath = false
      
      const diridList: string[] = []
      for (let i = 0, maxi = fileList.length; i < maxi; i++) {
        const item = fileList[i]
        if (!item.isDir) continue 
        diridList.push(item.file_id)
        const findNode = treeDataMap.get(item.file_id)
        if (findNode) {
          findNode.title = item.name
          isChange = true
        }
        if (this.selectDir.file_id == item.file_id) {
          this.selectDir = Object.assign({}, this.selectDir, { name: item.name }) as IAliGetDirModel
          isChange = true
        }
        
        this.selectDirPath.map((t) => {
          if (t.file_id == item.file_id) {
            t.name = item.name
            isPath = true
          }
          return true
        })
      }

      if (isChange) this.treeData = this.treeData.concat()
      if (isPath) this.selectDirPath = this.selectDirPath.concat()

      
      TreeStore.RenameDirs(this.drive_id, fileList)
    },
    mSaveQuick(list: { key: string; title: string }[]) {
      const nodeList: TreeNodeData[] = []
      for (let i = 0; i < list.length; i++) {
        nodeList.push({
          __v_skip: true,
          key: list[i].key,
          title: list[i].title || list[i].key,
          namesearch: i < 9 ? '快捷键 Ctrl+' + (i + 1) : '',
          children: [],
          isLeaf: true
        } as TreeNodeData)
      }
      Object.freeze(nodeList)
      this.quickData = nodeList
    },
    mSaveTreeScrollTo(dirID: string) {
      if (dirID == 'refresh') dirID = this.selectDir.file_id
      this.scrollToDir = dirID
    }
  }
})

export default usePanTreeStore
