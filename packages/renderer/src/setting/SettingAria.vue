<script setup lang="ts">
import { ref } from 'vue'
import useSettingStore from './settingstore'
import { AriaChangeToLocal, AriaChangeToRemote, AriaTest } from '@/utils/aria2c'
import message from '@/utils/message'

import { Checkbox as AntdCheckbox } from 'ant-design-vue'
import 'ant-design-vue/es/checkbox/style/css'

const settingStore = useSettingStore()
const cb = (val: any) => {
  settingStore.updateStore(val)
}
const isRemote = ref(false)
const ariaLoading = ref(false)
const ariaSavePath = ref(settingStore.ariaSavePath)
const ariaUrl = ref(settingStore.ariaUrl)
const ariaPwd = ref(settingStore.ariaPwd)

const handleAriaConn = () => {
  ariaSavePath.value = ariaSavePath.value.trim()
  if (!ariaSavePath.value || (ariaSavePath.value.indexOf('/') < 0 && ariaSavePath.value.indexOf('\\') < 0)) {
    message.error('下载保存 必须包含路径分隔符 \\或者/')
    return
  }

  let val2 = ariaUrl.value
  val2 = val2.replaceAll('：', ':')
  if (val2.indexOf('://') > 0) val2 = val2.substring(val2.indexOf('://') + 3)
  if (val2.indexOf('/js') > 0) val2 = val2.substring(0, val2.indexOf('/js'))
  ariaUrl.value = val2.trim()
  if (!ariaUrl || ariaUrl.value.indexOf(':') < 0) {
    message.error('连接地址 必须包含 :')
    return
  }

  ariaPwd.value = ariaPwd.value.trim()
  if (!ariaPwd) {
    message.error('连接密码 不能为空，不能包含特殊字符')
    return
  }

  settingStore.updateStore({ ariaSavePath: ariaSavePath.value, ariaUrl: ariaUrl.value, ariaPwd: ariaPwd.value, ariaLoading: true })

  

  try {
    const host = ariaUrl.value.split(':')[0]
    const port = parseInt(ariaUrl.value.split(':')[1])
    const secret = ariaPwd.value

    AriaTest(settingStore.ariaHttps, host, port, secret).then((issuccess: boolean) => {
      if (issuccess == true) {
        
        settingStore.updateStore({ ariaState: 'remote' })
        AriaChangeToRemote().then((isOnline: boolean | undefined) => {
          settingStore.ariaLoading = false 
          if (isOnline == true) {
            message.success('连接到远程Aria服务器：成功！')
          } else if (isOnline == undefined) {
            message.warning('连接到远程Aria服务器：正忙，稍后再试！')
          } else {
            message.error('连接到远程Aria服务器：失败！')
          }
        })
      } else {
        
        settingStore.ariaLoading = false 
      }
    })
  } catch (e: any) {
    settingStore.ariaLoading = false 
    message.error('数据格式错误！' + e.message)
  }
}
const handleAriaOff = (tip: boolean) => {
  settingStore.updateStore({ ariaState: 'local', ariaLoading: true })

  AriaChangeToLocal()
    .then((isOnline: boolean) => {
      settingStore.ariaLoading = false 
      if (tip) {
        if (isOnline == true) message.warning('已经从远程断开，并连接到本地Aria')
        else message.error('已经从远程断开，连接到本地Aria失败')
      }
    })
    .catch(() => {
      settingStore.ariaLoading = false 
      message.error('已经从远程断开，连接到本地Aria失败')
    })
}
</script>

<template>
  <div class="settingcard">
    <a-alert banner>可以 把文件直接下载到远程电脑里</a-alert>
    <div class="settingspace"></div>

    <div class="settinghead">:Aria远程下载文件保存位置</div>
    <div class="settingrow">
      <a-input tabindex="-1" :disabled="isRemote" :style="{ width: '300px' }" placeholder="粘贴远程电脑上的文件夹路径" v-model:model-value="ariaSavePath" />
      <a-popover position="bottom">
        <i class="iconfont iconbulb" />
        <template #content>
          <div>
            这里是远程电脑上的，下载文件的保存路径，需要你手动填写
            <br />
            例如：<span class="opblue">/home/user/Desktop</span>就是把文件下载到远程电脑的桌面
            <div class="hrspace"></div>
            <span class="oporg">注意：</span> windows路径分隔符为<span class="opblue">\</span>，macOS&Linux 为<span class="opblue">/</span> 千万别填错
          </div>
        </template>
      </a-popover>
    </div>
    <div class="settingspace"></div>
    <div class="settinghead">:Aria连接地址RPC IP:Port 或 域名:Port</div>
    <div class="settingrow">
      <a-input tabindex="-1" :disabled="isRemote" :style="{ width: '300px' }" placeholder="Aria2连接地址（IP:Port）" v-model:model-value="ariaUrl">
        <template #prefix> ws:// </template>
        <template #suffix> /jsonrpc </template>
      </a-input>

      <a-popover position="bottom">
        <i class="iconfont iconbulb" />
        <template #content>
          <div>
            例如：<span class="opblue">43.211.17.85:6800</span> 手动输入，只填IP和端口号，IP:Port <br />
            例如：<span class="opblue">aria2.yuming.com:6800</span> 手动输入，只填域名和端口号，IP:Port
            <br />
            小白羊会使用ws://IP:Port/jsonrpc 和 http://IP:Port/jsonrpc 连接到Aria
            <div class="hrspace"></div>
            <span class="oporg">注意：</span> 默认没勾选使用ssl，如果你的Aria2开启了https会连接失败
          </div>
        </template>
      </a-popover>
    </div>
    <div class="settingspace"></div>
    <div class="settinghead">:Aria连接密码 secret</div>
    <div class="settingrow">
      <a-input tabindex="-1" :disabled="isRemote" :style="{ width: '300px' }" placeholder="Aria2连接密码" v-model:model-value="ariaPwd" />
      <a-popover position="bottom">
        <i class="iconfont iconbulb" />
        <template #content>
          <div>
            例如：<span class="opblue">S4znWTaZYQi3cpRN</span> <br />
            必填，不支持空密码<br />
            密码不要包含特殊字符，会连接失败
          </div>
        </template>
      </a-popover>
    </div>
    <div class="settingspace"></div>
    <div class="settinghead">:Aria使用ssl链接</div>
    <div class="settingrow">
      <AntdCheckbox tabindex="-1" :checked="settingStore.ariaHttps" @change="(e:any)=>cb({ ariaHttps: e.target.checked })">使用ssl链接(wss 或 https)</AntdCheckbox>

      <a-popover position="right">
        <i class="iconfont iconbulb" />
        <template #content>
          <div>
            默认：<span class="opred">不勾选</span><br />
            勾选后，会使用ssl链接( wss 或 https )<br />
            <span class="oporg">注意：</span> 需要自己在远程aria电脑上配置好证书 <br />
            仅支持域名证书，不支持自己发布的私有证书
          </div>
        </template>
      </a-popover>
    </div>
    <div class="settingspace"></div>
    <div class="settinghead">:Aria连接状态</div>
    <div class="settingrow" v-show="isRemote == false">
      <a-button type="outline" size="small" tabindex="-1" :loading="ariaLoading" @click="handleAriaConn">当前是 本地模式，点击切换</a-button>
    </div>
    <div class="settingrow" v-show="ariaLoading == false && isRemote == false">
      <a-typography-text type="secondary">新创建的下载任务都会下载到本地，只能管理本地的下载任务</a-typography-text>
    </div>

    <div class="settingrow" v-show="isRemote">
      <a-button type="primary" size="small" tabindex="-1" :loading="ariaLoading" @click="handleAriaOff(false)">当前是 远程Aria模式，点击切换</a-button>
    </div>
    <div class="settingrow" v-show="ariaLoading == false && isRemote">
      <a-typography-text type="secondary">远程模式，新创建的下载任务都会下载到Aria服务器上，不会下载到本地，只能管理远程的下载任务。注意：远程下载时不能退出小白羊</a-typography-text>
    </div>
  </div>
</template>

<style></style>
