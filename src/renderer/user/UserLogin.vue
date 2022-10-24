<script lang="ts">
import { defineComponent } from 'vue'
import { useUserStore, ITokenInfo } from '../store'
import UserDAL from '../user/userdal'
import Config from '../utils/config'
import message from '../utils/message'
import DebugLog from '../utils/debuglog'

function v(e: string) {
  const t = atob(e)
  let r = t.length
  const n = new Uint8Array(r)
  while (r--) n[r] = t.charCodeAt(r)
  return new Blob([n])
}
function w(e: string) {
  return new Promise<string>(function (resolve, reject) {
    const n = v(e)
    const i = new FileReader()
    i.onloadend = function (e) {
      resolve((e?.target?.result as string | undefined) || '')
    }
    i.onerror = function (e) {
      return reject(e)
    }
    i.readAsText(n, 'gbk')
  })
}

export default defineComponent({
  setup() {
    const handleOpen = () => {
      setTimeout(() => {
        const webview = document.getElementById('loginiframe') as any
        if (!webview) {
          message.error('严重错误：无法打开登录弹窗，请退出小白羊后重新运行')
          return
        }
        webview.openDevTools({ mode: 'bottom', activate: false })
        // webview.openDevTools({ mode: 'detach', activate: false })
        webview.loadURL(Config.loginUrl, { httpReferrer: 'https://www.aliyundrive.com/' })

        webview.addEventListener('did-fail-load', () => {
          console.log('did-fail-load')
          const loading = document.getElementById('loginframedivloading')
          if (loading) loading.parentNode!.removeChild(loading)
          document.getElementById('loginframediverror')!.style.display = ''
        })
        webview.addEventListener('console-message', (e: any) => {
          const msg = e.message || ''
          // console.log('Guest page logged a message:', e.message)
          const loading = document.getElementById('loginframedivloading')
          if (loading) loading.parentNode!.removeChild(loading)
          document.getElementById('loginframediverror')!.style.display = 'none'
          if (msg.indexOf('bizExt') > 0) loginbizExt(msg)
        })
      }, 500)
    }

    function loginbizExt(msg: string) {
      let data = { bizExt: '' }
      try {
        data = JSON.parse(msg)
      } catch {}
      if (!data.bizExt) {
        DebugLog.mSaveDanger('登录失败：' + msg)
        return
      }
      w(data.bizExt).then((jsonstr: string) => {
        try {
          const result = JSON.parse(jsonstr).pds_login_result
          const tk2: ITokenInfo = {
            tokenfrom: 'account' ,
            access_token: result.accessToken,
            refresh_token: result.refreshToken,
            expires_in: result.expiresIn,
            token_type: result.tokenType,
            user_id: result.userId,
            user_name: result.userName,
            avatar: result.avatar,
            nick_name: result.nickName,
            default_drive_id: result.defaultDriveId,
            default_sbox_drive_id: '' ,
            role: result.role,
            status: result.status,
            expire_time: result.expireTime,
            state: result.state,
            pin_setup: result.dataPinSetup,
            is_first_login: result.isFirstLogin,
            need_rp_verify: result.needRpVerify,
            name: '',
            spu_id: '',
            is_expires: false,
            used_size: 0,
            total_size: 0,
            spaceinfo: '',
            pic_drive_id: '',
            vipname: '',
            vipexpire: ''
          }

          UserDAL.UserLogin(tk2)
            .then(() => {
              useUserStore().userShowLogin = false
              if (window.WebClearCookies) window.WebClearCookies({ origin: 'https://auth.aliyundrive.com', storages: ['cookies', 'localstorage'] })
            })
            .catch(() => {
              useUserStore().userShowLogin = false
              if (window.WebClearCookies) window.WebClearCookies({ origin: 'https://auth.aliyundrive.com', storages: ['cookies', 'localstorage'] })
            })
        } catch (err: any) {
          message.error('登录失败：' + (err.message || '解析失败'))
          DebugLog.mSaveDanger('登录失败：' + (err.message || '解析失败'), JSON.stringify(err)) 
        }
      })
    }

    const useUser = useUserStore()
    return { useUser, handleOpen }
  }
})
</script>

<template>
  <a-modal v-model:visible="useUser.userShowLogin" :mask-closable="false" unmount-on-close :footer="false" class="userloginmodal" @before-open="handleOpen">
    <template #title> 登录阿里云盘账号 </template>
    <div id="logindiv">
      <div class="logincontent">
        <div class="loginframe">
          <div id="loginframedivloading">
            <div class="ant-spin ant-spin-spinning" style="width: 100%; text-align: center">
              <div class="shaloubg"></div>
            </div>
          </div>
          <div id="loginframediverror">
            <a-row align="stretch">
              <a-col flex="none">
                <a-avatar :size="36"><i class="iconfont iconwifi" style="font-size: 24px" /></a-avatar>
              </a-col>
              <a-col flex="auto">
                <p style="font-size: 13px; margin: 0; text-align: left">
                  如果显示空白页面？请先确认你能够上网
                  <br />
                  然后关闭弹窗，重试
                </p>
              </a-col>
            </a-row>
          </div>
          <div id="loginframediv" style="overflow: hidden; position: relative; width: 100%; height: 100%">
            <Webview id="loginiframe" src="about:blank" style="width: 100%; height: 400px; border: none; overflow: hidden" />
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>
<style>
#logindiv {
  min-height: 400px;
  height: calc(100%);
  text-align: center;
}
.logincontent {
  position: relative;
  margin: 0 auto;
  min-height: 400px;
}
#loginframedivloading {
  min-height: 60px;
}
.loginframe {
  position: relative;
  width: 348px;
  height: 367px;
  min-height: 400px;
  margin: 0 auto;
  overflow: hidden;
  text-align: center;
}
#loginframediverror {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 199;
  min-height: 44px;
  padding: 6px 16px;
  color: #ffffff;
  background-color: rgb(223, 86, 89);
  border-radius: 4px;
  opacity: 0.8;
}
#loginframediverror .ant-avatar {
  margin-top: 3px;
  margin-right: 16px;
  color: rgb(223, 86, 89);
  background: #ffffff;
}

.userloginmodal .arco-modal-body {
  min-height: 400px;
  padding: 0 16px 16px 16px !important;
}
.shaloubg {
  width: 60px;
  height: 60px;
  margin: 130px auto 0 auto;
}
.shaloubg::before {
  content: url("data:image/svg+xml,%3Csvg width='3em' height='3em' viewBox='0 0 100 100' preserveAspectRatio='xMidYMid' xmlns='http://www.w3.org/2000/svg'%3E%3Cg%3E%3Cpath fill='none' stroke='%23637dff' stroke-width='5' stroke-miterlimit='10' d='M58.4 51.7c-.9-.9-1.4-2-1.4-2.3s.5-.4 1.4-1.4C70.8 43.8 79.8 30.5 80 15.5H20c.2 15 9.2 28.1 21.6 32.3.9.9 1.4 1.2 1.4 1.5s-.5 1.6-1.4 2.5C29.2 56.1 20.2 69.5 20 85.5h60c-.2-16-9.2-29.6-21.6-33.8z'/%3E%3CclipPath id='a'%3E%3Cpath d='M15 20h70v25H15z'%3E%3Canimate attributeName='height' from='25' to='0' dur='1s' repeatCount='indefinite' values='25;0;0' keyTimes='0;0.5;1'/%3E%3Canimate attributeName='y' from='20' to='45' dur='1s' repeatCount='indefinite' values='20;45;45' keyTimes='0;0.5;1'/%3E%3C/path%3E%3C/clipPath%3E%3CclipPath id='b'%3E%3Cpath d='M15 55h70v25H15z'%3E%3Canimate attributeName='height' from='0' to='25' dur='1s' repeatCount='indefinite' values='0;25;25' keyTimes='0;0.5;1'/%3E%3Canimate attributeName='y' from='80' to='55' dur='1s' repeatCount='indefinite' values='80;55;55' keyTimes='0;0.5;1'/%3E%3C/path%3E%3C/clipPath%3E%3Cpath d='M29 23c3.1 11.4 11.3 19.5 21 19.5S67.9 34.4 71 23H29z' clip-path='url(%23a)' fill='%23637dff'/%3E%3Cpath d='M71.6 78c-3-11.6-11.5-20-21.5-20s-18.5 8.4-21.5 20h43z' clip-path='url(%23b)' fill='%23637dff'/%3E%3CanimateTransform attributeName='transform' type='rotate' from='0 50 50' to='180 50 50' repeatCount='indefinite' dur='1s' values='0 50 50;0 50 50;180 50 50' keyTimes='0;0.7;1'/%3E%3C/g%3E%3C/svg%3E");
}
</style>
