<script lang="ts">
import { IAliUserDriveCapacity } from '../aliapi/models'
import AliUser from '../aliapi/user'
import { humanDateTimeDateStrYMD, humanSize } from '../utils/format'
import { modalCloseAll } from '../utils/modal'
import { defineComponent, ref, reactive } from 'vue'
import useUserStore from './userstore'

export default defineComponent({
  props: {
    visible: {
      type: Boolean,
      required: true
    }
  },
  setup(props) {
    const okLoading = ref(false)

    const DriveDetails = ref({
      drive_used_size: 0,
      drive_total_size: 0,
      default_drive_used_size: 0,
      album_drive_used_size: 0,
      note_drive_used_size: 0,
      sbox_drive_used_size: 0,
      share_album_drive_used_size: 0
    })
    const CapacityDetails = ref<IAliUserDriveCapacity[]>([])
    const CapacityDetailsDay = ref<{ day: string; sizestr: string; height: number }[]>([])

    const CapacityTotal = ref<{ total: number; last: number }>({ total: 0, last: 0 })

    const DriveFileCount = reactive({
      video: 0,
      image: 0,
      audio: 0,
      zip: 0,
      doc: 0,
      others: 0,
      folder: 0,
      file: 0
    })

    const UserVip = ref('')

    const handleOpen = async () => {
      const userStore = useUserStore()
      const token = userStore.GetUserToken
      console.log(token)
      UserVip.value = (token.vipname || '') + '  ' + (token.vipexpire || '')
      await AliUser.ApiUserDriveDetails(userStore.userID).then((details) => {
        DriveDetails.value = details
      })

      AliUser.ApiUserCapacityDetails(userStore.userID).then((result) => {
        CapacityDetails.value = result
        let map: { [key: string]: number } = {}
        let sizemax = Math.max(1, DriveDetails.value.drive_total_size || 0)
        let sizetotal = Math.max(1, DriveDetails.value.drive_total_size || 0)

        for (let i = 0, maxi = result.length; i < maxi; i++) {
          let item = result[i]
          if (item.expiredstr == '已过期') continue 
          let day = humanDateTimeDateStrYMD(item.expired)
          if (day) {
            let size = (map[day] || 0) + item.size
            map[day] = size
          }
        }

        let keys = Object.keys(map).sort() 
        let days: { day: string; sizestr: string; height: number }[] = []
        days.push({ day: '现在', sizestr: humanSize(sizetotal), height: parseFloat(((sizetotal * 100) / sizemax).toFixed(2)) })

        for (let i = 0, maxi = keys.length; i < maxi; i++) {
          let day = keys[i]
          let size = map[day] || 0
          sizetotal = sizetotal - size
          days.push({ day, sizestr: humanSize(sizetotal), height: parseFloat(((sizetotal * 100) / sizemax).toFixed(2)) })
        }
        CapacityTotal.value = { total: sizemax, last: sizetotal }
        while (days.length < 20) {
          days.push({ day: '', sizestr: humanSize(sizetotal), height: parseFloat(((sizetotal * 100) / sizemax).toFixed(2)) })
        }
        CapacityDetailsDay.value = days
      })

      AliUser.ApiUserDriveFileCount(userStore.userID, 'video', '').then((total) => (DriveFileCount.video = total))
      AliUser.ApiUserDriveFileCount(userStore.userID, 'audio', '').then((total) => (DriveFileCount.audio = total))
      AliUser.ApiUserDriveFileCount(userStore.userID, 'zip', '').then((total) => (DriveFileCount.zip = total))
      AliUser.ApiUserDriveFileCount(userStore.userID, 'doc', '').then((total) => (DriveFileCount.doc = total))
      AliUser.ApiUserDriveFileCount(userStore.userID, 'image', '').then((total) => (DriveFileCount.image = total))
      AliUser.ApiUserDriveFileCount(userStore.userID, 'others', '').then((total) => (DriveFileCount.others = total))
      AliUser.ApiUserDriveFileCount(userStore.userID, '', 'folder').then((total) => (DriveFileCount.folder = total))
      AliUser.ApiUserDriveFileCount(userStore.userID, '', 'file').then((total) => (DriveFileCount.file = total))
    }

    const handleClose = () => {
      
      if (okLoading.value) okLoading.value = false
      DriveDetails.value = {
        drive_used_size: 0,
        drive_total_size: 0,
        default_drive_used_size: 0,
        album_drive_used_size: 0,
        note_drive_used_size: 0,
        sbox_drive_used_size: 0,
        share_album_drive_used_size: 0
      }
      CapacityDetails.value = []
      CapacityDetailsDay.value = []
      CapacityTotal.value = { total: 0, last: 0 }

      DriveFileCount.video = 0
      DriveFileCount.image = 0
      DriveFileCount.audio = 0
      DriveFileCount.zip = 0
      DriveFileCount.doc = 0
      DriveFileCount.others = 0
    }

    return { okLoading, handleOpen, handleClose, UserVip, DriveDetails, CapacityDetails, CapacityDetailsDay, CapacityTotal, DriveFileCount, humanSize }
  },
  methods: {
    handleHide() {
      modalCloseAll()
    },
    handleOK() {}
  }
})
</script>

<template>
  <a-modal :visible="visible" modal-class="modalclass userspacemodal" @cancel="handleHide" @before-open="handleOpen" @close="handleClose" :footer="false" :unmount-on-close="true" :mask-closable="false">
    <template #title>
      <span class="modaltitle">容量详情</span>
    </template>
    <div class="modalbody" style="width: 660px; height: calc(80vh); overflow-y: auto; padding-right: 6px">
      <a-card :bordered="false">
        <div class="arco-card-header-title">
          网盘合计<span class="headinfo">{{ UserVip }}</span>
        </div>
        <div class="mt-5">
          <b class="font-extrabold text-3xl textjianbian" style="margin-right: 8px"> {{ humanSize(DriveDetails.drive_used_size) }} </b>
          <b class="mt-0.5 text-sm dark:text-gray-500 text-gray-400"> Total of {{ humanSize(DriveDetails.drive_total_size) }} Used </b>
        </div>
        <div class="mt-5">
          <div class="mb-4 flex h-2.5 items-center rounded bg-light-300 dark:bg-2x-dark-foreground" style="display: flex">
            <div class="chart-wrapper" :style="{ minWidth: '10px', width: ((DriveDetails.default_drive_used_size * 100) / DriveDetails.drive_total_size).toFixed(2) + '%' }">
              <span class="chart-progress block h-2.5 w-full rounded-tl-lg rounded-bl-lg border-r-2 border-white dark:border-gray-800 border-r-2 border-white dark:border-gray-800 success"></span>
            </div>
            <div class="chart-wrapper" :style="{ minWidth: '10px', width: ((DriveDetails.album_drive_used_size * 100) / DriveDetails.drive_total_size).toFixed(2) + '%' }">
              <span class="chart-progress block h-2.5 w-full border-r-2 border-white dark:border-gray-800 info"></span>
            </div>
            <div class="chart-wrapper" :style="{ minWidth: '10px', width: ((DriveDetails.note_drive_used_size * 100) / DriveDetails.drive_total_size).toFixed(2) + '%' }">
              <span class="chart-progress block h-2.5 w-full border-r-2 border-white dark:border-gray-800 purple"></span>
            </div>
            <div class="chart-wrapper" :style="{ minWidth: '10px', width: ((DriveDetails.sbox_drive_used_size * 100) / DriveDetails.drive_total_size).toFixed(2) + '%' }">
              <span class="chart-progress block h-2.5 w-full rounded-tr-lg rounded-br-lg border-r-2 border-white dark:border-gray-800 warning"></span>
            </div>
          </div>
          <footer class="flex w-full items-center overflow-x-auto">
            <div class="label mr-5">
              <span class="label-dot success"></span> <b class="label-title"> 网盘 </b><span class="label-size">{{ humanSize(DriveDetails.default_drive_used_size) }}</span>
            </div>
            <div class="label mr-5">
              <span class="label-dot info"></span> <b class="label-title"> 相册 </b><span class="label-size">{{ humanSize(DriveDetails.album_drive_used_size) }}</span>
            </div>
            <div class="label mr-5">
              <span class="label-dot purple"></span> <b class="label-title"> 笔记 </b><span class="label-size">{{ humanSize(DriveDetails.note_drive_used_size) }}</span>
            </div>
            <div class="label">
              <span class="label-dot warning"></span> <b class="label-title"> 密码箱 </b><span class="label-size">{{ humanSize(DriveDetails.sbox_drive_used_size) }}</span>
            </div>
          </footer>
        </div>
      </a-card>
      <div style="height: 36px"></div>
      <a-card :bordered="false">
        <div class="arco-card-header-title">
          网盘明细
          <span class="headinfo">{{ DriveFileCount.folder.toLocaleString() }}个文件夹 / {{ DriveFileCount.file.toLocaleString() }}个文件</span>
        </div>
        <div class="mt-5">
          <footer class="flex w-full items-center overflow-x-auto">
            <div class="label mr-5">
              <span class="label-dot success"></span> <b class="label-title s2"> 视频 </b><span class="label-size">{{ DriveFileCount.video.toLocaleString() }}</span>
            </div>
            <div class="label mr-5">
              <span class="label-dot info"></span> <b class="label-title s2"> 图片 </b><span class="label-size">{{ DriveFileCount.image.toLocaleString() }}</span>
            </div>
            <div class="label mr-5">
              <span class="label-dot purple"></span> <b class="label-title s2"> 音频 </b><span class="label-size">{{ DriveFileCount.audio.toLocaleString() }}</span>
            </div>
            <div class="label">
              <span class="label-dot warning"></span> <b class="label-title s2"> 文档 </b><span class="label-size">{{ DriveFileCount.doc.toLocaleString() }}</span>
            </div>
          </footer>
          <footer class="flex w-full items-center overflow-x-auto">
            <div class="label mr-5">
              <span class="label-dot danger"></span> <b class="label-title s2"> 压缩包 </b><span class="label-size">{{ DriveFileCount.zip.toLocaleString() }}</span>
            </div>
            <div class="label">
              <span class="label-dot secondary"></span> <b class="label-title s2"> 其他 </b><span class="label-size">{{ DriveFileCount.others.toLocaleString() }}</span>
            </div>
          </footer>
        </div>
      </a-card>
      <div style="height: 36px"></div>

      <a-card :bordered="false">
        <div class="arco-card-header-title">容量合计</div>
        <div class="mt-5">
          <div class="h-28 flex items-end justify-between">
            <div v-for="item in CapacityDetailsDay" class="relative flex items-center justify-center cursor-pointer w-2" :style="{ minHeight: '8px', height: item.height + '%' }">
              <a-tooltip :content="item.day + ' ' + item.sizestr" mini>
                <span v-if="item.day" class="block h-full w-full rounded-lg bg-theme" style="max-width: 8px"></span>
                <span v-else class="block h-full w-full rounded-lg dark:bg-gray-700 bg-gray-200" style="max-width: 8px"></span>
              </a-tooltip>
            </div>
          </div>

          <div class="flex items-end justify-between">
            <span class="capacityDesc">现在{{ humanSize(CapacityTotal.total) }}</span>
            <span style="flex: auto"></span>
            <span class="capacityDesc">-- 过期 --></span>
            <span style="flex: auto"></span>
            <span class="capacityDesc">永久{{ humanSize(CapacityTotal.last) }}</span>
          </div>
        </div>
      </a-card>
      <div style="height: 36px"></div>
      <a-card :bordered="false">
        <div class="arco-card-header-title">容量明细</div>
        <div class="mt-5">
          <a-list class="capacitylist" size="small" :bordered="false">
            <a-list-item v-for="item in CapacityDetails">
              <div :class="'capacity' + (item.expiredstr == '已过期' ? ' outdate' : '')">
                <div class="capacityTitle">{{ item.description }}</div>
                <div style="flex: auto"></div>
                <div class="capacitySize">{{ item.sizestr }}</div>
                <div class="capacityDate">{{ item.expiredstr }}</div>
              </div>
            </a-list-item>
          </a-list>
        </div>
      </a-card>
    </div>
  </a-modal>
</template>

<style scoped>
.headinfo {
  float: right;
  color: rgb(156 163 175 / 0.6);
  font-size: 12px;
  line-height: 25px;
}
.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}
.font-extrabold {
  font-weight: 800;
}

.text-gray-400 {
  --tw-text-opacity: 1;
  color: rgb(156 163 175 / var(--tw-text-opacity));
}
.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.mt-5 {
  margin-top: 1.25rem;
}
.bg-light-300 {
  --tw-bg-opacity: 1;
  background-color: rgb(225 225 239 / var(--tw-bg-opacity));
}
.rounded {
  border-radius: 0.25rem;
}
.items-center {
  align-items: center;
}
.h-2\.5 {
  height: 0.625rem;
}
.flex {
  display: flex;
}
.mb-4 {
  margin-bottom: 1rem;
}

.chart-progress.success {
  background: #0abb87;
  box-shadow: 0 3px 10px rgba(10, 187, 135, 0.5);
}
.border-white {
  --tw-border-opacity: 1;
  border-color: rgb(255 255 255 / var(--tw-border-opacity));
}
.border-r-2 {
  border-right-width: 2px;
}
.rounded-bl-lg {
  border-bottom-left-radius: 0.5rem;
}
.rounded-tl-lg {
  border-top-left-radius: 0.5rem;
}
.rounded-br-lg {
  border-bottom-right-radius: 0.5rem;
}
.rounded-tr-lg {
  border-top-right-radius: 0.5rem;
}
.w-full {
  width: 100%;
}
.block {
  display: block;
}

.border-white {
  --tw-border-opacity: 1;
  border-color: rgb(255 255 255 / var(--tw-border-opacity));
}
.border-r-2 {
  border-right-width: 2px;
}

.chart-progress.success {
  background: #0abb87;
  box-shadow: 0 3px 10px rgba(10, 187, 135, 0.5);
}
.chart-progress.danger {
  background: #fd397a;
  box-shadow: 0 3px 10px rgba(253, 57, 122, 0.5);
}
.chart-progress.warning {
  background: #ffb822;
  box-shadow: 0 3px 10px rgba(255, 184, 34, 0.5);
}
.chart-progress.info {
  background: #5578eb;
  box-shadow: 0 3px 10px rgba(85, 120, 235, 0.5);
}
.chart-progress.purple {
  background: #9d66fe;
  box-shadow: 0 3px 10px rgba(157, 102, 254, 0.5);
}
.chart-progress.secondary {
  background: #e1e1ef;
  box-shadow: 0 3px 10px rgba(225, 225, 239, 0.5);
}
.dark .chart-progress.secondary {
  background: #282a2f !important;
  box-shadow: 0 3px 10px rgba(40, 42, 47, 0.5) !important;
}

.label {
  align-items: center;
  display: flex;
  line-height: 26px;
  min-width: 130px;
  flex-shrink: 0;
}
.mr-5 {
  margin-right: 1.25rem;
}

.label .label-dot {
  border-radius: 8px;
  display: block;
  flex: none;
  height: 8px;
  margin-right: 10px;
  width: 8px;
}
.label .label-title {
  font-size: 14px;
  font-weight: 700;
}
.label .label-title.s2 {
  font-size: 13px;
  font-weight: normal;
}
.label .label-size {
  font-size: 12px;
  padding-top: 2px;
  padding-left: 4px;
  display: inline-block;
}

.label {
  align-items: center;
  display: flex;
}
.label .label-dot {
  border-radius: 8px;
  display: block;
  flex: none;
  height: 8px;
  margin-right: 10px;
  width: 8px;
}
.label .label-dot.success {
  background: #0abb87;
}
.label .label-dot.danger {
  background: #fd397a;
}
.label .label-dot.warning {
  background: #ffb822;
}
.label .label-dot.info {
  background: #5578eb;
}
.label .label-dot.primary {
  background: red;
}
.label .label-dot.purple {
  background: #9d66fe;
}
.label .label-dot.secondary {
  background: #e1e1ef;
}
.label .label-title {
  font-size: 16px;
  font-weight: 700;
}

.chart-wrapper {
  flex-shrink: 1;
}
</style>

<style scoped>
.gap-0 {
  gap: 0;
}
.justify-between {
  justify-content: space-between;
}
.items-end {
  align-items: flex-end;
}
.flex {
  display: flex;
}
.gap-2 {
  gap: 0.5rem;
}
.h-28 {
  height: 7rem;
}
.gap-1 {
  gap: 0.25rem;
}
.items-end {
  align-items: flex-end;
}
.grid-flow-col {
  grid-auto-flow: column;
}
.h-20 {
  height: 5rem;
}
.grid {
  display: grid;
}

.w-2 {
  width: 0.5rem;
}
.mx-1 {
  margin-left: 0.25rem;
  margin-right: 0.25rem;
}
.justify-center {
  justify-content: center;
}
.items-center {
  align-items: center;
}
.cursor-pointer {
  cursor: pointer;
}
.flex {
  display: flex;
}
.block {
  display: block;
}
.relative {
  position: relative;
}

.bg-theme {
  background: #00bc7e;
}
.rounded-lg {
  border-radius: 0.5rem;
}
.w-full {
  width: 100%;
}
.h-full {
  height: 100%;
}

.bg-gray-200 {
  --tw-bg-opacity: 1;
  background-color: rgb(229 231 235 / var(--tw-bg-opacity));
}
</style>
<style>
.userspacemodal .arco-modal-body {
  padding: 0 16px 16px 16px !important;
}
</style>

<style scoped>
.capacitylist .arco-list-item {
  padding: 9px 8px !important;
}
.capacity {
  width: 100%;
  display: flex;
  align-items: center;
}

.capacityTitle {
  flex-grow: 1;
  flex-shrink: 0;
  font-size: 14px;
  line-height: 22px;
  color: var(--color-text-1);
  word-wrap: break-word;
  word-break: keep-all;
  overflow: hidden;
}
.capacitySize {
  width: 120px;
  flex-grow: 0;
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
  color: #637dff !important;
  word-wrap: break-word;
  word-break: keep-all;
  overflow: hidden;
  text-align: right;
}
.capacityDate {
  width: 180px;
  flex-grow: 0;
  flex-shrink: 0;
  font-size: 12px;
  line-height: 22px;
  color: var(--color-text-3);
  word-wrap: break-word;
  word-break: keep-all;
  overflow: hidden;
  text-align: right;
}

.capacityDesc {
  flex-grow: 0;
  flex-shrink: 0;
  font-size: 12px;
  line-height: 22px;
  color: var(--color-text-3);
  word-wrap: break-word;
  word-break: keep-all;
  overflow: hidden;
}

.capacity.outdate .capacityTitle,
.capacity.outdate .capacitySize {
  text-decoration: line-through;
  opacity: 0.7;
}

.textjianbian {
  background-image: linear-gradient(#0abb87 70%, #ffffff);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
</style>
