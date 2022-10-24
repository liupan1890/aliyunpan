<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: { value: Boolean },
  emits: ['update:value'],
  setup() {}
})
</script>

<template>
  <div class="myswitch">
    <a-switch type="round" :model-value="value" tabindex="-1" @update:model-value="$emit('update:value', $event)">
      <template #checked>✔</template>
      <template #unchecked>✖</template>
    </a-switch>
    <span class="myswitchspan" @click="$emit('update:value', !value)"><slot></slot></span>
  </div>
</template>
<style>
.myswitch {
  height: 30px;
  display: flex;
  align-items: center;
  user-select: none;
  display: inline-flex;
}
.myswitch .arco-switch {
  min-width: 36px;
  height: 18px;
  line-height: 18px;
}
.myswitch .arco-switch-handle {
  width: 12px;
  height: 12px;
  top: 3px;
}
.myswitch .arco-switch-checked .arco-switch-handle {
  left: calc(100% - 16px);
}

.myswitch .arco-switch-text-holder {
  margin: 0 4px 0 22px;
}

.myswitch .arco-switch-checked .arco-switch-text-holder {
  margin: 0 22px 0 4px;
}

.myswitch .arco-switch-text {
  left: 22px;
}
.myswitch .arco-switch-checked .arco-switch-text {
  left: 6px;
}

.myswitchspan {
  padding-left: 8px;
  cursor: pointer;
  height: 20px;
  line-height: 20px;
  user-select: none;
}
</style>
