<script setup lang="ts">
import { ref } from 'vue'
import { useSettingStore } from '../../store'
import { Sleep } from '../../utils/format'
import MyTags from '../../layout/MyTags.vue'
import MySwitch from '../../layout/MySwitch.vue'
import message from '../../utils/message'
import { DoXiMa } from './jiami'

const Loading = ref(false)
const dirPath = ref('')
const breakSmall = ref(true)
const copyMode = ref(false)
const videoMode = ref(true)
const passwored = ref('')
const mode = ref('加密')
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
        title: '选择一个文件夹，对文件夹内全部文件执行加密',
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
  if (Loading.value) return
  if (!dirPath.value) {
    message.error('还没有选择要执行加密的文件夹')
    return
  }
  Loading.value = true

  const runCount = await DoXiMa(dirPath.value, breakSmall.value, matchExtList.value)
  await Sleep(2000)
  if (runCount > 0) message.success('成功加密 ' + runCount + ' 个文件')
  Loading.value = false
}
</script>

<template>
  <div class="fullscroll rightbg">
    <div class="settingcard">
      <div class="settinghead">加密或解密文件</div>
      <div class="settingrow">
        <a-radio-group v-model="mode" type="button" tabindex="-1">
          <a-radio tabindex="-1" value="加密">加密文件</a-radio>
          <a-radio tabindex="-1" value="解密">解密文件</a-radio>
        </a-radio-group>
      </div>

      <div class="settingspace"></div>
      <div class="settinghead">1:选择要{{ mode }}的文件夹</div>
      <div class="settingrow">
        <a-input-search tabindex="-1" :readonly="true" button-text="选择文件夹" search-button :model-value="dirPath" @search="handleSelectDir" />
      </div>
      <div v-if="mode == '加密'">
        <div class="settingspace"></div>
        <div class="settinghead">2:选择要加密的格式</div>
        <div class="settingrow">
          <MyTags :value="matchExtList" :maxlen="20" @update:value="handleAddExtList" />
          <div class="helptxt">默认不填，对文件夹内的全部文件，执行一次加密</div>
          <div class="helptxt">例如填写 .mp4 就是只加密.mp4结尾的文件</div>
        </div>
        <div class="settingspace"></div>
        <div class="settingrow">
          <MySwitch :value="breakSmall" @update:value="breakSmall = $event"> 3:自动跳过小于5MB的小文件</MySwitch>
        </div>

        <div class="settingspace"></div>
        <div class="settingrow">
          <MySwitch :value="videoMode" @update:value="videoMode = $event"> 4:加密后的文件伪装成视频</MySwitch>
        </div>

        <div class="settingspace"></div>
        <div class="settingrow">
          <MySwitch :value="copyMode" @update:value="copyMode = $event"> 5:复制后加密模式，保留原文件，但更耗时</MySwitch>
        </div>

        <div class="settingspace"></div>
        <div class="settinghead">6:设置一个解密的密码</div>
        <div class="settingrow">
          <a-input v-model="passwored" tabindex="-1" :style="{ width: '257px' }" placeholder="可以不填" allow-clear />
          <div class="helptxt">默认不填，解密时无需密码直接解密</div>
          <div class="helptxt">可以填写任意字符串，解密时必须输入正确的密码才能解密</div>
        </div>
      </div>
      <div v-else>
        <div class="settingspace"></div>
        <div class="settinghead">2:解密的密码</div>
        <div class="settingrow">
          <a-input v-model="passwored" tabindex="-1" :style="{ width: '257px' }" placeholder="没有不填" allow-clear />
          <div class="helptxt">如果文件加密时设置了密码，则解密必须提供密码</div>
        </div>
      </div>

      <div class="settingspace"></div>
      <div class="settingspace"></div>

      <div class="settingrow">
        <a-button v-if="mode == '加密'" disabled type="primary" tabindex="-1" status="danger" :loading="Loading" @click="handleClickXiMa">执行加密</a-button>
        <a-button v-else disabled type="primary" tabindex="-1" status="success" :loading="Loading" @click="handleClickXiMa">执行解密</a-button>
        <div><span class="opred">文件加密功能仍在测试阶段，暂未开放公众使用</span></div>
      </div>
    </div>

    <div class="settingcard">
      <span class="oporg">警告</span>：会对文件夹内 全部子文件、子文件夹 递归执行，会直接修改原文件！ <br />
      <span class="oporg">警告</span>：复制后加密模式，会把原文件复制一份然后加密，请确认硬盘剩余空间！ <br />
      <span class="oporg">警告</span>：仅支持加密文件，不限制文件格式！ <br />
      <span class="oporg">警告</span>：不能把文件夹打包加密成一个文件！ <br />
    </div>

    <div class="settingcard">
      <div class="settinghead">:为什么要加密？</div>
      <div class="settingrow">
        网盘里存放了一些个人数据 <br />
        1.想要保护个人隐私，杜绝可能的AI审查 <br />
        2.想要分享一些文件，但因为文件格式受限 <br />
      </div>
      <div class="settingspace"></div>
      <div class="settinghead">:我直接打压缩包不就好了吗？</div>
      <div class="settingrow">
        1.加密的文件，可以尝试在小白羊里点击在线恢复文件(无需下载) <br />
        2.加密的文件，使用小白羊下载时会自动解密 <br />
        3.加密的视频文件，小白羊支持直接在线播放 <br />
        4.加密的文件，无法通过其他软件解密查看原始数据 <br />
      </div>
      <div class="settingspace"></div>
      <div class="settinghead">:文件加密方式说明</div>
      <div class="settingrow">
        1.计算文件的sha1+md5。解密时校验文件完整性 <br />
        2.对文件字节数据，分段加密(默认密钥+用户密码) <br />
        3.复制一些前导数据和追加一些计算出的数据 <br />
        <br />
        因为采用了自定义的加密算法，加密后的文件<span class="opred">现在只能</span>用小白羊客户端解密。以后会提供一个体积约3MB的单独命令工具，确保用户以后任何时间都可以自主顺利解密，不依赖小白羊客户端
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
