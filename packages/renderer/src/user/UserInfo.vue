<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useUserStore } from '@/store'
import UserDAL from '@/user/userdal'
import message from '@/utils/message'
import UserLogin from './UserLogin.vue'

export default defineComponent({
  setup() {
    const handleUserChange = (val: boolean, userID: string) => {
      if (val) UserDAL.UserChange(userID)
    }
    const handleRefreshUserInfo = () => {
      UserDAL.UserRefreshByUserFace(useUserStore().userID, true).then(() => {
        message.info('刷新用户信息成功')
      })
    }
    const handleLogOff = () => {
      UserDAL.UserLogOff(useUserStore().userID)
    }

    const handleLogin = () => {
      useUserStore().userShowLogin = true
    }

    const userList = computed(() => {
      if (userStore.userID) return UserDAL.GetUserList() 
      else return []
    })
    const userStore = useUserStore()

    return { handleUserChange, handleRefreshUserInfo, handleLogOff, handleLogin, userList, userStore }
  },
  components: { UserLogin }
})
</script>

<template>
  <a-popover position="br">
    <a-avatar v-if="userStore.userLogined" :size="28" style="margin-right: 12px"><img :src="userStore.GetUserToken.avatar" /></a-avatar>
    <a-avatar v-else :size="28" style="margin-right: 12px" :style="{ backgroundColor: '#3370ff' }">登录</a-avatar>

    <template #content>
      <div v-if="userStore.userLogined" style="width: 250px">
        <a-row justify="center" align="stretch">
          <a-col flex="60px">
            <a-avatar :size="56" style="cursor: default"><img :src="userStore.GetUserToken.avatar" /></a-avatar>
          </a-col>
          <a-col flex="auto">
            <span class="username">Hi {{ userStore.GetUserToken.nick_name ? userStore.GetUserToken.nick_name : userStore.GetUserToken.user_name }}</span>
            <br />
            <span style="margin-top: 4px">{{ userStore.GetUserToken.spaceinfo }}</span>
          </a-col>

          <a-col flex="none">
            <a-button type="text" size="small" tabindex="-1" style="min-width: 46px; padding: 0 8px" title="刷新账号信息" @click="handleRefreshUserInfo"><i class="iconfont iconsync" /></a-button>
            <br />
            <a-button type="text" size="small" tabindex="-1" style="min-width: 46px; padding: 0 8px" title="退出该账号" @click="handleLogOff"> 退出 </a-button>
          </a-col>
        </a-row>

        <a-list style="margin: 24px 0" :max-height="300" size="small" :data="userList" class="userlist" :data-refresh="userStore.userID">
          <template #header>
            <div class="userspace">切换到其他账号</div>
          </template>
          <template #item="{ item, index }">
            <a-list-item :key="index">
              <div style="padding-right: 8px" :title="item.spaceinfo">
                <a-progress type="circle" size="mini" status="warning" :percent="item.used_size / item.total_size" />
              </div>
              <span :title="item.user_name">{{ item.nick_name ? item.nick_name : item.user_name }}</span>
              <a-switch size="small" :model-value="userStore.userID == item.user_id" title="切换到这个账号" @change="(val:any) => handleUserChange(val as any,item.user_id)" tabindex="-1">
                <template #checked> 当前 </template>
                <template #unchecked> 选我 </template>
              </a-switch>
            </a-list-item>
          </template>
        </a-list>

        <a-row justify="center">
          <a-button type="outline" size="small" tabindex="-1" style="margin: 0 0 8px 0" @click="handleLogin" title="Alt+L"> 登录一个新账号 </a-button>
        </a-row>
      </div>
      <div v-else style="width: 250px">
        <a-row align="stretch">
          <a-col flex="60px">
            <a-avatar :size="56"><img src="/userface.png" /></a-avatar>
          </a-col>
          <a-col flex="auto">
            <span class="username">Welcome</span>
            <br />
            <span class="userspace">还没登录账号?</span>
          </a-col>
        </a-row>
        <a-divider />
        <a-row justify="center">
          <a-button type="outline" size="small" tabindex="-1" style="margin: 0 0 8px 0" @click="handleLogin" title="Alt+L"> 登录一个新账号 </a-button>
        </a-row>
      </div>
    </template>
  </a-popover>
</template>
<style>
.username {
  display: inline-block;
  width: 130px;
  overflow: hidden;
  font-size: 18px;
  white-space: nowrap;
  word-break: keep-all;
  text-overflow: ellipsis;
}
.userspace {
  display: inline-block;
  width: 130px;
  overflow: hidden;
  color: #8a9ca5;
  white-space: nowrap;
  word-break: keep-all;
  text-overflow: ellipsis;
}
.userlist {
  width: 250px;
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
