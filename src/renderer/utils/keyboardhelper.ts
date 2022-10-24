import { KeyboardMessage } from '../store/keyboardstore'
import { throttle } from './debounce'


export function TestCtrlShift(key: string, event: KeyboardMessage, fun: any): boolean {
  if (event.Key.toLowerCase() == key.toLowerCase() && event.Ctrl && event.Shift && event.Repeat == false) {
    fun()
    return true
  }
  return false
}

export function TestCtrl(key: string, event: KeyboardMessage, fun: any): boolean {
  if (event.Key.toLowerCase() == key.toLowerCase() && event.Ctrl && event.Repeat == false) {
    fun()
    return true
  }
  return false
}

export function TestShift(key: string, event: KeyboardMessage, fun: any): boolean {
  if (event.Key.toLowerCase() == key.toLowerCase() && event.Shift && event.Repeat == false) {
    fun()
    return true
  }
  return false
}

export function TestAlt(key: string, event: KeyboardMessage, fun: any): boolean {
  if (event.Key.toLowerCase() == key.toLowerCase() && event.Alt && event.Repeat == false) {
    fun()
    return true
  }
  return false
}

export function TestKey(key: string, event: KeyboardMessage, fun: any): boolean {
  if (event.Key.toLowerCase() == key.toLowerCase() && event.Repeat == false && event.Ctrl == false && event.Shift == false && event.Alt == false) {
    fun()
    return true
  }
  return false
}

export function TestKeyboardScroll(event: KeyboardMessage, vlist: any, store: any): boolean {
  try {
    if (!vlist) return false
    if (event.Key.toLowerCase() == 'pagedown') {
      if (vlist.virtualListRef && vlist.virtualListRef.containerRef) {
        const containerRef = vlist.virtualListRef.containerRef
        const top = Math.min(containerRef.scrollHeight, containerRef.scrollTop + containerRef.clientHeight)
        vlist.scrollIntoView(top)
        const index = Math.min(Math.ceil(top / vlist.virtualListProps.estimatedSize), vlist.data.length - 1)
        const key = vlist.data[index][vlist.virtualListProps.itemKey]
        store.mSetFocus(key)
        return true
      }
    }
    if (event.Key.toLowerCase() == 'pageup') {
      if (vlist.virtualListRef && vlist.virtualListRef.containerRef) {
        const containerRef = vlist.virtualListRef.containerRef
        const top = Math.max(0, containerRef.scrollTop - containerRef.clientHeight)
        vlist.scrollIntoView(top)
        const index = Math.min(Math.ceil(top / vlist.virtualListProps.estimatedSize), vlist.data.length - 1)
        const key = vlist.data[index][vlist.virtualListProps.itemKey]
        store.mSetFocus(key)
        return true
      }
    }
    if (event.Key.toLowerCase() == 'home') {
      vlist.scrollIntoView({ index: 0, align: 'top' })
      const key = store.mGetFocusNext('top')
      store.mSetFocus(key)
      return true
    }
    if (event.Key.toLowerCase() == 'end') {
      vlist.scrollIntoView({ index: vlist.data.length - 1, align: 'bottom' })
      const key = store.mGetFocusNext('end')
      store.mSetFocus(key)
      return true
    }
  } catch {
    return true
  }
  return false
}

export function TestKeyboardSelect(event: KeyboardMessage, viewlist: any, store: any, enterFun: any): boolean {
  const tselect = () => {
    const key = store.mGetFocusNext('top')
    store.mKeyboardSelect(key, false, false)
    viewlist.scrollIntoView({ key: key, align: 'top' })
  }
  if (TestCtrl('home', event, tselect)) return true
  const eselect = () => {
    const key = store.mGetFocusNext('end')
    store.mKeyboardSelect(key, false, false)
    viewlist.scrollIntoView({ key: key, align: 'bottom' })
  }
  if (TestCtrl('end', event, eselect)) return true

  const cdown = () => {
    const key = store.mGetFocusNext('next')
    store.mSetFocus(key)
    viewlist.scrollIntoView({ key: key, align: 'auto' })
  }
  if (TestCtrl('arrowdown', event, cdown)) return true
  const sdown = () => {
    const key = store.mGetFocusNext('next')
    store.mKeyboardSelect(key, false, true)
    viewlist.scrollIntoView({ key: key, align: 'auto' })
  }
  if (TestShift('arrowdown', event, sdown)) return true
  const down = () => {
    const key = store.mGetFocusNext('next')
    store.mKeyboardSelect(key, false, false)
    viewlist.scrollIntoView({ key: key, align: 'auto' })
  }
  if (TestKey('arrowdown', event, down)) return true
  const cup = () => {
    const key = store.mGetFocusNext('prev')
    store.mSetFocus(key)
    viewlist.scrollIntoView({ key: key, align: 'auto' })
  }
  if (TestCtrl('arrowup', event, cup)) return true
  const sup = () => {
    const key = store.mGetFocusNext('prev')
    store.mKeyboardSelect(key, false, true)
    viewlist.scrollIntoView({ key: key, align: 'auto' })
  }
  if (TestShift('arrowup', event, sup)) return true
  const up = () => {
    const key = store.mGetFocusNext('prev')
    store.mKeyboardSelect(key, false, false)
    viewlist.scrollIntoView({ key: key, align: 'auto' })
  }
  if (TestKey('arrowup', event, up)) return true
  const enter = () => {
    const key = store.mGetFocus()
    store.mKeyboardSelect(key, false, false)
    viewlist.scrollIntoView({ key: key, align: 'auto' })
    if (enterFun) enterFun(key)
  }
  if (TestKey('enter', event, enter)) return true
  const esc = () => {
    store.mKeyboardSelect('', false, false)
  }
  if (TestKey('escape', event, esc)) return true

  const space = () => {
    const key = store.mGetFocus()
    store.mKeyboardSelect(key, false, true)
    viewlist.scrollIntoView({ key: key, align: 'auto' })
  }
  if (TestShift(' ', event, space)) return true
  const cspace = () => {
    const key = store.mGetFocus()
    store.mKeyboardSelect(key, true, false)
    viewlist.scrollIntoView({ key: key, align: 'auto' })
  }
  if (TestCtrl(' ', event, cspace)) return true

  return false
}

const menulist = ['leftpansubmove', 'leftpansubzhankai', 'leftpanmenu', 'rightpansubmove', 'rightpansubbiaoji', 'rightpansubmore', 'rightpanmenu', 'rightpantrashmenu', 'rightmysharemenu', 'rightothersharemenu', 'rightuploadingmenu', 'rightuploadedmenu']
const menuliststate = new Set()

export function onHideRightMenu(): void {
  for (let i = 0; i < menulist.length; i++) {
    const menukey = menulist[i]
    const menu = document.getElementById(menukey)
    if (menu && (menuliststate.has(menukey) || menu.style.left != '-200px')) {
      menu.style.left = '-200px'
      menu.style.opacity = '0'
      menu.style.zIndex = '-1'
      menuliststate.delete(menukey)
    }
  }
}

const hideMenu = throttle(() => {
  for (let i = 0; i < menulist.length; i++) {
    const menukey = menulist[i]
    if (menuliststate.has(menukey)) {
      const menu = document.getElementById(menukey)
      if (menu) {
        menu.style.left = '-200px'
        menu.style.opacity = '0'
        menu.style.zIndex = '-1'
      }
      menuliststate.delete(menukey)
    }
  }
}, 200)

export function onHideRightMenuScroll() {
  hideMenu()
}

export function onShowRightMenu(menukey: string, clientX: number, clientY: number): void {
  onHideRightMenuScroll()
  const menu = document.getElementById(menukey)
  if (menu) {
    menuliststate.add(menukey)
    const screenY = window.innerHeight
    const screenX = window.innerWidth

    if (menu.offsetHeight + clientY + 30 > screenY) {
      menu.style.top = (clientY - menu.offsetHeight).toString() + 'px'
    } else {
      menu.style.top = clientY.toString() + 'px'
    }
    if (menu.offsetWidth + clientX + 10 > screenX) {
      menu.style.left = (clientX - menu.offsetWidth).toString() + 'px'
    } else {
      menu.style.left = clientX.toString() + 'px'
    }

    menu.style.opacity = '1'
    menu.style.zIndex = '1001'
  }
}
