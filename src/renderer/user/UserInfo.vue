<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useUserStore } from '../store'
import UserDAL from '../user/userdal'
import message from '../utils/message'
import { modalUserSpace } from '../utils/modal'
export default defineComponent({
  setup() {
    const handleUserChange = (val: boolean, user_id: string) => {
      if (val) UserDAL.UserChange(user_id)
    }
    const handleRefreshUserInfo = () => {
      UserDAL.UserRefreshByUserFace(useUserStore().user_id, false).then((success) => {
        if (success) message.info('刷新用户信息成功')
        else message.error('刷新用户信息失败')
      })
    }

    const handleUserSpace = () => {
      modalUserSpace()
    }

    const handleLogOff = () => {
      UserDAL.UserLogOff(useUserStore().user_id)
    }

    const handleLogin = () => {
      if (window.WebClearCookies) {
        window.WebClearCookies({ origin: 'https://auth.aliyundrive.com', storages: ['cookies', 'localstorage'] })
      }
      useUserStore().userShowLogin = true
    }

    const userList = computed(() => {
      if (userStore.user_id) return UserDAL.GetUserList() 
      else return []
    })
    const userStore = useUserStore()

    return { handleUserChange, handleRefreshUserInfo, handleLogOff, handleLogin, userList, userStore, handleUserSpace }
  }
})
</script>

<template>
  <a-popover position="br" trigger="hover">
    <a-avatar v-if="userStore.userLogined" :size="28" style="margin-right: 12px"><img :src="userStore.GetUserToken.avatar" /></a-avatar>
    <a-avatar v-else :size="28" style="margin-right: 12px" :style="{ backgroundColor: '#3370ff' }">登录</a-avatar>

    <template #content>
      <div v-if="userStore.userLogined" style="width: 250px">
        <a-row justify="center" align="stretch">
          <a-col flex="150px">
            <span class="username">Hi {{ userStore.GetUserToken.nick_name ? userStore.GetUserToken.nick_name : userStore.GetUserToken.user_name }}</span>
          </a-col>
          <a-col flex="auto"></a-col>
          <a-col flex="50px">
            <a-button type="text" size="small" tabindex="-1" style="min-width: 46px; padding: 0 8px" title="刷新账号信息" @click="handleRefreshUserInfo">刷新</a-button>
          </a-col>
          <a-col flex="none">
            <a-button type="text" size="small" tabindex="-1" style="min-width: 46px; padding: 0 8px" title="退出该账号" @click="handleLogOff"> 退出 </a-button>
          </a-col>
        </a-row>

        <a-row justify="center" align="stretch">
          <a-col flex="150px">
            <span class="userspace">{{ userStore.GetUserToken.spaceinfo }}</span>
          </a-col>
          <a-col flex="auto"></a-col>
          <a-col flex="none">
            <a-button type="text" size="small" tabindex="-1" style="min-width: 46px; padding: 0 8px" status="warning" @click="handleUserSpace">容量详情</a-button>
          </a-col>
        </a-row>

        <a-list style="margin: 12px 0 24px 0" :max-height="300" size="small" :data="userList" class="userlist" :data-refresh="userStore.user_id">
          <template #header>
            <div class="userspace">切换到其他账号</div>
          </template>
          <template #item="{ item, index }">
            <a-list-item :key="index">
              <div style="padding-right: 8px" :title="item.spaceinfo">
                <a-progress type="circle" size="mini" status="warning" :percent="item.used_size / item.total_size" />
              </div>
              <span :title="item.user_name" style="max-width:172px;display: :inline-block;">{{ item.nick_name ? item.nick_name : item.user_name }}</span>
              <a-switch size="small" :model-value="userStore.user_id == item.user_id" title="切换到这个账号" tabindex="-1" @change="(val:any) => handleUserChange(val as any,item.user_id)">
                <template #checked> 当前 </template>
                <template #unchecked> 选我 </template>
              </a-switch>
            </a-list-item>
          </template>
        </a-list>

        <a-row justify="center">
          <a-button type="outline" size="small" tabindex="-1" style="margin: 0 0 8px 0" title="Alt+L" @click="handleLogin"> 登录一个新账号 </a-button>
        </a-row>
      </div>
      <div v-else style="width: 250px">
        <a-row align="stretch">
          <a-col flex="60px">
            <a-avatar :size="56"
              ><img
                src="data:image/png;base64,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"
            /></a-avatar>
          </a-col>
          <a-col flex="auto">
            <span class="username">Welcome</span>
            <br />
            <span class="userspace">还没登录账号?</span>
          </a-col>
        </a-row>
        <a-divider />
        <a-row justify="center">
          <a-button type="outline" size="small" tabindex="-1" style="margin: 0 0 8px 0" title="Alt+L" @click="handleLogin"> 登录一个新账号 </a-button>
        </a-row>
      </div>
    </template>
  </a-popover>
</template>
<style>
.username {
  display: inline-block;
  width: 150px;
  overflow: hidden;
  font-size: 18px;
  white-space: nowrap;
  word-break: keep-all;
  text-overflow: ellipsis;
}
.userspace {
  margin: 0;
  display: inline-block;
  max-width: 170px;
  line-height: 30px;
  overflow: hidden;
  color: #8a9ca5;
  white-space: nowrap;
  word-break: keep-all;
  text-overflow: clip;
}
.userlist {
  width: 100%;
}
.userlist .arco-list-header,
.userlist .arco-list-item {
  flex-shrink: 0;
  box-sizing: border-box;
  height: 38px;
  padding: 8px 12px !important;
  line-height: 22px !important;
  overflow: hidden;
}
.userlist .arco-list-item .arco-list-item-content {
  display: inline-flex;
  align-items: center;
  width: 100%;
}
.userlist .arco-list-item .arco-list-item-content > span {
  display: inline-block;
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  word-break: keep-all;
  text-overflow: ellipsis;
}
</style>
