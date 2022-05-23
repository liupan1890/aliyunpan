<script setup lang="ts">
import useSettingStore from './settingstore'
import MySwitch from '@/layout/MySwitch.vue'
import MyTags from '@/layout/MyTags.vue'
const settingStore = useSettingStore()
const cb = (val: any) => {
  settingStore.updateStore(val)
}
const handleSelectDownSavePath = () => {
  if (window.WebShowOpenDialogSync) {
    window.WebShowOpenDialogSync(
      {
        title: '选择一个文件夹，把所有文件下载到此文件夹内',
        buttonLabel: '选择',
        properties: ['openDirectory', 'createDirectory'],
        defaultPath: settingStore.downSavePath
      },
      (result: string[] | undefined) => {
        if (result && result[0]) {
          settingStore.updateStore({ downSavePath: result[0] })
        }
      }
    )
  }
}
</script>

<template>
  <div class="settingcard">
    <div class="settinghead">:下载文件保存的位置</div>
    <div class="settingrow">
      <a-input-search tabindex="-1" style="max-width: 420px" :readonly="true" button-text="更改" search-button :model-value="settingStore.downSavePath" @search="handleSelectDownSavePath" />
    </div>
    <div class="settingrow">
      <MySwitch :value="settingStore.downSavePathDefault" @update:value="cb({ downSavePathDefault: $event })"> 新建下载任务时 默认使用此路径</MySwitch>
    </div>
    <div class="settingrow">
      <MySwitch :value="settingStore.downSavePathFull" @update:value="cb({ downSavePathFull: $event })"> 新建下载任务时 按照网盘完整路径保存</MySwitch>
      <a-popover position="right">
        <i class="iconfont iconbulb" />
        <template #content>
          <div>
            默认：<span class="opred">开启</span>
            <hr />
            关闭后重名的文件会下载失败
          </div>
        </template>
      </a-popover>
    </div>
    <div class="settingrow">
      <MySwitch :value="settingStore.downSaveBreakWeiGui" @update:value="cb({ downSaveBreakWeiGui: $event })"> 新建下载任务时 自动跳过违规文件</MySwitch>
    </div>
  </div>

  <div class="settingcard">
    <div class="settinghead">:上传时 最大任务数</div>
    <div class="settingrow">
      <a-select tabindex="-1" :style="{ width: '252px' }" :model-value="settingStore.uploadFileMax" @update:model-value="cb({ uploadFileMax: $event })">
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
        <a-option :value="30">同时上传30个文件<template #suffix>巨量小文件</template></a-option>
      </a-select>
    </div>
    <div class="settingspace"></div>
    <div class="settinghead">:下载时 最大任务数</div>
    <div class="settingrow">
      <a-select tabindex="-1" :style="{ width: '252px' }" :model-value="settingStore.downFileMax" @update:model-value="cb({ downFileMax: $event })">
        <a-option :value="1">
          同时下载 1 个文件
          <template #suffix>大文件</template>
        </a-option>
        <a-option :value="3">同时下载 3 个文件</a-option>
        <a-option :value="5">
          同时下载 5 个文件
          <template #suffix>推荐</template>
        </a-option>
        <a-option :value="10">同时下载10个文件</a-option>
        <a-option :value="20">同时下载20个文件</a-option>
        <a-option :value="30">同时下载30个文件<template #suffix>巨量小文件</template></a-option>
      </a-select>
    </div>
    <div class="settingspace"></div>
    <div class="settinghead">:下载时 每个文件的下载线程</div>
    <div class="settingrow">
      <a-select tabindex="-1" :style="{ width: '252px' }" :model-value="settingStore.downThreadMax" @update:model-value="cb({ downThreadMax: $event })">
        <a-option :value="1">每个文件使用 1 个线程</a-option>
        <a-option :value="2">每个文件使用 2 个线程</a-option>
        <a-option :value="4">每个文件使用 4 个线程<template #suffix>推荐</template></a-option>
        <a-option :value="8">每个文件使用 8 个线程</a-option>
        <a-option :value="16">每个文件使用16个线程</a-option>
      </a-select>
      <a-popover position="right">
        <i class="iconfont iconbulb" />
        <template #content>
          <div>
            默认：<span class="opred">16个线程</span>
            <hr />
            经测试16线程就可以跑满千兆光纤<br />
            64/128 线程需要你手动替换Aria2.exe
          </div>
        </template>
      </a-popover>
    </div>
    <div class="settingspace"></div>
    <div class="settinghead">:下载时 总下载速度限制</div>
    <div class="settingrow" style="display: flex; align-items: center">
      <a-input-number
        tabindex="-1"
        :style="{ width: '128px' }"
        mode="button"
        :min="0"
        :max="settingStore.downGlobalSpeedM == 'MB' ? 100 : 999"
        :step="settingStore.downGlobalSpeedM == 'MB' ? 5 : 50"
        :model-value="settingStore.downGlobalSpeed"
        @update:model-value="cb({ downGlobalSpeed: $event })"
      >
      </a-input-number>
      <div style="height: 32px; border-left: 1px solid var(--color-neutral-3)"></div>
      <a-radio-group type="button" tabindex="-1" :model-value="settingStore.downGlobalSpeedM" @update:model-value="cb({ downGlobalSpeedM: $event, downGlobalSpeed: 0 })">
        <a-radio tabindex="-1" value="MB">MB/s</a-radio>
        <a-radio tabindex="-1" value="KB">KB/s</a-radio>
      </a-radio-group>
      <a-popover position="bottom">
        <i class="iconfont iconbulb" />
        <template #content>
          <div :style="{ width: '360px' }">
            默认：<span class="opred">0 (不限速，满速下载)</span>
            <hr />
            <span class="opred">0-100MB/s</span> 百兆宽带最高跑到 12MB/s<br />
            <span class="opred">0-999KB/s</span> 超慢的宽带请选择KB/s (1MB/s=1000KB/s)<br />
            适当的限速可以不影响其他人上网
          </div>
        </template>
      </a-popover>
    </div>
  </div>
  <div class="settingcard">
    <div class="settinghead">:本次传输完成后自动关机</div>
    <div class="settingrow">
      <MySwitch :value="settingStore.downAutoShutDown > 0" @update:value="cb({ downAutoShutDown: $event ? 1 : 0 })"> 下载中&&上传中 的任务全部完成后自动关机</MySwitch>
      <a-popover position="bottom">
        <i class="iconfont iconbulb" />
        <template #content>
          <div>
            默认：<span class="opred">关闭</span>
            <hr />
            启用后，下载完会弹窗提示：倒数60秒后关机<br />
            倒数结束前随时可以取消关机操作
          </div>
        </template>
      </a-popover>
    </div>
    <div class="settingspace"></div>
    <div class="settinghead">:下载时 优先下载小文件</div>
    <div class="settingrow">
      <MySwitch :value="settingStore.downSmallFileFirst" @update:value="cb({ downSmallFileFirst: $event })"> 下载中 优先下载小于100MB的小文件</MySwitch>
      <a-popover position="right">
        <i class="iconfont iconbulb" />
        <template #content>
          <div>
            默认：<span class="opred">关闭</span>
            <hr />
            当有很多文件需要下载时<br />着急用小文件，可以开启此选项
          </div>
        </template>
      </a-popover>
    </div>
    <div class="settingspace"></div>
    <div class="settinghead">:上传时 使用增量上传模式</div>
    <div class="settingrow">
      <MySwitch :value="settingStore.downUploadBreakExist" @update:value="cb({ downUploadBreakExist: $event })"> 上传中 若网盘中已存在同名文件，跳过不上传</MySwitch>
      <a-popover position="bottom">
        <i class="iconfont iconbulb" />
        <template #content>
          <div>
            默认：<span class="opred">关闭</span>
            <hr />
            默认上传前会计算校验文件的sha1确保文件被正确上传<br />
            <div class="hrspace"></div>
            有时需要重复上传同一个文件夹，开启可以节省上传时间<br />
            只上传文件夹内新增的文件，跳过网盘内已存在的文件<br />
            <div class="hrspace"></div>
            <span class="oporg">注意：会直接跳过同名文件，不管文件是否修改过</span>
          </div>
        </template>
      </a-popover>
    </div>
    <div class="settingspace"></div>
    <div class="settinghead">:上传时 使用秒传模式</div>
    <div class="settingrow">
      <MySwitch :value="settingStore.downUploadBreakFile" @update:value="cb({ downUploadBreakFile: $event })"> 只上传可以秒传的文件，跳过不能秒传的文件</MySwitch>
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
    <div class="settingspace"></div>
    <div class="settinghead">:上传/下载时 任务栏显示进度</div>
    <div class="settingrow">
      <MySwitch :value="settingStore.downSaveShowPro" @update:value="cb({ downSaveShowPro: $event })"> 下载中&&上传中 在任务栏显示进度</MySwitch>
    </div>
    <div class="settingspace"></div>
    <div class="settinghead">
      :上传/下载前 过滤文件
      <a-popover position="bottom">
        <i class="iconfont iconbulb" />
        <template #content>
          <div>
            上传下载时可以根据文件名结尾去过滤文件(不上传下载)
            <hr />
            1. 设置的过滤规则是过滤文件的，不会过滤文件夹<br />
            2. 过滤规则可以是任意字符(一般填扩展名)，按文件名是否以规则结尾过滤，忽略大小写<br />
            3. 过滤规则是一直生效的，每次上传下载都会过滤，不想过滤时应该删除规则<br />
            4. 请先设置好过滤规则再去上传下载文件。<span class="oporg">有文件正在上传下载时不能修改规则！</span> <br />
            5. 最多可以配置30个规则 <br />
            <div class="hrspace"></div>
            <div class="hrspace"></div>
            <a-typography-text mark> 　if(　filename.toLower().endWith('<span class="opred">.mp3</span>')　) break 　</a-typography-text>
            <br />
            例如：填<span class="opred">.mp3</span>,则上传下载时会跳过以 .mp3 结尾的文件<br />
            例如：填<span class="opred">001.ppt.txt</span>,则上传下载时会跳过以 001.ppt.txt 结尾的文件
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
