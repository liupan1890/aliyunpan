<script setup lang="ts">
import useSettingStore from './settingstore'
import MySwitch from '../layout/MySwitch.vue'
const settingStore = useSettingStore()
const cb = (val: any) => {
  settingStore.updateStore(val)
}

const platform = window.platform
function handleSelectPlayer() {
  if (window.WebShowOpenDialogSync) {
    window.WebShowOpenDialogSync(
      {
        title: '选择播放器的执行文件',
        buttonLabel: '选择',
        properties: ['openFile'],
        defaultPath: settingStore.uiVideoPlayerPath,
        filters: [{ name: '应用程序', extensions: ['exe', 'app'] }]
      },
      (result: string[] | undefined) => {
        if (result && result[0]) {
          settingStore.updateStore({ uiVideoPlayerPath: result[0] })
        }
      }
    )
  }
}
</script>

<template>
  <div class="settingcard">
    <div class="settinghead">:在线播放视频清晰度</div>
    <div class="settingrow">
      <a-radio-group type="button" tabindex="-1" :model-value="settingStore.uiVideoMode" @update:model-value="cb({ uiVideoMode: $event })">
        <a-radio tabindex="-1" value="mpv">播放原始的文件</a-radio>
        <a-radio tabindex="-1" value="online">播放转码后视频</a-radio>
      </a-radio-group>
      <a-popover position="bottom">
        <i class="iconfont iconbulb" />
        <template #content>
          <div>
            默认：<span class="opred">播放原始的文件</span>
            <hr />
            <span class="opred">播放原始的文件</span>：<br />
            原始的清晰度(1080P,2K,4K),支持<span class="oporg">多个音轨</span>/<span class="oporg">多个字幕</span>的切换<br />
            可以拖放加载自己的字幕,但文件体积太大时会卡(网络卡)

            <div class="hrspace"></div>
            <span class="opred">播放转码后视频</span>：<br />
            最高720P/1080P清晰度,不能选择音轨/字幕<br />
            理论上播放更流畅，但可能遇到字幕不显示
            <div class="hrspace"></div>
            <span class="oporg">注：违规视频会<span class="opblue">自动</span>通过转码视频播放</span>
          </div>
        </template>
      </a-popover>
    </div>
    <div class="settingspace"></div>
    <div class="settinghead">:在线播放视频播放器</div>
    <div class="settingrow">
      <a-radio-group type="button" tabindex="-1" :model-value="settingStore.uiVideoPlayer" @update:model-value="cb({ uiVideoPlayer: $event })">
        <a-radio tabindex="-1" value="mpv">内置mpv播放器</a-radio>
        <a-radio tabindex="-1" value="other">自定义播放软件</a-radio>
        <a-radio tabindex="-1" value="web">内置网页播放器</a-radio>
      </a-radio-group>
      <a-popover position="bottom">
        <i class="iconfont iconbulb" />
        <template #content>
          <div style="min-width: 400px">
            默认：<span class="opred">内置mpv播放器</span>
            <hr />
            <span class="opred">内置mpv播放器</span>：<br />
            windows/macOS 小白羊都内置了mpv播放器，无需任何设置直接播放
            <br />
            linux 系统特殊，需要自己执行命令<span class="opblue">sudo apt install mpv</span>安装<span class="oporg">一次</span>
            <br />
            mpv支持 快进、倍速播放、置顶、截图等非常多的功能(百度 MPV快捷键)
            <div class="hrspace"></div>
            <span class="opred">自定义播放软件</span>：<br />
            是实验性的功能，可以<span class="oporg">自己选择</span>电脑上安装的播放软件<br />
            例如:Potplayer,IINA<br />
            <div class="hrspace"></div>
            <span class="opred">内置网页播放器</span>：<br />
            使用Videojs网页，播放转码后的视频<br />
            支持 选择清晰度、倍速播放、内置字幕、画中画模式
            <div class="hrspace"></div>
            详情请参阅<span class="opblue">帮助文档</span>
          </div>
        </template>
      </a-popover>
      <div v-if="settingStore.uiVideoPlayer == 'mpv'" style="font-size: 12px; color: var(--color-text-3)">mpv 支持倍速！支持外挂字幕！支持切换音轨！</div>
      <div v-if="settingStore.uiVideoPlayer == 'web'" style="font-size: 12px; color: var(--color-text-3)">网页 支持倍速！支持选择清晰度！支持继续播放！</div>
    </div>
    <div class="settingrow" :style="{ display: settingStore.uiVideoPlayer == 'other' && platform == 'win32' ? '' : 'none', marginTop: '8px' }">
      <a-input-search tabindex="-1" style="max-width: 378px" :readonly="true" button-text="选择播放软件" search-button :model-value="settingStore.uiVideoPlayerPath" @search="handleSelectPlayer" />
      <a-popover position="bottom">
        <i class="iconfont iconbulb" />
        <template #content>
          <div style="min-width: 400px">
            <span class="opred">windows</span>：选择一个播放软件.exe
            <hr />
            直接手动选择播放软件的exe文件即可<br />
            例如：选择<span class="opblue">C:\Program Files\Potplayer\Potplayer.exe</span><br />
            也可以直接选择桌面上播放软件的快捷方式
            <div class="hrspace"></div>
            已测试：Potplayer，VLC，KMPlayer，恒星播放器，SMPlayer，MPC-HC
            <div class="hrspace"></div>
            详情请参阅<span class="opblue">帮助文档</span>
          </div>
        </template>
      </a-popover>
    </div>

    <div class="settingrow" :style="{ display: settingStore.uiVideoPlayer == 'other' && platform == 'darwin' ? '' : 'none', marginTop: '8px' }">
      <a-input-search tabindex="-1" style="max-width: 378px" :readonly="true" button-text="选择播放软件" search-button :model-value="settingStore.uiVideoPlayerPath" @search="handleSelectPlayer" />
      <a-popover position="bottom">
        <i class="iconfont iconbulb" />
        <template #content>
          <div style="min-width: 400px">
            <span class="opred">macOS</span>：选择一个播放软件.app
            <hr />
            1.点击 选择播放软件按钮 <span class="opblue">--></span> 弹出文件选择框，<br />
            2.点击 左上 应用程序 <span class="opblue">--></span> 点击一个 播放软件 <span class="opblue">--></span> 点击 确定
            <div class="hrspace"></div>
            已测试：IINA，MKPlayer，VLC
            <div class="hrspace"></div>
            详情请参阅<span class="opblue">帮助文档</span>
          </div>
        </template>
      </a-popover>
    </div>

    <div class="settingrow" :style="{ display: settingStore.uiVideoPlayer == 'other' && platform == 'linux' ? '' : 'none', marginTop: '8px' }">
      <a-auto-complete :data="['mpv', 'vlc', 'totem', 'mplayer', 'smplayer', 'xine', 'parole', 'kodi']" :style="{ width: '378px' }" placeholder="请填写一个播放软件" strict :model-value="settingStore.uiVideoPlayerPath" @change="cb({ uiVideoPlayerPath: $event })" />
      <a-popover position="bottom">
        <i class="iconfont iconbulb" />
        <template #content>
          <div style="min-width: 400px">
            <span class="opred">linux</span>：手动填写一个播放命令
            <hr />
            你必须先自己在电脑上安装（sudo apt install xxx），<br />
            然后才能使用这个播放软件，直接手动填写播放软件的名字
            <div class="hrspace"></div>
            已测试：mpv,vlc,totem,mplayer,smplayer,xine,parole,kodi
            <div class="hrspace"></div>
            详情请参阅<span class="opblue">帮助文档</span>
          </div>
        </template>
      </a-popover>
    </div>
    <div class="settingspace"></div>
    <div class="settinghead">:自动标记已看视频</div>
    <div class="settingrow">
      <MySwitch :value="settingStore.uiAutoColorVideo" @update:value="cb({ uiAutoColorVideo: $event })">观看视频时 将视频自动标记为浅灰色</MySwitch>
    </div>

    <div class="settingspace"></div>
    <div class="settinghead">:自动同步视频观看进度</div>
    <div class="settingrow">
      <MySwitch :value="settingStore.uiAutoPlaycursorVideo" @update:value="cb({ uiAutoPlaycursorVideo: $event })">观看视频时 将播放进度同步到网盘放映室</MySwitch>
      <a-popover position="bottom">
        <i class="iconfont iconbulb" />
        <template #content>
          <div style="min-width: 400px">只有使用 <span class="opblue">内置网页播放器</span> 时才支持同步 播放进度</div>
        </template>
      </a-popover>
    </div>
  </div>
  <div class="settingcard">
    <div class="settinghead">:在线预览图片方式</div>
    <div class="settingrow">
      <a-radio-group type="button" tabindex="-1" :model-value="settingStore.uiImageMode" @update:model-value="cb({ uiImageMode: $event })">
        <a-radio tabindex="-1" value="fill">缩放显示图集</a-radio>
        <a-radio tabindex="-1" value="width">单页显示长图</a-radio>
      </a-radio-group>
    </div>
  </div>
  <div class="settingcard">
    <div class="settinghead">:视频雪碧图 截图数量</div>
    <div class="settingrow">
      <a-radio-group type="button" tabindex="-1" :model-value="settingStore.uiXBTNumber" @update:model-value="cb({ uiXBTNumber: $event })">
        <a-radio tabindex="-1" :value="24">24张</a-radio>
        <a-radio tabindex="-1" :value="36">36张</a-radio>
        <a-radio tabindex="-1" :value="48">48张</a-radio>
        <a-radio tabindex="-1" :value="60">60张</a-radio>
        <a-radio tabindex="-1" :value="72">72张</a-radio>
      </a-radio-group>
    </div>
  </div>
</template>

<style></style>
