/* eslint-disable @typescript-eslint/ban-types */
<template>
  <q-dialog ref="dialogmrn" persistent maximized no-focus no-refocus>
    <q-card class="q-dialog-plugin" style="">
      <q-toolbar class="q-electron-drag non-selectable" style="min-height: 40px; margin-top: 2px">
        <q-toolbar-title class="text-h6 text-center">批量重命名</q-toolbar-title>
        <q-btn flat round dense icon="iconfont iconclose" v-close-popup />
      </q-toolbar>
      <q-card-section style="height: calc(100% - 320px)" class="scroll dialogcardsection">
        <ZTree :nodes="nodes" :setting="setting" @onClick="onClick" @onCheck="onCheck" @onCreated="handleCreated" class="renametree" />
        <q-inner-loading :showing="fileloading">
          <q-spinner-clock size="40px" color="primary"></q-spinner-clock>
          <br />
          <q-chip square label="正在列出子文件...可能需要10秒-3分钟" />
        </q-inner-loading>
      </q-card-section>
      <q-card-actions style="padding: 8px 0; margin: 0 16px; align-items: flex-start">
        <q-card style="flex-grow: 1; width: 100%" class="renamecard">
          <q-tabs v-model="tab" dense class="text-primary" style="max-width: 640px">
            <q-tab name="th" label="替换" style="min-height: 32px" />
            <q-tab name="sc" label="删除" style="min-height: 32px" />
            <q-tab name="zj" label="增加" style="min-height: 32px" />
            <q-tab name="xh" label="序号" style="min-height: 32px" />
            <q-tab name="sj" label="随机" style="min-height: 32px" />
            <q-tab name="dxx" label="其他" style="min-height: 32px" />
            <q-tab name="kzm" label="扩展名" style="min-height: 32px" />
          </q-tabs>
          <q-separator />
          <q-tab-panels v-model="tab" animated class="renameaction">
            <q-tab-panel name="th">
              <q-toolbar>
                <q-radio dense size="sm" keep-color v-model="renameOption.renameType" val="th1" label="字符" color="primary" />
                <div>把</div>
                <q-select
                  dense
                  options-dense
                  :disable="renameOption.renameType != 'th1'"
                  filled
                  v-model="renameOption.th1All"
                  :options="['第一个', '全部的', '最后的']"
                  dropdown-icon="iconfont icondown"
                />
                <q-input :disable="renameOption.renameType != 'th1'" dense filled style="width: 170px" v-model="renameOption.th1Old" />
                <div>替换成</div>
                <q-input :disable="renameOption.renameType != 'th1'" dense filled style="width: 170px" v-model="renameOption.th1New" />
              </q-toolbar>
              <q-toolbar>
                <q-radio dense size="sm" keep-color v-model="renameOption.renameType" val="th2" label="正则" color="primary" />
                <div>把</div>
                <q-input :disable="renameOption.renameType != 'th2'" dense filled style="width: 182px" v-model="renameOption.th2Old">
                  <q-tooltip>例如 [0-9] 不要写成 /[0-9]/ig 的格式</q-tooltip>
                </q-input>
                <q-select
                  dense
                  options-dense
                  :disable="renameOption.renameType != 'th2'"
                  filled
                  v-model="renameOption.th2OldIG"
                  :options="['空', 'i', 'g', 'ig', 'y', 's', 'u']"
                  dropdown-icon="iconfont icondown"
                  style="width: 70px"
                />

                <div>替换成</div>
                <q-input :disable="renameOption.renameType != 'th2'" dense filled style="width: 180px" v-model="renameOption.th2New" />
              </q-toolbar>
              <q-toolbar> <div>注：仅支持 js 正则表达式替换，复杂的需求可以通过正则表达式实现</div></q-toolbar>
            </q-tab-panel>

            <q-tab-panel name="sc">
              <q-toolbar>
                <q-radio dense size="sm" keep-color v-model="renameOption.renameType" val="sc1" label="删除文件名中" color="primary" />
                <div></div>
                <q-select
                  dense
                  options-dense
                  :disable="renameOption.renameType != 'sc1'"
                  filled
                  v-model="renameOption.sc1All"
                  :options="['第一个', '全部的', '最后的']"
                  dropdown-icon="iconfont icondown"
                />
                <q-input :disable="renameOption.renameType != 'sc1'" dense filled style="width: 180px" v-model="renameOption.sc1Str" />
              </q-toolbar>
              <q-toolbar>
                <q-radio dense size="sm" keep-color v-model="renameOption.renameType" val="sc2" label="从文件名的　" color="primary" />
                <q-select
                  dense
                  options-dense
                  :disable="renameOption.renameType != 'sc2'"
                  filled
                  v-model="renameOption.sc2From"
                  :options="['前面', '尾部']"
                  style="width: 80px"
                  dropdown-icon="iconfont icondown"
                />
                <div>删除</div>
                <q-input :disable="renameOption.renameType != 'sc2'" dense filled style="width: 80px" type="number" v-model.number="renameOption.sc2Count" />
                <div>个字符</div>
              </q-toolbar>
              <q-toolbar>
                <q-radio dense size="sm" keep-color v-model="renameOption.renameType" val="sc3" label="从文件名的第" color="primary" />

                <q-input :disable="renameOption.renameType != 'sc3'" dense filled style="width: 80px" type="number" v-model.number="renameOption.sc3Start" />
                <div>个字符开始，删除</div>
                <q-input :disable="renameOption.renameType != 'sc3'" dense filled style="width: 80px" type="number" v-model.number="renameOption.sc3Count" />
                <div>个字符</div>
              </q-toolbar>
            </q-tab-panel>

            <q-tab-panel name="zj">
              <q-toolbar>
                <q-radio dense size="sm" keep-color v-model="renameOption.renameType" val="zj1" label="在文件名" color="primary" />
                <q-select
                  dense
                  options-dense
                  :disable="renameOption.renameType != 'zj1'"
                  filled
                  v-model="renameOption.zj1From"
                  :options="['前面', '尾部']"
                  style="width: 80px"
                  dropdown-icon="iconfont icondown"
                />
                <div>增加</div>
                <q-input :disable="renameOption.renameType != 'zj1'" dense filled style="width: 220px" v-model="renameOption.zj1Str" />
              </q-toolbar>
              <q-toolbar>
                <q-radio dense size="sm" keep-color v-model="renameOption.renameType" val="zj2" label="在文件名" color="primary" />
                <q-select
                  dense
                  options-dense
                  :disable="renameOption.renameType != 'zj2'"
                  filled
                  v-model="renameOption.zj2From"
                  :options="['前面', '尾部']"
                  style="width: 80px"
                  dropdown-icon="iconfont icondown"
                />
                <div>的第</div>
                <q-input :disable="renameOption.renameType != 'zj2'" dense filled style="width: 80px" type="number" v-model.number="renameOption.zj2Start" />
                <div>个字符后增加</div>
                <q-input :disable="renameOption.renameType != 'zj2'" dense filled style="width: 180px" v-model="renameOption.zj2Str" />
              </q-toolbar>
              <q-toolbar>
                <q-radio dense size="sm" keep-color v-model="renameOption.renameType" val="zj3" label="在文件名" color="primary" />
                <q-select
                  dense
                  options-dense
                  :disable="renameOption.renameType != 'zj3'"
                  filled
                  v-model="renameOption.zj3From"
                  :options="['前面', '尾部']"
                  style="width: 80px"
                  dropdown-icon="iconfont icondown"
                />
                <div>的第1个</div>
                <q-input :disable="renameOption.renameType != 'zj3'" dense filled style="width: 100px" v-model="renameOption.zj3Find">
                  <q-tooltip>填要查找的字符串，例如 _ </q-tooltip>
                </q-input>
                <div>后增加</div>
                <q-input :disable="renameOption.renameType != 'zj3'" dense filled style="width: 180px" v-model="renameOption.zj3Str" />
              </q-toolbar>
            </q-tab-panel>
            <q-tab-panel name="xh">
              <q-toolbar>
                <q-radio dense size="sm" keep-color v-model="renameOption.renameType" val="xh1" label="在文件名" color="primary" />
                <q-select
                  dense
                  options-dense
                  :disable="renameOption.renameType != 'xh1'"
                  filled
                  v-model="renameOption.xh1From"
                  :options="['前面', '尾部', '替换']"
                  style="width: 80px"
                  dropdown-icon="iconfont icondown"
                />
                <div>增加</div>
                <q-input :disable="renameOption.renameType != 'xh1'" dense filled style="width: 220px" v-model="renameOption.xh1Str">
                  <q-tooltip
                    >格式里的 # 代表序号<br />
                    假如序号长度=4 <br />“<span class="str">#.</span>” 得到 “<span class="str">0001.</span>” 　　 “<span class="str">第#集</span>” 得到 “<span class="str">第0001集</span>”
                  </q-tooltip>
                </q-input>
                <div>格式的序号</div>
              </q-toolbar>
              <q-toolbar>
                <div style="margin-left: 24px; margin-right: 6px">序号起始</div>
                <q-input :disable="renameOption.renameType != 'xh1'" dense filled style="width: 80px" type="number" v-model.number="renameOption.xh1Start">
                  <q-tooltip>序号从哪个数字开始</q-tooltip>
                </q-input>
                <div>每次增加</div>
                <q-input :disable="renameOption.renameType != 'xh1'" dense filled style="width: 80px" type="number" v-model.number="renameOption.xh1Add">
                  <q-tooltip>每执行一个文件后序号自动增加多少。</q-tooltip>
                </q-input>
                <div>序号长度</div>
                <q-input :disable="renameOption.renameType != 'xh1'" dense filled style="width: 80px" type="number" v-model.number="renameOption.xh1Len">
                  <q-tooltip>序号显示的长度，长度不足时在前面补0。例如1-->0001</q-tooltip>
                </q-input>
              </q-toolbar>
              <q-toolbar>
                <div style="margin-left: 24px">
                  假如序号长度=4 　“<span class="str">#.</span>” --> “<span class="str">0001.</span>” 　　“<span class="str">第#集</span>” --> “<span class="str">第0001集</span>”<br />
                  假如序号长度=1 　“<span class="str">(#)</span>” --> “<span class="str">(1)</span>” 　　　“<span class="str">_#</span>” --> “<span class="str">_1</span>”
                </div>
              </q-toolbar>
            </q-tab-panel>
            <q-tab-panel name="sj">
              <q-toolbar>
                <q-radio dense size="sm" keep-color v-model="renameOption.renameType" val="sj1" label="在文件名" color="primary" />
                <q-select
                  dense
                  options-dense
                  :disable="renameOption.renameType != 'sj1'"
                  filled
                  v-model="renameOption.sj1From"
                  :options="['前面', '尾部', '替换']"
                  style="width: 80px"
                  dropdown-icon="iconfont icondown"
                />
                <div>增加</div>
                <q-input :disable="renameOption.renameType != 'sj1'" dense filled style="width: 220px" v-model="renameOption.sj1Str">
                  <q-tooltip
                    >格式里的 # 代表随机字符串<br />
                    假如随机长度=4 <br />“<span class="str">#</span>” 得到 “<span class="str">abcd</span>” 　　 “<span class="str">第#集</span>” 得到 “<span class="str">第abcd集</span>”
                  </q-tooltip>
                </q-input>
                <div>随机字符串</div>
              </q-toolbar>
              <q-toolbar>
                <div style="margin-left: 24px; margin-right: 6px">随机长度(最短)</div>
                <q-input :disable="renameOption.renameType != 'sj1'" dense filled style="width: 80px" type="number" v-model.number="renameOption.sj1Min">
                  <q-tooltip>生成的随机字符串最短有几个字符</q-tooltip>
                </q-input>
                <div>随机长度(最长)</div>
                <q-input :disable="renameOption.renameType != 'sj1'" dense filled style="width: 80px" type="number" v-model.number="renameOption.sj1Max">
                  <q-tooltip>最长有几个字符(可以和最短一样，生成固定位数的随机字符串)</q-tooltip>
                </q-input>
                <div>随机字符</div>
                <q-select
                  dense
                  options-dense
                  :disable="renameOption.renameType != 'sj1'"
                  filled
                  v-model="renameOption.sj1Type"
                  :options="['只有数字', '只有大写字母', '只有小写字母', '数字大写字母', '数字小写字母', '数字大小写字母']"
                  style="width: 180px"
                  dropdown-icon="iconfont icondown"
                />
              </q-toolbar>
              <q-toolbar>
                <div style="margin-left: 24px">
                  假如随机长度(最短)=4 　“<span class="str">#</span>” --> “<span class="str">abcd</span>” 　　“<span class="str">第#集</span>” --> “<span class="str">第abcd集</span>”<br />
                  假如随机长度(最短)=1 　“<span class="str">(#)</span>” --> “<span class="str">(a)</span>” 　　　“<span class="str">_#</span>” --> “<span class="str">_a</span>”
                </div>
              </q-toolbar>
            </q-tab-panel>

            <q-tab-panel name="dxx">
              <q-toolbar>
                <q-radio dense size="sm" keep-color v-model="renameOption.renameType" val="dxx1" label="文件名全部转为" color="primary" />
                <q-select
                  dense
                  options-dense
                  :disable="renameOption.renameType != 'dxx1'"
                  filled
                  v-model="renameOption.dxx1Type"
                  :options="['全部大写', '全部小写']"
                  dropdown-icon="iconfont icondown"
                />
              </q-toolbar>
              <q-toolbar>
                <q-radio dense size="sm" keep-color v-model="renameOption.renameType" val="dxx2" label="文件名以" color="primary" />
                <q-input :disable="renameOption.renameType != 'dxx2'" dense filled style="width: 100px" v-model="renameOption.dxx2Find" />
                <div>为分割符，按</div>
                <q-input :disable="renameOption.renameType != 'dxx2'" dense filled style="width: 190px" v-model="renameOption.dxx2Str" />
                <div>重新排序</div>
              </q-toolbar>
              <q-toolbar>
                <div style="margin-left: 24px">
                  例如“<span class="str">七里香-周杰伦.lrc</span>” 以 “<span class="str">-</span>” 分割，得到[“<span class="str">七里香</span>”,“<span class="str">周杰伦</span>”]，不包括扩展名<br />
                  按“<span class="str">是{1}唱的{0}这首歌</span>” 重新排序得到 “<span class="str">是周杰伦唱的七里香这首歌.lrc</span>”
                </div>
              </q-toolbar>
            </q-tab-panel>
            <q-tab-panel name="kzm">
              <q-toolbar>
                <q-radio dense size="sm" keep-color v-model="renameOption.renameType" val="kzm3" label="在扩展名" color="primary" />
                <q-select
                  dense
                  options-dense
                  :disable="renameOption.renameType != 'kzm3'"
                  filled
                  v-model="renameOption.kzm3From"
                  :options="['前面', '尾部', '替换']"
                  style="width: 80px"
                  dropdown-icon="iconfont icondown"
                />
                <div>增加</div>
                <q-input :disable="renameOption.renameType != 'kzm3'" dense filled style="width: 230px" v-model="renameOption.kzm3Str"> </q-input>
              </q-toolbar>
              <q-toolbar>
                <q-radio dense size="sm" keep-color v-model="renameOption.renameType" val="kzm1" label="扩展名全部转为" color="primary" />
                <q-select
                  dense
                  options-dense
                  :disable="renameOption.renameType != 'kzm1'"
                  filled
                  v-model="renameOption.kzm1Type"
                  :options="['全部大写', '全部小写']"
                  dropdown-icon="iconfont icondown"
                />
              </q-toolbar>

              <q-toolbar>
                <q-radio dense size="sm" keep-color v-model="renameOption.renameType" val="kzm2" label="扩展名" color="primary" />
                <div>从</div>
                <q-input :disable="renameOption.renameType != 'kzm2'" dense filled style="width: 148px" v-model="renameOption.kzm2Old" />
                <div>替换成</div>
                <q-input :disable="renameOption.renameType != 'kzm2'" dense filled style="width: 148px" v-model="renameOption.kzm2New" />
              </q-toolbar>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
        <div style="width: 100%; padding-top: 16px; display: flex; flex-direction: row">
          <q-btn dense flat color="primary" label="刷新文件列表" style="padding: 0 12px; margin-right: 6px" @click="menuRefreshDir()"> </q-btn>

          <q-select
            dense
            options-dense
            filled
            color="primary"
            label-color="text-primary"
            v-model="renameOption.renameFile"
            :options="['勾选的文件', '勾选的文件夹', '勾选的文件和文件夹']"
            dropdown-icon="iconfont icondown"
          >
            <template v-slot:before><div style="font-size: 14px">重命名：</div> </template>
          </q-select>
          <div style="flex-grow: 1"></div>
          <div class="actioninfo">修改 {{ renameCount }} / {{ totalCount }} 个</div>
          <q-btn dense color="primary" :disable="!btncan" label="执行重命名" style="padding: 0 12px" @click="onSaveRename"> </q-btn>
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, onUnmounted, reactive, watch } from 'vue';
import { StoreRoot, StoreUser, SQL } from 'src/store';
import { IStatePanFile, IZtreeNode } from 'src/store/models';
import { format, debounce } from 'quasar';
import ZTree from 'sag-ztree-vue';
import { NotifyError, NotifySuccess } from 'src/aliapi/notify';
import AliFile from 'src/aliapi/file';

export default defineComponent({
  name: 'MutilRename',
  components: {
    ZTree,
  },
  methods: {
    show() {
      (this.$refs.dialogmrn as any).show();
    },

    hide() {
      (this.$refs.dialogmrn as any).hide();
    },
  },

  props: {},
  setup() {
    const tab = ref('th');
    const btncan = ref(false);
    const renameCount = ref(0);
    const totalCount = ref(0);
    const renameOption = reactive({
      renameFile: '勾选的文件',
      renameType: 'th1',
      th1All: '第一个',
      th1Old: '',
      th1New: '',
      th2Old: '',
      th2OldIG: 'ig',
      th2New: '',
      sc1All: '第一个',
      sc1Str: '',
      sc2From: '前面',
      sc2Count: 0,
      sc3Start: 0,
      sc3Count: 0,
      zj1From: '前面',
      zj1Str: '',
      zj2From: '前面',
      zj2Start: 0,
      zj2Str: '',
      zj3From: '前面',
      zj3Find: '',
      zj3Str: '',
      xh1From: '前面',
      xh1Str: '#',
      xh1Start: 0,
      xh1Add: 1,
      xh1Len: 1,
      dxx1Type: '全部大写',
      dxx2Find: '',
      dxx2Str: '',
      kzm1Type: '全部大写',
      kzm2Old: '',
      kzm2New: '',
      kzm3From: '前面',
      kzm3Str: '',
      sj1From: '前面',
      sj1Str: '#',
      sj1Min: 1,
      sj1Max: 1,
      sj1Type: '只有数字',
    });

    const treelist: IZtreeNode[] = [];

    let parentid = StoreRoot.showDir.file_id;
    if (parentid == '') parentid = 'root';
    const fs = StoreRoot.gSelectedFiles;
    if (fs.length > 0) {
      for (let i = 0; i < fs.length; i++) {
        if (fs[i].isDir) {
          treelist.push({
            key: fs[i].file_id,
            name: fs[i].name,
            filename: fs[i].name,
            filesha1: '',
            iconSkin: 'q-spinner q-spinner-mat iconfont iconsync f',
            open: true,
            checked: true,
            isParent: true,
            size: 0,
            children: [],
          });
        } else {
          treelist.push({
            key: fs[i].file_id,
            name: fs[i].name,
            filename: fs[i].name,
            filesha1: '',
            iconSkin: 'iconfont ' + fs[i].icon + ' f',
            open: false,
            checked: true,
            isParent: false,
            size: fs[i].size,
          });
        }
      }
    }


    const saveInfo = ref('');
    const fileloading = ref(true);
    const saveloading = ref(false);
    const dialogmrn = ref();

    const setting = ref({ check: { enable: true }, data: { simpleData: { enable: false } }, view: { nameIsHTML: true, showIcon: true, selectedMulti: false, dblClickExpand: false } });
    Object.freeze(treelist);
    const nodes = ref<IZtreeNode[]>(treelist);
    onMounted(() => {
      //
    });

    function expandAll(treedata: IZtreeNode[] | undefined, all: boolean) {
      if (treedata == undefined || treedata.length == 0) return;
      for (let i = 0; i < treedata.length; i++) {
        if (treedata[i].isParent) {
          treedata[i].open = true;
          if (all) expandAll(treedata[i].children, all);
        }
      }
    }
    function closeAll(treedata: IZtreeNode[] | undefined) {
      if (treedata == undefined || treedata.length == 0) return;
      for (let i = 0; i < treedata.length; i++) {
        const treeitem = treedata[i];
        if (treeitem.isParent && treeitem.open && treeitem.children) {
          let hasdir = false;
          for (let c = 0; c < treeitem.children.length; c++) {
            if (treeitem.children[c].isParent) {
              hasdir = true;
              break;
            }
          }
          if (hasdir == false) treeitem.open = false;
          else closeAll(treeitem.children);
        }
      }
    }
    function refreshDirSync(treedata: IZtreeNode[] | undefined) {
      if (treedata == undefined || treedata.length == 0) return 'iconfont iconfolder f';
      for (let i = 0; i < treedata.length; i++) {
        if (treedata[i].isParent && treedata[i].iconSkin != 'iconfont iconfolder f') return 'q-spinner q-spinner-mat iconfont iconsync f';
      }
      return 'iconfont iconfolder f';
    }
    async function getDirSize(user_id: string, drive_id: string, sizeinfo: { size: number; dirCount: number; fileCount: number; isloading: boolean }, treedata: IZtreeNode[]) {
      for (let n = 0; n < treedata.length; n++) {
        const treeitem = treedata[n];
        if (treeitem.isParent == false) continue; 
        let items: IStatePanFile[] | undefined = undefined;

        const dir = await SQL.GetFileByDir(user_id, drive_id, treeitem.key);
        if (dir == undefined || dir.loading == 1629795158000) {
          sizeinfo.isloading = true;
          StoreRoot.aDirDetail(treeitem.key); 
        } else {
          items = dir.filelist;
          treeitem.iconSkin = 'iconfont iconfolder f';
          treeitem.children = [];
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.isDir) {
              sizeinfo.dirCount++;
              treeitem.children.push({
                key: item.file_id,
                name: item.name,
                filename: item.name,
                filesha1: '',
                iconSkin: 'q-spinner q-spinner-mat iconfont iconsync f',
                open: false,
                checked: true,
                isParent: true,
                size: 0,
                children: [],
              });
            }
          }
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.isDir == false) {
              sizeinfo.fileCount++;
              sizeinfo.size += item.size;
              treeitem.children.push({
                key: item.file_id,
                name: item.name,
                filename: item.name,
                filesha1: '',
                iconSkin: 'iconfont ' + item.icon + ' f',
                open: false,
                checked: true,
                isParent: false,
                size: item.size,
              });
            }
          }
          await getDirSize(user_id, drive_id, sizeinfo, treeitem.children);
        }
      }
    }

    const user_id = StoreRoot.user_id;
    const drive_id = StoreRoot.drive_id;
    let timer: NodeJS.Timeout | undefined = undefined;
    const func = () => {
      let sizeinfo = { size: 0, dirCount: 0, fileCount: 0, isloading: false };
      let treedata = [...treelist];
      Object.freeze(treedata);
      for (let n = 0; n < treedata.length; n++) {
        const item = treedata[n];
        if (item.isParent) {
          sizeinfo.dirCount++;
        } else {
          sizeinfo.fileCount++;
          sizeinfo.size += item.size;
        }
      }

      getDirSize(user_id, drive_id, sizeinfo, treedata).then(() => {
        Object.freeze(treedata);
        if (sizeinfo.isloading) {
          for (let n = 0; n < treedata.length; n++) {
            if (treedata[n].isParent && treedata[n].iconSkin == 'iconfont iconfolder f') {
              treedata[n].iconSkin = refreshDirSync(treedata[n].children);
            }
          }
        }
        if (sizeinfo.isloading == false && sizeinfo.fileCount <= 500) {
          expandAll(treedata, true); 
        }
        nodes.value = treedata;
        saveInfo.value = '包含 ' + sizeinfo.dirCount.toString() + '个文件夹，' + sizeinfo.fileCount.toString() + '个文件，共' + format.humanStorageSize(sizeinfo.size);
        fileloading.value = sizeinfo.isloading;

        if (sizeinfo.isloading) timer = setTimeout(func, 1000);
      });
    };
    timer = setTimeout(func, 10);
    onUnmounted(() => {
      if (timer) {
        clearTimeout(timer);
        timer = undefined;
      }
      if (ZTreeObj) ZTreeObj.destroy();
    });

    function menuRefreshDir() {
      const fulllist: string[] = [parentid];
      fulllist.push(...getAllDirid(false));
      SQL.DeleteDirLoading(user_id, drive_id, fulllist).then(() => {
        StoreRoot.aDirDetail(parentid); 
        fileloading.value = true;
        timer = setTimeout(func, 1000);
      });
    }

    function onCheck(_evt: any, _treeId: string, treeNode: IZtreeNode) {
      onReplace();
    }
    function onClick(_evt: any, _treeId: string, treeNode: any) {
      if (treeNode.isParent && ZTreeObj) ZTreeObj.expandNode(treeNode);
    }

    let ZTreeObj: any | undefined = undefined;
    function handleCreated(ztreeObj: any) {
      ZTreeObj = ztreeObj;
    }

    function getAllDirid(replacedOnly: boolean) {
      const nodes = ZTreeObj.getNodes() as IZtreeNode[];
      const dirlist: string[] = [];
      const fund = (treedata: IZtreeNode[] | undefined) => {
        if (treedata == undefined || treedata.length == 0) return;
        for (let i = 0; i < treedata.length; i++) {
          if (treedata[i].isParent) {
            if (replacedOnly == false || (replacedOnly && treedata[i].name != treedata[i].filename)) dirlist.push(treedata[i].key);
            fund(treedata[i].children);
          }
        }
      };
      fund(nodes);
      return dirlist;
    }

    function replaceOne(node: IZtreeNode, info: { total: number; replace: number; xh1Start: number; sj1Base: string; sj1Map: Map<string, number> }): number {
      let name = node.filename;
      let ext = '';
      let exti = node.isParent ? -1 : name.lastIndexOf('.');
      if (exti >= 0) {
        ext = name.substr(exti);
        name = name.substr(0, exti);
      }

      let name1 = name + '';
      let ext1 = ext + '';

      switch (renameOption.renameType) {
        case 'th1': {
          if (renameOption.th1Old != '' && renameOption.th1New != '') {
            if (renameOption.th1All == '第一个') {
              name1 = name.replace(renameOption.th1Old, renameOption.th1New);
              name = name.replace(renameOption.th1Old, '<i>' + renameOption.th1New + '</i>');
            } else if (renameOption.th1All == '最后的') {
              const li = name.lastIndexOf(renameOption.th1Old);
              if (li >= 0) {
                const s1 = name.substr(0, li);
                const s2 = name.substr(li + renameOption.th1Old.length);
                name1 = s1 + renameOption.th1New + s2;
                name = s1 + '<i>' + renameOption.th1New + '</i>' + s2;
              }
            } else {
              name1 = name.split(renameOption.th1Old).join(renameOption.th1New);
              name = name.split(renameOption.th1Old).join('<i>' + renameOption.th1New + '</i>');
            }
          }
          break;
        }
        case 'th2': {
          if (renameOption.th2Old != '' && renameOption.th2New != '') {
            name1 = name.replace(new RegExp(renameOption.th2Old, renameOption.th2OldIG == '空' ? '' : renameOption.th2OldIG), renameOption.th2New);
            name = name.replace(new RegExp(renameOption.th2Old, renameOption.th2OldIG == '空' ? '' : renameOption.th2OldIG), '<i>' + renameOption.th2New + '</i>');
          }
          break;
        }
        case 'sc1': {
          if (renameOption.sc1Str != '') {
            if (renameOption.sc1All == '第一个') {
              name1 = name.replace(renameOption.sc1Str, '');
              name = name.replace(renameOption.sc1Str, '<b>' + renameOption.sc1Str + '</b>');
            } else if (renameOption.sc1All == '最后的') {
              const li = name.lastIndexOf(renameOption.sc1Str);
              if (li >= 0) {
                const s1 = name.substr(0, li);
                const s2 = name.substr(li + renameOption.sc1Str.length);
                name1 = s1 + '' + s2;
                name = s1 + '<b>' + renameOption.sc1Str + '</b>' + s2;
              }
            } else {
              name1 = name.split(renameOption.sc1Str).join('');
              name = name.split(renameOption.sc1Str).join('<b>' + renameOption.sc1Str + '</b>');
            }
          }
          break;
        }
        case 'sc2': {
          if (renameOption.sc2Count > 0) {
            if (renameOption.sc2From == '前面') {
              name1 = '' + name.substr(renameOption.sc2Count);
              name = '<b>' + name.substr(0, renameOption.sc2Count) + '</b>' + name.substr(renameOption.sc2Count);
            } else {
              name1 = name.substr(0, name.length - renameOption.sc2Count) + '';
              name = name.substr(0, name.length - renameOption.sc2Count) + '<b>' + name.substr(name.length - renameOption.sc2Count) + '</b>';
            }
          }
          break;
        }

        case 'sc3': {
          if (renameOption.sc3Start >= 0 && renameOption.sc3Count > 0) {
            const start = name.substr(0, renameOption.sc3Start);
            name = name.substr(renameOption.sc3Start);
            name1 = start + '' + name.substr(renameOption.sc3Count);
            name = start + '<b>' + name.substr(0, renameOption.sc3Count) + '</b>' + name.substr(renameOption.sc3Count);
          }
          break;
        }
        case 'zj1': {
          if (renameOption.zj1Str != '') {
            if (renameOption.zj1From == '前面') {
              name1 = renameOption.zj1Str + name;
              name = '<i>' + renameOption.zj1Str + '</i>' + name;
            } else {
              name1 = name + renameOption.zj1Str;
              name = name + '<i>' + renameOption.zj1Str + '</i>';
            }
          }
          break;
        }

        case 'zj2': {
          if (renameOption.zj2Str != '' && renameOption.zj2Start >= 0) {
            if (renameOption.zj2From == '前面') {
              name1 = name.substr(0, renameOption.zj2Start) + renameOption.zj2Str + name.substr(renameOption.zj2Start);
              name = name.substr(0, renameOption.zj2Start) + '<i>' + renameOption.zj2Str + '</i>' + name.substr(renameOption.zj2Start);
            } else {
              const pos = name.length - renameOption.zj2Start;
              if (pos > 0) {
                name1 = name.substr(0, pos) + renameOption.zj2Str + name.substr(pos);
                name = name.substr(0, pos) + '<i>' + renameOption.zj2Str + '</i>' + name.substr(pos);
              }
            }
          }
          break;
        }
        case 'zj3': {
          if (renameOption.zj3Str != '' && renameOption.zj3Find != '') {
            if (renameOption.zj3From == '前面') {
              const pos = name.indexOf(renameOption.zj3Find);
              if (pos >= 0) {
                name1 = name.substr(0, pos + 1) + renameOption.zj3Str + name.substr(pos + 1);
                name = name.substr(0, pos + 1) + '<i>' + renameOption.zj3Str + '</i>' + name.substr(pos + 1);
              }
            } else {
              const pos = name.lastIndexOf(renameOption.zj3Find);
              if (pos > 0) {
                name1 = name.substr(0, pos + 1) + renameOption.zj3Str + name.substr(pos + 1);
                name = name.substr(0, pos + 1) + '<i>' + renameOption.zj3Str + '</i>' + name.substr(pos + 1);
              }
            }
          }
          break;
        }
        case 'xh1': {
          if (renameOption.xh1Str != '' && renameOption.xh1Add > 0 && renameOption.xh1Len > 0) {
            let id = info.xh1Start.toString();
            id = id.padStart(renameOption.xh1Len, '0');
            info.xh1Start += renameOption.xh1Add;
            let str = renameOption.xh1Str.replace('#', id);
            if (renameOption.xh1From == '前面') {
              name1 = str + name;
              name = '<i>' + str + '</i>' + name;
            } else if (renameOption.xh1From == '替换') {
              name1 = str;
              name = '<i>' + str + '</i>';
            } else {
              name1 = name + str;
              name = name + '<i>' + str + '</i>';
            }
          }
          break;
        }

        case 'dxx1': {
          if (renameOption.dxx1Type == '全部大写') {
            name1 = name.toUpperCase();
            name = name.toUpperCase();
          } else {
            name1 = name.toLowerCase();
            name = name.toLowerCase();
          }
          break;
        }

        case 'dxx2': {
          if (renameOption.dxx2Find != '' && renameOption.dxx2Str != '' && name.indexOf(renameOption.dxx2Find) >= 0) {
            let strs = name.split(renameOption.dxx2Find);
            name = renameOption.dxx2Str;
            name1 = renameOption.dxx2Str;
            for (let i = 0; i < strs.length; i++) {
              name1 = name1.replace(new RegExp('\\{' + i.toString() + '\\}', 'g'), strs[i]); //不同
              name = name.replace(new RegExp('\\{' + i.toString() + '\\}', 'g'), '<i>' + strs[i] + '</i>');
            }
          }
          break;
        }

        case 'kzm1': {
          if (renameOption.kzm1Type == '全部大写') {
            ext1 = ext.toUpperCase();
            ext = ext.toUpperCase();
          } else {
            ext1 = ext.toLowerCase();
            ext = ext.toLowerCase();
          }
          break;
        }
        case 'kzm2': {
          if (renameOption.kzm2Old != '' && renameOption.kzm2New != '' && ext != '') {
            let dian = '';
            if (ext.startsWith('.')) {
              dian = '.';
              ext = ext.substr(1);
            }
            ext1 = dian + ext.replace(renameOption.kzm2Old, renameOption.kzm2New);
            ext = dian + ext.replace(renameOption.kzm2Old, '<i>' + renameOption.kzm2New + '</i>');
          }
          break;
        }
        case 'kzm3': {
          if (renameOption.kzm3Str != '' && ext != '') {
            if (renameOption.kzm3From == '前面') {
              let dian = '';
              if (ext.startsWith('.')) {
                dian = '.';
                ext = ext.substr(1);
              }
              ext1 = dian + renameOption.kzm3Str + ext;
              ext = dian + '<i>' + renameOption.kzm3Str + '</i>' + ext;
            } else if (renameOption.kzm3From == '替换') {
              let dian = '';
              if (ext.startsWith('.')) {
                dian = '.';
                ext = ext.substr(1);
              }
              ext1 = dian + renameOption.kzm3Str;
              ext = dian + '<i>' + renameOption.kzm3Str + '</i>';
            } else {
              ext1 = ext + renameOption.kzm3Str;
              ext = ext + '<i>' + renameOption.kzm3Str + '</i>';
            }
          }
          break;
        }

        case 'sj1': {
          if (renameOption.sj1Str != '' && renameOption.sj1Min > 0 && renameOption.sj1Max >= renameOption.sj1Min) {
            let id = '';
            const chars = info.sj1Base;
            for (let r = 0; r < 10; r++) {
              const length = renameOption.sj1Min + Math.floor(Math.random() * (renameOption.sj1Max - renameOption.sj1Min + 1));
              for (var i = length; i > 0; --i) id += chars[Math.floor(Math.random() * chars.length)];
              if (info.sj1Map.has(id)) {
                id = '';
                continue;
              }
              info.sj1Map.set(id, 0);
              break;
            }
            if (id !== '') {
              let str = renameOption.sj1Str.replace('#', id);
              if (renameOption.sj1From == '前面') {
                name1 = str + name;
                name = '<i>' + str + '</i>' + name;
              } else if (renameOption.sj1From == '替换') {
                name1 = str;
                name = '<i>' + str + '</i>';
              } else {
                name1 = name + str;
                name = name + '<i>' + str + '</i>';
              }
            }
          }
          break;
        }
      }
      name = name + ext;
      name1 = name1 + ext1;
      if (node.filename != name) {
        node.name = name;
        node.filesha1 = name1;
        return 1;
      } else {
        node.name = node.filename;
        node.filesha1 = '';
      }
      return 0;
    }

    function replaceAll(treedata: IZtreeNode[] | undefined, info: { total: number; replace: number; xh1Start: number; sj1Base: string; sj1Map: Map<string, number> }) {
      if (treedata == undefined || treedata.length == 0) return;
      for (let i = 0; i < treedata.length; i++) {
        if (treedata[i].checked) {
          if (treedata[i].isParent) {
            if (renameOption.renameFile == '勾选的文件夹' || renameOption.renameFile == '勾选的文件和文件夹') {
              try {
                info.total++;
                info.replace += replaceOne(treedata[i], info); 
              } catch {}
            } else {
              treedata[i].name = treedata[i].filename; 
              treedata[i].filesha1 = '';
            }
            replaceAll(treedata[i].children, info);
          } else {
            if (renameOption.renameFile == '勾选的文件' || renameOption.renameFile == '勾选的文件和文件夹') {
              try {
                info.total++;
                info.replace += replaceOne(treedata[i], info); 
              } catch {}
            } else {
              treedata[i].name = treedata[i].filename; 
              treedata[i].filesha1 = '';
            }
          }
        } else {
          treedata[i].name = treedata[i].filename;
          treedata[i].filesha1 = '';
          if (treedata[i].isParent) replaceAll(treedata[i].children, info);
        }
      }
    }
    const onReplace = debounce(() => {
      const nodes = ZTreeObj.getNodes() as IZtreeNode[];
      const info = { total: 0, replace: 0, xh1Start: renameOption.xh1Start, sj1Base: '', sj1Map: new Map<string, number>() };
      if (renameOption.sj1Type == '只有数字') info.sj1Base = '0123456789';
      else if (renameOption.sj1Type == '只有大写字母') info.sj1Base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      else if (renameOption.sj1Type == '只有小写字母') info.sj1Base = 'abcdefghijklmnopqrstuvwxyz';
      else if (renameOption.sj1Type == '数字大写字母') info.sj1Base = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      else if (renameOption.sj1Type == '数字小写字母') info.sj1Base = '0123456789abcdefghijklmnopqrstuvwxyz';
      else if (renameOption.sj1Type == '数字大小写字母') info.sj1Base = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      info.sj1Base = info.sj1Base + info.sj1Base;
      replaceAll(nodes, info);
      ZTreeObj.refresh();
      totalCount.value = info.total;
      renameCount.value = info.replace;
      btncan.value = info.replace > 0;
    }, 500);
    let renameFile = '勾选的文件';
    watch(renameOption, () => {
      btncan.value = false;
      if (renameOption.renameFile != renameFile) {
        if (renameFile == '勾选的文件夹') {
          const nodes = ZTreeObj.getNodes() as IZtreeNode[];
          expandAll(nodes, false);
        } else if (renameOption.renameFile == '勾选的文件夹') {
          const nodes = ZTreeObj.getNodes() as IZtreeNode[];
          closeAll(nodes);
        }
        renameFile = renameOption.renameFile;
      }
      onReplace();
    });

    function refreshSave(treedata: IZtreeNode[] | undefined, files: string[], names: string[], info: { fileCount: number; dirCount: number }) {
      if (treedata == undefined || treedata.length == 0) return;
      for (let i = 0; i < treedata.length; i++) {
        if (treedata[i].checked) {
          const name = treedata[i].filesha1;
          const fileid = treedata[i].key;
          if (treedata[i].isParent) {
            if (name != '') {
              info.dirCount++;
              files.push(fileid);
              names.push(name);
            }
            refreshSave(treedata[i].children, files, names, info);
          } else if (name != '') {
            info.fileCount++;
            files.push(fileid);
            names.push(name);
          }
        }
      }
    }
    function onSaveRename() {
      const nodes = ZTreeObj.getNodes() as IZtreeNode[];
      const files: string[] = [];
      const names: string[] = [];
      const info = { fileCount: 0, dirCount: 0 };
      refreshSave(nodes, files, names, info);
      const Name = '重命名 ' + info.dirCount.toString() + '个文件夹，' + info.fileCount.toString() + '个文件';
      const token = Object.assign({}, StoreUser.tokeninfo);
      AliFile.ApiRenameBatch(token.default_drive_id, files, names, token).then(async (data) => {
        if (data == files.length) {
          await SQL.RenameFiles(token.user_id, token.default_drive_id, files, names);
          NotifySuccess(Name);
        } else {
          NotifyError(Name + ' 最终成功' + data.toString() + '个');
        }
        const fulllist: string[] = [parentid];
        fulllist.push(...getAllDirid(true));
        SQL.DeleteDirLoading(user_id, drive_id, fulllist).then(() => {
          StoreRoot.aDirDetail(parentid); 
        });
        if (dialogmrn.value) dialogmrn.value.hide();
      });
    }
    return {
      dialogmrn,
      tab,
      btncan,
      renameCount,
      totalCount,
      renameOption,
      saveInfo,
      fileloading,
      saveloading,
      setting,
      nodes,
      onSaveRename,
      menuRefreshDir,
      onClick,
      onCheck,
      handleCreated,
    };
  },
});
</script>
<style>
.dialogcardsection {
  padding: 4px;
  margin: 0 16px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
}

.renameaction .q-tab-panel {
  padding: 6px 12px;
}
.renameaction .q-field {
  margin: 0 6px;
}
.renameaction .q-toolbar {
  padding: 0;
}
.renameaction .q-radio {
  margin-right: 6px;
}

.renameaction .str {
  border-bottom: 1px solid #e91e63;
  padding: 0 2px 2px 2px;
}

.renametree i {
  color: green;
  font-style: normal;
  font-weight: bold;
  padding: 0 1px;
  background: #c8e6c9;
}
.renametree b {
  color: #e91e63;
  font-style: normal;
  font-weight: bold;
  padding: 0 1px;
  background: #f8bbd0;
  text-decoration: line-through;
}
.actioninfo {
  color: var(--q-primary);
  line-height: 32px;
  margin-right: 16px;
}
</style>
