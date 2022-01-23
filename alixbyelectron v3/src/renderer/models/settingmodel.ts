import { ImmerReducer } from 'umi'

export interface SettingModelState {
  current: string
  ShareSiteList: { title: string; url: string; tip: string }[]
}

export interface SettingModelType {
  namespace: 'setting'
  state: SettingModelState
  reducers: {
    save: ImmerReducer<SettingModelState>
  }
}

const SettingModel: SettingModelType = {
  namespace: 'setting',
  state: {
    current: '',
    ShareSiteList: []
  },

  reducers: {
    save(state, action) {
      state.current = action.current
    }
  }
}

export default SettingModel
