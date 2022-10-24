<script setup lang="ts">
import message from '../../utils/message'
import { humanSize } from '../../utils/format'
import { computed, ref, watch } from 'vue'
import MyLoading from '../../layout/MyLoading.vue'
import { useUserStore, useWinStore } from '../../store'
import UserDAL from '../../user/userdal'
import AliFileCmd from '../../aliapi/filecmd'
import { LoadScanDir, NewScanDriver, ResetScanDriver, FileNodeData, FileData } from '../ScanDAL'
import { GetSameFile } from './same'

import { Checkbox as AntdCheckbox } from 'ant-design-vue'
import 'ant-design-vue/es/checkbox/style/css'

const winStore = useWinStore()
const userStore = useUserStore()
const treeHeight = computed(() => winStore.height - 268)

const scanLoading = ref(false)
const scanLoaded = ref(false)
const delLoading = ref(false)
const Processing = ref(0)
const scanCount = ref(0)
const totalDirCount = ref(0)
const totalFileCount = ref(0)

const ScanPanData = NewScanDriver('')

const checkedCount = ref(0)
const checkedSize = ref(0)
const checkedKeys = new Set<string>()
const treeData = ref<FileNodeData[]>([])

const handleReset = () => {
  scanLoading.value = false
  scanLoaded.value = false
  delLoading.value = false
  Processing.value = 0
  scanCount.value = 0
  totalDirCount.value = 0

  ResetScanDriver(ScanPanData)

  checkedKeys.clear()
  checkedCount.value = 0
  checkedSize.value = 0
  treeData.value = []
}

watch(userStore.$state, handleReset)

const RefreshTree = () => {
  
  let showData: FileNodeData[] = []
  const entries = ScanPanData.SameDirMap.entries()
  for (let i = 0, maxi = ScanPanData.SameDirMap.size; i < maxi; i++) {
    const value = entries.next().value
    if (value[1].length > 1) {
      const files = value[1] as FileData[]
      const add: FileNodeData = { hash: value[0], files: files.sort((a, b) => b.time - a.time) }
      showData.push(add)
    }
  }
  showData = showData.sort((a, b) => b.files[0].size - a.files[0].size)
  Object.freeze(showData)
  treeData.value = showData
  checkedKeys.clear()
  checkedCount.value = 0
  checkedSize.value = 0
  scanCount.value = showData.length
}

const handleCheck = (file_id: string) => {
  if (checkedKeys.has(file_id)) checkedKeys.delete(file_id)
  else checkedKeys.add(file_id)
  treeData.value = treeData.value.concat() 
  checkedCount.value = checkedKeys.size
  let size = 0
  treeData.value.map((t) => {
    t.files.map((f) => {
      if (checkedKeys.has(f.file_id)) size += f.size
      return true
    })
    return true
  })
  checkedSize.value = size
}

const handleDelete = () => {
  const user = UserDAL.GetUserToken(userStore.user_id)
  if (!user || !user.user_id) {
    message.error('账号错误')
    return
  }
  delLoading.value = true
  const idList = Array.from(checkedKeys)
  AliFileCmd.ApiTrashBatch(user.user_id, user.default_drive_id, idList).then((success: string[]) => {
    delLoading.value = false
    handleScan()
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
      
      return GetSameFile(user.user_id, ScanPanData, Processing, scanCount, totalFileCount, scanType.value)
    })
    .catch((err: any) => {
      message.error(err.message)
      return false
    })
    .then((data) => {
      
      scanLoading.value = false
      RefreshTree()
      scanLoaded.value = data
      Processing.value = 0
    })
}

const scanType = ref('all')
</script>

<script lang="ts"></script>

<template>
  <div class="scanfill rightbg">
    <div class="settingcard scanfix" style="padding: 12px 24px 8px 24px">
      <a-steps>
        <a-step :description="scanLoaded ? '扫描出 ' + scanCount + ' 组重复文件' : scanLoading ? '扫描进度：' + (Processing > 50 ? Math.floor((Processing * 100) / totalDirCount) + '%' : Processing) : '点击 加载列表'">
          加载
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
        <span v-if="scanLoaded" class="checkedInfo">已选中 {{ checkedCount }} 个文件 {{ humanSize(checkedSize) }}</span>

        <span v-else-if="totalDirCount > 0" class="checkedInfo">正在列出文件 {{ Processing }} </span>
        <span v-else class="checkedInfo">手机APP--容量管理--重复文件清理(仅阿里云盘会员可用)</span>
        <div style="flex: auto"></div>

        <a-button v-if="scanLoaded" size="small" tabindex="-1" style="margin-right: 12px" @click="handleReset">取消</a-button>
        <a-select v-else v-model:model-value="scanType" size="small" tabindex="-1" :style="{ width: '136px' }" :disabled="scanLoading" style="margin-right: 12px">
          <a-option value="all">全部</a-option>
          <a-option value="video">视频</a-option>
          <a-option value="image">图片</a-option>
          <a-option value="audio">音频</a-option>
          <a-option value="doc">文档</a-option>
          <a-option value="zip">压缩包</a-option>
          <a-option value="others">其他</a-option>
        </a-select>
        <a-button v-if="scanLoaded" type="primary" size="small" tabindex="-1" status="danger" :loading="delLoading" title="把选中的文件放入回收站" @click="handleDelete">删除选中</a-button>
        <a-button v-else type="primary" size="small" tabindex="-1" :loading="scanLoading" @click="handleScan">加载列表</a-button>
      </a-row>
      <a-spin v-if="scanLoading || scanLoaded" :loading="scanLoading" tip="耐心等待，很慢的..." :style="{ width: '100%', height: treeHeight + 'px' }">
        <a-list
          ref="viewlist"
          :bordered="false"
          :split="false"
          :max-height="treeHeight"
          :virtual-list-props="{
            height: treeHeight,
            itemKey: 'hash'
          }"
          style="width: 100%"
          :data="treeData"
          tabindex="-1">
          <template #empty><a-empty description="扫描结束 没找到重复文件" /></template>
          <template #item="{ item, index }">
            <div :key="item.hash" class="sameitem">
              <div class="samehash">#{{ index + 1 }} : {{ item.files[0].sizeStr }} - {{ item.hash }}</div>
              <div v-for="file in item.files" :key="file.file_id" class="samefile">
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
                  <div class="sametime">{{ file.timeStr }}</div>
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
