import SettingConfig from '@/setting/settingconfig'
import SettingLog from '@/setting/settinglog'
import AppCache from '@/store/appcache'
import { ITokenInfo } from '@/store/models'
import { Avatar, Button, Col, message, Modal, Row } from 'antd'
import { useModal } from 'react-use-modal'
import UserDAL from '../../store/userdal'
import './user.css'
const path = window.require('path')

const UserLoginModal = () => {
  const { showModal, closeModal } = useModal()

  function v(e: string) {
    var t = atob(e),
      r = t.length,
      n = new Uint8Array(r)
    while (r--) n[r] = t.charCodeAt(r)
    return new Blob([n])
  }
  function w(e: string) {
    return new Promise<string>(function (t, r) {
      var n = v(e),
        i = new FileReader()
      ;(i.onloadend = function (e) {
        t((e?.target?.result as string | undefined) || '')
      }),
        (i.onerror = function (e) {
          return r(e)
        }),
        i.readAsText(n, 'gbk')
    })
  }

  function loginbizExt(msg: string) {
    let data = { bizExt: '' }
    try {
      data = JSON.parse(msg)
    } catch {}
    if (!data.bizExt) {
      SettingLog.mSaveLog('danger', '登录失败：' + msg)
      return
    }
    w(data.bizExt).then((jsonstr: string) => {
      try {
        const result = JSON.parse(jsonstr).pds_login_result
        const tk2: ITokenInfo = {
          tokenfrom: 'account',
          access_token: result.accessToken,
          refresh_token: result.refreshToken,
          expires_in: result.expiresIn,
          token_type: result.tokenType,
          user_id: result.userId,
          user_name: result.userName,
          avatar: result.avatar,
          nick_name: result.nickName,
          default_drive_id: result.defaultDriveId,
          default_sbox_drive_id: '',
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
          pic_drive_id: ''
        }
        UserDAL.UserLogin(tk2)
          .then(() => {
            onCloseModal(undefined)
            if (window.WebClearCookies) window.WebClearCookies({ storages: ['cookies', 'localstorage'] })
          })
          .catch(() => {
            onCloseModal(undefined)
            if (window.WebClearCookies) window.WebClearCookies({ storages: ['cookies', 'localstorage'] })
          })
      } catch (e: any) {
        message.error('登录失败：' + (e.message || '解析失败'))
        SettingLog.mSaveLog('danger', '登录失败：' + (e.message || '解析失败'))
        SettingLog.mSaveLog('danger', JSON.stringify(e))
      }
    })
  }

  function onCloseModal(e: any) {
    try {
      closeModal(e)
    } catch {}
  }

  function handleClick() {
    if (window.WebClearCookies) window.WebClearCookies({ storages: ['cookies', 'localstorage'] })
    window.getDvaApp()._store.dispatch({ type: 'global/save', showUserInfo: false })

    showModal(({ show }: { show: boolean }) => (
      <Modal
        title="登录阿里云盘账号"
        visible={show}
        onOk={closeModal}
        onCancel={onCloseModal}
        destroyOnClose
        footer={null}
        maskClosable={false}
        width="380px"
        style={{ maxWidth: '380px', top: 46, minHeight: '400px', paddingBottom: '0' }}
        wrapClassName="userloginmodal">
        <div id="logindiv">
          <div className="logincontent">
            <div className="loginframe">
              <div id="loginframedivloading">
                <div className="ant-spin ant-spin-spinning" style={{ width: '100%', textAlign: 'center' }}>
                  <div className="shaloubg"></div>
                </div>
              </div>
              <div id="loginframediverror" style={{ display: '' }}>
                <Row>
                  <Col flex="none">
                    <Avatar size={36} icon={<i className="iconfont iconwifi" style={{ fontSize: '24px' }} />} />
                  </Col>
                  <Col flex="auto">
                    {' '}
                    <p style={{ fontSize: '13px', margin: 0, textAlign: 'left' }}>
                      如果显示空白页面？请先确认你能够上网
                      <br />
                      然后关闭弹窗，重试
                    </p>
                  </Col>
                </Row>
              </div>
              <div id="loginframediv" style={{ overflow: 'hidden', position: 'relative', width: '100%', height: '100%' }}>
                <webview id="loginiframe" src="about:blank" style={{ width: '100%', height: '400px', border: 'none', overflow: 'hidden' }} />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    ))

    setTimeout(() => {
      let webview = document.getElementById('loginiframe') as any
      webview.openDevTools({ mode: 'bottom', activate: false })
      webview.loadURL(SettingConfig.loginUrl, { httpReferrer: 'https://www.aliyundrive.com/' })

      webview.addEventListener('did-fail-load', () => {
        console.log('did-fail-load')
        let loading = document.getElementById('loginframedivloading')
        if (loading) loading.parentNode!.removeChild(loading)
        document.getElementById('loginframediverror')!.style.display = ''
      })
      webview.addEventListener('console-message', (e: any) => {
        const msg = e.message || ''
        if (msg.indexOf('resizeIframe') > 0) {
          let loading = document.getElementById('loginframedivloading')
          if (loading) loading.parentNode!.removeChild(loading)
          document.getElementById('loginframediverror')!.style.display = 'none'
        }

        if (msg.indexOf('bizExt') > 0) loginbizExt(msg)
      })
    }, 500)
  }

  return (
    <Button type="link" className="outline" style={{ margin: '0 0 8px 0' }} onClick={handleClick}>
      登录一个新账号
    </Button>
  )
}

export default UserLoginModal
