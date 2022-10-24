<script setup lang="ts">
import message from '../../utils/message'
import { computed, reactive, ref, watch } from 'vue'
import { UserTokenMap } from '../../user/userdal'
import { useUserStore, useWinStore } from '../../store'
import { ICopyTreeNode, LoadDir, NewCopyTreeInfo } from './drivecopy'

import { Checkbox as AntdCheckbox, Tree as AntdTree } from 'ant-design-vue'
import 'ant-design-vue/es/checkbox/style/css'

import 'ant-design-vue/es/tree/style/css'
import AliFileCmd from '../../aliapi/filecmd'

const winStore = useWinStore()
const userStore = useUserStore()
const treeHeight = computed(() => winStore.height - 268 - 34)

const copyLoading = ref(false)

const TreeState = reactive({
  LeftInfo: NewCopyTreeInfo(false),
  RightInfo: NewCopyTreeInfo(true),
  LeftTreeData: [] as ICopyTreeNode[],
  RightTreeData: [] as ICopyTreeNode[],
  LeftCheckedKeys: [] as string[]
})

const copyTreeData = ref<ICopyTreeNode[]>([])

const handleReset = () => {
  copyLoading.value = false
  TreeState.LeftTreeData = []
  TreeState.RightTreeData = []
  copyTreeData.value = []
  TreeState.LeftCheckedKeys = []

  TreeState.LeftInfo = NewCopyTreeInfo(false)
  TreeState.RightInfo = NewCopyTreeInfo(true)
}

watch(userStore.$state, handleReset)

const handleCopy = () => {
  if (TreeState.LeftCheckedKeys.length == 0) {
    message.info('没有勾选要复制的文件或文件夹')
    return
  }
  copyLoading.value = true

  
  const copyidList: string[] = []
  TreeState.LeftCheckedKeys.map((t) => {
    copyidList.push(t.substring(t.indexOf('_') + 1))
    return true
  })

  AliFileCmd.ApiCopyBatch(TreeState.LeftInfo.user_id, TreeState.LeftInfo.drive_id, copyidList, TreeState.RightInfo.drive_id, TreeState.RightInfo.dirID).then((success) => {
    if (success.length == copyidList.length) {
      handleRightTreeSelect(['refresh'])
      message.success('文件已复制')
    } else message.success('文件复制操作已开始异步执行！请稍后刷新文件夹查看结果', 10)
    copyLoading.value = false
  })
}
const handleSelectAll = () => {
  if (TreeState.LeftCheckedKeys.length == TreeState.LeftTreeData.length) {
    TreeState.LeftCheckedKeys = []
  } else {
    const list: string[] = []
    TreeState.LeftTreeData.map((t) => {
      list.push(t.key)
      return true
    })
    TreeState.LeftCheckedKeys = list
  }
}

const handleLeftTreeSelect = (selectkeys: any) => {
  console.log('selectkeys', selectkeys)
  let key = selectkeys[0] as string

  if (key == 'refresh') key = TreeState.LeftInfo.dirID
  else if (key == 'back') key = TreeState.LeftInfo.parentID
  else if (key == 'root') key = 'root'
  else if (!key.startsWith('dir_')) return
  TreeState.LeftCheckedKeys = []
  LoadDir(key, TreeState.LeftInfo, TreeState.LeftTreeData, false)
}
const handleRightTreeSelect = (selectkeys: any) => {
  let key = selectkeys[0] as string

  if (key == 'refresh') key = TreeState.RightInfo.dirID
  else if (key == 'back') key = TreeState.RightInfo.parentID
  else if (key == 'root') key = 'root'
  else if (!key.startsWith('dir_')) return

  LoadDir(key, TreeState.RightInfo, TreeState.RightTreeData, true)
}

const handleLeftUser = (driveType: any) => {
  const userToken = UserTokenMap.get(userStore.user_id)
  if (!userToken) return
  TreeState.LeftInfo.user_id = userToken.user_id
  TreeState.LeftInfo.driveType = driveType
  if (driveType == 'pan') TreeState.LeftInfo.drive_id = userToken.default_drive_id
  if (driveType == 'pic') TreeState.LeftInfo.drive_id = userToken.pic_drive_id
  if (driveType == 'safe') TreeState.LeftInfo.drive_id = userToken.default_sbox_drive_id
  TreeState.LeftCheckedKeys = []
  LoadDir('root', TreeState.LeftInfo, TreeState.LeftTreeData, false)
}

const handleRightUser = (driveType: any) => {
  const userToken = UserTokenMap.get(userStore.user_id)
  if (!userToken) return
  TreeState.RightInfo.user_id = userToken.user_id
  TreeState.RightInfo.driveType = driveType
  if (driveType == 'pan') TreeState.RightInfo.drive_id = userToken.default_drive_id
  if (driveType == 'pic') TreeState.RightInfo.drive_id = userToken.pic_drive_id
  if (driveType == 'safe') TreeState.RightInfo.drive_id = userToken.default_sbox_drive_id
  LoadDir('root', TreeState.RightInfo, TreeState.RightTreeData, true)
}
</script>

<template>
  <div class="scanfill rightbg">
    <div class="settingcard scanfix" style="padding: 12px 24px 8px 24px">
      <a-steps>
        <a-step description="选择 网盘/相册">
          选择
          <template #icon>
            <i class="iconfont iconedit-square" />
          </template>
        </a-step>
        <a-step description="勾选 文件/文件夹">
          勾选
          <template #icon>
            <i class="iconfont iconedit-square" />
          </template>
        </a-step>
        <a-step description="开始复制">
          复制
          <template #icon>
            <i class="iconfont icondelete" />
          </template>
        </a-step>
      </a-steps>
    </div>

    <div class="settingcard scanauto" style="padding: 4px; margin-top: 4px">
      <a-row justify="space-between" align="center" style="margin: 12px; height: 28px; flex-grow: 0; flex-shrink: 0; overflow: hidden">
        <span class="checkedInfo" style="margin-right: 12px">从</span>
        <a-select size="small" tabindex="-1" :style="{ width: '130px' }" :disabled="copyLoading" :model-value="TreeState.LeftInfo.driveType" placeholder="请选择" style="margin-right: 12px" @change="handleLeftUser">
          <a-option value="pic"> 相册 </a-option>
          <a-option value="pan"> 网盘 </a-option>
        </a-select>
        <span class="checkedInfo" style="margin-right: 12px">复制到</span>
        <a-select size="small" tabindex="-1" :style="{ width: '130px' }" :disabled="copyLoading" :model-value="TreeState.RightInfo.driveType" placeholder="请选择" style="margin-right: 12px" @update:model-value="handleRightUser">
          <a-option value="pic"> 相册 </a-option>
          <a-option value="pan"> 网盘 </a-option>
        </a-select>

        <div style="flex: auto"></div>
        <a-button v-if="copyLoading" size="small" tabindex="-1" style="margin-right: 12px" @click="handleReset">取消</a-button>
        <a-button type="primary" size="small" tabindex="-1" :loading="copyLoading" @click="handleCopy">开始复制</a-button>
      </a-row>

      <a-split :style="{ height: treeHeight + 36 + 'px', width: '100%' }" min="300px" max="0.8">
        <template #first>
          <div class="rsscopymenu">
            <a-button type="text" size="small" tabindex="-1" title="根目录" @click="handleLeftTreeSelect(['root'])"><i class="iconfont iconhome" /></a-button>
            <a-button type="text" size="small" tabindex="-1" title="返回上级" @click="handleLeftTreeSelect(['back'])"><i class="iconfont iconarrow-top-2-icon-copy" /></a-button>
            <a-button type="text" size="small" tabindex="-1" title="刷新" @click="handleLeftTreeSelect(['refresh'])"><i class="iconfont iconreload-1-icon" /></a-button>
            <AntdCheckbox tabindex="-1" :disabled="TreeState.LeftInfo.loading" :checked="TreeState.LeftCheckedKeys.length > 0 && TreeState.LeftTreeData.length == TreeState.LeftCheckedKeys.length" style="margin-left: 7px" @click.stop.prevent="handleSelectAll">全选</AntdCheckbox>

            <span class="checkedInfo" style="margin-left: 8px">已选中 {{ TreeState.LeftCheckedKeys.length }}</span>
          </div>
          <a-spin :loading="TreeState.LeftInfo.loading" :style="{ width: 'calc(100% + 10px)', height: treeHeight + 'px', overflow: 'hidden', marginLeft: '-13px' }">
            <a-empty v-if="TreeState.LeftTreeData.length == 0" description="空文件夹" style="margin-top: 25vh" />
            <AntdTree
              v-else
              v-model:checkedKeys="TreeState.LeftCheckedKeys"
              :tree-data="TreeState.LeftTreeData"
              :tabindex="-1"
              :focusable="false"
              class="dirtree"
              block-node
              selectable
              :auto-expand-parent="false"
              show-icon
              :height="treeHeight"
              :style="{ height: treeHeight + 'px' }"
              :item-height="30"
              checkable
              :open-animation="{}"
              @select="handleLeftTreeSelect">
              <template #title="{ dataRef }">
                <span class="dirtitle">{{ dataRef.title }}</span>
              </template>
            </AntdTree>
          </a-spin>
        </template>
        <template #second>
          <div class="rsscopymenu">
            <a-button type="text" size="small" tabindex="-1" title="根目录" @click="handleRightTreeSelect(['root'])"><i class="iconfont iconhome" /></a-button>
            <a-button type="text" size="small" tabindex="-1" title="返回上级" @click="handleRightTreeSelect(['back'])"><i class="iconfont iconarrow-top-2-icon-copy" /></a-button>
            <a-button type="text" size="small" tabindex="-1" title="刷新" @click="handleRightTreeSelect(['refresh'])"><i class="iconfont iconreload-1-icon" /></a-button>
            <span class="checkedInfo" style="margin-left: 8px; color: rgb(var(--success-6))">复制到 {{ TreeState.RightInfo.dirName }}</span>
          </div>
          <a-spin :loading="TreeState.RightInfo.loading" :style="{ width: 'calc(100% + 10px)', height: treeHeight + 'px', overflow: 'hidden', marginLeft: '-18px' }">
            <a-empty v-if="TreeState.RightTreeData.length == 0" description="空文件夹" style="margin-top: 25vh" />
            <AntdTree
              v-else
              :tabindex="-1"
              :focusable="false"
              class="dirtree"
              block-node
              selectable
              :auto-expandparent="false"
              show-icon
              :height="treeHeight"
              :style="{ height: treeHeight + 'px' }"
              :item-height="30"
              :open-animation="{}"
              :tree-data="TreeState.RightTreeData"
              @select="handleRightTreeSelect">
              <template #title="{ dataRef }">
                <span class="dirtitle">{{ dataRef.title }}</span>
              </template>
            </AntdTree>
          </a-spin></template
        >
      </a-split>
    </div>
  </div>
</template>

<style>
.rsscopymenu {
  height: 28px;
  overflow: hidden;
  padding-left: 2px;
  display: flex;
  align-items: center;
  margin-bottom: 2px;
  border-bottom: 1px solid #e5e8ed99;
}
body[arco-theme='dark'] .rsscopymenu {
  border-bottom: 1px solid #e5e8ed22;
}
.rsscopymenu .arco-btn {
  padding: 0 8px !important;
}
.rsscopymenu .checkedInfo {
  overflow: hidden;
  white-space: nowrap;
  word-break: keep-all;
  text-overflow: ellipsis;
}
</style>
