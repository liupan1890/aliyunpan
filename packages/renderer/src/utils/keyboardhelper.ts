import { KeyboardMessage } from '@/store/keyboardstore'


export function TestCtrlShift(key: string, event: KeyboardMessage, fun: any) {
  if (event.Key.toLowerCase() == key.toLowerCase() && event.Ctrl && event.Shift && event.Repeat == false) {
    fun()
    return true
  }
  return false
}

export function TestCtrl(key: string, event: KeyboardMessage, fun: any) {
  if (event.Key.toLowerCase() == key.toLowerCase() && event.Ctrl && event.Repeat == false) {
    fun()
    return true
  }
  return false
}

export function TestShift(key: string, event: KeyboardMessage, fun: any) {
  if (event.Key.toLowerCase() == key.toLowerCase() && event.Shift && event.Repeat == false) {
    fun()
    return true
  }
  return false
}

export function TestAlt(key: string, event: KeyboardMessage, fun: any) {
  if (event.Key.toLowerCase() == key.toLowerCase() && event.Alt && event.Repeat == false) {
    fun()
    return true
  }
  return false
}

export function TestKey(key: string, event: KeyboardMessage, fun: any) {
  if (event.Key.toLowerCase() == key.toLowerCase() && event.Repeat == false && event.Ctrl == false && event.Shift == false && event.Alt == false) {
    fun()
    return true
  }
  return false
}
/** pagedown pageup home end */
export function TestKeyboardScroll(event: KeyboardMessage, vlist: any, store: any) {
  try {
    let element = vlist.$el
    if (!element) return false
    let alist = element.getElementsByClassName('arco-list')
    if (alist.length == 0) return false
    element = alist[0]
    
    

    
    if (element.children[0].className.indexOf('arco-list-virtual') > 0) element = element.children[0] 

    if (event.Key.toLowerCase() == 'pagedown') {
      element.scrollBy(0, element.clientHeight)
      setTimeout(() => {
        if (vlist.virtualListRef && vlist.virtualListRef.viewportRef) {
          let doc = vlist.virtualListRef.viewportRef.getElementsByClassName('listitemdiv')
          if (doc && doc.length > 0) {
            let id = doc[doc.length > 1 ? 1 : 0].getAttribute('data-id')
            store.mSetFocus(id)
          }
        }
      }, 300)
      return true
    }
    if (event.Key.toLowerCase() == 'pageup') {
      element.scrollBy(0, -element.clientHeight)
      setTimeout(() => {
        if (vlist.virtualListRef && vlist.virtualListRef.viewportRef) {
          let doc = vlist.virtualListRef.viewportRef.getElementsByClassName('listitemdiv')
          if (doc && doc.length > 0) {
            let id = doc[doc.length > 1 ? 1 : 0].getAttribute('data-id')
            store.mSetFocus(id)
          }
        }
      }, 300)
      return true
    }
    if (event.Key.toLowerCase() == 'home') {
      element.scrollTo(0, 0)
      let key = store.mGetFocusNext('top')
      store.mSetFocus(key)
      return true
    }
    if (event.Key.toLowerCase() == 'end') {
      element.scrollTo(0, element.scrollHeight)
      let key = store.mGetFocusNext('end')
      store.mSetFocus(key)
      return true
    }
  } catch {
    return true
  }
  return false
}

export function TestKeyboardSelect(event: KeyboardMessage, viewlist: any, store: any, enterFun: any) {
  const tselect = () => {
    let key = store.mGetFocusNext('top')
    store.mKeyboardSelect(key, false, false)
    viewlist.scrollIntoView({ key: key, align: 'auto' })
  }
  if (TestCtrl('t', event, tselect)) return true
  const eselect = () => {
    let key = store.mGetFocusNext('end')
    store.mKeyboardSelect(key, false, false)
    viewlist.scrollIntoView({ key: key, align: 'auto' })
  }
  if (TestCtrl('e', event, eselect)) return true

  const cdown = () => {
    let key = store.mGetFocusNext('next')
    store.mSetFocus(key)
    viewlist.scrollIntoView({ key: key, align: 'auto' })
  }
  if (TestCtrl('arrowdown', event, cdown)) return true
  const sdown = () => {
    let key = store.mGetFocusNext('next')
    store.mKeyboardSelect(key, false, true)
    viewlist.scrollIntoView({ key: key, align: 'auto' })
  }
  if (TestShift('arrowdown', event, sdown)) return true
  const down = () => {
    let key = store.mGetFocusNext('next')
    store.mKeyboardSelect(key, false, false)
    viewlist.scrollIntoView({ key: key, align: 'auto' })
  }
  if (TestKey('arrowdown', event, down)) return true
  const cup = () => {
    let key = store.mGetFocusNext('prev')
    store.mSetFocus(key)
    viewlist.scrollIntoView({ key: key, align: 'auto' })
  }
  if (TestCtrl('arrowup', event, cup)) return true
  const sup = () => {
    let key = store.mGetFocusNext('prev')
    store.mKeyboardSelect(key, false, true)
    viewlist.scrollIntoView({ key: key, align: 'auto' })
  }
  if (TestShift('arrowup', event, sup)) return true
  const up = () => {
    let key = store.mGetFocusNext('prev')
    store.mKeyboardSelect(key, false, false)
    viewlist.scrollIntoView({ key: key, align: 'auto' })
  }
  if (TestKey('arrowup', event, up)) return true
  const enter = () => {
    let key = store.mGetFocus()
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
    let key = store.mGetFocus()
    store.mKeyboardSelect(key, false, true)
    viewlist.scrollIntoView({ key: key, align: 'auto' })
  }
  if (TestShift(' ', event, space)) return true
  const cspace = () => {
    let key = store.mGetFocus()
    store.mKeyboardSelect(key, true, false)
    viewlist.scrollIntoView({ key: key, align: 'auto' })
  }
  if (TestCtrl(' ', event, cspace)) return true
}

export function RefreshScroll(element: any) {
  try {
    let alist = element.getElementsByClassName('arco-list')
    if (alist.length == 0) return false
    element = alist[0]
    if (element.children[0].className.indexOf('arco-list-virtual') > 0) element = element.children[0] 

    element.scrollBy(0, 1)
    element.scrollBy(0, -1)
  } catch {}
}

export function RefreshScrollTo(element: any, top: number) {
  try {
    let alist = element.getElementsByClassName('arco-list')
    if (alist.length == 0) return false
    element = alist[0]
    if (element.children[0].className.indexOf('arco-list-virtual') > 0) element = element.children[0] 

    element.scrollTo(0, top)
  } catch {}
}

const menulist = ['leftpansubmove', 'leftpansubzhankai', 'leftpanmenu', 'rightpansubmove', 'rightpansubbiaoji', 'rightpansubmore', 'rightpanmenu', 'rightpantrashmenu', 'rightmysharemenu', 'rightothersharemenu']
const menuliststate = new Set()

export function onHideRightMenu() {
  for (let i = 0; i < menulist.length; i++) {
    let menukey = menulist[i]
    let menu = document.getElementById(menukey)
    if (menu && (menuliststate.has(menukey) || menu.style.left != '-200px')) {
      menu.style.left = '-200px'
      menu.style.opacity = '0'
      menu.style.zIndex = '-1'
      menuliststate.delete(menukey)
    }
  }
}

export function onHideRightMenuScroll() {
  for (let i = 0; i < menulist.length; i++) {
    let menukey = menulist[i]
    if (menuliststate.has(menukey)) {
      let menu = document.getElementById(menukey)
      if (menu) {
        menu.style.left = '-200px'
        menu.style.opacity = '0'
        menu.style.zIndex = '-1'
      }
      menuliststate.delete(menukey)
    }
  }
}

export function onShowRightMenu(menukey: string, clientX: number, clientY: number) {
  onHideRightMenuScroll()
  let menu = document.getElementById(menukey)
  if (menu) {
    menuliststate.add(menukey)
    let screenY = window.innerHeight
    let screenX = window.innerWidth

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
