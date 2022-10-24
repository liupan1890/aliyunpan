<script setup lang="ts">
import message from '../../utils/message'
import { computed, ref, watch } from 'vue'
import MyLoading from '../../layout/MyLoading.vue'
import { useUserStore, useWinStore } from '../../store'
import UserDAL from '../../user/userdal'
import AliFileCmd from '../../aliapi/filecmd'
import { LoadScanDir, NewScanDriver, ResetScanDriver, TreeNodeData, TreeSelectAll, TreeSelectOne } from '../ScanDAL'
import { GetEnmptyDir, GetTreeNodes } from './scanenmpty'

import { Tree as AntdTree, Checkbox as AntdCheckbox } from 'ant-design-vue'
import 'ant-design-vue/es/tree/style/css'
import 'ant-design-vue/es/checkbox/style/css'
import { EventDataNode } from 'ant-design-vue/es/tree'
import DB from '../../utils/db'

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

const ScanPanData = NewScanDriver('')

const checkedKeys = ref<string[]>([])
let checkedKeysBak: string[] = []
const expandedKeys = ref<string[]>([])
const treeData = ref<TreeNodeData[]>([])

const handleSelectAll = () => TreeSelectAll(checkedKeys, checkedKeysBak)
const handleTreeSelect = (keys: any, info: { node: EventDataNode }) => TreeSelectOne([info.node.key as string], checkedKeys)
const handleTreeCheck = (keys: any, info: any) => TreeSelectOne([info.node.key as string], checkedKeys)

const handleReset = () => {
  scanLoading.value = false
  scanLoaded.value = false
  delLoading.value = false
  Processing.value = 0
  scanCount.value = 0
  totalDirCount.value = 0

  ResetScanDriver(ScanPanData)

  checkedKeys.value = []
  checkedKeysBak = []
  expandedKeys.value = []
  treeData.value = []
}

watch(userStore.$state, handleReset)

const RefreshTree = () => {
  
  const expandedkeys: string[] = []
  const checkedkeys: string[] = []
  const treeDataMap = new Map<string, TreeNodeData>()
  const treeDataNodes = GetTreeNodes(ScanPanData, 'root', treeDataMap)
  Object.freeze(treeDataNodes)
  treeData.value = treeDataNodes
  const values = treeDataMap.values()
  let clen = 0

  for (let i = 0, maxi = treeDataMap.size; i < maxi; i++) {
    const node = values.next().value as TreeNodeData
    clen = node.children!.length
    node.selectable = clen == 0
    node.checkable = true
    node.disableCheckbox = clen !== 0 
    if (clen > 0) expandedkeys.push(node.key as string) 
    else checkedkeys.push(node.key as string) 
  }
  Object.freeze(expandedkeys)
  expandedKeys.value = expandedkeys
  checkedKeys.value = checkedkeys
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
    DB.saveValueNumber('AllDir_' + user.default_drive_id, 0) 
    handleReset()
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
      
      RefreshTree()
      setTimeout(refresh, 3000)
    }
  }
  setTimeout(refresh, 3000)

  LoadScanDir(user.user_id, user.default_drive_id, totalDirCount, Processing, ScanPanData)
    .then(() => {
      
      return GetEnmptyDir(user.user_id, ScanPanData, Processing, scanCount)
    })
    .catch((err: any) => {
      message.error(err.message || '扫描失败')
    })
    .then(() => {
      
      scanLoading.value = false
      RefreshTree()
      scanLoaded.value = true
      Processing.value = 0
    })
}
</script>

<template>
  <div class="scanfill rightbg">
    <div class="settingcard scanfix" style="padding: 12px 24px 8px 24px">
      <a-steps>
        <a-step :description="scanLoaded ? '扫描出 ' + scanCount + ' 个空文件夹' : scanLoading ? '扫描进度：' + Processing + '%' : '在网盘中查找一遍'">
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
        <span v-if="scanLoaded" class="checkedInfo">已选中 {{ checkedKeys.length }} / {{ scanCount }} 共 {{ totalDirCount }} 个文件夹</span>
        <span v-else class="checkedInfo">网盘中文件夹很多时，需要扫描较长时间</span>
        <div style="flex: auto"></div>
        <a-button v-if="scanLoaded" size="small" tabindex="-1" style="margin-right: 12px" @click="handleReset">取消</a-button>
        <a-button v-if="scanLoaded" type="primary" size="small" tabindex="-1" status="danger" :loading="delLoading" title="把选中的文件夹放入回收站" @click="handleDelete">删除选中</a-button>
        <a-button v-else type="primary" size="small" tabindex="-1" :loading="scanLoading" @click="handleScan">开始扫描空文件夹</a-button>
      </a-row>
      <a-spin v-if="scanLoading || scanLoaded" :loading="scanLoading" tip="耐心等待，很慢的..." :style="{ width: '100%', height: treeHeight + 'px', overflow: 'hidden' }">
        <AntdTree
          ref="treeref"
          :expanded-keys="expandedKeys"
          :checked-keys="checkedKeys"
          :tree-data="treeData"
          :tabindex="-1"
          :focusable="false"
          checkable
          block-node
          :selectable="false"
          check-strictly
          auto-expand-parent
          show-icon
          :height="treeHeight"
          :style="{ height: treeHeight + 'px' }"
          :showline="{ showLeafIcon: false }"
          @select="handleTreeSelect"
          @check="handleTreeCheck">
          <template #switcherIcon>
            <i class="ant-tree-switcher-icon iconfont Arrow" />
          </template>
          <template #icon>
            <i class="iconfont iconfile-folder" />
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
.arco-steps-icon .arco-spin-icon {
  color: var(--color-white);
  width: 26px;
  height: 28px;
  line-height: 28px;
}

.scanfill {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.scanfix {
  flex-grow: 0;
  flex-shrink: 0;
}
.scanauto {
  flex-grow: 1;
  flex-shrink: 1;
}

.arco-tree-node-indent,
.arco-tree-node-switcher {
  height: 28px !important;
}
.arco-tree-node-title {
  padding-top: 3px !important;
  padding-bottom: 3px !important;
  margin-top: 2px !important;
  margin-bottom: 2px !important;
  line-height: 18px !important;
}

.checkedInfo {
  font-size: 14px;
  color: var(--color-text-3);
  overflow: hidden;
  white-space: nowrap;
  word-break: keep-all;
  text-overflow: ellipsis;
  flex-shrink: 1;
  margin-right: 12px;
}
</style>
