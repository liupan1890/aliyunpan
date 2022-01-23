import SettingDebug from '@/setting/settingdebug'
import { ImmerReducer } from 'umi'
import { DownedList, DowningList } from '../store/downdal'


export interface DownModelState {
  selectedFiles: Map<string, boolean>
  selectedFileLast: string
  totalDownSpeed: string
  ChangDowningTime: number
  ChangDownedTime: number
  DowningCount: number
  DowningKeys: string[]
}

export interface DownModelType {
  namespace: 'down'
  state: DownModelState
  reducers: {
    mRefreshDowningList: ImmerReducer<DownModelState>
    mRefreshTime: ImmerReducer<DownModelState>
    mChangSelectedFile: ImmerReducer<DownModelState>
  }
}

const DownModel: DownModelType = {
  namespace: 'down',
  state: {
    selectedFiles: new Map<string, boolean>(),
    selectedFileLast: '',
    totalDownSpeed: '',
    ChangDowningTime: 0,
    ChangDownedTime: 0,
    DowningCount: 0,
    DowningKeys: []
  },

  reducers: {
    mRefreshDowningList(state, action) {
      const count = Math.min(SettingDebug.debugDowningListMax, DowningList.size)
      const DowningKeys: string[] = []
      try {
        const iter = DowningList.keys()
        for (let i = 0, maxi = count; i < maxi; i++) {
          const DownID = iter.next().value as string
          DowningKeys.push(DownID)
        }
      } catch {}
      state.DowningKeys = DowningKeys

      const selectedFiles = new Map<string, boolean>()
      const old = state.selectedFiles
      for (let i = 0, maxi = DowningKeys.length; i < maxi; i++) {
        if (old.has(DowningKeys[i])) selectedFiles.set(DowningKeys[i], true)
      }
      state.selectedFiles = selectedFiles
      state.DowningCount = DowningKeys.length
      state.ChangDowningTime = Date.now()
    },
    mRefreshTime(state, action) {
      state.ChangDowningTime = Date.now()
      state.ChangDownedTime = Date.now()
    },
    mChangSelectedFile(state, action) {
      state.ChangDowningTime = Date.now()
      const DowningKeys = state.DowningKeys

      const file_id = action.file_id
      if (file_id === 'all') {
        state.selectedFileLast = ''
        const s = new Map<string, boolean>()
        if (state.selectedFiles.size != DowningKeys.length) {
          for (let i = 0, maxi = DowningKeys.length; i < maxi; i++) {
            const DownID = DowningKeys[i]
            s.set(DownID, true)
          }
        }
        state.selectedFiles = s
      } else {
        let shift = action.shift as boolean
        let ctrl = action.ctrl as boolean
        let add = action.add as boolean
        if (shift) {
          if (!state.selectedFileLast || state.selectedFileLast == file_id) {
            ctrl = true
          } else {
            const s = new Map(state.selectedFiles)

            let a = -1
            let b = -1

            for (let i = 0, maxi = DowningKeys.length; i < maxi; i++) {
              const DownID = DowningKeys[i]
              if (DownID == file_id) a = i
              if (DownID == state.selectedFileLast) b = i
              if (a > 0 && b > 0) break
            }

            if (a < 0 || b < 0 || a == b) {
              ctrl = true
            } else {
              if (a > b) [a, b] = [b, a]
              for (let n = a; n <= b; n++) {
                s.set(DowningKeys[n], true)
              }
              state.selectedFileLast = file_id
              Object.freeze(s)
              state.selectedFiles = s
              return
            }
          }
        }

        if (ctrl) {
          if (state.selectedFiles.has(file_id)) state.selectedFiles.delete(file_id)
          else state.selectedFiles.set(file_id, true)
          state.selectedFileLast = file_id
          return
        }
        if (add) {
          state.selectedFiles.set(file_id, true)
          state.selectedFileLast = file_id
          return
        }
        if (!file_id) state.selectedFiles = new Map<string, boolean>()
        else if (state.selectedFiles.has(file_id) && state.selectedFiles.size == 1) state.selectedFiles = new Map<string, boolean>()
        else state.selectedFiles = new Map<string, boolean>([[file_id, true]])

        state.selectedFileLast = file_id
      }
    }
  }
}

export default DownModel
