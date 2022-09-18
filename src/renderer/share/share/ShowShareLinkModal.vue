<script lang="ts">
import { computed, defineComponent, h, PropType, ref } from 'vue'
import dayjs from 'dayjs'
import message from '../../utils/message'
import { IAliShareAnonymous } from '../../aliapi/alimodels'
import AliShare from '../../aliapi/share'
import { humanExpiration } from '../../utils/format'
import { useWinStore } from '../../store'

import { Tree as AntdTree } from 'ant-design-vue'
import 'ant-design-vue/es/tree/style/css'
import { EventDataNode } from 'ant-design-vue/es/tree'
import { modalCloseAll, modalSelectPanDir } from '../../utils/modal'
import ShareDAL from './ShareDAL'
import AliFileCmd from '../../aliapi/filecmd'
import PanDAL from '../../pan/pandal'
import { treeSelectToExpand } from '../../utils/antdtree'

interface TreeNodeData {
  key: string
  title: string
  isLeaf: boolean
  children: TreeNodeData[]
  icon: any
  isdir: boolean
  sizestr: string
}

export interface CheckNode {
  file_id: string
  name: string
  halfChecked: boolean
  isdir: boolean
  children: CheckNode[]
}

const iconfolder = h('i', { class: 'iconfont iconfile-folder' })
const foldericonfn = () => iconfolder
const fileiconfn = (icon: string) => h('i', { class: 'iconfont ' + icon })

export default defineComponent({
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    withsave: {
      type: Boolean,
      required: true
    },
    share_id: {
      type: String,
      required: true
    },
    share_pwd: {
      type: String,
      required: true
    },
    share_token: {
      type: String,
      required: true
    },
    file_id_list: {
      type: Array as PropType<string[]>,
      required: true
    }
  },
  components: {
    AntdTree
  },
  setup(props) {
    const winStore = useWinStore()
    const TreeHeight = computed(() => (winStore.height * 8) / 10 - 126)
    const okLoading = ref(false)
    const share = ref<IAliShareAnonymous | undefined>(undefined)
    const expiration = computed(() => (share.value ? humanExpiration(share.value.shareinfo.expiration) : ''))
    const sharetoken = ref('')
    const file_list = new Set<string>()
    const dir_list = new Set<string>()
    const isAlbum = ref(false)

    const handleOpen = () => {
      file_list.clear()
      dir_list.clear()
      props.file_id_list.map((t) => file_list.add(t))

      AliShare.ApiGetShareAnonymous(props.share_id).then((info) => {
        share.value = info
        isAlbum.value = info.shareinfo.is_photo_collection
        if (props.withsave) ShareDAL.SaveOtherShare(props.share_pwd, info, true)
      })
      TreeExpandedKeys.value = []
      TreeSelectedKeys.value = []
      if (props.share_token) {
        sharetoken.value = props.share_token
        apiLoad('root').then((addlist) => {
          TreeData.value = addlist
        })
      } else {
        AliShare.ApiGetShareToken(props.share_id, props.share_pwd).then((token) => {
          if (token.startsWith('，')) message.error('加载分享链接失败' + token)
          else {
            sharetoken.value = token
            apiLoad('root').then((addlist) => {
              TreeData.value = addlist
            })
          }
        })
      }
    }

    const handleClose = () => {
      
      if (okLoading.value) okLoading.value = false
      share.value = undefined
      sharetoken.value = ''
      file_list.clear()
      dir_list.clear()
      TreeData.value = []
      TreeExpandedKeys.value = []
      TreeSelectedKeys.value = []
      TreeCheckedKeys.value = []
    }

    const treeref = ref()
    const TreeData = ref<TreeNodeData[]>([])
    const TreeExpandedKeys = ref<string[]>([])
    const TreeSelectedKeys = ref<string[]>([])
    const TreeCheckedKeys = ref<string[]>([])

    const onLoadData = (treeNode: EventDataNode) => {
      return new Promise<void>((resolve) => {
        if (sharetoken.value == '' || treeNode.dataRef == undefined || treeNode.dataRef?.children?.length) {
          resolve()
          return
        }
        apiLoad(treeNode.dataRef.key).then((addlist) => {
          treeNode.dataRef!.children = addlist
          if (TreeData.value) TreeData.value = TreeData.value.concat()
          resolve()
        })
      })
    }

    const autoExpand = (list: TreeNodeData[]) => {
      if (list.length < 4) {
        setTimeout(() => {
          for (let i = 0, maxi = list.length; i < maxi; i++) {
            let item = list[i]
            if (item.isLeaf == false) {
              apiLoad(item.key).then((addlist) => {
                item.children = addlist
                if (TreeData.value) TreeData.value = TreeData.value.concat()
                if (TreeExpandedKeys.value) TreeExpandedKeys.value.push(item.key)
              })
            }
          }
        }, 200)
      }
    }

    const apiLoad = (key: any) => {
      return AliShare.ApiShareFileList(props.share_id, sharetoken.value, key as string)
        .then((resp) => {
          const addlist: TreeNodeData[] = []
          if (resp.next_marker == '') {
            for (let i = 0, maxi = resp.items.length; i < maxi; i++) {
              const item = resp.items[i]
              if (item.isdir) dir_list.add(item.file_id)
              addlist.push({
                key: item.file_id,
                title: item.name,
                sizestr: item.sizestr,
                children: [],
                isdir: item.isdir,
                isLeaf: !item.isdir,
                icon: item.isdir ? foldericonfn : () => fileiconfn(item.icon)
              })
            }
            autoExpand(addlist)
          } else {
            message.error('列出分享文件失败：' + resp.next_marker)
          }
          return addlist
        })
        .catch(() => {
          return [] as TreeNodeData[]
        })
    }

    return { okLoading, handleOpen, handleClose, TreeHeight, treeref, treeSelectToExpand, share, isAlbum, sharetoken, expiration, dayjs, TreeData, TreeExpandedKeys, TreeSelectedKeys, TreeCheckedKeys, onLoadData, file_list }
  },
  methods: {
    handleHide() {
      modalCloseAll()
    },

    handleOK(savetype: string) {
      const checkedKeys = this.treeref.checkedKeys
      const checkedMap = new Map<string, boolean>()
      for (let i = 0, maxi = checkedKeys.length; i < maxi; i++) {
        checkedMap.set(checkedKeys[i].toString(), true)
      }
      const halfCheckedKeys = this.treeref.halfCheckedKeys
      const halfCheckedMap = new Map<string, boolean>()
      for (let i = 0, maxi = halfCheckedKeys.length; i < maxi; i++) {
        halfCheckedMap.set(halfCheckedKeys[i].toString(), true)
      }

      const treeData = this.TreeData
      let selectnodes: CheckNode[] = []

      if (savetype == 'all') {
        for (let i = 0, maxi = treeData.length; i < maxi; i++) {
          const item = treeData[i]
          selectnodes.push({ file_id: item.key.toString(), name: item.title!.toString(), isdir: item.isdir, halfChecked: false, children: [] })
        }
      } else if (savetype == 'file') {
        selectnodes = getCheckNodeOnlyFile(treeData, checkedMap, halfCheckedMap)
      } else {
        selectnodes = getCheckNode(treeData, checkedMap, halfCheckedMap)
      }

      let share_id = this.share_id
      let share_token = this.sharetoken 

      modalSelectPanDir('share', '', async function (user_id: string, drive_id: string, dir_id: string) {
        if (!drive_id || !dir_id) return 
        let result = await SaveLink(savetype, share_id, share_token, user_id, drive_id, dir_id, selectnodes)

        if (result == '') message.success('保存文件成功,请稍后手动刷新保存到的文件夹')
        else message.error('保存文件出错,' + result)

        PanDAL.aReLoadOneDirToRefreshTree(user_id, drive_id, dir_id) 
      })
    },

    handleOKAlbum(savetype: string) {
      message.error('暂不支持导入从相册分享的链接')
    }
  }
})


function getCheckNode(list: TreeNodeData[], checkedMap: Map<string, boolean>, halfCheckedMap: Map<string, boolean>) {
  const selectnodes: CheckNode[] = []
  for (let i = 0, maxi = list.length; i < maxi; i++) {
    const item = list[i]
    const key = list[i].key.toString()
    if (checkedMap.has(key)) {
      checkedMap.delete(key)
      
      selectnodes.push({ file_id: key, name: item.title!.toString(), isdir: item.isdir, halfChecked: false, children: [] })
    } else if (item.children && item.children.length > 0) {
      if (halfCheckedMap.has(key)) {
        halfCheckedMap.delete(key)
        
        const child = getCheckNode(item.children, checkedMap, halfCheckedMap)
        selectnodes.push({ file_id: key, name: item.title!.toString(), isdir: item.isdir, halfChecked: true, children: child })
      }
    }
  }
  return selectnodes
}


function getCheckNodeOnlyFile(list: TreeNodeData[], checkedMap: Map<string, boolean>, halfCheckedMap: Map<string, boolean>) {
  const selectnodes: CheckNode[] = []
  for (let i = 0, maxi = list.length; i < maxi; i++) {
    const item = list[i]
    const key = list[i].key.toString()
    if (checkedMap.has(key)) {
      checkedMap.delete(key)
      
      selectnodes.push({ file_id: key, name: item.title!.toString(), isdir: item.isdir, halfChecked: false, children: [] })
    } else if (item.children && item.children.length > 0) {
      if (halfCheckedMap.has(key)) {
        halfCheckedMap.delete(key)
        
        const child = getCheckNodeOnlyFile(item.children, checkedMap, halfCheckedMap)
        for (let j = 0, maxj = child.length; j < maxj; j++) {
          
          if (child[j].halfChecked == false) selectnodes.push(child[j])
        }
      }
    }
  }
  return selectnodes
}


async function SaveLink(savetype: string, shareid: string, sharetoken: string, user_id: string, drive_id: string, parentid: string, nodes: CheckNode[]) {
  let result = ''
  const selectKeys: string[] = []
  const halfNodes: CheckNode[] = []
  for (let i = 0, maxi = nodes.length; i < maxi; i++) {
    if (nodes[i].halfChecked == false) {
      if (nodes[i].isdir && savetype == 'file') {
        
        let filelist = await getNodeAllFiles(shareid, sharetoken, nodes[i].file_id)
        selectKeys.push(...filelist)
      } else {
        selectKeys.push(nodes[i].file_id)
      }
    } else halfNodes.push(nodes[i])
  }
  
  const result1 = await AliShare.ApiSaveShareFilesBatch(shareid, sharetoken, user_id, drive_id, parentid, selectKeys)
  if (result1 !== 'success' && result1 !== 'async') result += ';' + result1 + ' '

  
  for (let i = 0, maxi = halfNodes.length; i < maxi; i++) {
    const half = halfNodes[i]
    
    const data = await AliFileCmd.ApiCreatNewForder(user_id, drive_id, parentid, half.name)
    if (data.file_id) {
      
      const rchild = await SaveLink(savetype, shareid, sharetoken, user_id, drive_id, data.file_id, half.children)
      if (rchild) result += ';' + rchild + ' '
    } else result += ';创建' + half.name + '失败 ' + data.error
  }

  return result
}

async function getNodeAllFiles(shareid: string, sharetoken: string, file_id: string): Promise<string[]> {
  let filelist: string[] = []
  let resp = await AliShare.ApiShareFileList(shareid, sharetoken, file_id)
  if (resp.next_marker == '') {
    for (let i = 0, maxi = resp.items.length; i < maxi; i++) {
      const item = resp.items[i]
      if (item.isdir) {
        let temp = await getNodeAllFiles(shareid, sharetoken, item.file_id)
        filelist.push(...temp)
      } else filelist.push(item.file_id)
    }
  } else {
    message.error('列出分享文件失败：' + resp.next_marker)
  }
  return filelist
}
</script>

<template>
  <a-modal :visible="visible" modal-class="modalclass showsharemodal" @cancel="handleHide" @before-open="handleOpen" @close="handleClose" title-align="start" :footer="false" :unmount-on-close="true" :mask-closable="false">
    <template #title>
      <div class="modaltitle">
        <span class="sharetime">[{{ expiration }}]</span> <span class="sharetitle">{{ share?.shareinfo.share_name }}</span>
      </div>
    </template>
    <div class="modalbody" style="width: 80vw; max-width: 860px; height: calc(80vh - 100px); padding-bottom: 16px">
      <AntdTree
        :tabindex="-1"
        :focusable="false"
        ref="treeref"
        class="sharetree"
        :checkable="withsave"
        blockNode
        selectable
        :autoExpandParent="false"
        showIcon
        :height="TreeHeight"
        :style="{ height: TreeHeight + 'px' }"
        :showLine="{ showLeafIcon: false }"
        @select="treeSelectToExpand"
        v-model:expandedKeys="TreeExpandedKeys"
        v-model:selectedKeys="TreeSelectedKeys"
        v-model:checkedKeys="TreeCheckedKeys"
        :treeData="TreeData"
        :loadData="onLoadData"
      >
        <template #switcherIcon>
          <i class="ant-tree-switcher-icon iconfont Arrow" />
        </template>
        <template #title="{ dataRef }">
          <span :class="'sharetitleleft' + (file_list.has(dataRef.key) ? ' new' : '')">{{ dataRef.title }}</span>
          <span class="sharetitleright">{{ dataRef.sizestr }}</span>
        </template>
      </AntdTree>
    </div>
    <div v-if="withsave && isAlbum == false" class="modalfoot">
      <div style="flex-grow: 1"></div>
      <a-button v-if="!okLoading" type="outline" size="small" tabindex="-1" @click="handleHide">取消</a-button>
      <a-button type="outline" size="small" tabindex="-1" :loading="okLoading" @click="() => handleOK('file')" title="导入勾选的文件(把所有文件都保存到同一个文件夹里)">导入勾选(仅文件)</a-button>
      <a-button type="primary" size="small" tabindex="-1" :loading="okLoading" @click="() => handleOK('folder')" title="按照分享链接内部的路径，导入勾选的文件和文件夹">导入勾选(按路径)</a-button>
      <a-button type="primary" size="small" tabindex="-1" :loading="okLoading" @click="() => handleOK('all')" title="一键导入分享链接内全部文件和文件夹">一键导入全部</a-button>
    </div>
    <div v-if="withsave && isAlbum == true" class="modalfoot">
      <div style="flex-grow: 1"></div>
      <a-button v-if="!okLoading" type="outline" size="small" tabindex="-1" @click="handleHide">取消</a-button>
      <a-button type="primary" size="small" tabindex="-1" :loading="okLoading" @click="() => handleOKAlbum('all')" title="一键导入分享链接内全部文件和文件夹">一键导入全部到相册</a-button>
    </div>
  </a-modal>
</template>
<style>
.showsharemodal .arco-modal-header {
  border-bottom: none;
}

.showsharemodal .arco-modal-body {
  padding: 0 16px 16px 16px !important;
}

.showsharemodal .modaltitle {
  width: 80vw;
  max-width: 860px;
  flex-wrap: nowrap;
  display: flex;
  justify-content: center;
}

.showsharetitle {
  max-width: 500px;
  display: flex;
}

.showsharemodal .sharetime {
  font-size: 12px;
  line-height: 25px;
  color: rgb(var(--primary-6));
  flex-grow: 0;
  flex-shrink: 0;
}
.showsharemodal .sharetitle {
  font-size: 16px;
  line-height: 25px;
  flex-grow: 1;
  white-space: nowrap;
  word-break: keep-all;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 32px;
}

.sharetree {
  border: 1px solid var(--color-neutral-3);
  padding: 4px;
}
.sharetree .ant-tree-icon__customize .iconfont {
  font-size: 18px;
  margin-right: 2px;
}

.sharetree .ant-tree-node-content-wrapper {
  flex: auto;
  display: flex !important;
  flex-direction: row;
}
.sharetree .ant-tree-title {
  flex: auto;
  display: flex !important;
  flex-direction: row;
}
.sharetree .sharetitleleft {
  flex-shrink: 1;
  flex-grow: 1;
  display: -webkit-box;
  max-height: 48px;
  word-break: break-all;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
}

.sharetree .sharetitleleft.new {
  color: rgb(var(--primary-6));
}
.sharetree .sharetitleright {
  padding-left: 12px;
  padding-right: 12px;
  font-size: 12px;
  color: var(--color-text-3);
  flex-shrink: 0;
  flex-grow: 0;
}
</style>
