<script lang="ts">
import { usePanTreeStore, useSettingStore } from '../../store'
import message from '../../utils/message'
import { modalCloseAll } from '../../utils/modal'
import { defineComponent, ref, PropType, nextTick } from 'vue'
import UploadingDAL from '../../transfer/uploadingdal'
import AliFile from '../../aliapi/file'

export default defineComponent({
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    file_id: {
      type: String,
      required: true
    },
    filelist: {
      type: Array as PropType<string[]>,
      required: true
    }
  },
  setup(props) {
    const okLoading = ref(false)
    const dirPath = ref('')
    const file_id = ref('')
    const settingStore = useSettingStore()

    const cb = (val: any) => {
      settingStore.updateStore(val)
    }

    const handleOpen = () => {
      
      file_id.value = props.file_id
      const pantreeStore = usePanTreeStore()
      if (!file_id.value) file_id.value = pantreeStore.selectDir.file_id
      if (!file_id.value) {
        message.error('错误的网盘位置')
        nextTick(() => {
          modalCloseAll()
        })
        return
      }
      AliFile.ApiFileGetPathString(pantreeStore.user_id, pantreeStore.drive_id, file_id.value, '/').then((data) => {
        dirPath.value = '/' + data
      })
    }

    const handleClose = () => {
      
      if (okLoading.value) okLoading.value = false
      dirPath.value = ''
    }

    return { okLoading, dirPath, file_id, settingStore, cb, handleOpen, handleClose }
  },
  methods: {
    handleHide() {
      modalCloseAll()
    },
    handleOK() {
      const pantreeStore = usePanTreeStore()
      const settingStore = useSettingStore()
      UploadingDAL.aUploadLocalFiles(pantreeStore.user_id, pantreeStore.drive_id, this.file_id, this.filelist, settingStore.downUploadWhatExist, true) 
      modalCloseAll()
    }
  }
})
</script>

<template>
  <a-modal :visible="visible" modal-class="modalclass" :footer="false" :unmount-on-close="true" :mask-closable="false" @cancel="handleHide" @before-open="handleOpen" @close="handleClose">
    <template #title>
      <span class="modaltitle">上传 文件/文件夹 到网盘</span>
    </template>
    <div class="modalbody" style="width: 440px; max-height: calc(80vh - 100px); overflow-y: scroll">
      <div class="settinghead">
        :把<span class="filelistcount">{{ filelist.length }}</span
        >个文件上传到网盘：
      </div>
      <div class="settingrow">
        <div class="pathtitle">
          {{ dirPath }}
        </div>
      </div>
      <div class="settingspace"></div>

      <div class="settinghead">:上传时 遇到重名文件冲突</div>
      <div class="settingrow">
        <a-select tabindex="-1" :style="{ width: '278px' }" :model-value="settingStore.downUploadWhatExist" @update:model-value="cb({ downUploadWhatExist: $event })">
          <a-option value="ignore">删除网盘内文件，继续上传</a-option>
          <a-option value="overwrite">覆盖网盘内文件，继续上传</a-option>
          <a-option value="auto_rename">保留网盘内文件，继续上传，重命名</a-option>
          <a-option value="refuse">保留网盘内文件，不上传了</a-option>
        </a-select>
        <a-popover position="bottom">
          <i class="iconfont iconbulb" />
          <template #content>
            <div>
              默认：<span class="opred">删除网盘内文件，继续上传</span>
              <hr />
              如果要上传的文件和网盘内已存在的文件重名了<br /><br />
              当内容完全一致(sha1相同)时，则<span class="opred">无需</span>处理<br />
              反之，需要<span class="opred">决定</span>如何处理<br />
              <hr />
              删除网盘内文件和覆盖网盘内文件区别是：<br />
              删除会在回收站有已删除记录可以还原文件<br />
              覆盖在回收站没有记录
            </div>
          </template>
        </a-popover>
      </div>
      <div class="settingspace"></div>
      <br />
    </div>
    <div class="modalfoot">
      <div style="flex-grow: 1"></div>
      <a-button v-if="!okLoading" type="outline" size="small" @click="handleHide">取消</a-button>
      <a-button type="primary" size="small" :loading="okLoading" @click="handleOK">开始上传</a-button>
    </div>
  </a-modal>
</template>

<style>
.filelistcount {
  color: rgb(var(--primary-6));
  margin: 0 4px;
}
</style>
