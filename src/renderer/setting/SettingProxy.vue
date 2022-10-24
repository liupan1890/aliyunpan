<script setup lang="ts">
import { ref } from 'vue'
import useSettingStore from './settingstore'
import MySwitch from '../layout/MySwitch.vue'
import message from '../utils/message'
import HttpsProxyAgent from 'https-proxy-agent'
import { SocksProxyAgent } from 'socks-proxy-agent'
import AliHttp from '../aliapi/alihttp'
const nodehttps = window.require('https')

const settingStore = useSettingStore()
const cb = (val: any) => {
  if (!Object.hasOwn(val, 'proxyUseProxy') && settingStore.proxyUseProxy) {
    val.proxyUseProxy = false
  }
  settingStore.updateStore(val)
}
const proxyLoading = ref(false)

const handleProxyConn = async () => {
  proxyLoading.value = true

  let option = {
    strictSSL: false,
    rejectUnauthorized: false,
    timeout: 5000 
  }
  const proxy = settingStore.getProxy()
  if (proxy) {
    if (settingStore.proxyType.startsWith('http')) {
      const agenth = HttpsProxyAgent(proxy)
      option = Object.assign(option, { agent: agenth })
    } else {
      const agents = new SocksProxyAgent(proxy)
      option = Object.assign(option, { agent: agents })
    }

    const result = await new Promise<string>(async (resolve) => {
      nodehttps
        .get(AliHttp.baseapi, option, (res: any) => {
          resolve('success')
        })
        .on('error', (e: any) => {
          let message = e.message || e.code || '网络错误'
          message = message.replace('ERR_SSL_INVALID_LIBRARY_(0)', '不支持双向认证的证书，仅支持单向证书')
          message = message.replace('A "socket" was not created for HTTP request before 5000ms', '网络连接超时失败')
          message = message.replace('Client network socket disconnected before secure TLS connection was established', '无法建立TLS连接')
          resolve(message)
        })
    })
    if (result == 'success') {
      message.success('代理连接成功！可以开启')
    } else {
      message.error('代理设置错误 ' + result)
    }
  } else {
    message.error('代理设置错误')
  }
  proxyLoading.value = false
}
</script>

<template>
  <div class="settingcard">
    <div class="settinghead">:代理类型</div>
    <div class="settingrow">
      <a-select tabindex="-1" :style="{ width: '168px' }" :model-value="settingStore.proxyType" :popup-container="'#SettingDiv'" @update:model-value="cb({ proxyType: $event })">
        <a-option value="none">None</a-option>
        <a-option value="http">HTTP</a-option>
        <a-option value="https">HTTPS</a-option>
        <a-option value="socks5">SOCKS5</a-option>
        <a-option value="socks5h">SOCKS5H</a-option>
      </a-select>
      <a-popover position="right">
        <i class="iconfont iconbulb" />
        <template #content>
          <div>
            默认：<span class="opred">HTTP</span>
            <hr />
            代理服务器支持的代理类型
          </div>
        </template>
      </a-popover>
    </div>
    <div class="settingspace"></div>

    <a-row class="grid-demo">
      <a-col flex="252px">
        <div class="settinghead">:代理地址(Host IP 或 域名)</div>
        <div class="settingrow">
          <a-input tabindex="-1" :style="{ width: '168px' }" placeholder="代理主机的IP或域名" :model-value="settingStore.proxyHost" @update:model-value="cb({ proxyHost: $event })" />
        </div>
      </a-col>
      <a-col flex="180px">
        <div class="settinghead">:代理端口(Port)</div>
        <div class="settingrow">
          <a-input-number tabindex="-1" :style="{ width: '168px' }" hide-button placeholder="常见 8888,1080" :model-value="settingStore.proxyPort" @update:model-value="cb({ proxyPort: $event })" />
        </div>
      </a-col>
      <a-col flex="auto"> </a-col>
    </a-row>
    <div class="settingspace"></div>
    <a-row class="grid-demo">
      <a-col flex="252px">
        <div class="settinghead">:用户名</div>
        <div class="settingrow">
          <a-input tabindex="-1" :style="{ width: '168px' }" placeholder="没有不填" :model-value="settingStore.proxyUserName" @update:model-value="cb({ proxyUserName: $event })" />
        </div>
      </a-col>
      <a-col flex="180px">
        <div class="settinghead">:密码</div>
        <div class="settingrow">
          <a-input tabindex="-1" :style="{ width: '168px' }" placeholder="没有不填" :model-value="settingStore.proxyPassword" @update:model-value="cb({ proxyPassword: $event })" />
        </div>
      </a-col>
      <a-col flex="auto"> </a-col>
    </a-row>

    <div class="settingspace"></div>
    <div class="settingrow">
      <a-button type="primary" size="small" tabindex="-1" :loading="proxyLoading" @click="handleProxyConn">测试</a-button>
      <span style="margin-left: 8px; font-size: 12px; color: var(--color-text-3)">请先测试成功后再启用代理</span>
    </div>
    <div class="settingspace"></div>
    <div class="settinghead">:是否启用代理</div>
    <div class="settingrow">
      <MySwitch :value="settingStore.proxyUseProxy" @update:value="cb({ proxyUseProxy: $event })">使用代理访问网络</MySwitch>
      <a-popover position="right">
        <i class="iconfont iconbulb" />
        <template #content>
          <div>
            默认：<span class="opred">关闭</span>
            <hr />
            支持http/https/sock5代理，<br />
            胡乱设置会导致小白羊不能联网<br />
            <hr />
            当前http和sock5代理(非TLS)兼容较好<br /><br />
            https代理，只支持单向证书模式的代理，<br />
            因为双向证书模式需要附加证书文件所以不支持
            <hr />
            开启后会强制小白羊的所有请求使用代理(包括上传/下载文件)<br />不会影响电脑上的其他软件
          </div>
        </template>
      </a-popover>
    </div>
  </div>
</template>

<style></style>
