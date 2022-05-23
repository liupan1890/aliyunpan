import { createPinia } from 'pinia'
import useAppStore from './appstore'
import useKeyboardStore from './keyboardstore'
import type { KeyboardState } from './keyboardstore'
import useLogStore from './logstore'
import useModalStore from './modalstore'
import type { ModalState } from './modalstore'
import useWinStore from './winstore'
import type { WinState } from './winstore'
import useSettingStore from '../setting/settingstore'
import useUserStore from '../user/userstore'
import type { ITokenInfo } from '../user/userstore'
import usePanTreeStore from '../pan/pantreestore'
import usePanFileStore from '../pan/panfilestore'

import useServerStore from './serverstore'
import type { IOtherShareLinkModel } from '../share/share/OtherShareStore'
import type { IShareSiteModel } from './serverstore'
import useMyShareStore from '../share/share/MyShareStore'
import useOtherShareStore from '../share/share/OtherShareStore'
import useMyFollowingStore from '../share/following/MyFollowingStore'
import useOtherFollowingStore from '../share/following/OtherFollowingStore'
import type { FollowingState } from '../share/following/OtherFollowingStore'

import useFootStore from './footstore'
import type { AsyncModel } from './footstore'

const pinia = createPinia()
export {
  useAppStore,
  useSettingStore,
  useLogStore,
  useModalStore,
  ModalState,
  useWinStore,
  WinState,
  useKeyboardStore,
  KeyboardState,
  useUserStore,
  ITokenInfo,
  usePanTreeStore,
  usePanFileStore,
  useServerStore,
  IOtherShareLinkModel,
  IShareSiteModel,
  useMyShareStore,
  useOtherShareStore,
  useOtherFollowingStore,
  FollowingState,
  useMyFollowingStore,
  useFootStore,
  AsyncModel
}
export default pinia
