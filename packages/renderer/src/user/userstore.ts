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

  
  pic_drive_id: string 
}

export interface UserState {
  userID: string
  userLogined: boolean
  userShowLogin: boolean
}

const useUserStore = defineStore('user', {
  state: (): UserState => ({
    userID: '',
    userLogined: false,
    userShowLogin: false
  }),

  getters: {
    GetUserToken(state: UserState): ITokenInfo {
      return UserDAL.GetUserToken(state.userID)
    }
  },

  actions: {
    userLogin(userID: string) {
      this.userID = userID
      this.userLogined = true
    },
    userLogOff() {
      this.userID = ''
      this.userLogined = false
    }
  }
})

export default useUserStore
