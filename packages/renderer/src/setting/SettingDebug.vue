<script setup lang="ts">
import useSettingStore from './settingstore'
import AppCache from '@/utils/appcache'
import MySwitch from '@/layout/MySwitch.vue'
const settingStore = useSettingStore()
const cb = (val: any) => {
  settingStore.updateStore(val)
}
</script>

<template>
  <div class="settingcard">
    <div class="settinghead">:顶部显示网盘路径</div>
    <div class="settingrow">
      <MySwitch :value="settingStore.uiShowPanPath" @update:value="cb({ uiShowPanPath: $event })">是否在顶部显示完整的文件夹路径</MySwitch>
    </div>
    <div class="settingspace"></div>
    <div class="settinghead">:自动统计文件夹体积</div>
    <div class="settingrow">
      <MySwitch :value="settingStore.uiFolderSize" @update:value="cb({ uiFolderSize: $event })">是否自动统计并显示文件夹的体积</MySwitch>
      <a-popover position="bottom">
        <i class="iconfont iconbulb" />
        <template #content>
          <div>
            默认：<span class="opred">开启</span>
            <hr />
            开启后，小白羊会在后台计算文件夹的体积<br />
            在文件列表里会显示文件夹的体积，文件夹可以按照体积排序
            <div class="hrspace"></div>
            <span class="oporg">注：</span>文件夹体积不是时时更新的，会有误差，定时自动更新
          </div>
        </template>
      </a-popover>
    </div>
    <div class="settingspace"></div>
    <div class="settinghead">:每个文件夹独立排序</div>
    <div class="settingrow">
      <a-select tabindex="-1" :style="{ width: '252px' }" :model-value="settingStore.uiFileOrderDuli" @update:model-value="cb({ uiFileOrderDuli: $event })">
        <a-option value="null">
          不开启文件夹的独立排序
          <template #suffix>推荐</template>
        </a-option>
        <a-option value="name asc">开启&默认文件名 升序</a-option>
        <a-option value="name desc">开启&默认文件名 降序</a-option>
        <a-option value="updated_at asc">开启&默认时间 升序</a-option>
        <a-option value="updated_at desc">开启&默认时间 降序</a-option>
        <a-option value="size asc">开启&默认大小 升序</a-option>
        <a-option value="size desc">开启&默认大小 降序</a-option>
      </a-select>
    </div>
  </div>
  <div class="settingcard">
    <div class="settinghead">:文件夹列出文件 显示限制</div>
    <div class="settingrow">
      <a-input-number tabindex="-1" :style="{ width: '252px' }" mode="button" :min="1000" :max="3000" :step="100" :model-value="settingStore.debugFileListMax" @update:model-value="cb({ debugFileListMax: $event })">
        <template #prefix> 只显示前 </template>
        <template #suffix> 个文件 </template>
      </a-input-number>
      <a-popover position="bottom">
        <i class="iconfont iconbulb" />
        <template #content>
          <div>
            默认：<span class="opred">1000</span> (1000-3000)
            <hr />
            进入文件夹后，只显示前2000个文件，剩余文件不显示
            <div class="hrspace"></div>
            <span class="oporg">注：</span>只是不显示，下载整个文件夹时会正确下载全部文件
          </div>
        </template>
      </a-popover>
    </div>
    <div class="settingspace"></div>
    <div class="settinghead">:收藏夹/回收站/全盘搜索 显示限制</div>
    <div class="settingrow">
      <div class="settingrow">
        <a-input-number tabindex="-1" :style="{ width: '252px' }" mode="button" :min="100" :max="3000" :step="100" :model-value="settingStore.debugFavorListMax" @update:model-value="cb({ debugFavorListMax: $event })">
          <template #prefix> 只显示前 </template>
          <template #suffix> 个文件 </template>
        </a-input-number>
        <a-popover position="bottom">
          <i class="iconfont iconbulb" />
          <template #content>
            <div>
              默认：<span class="opred">1000</span> (1000-3000)
              <hr />
              收藏夹/回收站/全盘搜索，只显示前1000个文件
              <div class="hrspace"></div>
              <span class="oporg">注：</span>只是不显示，不影响文件。为了加快文件列表的加载速度
            </div>
          </template>
        </a-popover>
      </div>
    </div>
    <div class="settingspace"></div>
    <div class="settinghead">:下载完/上传完记录 存储限制</div>
    <div class="settingrow">
      <div class="settingrow">
        <a-input-number tabindex="-1" :style="{ width: '252px' }" mode="button" :min="1000" :max="50000" :step="1000" :model-value="settingStore.debugDownedListMax" @update:model-value="cb({ debugDownedListMax: $event })">
          <template #prefix> 保留最后 </template>
          <template #suffix> 条记录 </template>
        </a-input-number>
        <a-popover position="bottom">
          <i class="iconfont iconbulb" />
          <template #content>
            <div>
              默认：<span class="opred">5000</span> (1000-50000)
              <hr />
              只保留最新的5000个已完成的 下载/上传记录<br />
              之前的传输记录会被自动清理，不影响下载上传操作，不影响本地文件
            </div>
          </template>
        </a-popover>
      </div>
    </div>
  </div>

  <div class="settingcard">
    <a-alert banner type="warning">默认 不会产生任何 上传到服务器的数据</a-alert>
    <div class="settingspace"></div>
    <div class="settinghead">:自动填写 分享链接提取码</div>
    <div class="settingrow">
      <MySwitch :value="settingStore.yinsiLinkPassword" @update:value="cb({ yinsiLinkPassword: $event })">导入分享时，是否尝试自动填写提取码</MySwitch>
      <a-popover position="bottom">
        <i class="iconfont iconbulb" />
        <template #content>
          <div>
            默认：<span class="opred">关闭</span>
            <hr />
            有的分享链接需要填写提取码，如果你不知道提取码<br />
            开启后，有极小的几率可以自动填写<br />
            就是类似百度网盘助手自动填写提取码<br />
            <div class="hrspace"></div>
            <span class="oporg">注意：</span> 开启后会自动收集你 <span class="opblue">导入的</span> 分享链接的提取码
          </div>
        </template>
      </a-popover>
    </div>
    <div class="settingspace"></div>
    <div class="settinghead">:自动填写 在线解压密码</div>
    <div class="settingrow">
      <MySwitch :value="settingStore.yinsiZipPassword" @update:value="cb({ yinsiZipPassword: $event })">在线解压时，是否尝试自动填写解压密码</MySwitch>
      <a-popover position="bottom">
        <i class="iconfont iconbulb" />
        <template #content>
          <div>
            默认：<span class="opred">关闭</span>
            <hr />
            有的压缩包在线解压需要填写密码，如果你不知道密码<br />
            开启后，有极小的几率可以自动填写<br />
            <div class="hrspace"></div>
            <span class="oporg">注意：</span> 开启后会自动收集你 <span class="opblue">在线解压</span> 的解压密码
          </div>
        </template>
      </a-popover>
    </div>
  </div>
  <div class="settingcard">
    <div class="settinghead">
      :缓存路径
      <span class="opblue" style="margin-left: 12px; padding: 0 12px">( {{ settingStore.debugCacheSize }} )</span>
    </div>
    <div class="settingrow">
      <a-input tabindex="-1" :model-value="AppCache.AppUserData" placeholder="C:\Users\用户名\AppData\Roaming\alixby3" :readonly="true" />
    </div>
    <div class="settingspace"></div>
    <div class="settingrow">
      <a-popconfirm content="确认要清理数据库？" @ok="AppCache.aClearCache('db')">
        <a-button type="outline" size="small" tabindex="-1" status="danger" style="margin-right: 16px">清理数据库</a-button>
      </a-popconfirm>

      <a-popconfirm content="确认要清理缓存？" @ok="AppCache.aClearCache('cache')">
        <a-button type="outline" size="small" tabindex="-1" status="danger" style="margin-right: 16px">清理缓存</a-button>
      </a-popconfirm>
      <a-popconfirm content="确认要重置？会重启小白羊" @ok="AppCache.aClearCache('all')">
        <a-button type="outline" size="small" tabindex="-1" status="danger" style="margin-right: 16px">删除全部数据(重置)</a-button>
      </a-popconfirm>
    </div>
  </div>
</template>

<style></style>
