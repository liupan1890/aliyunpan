<script lang="ts">
import { computed, defineComponent, h, ref } from 'vue'
import message from '../../utils/message'
import { useFootStore, useSettingStore, useWinStore } from '../../store'

import { Tree as AntdTree } from 'ant-design-vue'
import 'ant-design-vue/es/tree/style/css'
import { modalCloseAll, modalSelectPanDir } from '../../utils/modal'
import PanDAL from '../../pan/pandal'
import { treeSelectToExpand } from '../../utils/antdtree'
import AliFile from '../../aliapi/file'
import ServerHttp from '../../aliapi/server'
import AliArchive, { ILinkTxt, ILinkTxtFile } from '../../aliapi/archive'
import DebugLog from '../../utils/debuglog'
import { humanSize, Sleep } from '../../utils/format'
import { IAliFileItem } from '../../aliapi/alimodels'

interface TreeNodeData {
  key: string
  title: string
  fileName: string
  isLeaf: boolean
  children: TreeNodeData[]
  icon: any
  isDir: boolean
  size: number
}

export interface CheckNode {
  file_id: string
  name: string
  halfChecked: boolean
  isDir: boolean
  children: CheckNode[]
}

const folderIconFn = () => h('i', { class: 'iconfont iconfile-folder' })
const fileIconFn = () => h('i', { class: 'iconfont iconwenjian' })

function getDirSize(sizeInfo: { size: number; dirCount: number; fileCount: number }, treeData: TreeNodeData[], linkList: ILinkTxt[], dirMap: Set<string>) {
  for (let n = 0; n < linkList.length; n++) {
    const item = linkList[n]
    const children: TreeNodeData[] = []
    getDirSize(sizeInfo, children, item.dirList, dirMap)
    sizeInfo.dirCount += item.dirList.length
    sizeInfo.fileCount += item.fileList.length
    for (let d = 0; d < item.fileList.length; d++) {
      const fileItem = item.fileList[d] as ILinkTxtFile
      sizeInfo.size += fileItem.size
      children.push({
        key: fileItem.key,
        title: fileItem.name + '　 - ' + humanSize(fileItem.size),
        fileName: fileItem.name,
        icon: fileIconFn,
        isDir: false,
        isLeaf: true,
        size: fileItem.size,
        children: []
      } as TreeNodeData)
    }
    treeData.push({
      key: item.key || '',
      title: item.name,
      fileName: item.name,
      icon: folderIconFn,
      isDir: true,
      isLeaf: false,
      size: 0,
      children
    } as TreeNodeData)
    dirMap.add(item.key || '')
  }
}

export default defineComponent({
  components: {
    AntdTree
  },
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    user_id: {
      type: String,
      required: true
    },
    drive_id: {
      type: String,
      required: true
    },
    file_id: {
      type: String,
      required: true
    },
    file_name: {
      type: String,
      required: true
    },
    parent_file_id: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const winStore = useWinStore()
    const treeHeight = computed(() => (winStore.height * 8) / 10 - 126)
    const okLoading = ref(false)
    const saveInfo = ref('')
    const fileLoading = ref(true)
    const fileInfo = ref<IAliFileItem | undefined>(undefined)
    const handleOpen = async () => {
      treeData.value = []
      treeExpandedKeys.value = []
      treeSelectedKeys.value = []
      treeCheckedKeys.value = []
      saveInfo.value = ''
      fileInfo.value = await AliFile.ApiFileInfo(props.user_id, props.drive_id, props.file_id)
      if (!fileInfo.value) {
        message.error('在线解压失败，操作取消')
        return
      }
      if (useSettingStore().yinsiZipPassword) ServerHttp.PostToServer({ cmd: 'PostZipPwd', sha1: fileInfo.value.content_hash, size: fileInfo.value.size, password: props.password })
      const resp = await AliArchive.ApiArchiveList(props.user_id, props.drive_id, props.file_id, fileInfo.value.domain_id, fileInfo.value.file_extension || '', props.password)
      if (!resp) {
        message.error('在线预览失败 获取解压信息出错，操作取消')
        return
      }
      if (resp.state == '密码错误') {
        message.error('在线解压失败 密码错误，操作取消')
        return
      }
      if (resp.state == 'Running') {
        
        fileLoading.value = true
        try {
          while (resp.state == 'Running') {
            const status = await AliArchive.ApiArchiveStatus(props.user_id, props.drive_id, props.file_id, fileInfo.value.domain_id, resp.task_id)
            if (!status) continue
            if (status.state == 'Running') {
              
              saveInfo.value = '正在解析压缩包中，进度 ' + status.progress + '%'
              await Sleep(500)
              continue
            } else if (status.state == 'Succeed') {
              resp.state = 'Succeed'
              resp.file_list = status.file_list
            } else {
              message.error('解析压缩包失败 ' + status.state + '，操作取消')
              DebugLog.mSaveDanger('解析压缩包失败 ' + status.state, props.drive_id + ' ' + props.file_id)
              break
            }
          }
        } catch (err: any) {
          DebugLog.mSaveDanger('解析压缩包出错', err)
        }
        fileLoading.value = false
      }
      if (resp.state != 'Succeed') {
        message.error('解析压缩包失败 ' + resp.state + '，操作取消')
        DebugLog.mSaveDanger('解析压缩包失败 ' + resp.state, props.drive_id + ' ' + props.file_id)
        return
      }
      fileLoading.value = false
      
      const treeList: TreeNodeData[] = []
      const sizeInfo = { size: 0, dirCount: 0, fileCount: 0 }
      try {
        resp.file_list.name = fileInfo.value.name
        resp.file_list.size = fileInfo.value.size
        const dirMap = new Set<string>()
        getDirSize(sizeInfo, treeList, [resp.file_list], dirMap)
        Object.freeze(treeList)
        treeData.value = treeList
        treeExpandedKeys.value = Array.from(dirMap) 
        treeCheckedKeys.value = Array.from(dirMap) 
      } catch {}
      saveInfo.value = '包含 ' + sizeInfo.dirCount.toString() + '个文件夹，' + sizeInfo.fileCount.toString() + '个文件，共 ' + humanSize(sizeInfo.size)
    }

    const handleClose = () => {
      
      if (okLoading.value) okLoading.value = false

      treeData.value = []
      treeExpandedKeys.value = []
      treeSelectedKeys.value = []
      treeCheckedKeys.value = []
      saveInfo.value = ''
    }

    const treeref = ref()
    const treeData = ref<TreeNodeData[]>([])
    const treeExpandedKeys = ref<string[]>([])
    const treeSelectedKeys = ref<string[]>([])
    const treeCheckedKeys = ref<string[]>([])

    return { okLoading, fileLoading, saveInfo, handleOpen, handleClose, treeHeight, treeref, treeSelectToExpand, treeData, treeExpandedKeys, treeSelectedKeys, treeCheckedKeys, fileInfo }
  },
  methods: {
    handleHide() {
      modalCloseAll()
    },

    handleOK(savetype: string) {
      const checkedKeys = savetype == 'all' ? [] : this.treeref.checkedKeys
      const domain_id = (this.fileInfo as IAliFileItem).domain_id || ''
      const file_extension = (this.fileInfo as IAliFileItem).file_extension || ''
      modalSelectPanDir('unzip', this.parent_file_id, async (user_id: string, drive_id: string, dirID: string) => {
        if (!drive_id || !dirID) return 

        const result = await AliArchive.ApiArchiveUncompress(this.user_id, this.drive_id, this.file_id, domain_id, file_extension, drive_id, dirID, this.password, checkedKeys)
        if (result) {
          if (result.state == 'Succeed') {
            message.success('在线解压成功')
            PanDAL.GetDirFileList(user_id, drive_id, dirID, '')
          } else if (result.state == 'Running') {
            
            message.warning('在线解压异步执行中...')
            useFootStore().mAddTaskZip(user_id, result.task_id, '解压', this.file_name, drive_id, dirID, this.drive_id, this.file_id, domain_id)
          } else {
            message.error('在线解压出错')
          }
        } else {
          message.error('保存文件出错')
        }
      })
    }
  }
})
</script>

<template>
  <a-modal :visible="visible" modal-class="modalclass showsharemodal" title-align="start" :footer="false" :unmount-on-close="true" :mask-closable="false" @cancel="handleHide" @before-open="handleOpen" @close="handleClose">
    <template #title>
      <div class="modaltitle">
        <span class="onerowtitle">{{ file_name }}</span>
      </div>
    </template>
    <div class="modalbody" style="width: 80vw; max-width: 860px; height: calc(80vh - 100px); padding-bottom: 16px">
      <a-spin :loading="fileLoading" :style="{ width: 'calc(100%)', height: '100%', overflow: 'hidden' }" :tip="saveInfo">
        <AntdTree
          ref="treeref"
          v-model:expandedKeys="treeExpandedKeys"
          v-model:selectedKeys="treeSelectedKeys"
          v-model:checkedKeys="treeCheckedKeys"
          :tree-data="treeData"
          :tabindex="-1"
          :focusable="false"
          class="sharetree"
          :checkable="true"
          block-node
          selectable
          :auto-expand-parent="false"
          show-icon
          :height="treeHeight"
          :style="{ height: treeHeight + 'px' }"
          :show-line="{ showLeafIcon: false }"
          @select="treeSelectToExpand">
          <template #switcherIcon>
            <i class="ant-tree-switcher-icon iconfont Arrow" />
          </template>
          <template #title="{ dataRef }">
            <span class="sharetitleleft">{{ dataRef.title }}</span>
            <span class="sharetitleright">{{ dataRef.sizeStr }}</span>
          </template>
        </AntdTree>
      </a-spin>
    </div>
    <div class="modalfoot">
      <div class="tips">{{ saveInfo }}</div>
      <div style="flex-grow: 1"></div>
      <a-button v-if="!okLoading" type="outline" size="small" tabindex="-1" @click="handleHide">取消</a-button>
      <a-button :disabled="fileLoading" type="outline" size="small" tabindex="-1" :loading="okLoading" @click="() => handleOK('check')">解压勾选的</a-button>
      <a-button :disabled="fileLoading" type="primary" size="small" tabindex="-1" :loading="okLoading" @click="() => handleOK('all')">解压全部</a-button>
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
