<script setup lang="ts">
import message from '@/utils/message'
import { humanSize } from '@/utils/format'
import { computed, ref } from 'vue'
import MyLoading from '@/layout/MyLoading.vue'
import { useUserStore, useWinStore } from '@/store'
import UserDAL from '@/user/userdal'
import AliFileCmd from '@/aliapi/filecmd'
import { LoadScanDir, NewScanDriver, ResetScanDriver, FileNodeData, FileData } from '../ScanDAL'
import { GetSameFile } from './same'

import { Checkbox as AntdCheckbox } from 'ant-design-vue'
import 'ant-design-vue/es/checkbox/style/css'

const winStore = useWinStore()
const userStore = useUserStore()
const TreeHeight = computed(() => winStore.height - 268)

const ScanLoading = ref(false)
const ScanLoaded = ref(false)
const DelLoading = ref(false)
const Processing = ref(0)
const ScanCount = ref(0)
const TotalDirCount = ref(0)
const TotalFileCount = ref(0)

const ScanPanData = NewScanDriver('')

const checkedCount = ref(0)
const checkedSize = ref(0)
const checkedKeys = new Set<string>()
const TreeData = ref<FileNodeData[]>([])

const handleReset = () => {
  ScanLoading.value = false
  ScanLoaded.value = false
  DelLoading.value = false
  Processing.value = 0
  ScanCount.value = 0
  TotalDirCount.value = 0

  ResetScanDriver(ScanPanData)

  checkedKeys.clear()
  checkedCount.value = 0
  checkedSize.value = 0
  TreeData.value = []
}

const RefreshTree = () => {
  
  let ShowData: FileNodeData[] = []
  let entries = ScanPanData.SameDirMap.entries()
  for (let i = 0, maxi = ScanPanData.SameDirMap.size; i < maxi; i++) {
    let value = entries.next().value
    if (value[1].length > 1) {
      let files = value[1] as FileData[]
      const add: FileNodeData = { hash: value[0], files: files.sort((a, b) => b.time - a.time) }
      ShowData.push(add)
    }
  }
  ShowData = ShowData.sort((a, b) => b.files[0].size - a.files[0].size)
  Object.freeze(ShowData)
  TreeData.value = ShowData
  checkedKeys.clear()
  checkedCount.value = 0
  checkedSize.value = 0
  ScanCount.value = ShowData.length
}

const handleCheck = (file_id: string) => {
  if (checkedKeys.has(file_id)) checkedKeys.delete(file_id)
  else checkedKeys.add(file_id)
  TreeData.value = TreeData.value.concat() 
  checkedCount.value = checkedKeys.size
  let size = 0
  TreeData.value.map((t) => {
    t.files.map((f) => {
      if (checkedKeys.has(f.file_id)) size += f.size
    })
  })
  checkedSize.value = size
}

const handleDelete = () => {
  let user = UserDAL.GetUserToken(userStore.userID)
  if (!user || !user.user_id) {
    message.error('账号错误')
    return
  }
  DelLoading.value = true
  let idlist = Array.from(checkedKeys)
  AliFileCmd.ApiTrashBatch(user.user_id, user.default_drive_id, idlist).then((success: string[]) => {
    DelLoading.value = false
    handleScan()
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
      
      RefreshTree()
      setTimeout(refresh, 3000)
    }
  }
  setTimeout(refresh, 3000)

  LoadScanDir(user.user_id, user.default_drive_id, TotalDirCount, Processing, ScanPanData)
    .then(() => {
      
      return GetSameFile(user.user_id, ScanPanData, Processing, ScanCount, TotalFileCount, ScanType.value)
    })
    .catch((err: any) => {
      message.error(err.message)
    })
    .then(() => {
      
      ScanLoading.value = false
      RefreshTree()
      ScanLoaded.value = true
      Processing.value = 0
    })
}

const ScanType = ref('all')
</script>

<script lang="ts"></script>

<template>
  <div class="scanfill rightbg">
    <div class="settingcard scanfix" style="padding: 12px 24px 8px 24px">
      <a-steps>
        <a-step :description="ScanLoaded ? '扫描出 ' + ScanCount + ' 组重复文件' : ScanLoading ? '扫描进度：' + (Processing > 50 ? Math.floor((Processing * 100) / TotalDirCount) + '%' : Processing) : '点击加载列表按钮'">
          加载
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
        <span v-if="ScanLoaded" class="checkedInfo">已选中 {{ checkedCount }} 个文件 {{ humanSize(checkedSize) }}</span>

        <span v-else-if="TotalDirCount > 0" class="checkedInfo">正在列出文件 {{ Processing }} </span>
        <span v-else class="checkedInfo">手机APP--容量管理--重复文件清理</span>
        <div style="flex: auto"></div>

        <a-button v-if="ScanLoaded" size="small" tabindex="-1" @click="handleReset" style="margin-right: 12px">取消</a-button>
        <a-select v-else size="small" tabindex="-1" :style="{ width: '136px' }" :disabled="ScanLoading" v-model:model-value="ScanType" style="margin-right: 12px">
          <a-option value="all">全部</a-option>
          <a-option value="video">视频</a-option>
          <a-option value="image">图片</a-option>
          <a-option value="audio">音频</a-option>
          <a-option value="doc">文档</a-option>
          <a-option value="zip">压缩包</a-option>
          <a-option value="others">其他</a-option>
        </a-select>
        <a-button v-if="ScanLoaded" type="primary" size="small" tabindex="-1" status="danger" @click="handleDelete" :loading="DelLoading" title="把选中的文件放入回收站">删除选中</a-button>
        <a-button v-else type="primary" size="small" tabindex="-1" @click="handleScan" :loading="ScanLoading">加载列表</a-button>
      </a-row>
      <a-spin v-if="ScanLoading || ScanLoaded" :loading="ScanLoading" tip="耐心等待，很慢的..." :style="{ width: '100%', height: TreeHeight + 'px' }">
        <a-list
          ref="viewlist"
          :bordered="false"
          :split="false"
          :max-height="TreeHeight"
          :virtualListProps="{
            height: TreeHeight,
            itemKey: 'hash'
          }"
          style="width: 100%"
          :data="TreeData"
          tabindex="-1"
        >
          <template #item="{ item, index }">
            <div class="sameitem" :key="item.hash">
              <div class="samehash">#{{ index + 1 }} : {{ item.files[0].sizestr }} - {{ item.hash }}</div>
              <div class="samefile" v-for="file in item.files">
                <div class="samefileinfo">
                  <div class="samecheck">
                    <AntdCheckbox tabindex="-1" :checked="checkedKeys.has(file.file_id)" @click.stop.prevent="handleCheck(file.file_id)"></AntdCheckbox>
                  </div>
                  <div class="fileicon">
                    <i :class="'iconfont ' + file.icon" aria-hidden="true"></i>
                  </div>
                  <div class="samename">
                    <div :title="file.name" @click.stop.prevent="handleCheck(file.file_id)">
                      {{ file.name }}
                    </div>
                  </div>
                  <div class="sametime">{{ file.timestr }}</div>
                </div>
                <div class="samepath" :title="file.parent_file_path">{{ file.parent_file_path }}</div>
              </div>
            </div>
          </template>
        </a-list>
      </a-spin>
      <a-empty v-else class="beginscan">
        <template #image>
          <i class="iconfont iconrsearch" />
        </template>
        请点击上方 加载列表 按钮
      </a-empty>
    </div>
  </div>
</template>

<style>
.sameitem {
  padding: 12px;
  border: 1px solid var(--color-border-1);
}
.samehash {
  font-size: 14px;
  color: #8a9ca5;
  margin-bottom: 12px;
}
.samefileinfo {
  display: flex;
  height: 32px;
  align-items: center;
}
.samecheck {
  width: 24px;
  height: 24px;
  display: flex;
  flex-shrink: 0;
  justify-items: center;
}
.samename {
  flex-grow: 1;
}
.samename > div {
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  -o-text-overflow: ellipsis;
  text-overflow: ellipsis;
  overflow-wrap: break-word;
  word-break: break-all;
  cursor: pointer;
  width: fit-content;
}
.sametime {
  font-size: 12px;
  line-height: 14px;
  color: var(--color-text-3);
  white-space: nowrap;
  word-break: keep-all;
}
.samepath {
  font-size: 12px;
  line-height: 14px;
  height: 14px;
  color: var(--color-text-4);
  margin-left: 56px;
  overflow: hidden;
  white-space: nowrap;
  word-break: keep-all;
  text-overflow: ellipsis;
  margin-bottom: 6px;
}
</style>
