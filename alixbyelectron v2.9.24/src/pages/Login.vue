<template>
  <q-dialog ref="dialog" persistent no-focus no-refocus>
    <q-card class="q-dialog-plugin" style="height: 440px; width: 80vw; max-width: 600px">
      <q-toolbar class="non-selectable">
        <q-avatar style="font-size: 24px; padding-left: 4px">
          <img src="img/app.png" />
        </q-avatar>
        <q-toolbar-title>登录阿里云盘账号</q-toolbar-title>
        <q-btn flat round dense icon="iconfont iconclose" v-close-popup />
      </q-toolbar>
      <q-card-section style="height: calc(100% - 50px); padding: 0" class="scroll">
        <div id="logindiv" class="row" style="height: calc(100%); text-align: center">
          <div class="logincontent">
            <div class="loginframe">
              <div id="loginframedivloading">
                <q-spinner-hourglass color="primary" size="4em" />
              </div>
              <div id="loginframediverror" style="display: none">
                <q-banner rounded class="bg-primary text-white">
                  <template v-slot:avatar>
                    <q-avatar icon="iconfont iconwifi" color="white" size="md" text-color="primary" />
                  </template>
                  <p style="font-size: 13px; margin: 0; text-align: left">
                    如果显示空白页面？请先确认你能够上网<br />
                    然后再重新点击登录尝试
                  </p>
                </q-banner>
              </div>
              <div id="loginframediv" style="overflow: hidden; position: relative; width: 100%; height: 100%"></div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { StoreConfig, StoreUser } from '../store';
function d(t) {
  if (t && t.data && t.data.type && t.data.type === 'loginSuccess') {
    var tokenInfo = t.data.tokenInfo;
    const tk2 = {
      access_token: tokenInfo.access_token,
      refresh_token: tokenInfo.refresh_token,
      expires_in: tokenInfo.expires_in,
      token_type: tokenInfo.token_type,
      user_id: tokenInfo.user_id,
      user_name: tokenInfo.user_name,
      avatar: tokenInfo.avatar,
      nick_name: tokenInfo.nick_name,
      default_drive_id: tokenInfo.default_drive_id,
      default_sbox_drive_id: tokenInfo.default_sbox_drive_id,
      role: tokenInfo.role,
      status: tokenInfo.status,
      expire_time: tokenInfo.expire_time,
      state: tokenInfo.state,
      pin_setup: tokenInfo.pin_setup,
      is_first_login: tokenInfo.is_first_login,
      need_rp_verify: tokenInfo.need_rp_verify,
      name: '',
      spu_id: '',
      is_expires: false,
      used_size: 0,
      total_size: 0,
      spaceinfo: '',
      pic_drive_id: '',
    };

    StoreUser.aSaveLogin(tk2);
    if (this.$refs) this.$refs.dialog.hide();
    else if (window.loginfnd) window.loginfnd.hide();
  }
}
export default {
  methods: {
    show() {
      this.$refs.dialog.show();
      window.loginfnd = this.$refs.dialog; 
      window.loginfn = function (ev) {
        let loading = document.getElementById('loginframedivloading');
        if (loading) loading.parentNode.removeChild(loading);
        let iframe = document.getElementById('loginiframe');
        try {
          var iframedoc = iframe.contentDocument || {};
          var ifTitle = iframedoc.title;
          if (ifTitle == undefined) {
            document.getElementById('loginframediverror').style.display = 'block';
          }
        } catch (err) {
          document.getElementById('loginframediverror').style.display = 'block';
        }
      };

      setTimeout(() => {
        let ifm = document.getElementById('loginframediv');
        if (ifm) {
          ifm.innerHTML =
            '<iframe id="loginiframe" src="' +
            StoreConfig.loginUrl +
            '" frameborder="none" scrolling="no" style="width: 100%; height: 100%; border: none; overflow: hidden;" rel="noreferrer" referrerpolicy="no-referrer" onload="window.loginfn(event)"></iframe>';

          window.addEventListener('message', d);
        }
      }, 1000);
    },

    hide() {
      this.$refs.dialog.hide();
    },

    onOKClick() {
      this.$emit('ok');
      this.hide();
    },

    onCancelClick() {
      this.hide();
    },
  },

  unmounted() {
    window.removeEventListener('message', d);
  },
};
</script>
<style>
.logincontent {
  position: relative;
  margin: 0 auto;
}
.loginframe {
  position: relative;
  width: 348px;
  height: 367px;
  overflow: hidden;
}
#loginframediverror {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 199;
  padding: 0 10px;
}
#loginframediverror .q-banner {
  padding: 4px 16px;
  min-height: 44px;
  opacity: 0.8;
}
#loginframediverror .q-banner__avatar {
  padding-top: 4px;
}
</style>
