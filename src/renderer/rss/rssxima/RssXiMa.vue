<script setup lang="ts">
import { ref } from 'vue'
import { useSettingStore } from '../../store'
import { Sleep } from '../../utils/format'
import MyTags from '../../layout/MyTags.vue'
import MySwitch from '../../layout/MySwitch.vue'
import message from '../../utils/message'
import { DoXiMa } from './xima'

const ximaLoading = ref(false)
const dirPath = ref('')
const breakSmall = ref(true)
const matchExtList = ref<string[]>([])

const handleAddExtList = (addList: string[]) => {
  const list: string[] = []
  let ext = ''
  for (let i = 0, maxi = addList.length; i < maxi; i++) {
    ext = addList[i].toLowerCase().trim()
    while (ext.endsWith(' ') || ext.endsWith('.')) ext = ext.substring(0, ext.length - 1)
    while (ext.startsWith(' ') || ext.startsWith('.')) ext = ext.substr(1)
    if (!ext) continue
    ext = '.' + ext
    if (list.includes(ext) == false) list.push(ext)
  }
  matchExtList.value = list
}

const handleSelectDir = () => {
  if (window.WebShowOpenDialogSync) {
    window.WebShowOpenDialogSync(
      {
        title: '选择一个文件夹，对文件夹内全部文件执行洗码',
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

const handleClickXiMa = async () => {
  if (ximaLoading.value) return
  if (!dirPath.value) {
    message.error('还没有选择要执行洗码的文件夹')
    return
  }
  ximaLoading.value = true

  const runCount = await DoXiMa(dirPath.value, breakSmall.value, matchExtList.value)
  await Sleep(2000)
  if (runCount > 0) message.success('成功洗码 ' + runCount + ' 个文件')
  ximaLoading.value = false
}
</script>

<template>
  <div class="fullscroll rightbg">
    <div class="settingcard">
      <div class="settinghead">1:选择要洗码的文件夹</div>
      <div class="settingrow">
        <a-input-search tabindex="-1" :readonly="true" button-text="选择文件夹" search-button :model-value="dirPath" @search="handleSelectDir" />
      </div>
      <div class="settingspace"></div>
      <div class="settinghead">2:选择要洗码的格式</div>
      <div class="settingrow">
        <MyTags :value="matchExtList" :maxlen="20" @update:value="handleAddExtList" />
        <div class="helptxt">默认不填，对文件夹内的全部文件，执行一次洗码</div>
        <div class="helptxt">例如填写 .mp4 就是只洗码.mp4结尾的文件</div>
      </div>
      <div class="settingspace"></div>
      <div class="settingrow">
        <MySwitch :value="breakSmall" @update:value="breakSmall = $event"> 自动跳过小于5MB的小文件</MySwitch>
      </div>

      <div class="settingspace"></div>
      <div class="settingspace"></div>

      <div class="settingrow">
        <a-button type="primary" tabindex="-1" status="danger" :loading="ximaLoading" @click="handleClickXiMa">执行洗码</a-button>
      </div>
    </div>

    <div class="settingcard">
      <span class="oporg">警告</span>：会对文件夹内 全部子文件、子文件夹 递归执行，会直接修改原文件！ <br />
      <span class="oporg">警告</span>：洗码操作不可逆，不可恢复，如果原文件很重要请提前自己 备份一份！ <br />
      <span class="oporg">警告</span>：仅推荐对常见视频格式洗码(.mp4.mkv.mov.avi.wmv.flv...)<br />
      <span class="oporg">警告</span>：洗码并不能对抗分享审查<br />
      <div class="settingspace"></div>
      <ol>
        <li><a-typography-text type="success">.mp4.mkv.mov.avi.wmv.flv已测试通过</a-typography-text></li>
        <li><a-typography-text type="success">.jpg.png.apng.tif.gif.heic已测试通过</a-typography-text></li>
        <li><a-typography-text type="success">.zip.rar.7z.tar已测试通过</a-typography-text></li>
        <li><a-typography-text type="danger">.gz文件测试失败，提示多余的附加数据</a-typography-text></li>
        <li><a-typography-text type="danger">.txt等文本类(.css.html.ini.csv.ass)测试失败，打开后在结尾会显示5个空字符(乱码)</a-typography-text></li>
        <li>更多格式请自行测试(洗码--检查文件是否可用)</li>
      </ol>
    </div>

    <div class="settingcard">
      <div class="settinghead">:为什么要洗码？</div>
      <div class="settingrow">
        网盘里转存了一些他人分享的视频 <br />
        当他人的原始视频被屏蔽时，自己网盘内转存的也会被屏蔽，不能下载 <br />
        对文件洗码后文件全网唯一，不分享不会被审查，也不会被牵连屏蔽 <br />
        <a-typography-text type="success">所以，洗码用来延长自己网盘内视频文件的有效性</a-typography-text>
      </div>
      <div class="settingspace"></div>
      <div class="settinghead">:洗码方式说明</div>
      <div class="settingrow">
        洗码会在原始文件的<span class="opblue">结尾增加</span>5字节的<span class="opblue">随机</span>数字(改变文件size/sha1/md5/crc64)，被洗码后的文件可以认为是全世界独一无二的。操作执行的很快的，1秒可以处理几千个文件。但是洗码操作不可逆，洗码后不可恢复，如果原文件很重要请提前<span class="oporg"
          >自己备份一份</span
        >！经过长期的测试验证，洗码后可以在网盘里长期保存。但洗码后如果创建分享，则会立即失效
      </div>
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
