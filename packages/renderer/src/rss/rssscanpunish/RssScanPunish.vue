<script setup lang="ts">
import message from '@/utils/message'
import { humanSize } from '@/utils/format'
import { computed, ref } from 'vue'
import MyLoading from '@/layout/MyLoading.vue'
import { useUserStore, useWinStore } from '@/store'
import UserDAL from '@/user/userdal'
import AliFileCmd from '@/aliapi/filecmd'
import { foldericonfn, LoadScanDir, TreeNodeData, TreeSelectAll, TreeSelectOne, TreeCheckFileChild, NewScanDriver, ResetScanDriver } from '../ScanDAL'
import { DeleteFromScanDataPunish, GetTreeCheckedSize, GetTreeNodes, GetWeiGuiFile } from './scanpunish'

import { Tree as AntdTree, Checkbox as AntdCheckbox } from 'ant-design-vue'
import 'ant-design-vue/es/tree/style/css'
import 'ant-design-vue/es/checkbox/style/css'
import { EventDataNode } from 'ant-design-vue/es/tree'
import { modalSelectPanDir } from '@/utils/modal'

const winStore = useWinStore()
const userStore = useUserStore()
const TreeHeight = computed(() => winStore.height - 268)

const treeref = ref()

const ScanLoading = ref(false)
const ScanLoaded = ref(false)
const DelLoading = ref(false)
const Processing = ref(0)
const ScanCount = ref(0)
const TotalDirCount = ref(0)
const TotalFileCount = ref(0)

const ScanPanData = NewScanDriver('')

const checkedKeys = ref<string[]>([])
const checkedSize = ref(0)
let checkedKeysBak: string[] = []
const expandedKeys = ref<string[]>([])
const TreeData = ref<TreeNodeData[]>([])

const handleSelectAll = () => {
  TreeSelectAll(checkedKeys, checkedKeysBak)
  checkedSize.value = GetTreeCheckedSize(ScanPanData, checkedKeys.value, ShowWeiGui.value, ShowNoShare.value)
}
const handleTreeSelect = (keys: any, info: { node: EventDataNode }) => TreeSelectOne([info.node.key as string], checkedKeys)
const handleTreeCheck = (keys: any, e: any) => {
  TreeCheckFileChild(e.node, checkedKeys)
  checkedSize.value = GetTreeCheckedSize(ScanPanData, checkedKeys.value, ShowWeiGui.value, ShowNoShare.value)
}

const handleReset = () => {
  ScanLoading.value = false
  ScanLoaded.value = false
  DelLoading.value = false
  Processing.value = 0
  ScanCount.value = 0
  TotalDirCount.value = 0

  ResetScanDriver(ScanPanData)

  checkedKeys.value = []
  checkedKeysBak = []
  expandedKeys.value = []
  TreeData.value = []
}

const RefreshTree = (checkall: boolean) => {
  
  let expandedkeys: string[] = []
  let checkedkeys: string[] = []
  let checkedsize = 0
  let TreeDataMap = new Map<string, TreeNodeData>()
  let treedata = GetTreeNodes(ScanPanData, 'root', TreeDataMap, ShowWeiGui.value, ShowNoShare.value)
  Object.freeze(treedata)
  TreeData.value = treedata
  let values = TreeDataMap.values()
  let clen = 0

  for (let i = 0, maxi = TreeDataMap.size; i < maxi; i++) {
    let node = values.next().value as TreeNodeData
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
  ScanCount.value = checkedkeys.length
}

const handleDelete = () => {
  let user = UserDAL.GetUserToken(userStore.userID)
  if (!user || !user.user_id) {
    message.error('账号错误')
    return
  }
  DelLoading.value = true
  AliFileCmd.ApiTrashBatch(user.user_id, user.default_drive_id, checkedKeys.value).then((success: string[]) => {
    DelLoading.value = false
    if (checkedKeys.value.length == checkedKeysBak.length) {
      handleReset() 
    } else {
      
      DeleteFromScanDataPunish(ScanPanData, checkedKeys.value)
      checkedKeys.value = []
      checkedSize.value = 0
      RefreshTree(false)
    }
  })
}

const handleMove = () => {
  let user = UserDAL.GetUserToken(userStore.userID)
  if (!user || !user.user_id) {
    message.error('账号错误')
    return
  }
  modalSelectPanDir('pan', function (user_id: string, drive_id: string, dir_id: string) {
    if (!drive_id || !dir_id) return 
    DelLoading.value = true
    AliFileCmd.ApiMoveBatch(user.user_id, user.default_drive_id, checkedKeys.value, drive_id, dir_id).then((success: string[]) => {
      DelLoading.value = false
      if (checkedKeys.value.length == checkedKeysBak.length) {
        handleReset() 
      } else {
        
        DeleteFromScanDataPunish(ScanPanData, checkedKeys.value)
        checkedKeys.value = []
        checkedSize.value = 0
        RefreshTree(false)
      }
    })
  })
}

const handleScan = () => {
  let user = UserDAL.GetUserToken(userStore.userID)
  if (!user || !user.user_id) {
    message.error('账号错误')
    return
  }
  handleReset()
  ScanLoading.value = true

  const add = () => {
    if (Processing.value < 50) {
      Processing.value++
      setTimeout(add, 1500)
    }
  }
  setTimeout(add, 1500)

  const refresh = () => {
    if (ScanLoading.value) {
      
      RefreshTree(false)
      setTimeout(refresh, 3000)
    }
  }
  setTimeout(refresh, 3000)

  LoadScanDir(user.user_id, user.default_drive_id, TotalDirCount, Processing, ScanPanData)
    .then(() => {
      
      return GetWeiGuiFile(user.user_id, ScanPanData, Processing, ScanCount, TotalFileCount, ScanType.value)
    })
    .catch((err) => {
      message.error(err.message)
    })
    .then(() => {
      
      ScanLoading.value = false
      RefreshTree(true)
      ScanLoaded.value = true
      Processing.value = 0
    })
}


const ShowWeiGui = ref(true)
const ShowNoShare = ref(true)
const ScanType = ref('video')

const handleShowWeiGui = () => {
  ShowWeiGui.value = !ShowWeiGui.value
  RefreshTree(true)
}
const handleShowNoShare = () => {
  ShowNoShare.value = !ShowNoShare.value
  RefreshTree(true)
}
</script>

<template>
  <div class="scanfill rightbg">
    <div class="settingcard scanfix" style="padding: 12px 24px 8px 24px">
      <a-steps>
        <a-step :description="ScanLoaded ? '扫描出 ' + ScanCount + ' 个违规文件' : ScanLoading ? '扫描进度：' + (Processing > 50 ? Math.floor((Processing * 100) / TotalDirCount) + '%' : Processing) : '在网盘中查找一遍'">
          查找
          <template #icon>
            <MyLoading v-if="ScanLoading" />
            <i class="iconfont iconrsearch" v-else />
          </template>
        </a-step>
        <a-step description="手动选择需要删除的">
          勾选
          <template #icon>
            <i class="iconfont iconedit-square" />
          </template>
        </a-step>
        <a-step description="把勾选的放入回收站">
          删除
          <template #icon>
            <i class="iconfont icondelete" />
          </template>
        </a-step>
      </a-steps>
    </div>

    <div class="settingcard scanauto" style="padding: 4px; margin-top: 4px">
      <a-row justify="space-between" align="center" style="margin: 12px; height: 28px; flex-grow: 0; flex-shrink: 0; flex-wrap: nowrap; overflow: hidden">
        <AntdCheckbox :disabled="ScanLoaded == false" :checked="ScanCount > 0 && checkedKeys.length == ScanCount" @click.stop.prevent="handleSelectAll" style="margin-left: 12px; margin-right: 12px">全选</AntdCheckbox>
        <span v-if="ScanLoaded" class="checkedInfo">已选中 {{ checkedKeys.length }} 个文件 {{ humanSize(checkedSize) }}</span>

        <span v-else-if="TotalDirCount > 0" class="checkedInfo">正在列出文件 {{ Processing }} / {{ TotalDirCount }}</span>
        <span v-else class="checkedInfo">网盘中文件很多时，需要扫描很长时间</span>
        <div style="flex: auto"></div>

        <AntdCheckbox v-if="ScanLoaded" v-model:checked="ShowWeiGui" @click.stop.prevent="handleShowWeiGui" style="margin-right: 12px" title="是否显示违规的文件">违规</AntdCheckbox>
        <AntdCheckbox v-if="ScanLoaded" v-model:checked="ShowNoShare" @click.stop.prevent="handleShowNoShare" style="margin-right: 12px" title="是否显示禁止分享的文件">禁止分享</AntdCheckbox>

        <a-button v-if="ScanLoaded" size="small" tabindex="-1" @click="handleReset" style="margin-right: 12px">取消</a-button>
        <a-select v-else size="small" tabindex="-1" style="width: 136px; flex-shrink: 0; margin-right: 12px" :disabled="ScanLoading" v-model:model-value="ScanType">
          <a-option value="video">视频</a-option>
          <a-option value="doc">文档</a-option>
          <a-option value="image">图片</a-option>
          <a-option value="audio">音乐</a-option>
          <a-option value="zip">压缩包</a-option>
          <a-option value="others">其他</a-option>
          <a-option value="size1000">全部>1G</a-option>
          <a-option value="size100">全部>100MB</a-option>
          <a-option value="size10">全部>10MB</a-option>
        </a-select>
        <a-button v-if="ScanLoaded" type="primary" size="small" tabindex="-1" status="danger" @click="handleDelete" :loading="DelLoading" style="margin-right: 12px" title="把选中的文件放入回收站">删除选中</a-button>
        <a-button v-if="ScanLoaded" type="primary" size="small" tabindex="-1" @click="handleMove" :loading="DelLoading">移动选中</a-button>
        <a-button v-else type="primary" size="small" tabindex="-1" @click="handleScan" :loading="ScanLoading">开始扫描违规</a-button>
      </a-row>
      <a-spin v-if="ScanLoading || ScanLoaded" :loading="ScanLoading" tip="耐心等待，很慢的..." :style="{ width: '100%', height: TreeHeight + 'px', overflow: 'hidden' }">
        <AntdTree
          :tabindex="-1"
          :focusable="false"
          ref="treeref"
          checkable
          blockNode
          :selectable="false"
          checkStrictly
          autoExpandParent
          showIcon
          :height="TreeHeight"
          :style="{ height: TreeHeight + 'px' }"
          :showLine="{ showLeafIcon: false }"
          @select="handleTreeSelect"
          @check="handleTreeCheck"
          :expandedKeys="expandedKeys"
          :checkedKeys="checkedKeys"
          :treeData="TreeData"
        >
          <template #switcherIcon>
            <i class="ant-tree-switcher-icon iconfont Arrow" />
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
