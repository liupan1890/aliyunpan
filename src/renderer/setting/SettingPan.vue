<script setup lang="ts">
import useSettingStore from './settingstore'
import MySwitch from '../layout/MySwitch.vue'
const settingStore = useSettingStore()
const cb = (val: any) => {
  settingStore.updateStore(val)
}
</script>

<template>
  <div class="settingcard">
    <div class="settinghead">:顶部显示网盘路径</div>
    <div class="settingrow">
      <MySwitch :value="settingStore.uiShowPanPath" @update:value="cb({ uiShowPanPath: $event })">在顶部显示完整的文件夹路径</MySwitch>
    </div>
    <div class="settingspace"></div>
    <div class="settinghead">:文件列表显示附属信息</div>
    <div class="settingrow">
      <MySwitch :value="settingStore.uiShowPanMedia" @update:value="cb({ uiShowPanMedia: $event })">在右侧文件列表中显示每个文件的（播放时长、分辨率）</MySwitch>
    </div>
    <div class="settingspace"></div>
    <div class="settinghead">:自动统计文件夹体积</div>
    <div class="settingrow">
      <MySwitch :value="settingStore.uiFolderSize" @update:value="cb({ uiFolderSize: $event })">自动统计并显示文件夹的总体积</MySwitch>
      <a-popover position="bottom">
        <i class="iconfont iconbulb" />
        <template #content>
          <div>
            默认：<span class="opred">开启</span>
            <hr />
            开启后，小白羊会在后台计算文件夹的体积<br />
            在文件列表里会显示文件夹的总体积 (子文件 + 子文件夹)
            <div class="hrspace"></div>
            <span class="oporg">注：</span>文件夹体积不是时时更新的，会有误差，定时自动更新
          </div>
        </template>
      </a-popover>
    </div>
    <div class="settingspace"></div>
    <div class="settinghead">:每个文件夹独立排序</div>
    <div class="settingrow">
      <a-select tabindex="-1" :style="{ width: '252px' }" :model-value="settingStore.uiFileOrderDuli" :popup-container="'#SettingDiv'" @update:model-value="cb({ uiFileOrderDuli: $event })">
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
    <div class="settinghead">:新建日期文件夹模板</div>
    <div class="settingrow">
      <a-input tabindex="-1" :style="{ width: '257px' }" placeholder="yyyy-MM-dd HH-mm-ss" allow-clear :model-value="settingStore.uiTimeFolderFormate" @update:model-value="cb({ uiTimeFolderFormate: $event })" />
      <a-input-number tabindex="-1" :style="{ width: '100px', marginLeft: '16px', marginTop: '-1px' }" :min="1" :model-value="settingStore.uiTimeFolderIndex" @update:model-value="cb({ uiTimeFolderIndex: $event })" />

      <a-popover position="bottom">
        <i class="iconfont iconbulb" />
        <template #content>
          <div style="min-width: 400px">
            默认：<span class="opred">默认yyyy-MM-dd HH-mm-ss</span>(2021-08-08 12-30-00)
            <hr />
            这里是编写命名模板，创建文件夹时会自动替换成当前时间对应的内容
            <br />
            年=<span class="oporg">yyyy</span> 月=<span class="oporg">MM</span> 日=<span class="oporg">dd</span> 时=<span class="oporg">HH</span> 分= <span class="oporg">mm</span> 秒= <span class="oporg">ss</span> 编号=<span class="oporg">#</span>
            <div class="hrspace"></div>
            在这里可以修改编号起始数字，每次成功创建文件夹编号会自动+1
            <br />
            编号可以通过多个#来设置最短的长度
            <div class="hrspace"></div>
            例如:<span class="oporg">#### 创建于yyyy年MM月dd日</span> --&gt;
            <span class="opblue">0001 创建于2021年08月08日</span>
            <br />
            例如:<span class="oporg">yyyy年MM月相册 ##</span> --&gt;
            <span class="opblue">2021年08月相册 01</span>
          </div>
        </template>
      </a-popover>
    </div>
    <div class="settingspace"></div>
    <div class="settinghead">:新建分享链接 有效期/提取码</div>
    <div class="settingrow flex">
      <a-radio-group type="button" tabindex="-1" :model-value="settingStore.uiShareDays" @update:model-value="cb({ uiShareDays: $event })">
        <a-radio tabindex="-1" value="always">永久</a-radio>
        <a-radio tabindex="-1" value="week">一周</a-radio>
        <a-radio tabindex="-1" value="month">一月</a-radio>
      </a-radio-group>

      <div style="margin-right: 8px"></div>

      <a-radio-group type="button" tabindex="-1" :model-value="settingStore.uiSharePassword" @update:model-value="cb({ uiSharePassword: $event })">
        <a-radio tabindex="-1" value="random">随机</a-radio>
        <a-radio tabindex="-1" value="last">上次</a-radio>
        <a-radio tabindex="-1" value="nopassword">无提取码</a-radio>
      </a-radio-group>

      <a-popover position="bottom">
        <i class="iconfont iconbulb" />
        <template #content>
          <div>
            默认：<span class="opred">永久</span>，<span class="opred">随机</span>
            <hr />
            <span class="opred">永久</span>：新建分享链接永久有效
            <br />
            <span class="opred">一周</span>：新建分享链接7天内有效
            <br />
            <span class="opred">一月</span>：新建分享链接30天内有效
            <br />
            <div class="hrspace"></div>
            <span class="opred">随机</span>：随机生成4位数字字母组合
            <br />
            <span class="opred">上次</span>：上一次创建分享链接时填写的密码
            <br />
            <span class="opred">无提取码</span>：没有提取码
            <br />
          </div>
        </template>
      </a-popover>
    </div>
    <div class="settingspace"></div>
    <div class="settinghead">:复制分享链接模板</div>
    <div class="settingrow">
      <a-input tabindex="-1" :style="{ width: '257px' }" placeholder="NAME URL 提取码：PWD" allow-clear :model-value="settingStore.uiShareFormate" @update:model-value="cb({ uiShareFormate: $event })" />

      <a-popover position="bottom">
        <i class="iconfont iconbulb" />
        <template #content>
          <div style="min-width: 400px">
            默认：<span class="opred">NAME 链接：URL 提取码：PWD</span> <br />
            测试分享 链接：https://www.aliyundrive.com/s/jEmmmDkF 提取码：DNJI
            <hr />
            这里是编写链接模板，网盘内点击复制分享链接时会自动替换成对应的内容
            <br />
            <span class="oporg">NAME</span>=分享链接标题 <span class="oporg">URL</span>=链接Url <span class="oporg">PWD</span>提取码 <span class="oporg">\n</span>=换行

            <div class="hrspace"></div>
            例如:<span class="oporg">URL#PWD#NAME</span> --&gt; <br />
            <span class="opblue">https://www.aliyundrive.com/s/jEmmmDkF#DNJI#测试分享</span>
            <br />
            例如:<span class="oporg">URL 提取码：PWD NAME</span> --&gt; <br />
            <span class="opblue">https://www.aliyundrive.com/s/jEmmmDkF 提取码：DNJI 测试分享</span>
          </div>
        </template>
      </a-popover>
    </div>
  </div>
  <div class="settingcard">
    <div class="settinghead">
      :文件标记 自定义标签名
      <a-popover position="right">
        <i class="iconfont iconbulb" />
        <template #content>
          <div>
            给文件打上标签，便于分类和快速访问<br />
            支持多地点自动同步(在家里打标、在公司查看)<br />
            支持在这里修改标签的名称<br />
            <div class="hrspace"></div>
            <span class="oporg">轻量使用：</span>不要花大量时间给大量文件打标签，<br />因为不使用小白羊就看不到这些标签了
            <br />
          </div>
        </template>
      </a-popover>
    </div>
    <div class="settingrow">
      <a-row class="grid-demo">
        <a-col v-for="item in settingStore.uiFileColorArray" :key="item.key" flex="210px">
          <span style="width: 82px; display: inline-block"><i class="iconfont iconcheckbox-full" :style="{ color: item.key }" />{{ item.key }}</span>
          <a-input :style="{ width: '120px' }" allow-clear :model-value="item.title" @update:model-value="(val:string)=>settingStore.updateFileColor(item.key,val)"> </a-input>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<style></style>
