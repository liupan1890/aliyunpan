<script setup lang="ts">
import message from '../../utils/message'
import { computed, reactive, ref, watch } from 'vue'
import { UserTokenMap } from '../../user/userdal'
import { useUserStore, useWinStore } from '../../store'
import { GetTreeNodes, ICopyTreeInfo, ICopyTreeNode, LoadCopy, LoadDir, NewCopyTreeInfo } from './usercopy'

import { Checkbox as AntdCheckbox, Tree as AntdTree } from 'ant-design-vue'
import 'ant-design-vue/es/checkbox/style/css'
import 'ant-design-vue/es/tree/style/css'

const winStore = useWinStore()
const userStore = useUserStore()
const treeHeight = computed(() => winStore.height - 268 - 34)

const copyLoading = ref(false)

let LeftData: ICopyTreeInfo = reactive(NewCopyTreeInfo(false))
let RightData: ICopyTreeInfo = reactive(NewCopyTreeInfo(true))
const CopyData: ICopyTreeNode[] = []

const LeftTreeData = ref<ICopyTreeNode[]>([])
const RightTreeData = ref<ICopyTreeNode[]>([])
const CopyTreeData = ref<ICopyTreeNode[]>([])
const CopyTreeLoading = ref(false)
const LeftCheckedKeys = ref<string[]>([])
const CopyTreeCheckedKeys = new Set<string>()
const CopyTreeExpandedKeys = ref<string[]>([])

const handleReset = () => {
  copyLoading.value = false
  LeftTreeData.value = []
  RightTreeData.value = []
  CopyTreeData.value = []
  CopyTreeLoading.value = false
  LeftCheckedKeys.value = []
  CopyTreeCheckedKeys.clear()
  CopyTreeExpandedKeys.value = []

  LeftData = reactive(NewCopyTreeInfo(false))
  RightData = reactive(NewCopyTreeInfo(true))
}
watch(userStore.$state, handleReset)
const RefreshTree = () => {
  
  const expandedkeys: string[] = []
  const checkedkeys: string[] = []
  const treeDataMap = new Map<string, ICopyTreeNode>()
  const treedata = GetTreeNodes(CopyData, treeDataMap)
  Object.freeze(treedata)
  CopyTreeData.value = treedata
  const values = treeDataMap.values()
  let clen = 0

  for (let i = 0, maxi = treeDataMap.size; i < maxi; i++) {
    const node = values.next().value as ICopyTreeNode
    clen = node.children!.length
    if (clen > 0) expandedkeys.push(node.key)
  }
  Object.freeze(expandedkeys)
  Object.freeze(checkedkeys)
  CopyTreeExpandedKeys.value = expandedkeys
}
const handleCopy = () => {
  message.info('账号间复制功能暂不可用')
  return

}
const handleSelectAll = () => {
  if (LeftCheckedKeys.value.length == LeftTreeData.value.length) {
    LeftCheckedKeys.value = []
  } else {
    const list: string[] = []
    LeftTreeData.value.map((t) => {
      list.push(t.key)
      return true
    })
    LeftCheckedKeys.value = list
  }
}

const handleLeftTreeSelect = (selectkeys: any) => {
  let key = selectkeys[0] as string

  if (key == 'refresh') key = LeftData.dirID
  else if (key == 'back') key = LeftData.parentID
  else if (key == 'root') key = 'root'
  else if (!key.startsWith('dir_')) return
  LeftCheckedKeys.value = []
  LoadDir(key, LeftData, LeftTreeData)
}
const handleRightTreeSelect = (selectkeys: any) => {
  let key = selectkeys[0] as string

  if (key == 'refresh') key = RightData.dirID
  else if (key == 'back') key = RightData.parentID
  else if (key == 'root') key = 'root'
  else if (!key.startsWith('dir_')) return

  LoadDir(key, RightData, RightTreeData)
}

const handleLeftUser = (user_id: any) => {
  const userToken = UserTokenMap.get(user_id)
  if (!userToken) return
  LeftData.user_id = userToken.user_id
  LeftData.drive_id = userToken.default_drive_id
  LeftCheckedKeys.value = []
  LoadDir('root', LeftData, LeftTreeData)
}

const handleRightUser = (user_id: any) => {
  if (LeftData.user_id == user_id) {
    message.info('不能复制到同一个账号')
    return
  }

  const userToken = UserTokenMap.get(user_id)
  if (!userToken) return
  RightData.user_id = userToken.user_id
  RightData.drive_id = userToken.default_drive_id
  LoadDir('root', RightData, RightTreeData)
}
</script>

<template>
  <div class="scanfill rightbg">
    <div class="settingcard scanfix" style="padding: 12px 24px 8px 24px">
      <a-steps>
        <a-step description="选择账号">
          选择
          <template #icon>
            <i class="iconfont iconedit-square" />
          </template>
        </a-step>
        <a-step description="手动选择需要复制的">
          勾选
          <template #icon>
            <i class="iconfont iconedit-square" />
          </template>
        </a-step>
        <a-step description="开始复制文件">
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
        <a-select size="small" tabindex="-1" :style="{ width: '130px' }" :disabled="copyLoading" :model-value="LeftData.user_id" placeholder="请选择账号" style="margin-right: 12px" @change="handleLeftUser">
          <a-option v-for="[_, user] in UserTokenMap" :key="user.user_id" :value="user.user_id"> {{ user.nick_name }} </a-option>
        </a-select>
        <span class="checkedInfo" style="margin-right: 12px">复制到</span>
        <a-select size="small" tabindex="-1" :style="{ width: '130px' }" :disabled="copyLoading" :model-value="RightData.user_id" placeholder="请选择账号" style="margin-right: 12px" @change="handleRightUser">
          <a-option v-for="[_, user] in UserTokenMap" :key="user.user_id" :value="user.user_id"> {{ user.nick_name }} </a-option>
        </a-select>

        <div style="flex: auto"></div>
        <a-button v-if="copyLoading" size="small" tabindex="-1" style="margin-right: 12px" @click="handleReset">取消</a-button>
        <a-button type="primary" size="small" tabindex="-1" :loading="copyLoading" @click="handleCopy">开始复制</a-button>
      </a-row>

      <a-split v-show="copyLoading == false" :style="{ height: treeHeight + 36 + 'px', width: '100%' }" min="300px" max="0.8">
        <template #first>
          <div class="rsscopymenu">
            <a-button type="text" size="small" tabindex="-1" title="根目录" @click="handleLeftTreeSelect(['root'])"><i class="iconfont iconhome" /></a-button>
            <a-button type="text" size="small" tabindex="-1" title="返回上级" @click="handleLeftTreeSelect(['back'])"><i class="iconfont iconarrow-top-2-icon-copy" /></a-button>
            <a-button type="text" size="small" tabindex="-1" title="刷新" @click="handleLeftTreeSelect(['refresh'])"><i class="iconfont iconreload-1-icon" /></a-button>
            <AntdCheckbox tabindex="-1" :disabled="LeftData.loading" :checked="LeftCheckedKeys.length > 0 && LeftTreeData.length == LeftCheckedKeys.length" style="margin-left: 7px" @click.stop.prevent="handleSelectAll">全选</AntdCheckbox>

            <span class="checkedInfo" style="margin-left: 8px">已选中 {{ LeftCheckedKeys.length }}</span>
          </div>
          <a-spin :loading="LeftData.loading" :style="{ width: 'calc(100% + 10px)', height: treeHeight + 'px', overflow: 'hidden', marginLeft: '-13px' }">
            <a-empty v-if="LeftTreeData.length == 0" description="空文件夹" style="margin-top: 30%" />
            <AntdTree
              v-else
              v-model:checkedKeys="LeftCheckedKeys"
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
              :tree-data="LeftTreeData"
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
            <span class="checkedInfo" style="margin-left: 8px">复制到 {{ RightData.dirName }}</span>
          </div>
          <a-spin :loading="RightData.loading" :style="{ width: '100%', height: treeHeight + 'px', overflow: 'hidden' }">
            <a-tree
              block-node
              selectable
              :data="RightTreeData"
              :virtual-list-props="{
                height: treeHeight
              }"
              :style="{ height: treeHeight + 'px' }"
              @select="handleRightTreeSelect">
            </a-tree> </a-spin
        ></template>
      </a-split>
      <div v-show="copyLoading" :style="{ height: treeHeight + 36 + 'px', width: '100%' }">
        <div class="rsscopymenu">
          <span class="checkedInfo" style="margin-left: 8px">执行中：{{ LeftCheckedKeys.length }}</span>
        </div>
        <a-spin :loading="CopyTreeLoading" :style="{ width: '100%', height: treeHeight + 'px', overflow: 'hidden' }">
          <a-tree
            block-node
            selectable
            checkable
            default-expand-all
            :expanded-keys="CopyTreeExpandedKeys"
            :checked-keys="Array.from(CopyTreeCheckedKeys)"
            :data="CopyTreeData"
            :virtual-list-props="{
              height: treeHeight
            }"
            :style="{ height: treeHeight + 'px' }">
            <template #title="item"
              ><span :class="CopyTreeCheckedKeys.has(item.key) ? 'success' : ''">{{ item.title }}</span></template
            >
          </a-tree>
        </a-spin>
      </div>
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
