<script lang="ts">
import { usePanTreeStore, useSettingStore } from '../../store'
import { defineComponent } from 'vue'
import PanDAL from '../pandal'

export default defineComponent({
  setup() {
    const pantreeStore = usePanTreeStore()
    const settingStore = useSettingStore()
    return { pantreeStore, settingStore }
  },

  methods: {
    selectDir(drive_id: string, file_id: string) {
      PanDAL.aTreeScrollToDir(file_id)
      PanDAL.aReLoadOneDirToShow(drive_id, file_id, true)
    }
  }
})
</script>

<template>
  <div style="min-height: 26px; max-width: 100%; flex-shrink: 0; flex-grow: 0">
    <div class="toppannav" :style="{ display: settingStore.uiShowPanPath ? '' : 'none' }">
      <div v-for="(item, index) in pantreeStore.selectDirPath" :key="item.file_id" class="toppannavitem" :title="item.name">
        <a-dropdown v-if="index == 0" class="rightmenu" trigger="hover" position="bl" @click="() => selectDir(item.drive_id, item.file_id)">
          <span> &nbsp; {{ item.name }} </span>
          <template #content>
            <a-doption v-for="option in pantreeStore.selectDirPath" :key="'drop' + option.file_id" @click="() => selectDir(option.drive_id, option.file_id)">
              <template #icon> <i class="iconfont iconfile-folder" /> </template>
              <template #default>{{ option.name }}</template>
            </a-doption>
          </template>
        </a-dropdown>
        <span v-else @click="() => selectDir(item.drive_id, item.file_id)">
          {{ item.name.length > 30 ? item.name.substring(0, 27) + '...' : item.name }}
        </span>
      </div>
    </div>
  </div>
</template>
<style>
.toppannav {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  width: 100%;
  height: 26px;
  padding: 4px 0 0 0;
  overflow: hidden;
  flex-shrink: 0;
  flex-grow: 0;
}
.toppannavitem {
  flex-grow: 0;
  flex-shrink: 1;
  min-width: 40px;
  max-width: 258px;
  height: 20px;
  padding-right: 4px;
  overflow: hidden;
  line-height: 20px;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;
  color: rgba(var(--primary-6), 0.8);
}
.toppannavitem > span {
  line-height: 20px;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.toppannavitem:hover {
  color: rgb(var(--primary-6));
  background: rgba(var(--primary-6), 0.1);
  border-radius: 4px;
}
.toppannavitem::before {
  color: var(--color-text-3);
  font-size: 16px;
  font-family: 'iconfont' !important;
  font-style: normal;
  vertical-align: bottom;
  content: '\e660';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.toppannavitem:first-child,
.toppannavitem:last-child {
  flex-shrink: 0 !important;
}
.toppannavitem:first-child::before {
  content: '';
}

.toppannavitem:last-child {
  max-width: 400px;
  color: rgb(var(--primary-6));
}

.toppannavitem:last-of-type:last-child {
  max-width: 600px;
}

.arco-dropdown-option-content {
  max-width: 446px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
