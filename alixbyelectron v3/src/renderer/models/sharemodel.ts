import { IAliShareItem } from '@/aliapi/models'
import AliShareList, { IAliShareResp } from '@/aliapi/sharelist'
import { IShareLinkModel } from '@/store/models'

import UserDAL from '@/store/userdal'
import { Effect, ImmerReducer } from 'umi'

export interface ShareModelState {
  current: string

  ShareSiteList: { title: string; url: string; tip: string }[]
  ShareListShow: IAliShareItem[]
  ShareList: IAliShareItem[]
  ShareListOrder: string
  ShareListLoading: boolean
  SharePreviewCount: number
  ShareDownloadCount: number
  ShareSaveCount: number
  selectedShares: Map<string, boolean>
  selectedShareLast: string

  OtherShareList: IShareLinkModel[]
  selectedOtherShares: Map<string, boolean>
  selectedOtherShareLast: string

  refresh: number
}

export interface ShareModelType {
  namespace: 'share'
  state: ShareModelState
  effects: {
    aRefresh: Effect
  }
  reducers: {
    save: ImmerReducer<ShareModelState>
    mSaveShareSiteList: ImmerReducer<ShareModelState>
    mClearShare: ImmerReducer<ShareModelState>
    mSaveShareLoading: ImmerReducer<ShareModelState>
    mSaveShareList: ImmerReducer<ShareModelState>
    mOrderbyShare: ImmerReducer<ShareModelState>
    mSearchShare: ImmerReducer<ShareModelState>
    mChangSelectedShare: ImmerReducer<ShareModelState>

    mSaveOtherShareList: ImmerReducer<ShareModelState>
    mChangSelectedOtherShare: ImmerReducer<ShareModelState>
  }
}

const ShareModel: ShareModelType = {
  namespace: 'share',
  state: {
    current: '',
    ShareSiteList: [],
    ShareListShow: [],
    ShareList: [],
    ShareListOrder: localStorage.getItem('shareorder') || 'sharetime',
    ShareListLoading: false,
    SharePreviewCount: 0,
    ShareDownloadCount: 0,
    ShareSaveCount: 0,
    selectedShares: new Map<string, boolean>(),
    selectedShareLast: '',

    OtherShareList: [],
    selectedOtherShares: new Map<string, boolean>(),
    selectedOtherShareLast: '',
    refresh: 0
  },
  effects: {
    *aRefresh({}, { call, put, select }) {
      const userID: string = yield select((state: any) => state.user.userID)
      const token = UserDAL.GetUserToken(userID)
      if (!token || !token.access_token) {
        yield put({ type: 'mClearShare' })
        return false
      }
      yield put({ type: 'mSaveShareLoading', loading: true })
      let data: IAliShareResp = yield call(AliShareList.ApiShareListAll, userID)
      yield put({ type: 'mSaveShareList', items: data.items })
      return true
    }
  },
  reducers: {
    mSaveShareSiteList(state, action) {
      state.ShareSiteList = action.ShareSiteList || []
      state.refresh = state.refresh + 1
    },
    mClearShare(state, action) {
      state.ShareListShow = []
      state.ShareList = []
      state.ShareListLoading = false
      state.selectedShares = new Map<string, boolean>()
      state.selectedShareLast = ''
      state.refresh = state.refresh + 1
    },
    mSaveShareLoading(state, action) {
      state.ShareListLoading = action.loading
      state.refresh = state.refresh + 1
    },
    mSaveShareList(state, action) {
      let items = action.items as IAliShareItem[]
      state.ShareList = items
      let orderby = state.ShareListOrder
      if (orderby == 'sharetime') items = items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      if (orderby == 'preview') items = items.sort((a, b) => b.preview_count - a.preview_count)
      if (orderby == 'download') items = items.sort((a, b) => b.download_count - a.download_count)
      if (orderby == 'save') items = items.sort((a, b) => b.save_count - a.save_count)

      state.ShareListShow = items
      state.ShareListLoading = false

      const selectedShares = new Map<string, boolean>()
      const selected = state.selectedShares
      let SharePreviewCount = 0
      let ShareDownloadCount = 0
      let ShareSaveCount = 0
      for (let i = 0, maxi = items.length; i < maxi; i++) {
        const item = items[i]
        SharePreviewCount += item.preview_count
        ShareDownloadCount += item.download_count
        ShareSaveCount += item.save_count
        if (selected.has(item.share_id)) selectedShares.set(item.share_id, true)
      }
      state.SharePreviewCount = SharePreviewCount
      state.ShareDownloadCount = ShareDownloadCount
      state.ShareSaveCount = ShareSaveCount
      state.selectedShares = selectedShares
      state.refresh = state.refresh + 1
    },
    mOrderbyShare(state, action) {
      let orderby = state.ShareListOrder
      if (action.orderby == 'sharetime') orderby = 'sharetime'
      if (action.orderby == 'preview') orderby = 'preview'
      if (action.orderby == 'download') orderby = 'download'
      if (action.orderby == 'save') orderby = 'save'

      localStorage.setItem('shareorder', orderby)
      state.ShareListOrder = orderby
      let items = state.ShareListShow
      if (orderby == 'sharetime') items = items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      if (orderby == 'preview') items = items.sort((a, b) => b.preview_count - a.preview_count)
      if (orderby == 'download') items = items.sort((a, b) => b.download_count - a.download_count)
      if (orderby == 'save') items = items.sort((a, b) => b.save_count - a.save_count)
      state.ShareListShow = items
      state.refresh = state.refresh + 1
    },

    mChangSelectedShare(state, action) {
      if (state.ShareListLoading) return
      const share_id = action.file_id
      if (share_id === 'all') {
        state.selectedShareLast = ''
        const s = new Map<string, boolean>()
        if (state.selectedShares.size != state.ShareListShow.length) {
          const children = state.ShareListShow
          for (let i = 0, maxi = children.length; i < maxi; i++) {
            s.set(children[i].share_id, true)
          }
        }
        state.selectedShares = s
        state.refresh = state.refresh + 1
        return
      } else {
        let shift = action.shift as boolean
        let ctrl = action.ctrl as boolean
        if (shift) {
          if (!state.selectedShareLast || state.selectedShareLast == share_id) {
            ctrl = true
          } else {
            const s = new Map(state.selectedShares)
            const children = state.ShareListShow
            let a = -1
            let b = -1
            for (let i = 0, maxi = children.length; i < maxi; i++) {
              if (children[i].share_id == share_id) a = i
              if (children[i].share_id == state.selectedShareLast) b = i
              if (a > 0 && b > 0) break
            }
            if (a < 0 || b < 0 || a == b) {
              ctrl = true
            } else {
              if (a > b) [a, b] = [b, a]
              for (let n = a; n <= b; n++) {
                s.set(children[n].share_id, true)
              }
              state.selectedShareLast = share_id
              Object.freeze(s)
              state.selectedShares = s
              state.refresh = state.refresh + 1
              return
            }
          }
        }

        if (ctrl) {
          if (state.selectedShares.has(share_id)) state.selectedShares.delete(share_id)
          else state.selectedShares.set(share_id, true)
          state.selectedShareLast = share_id
          state.refresh = state.refresh + 1
          return
        }
        if (!share_id) state.selectedShares = new Map<string, boolean>()
        else if (action.forceselect) state.selectedShares = new Map<string, boolean>([[share_id, true]])
        else if (state.selectedShares.has(share_id) && state.selectedShares.size == 1) state.selectedShares = new Map<string, boolean>()
        else state.selectedShares = new Map<string, boolean>([[share_id, true]])

        state.selectedShareLast = share_id
        state.refresh = state.refresh + 1
      }
    },

    mSearchShare(state, action) {
      let itemsOld = state.ShareList
      let items: IAliShareItem[] = []
      let key = action.key.trim().toLowerCase()
      for (let i = 0, maxi = itemsOld.length; i < maxi; i++) {
        if (itemsOld[i].share_name.toLowerCase().indexOf(key) >= 0) items.push(itemsOld[i])
      }

      let orderby = localStorage.getItem('shareorder') || 'sharetime'
      if (orderby == 'sharetime') items = items.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      if (orderby == 'preview') items = items.sort((a, b) => b.preview_count - a.preview_count)
      if (orderby == 'download') items = items.sort((a, b) => b.download_count - a.download_count)
      if (orderby == 'save') items = items.sort((a, b) => b.save_count - a.save_count)

      state.ShareListShow = items
      state.ShareListLoading = false

      const selectedShares = new Map<string, boolean>()
      const selected = state.selectedShares
      let SharePreviewCount = 0
      let ShareDownloadCount = 0
      let ShareSaveCount = 0
      for (let i = 0, maxi = items.length; i < maxi; i++) {
        const item = items[i]
        SharePreviewCount += item.preview_count
        ShareDownloadCount += item.download_count
        ShareSaveCount += item.save_count
        if (selected.has(item.share_id)) selectedShares.set(item.share_id, true)
      }
      state.SharePreviewCount = SharePreviewCount
      state.ShareDownloadCount = ShareDownloadCount
      state.ShareSaveCount = ShareSaveCount
      state.selectedShares = selectedShares
      state.refresh = state.refresh + 1
    },

    mSaveOtherShareList(state, action) {
      state.OtherShareList = action.items

      const selectedOtherShares = new Map<string, boolean>()
      const selected = state.selectedOtherShares
      for (let i = 0, maxi = action.items.length; i < maxi; i++) {
        if (selected.has(action.items[i].share_id)) selectedOtherShares.set(action.items[i].share_id, true)
      }
      state.selectedOtherShares = selectedOtherShares
      state.refresh = state.refresh + 1
    },
    mChangSelectedOtherShare(state, action) {
      const share_id = action.file_id
      if (share_id === 'all') {
        state.selectedOtherShareLast = ''
        const s = new Map<string, boolean>()
        if (state.selectedOtherShares.size != state.OtherShareList.length) {
          const children = state.OtherShareList
          for (let i = 0, maxi = children.length; i < maxi; i++) {
            s.set(children[i].share_id, true)
          }
        }
        state.selectedOtherShares = s
        state.refresh = state.refresh + 1
        return
      } else {
        let shift = action.shift as boolean
        let ctrl = action.ctrl as boolean
        if (shift) {
          if (!state.selectedOtherShareLast || state.selectedOtherShareLast == share_id) {
            ctrl = true
          } else {
            const s = new Map(state.selectedOtherShares)
            const children = state.OtherShareList
            let a = -1
            let b = -1
            for (let i = 0, maxi = children.length; i < maxi; i++) {
              if (children[i].share_id == share_id) a = i
              if (children[i].share_id == state.selectedOtherShareLast) b = i
              if (a > 0 && b > 0) break
            }
            if (a < 0 || b < 0 || a == b) {
              ctrl = true
            } else {
              if (a > b) [a, b] = [b, a]
              for (let n = a; n <= b; n++) {
                s.set(children[n].share_id, true)
              }
              state.selectedOtherShareLast = share_id
              Object.freeze(s)
              state.selectedOtherShares = s
              state.refresh = state.refresh + 1
              return
            }
          }
        }

        if (ctrl) {
          if (state.selectedOtherShares.has(share_id)) state.selectedOtherShares.delete(share_id)
          else state.selectedOtherShares.set(share_id, true)
          state.selectedOtherShareLast = share_id
          state.refresh = state.refresh + 1
          return
        }
        if (!share_id) state.selectedOtherShares = new Map<string, boolean>()
        else if (action.forceselect) state.selectedOtherShares = new Map<string, boolean>([[share_id, true]])
        else if (state.selectedOtherShares.has(share_id) && state.selectedOtherShares.size == 1) state.selectedOtherShares = new Map<string, boolean>()
        else state.selectedOtherShares = new Map<string, boolean>([[share_id, true]])

        state.selectedOtherShareLast = share_id
        state.refresh = state.refresh + 1
      }
    },

    save(state, action) {
      state.current = action.current
    }
  }
}

export default ShareModel
