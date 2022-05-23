
export function GetSelectedList<T>(list: T[], keyname: string, selectedMap: Set<string>): T[] {
  let selectedList: T[] = []
  let key = ''
  for (let i = 0, maxi = list.length; i < maxi; i++) {
    key = (list[i] as any)[keyname]
    if (selectedMap.has(key)) selectedList.push(list[i])
  }
  return selectedList
}

export function GetSelectedListID<T>(list: T[], keyname: string, selectedMap: Set<string>): string[] {
  let selectedList: string[] = []
  let key = ''
  for (let i = 0, maxi = list.length; i < maxi; i++) {
    key = (list[i] as any)[keyname]
    if (selectedMap.has(key)) selectedList.push(key)
  }
  return selectedList
}

export function SelectAll<T>(list: T[], keyname: string, selectedOld: Set<string>): Set<string> {
  let selectedNew = new Set<string>()
  if (selectedOld.size == list.length) {
    
  } else {
    
    for (let i = 0, maxi = list.length; i < maxi; i++) {
      selectedNew.add((list[i] as any)[keyname])
    }
  }
  return selectedNew
}


export function GetFocusNext(list: any[], keyname: string, focusKey: string, position: string): string {
  if (list.length <= 0) return '' 

  if (position == 'top') return list[0][keyname]
  if (position == 'end') return list[list.length - 1][keyname]

  if (focusKey == '') return list[0][keyname] 

  let key = ''
  for (let i = 0, maxi = list.length; i < maxi; i++) {
    key = list[i][keyname]
    if (key == focusKey) {
      if (position == 'next') {
        
        if (i + 1 < maxi) return list[i + 1][keyname]
        else return list[maxi - 1][keyname]
      } else {
        
        if (i > 0) return list[i - 1][keyname]
        else return list[0][keyname]
      }
    }
  }
  return ''
}

export function MouseSelectOne(list: any[], keyname: string, selectedOld: Set<string>, focusKey: string, selectKey: string, Key: string, Ctrl: boolean, Shift: boolean) {
  if (Key == '') return { selectedNew: new Set<string>(), selectedLast: '', focusLast: '' }
  
  if (Shift) {
    if (!selectKey) selectKey = list[0][keyname] 
    
    let posToSelect = -1 
    let posLastSelect = -1 
    let posFocus = -1 
    let TempKey = ''
    for (let i = 0, maxi = list.length; i < maxi; i++) {
      TempKey = list[i][keyname]
      if (TempKey == Key) posToSelect = i 
      if (TempKey == selectKey) posLastSelect = i 
      if (TempKey == focusKey) posFocus = i 
      if (posToSelect >= 0 && posLastSelect >= 0 && posFocus >= 0) break 
    }
    let selectedNew = new Set<string>(selectedOld)
    
    if (posToSelect >= 0 && posLastSelect >= 0) {
      for (let n = Math.min(posToSelect, posLastSelect), maxn = Math.max(posToSelect, posLastSelect); n <= maxn; n++) {
        selectedNew.add(list[n][keyname]) 
      }
    }

    if (posToSelect >= 0 && posFocus >= 0 && posLastSelect >= 0) {
      
      
      
      
      
      
      if (posLastSelect <= posToSelect && posToSelect <= posFocus) {
        for (let n = posToSelect + 1; n <= posFocus; n++) {
          if (selectedNew.has(list[n][keyname])) selectedNew.delete(list[n][keyname]) 
        }
      } else if (posToSelect <= posLastSelect && posLastSelect <= posFocus) {
        for (let n = posLastSelect + 1; n <= posFocus; n++) {
          if (selectedNew.has(list[n][keyname])) selectedNew.delete(list[n][keyname]) 
        }
      } else if (posFocus <= posLastSelect && posLastSelect <= posToSelect) {
        for (let n = posFocus; n <= posLastSelect - 1; n++) {
          if (selectedNew.has(list[n][keyname])) selectedNew.delete(list[n][keyname]) 
        }
      } else if (posFocus <= posToSelect && posToSelect <= posLastSelect) {
        for (let n = posFocus; n <= posToSelect - 1; n++) {
          if (selectedNew.has(list[n][keyname])) selectedNew.delete(list[n][keyname]) 
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

  
  if (selectedOld.has(Key) && selectedOld.size == 1) return { selectedNew: new Set<string>(), selectedLast: Key, focusLast: Key }
  return { selectedNew: new Set<string>([Key]), selectedLast: Key, focusLast: Key }
}


export function KeyboardSelectOne(list: any[], keyname: string, selectedOld: Set<string>, focusKey: string, selectKey: string, Key: string, Ctrl: boolean, Shift: boolean) {
  if (Key == '') return { selectedNew: new Set<string>(), selectedLast: '', focusLast: Key }

  
  if (Shift) {
    if (!selectKey) selectKey = list[0][keyname] 
    
    let posToSelect = -1 
    let posLastSelect = -1 
    let posFocus = -1 
    let TempKey = ''
    for (let i = 0, maxi = list.length; i < maxi; i++) {
      TempKey = list[i][keyname]
      if (TempKey == Key) posToSelect = i 
      if (TempKey == selectKey) posLastSelect = i 
      if (TempKey == focusKey) posFocus = i 
      if (posToSelect >= 0 && posLastSelect >= 0 && posFocus >= 0) break 
    }
    let selectedNew = new Set<string>(selectedOld)
    
    if (posToSelect >= 0 && posLastSelect >= 0) {
      for (let n = Math.min(posToSelect, posLastSelect), maxn = Math.max(posToSelect, posLastSelect); n <= maxn; n++) {
        selectedNew.add(list[n][keyname]) 
      }
    }

    if (posToSelect >= 0 && posFocus >= 0 && posLastSelect >= 0) {
      
      
      
      
      
      
      if (posLastSelect <= posToSelect && posToSelect <= posFocus) {
        for (let n = posToSelect + 1; n <= posFocus; n++) {
          if (selectedNew.has(list[n][keyname])) selectedNew.delete(list[n][keyname]) 
        }
      } else if (posToSelect <= posLastSelect && posLastSelect <= posFocus) {
        for (let n = posLastSelect + 1; n <= posFocus; n++) {
          if (selectedNew.has(list[n][keyname])) selectedNew.delete(list[n][keyname]) 
        }
      } else if (posFocus <= posLastSelect && posLastSelect <= posToSelect) {
        for (let n = posFocus; n <= posLastSelect - 1; n++) {
          if (selectedNew.has(list[n][keyname])) selectedNew.delete(list[n][keyname]) 
        }
      } else if (posFocus <= posToSelect && posToSelect <= posLastSelect) {
        for (let n = posFocus; n <= posToSelect - 1; n++) {
          if (selectedNew.has(list[n][keyname])) selectedNew.delete(list[n][keyname]) 
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

  
  return { selectedNew: new Set<string>([Key]), selectedLast: Key, focusLast: Key }
}
