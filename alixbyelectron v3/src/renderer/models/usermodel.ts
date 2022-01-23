import { ITokenInfo } from '@/store/models'
import { ImmerReducer } from 'umi'

export interface UserModelState {
  userLogined: boolean
  userID: string
}

export interface UserModelType {
  namespace: 'user'
  state: UserModelState
  effects: {}
  reducers: {
    mSaveUser: ImmerReducer<UserModelState>
  }
}

const UserModel: UserModelType = {
  namespace: 'user',
  state: {
    userID: '',
    userLogined: false
  },

  effects: {},
  reducers: {
    mSaveUser(state, action) {
      if (action.hasOwnProperty('userID')) {
        state.userID = action.userID
        state.userLogined = action.userID || false
      }
    }
  }
}

export default UserModel
