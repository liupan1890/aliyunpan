<template>
  <q-dialog v-model="showSetting" persistent no-focus no-refocus>
    <q-card style="height: 80vh; width: 80vw; max-width: 800px">
      <q-toolbar class="non-selectable" style="min-height: 40px">
        <q-avatar style="font-size: 24px; padding-left: 5px">
          <img src="img/app.png" />
        </q-avatar>

        <q-toolbar-title class="text-h6">设置</q-toolbar-title>

        <q-btn flat round dense icon="iconfont iconclose" v-close-popup />
      </q-toolbar>
      <q-card-section style="height: calc(100% - 60px); padding: 0" class="scroll">
        <div class="row" style="height: calc(100%)">
          <div class="col-sm-auto col-xs-2 settingborder">
            <q-tabs v-model="tab" vertical class="text-teal no-border">
              <q-tab name="down" icon="iconfont iconset" label="下载" class="text-primary" />
              <q-tab name="ui" icon="iconfont iconui" label="UI" class="text-amber-10" />
              <q-tab name="aria" icon="iconfont iconchuanshu" label="Aria2" class="text-blue-7" />
              <q-tab name="about" icon="iconfont iconinstagram" label="关于" class="text-teal-5" />
            </q-tabs>
          </div>
          <div class="col scroll" style="height: calc(100% - 1px)">
            <q-tab-panels v-model="tab" animated vertical :swipeable="false" transition-prev="jump-up" transition-next="jump-up">
              <q-tab-panel name="down" class="column">
                <div class="col">
                  <div class="settinghead first">:下载文件保存位置</div>
                  <div style="max-width: 460px">
                    <q-input dense outlined readonly spellcheck="false" :model-value="downSavePath" webkitdirectory>
                      <template v-slot:prepend>
                        <q-icon name="iconfont iconfolder" />
                      </template>
                      <template v-slot:after>
                        <q-btn dense color="primary" label="选择" style="padding: 0 12px" @click="SelectDir"> </q-btn>
                      </template>
                    </q-input>
                  </div>
                </div>
                <div class="col" style="padding-top: 4px">
                  <q-toggle dense v-model="downSavePathEveryTime" checked-icon="iconfont iconcheck" color="red" label="每次下载都选择保存位置" unchecked-icon="iconfont iconclose" keep-color>
                    <q-tooltip anchor="bottom left" self="top left" :delay="700" :offset="[-10, -4]">
                      <p style="font-size: 12px; padding: 0px; margin: 0">
                        默认是保存到：<br />
                        <q-chip dense color="deep-orange" text-color="white" size="12px"> 下载保存位置 </q-chip>+
                        <q-chip dense color="deep-orange" text-color="white" size="12px"> 云盘里完整路径 </q-chip><br />
                        例如：D:/ Down / 云盘里的 / 文件夹 / 下载文件.mp4<br /><br />
                        开启此选项后，就可以直接保存到<q-chip dense color="deep-orange" text-color="white" size="12px">刚刚选择的</q-chip>文件夹里<br />
                        例如：D:/ 选择的文件夹 / 下载文件.mp4
                      </p>
                    </q-tooltip>
                  </q-toggle>
                </div>
                <div class="col">
                  <div class="settinghead">:同时上传/下载任务数</div>
                  <q-select
                    outlined
                    dense
                    v-model="downFileMax"
                    :options="downFileMaxOptions"
                    :options-dense="true"
                    :map-options="true"
                    emit-value
                    dropdown-icon="iconfont icondown"
                    style="width: 260px"
                  >
                  </q-select>
                </div>
                <div class="col">
                  <div class="settinghead">:每个文件下载线程并发数</div>
                  <q-select
                    outlined
                    dense
                    v-model="downThreadMax"
                    :options="downThreadMaxOptions"
                    :options-dense="true"
                    :map-options="true"
                    emit-value
                    dropdown-icon="iconfont icondown"
                    style="width: 260px"
                  >
                  </q-select>
                </div>

                <div class="col">
                  <div class="settinghead">:全局下载速度限制</div>
                  <q-input dense outlined v-model="downGlobalSpeed" type="number" suffix="MB/s" placeholder="不填或填0等于不限速" style="width: 260px"
                    ><q-tooltip anchor="bottom left" self="top left" :delay="700" :offset="[-10, -4]">
                      <p style="font-size: 12px; padding: 0px; margin: 0">填 0 不限速，填 2 就是最高 2MB/s(20兆宽带)<br />适当的限速可以一边下载一边玩游戏，不限速时会全速下载影响别人上网。</p>
                    </q-tooltip>
                  </q-input>
                </div>
              </q-tab-panel>

              <q-tab-panel name="ui" class="column" style="min-height: 240px">
                <div class="col">
                  <div class="settinghead first">:主题</div>
                  <div>
                    <q-btn-toggle
                      dense
                      v-model="uiTheme"
                      toggle-color="primary"
                      :options="[
                        { label: '浅色模式', value: 'red' },
                        { label: '深色模式', value: 'dark' },
                      ]"
                    />
                  </div>
                </div>
                <div class="col">
                  <div class="settinghead">:预览图片模式</div>
                  <div>
                    <q-btn-toggle
                      dense
                      v-model="uiImageMode"
                      toggle-color="primary"
                      :options="[
                        { label: '缩放显示全图', value: 'fill' },
                        { label: '全宽显示长图', value: 'width' },
                      ]"
                    >
                      <q-tooltip>缩放适合浏览照片，全宽适合看漫画</q-tooltip>
                    </q-btn-toggle>
                  </div>
                </div>
                <div class="col">
                  <div class="settinghead">:预览视频模式</div>
                  <div>
                    <q-btn-toggle
                      dense
                      v-model="uiVideoMode"
                      toggle-color="primary"
                      :options="[
                        { label: '优先播放转码视频', value: 'online' },
                        { label: '强制播放原始文件', value: 'mpv' },
                      ]"
                      ><q-tooltip
                        >优先播放云盘转码后的视频：<br />
                        有转码链接时，会自动选择最高画质(1080P)，播放应该更流畅<br />
                        没有转码链接时，再播放原始文件。(刚上传的视频几分钟后才有转码链接)<br /><br />
                        强制播放原始文件：<br />
                        不管是否有转码链接，直接播放原始文件。提供原画的清晰度(2K，4K)<br />
                        当原始文件里包含多个字幕、多个音轨(英语/国语),可以手动切换字幕/音轨<br /><br />

                        <q-chip dense color="deep-orange" text-color="white" size="12px">两种模式下都支持：</q-chip><br />
                        加载自己的字幕文件(把字幕文件直接拖放到播放窗口上)<br />
                        按下键盘上<q-chip dense square color="deep-orange" text-color="white" size="12px">M</q-chip>/<q-chip dense square color="deep-orange" text-color="white" size="12px">K</q-chip
                        >键 或者 <q-chip dense square color="deep-orange" text-color="white" size="12px">[</q-chip>/<q-chip dense square color="deep-orange" text-color="white" size="12px">]</q-chip
                        >键，调整播放速度，慢放/快放<br />
                        按下<q-chip dense square color="deep-orange" text-color="white" size="12px">T</q-chip>键，让窗口保持在最前面。按下<q-chip
                          dense
                          square
                          color="deep-orange"
                          text-color="white"
                          size="12px"
                          >S</q-chip
                        >键，截屏保存到桌面<br />
                        还支持：快进、A-B循环播放、全屏、对比度、亮度、饱和度。。。
                      </q-tooltip>
                    </q-btn-toggle>
                  </div>
                </div>
                <div class="col">
                  <div class="settinghead">:自动标记已看过的视频</div>
                  <div>
                    <q-toggle dense v-model="uiAutoColorVideo" checked-icon="iconfont iconcheck" color="red" label="启用自动标记已看过的视频文件名颜色" unchecked-icon="iconfont iconclose" keep-color
                      ><q-tooltip anchor="bottom left" self="top left" :delay="700" :offset="[-10, -4]">
                        <p style="font-size: 12px; padding: 0px; margin: 0">
                          <q-chip dense color="deep-orange" text-color="white" size="12px"> 推荐开启 </q-chip>
                          当你点击一个视频文件在线预览时，<br />
                          会自动把该文件标记为灰色，和未看过的视频区分开来
                        </p>
                      </q-tooltip>
                    </q-toggle>
                  </div>
                </div>
                <div class="col">
                  <div class="settinghead">:自动统计文件夹体积</div>
                  <div>
                    <q-toggle dense v-model="uiFolderSize" checked-icon="iconfont iconcheck" color="red" label="启用自动统计文件夹的体积" unchecked-icon="iconfont iconclose" keep-color
                      ><q-tooltip anchor="bottom left" self="top left" :delay="700" :offset="[-10, -4]">
                        <p style="font-size: 12px; padding: 0px; margin: 0">
                          <q-chip dense color="deep-orange" text-color="white" size="12px"> 推荐开启 </q-chip>
                          开启后才可以显示文件夹的体积，并且文件夹也可以按照体积排序了
                        </p>
                      </q-tooltip>
                    </q-toggle>
                  </div>
                </div>
                <div class="col">
                  <div class="settinghead">:文件夹排序方式</div>
                  <div>
                    <q-btn-toggle
                      dense
                      v-model="uiFolderOrder"
                      toggle-color="primary"
                      :options="[
                        { label: '文件夹一直置顶', value: false },
                        { label: '和文件一起排序', value: true },
                      ]"
                    >
                      <q-tooltip>默认是 把文件夹置顶，可以设置为 和文件一起排序不置顶</q-tooltip>
                    </q-btn-toggle>
                  </div>
                </div>
                <div class="col">
                  <div class="settinghead">:文件排序方式</div>
                  <div>
                    <q-select
                      outlined
                      dense
                      v-model="uiFileOrderDuli"
                      :options="uiFileOrderDuliOptions"
                      :options-dense="true"
                      :map-options="true"
                      emit-value
                      dropdown-icon="iconfont icondown"
                      style="width: 260px"
                    >
                      <q-tooltip>开启后每个文件夹内的文件都是独立排序的，例如A文件夹按时间降序，B文件夹按大小降序</q-tooltip>
                    </q-select>
                  </div>
                </div>
                <div class="col">
                  <div class="settinghead">:新建日期文件夹格式</div>
                  <div style="max-width: 460px">
                    <q-input dense outlined v-model="uiTimeFolderFormate" spellcheck="false" placeholder="需要手动填写" style="width: 250px">
                      <q-tooltip anchor="bottom left" self="top left" :delay="700" :offset="[-10, -4]">
                        <p style="font-size: 12px; padding: 0px; margin: 0">
                          这里是编写规则，创建时会自动替换成当前时间对应的数据<br />
                          年=<q-chip dense color="deep-orange" text-color="white" size="12px">yyyy</q-chip>, 月=<q-chip dense color="deep-orange" text-color="white" size="12px">MM</q-chip>, 日=<q-chip
                            dense
                            color="deep-orange"
                            text-color="white"
                            size="12px"
                            >dd</q-chip
                          >, 时=<q-chip dense color="deep-orange" text-color="white" size="12px">HH</q-chip>, 分=<q-chip dense color="deep-orange" text-color="white" size="12px">mm</q-chip>,
                          秒=<q-chip dense color="deep-orange" text-color="white" size="12px">ss</q-chip><br />
                          默认:<q-chip dense color="deep-orange" text-color="white" size="12px">yyyy-MM-dd HH:mm:ss</q-chip> -->
                          <q-chip dense color="deep-orange" text-color="white" size="12px">2021-08-08 12:30:00</q-chip><br />
                          例如:<q-chip dense color="deep-orange" text-color="white" size="12px">创建于yyyy年MM月dd的HH点</q-chip> -->
                          <q-chip dense color="deep-orange" text-color="white" size="12px">创建于2021年08月08的12点</q-chip><br />
                          例如:<q-chip dense color="deep-orange" text-color="white" size="12px">yyyy年MM月相册</q-chip> -->
                          <q-chip dense color="deep-orange" text-color="white" size="12px">2021年08月相册</q-chip><br />
                        </p>
                      </q-tooltip>
                    </q-input>
                  </div>
                </div>
                <div class="col">
                  <div class="settinghead">:视频雪碧图数量</div>
                  <div>
                    <q-btn-toggle
                      dense
                      v-model="uiXBTNumber"
                      toggle-color="primary"
                      :options="[
                        { label: '16张', value: 16 },
                        { label: '32张', value: 32 },
                        { label: '48张', value: 48 },
                        { label: '64张', value: 64 },
                        { label: '80张', value: 80 },
                      ]"
                    >
                      <q-tooltip>默认32张，会按照视频播放总时长/32的平均间隔去截图，最终显示32张截图</q-tooltip>
                    </q-btn-toggle>
                  </div>
                </div>
              </q-tab-panel>
              <q-tab-panel name="aria" class="column" style="min-height: 240px">
                <div class="col" style="margin-bottom: 20px">
                  <q-banner dense inline-actions class="text-white bg-yellow-9">
                    提示：支持连接到远程的Aria2下载，把文件直接下载到NAS/VPS/群晖/Dockor里<br />
                    有正在下载的任务时，请不要切换本地/远程模式<br />
                    不支持 同时 管理本地和远程的下载任务，也就是不支持 本地和远程同时下载
                  </q-banner>
                </div>
                <div class="col">
                  <div class="settinghead first">:Aria远程文件下载保存位置</div>
                  <div style="max-width: 460px">
                    <q-input :disable="ariaRemote" dense outlined v-model="ariaSavePath" spellcheck="false" placeholder="需要手动填写" style="width: 260px">
                      <q-tooltip anchor="bottom left" self="top left" :delay="700" :offset="[-10, -4]">
                        <p style="font-size: 12px; padding: 0px; margin: 0">
                          注意这里是运行着Aria的电脑上的，文件保存的路径，需要手动填写<br />
                          例如：<q-chip dense color="deep-orange" text-color="white" size="12px">/home/user/Desktop</q-chip>就是把文件下载到运行Aria的电脑上的桌面
                        </p>
                      </q-tooltip></q-input
                    >
                  </div>
                </div>
                <div class="col">
                  <div class="settinghead">:Aria远程RPC IP:Port</div>
                  <div style="max-width: 460px">
                    <q-input :disable="ariaRemote" dense outlined v-model="ariaUrl" spellcheck="false" placeholder="需要手动填写" style="width: 260px">
                      <q-tooltip anchor="bottom left" self="top left" :delay="700" :offset="[-10, -4]">
                        <p style="font-size: 12px; padding: 0px; margin: 0">
                          需要手动填写，只要IP和端口号，IP:Port<br />例如：<q-chip dense color="deep-orange" text-color="white" size="12px">43.211.17.85:6800</q-chip>
                        </p>
                      </q-tooltip>
                    </q-input>
                  </div>
                </div>
                <div class="col">
                  <div class="settinghead">:Aria连接密码 secret</div>
                  <div style="max-width: 460px">
                    <q-input :disable="ariaRemote" dense outlined v-model="ariaPwd" spellcheck="false" placeholder="需要手动填写" style="width: 260px">
                      <q-tooltip anchor="bottom left" self="top left" :delay="700" :offset="[-10, -4]">
                        <p style="font-size: 12px; padding: 0px; margin: 0">需要手动填写,例如：<q-chip dense color="deep-orange" text-color="white" size="12px">S4znWTaZYQ!i3cp^RN_b</q-chip></p>
                      </q-tooltip>
                    </q-input>
                  </div>
                </div>
                <div class="col">
                  <div class="settinghead"></div>
                  <q-btn v-if="ariaRemote == false" dense :loading="ariaLoading" color="primary" @click="AriaOnline" style="width: 260px">
                    当前是本地Aria2模式，点击切换
                    <template v-slot:loading>
                      <q-spinner-hourglass class="on-left" />
                      Loading...
                    </template>
                  </q-btn>
                  <q-btn v-else dense :loading="ariaLoading" color="secondary" @click="AriaOff(true)" style="width: 260px">
                    当前是远程Aria2模式，点击切换
                    <template v-slot:loading>
                      <q-spinner-hourglass class="on-left" />
                      Loading...
                    </template>
                  </q-btn>

                  <div v-if="ariaRemote" class="text-body2" style="opacity: 0.75; margin-top: 8px">
                    远程模式，新创建的下载任务都会下载到Aria服务器上<br />文件不会下载到本地，并且只能管理远程的下载任务
                  </div>
                  <div v-else class="text-body2" style="opacity: 0.75; margin-top: 8px">本地模式，新创建的下载任务都会下载到本地，并且只能管理本地的下载任务</div>
                </div>
              </q-tab-panel>
              <q-tab-panel name="about" class="column items-center non-selectable" style="min-height: 240px">
                <div class="col text-h5" style="opacity: 0.4; min-height: 100px">阿里云盘小白羊版{{ appVersion }}</div>
                <div class="col">
                  <q-btn disable dense :loading="verLoading" color="primary" @click="VerCheck" style="width: 120px">
                    检查更新
                    <template v-slot:loading>
                      <q-spinner-hourglass class="on-left" />
                      Loading...
                    </template>
                  </q-btn>
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { StoreConfig, StoreRoot, StoreSetting } from '../store';
import { defineComponent, ref, computed } from 'vue';
import { AriaChange, AriaGlobalSpeed, AriaTest } from 'src/store/aria2c';
import { NotifyError, NotifySuccess, NotifyWarning } from 'src/aliapi/notify';
export default defineComponent({
  name: 'Setting',
  setup() {
    const tab = ref('down');
    const tableft = computed(() => (window.screen.width > 800 ? 68 : 48));

    const showSetting = computed({
      get: () => StoreSetting.showSetting,
      set: (val) => {
        StoreSetting.mShowSetting(val, false);
        AriaGlobalSpeed();
      },
    });

    const showSavePath = computed(() => StoreSetting.showSavePath);
    const appVersion = computed(() => StoreConfig.appVersion);

    const downSavePath = computed({
      get: () => StoreSetting.downSavePath,
      set: (val) => StoreSetting.mSaveDownSavePath(val),
    });
    const downSavePathEveryTime = computed({
      get: () => StoreSetting.downSavePathEveryTime,
      set: (val) => StoreSetting.mSaveDownSavePathEveryTime(val),
    });
    const downFinishCheck = computed({
      get: () => StoreSetting.downFinishCheck,
      set: (val) => StoreSetting.mSaveDownFinishCheck(val),
    });
    const downFinishCommand = computed({
      get: () => StoreSetting.downFinishCommand,
      set: (val) => StoreSetting.mSaveDownFinishCommand(val),
    });

    const downGlobalSpeed = computed({
      get: () => StoreSetting.downGlobalSpeed,
      set: (val) => StoreSetting.mSaveDownGlobalSpeed(val),
    });
    const downFileMax = computed({
      get: () => StoreSetting.downFileMax,
      set: (val) => StoreSetting.mSaveDownFileMax(val),
    });
    const downThreadMax = computed({
      get: () => StoreSetting.downThreadMax,
      set: (val) => StoreSetting.mSaveDownThreadMax(val),
    });
    const uiTheme = computed({
      get: () => StoreSetting.uiTheme,
      set: (val) => {
        localStorage.setItem('uiTheme', val);
        StoreSetting.mSaveUiTheme(val);
      },
    });
    const uiImageMode = computed({
      get: () => StoreSetting.uiImageMode,
      set: (val) => StoreSetting.mSaveUiImageMode(val),
    });
    const uiVideoMode = computed({
      get: () => StoreSetting.uiVideoMode,
      set: (val) => StoreSetting.mSaveUiVideoMode(val),
    });
    const uiAutoColorVideo = computed({
      get: () => StoreSetting.uiAutoColorVideo,
      set: (val) => StoreSetting.mSaveUiAutoColorVideo(val),
    });
    const uiFolderSize = computed({
      get: () => StoreSetting.uiFolderSize,
      set: (val) => StoreSetting.mSaveUiFolderSize(val),
    });
    const uiXBTNumber = computed({
      get: () => StoreSetting.uiXBTNumber,
      set: (val) => StoreSetting.mSaveUiXBTNumber(val),
    });
    const uiTimeFolderFormate = computed({
      get: () => StoreSetting.uiTimeFolderFormate,
      set: (val) => StoreSetting.mSaveUiTimeFolderFormate(val),
    });
    const uiFolderOrder = computed({
      get: () => StoreSetting.uiFolderOrder,
      set: (val) => {
        StoreSetting.mSaveUiFolderOrder(val);
        StoreRoot.mChangSelectedDirFileList({ dir_id: 'order', items: [] });
      },
    });
    const uiFileOrderDuli = computed({
      get: () => StoreSetting.uiFileOrderDuli,
      set: (val) => {
        StoreSetting.mSaveUiFileOrderDuli(val);
        StoreRoot.mChangSelectedDirFileList({ dir_id: 'order', items: [] });
      },
    });
    const uiFileOrderDuliOptions = [
      { label: '不开启独立排序', value: '' },
      { label: '默认文件名 升序', value: 'name asc' },
      { label: '默认文件名 降序', value: 'name desc' },
      { label: '默认修改时间 升序', value: 'time asc' },
      { label: '默认修改时间 降序', value: 'time desc' },
      { label: '默认文件大小 升序', value: 'size asc' },
      { label: '默认文件大小 降序', value: 'size desc' },
    ];
    //PotPlayerSetup-210127
    const ariaRemote = computed({
      get: () => StoreSetting.ariaRemote,
      set: (val) => StoreSetting.mSaveAriaRemote(val),
    });
    const ariaUrl = computed({
      get: () => StoreSetting.ariaUrl,
      set: (val) => {
        if (val.indexOf('：') > 0) val = val.replace('：', ':');
        StoreSetting.mSaveAriaUrl(val);
      },
    });
    const ariaPwd = computed({
      get: () => StoreSetting.ariaPwd,
      set: (val) => StoreSetting.mSaveAriaPwd(val),
    });
    const ariaSavePath = computed({
      get: () => StoreSetting.ariaSavePath,
      set: (val) => StoreSetting.mSaveAriaSavePath(val),
    });

    function HideSetting() {
      StoreSetting.mShowSetting(false, false);
    }

    function SelectDir() {
      if (window.WebShowOpenDialogSync) {
        window.WebShowOpenDialogSync(
          {
            title: '选择一个文件夹，把所有文件下载到此文件夹内',
            buttonLabel: '选择',
            properties: ['openDirectory'],
            defaultPath: downSavePath.value,
          },
          (result: string[] | undefined) => {
            if (result && result[0]) {
              StoreSetting.mSaveDownSavePath(result[0]);
            }
          }
        );
      }
    }

    const downFileMaxOptions = [
      { label: '同时运行1个文件', value: 1 },
      { label: '同时运行3个文件', value: 3 },
      { label: '同时运行5个文件', value: 5 },
      { label: '同时运行10个文件', value: 10 },
      { label: '同时运行20个文件', value: 20 },
      { label: '同时运行30个文件', value: 30 },
    ];
    const downThreadMaxOptions = [
      { label: '每个文件启动1个线程', value: 1 },
      { label: '每个文件启动2个线程', value: 2 },
      { label: '每个文件启动4个线程', value: 4 },
      { label: '每个文件启动8个线程', value: 8 },
      { label: '每个文件启动16个线程', value: 16 },
    ];

    //about

    const verLoading = ref(false);

    function VerCheck() {
      verLoading.value = true;
      setTimeout(() => {
        verLoading.value = false;
      }, 3000);
    }
    const ariaLoading = ref(false);
    const ariaRemoteLabel = computed(() => (ariaRemote.value ? '已开启' : '已关闭'));

    function AriaOnline() {
      if (ariaSavePath.value.indexOf('/') < 0 && ariaSavePath.value.indexOf('\\') < 0) {
        NotifyError('还没有设置远程Aria 下载的保存路径');
        return;
      }
      if (ariaUrl.value == '' || ariaUrl.value.indexOf(':') <= 0 || ariaUrl.value.indexOf('.') <= 0) {
        NotifyError('还没有设置远程Aria IP和端口号');
        return;
      }
      if (ariaPwd.value == '') {
        NotifyError('还没有设置远程Aria 连接密码');
        return;
      }
      ariaLoading.value = true;
      try {
        const host = ariaUrl.value.split(':')[0];
        const port = parseInt(ariaUrl.value.split(':')[1]);
        const secret = ariaPwd.value;

        AriaTest(host, port, secret).then((issuccess) => {
          if (issuccess == true) {
            AriaChange(host, port, secret).then((data) => {
              ariaLoading.value = false;
              if (data == true) {
                ariaRemote.value = true;
                NotifySuccess('连接到远程Aria服务器：成功！');
              } else {
                ariaRemote.value = false;
                NotifyError('连接到远程Aria服务器：失败！');
                AriaOff(false);
              }
            });
          } else {
            ariaLoading.value = false;
          }
        });
      } catch (e) {
        ariaLoading.value = false;
        ariaRemote.value = false;
        NotifyError('数据格式错误！' + e.message);
      }
    }
    function AriaOff(tip: boolean) {
      ariaLoading.value = true;
      AriaChange('', 0, '')
        .then((data) => {
          ariaLoading.value = false;
          if (data == true) {
            ariaRemote.value = false;
            if (tip) {
              NotifyWarning('已经从远程断开，并连接到本地Aria');
            }
          }
        })
        .catch(() => {
          ariaLoading.value = false;
          ariaRemote.value = false;
        });
    }

    return {
      tab,
      tableft,
      showSetting,
      showSavePath,
      downSavePath,
      downSavePathEveryTime,
      downGlobalSpeed,
      downFileMax,
      downFileMaxOptions,
      downThreadMax,
      downThreadMaxOptions,
      downFinishCheck,
      downFinishCommand,
      uiTheme,
      uiImageMode,
      uiVideoMode,
      uiAutoColorVideo,
      uiXBTNumber,
      uiTimeFolderFormate,
      uiFolderOrder,
      uiFolderSize,
      uiFileOrderDuli,
      uiFileOrderDuliOptions,
      ariaRemote,
      ariaUrl,
      ariaPwd,
      ariaSavePath,
      appVersion,
      HideSetting,
      SelectDir,
      verLoading,
      VerCheck,
      ariaLoading,
      AriaOnline,
      AriaOff,
      ariaRemoteLabel,
    };
  },
});
</script>
<style>
body.desktop .q-toggle:not(.disabled):focus .q-toggle__thumb:before,
body.desktop .q-toggle:not(.disabled):hover .q-toggle__thumb:before {
  transform: scale3d(1.7, 1.7, 1) !important;
}

.q-field--auto-height.q-field--dense .q-field__control,
.q-field--auto-height.q-field--dense .q-field__native {
  min-height: 36px;
  height: 36px;
}
.q-field--dense .q-field__control,
.q-field--dense .q-field__marginal {
  height: 36px;
}
.q-field__native,
.q-field__prefix,
.q-field__suffix,
.q-field__input {
  padding: 4px 0;
}

.settinghead {
  font-size: 15px;
  line-height: 20px;
  padding: 32px 0 4px 0;
  margin-bottom: 4px;
  display: inline-block;
  user-select: none;
}
.settinghead.first {
  padding: 0px 0 4px 0;
}
.settinghead::after {
  content: '';
  display: block;
  background: #1976d2aa;
  width: 100%;
  height: 2px;
  opacity: 0.75;
}
.settingborder {
  border-right: 1px solid #e0e0e0;
}
</style>
