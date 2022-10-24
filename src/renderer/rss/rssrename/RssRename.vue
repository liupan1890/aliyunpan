<script setup lang="ts">
import { ref } from 'vue'
import { useSettingStore } from '../../store'
import message from '../../utils/message'

const renameLoading = ref(false)
const dirPath = ref('')

const handleSelectDir = () => {
  if (window.WebShowOpenDialogSync) {
    window.WebShowOpenDialogSync(
      {
        title: '选择一个文件夹',
        buttonLabel: '选择',
        properties: ['openDirectory', 'createDirectory'],
        defaultPath: useSettingStore().downSavePath
      },
      (result: string[] | undefined) => {
        if (result && result[0]) {
          dirPath.value = result[0]
        }
      }
    )
  }
}

// eslint-disable-next-line no-unused-vars
const handleClickRename = async () => {
  if (renameLoading.value) return
  if (!dirPath.value) {
    message.error('还没有选择要执行批量重命名的文件夹')
    return
  }
  renameLoading.value = true

  // todo:: 批量重命名本地文件

  renameLoading.value = false
}
</script>

<template>
  <div class="fullscroll rightbg">
    <div class="settingcard">
      <a-typography-text type="danger">网盘内文件批量重命名不是在这里操作！</a-typography-text>
      <div class="settingspace"></div>
      <div class="settinghead">1:选择要批量重命名的 父文件夹</div>
      <div class="settingrow">
        <a-input-search tabindex="-1" :readonly="true" button-text="选择文件夹" search-button :model-value="dirPath" @search="handleSelectDir" />
      </div>

      <div class="settingspace"></div>
      <div class="settingspace"></div>
    </div>

    <div class="settingcard">
      <span class="oporg">警告</span>：重命名操作不可逆，不可恢复，重命名前请仔细确认！ <br />
      <div class="settingspace"></div>
      <ol>
        <li><a-typography-text type="success">替换/删除/追加</a-typography-text></li>
        <li><a-typography-text type="success">给文件编号</a-typography-text></li>
        <li><a-typography-text type="success">更改文件名大小写</a-typography-text></li>
        <li><a-typography-text type="success">使用随机字符重命名</a-typography-text></li>
      </ol>
    </div>

    <div class="settingcard">
      <div class="settinghead">:重命名说明</div>
      <div class="settingrow">
        这个页面是用来批量重命名<span class="opblue">电脑上的本地文件的</span> <br />
        网盘内文件批量重命名不是在这里操作！<br /><br />
        <a-typography-text type="danger">需要批量重命名</a-typography-text><a-typography-text type="danger" style="font-size: 20px; margin-left: 12px">网盘内的文件？</a-typography-text><br />
        直接在网盘页面选中多个文件后点击"重命名"按钮即可！ <br />
      </div>
      <div class="settingspace"></div>
    </div>
  </div>
</template>

<style>
.rightbg {
  background: var(--rightbg2);
  padding: 0 20px !important;
}
.helptxt {
  color: var(--color-text-3);
}
</style>
