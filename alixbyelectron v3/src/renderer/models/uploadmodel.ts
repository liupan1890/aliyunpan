import SettingDebug from '@/setting/settingdebug'
import { UploadedList, UploadingList } from '@/store/uploaddal'
import { ImmerReducer } from 'umi'

export interface UploadModelState {
  selectedFiles: Map<string, boolean>
  selectedFileLast: string
  totalUploadSpeed: string
  ChangUploadingTime: number
  ChangUploadedTime: number
  UploadingCount: number
  UploadingKeys: string[]
}

export interface UploadModelType {
  namespace: 'upload'
  state: UploadModelState
  reducers: {
    mRefreshUploadingList: ImmerReducer<UploadModelState>
    mRefreshTime: ImmerReducer<UploadModelState>
    mChangSelectedFile: ImmerReducer<UploadModelState>
  }
}

const UploadModel: UploadModelType = {
  namespace: 'upload',
  state: {
    selectedFiles: new Map<string, boolean>(),
    selectedFileLast: '',
    totalUploadSpeed: '',
    ChangUploadingTime: 0,
    ChangUploadedTime: 0,
    UploadingCount: 0,
    UploadingKeys: []
  },

  reducers: {
    mRefreshUploadingList(state, action) {
      const count = Math.min(SettingDebug.debugDowningListMax, UploadingList.size)
      const UploadingKeys: string[] = []
      try {
        const iter = UploadingList.keys()
        for (let i = 0, maxi = count; i < maxi; i++) {
          const UploadID = iter.next().value as string
          UploadingKeys.push(UploadID)
        }
      } catch {}
      state.UploadingKeys = UploadingKeys

      const selectedFiles = new Map<string, boolean>()
      const old = state.selectedFiles
      for (let i = 0, maxi = UploadingKeys.length; i < maxi; i++) {
        if (old.has(UploadingKeys[i])) selectedFiles.set(UploadingKeys[i], true)
      }
      state.selectedFiles = selectedFiles
      state.UploadingCount = UploadingKeys.length
      state.ChangUploadingTime = Date.now()
    },
    mRefreshTime(state, action) {
      state.ChangUploadingTime = Date.now()
      state.ChangUploadedTime = Date.now()
    },
    mChangSelectedFile(state, action) {
      state.ChangUploadingTime = Date.now()

      const UploadingKeys = state.UploadingKeys

      const file_id = action.file_id
      if (file_id === 'all') {
        state.selectedFileLast = ''
        const s = new Map<string, boolean>()
        if (state.selectedFiles.size != UploadingKeys.length) {
          for (let i = 0, maxi = UploadingKeys.length; i < maxi; i++) {
            const UploadID = UploadingKeys[i]
            s.set(UploadID, true)
          }
        }
        state.selectedFiles = s
      } else {
        let shift = action.shift as boolean
        let ctrl = action.ctrl as boolean
        if (shift) {
          if (!state.selectedFileLast || state.selectedFileLast == file_id) {
            ctrl = true
          } else {
            const s = new Map(state.selectedFiles)

            let a = -1
            let b = -1

            for (let i = 0, maxi = UploadingKeys.length; i < maxi; i++) {
              const UploadID = UploadingKeys[i]
              if (UploadID == file_id) a = i
              if (UploadID == state.selectedFileLast) b = i
              if (a > 0 && b > 0) break
            }

            if (a < 0 || b < 0 || a == b) {
              ctrl = true
            } else {
              if (a > b) [a, b] = [b, a]

              for (let n = a; n <= b; n++) {
                s.set(UploadingKeys[n], true)
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
        if (!file_id) state.selectedFiles = new Map<string, boolean>()
        else if (state.selectedFiles.has(file_id) && state.selectedFiles.size == 1) state.selectedFiles = new Map<string, boolean>()
        else state.selectedFiles = new Map<string, boolean>([[file_id, true]])

        state.selectedFileLast = file_id
      }
    }
  }
}

export default UploadModel
