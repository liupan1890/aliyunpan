import { ITokenInfo } from '@/store/models'
import { Effect, ImmerReducer, Subscription } from 'umi'

export interface IPageOffice {
  user_id: string
  drive_id: string
  file_id: string
  name: string
  mode: string
  token: ITokenInfo
  data: any
}

export interface GlobalModelState {
  showPage: string
  pageOffice: IPageOffice | undefined
  pageImage: IPageOffice | undefined
  pageCode: IPageOffice | undefined
  pageVideoXBT: IPageOffice | undefined
  currentMenu: string
  currentPage: string
  showUserInfo: boolean
}

export interface GlobalModelType {
  namespace: 'global'
  state: GlobalModelState
  effects: {
    query: Effect
  }
  reducers: {
    save: ImmerReducer<GlobalModelState>
    error: ImmerReducer<GlobalModelState>
  }
  subscriptions: {
    setup: Subscription
  }
}

let downPage = 'DowningRight'
let sharePage = 'MyShareRight'
let rssPage = 'RssFileSync'
let settingPage = 'SettingDown'

const GlobalModel: GlobalModelType = {
  namespace: 'global',
  state: {
    showPage: '',
    pageOffice: undefined,
    pageImage: undefined,
    pageCode: undefined,
    pageVideoXBT: undefined,
    currentMenu: 'pan',
    currentPage: 'panright',
    showUserInfo: false
  },

  effects: {
    *query({ payload }, { call, put }) {}
  },
  reducers: {
    save(state, action) {
      if (action.hasOwnProperty('currentMenu')) {
        state.currentMenu = action.currentMenu
        if (state.currentMenu == 'pan') state.currentPage = 'panright'
        else if (state.currentMenu == 'pic') state.currentPage = 'picright'
        else if (state.currentMenu == 'down') state.currentPage = downPage
        else if (state.currentMenu == 'share') state.currentPage = sharePage
        else if (state.currentMenu == 'rss') state.currentPage = rssPage
        else if (state.currentMenu == 'setting') state.currentPage = settingPage
      }
      if (action.hasOwnProperty('currentPage')) {
        state.currentPage = action.currentPage
        if (state.currentMenu == 'down') downPage = state.currentPage
        else if (state.currentMenu == 'share') sharePage = state.currentPage
        else if (state.currentMenu == 'rss') rssPage = state.currentPage
        else if (state.currentMenu == 'setting') settingPage = state.currentPage
      }
      
      if (action.hasOwnProperty('showUserInfo')) state.showUserInfo = action.showUserInfo

      if (action.hasOwnProperty('showPage')) {
        state.showPage = action.showPage
        state.pageOffice = action.pageOffice
        state.pageImage = action.pageImage
        state.pageCode = action.pageCode
        state.pageVideoXBT = action.pageVideoXBT
      }
    },
    error(state, action) {
      throw new Error('testerror')
    }
  },
  subscriptions: {
    setup({ dispatch, history }) {}
  }
}

export default GlobalModel
