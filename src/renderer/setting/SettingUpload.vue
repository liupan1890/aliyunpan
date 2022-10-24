<script setup lang="ts">
import useSettingStore from './settingstore'
import MySwitch from '../layout/MySwitch.vue'
import MyTags from '../layout/MyTags.vue'
const settingStore = useSettingStore()
const cb = (val: any) => {
  settingStore.updateStore(val)
}
</script>

<template>
  <div class="settingcard">
    <div class="settinghead">:上传时 最大并行任务数</div>
    <div class="settingrow">
      <a-select tabindex="-1" :style="{ width: '252px' }" :model-value="settingStore.uploadFileMax" :popup-container="'#SettingDiv'" @update:model-value="cb({ uploadFileMax: $event })">
        <a-option :value="1">
          同时上传 1 个文件
          <template #suffix>大文件</template>
        </a-option>
        <a-option :value="3">同时上传 3 个文件</a-option>
        <a-option :value="5">
          同时上传 5 个文件
          <template #suffix>推荐</template>
        </a-option>
        <a-option :value="10">同时上传10个文件</a-option>
        <a-option :value="20">同时上传20个文件</a-option>
        <a-option :value="30">同时上传30个文件<template #suffix>大量小文件</template></a-option>
        <a-option :value="50">同时上传50个文件</a-option>
      </a-select>
    </div>

    <div class="settingspace"></div>
    <div class="settinghead">:上传时 总上传速度限制</div>
    <div class="settingrow" style="display: flex; align-items: center">
      <a-input-number
        tabindex="-1"
        :style="{ width: '128px' }"
        mode="button"
        :min="0"
        :max="settingStore.uploadGlobalSpeedM == 'MB' ? 100 : 999"
        :step="settingStore.uploadGlobalSpeedM == 'MB' ? 1 : 40"
        :model-value="settingStore.uploadGlobalSpeed"
        @update:model-value="cb({ uploadGlobalSpeed: $event })">
      </a-input-number>
      <div style="height: 32px; border-left: 1px solid var(--color-neutral-3)"></div>
      <a-radio-group type="button" tabindex="-1" :model-value="settingStore.uploadGlobalSpeedM" @update:model-value="cb({ uploadGlobalSpeedM: $event, uploadGlobalSpeed: 0 })">
        <a-radio tabindex="-1" value="MB">MB/s</a-radio>
        <a-radio tabindex="-1" value="KB">KB/s</a-radio>
      </a-radio-group>
      <a-popover position="bottom">
        <i class="iconfont iconbulb" />
        <template #content>
          <div :style="{ width: '360px' }">
            默认：<span class="opred">0 (不限速，满速上传)</span>
            <hr />
            <span class="opred">0-100MB/s</span> 百兆宽带最高跑到 12MB/s<br />
            <span class="opred">0-999KB/s</span> 超慢的宽带请选择KB/s (1MB/s=1000KB/s)<br />
            适当的限速可以不影响其他人上网
          </div>
        </template>
      </a-popover>
    </div>

    <div class="settingspace"></div>
    <div class="settinghead">:上传时 使用秒传模式</div>
    <div class="settingrow">
      <MySwitch :value="settingStore.downUploadBreakFile" @update:value="cb({ downUploadBreakFile: $event })"> 上传中 只通过秒传上传，暂停不能秒传的任务</MySwitch>
      <a-popover position="bottom">
        <i class="iconfont iconbulb" />
        <template #content>
          <div>
            默认：<span class="opred">关闭</span>
            <hr />
            开启后，上传时只上传能够秒传的文件<br />
            遇到不能秒传的文件会暂停这个上传任务
          </div>
        </template>
      </a-popover>
    </div>
  </div>

  <div class="settingcard">
    <div class="settinghead">:上传下载完 自动关机</div>
    <div class="settingrow">
      <MySwitch :value="settingStore.downAutoShutDown > 0" @update:value="cb({ downAutoShutDown: $event ? 1 : 0 })"> 下载中/上传中 的任务全部完成后自动关机</MySwitch>
      <a-popover position="bottom">
        <i class="iconfont iconbulb" />
        <template #content>
          <div>
            默认：<span class="opred">关闭</span>
            <hr />
            启用后，全部传输完成后会弹窗提示：倒数60秒后关机<br />
            倒数结束前，随时可以取消关机
          </div>
        </template>
      </a-popover>
    </div>
    <div class="settingspace"></div>
    <div class="settinghead">:上传下载完 声音提示</div>
    <div class="settingrow">
      <MySwitch :value="settingStore.downFinishAudio" @update:value="cb({ downFinishAudio: $event })"> 下载中/上传中 的任务全部完成后声音提示</MySwitch>
    </div>
  </div>

  <div class="settingcard">
    <div class="settinghead">:上传下载时 优先传输小文件</div>
    <div class="settingrow">
      <MySwitch :value="settingStore.downSmallFileFirst" @update:value="cb({ downSmallFileFirst: $event })"> 下载中/上传中 优先传输小于100MB的文件</MySwitch>
      <a-popover position="right">
        <i class="iconfont iconbulb" />
        <template #content>
          <div>
            默认：<span class="opred">关闭</span>
            <hr />
            当有很多文件需要上传下载时<br />着急用小文件，可以开启此选项
          </div>
        </template>
      </a-popover>
    </div>

    <div class="settingspace"></div>
    <div class="settinghead">:上传下载时 任务栏显示总进度</div>
    <div class="settingrow">
      <MySwitch :value="settingStore.downSaveShowPro" @update:value="cb({ downSaveShowPro: $event })"> 下载中/上传中 在任务栏显示总进度</MySwitch>
    </div>
    <div class="settingspace"></div>
    <div class="settinghead">
      :上传下载时 预先过滤文件
      <a-popover position="bottom">
        <i class="iconfont iconbulb" />
        <template #content>
          <div>
            上传/下载时可以根据文件名结尾去过滤文件(不上传/下载)
            <hr />
            1. 设置的过滤规则是过滤文件的，不会过滤文件夹<br />
            2. 过滤规则可以是任意字符(一般填扩展名)，按文件名是否以规则结尾过滤，忽略大小写<br />
            3. 过滤规则是一直生效的，每次上传/下载都会过滤，不想过滤时应该删除规则<br />
            4. 请先设置好过滤规则再去上传/下载文件。<span class="oporg">有文件正在上传/下载时不能修改规则！</span> <br />
            5. 最多可以配置30个规则 <br />
            <div class="hrspace"></div>
            <div class="hrspace"></div>
            <a-typography-text mark> 　if(　fileName.toLower().endWith('<span class="opred">.mp3</span>')　) break 　</a-typography-text>
            <br />
            例如：填<span class="opred">.mp3</span>,则上传/下载时会跳过以 .mp3 结尾的文件<br />
            例如：填<span class="opred">001.ppt.txt</span>,则上传/下载时会跳过以 001.ppt.txt 结尾的文件
            <div class="hrspace"></div>
            <div class="hrspace"></div>
            默认已添加：<span class="opred">thumbs.db</span>, <span class="opred">desktop.ini</span>, <span class="opred">.ds_store</span>, <span class="opred">.td</span>, <span class="opred">.downloading</span>
          </div>
        </template>
      </a-popover>
    </div>
    <div class="settingrow">
      <MyTags :value="settingStore.downIngoredList" :maxlen="20" @update:value="cb({ downIngoredList: $event })" />
    </div>
  </div>
</template>

<style></style>
