<template>
  <div class="row items-center no-wrap q-electron-drag--exception">

    <Setting></Setting>
    <q-btn round dense flat icon="iconfont iconsetting" @click="ShowSetting()">
      <q-tooltip>设置</q-tooltip>
    </q-btn>
    <q-btn round flat @click="ShowUser()">
      <q-menu ref="userinfo" style="width: 280px">
        <div class="no-wrap q-pa-md">
          <div class="column">
            <div class="col">
              <div class="row justify-center">
                <div class="q-mt-xs">
                  <q-avatar size="56px">
                    <img :src="avatar" />
                  </q-avatar>
                </div>
                <div class="col-grow" style="padding: 0 16px" v-if="isLogin">
                  <div class="text-subtitle1 q-mt-xs q-mb-xs">
                    <span class="username">Hi {{ nick_name }}</span
                    ><br />
                    <span class="userspace">{{ userspace }}</span>
                  </div>
                </div>
                <div v-if="isLogin">
                  <div class="text-subtitle1 q-mt-md q-mb-xs">
                    <q-btn outline color="primary" label="退出" size="md" padding="1px 3px" @click="logout" />
                  </div>
                </div>
              </div>
            </div>

            <div class="col q-mt-md q-mb-md" v-if="isLogin">
              <q-list bordered dense>
                <q-item-label header style="padding: 8px 16px">切换到其他账号</q-item-label>

                <q-item v-for="user in tokenlist" :key="user.user_id">
                  <q-item-section>{{ user.nick_name == '' ? user.user_name : user.nick_name }}</q-item-section>
                  <q-item-section side>
                    <q-toggle color="blue" val="battery" :model-value="user.user_id == userid" v-close-popup @click="changeUser(user.user_id)" />
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <div class="col q-mt-md q-mb-xs">
              <div class="text-subtitle1" style="text-align: center">
                <q-btn outline color="primary" size="md" padding="3px 8px" label="登录一个新账号" v-close-popup @click="login" />
              </div>
            </div>
          </div>
        </div>
      </q-menu>
      <q-avatar size="32px">
        <img :src="avatar" />
      </q-avatar>
      <q-tooltip>账号信息</q-tooltip>
    </q-btn>

    <div class="electron-only">
      <q-btn dense flat icon="iconfont iconzuixiaohua" @click="MinSize" />
      <q-btn dense flat icon="iconfont iconfullscreen" @click="MaxSize" />
      <q-btn dense flat icon="iconfont iconclose" @click="CloseApp" />
    </div>
  </div>
</template>

<script lang="ts">
import Setting from 'src/pages/Setting.vue';
import Login from 'src/pages/Login.vue';
import { StoreUser, StoreSetting, StoreRoot } from '../store';
import { defineComponent, computed, onMounted, ref } from 'vue';
import { Dialog, LocalStorage } from 'quasar';
export default defineComponent({
  name: 'TopBtns',
  components: {
    Setting,
  },

  setup() {
    const userinfo = ref();
    const isLogin = computed(() => StoreUser.isLogin);
    const avatar = computed(() => StoreUser.avatar);
    const userid = computed(() => StoreUser.userid);
    const nick_name = computed(() => StoreUser.username);
    const userspace = computed(() => StoreUser.userspace);
    const tokenlist = computed(() => StoreUser.tokenlist);

    function MinSize() {
      if (window.WebToElectron) window.WebToElectron({ cmd: 'minsize' });
    }

    function MaxSize() {
      if (window.WebToElectron) window.WebToElectron({ cmd: 'maxsize' });
    }

    function CloseApp() {
      if (window.WebToElectron) window.WebToElectron({ cmd: 'close' });
    }
    function ShowSetting() {
      StoreSetting.mShowSetting(true, false);
    }
    function ShowUser() {
      StoreUser.aRefreshAllUser();
    }

    function changeUser(userid: string) {
      StoreUser.mChangeUser(userid);
    }

    function login() {
      if (window.WebClearCookies) window.WebClearCookies();
      Dialog.create({
        component: Login,
      });
    }
    function logout() {
      StoreUser.mSaveLogoff();
    }

    onMounted(() => {
      setTimeout(() => {
        if (window.electronworker) return;
        try {
          const stime = parseInt(LocalStorage.getItem('UserInfoShowTime') || '0');
          LocalStorage.set('UserInfoShowTime', (stime + 1).toString());
          if (stime < 5 && userinfo.value) userinfo.value.show();
          else if (StoreRoot.user_id == '') userinfo.value.show();
        } catch {
          LocalStorage.set('UserInfoShowTime', '0');
          if (userinfo.value) userinfo.value.show();
        }
      }, 3000);
    });
    return {
      userinfo,
      avatar,
      userid,
      nick_name,
      userspace,
      isLogin,
      tokenlist,
      MinSize,
      MaxSize,
      CloseApp,
      ShowSetting,
      ShowUser,
      changeUser,
      login,
      logout,
    };
  },
});
</script>
<style scoped>
.username {
  font-size: 18px;
}
.userspace {
  color: #8a9ca5;
}
</style>
