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
import { humanSize } from '../../utils/format'
import { IAliFileItem } from 'src/renderer/aliapi/alimodels'

interface TreeNodeData {
  key: string
  title: string
  filename: string
  isLeaf: boolean
  children: TreeNodeData[]
  icon: any
  isdir: boolean
  size: number
}

export interface CheckNode {
  file_id: string
  name: string
  halfChecked: boolean
  isdir: boolean
  children: CheckNode[]
}

const foldericonfn = () => h('i', { class: 'iconfont iconfile-folder' })
const fileiconfn = () => h('i', { class: 'iconfont iconwenjian' })

function getDirSize(sizeinfo: { size: number; dirCount: number; fileCount: number }, treedata: TreeNodeData[], LinkList: ILinkTxt[], dirmap: Set<string>) {
  for (let n = 0; n < LinkList.length; n++) {
    const item = LinkList[n]
    const children: TreeNodeData[] = []
    getDirSize(sizeinfo, children, item.DirList, dirmap)
    sizeinfo.dirCount += item.DirList.length
    sizeinfo.fileCount += item.FileList.length
    for (let d = 0; d < item.FileList.length; d++) {
      let fitem = item.FileList[d] as ILinkTxtFile
      sizeinfo.size += fitem.Size
      children.push({
        key: fitem.Key,
        title: fitem.Name + '　 - ' + humanSize(fitem.Size),
        filename: fitem.Name,
        icon: fileiconfn,
        isdir: false,
        isLeaf: true,
        size: fitem.Size,
        children: []
      })
    }
    treedata.push({
      key: item.Key || '',
      title: item.Name,
      filename: item.Name,
      icon: foldericonfn,
      isdir: true,
      isLeaf: false,
      size: 0,
      children
    })
    dirmap.add(item.Key || '')
  }
}

export default defineComponent({
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
  components: {
    AntdTree
  },
  setup(props) {
    const winStore = useWinStore()
    const TreeHeight = computed(() => (winStore.height * 8) / 10 - 126)
    const okLoading = ref(false)
    const saveInfo = ref('')
    const fileloading = ref(true)
    const fileinfo = ref<IAliFileItem | undefined>(undefined)
    const handleOpen = async () => {
      TreeData.value = []
      TreeExpandedKeys.value = []
      TreeSelectedKeys.value = []
      TreeCheckedKeys.value = []
      saveInfo.value = ''
      fileinfo.value = await AliFile.ApiFileInfo(props.user_id, props.drive_id, props.file_id)
      if (!fileinfo.value) {
        message.error('在线解压失败，操作取消')
        return
      }
      if (useSettingStore().yinsiZipPassword) ServerHttp.PostToServer({ cmd: 'PostZipPwd', sha1: fileinfo.value.content_hash, size: fileinfo.value.size, password: props.password })
      let resp = await AliArchive.ApiArchiveList(props.user_id, props.drive_id, props.file_id, fileinfo.value.domain_id, fileinfo.value.file_extension || '', props.password)
      if (!resp) {
        message.error('在线预览失败 获取解压信息出错，操作取消')
        return
      }
      if (resp.state == '密码错误') {
        message.error('在线解压失败 密码错误，操作取消')
        return
      }
      if (resp.state == 'Running') {
        /** 轮询直到操作成功 */
        fileloading.value = true
        try {
          while (resp.state == 'Running') {
            let status = await AliArchive.ApiArchiveStatus(props.user_id, props.drive_id, props.file_id, fileinfo.value.domain_id, resp.task_id)
            if (!status) continue
            if (status.state == 'Running') {
              /** 更新解压进度信息 */
              saveInfo.value = '正在解析压缩包中，进度 ' + status.progress + '%'
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
        fileloading.value = false
      }
      if (resp.state != 'Succeed') {
        message.error('解析压缩包失败 ' + resp.state + '，操作取消')
        DebugLog.mSaveDanger('解析压缩包失败 ' + resp.state, props.drive_id + ' ' + props.file_id)
        return
      }
      fileloading.value = false
      /** 显示文件列表 */
      const treelist: TreeNodeData[] = []
      let sizeinfo = { size: 0, dirCount: 0, fileCount: 0 }
      try {
        resp.file_list.Name = fileinfo.value.name
        resp.file_list.Size = fileinfo.value.size
        let dirmap = new Set<string>()
        getDirSize(sizeinfo, treelist, [resp.file_list], dirmap)
        Object.freeze(treelist)
        TreeData.value = treelist
        TreeExpandedKeys.value = Array.from(dirmap) /** 展开全部 */
        TreeCheckedKeys.value = Array.from(dirmap) /** 选中全部 */
       
      } catch {}
      saveInfo.value = '包含 ' + sizeinfo.dirCount.toString() + '个文件夹，' + sizeinfo.fileCount.toString() + '个文件，共 ' + humanSize(sizeinfo.size)
    }

    const handleClose = () => {
      /** 关闭窗口时，清理数据  */
      if (okLoading.value) okLoading.value = false

      TreeData.value = []
      TreeExpandedKeys.value = []
      TreeSelectedKeys.value = []
      TreeCheckedKeys.value = []
      saveInfo.value = ''
    }

    const treeref = ref()
    const TreeData = ref<TreeNodeData[]>([])
    const TreeExpandedKeys = ref<string[]>([])
    const TreeSelectedKeys = ref<string[]>([])
    const TreeCheckedKeys = ref<string[]>([])

    return { okLoading, fileloading, saveInfo, handleOpen, handleClose, TreeHeight, treeref, treeSelectToExpand, TreeData, TreeExpandedKeys, TreeSelectedKeys, TreeCheckedKeys, fileinfo }
  },
  methods: {
    handleHide() {
      modalCloseAll()
    },

    handleOK(savetype: string) {
      const checkedKeys = savetype == 'all' ? [] : this.treeref.checkedKeys
      const domain_id = (this.fileinfo as IAliFileItem).domain_id || ''
      const file_extension = (this.fileinfo as IAliFileItem).file_extension || ''
      modalSelectPanDir('unzip', this.parent_file_id, async (user_id: string, drive_id: string, dir_id: string) => {
        if (!drive_id || !dir_id) return /** 没有选择，取消  */

        let result = await AliArchive.ApiArchiveUncompress(this.user_id, this.drive_id, this.file_id, domain_id, file_extension, drive_id, dir_id, this.password, checkedKeys)
        if (result) {
          if (result.state == 'Succeed') {
            message.success('在线解压成功')
            PanDAL.GetDirFileList(user_id, drive_id, dir_id, '')
          } else if (result.state == 'Running') {
            /** 异步执行 */
            message.warning('在线解压异步执行中...')
            useFootStore().mAddTaskZip(user_id, result.task_id, '解压', this.file_name, drive_id, dir_id, this.drive_id, this.file_id, domain_id)
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
  <a-modal :visible="visible" modal-class="modalclass showsharemodal" @cancel="handleHide" @before-open="handleOpen" @close="handleClose" title-align="start" :footer="false" :unmount-on-close="true" :mask-closable="false">
    <template #title>
      <div class="modaltitle">
        <span class="onerowtitle">{{ file_name }}</span>
      </div>
    </template>
    <div class="modalbody" style="width: 80vw; max-width: 860px; height: calc(80vh - 100px); padding-bottom: 16px">
      <AntdTree
        :tabindex="-1"
        :focusable="false"
        ref="treeref"
        class="sharetree"
        :checkable="true"
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
      >
        <template #switcherIcon>
          <i class="ant-tree-switcher-icon iconfont Arrow" />
        </template>
        <template #title="{ dataRef }">
          <span class="sharetitleleft">{{ dataRef.title }}</span>
          <span class="sharetitleright">{{ dataRef.sizestr }}</span>
        </template>
      </AntdTree>
    </div>
    <div class="modalfoot">
      <div class="tips">{{ saveInfo }}</div>
      <div style="flex-grow: 1"></div>
      <a-button v-if="!okLoading" type="outline" size="small" tabindex="-1" @click="handleHide">取消</a-button>
      <a-button :disabled="fileloading" type="outline" size="small" tabindex="-1" :loading="okLoading" @click="() => handleOK('check')">解压勾选的</a-button>
      <a-button :disabled="fileloading" type="primary" size="small" tabindex="-1" :loading="okLoading" @click="() => handleOK('all')">解压全部</a-button>
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
