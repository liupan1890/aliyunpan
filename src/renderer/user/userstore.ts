import { defineStore } from 'pinia'
import UserDAL from './userdal'


export interface ITokenInfo {
  tokenfrom: 'token' | 'account'

  
  access_token: string
  refresh_token: string
  expires_in: number 
  token_type: string 
  user_id: string
  user_name: string 
  avatar: string 
  nick_name: string 
  default_drive_id: string 
  default_sbox_drive_id: string 
  role: string
  status: string
  expire_time: string 
  state: string
  pin_setup: boolean
  is_first_login: boolean
  need_rp_verify: boolean

  
  name: string 
  spu_id: string 
  is_expires: boolean 
  used_size: number 
  total_size: number 
  spaceinfo: string 
  vipname: string 
  vipexpire: string 

  
  pic_drive_id: string 
}

export interface UserState {
  user_id: string
  userLogined: boolean
  userShowLogin: boolean
}

const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user_id: '',
    userLogined: false,
    userShowLogin: false
  }),

  getters: {
    GetUserToken(state: UserState): ITokenInfo {
      return UserDAL.GetUserToken(state.user_id)
    }
  },

  actions: {
    userLogin(user_id: string) {
      this.user_id = user_id
      this.userLogined = true
    },
    userLogOff() {
      this.user_id = ''
      this.userLogined = false
    }
  }
})

export default useUserStore
