<template>
  <div id="PanLeftTop">
    <div class="headdesc" style="padding-top: 0px; width: fit-content">网盘里的文件</div>
  </div>
  <div id="pantree" tabindex="1">
    <div class="q-tree__trash q-tree__node relative-position q-tree__node--child" @click="selectedKey = 'trash'">
      <div
        class="q-tree__node-header relative-position row no-wrap items-center q-tree__node--link q-hoverable q-focusable"
        tabindex="0"
        :class="selectedKey == 'trash' ? 'q-tree__node--selected' : ''"
      >
        <div class="q-focus-helper" tabindex="-1"></div>
        <div class="q-tree__node-header-content col row no-wrap items-center" :class="selectedKey == 'trash' ? 'text-primary' : ''">
          <i class="iconfont icondelete q-icon q-tree__icon q-mr-sm" aria-hidden="true" role="presentation"></i>
          <div class="q-tree__label">回收站</div>
        </div>
      </div>
    </div>
    <div class="q-tree__favorite q-tree__node relative-position q-tree__node--child" @click="selectedKey = 'favorite'">
      <div
        class="q-tree__node-header relative-position row no-wrap items-center q-tree__node--link q-hoverable q-focusable"
        tabindex="0"
        :class="selectedKey == 'favorite' ? 'q-tree__node--selected' : ''"
      >
        <div class="q-focus-helper" tabindex="-1"></div>
        <div class="q-tree__node-header-content col row no-wrap items-center" :class="selectedKey == 'favorite' ? 'text-primary' : ''">
          <i class="iconfont iconcrown q-icon q-tree__icon q-mr-sm" aria-hidden="true" role="presentation"></i>
          <div class="q-tree__label">收藏夹</div>
        </div>
      </div>
    </div>
    <q-tree
      id="pantreedom"
      ref="treedom"
      :nodes="tree"
      node-key="key"
      label-key="label"
      icon="iconfont"
      selected-color="primary"
      v-model:selected="selectedKey"
      @click="onTreeClick"
      @contextmenu.stop="onTreeMenuHide()"
    >
      <template v-slot:default-header="prop">
        <i :id="'tree-' + prop.node.key" class="iconfont iconfolder q-icon q-tree__icon q-mr-sm" aria-hidden="true" role="presentation"> </i>
        <div class="q-tree__label" :class="fileColor.get(prop.node.key)">{{ prop.node.label }}</div>
      </template>
    </q-tree>

    <div class="downHideTip" v-if="tree.length < 0 || tree[0].children.length < 1">
      <div style="margin-top: 20%"></div>
      <q-icon name="iconfont iconempty" style="color: #ccc; font-size: 100px" />
      <br />文件夹树，还没登录任何账号?
    </div>
    <q-scroll-observer scroll-target="#pantree" @scroll="scrollHandler" debounce="100" />
  </div>
  <div id="PanLeftBottom"></div>

  <q-menu class="filemenu2" ref="treemenu" :touch-position="true" :noRefocus="true" context-menu :target="treemenutarget" @hide="onTreeMenuHide">
    <q-list dense style="min-width: 100px">
      <q-item clickable v-close-popup @click="menuDownload(true)">
        <q-item-section avatar>
          <q-icon name="iconfont icondownload" />
        </q-item-section>
        <q-item-section>下载</q-item-section>
      </q-item>
      <q-item v-close-popup>
        <q-item-section avatar>
          <q-icon name="iconfont iconfenxiang" />
        </q-item-section>
        <q-item-section>分享</q-item-section>
      </q-item>
      <q-item clickable v-close-popup @click="menuFavSelectFile(true)">
        <q-item-section avatar>
          <q-icon name="iconfont iconcrown" />
        </q-item-section>
        <q-item-section>收藏</q-item-section>
      </q-item>
      <q-item clickable v-close-popup @click="menuRenameSelectFile(true)">
        <q-item-section avatar>
          <q-icon name="iconfont iconedit-square" />
        </q-item-section>
        <q-item-section>改名</q-item-section>
      </q-item>
      <q-item clickable v-close-popup @click="menuFilesDetail(true)">
        <q-item-section avatar>
          <q-icon name="iconfont iconinfo_circle" />
        </q-item-section>
        <q-item-section>详情</q-item-section>
      </q-item>
      <q-item clickable>
        <q-item-section avatar>
          <q-icon name="iconfont iconcopy" />
        </q-item-section>
        <q-item-section>复制移动</q-item-section>
        <q-item-section side>
          <q-icon name="iconfont iconright" />
        </q-item-section>
        <q-menu anchor="top end" self="top start" class="filemenu2">
          <q-list dense>
            <q-item clickable v-close-popup @click="menuMoveFiles(true, false)">
              <q-item-section avatar>
                <q-icon name="iconfont iconcopy" />
              </q-item-section>
              <q-item-section>复制到...</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="menuMoveFiles(true, true)">
              <q-item-section avatar>
                <q-icon name="iconfont iconscissor" />
              </q-item-section>
              <q-item-section>移动到...</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-item>
      <q-item clickable>
        <q-item-section avatar>
          <q-icon name="iconfont iconcheckbox-full" />
        </q-item-section>
        <q-item-section>标记</q-item-section>
        <q-item-section side>
          <q-icon name="iconfont iconright" />
        </q-item-section>
        <q-menu anchor="top end" self="top start" class="filemenu2">
          <q-list dense>
            <q-item clickable v-close-popup @click="treeChangeColor('#df565966')">
              <q-item-section avatar>
                <q-icon name="iconfont iconcheckbox-full" style="color: #df5659" />
              </q-item-section>
              <q-item-section style="color: #df5659">鹅冠红</q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="treeChangeColor('#9c27b066')">
              <q-item-section avatar>
                <q-icon name="iconfont iconcheckbox-full" style="color: #9c27b0" />
              </q-item-section>
              <q-item-section style="color: #9c27b0">兰花紫</q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="treeChangeColor('#3f51b566')">
              <q-item-section avatar>
                <q-icon name="iconfont iconcheckbox-full" style="color: #3f51b5" />
              </q-item-section>
              <q-item-section style="color: #3f51b5">海涛蓝</q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="treeChangeColor('#42a5f566')">
              <q-item-section avatar>
                <q-icon name="iconfont iconcheckbox-full" style="color: #42a5f5" />
              </q-item-section>
              <q-item-section style="color: #42a5f5">晴蓝</q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="treeChangeColor('#00bc9966')">
              <q-item-section avatar>
                <q-icon name="iconfont iconcheckbox-full" style="color: #00bc99" />
              </q-item-section>
              <q-item-section style="color: #00bc99">竹绿</q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="treeChangeColor('#4caf5066')">
              <q-item-section avatar>
                <q-icon name="iconfont iconcheckbox-full" style="color: #4caf50" />
              </q-item-section>
              <q-item-section style="color: #4caf50">宝石绿</q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="treeChangeColor('#ff980066')">
              <q-item-section avatar>
                <q-icon name="iconfont iconcheckbox-full" style="color: #ff9800" />
              </q-item-section>
              <q-item-section style="color: #ff9800">金盏黄</q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="treeChangeColor('#ff572266')">
              <q-item-section avatar>
                <q-icon name="iconfont iconcheckbox-full" style="color: #ff5722" />
              </q-item-section>
              <q-item-section style="color: #ff5722">芙蓉橙</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="treeChangeColor('#000000aa')">
              <q-item-section avatar>
                <q-icon name="iconfont iconcheckbox-full" />
              </q-item-section>
              <q-item-section>取消标记</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-item>
      <q-item clickable>
        <q-item-section avatar>
          <q-icon name="iconfont icondelete" />
        </q-item-section>
        <q-item-section>删除</q-item-section>
        <q-item-section side>
          <q-icon name="iconfont iconright" />
        </q-item-section>
        <q-menu anchor="top end" self="top start" class="filemenu2">
          <q-list dense>
            <q-item clickable v-close-popup @click="menuTrashSelectFile(true, false)">
              <q-item-section>删除到回收站</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="menuTrashSelectFile(true, true)">
              <q-item-section>直接彻底删除</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-item>
    </q-list>
  </q-menu>
  <q-inner-loading :showing="user_id != '' && refreshDirTreeTime == 0">
    <q-spinner-clock size="40px" color="primary"></q-spinner-clock>
    <br />
    <q-chip square label="加载中..." />
  </q-inner-loading>
</template>

<script lang="ts">
import { StoreRoot, StoreUI } from 'src/store';
import { defineComponent, ref, computed, watch, onMounted, onBeforeUpdate, onUnmounted, onActivated, onDeactivated } from 'vue';
import { menuDownload, treeChangeColor, menuRenameSelectFile, menuTrashSelectFile, menuFavSelectFile, menuMoveFiles, menuFilesDetail } from 'src/pages/pan/filemenu';
import { IStateTreeItem } from 'src/store/models';

export default defineComponent({
  name: 'PanLeft',
  components: {},

  setup() {
    const treedom = ref();
    const treemenu = ref();
    const treemenutarget = ref('');

    const refreshDirTreeTime = computed(() => StoreRoot.refreshDirTreeTime);
    const user_id = computed(() => StoreRoot.user_id);
    const tree = ref<IStateTreeItem[]>(StoreRoot.gShowDirTree());

    const fileColor = computed(() => StoreUI.fileColor);
    const showDirTime = computed(() => StoreRoot.showDirTime);

    const selectedKey = computed({
      get: () => StoreRoot.showDir.file_id,
      set: (key) => {
        if (key) {
          if (StoreRoot.showDir.file_id != key) StoreRoot.aChangSelectedDir(key);
        }
      },
    });

    function isElementInViewport(el: any) {
      var rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    }
    watch(selectedKey, (newval: string) => {
      if (newval != 'trash' && newval != 'favorite') {
        expanded();
      }
    });
    watch(refreshDirTreeTime, () => {
      tree.value = StoreRoot.gShowDirTree();
      expanded();
    });
    watch(showDirTime, () => {
      if (treedom.value && selectedKey.value != '') {
        treedom.value.collapseAll();
        expanded();
      }
    });

    function onTreeClick(_node: any, meta: any, e: any, _keyboard: any) {
      if (e && e.button && meta && e.button == 2 && meta.key != 'root') {
        if (treemenu.value) {
          treemenutarget.value = '#pantreedom';
          setTimeout(() => {
            treemenu.value.hide();
            treemenu.value.show(e);
          }, 100);
        }
        e.stopPropagation();
      }
    }

    function onTreeMenuHide() {
      if (treemenu.value) treemenu.value.hide();
      treemenutarget.value = '';
    }

    function scrollHandler(_data: any) {
      if (treemenu.value) treemenu.value.hide();
      treemenutarget.value = '';
    }

    onMounted(() => {
      expanded();
    });
    onBeforeUpdate(() => {
      //
    });
    onUnmounted(() => {
      console.log('onUnmounted');
    });

    onActivated(() => {
      expanded();
    });
    onDeactivated(() => {
      console.log('onDeactivated');
    });

    function expanded() {
      setTimeout(() => {
        try {
          if (treedom.value && selectedKey.value != '') {
            const list = StoreRoot.gFileFullPathID(selectedKey.value); 
            for (let i = 0; i < list.length; i++) {
              try {
                treedom.value.setExpanded(list[i], true);
              } catch {}
            }
            const node = document.getElementById('tree-' + selectedKey.value);
            if (node && isElementInViewport(node) == false) node.scrollIntoView(false);
          }
        } catch (e) {
          console.log(e);
        }
      }, 100);
    }

    return {
      treedom,
      treemenu,
      treemenutarget,
      tree,
      fileColor,
      selectedKey,
      user_id,
      refreshDirTreeTime,
      onTreeClick,
      onTreeMenuHide,
      scrollHandler,
      menuDownload,
      treeChangeColor,

      menuRenameSelectFile,
      menuFavSelectFile,
      menuTrashSelectFile,
      menuMoveFiles,
      menuFilesDetail,
    };
  },
});
</script>
<style>
.q-tree__arrow:before {
  content: '\e742';
  opacity: 0.8;
}
.q-tree__arrow--rotate:before {
  content: '\e742';
  opacity: 0.8;
}

.q-tree__icon {
  margin-right: 0 !important;
}
.q-tree__children {
  padding-left: 17px !important;
}
.q-tree__node-header {
  margin-top: 0 !important;
  padding: 0 !important;
}
.q-tree__node-header:before {
  color: #e0e0e0;
}
.q-tree__children {
  margin-top: 3px !important;
}
.q-tree__node:after {
  color: #e0e0e0;
  left: -8px !important;
}

.q-tree__node-header-content {
  font-size: 14px;
  color: #616161;
}
.q-tree__node--parent > .q-tree__node-header:before {
  width: 10px !important;
  left: -10px !important;
}
.q-tree__node-header:before {
  left: -30px !important;
  width: 30px !important;
}

.q-tree__icon {
  color: #ffb74d;
}

.q-tree__node--selected .q-icon {
  color: var(--q-primary) !important;
}
.q-focus-helper1 {
  display: none;
}

.q-tree__node--link .q-focus-helper {
  background: var(--q-primary);
  opacity: 0.15;
}
.q-tree__node--selected .q-focus-helper {
  background: var(--q-primary) !important;
  opacity: 0.15 !important;
}

.q-tree__label {
  white-space: nowrap;
  user-select: none;
  -webkit-user-drag: none;
}
.q-tree {
  width: fit-content;
}
.q-tree__node-header-content {
  max-width: fit-content !important;
  padding-right: 4px;
}
.q-tree__node-header {
  width: fit-content !important;
}

.q-list--dense > .q-item,
.q-item--dense {
  min-height: 28px;
  padding: 2px 16px;
  font-size: 13px;
}

.q-btn-group .q-btn--dense {
  padding: 0.5em 0.9em;
  font-size: 0.9em;
}
.headdesc {
  height: 52px;
  padding: 16px 0 0 18px;
  line-height: 20px;
  color: #8a9ca5;
  user-select: none;
  -webkit-user-drag: none;
}
#PanLeftTop {
  width: 100%;
  height: 52px;
  padding-top: 16px;
  flex-grow: 0;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}
#pantree {
  flex-grow: 1;
  padding: 1px 16px 16px 13px;
  width: 100%;
  overflow: auto;
  position: relative;
}
#PanLeftBottom {
  width: 100%;
  height: 8px;
  flex-grow: 0;
}

.q-tree__trash {
  position: absolute;
  left: 90px;
  z-index: 1;
}
.q-tree__favorite {
  position: absolute;
  left: 170px;
  z-index: 1;
}
.q-tree__trash .q-tree__node-header:before,
.q-tree__trash::after,
.q-tree__favorite .q-tree__node-header:before,
.q-tree__favorite::after {
  display: none;
}
</style>
