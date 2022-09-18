<script setup lang="ts">
import message from '../../utils/message'
import { computed, reactive, ref, watch } from 'vue'
import { UserTokenMap } from '../../user/userdal'
import { useUserStore, useWinStore } from '../../store'
import { ICopyTreeNode, LoadDir, NewCopyTreeInfo } from './drivecopy'

import { Checkbox as AntdCheckbox } from 'ant-design-vue'
import 'ant-design-vue/es/checkbox/style/css'
import { Tree as AntdTree } from 'ant-design-vue'
import 'ant-design-vue/es/tree/style/css'
import AliFileCmd from '../../aliapi/filecmd'

const winStore = useWinStore()
const userStore = useUserStore()
const TreeHeight = computed(() => winStore.height - 268 - 34)

const CopyLoading = ref(false)

const TreeState = reactive({
  LeftInfo: NewCopyTreeInfo(false),
  RightInfo: NewCopyTreeInfo(true),
  LeftTreeData: [] as ICopyTreeNode[],
  RightTreeData: [] as ICopyTreeNode[],
  LeftCheckedKeys: [] as string[]
})

const CopyTreeData = ref<ICopyTreeNode[]>([])

const handleReset = () => {
  console.log('handleReset')
  CopyLoading.value = false
  TreeState.LeftTreeData = []
  TreeState.RightTreeData = []
  CopyTreeData.value = []
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
  CopyLoading.value = true

  
  let copyidlist: string[] = []
  TreeState.LeftCheckedKeys.map((t) => {
    copyidlist.push(t.substring(t.indexOf('_') + 1))
  })

  AliFileCmd.ApiCopyBatch(TreeState.LeftInfo.user_id, TreeState.LeftInfo.drive_id, copyidlist, TreeState.RightInfo.drive_id, TreeState.RightInfo.dir_id).then((success) => {
    if (success.length == copyidlist.length) {
      handleRightTreeSelect(['refresh'])
      message.success('文件已复制')
    } else message.success('文件复制操作已开始异步执行！请稍后刷新文件夹查看结果', 10)
    CopyLoading.value = false
  })
}
const handleSelectAll = () => {
  if (TreeState.LeftCheckedKeys.length == TreeState.LeftTreeData.length) {
    TreeState.LeftCheckedKeys = []
  } else {
    let list: string[] = []
    TreeState.LeftTreeData.map((t) => {
      list.push(t.key)
    })
    TreeState.LeftCheckedKeys = list
  }
}

const handleLeftTreeSelect = (selectkeys: any) => {
  console.log('selectkeys', selectkeys)
  let key = selectkeys[0] as string

  if (key == 'refresh') key = TreeState.LeftInfo.dir_id
  else if (key == 'back') key = TreeState.LeftInfo.parent_id
  else if (key == 'root') key = 'root'
  else if (!key.startsWith('dir_')) return
  TreeState.LeftCheckedKeys = []
  LoadDir(key, TreeState.LeftInfo, TreeState.LeftTreeData, false)
}
const handleRightTreeSelect = (selectkeys: any) => {
  let key = selectkeys[0] as string

  if (key == 'refresh') key = TreeState.RightInfo.dir_id
  else if (key == 'back') key = TreeState.RightInfo.parent_id
  else if (key == 'root') key = 'root'
  else if (!key.startsWith('dir_')) return

  LoadDir(key, TreeState.RightInfo, TreeState.RightTreeData, true)
}

const handleLeftUser = (drive_type: any) => {
  const usertoken = UserTokenMap.get(userStore.userID)
  if (!usertoken) return
  TreeState.LeftInfo.user_id = usertoken.user_id
  TreeState.LeftInfo.drive_type = drive_type
  if (drive_type == 'pan') TreeState.LeftInfo.drive_id = usertoken.default_drive_id
  if (drive_type == 'pic') TreeState.LeftInfo.drive_id = usertoken.pic_drive_id
  if (drive_type == 'safe') TreeState.LeftInfo.drive_id = usertoken.default_sbox_drive_id
  TreeState.LeftCheckedKeys = []
  LoadDir('root', TreeState.LeftInfo, TreeState.LeftTreeData, false)
}

const handleRightUser = (drive_type: any) => {
  const usertoken = UserTokenMap.get(userStore.userID)
  if (!usertoken) return
  TreeState.RightInfo.user_id = usertoken.user_id
  TreeState.RightInfo.drive_type = drive_type
  if (drive_type == 'pan') TreeState.RightInfo.drive_id = usertoken.default_drive_id
  if (drive_type == 'pic') TreeState.RightInfo.drive_id = usertoken.pic_drive_id
  if (drive_type == 'safe') TreeState.RightInfo.drive_id = usertoken.default_sbox_drive_id
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
        <a-select size="small" tabindex="-1" :style="{ width: '130px' }" :disabled="CopyLoading" :model-value="TreeState.LeftInfo.drive_type" @change="handleLeftUser" placeholder="请选择" style="margin-right: 12px">
          <a-option value="pic"> 相册 </a-option>
          <a-option value="pan"> 网盘 </a-option>
        </a-select>
        <span class="checkedInfo" style="margin-right: 12px">复制到</span>
        <a-select size="small" tabindex="-1" :style="{ width: '130px' }" :disabled="CopyLoading" :model-value="TreeState.RightInfo.drive_type" @update:model-value="handleRightUser" placeholder="请选择" style="margin-right: 12px">
          <a-option value="pic"> 相册 </a-option>
          <a-option value="pan"> 网盘 </a-option>
        </a-select>

        <div style="flex: auto"></div>
        <a-button v-if="CopyLoading" size="small" tabindex="-1" @click="handleReset" style="margin-right: 12px">取消</a-button>
        <a-button type="primary" size="small" tabindex="-1" @click="handleCopy" :loading="CopyLoading">开始复制</a-button>
      </a-row>

      <a-split :style="{ height: TreeHeight + 36 + 'px', width: '100%' }" min="300px" max="0.8">
        <template #first>
          <div class="rsscopymenu">
            <a-button type="text" size="small" tabindex="-1" title="根目录" @click="handleLeftTreeSelect(['root'])"><i class="iconfont iconhome" /></a-button>
            <a-button type="text" size="small" tabindex="-1" title="返回上级" @click="handleLeftTreeSelect(['back'])"><i class="iconfont iconarrow-top-2-icon-copy" /></a-button>
            <a-button type="text" size="small" tabindex="-1" title="刷新" @click="handleLeftTreeSelect(['refresh'])"><i class="iconfont iconreload-1-icon" /></a-button>
            <AntdCheckbox tabindex="-1" :disabled="TreeState.LeftInfo.loading" :checked="TreeState.LeftCheckedKeys.length > 0 && TreeState.LeftTreeData.length == TreeState.LeftCheckedKeys.length" @click.stop.prevent="handleSelectAll" style="margin-left: 7px">全选</AntdCheckbox>

            <span class="checkedInfo" style="margin-left: 8px">已选中 {{ TreeState.LeftCheckedKeys.length }}</span>
          </div>
          <a-spin :loading="TreeState.LeftInfo.loading" :style="{ width: 'calc(100% + 10px)', height: TreeHeight + 'px', overflow: 'hidden', marginLeft: '-13px' }">
            <a-empty v-if="TreeState.LeftTreeData.length == 0" description="空文件夹" style="margin-top: 30%" />
            <AntdTree
              v-else
              :tabindex="-1"
              :focusable="false"
              class="dirtree"
              blockNode
              selectable
              :autoExpandParent="false"
              showIcon
              :height="TreeHeight"
              :style="{ height: TreeHeight + 'px' }"
              :itemHeight="30"
              checkable
              :openAnimation="{}"
              @select="handleLeftTreeSelect"
              v-model:checkedKeys="TreeState.LeftCheckedKeys"
              :treeData="TreeState.LeftTreeData"
            >
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
            <span class="checkedInfo" style="margin-left: 8px; color: rgb(var(--success-6))">复制到 {{ TreeState.RightInfo.dir_name }}</span>
          </div>
          <a-spin :loading="TreeState.RightInfo.loading" :style="{ width: 'calc(100% + 10px)', height: TreeHeight + 'px', overflow: 'hidden', marginLeft: '-18px' }">
            <a-empty v-if="TreeState.RightTreeData.length == 0" description="空文件夹" style="margin-top: 30%" />
            <AntdTree v-else :tabindex="-1" :focusable="false" class="dirtree" blockNode selectable :autoExpandParent="false" showIcon :height="TreeHeight" :style="{ height: TreeHeight + 'px' }" :itemHeight="30" :openAnimation="{}" @select="handleRightTreeSelect" :treeData="TreeState.RightTreeData">
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
