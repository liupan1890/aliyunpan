<script setup lang="ts">
import message from '../../utils/message'
import { humanSize } from '../../utils/format'
import { computed, ref, watch } from 'vue'
import MyLoading from '../../layout/MyLoading.vue'
import { useUserStore, useWinStore } from '../../store'
import UserDAL from '../../user/userdal'
import AliFileCmd from '../../aliapi/filecmd'
import { foldericonfn, LoadScanDir, TreeNodeData, TreeSelectAll, TreeSelectOne, TreeCheckFileChild, NewScanDriver, ResetScanDriver } from '../ScanDAL'
import { DeleteFromScanClean, GetTreeNodes, GetCleanFile, GetTreeCheckedSize } from './ScanClean'

import { Tree as AntdTree, Checkbox as AntdCheckbox } from 'ant-design-vue'
import 'ant-design-vue/es/tree/style/css'
import 'ant-design-vue/es/checkbox/style/css'
import { EventDataNode } from 'ant-design-vue/es/tree'

const winStore = useWinStore()
const userStore = useUserStore()
const treeHeight = computed(() => winStore.height - 268)

const treeref = ref()

const scanLoading = ref(false)
const scanLoaded = ref(false)
const delLoading = ref(false)
const Processing = ref(0)
const scanCount = ref(0)
const totalDirCount = ref(0)
const totalFileCount = ref(0)

const ScanPanData = NewScanDriver('')

const checkedKeys = ref<string[]>([])
const checkedSize = ref(0)
let checkedKeysBak: string[] = []
const expandedKeys = ref<string[]>([])
const treeData = ref<TreeNodeData[]>([])

const handleSelectAll = () => {
  TreeSelectAll(checkedKeys, checkedKeysBak)
  checkedSize.value = GetTreeCheckedSize(ScanPanData, checkedKeys.value)
}
const handleTreeSelect = (keys: any, info: { node: EventDataNode }) => TreeSelectOne([info.node.key as string], checkedKeys)
const handleTreeCheck = (keys: any, e: any) => {
  TreeCheckFileChild(e.node, checkedKeys)
  checkedSize.value = GetTreeCheckedSize(ScanPanData, checkedKeys.value)
}

const handleReset = () => {
  scanLoading.value = false
  scanLoaded.value = false
  delLoading.value = false
  Processing.value = 0
  scanCount.value = 0
  totalDirCount.value = 0

  ResetScanDriver(ScanPanData)

  checkedKeys.value = []
  checkedSize.value = 0
  checkedKeysBak = []
  expandedKeys.value = []
  treeData.value = []
}
watch(userStore.$state, handleReset)

const RefreshTree = (checkall: boolean) => {
  
  const expandedkeys: string[] = []
  const checkedkeys: string[] = []
  let checkedsize = 0
  const treeDataMap = new Map<string, TreeNodeData>()
  const treeDataNodes = GetTreeNodes(ScanPanData, 'root', treeDataMap)
  Object.freeze(treeDataNodes)
  treeData.value = treeDataNodes
  const values = treeDataMap.values()
  let clen = 0

  for (let i = 0, maxi = treeDataMap.size; i < maxi; i++) {
    const node = values.next().value as TreeNodeData
    clen = node.children!.length
    node.selectable = clen == 0 && node.icon != foldericonfn
    if (checkall) node.checkable = true
    if (clen > 0) expandedkeys.push(node.key as string) 
    else if (checkall && node.icon != foldericonfn) {
      checkedkeys.push(node.key as string) 
      checkedsize += node.size
    }
  }
  Object.freeze(expandedkeys)
  expandedKeys.value = expandedkeys
  checkedKeys.value = checkedkeys
  checkedSize.value = checkedsize
  checkedKeysBak = checkedkeys.concat() 
  scanCount.value = checkedkeys.length
}

const handleDelete = () => {
  const user = UserDAL.GetUserToken(userStore.user_id)
  if (!user || !user.user_id) {
    message.error('账号错误')
    return
  }
  delLoading.value = true
  AliFileCmd.ApiTrashBatch(user.user_id, user.default_drive_id, checkedKeys.value).then((success: string[]) => {
    delLoading.value = false
    if (checkedKeys.value.length == checkedKeysBak.length) {
      handleReset() 
    } else {
      
      DeleteFromScanClean(ScanPanData, checkedKeys.value)
      checkedKeys.value = []
      checkedSize.value = 0
      RefreshTree(false)
    }
  })
}

const handleScan = () => {
  const user = UserDAL.GetUserToken(userStore.user_id)
  if (!user || !user.user_id) {
    message.error('账号错误')
    return
  }
  handleReset()
  scanLoading.value = true

  const add = () => {
    if (Processing.value < 50) {
      Processing.value++
      setTimeout(add, 1500)
    }
  }
  setTimeout(add, 1500)

  const refresh = () => {
    if (scanLoading.value) {
      
      RefreshTree(false)
      setTimeout(refresh, 3000)
    }
  }
  setTimeout(refresh, 3000)

  LoadScanDir(user.user_id, user.default_drive_id, totalDirCount, Processing, ScanPanData)
    .then(() => {
      
      return GetCleanFile(user.user_id, ScanPanData, Processing, scanCount, totalFileCount, scanType.value)
    })
    .catch((err: any) => {
      message.error(err.message || '扫描失败')
    })
    .then(() => {
      
      scanLoading.value = false
      RefreshTree(true)
      scanLoaded.value = true
      Processing.value = 0
    })
}

const scanType = ref('video')
</script>

<template>
  <div class="scanfill rightbg">
    <div class="settingcard scanfix" style="padding: 12px 24px 8px 24px">
      <a-steps>
        <a-step :description="scanLoaded ? '扫描出 ' + scanCount + ' 个大文件' : scanLoading ? '扫描进度：' + (Processing > 50 ? Math.floor((Processing * 100) / totalDirCount) + '%' : Processing) : '在网盘中查找一遍'">
          查找
          <template #icon>
            <MyLoading v-if="scanLoading" />
            <i v-else class="iconfont iconrsearch" />
          </template>
        </a-step>
        <a-step description="勾选 需要删除的">
          勾选
          <template #icon>
            <i class="iconfont iconedit-square" />
          </template>
        </a-step>
        <a-step description="删除 放入回收站">
          删除
          <template #icon>
            <i class="iconfont icondelete" />
          </template>
        </a-step>
      </a-steps>
    </div>

    <div class="settingcard scanauto" style="padding: 4px; margin-top: 4px">
      <a-row justify="space-between" align="center" style="margin: 12px; height: 28px; flex-grow: 0; flex-shrink: 0; flex-wrap: nowrap; overflow: hidden">
        <AntdCheckbox :disabled="scanLoaded == false" :checked="scanCount > 0 && checkedKeys.length == scanCount" style="margin-left: 12px; margin-right: 12px" @click.stop.prevent="handleSelectAll">全选</AntdCheckbox>
        <span v-if="scanLoaded" class="checkedInfo">已选中 {{ checkedKeys.length }} 个文件 {{ humanSize(checkedSize) }}</span>

        <span v-else-if="totalDirCount > 0" class="checkedInfo">正在列出文件 {{ Processing }} / {{ totalDirCount }}</span>
        <span v-else class="checkedInfo">网盘中文件很多时，需要扫描很长时间</span>
        <div style="flex: auto"></div>

        <a-button v-if="scanLoaded" size="small" tabindex="-1" style="margin-right: 12px" @click="handleReset">取消</a-button>
        <a-select v-else v-model:model-value="scanType" size="small" tabindex="-1" style="width: 136px; flex-shrink: 0; margin-right: 12px" :disabled="scanLoading">
          <a-option value="video">视频>1G</a-option>
          <a-option value="doc">文档>1G</a-option>
          <a-option value="zip">压缩包>1G</a-option>
          <a-option value="others">其他>1G</a-option>
          <a-option value="size5000">全部>5G</a-option>
          <a-option value="size1000">全部>1G</a-option>
          <a-option value="size100">全部>100MB</a-option>
        </a-select>
        <a-button v-if="scanLoaded" type="primary" size="small" tabindex="-1" status="danger" :loading="delLoading" style="margin-right: 12px" title="把选中的文件放入回收站" @click="handleDelete">删除选中</a-button>
        <a-button v-else type="primary" size="small" tabindex="-1" :loading="scanLoading" @click="handleScan">开始扫描大文件</a-button>
      </a-row>
      <a-spin v-if="scanLoading || scanLoaded" :loading="scanLoading" tip="耐心等待，很慢的..." :style="{ width: '100%', height: treeHeight + 'px', overflow: 'hidden' }">
        <AntdTree
          ref="treeref"
          :expanded-keys="expandedKeys"
          :checked-keys="checkedKeys"
          :tree-data="treeData"
          :tabindex="-1"
          :focusable="false"
          class="cleantree"
          checkable
          block-node
          :selectable="false"
          check-strictly
          show-icon
          auto-expand-parent
          :height="treeHeight"
          :style="{ height: treeHeight + 'px' }"
          :show-line="{ showLeafIcon: false }"
          @select="handleTreeSelect"
          @check="handleTreeCheck">
          <template #switcherIcon>
            <i class="ant-tree-switcher-icon iconfont Arrow" />
          </template>
          <template #title="{ dataRef }">
            <span class="cleantitleleft">{{ dataRef.title }}</span>
            <span class="cleantitleright">{{ dataRef.sizeStr }}</span>
          </template>
        </AntdTree>
      </a-spin>
      <a-empty v-else class="beginscan">
        <template #image>
          <i class="iconfont iconrsearch" />
        </template>
        请点击上方 开始扫描 按钮
      </a-empty>
    </div>
  </div>
</template>
<style>
.beginscan {
  margin-top: 15%;
  width: 100%;
}
.beginscan .iconfont {
  font-size: 48px;
}

.cleantree .ant-tree-node-content-wrapper {
  flex: auto;
  display: flex !important;
  flex-direction: row;
}
.cleantree .ant-tree-title {
  flex: auto;
  display: flex !important;
  flex-direction: row;
}
.cleantree .cleantitleleft {
  flex-shrink: 1;
  flex-grow: 1;
  display: -webkit-box;
  max-height: 48px;
  word-break: break-all;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
}

.cleantree .cleantitleright {
  padding-left: 12px;
  padding-right: 12px;
  font-size: 12px;
  color: var(--color-text-3);
  flex-shrink: 0;
  flex-grow: 0;
}
</style>
