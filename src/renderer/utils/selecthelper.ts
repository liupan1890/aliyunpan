import { MapValueToArray } from './utils'


export function GetSelectedList<K, T>(list: T[], keyName: string, selectedMap: Set<K>): T[] {
  const selectedList: Map<K, T> = new Map()
  let key: K
  for (let i = 0, maxi = list.length; i < maxi; i++) {
    key = (list[i] as any)[keyName]
    if (selectedMap.has(key)) selectedList.set(key, list[i])
  }
  return MapValueToArray(selectedList)
}

export function GetSelectedListID<K, T>(list: T[], keyName: string, selectedMap: Set<K>): K[] {
  const selectedList: Set<K> = new Set()
  let key: K
  for (let i = 0, maxi = list.length; i < maxi; i++) {
    key = (list[i] as any)[keyName]
    if (selectedMap.has(key)) selectedList.add(key)
  }
  return Array.from(selectedList)
}


export function SelectAll<K, T>(list: T[], keyName: string, selectedOld: Set<K>): Set<K> {
  const selectedNew = new Set<K>()
  if (selectedOld.size == list.length) {
    
  } else {
    
    for (let i = 0, maxi = list.length; i < maxi; i++) {
      selectedNew.add((list[i] as any)[keyName])
    }
  }
  return selectedNew
}


export function GetFocusNext<T>(list: any[], keyName: string, focusKey: T, position: string, defaultValue: T): T {
  if (list.length <= 0) return defaultValue 

  if (position == 'top') return list[0][keyName]
  if (position == 'end') return list[list.length - 1][keyName]

  if (!focusKey) return list[0][keyName] 

  let key: T
  for (let i = 0, maxi = list.length; i < maxi; i++) {
    key = list[i][keyName]
    if (key == focusKey) {
      if (position == 'next') {
        
        if (i + 1 < maxi) return list[i + 1][keyName]
        else return list[maxi - 1][keyName]
      } else {
        
        if (i > 0) return list[i - 1][keyName]
        else return list[0][keyName]
      }
    }
  }
  return defaultValue
}

export function MouseSelectOne<T>(list: any[], keyName: string, selectedOld: Set<T>, focusKey: T, selectKey: T, Key: T, Ctrl: boolean, Shift: boolean, defaultValue: T): { selectedNew: Set<T>; selectedLast: T; focusLast: T } {
  if (Key == defaultValue) return { selectedNew: new Set<T>(), selectedLast: defaultValue, focusLast: defaultValue }
  
  if (Shift) {
    if (!selectKey) selectKey = list[0][keyName] 
    
    let posToSelect = -1 
    let posLastSelect = -1 
    let posFocus = -1 
    let tempKey: T
    for (let i = 0, maxi = list.length; i < maxi; i++) {
      tempKey = list[i][keyName]
      if (tempKey == Key) posToSelect = i 
      if (tempKey == selectKey) posLastSelect = i 
      if (tempKey == focusKey) posFocus = i 
      if (posToSelect >= 0 && posLastSelect >= 0 && posFocus >= 0) break 
    }
    const selectedNew = new Set<T>(selectedOld)
    
    if (posToSelect >= 0 && posLastSelect >= 0) {
      for (let n = Math.min(posToSelect, posLastSelect), maxn = Math.max(posToSelect, posLastSelect); n <= maxn; n++) {
        selectedNew.add(list[n][keyName]) 
      }
    }

    if (posToSelect >= 0 && posFocus >= 0 && posLastSelect >= 0) {
      
      
      
      
      
      
      if (posLastSelect <= posToSelect && posToSelect <= posFocus) {
        for (let n = posToSelect + 1; n <= posFocus; n++) {
          if (selectedNew.has(list[n][keyName])) selectedNew.delete(list[n][keyName]) 
        }
      } else if (posToSelect <= posLastSelect && posLastSelect <= posFocus) {
        for (let n = posLastSelect + 1; n <= posFocus; n++) {
          if (selectedNew.has(list[n][keyName])) selectedNew.delete(list[n][keyName]) 
        }
      } else if (posFocus <= posLastSelect && posLastSelect <= posToSelect) {
        for (let n = posFocus; n <= posLastSelect - 1; n++) {
          if (selectedNew.has(list[n][keyName])) selectedNew.delete(list[n][keyName]) 
        }
      } else if (posFocus <= posToSelect && posToSelect <= posLastSelect) {
        for (let n = posFocus; n <= posToSelect - 1; n++) {
          if (selectedNew.has(list[n][keyName])) selectedNew.delete(list[n][keyName]) 
        }
      }
    }

    return { selectedNew: selectedNew, selectedLast: selectKey, focusLast: Key } 
    
  }

  
  if (Ctrl) {
    
    if (selectedOld.has(Key)) {
      selectedOld.delete(Key) 
    } else {
      selectedOld.add(Key) 
    }
    return { selectedNew: selectedOld, selectedLast: Key, focusLast: Key } 
  }

  
  if (selectedOld.has(Key) && selectedOld.size == 1) return { selectedNew: new Set<T>(), selectedLast: Key, focusLast: Key }
  return { selectedNew: new Set<T>([Key]), selectedLast: Key, focusLast: Key }
}


export function KeyboardSelectOne<T>(list: any[], keyName: string, selectedOld: Set<T>, focusKey: T, selectKey: T, Key: T, Ctrl: boolean, Shift: boolean, defaultValue: T): { selectedNew: Set<T>; selectedLast: T; focusLast: T } {
  if (Key == defaultValue) return { selectedNew: new Set<T>(), selectedLast: defaultValue, focusLast: Key }

  
  if (Shift) {
    if (!selectKey) selectKey = list[0][keyName] 
    
    let posToSelect = -1 
    let posLastSelect = -1 
    let posFocus = -1 
    let tempKey: T
    for (let i = 0, maxi = list.length; i < maxi; i++) {
      tempKey = list[i][keyName]
      if (tempKey == Key) posToSelect = i 
      if (tempKey == selectKey) posLastSelect = i 
      if (tempKey == focusKey) posFocus = i 
      if (posToSelect >= 0 && posLastSelect >= 0 && posFocus >= 0) break 
    }
    const selectedNew = new Set<T>(selectedOld)
    
    if (posToSelect >= 0 && posLastSelect >= 0) {
      for (let n = Math.min(posToSelect, posLastSelect), maxn = Math.max(posToSelect, posLastSelect); n <= maxn; n++) {
        selectedNew.add(list[n][keyName]) 
      }
    }

    if (posToSelect >= 0 && posFocus >= 0 && posLastSelect >= 0) {
      
      
      
      
      
      
      if (posLastSelect <= posToSelect && posToSelect <= posFocus) {
        for (let n = posToSelect + 1; n <= posFocus; n++) {
          if (selectedNew.has(list[n][keyName])) selectedNew.delete(list[n][keyName]) 
        }
      } else if (posToSelect <= posLastSelect && posLastSelect <= posFocus) {
        for (let n = posLastSelect + 1; n <= posFocus; n++) {
          if (selectedNew.has(list[n][keyName])) selectedNew.delete(list[n][keyName]) 
        }
      } else if (posFocus <= posLastSelect && posLastSelect <= posToSelect) {
        for (let n = posFocus; n <= posLastSelect - 1; n++) {
          if (selectedNew.has(list[n][keyName])) selectedNew.delete(list[n][keyName]) 
        }
      } else if (posFocus <= posToSelect && posToSelect <= posLastSelect) {
        for (let n = posFocus; n <= posToSelect - 1; n++) {
          if (selectedNew.has(list[n][keyName])) selectedNew.delete(list[n][keyName]) 
        }
      }
    }

    return { selectedNew: selectedNew, selectedLast: selectKey, focusLast: Key } 
    
  }

  
  if (Ctrl) {
    
    if (selectedOld.has(Key)) {
      selectedOld.delete(Key) 
    } else {
      selectedOld.add(Key) 
    }
    return { selectedNew: selectedOld, selectedLast: Key, focusLast: Key } 
  }

  
  return { selectedNew: new Set<T>([Key]), selectedLast: Key, focusLast: Key }
}
