<template>
  <router-view />
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'App',
  created() {
    this.$q.iconMapFn = (iconName: string) => {
      if (iconName.startsWith('iconfont') === true) {
        return {
          cls: 'icon- ' + iconName,
        };
      }
    };
    window.$q = this.$q;

    const dart = localStorage.getItem('uiTheme');
    if (dart == 'dark') {
      const $q = useQuasar();
      $q.dark.set(true); 
    }
  },
});
</script>
<style>
:root {
  --q-primary: #df5659 !important;
}
div:focus {
  outline: none;
}

.dark {
  background-color: rgb(50, 50, 51);
  color: rgba(204, 204, 204, 0.6);
}

.text-h1,
.text-h2,
.text-h3,
.text-h4,
.text-h5,
.q-menu,
.q-menu img,
.q-tooltip,
.q-tab,
.q-toggle__label,
.q-field__suffix,
.q-item__section,
.q-btn__content,
.q-btn__content img,
.q-field__native > span {
  user-select: none;
  -webkit-user-drag: none;
}
* {
  user-select: none;
  -webkit-user-drag: none;
}

.q-tooltip {
  font-size: 12px;
}

::-webkit-scrollbar {
  width: 10px;
  height: 10px;
  cursor: pointer;
}

::-webkit-scrollbar-thumb {
  background: rgb(201, 201, 202);
  border-radius: 5px;
}
::-webkit-scrollbar-thumb:vertical {
  width: 10px;
}
::-webkit-scrollbar-thumb:horizontal {
  height: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgb(162, 162, 163);
}

::-webkit-scrollbar-track {
  background-color: transparent;
}

::-webkit-scrollbar-corner {
  background: transparent !important;
}

::-webkit-resizer {
  background: transparent !important;
}

::-webkit-scrollbar-button {
  display: none;
}

.rename {
  width: 90% !important;
  max-width: 90% !important;
  padding-bottom: 12px;
}
.my-picker {
  width: 100% !important;
  max-width: 100% !important;
  height: 12px !important;
  background: #ffffff99 !important;
  margin-top: 2px;
}
.my-picker .q-color-picker__cube {
  padding: 0 !important;
  height: 12px;
}

.q-field--dense .q-field__native,
.q-field--dense .q-field__prefix,
.q-field--dense .q-field__suffix,
.q-field--dense .q-field__input {
  padding: 0;
}
.q-field--dense,
.q-field--dense .q-field__control,
.q-field--dense .q-field__marginal,
.q-field--auto-height.q-field--dense .q-field__control,
.q-field--auto-height.q-field--dense .q-field__native,
.q-btn--dense,
.q-toggle--dense {
  min-height: 32px !important;
  height: 32px !important;
}
.q-field--dense .q-field__marginal i {
  font-size: 20px;
}

.text-h7 {
  font-size: 1rem;
  font-weight: 500;
  line-height: 2rem;
  letter-spacing: 0.0125em;
}
</style>
