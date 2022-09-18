export interface TreeNodeData {
  key: string
  title: string
  rawtitle: string
  newtitle: string
  isLeaf: boolean
  children: TreeNodeData[]
  icon: any
  isdir: boolean
  
  ismatch: boolean
}

export function NewRenameConfigData() {
  return {
    
    show: false,
    
    replace: { enable: true, search: '', newword: '', chkCase: true, chkAll: true, chkReg: false, applyto: 'name' },
    
    delete: { enable: false, type: 'search', search: '', chkCase: true, chkAll: true, chkReg: false, applyto: 'name', beginlen: 0, endlen: 0, beginword: '', endword: '' },
    
    add: { enable: false, type: 'position', search: '', before: '', after: '', beginword: '', endword: '', applyto: 'name' },
    
    index: { enable: false, type: 'begin', format: '', minlen: 1, beginindex: 1, minnum: 1 },
    
    others: { enable: false, nameformat: '', extformat: '', randomformat: '', randomlen: 4 }
  }
}


export function RunAllNode(nodelist: TreeNodeData[], func: (node: TreeNodeData) => boolean) {
  for (let i = 0, maxi = nodelist.length; i < maxi; i++) {
    let node = nodelist[i]
    if (!func(node)) return false 

    if (node.children && node.children.length > 0) {
      if (!RunAllNode(node.children, func)) return false 
    }
  }
  return true
}


function Split(text: string, search: string) {
  let textlow = text.toLowerCase()
  search = search.toLowerCase()
  let listlow = textlow.split(search)
  let slen = search.length
  let pos = 0
  let list: string[] = []
  for (let i = 0, maxi = listlow.length; i < maxi; i++) {
    let low = listlow[i]
    if (low == '') {
      list.push('')
      pos = pos + slen
    } else {
      list.push(text.substring(pos, pos + low.length))
      pos = pos + slen + low.length
    }
  }
  return list
}

function Replace(text: string, search: string, newtext: string) {
  let textlow = text.toLowerCase()
  search = search.toLowerCase()
  let index = textlow.indexOf(search)
  if (index >= 0) {
    return text.substring(0, index) + newtext + text.substring(index + search.length)
  } else return text
}

function fixext(ext: string) {
  return ext ? '.' + ext : ''
}

function RunReplace(isdir: boolean, title: string, config: any) {
  let search = config.search as string
  if (!search) return [title, title]

  let name = title
  let ext = ''
  let exti = name.lastIndexOf('.')
  if (!isdir && exti >= 0) {
    ext = name.substring(exti + 1)
    name = name.substring(0, exti)
  }

  if (config.chkReg) {
    
    let reg: RegExp
    try {
      reg = RegExp(search)
    } catch {
      return [title, title] 
    }
    reg = RegExp(search)
    if (config.chkCase) reg = RegExp(search, 'i')
    if (config.chkAll) reg = RegExp(search, 'g')
    if (config.chkCase && config.chkAll) reg = RegExp(search, 'ig')
    if (config.applyto == 'full') {
      
      return [title.replace(reg, config.newword), title.replace(reg, '<s>' + config.newword + '</s>')]
    }
    if (config.applyto == 'name') {
      return [name.replace(reg, config.newword) + fixext(ext), name.replace(reg, '<s>' + config.newword + '</s>') + fixext(ext)]
    }
    if (config.applyto == 'ext') {
      return [name + fixext(ext.replace(reg, config.newword)), name + fixext(ext.replace(reg, '<s>' + config.newword + '</s>'))]
    }
  } else if (config.chkCase) {
    
    if (config.chkAll) {
      if (config.applyto == 'full') {
        let slist = Split(title, search)
        return [slist.join(config.newword), slist.join('<s>' + config.newword + '</s>')]
      }
      if (config.applyto == 'name') {
        let slist = Split(name, search)
        return [slist.join(config.newword) + fixext(ext), slist.join('<s>' + config.newword + '</s>') + fixext(ext)]
      }
      if (config.applyto == 'ext') {
        let slist = Split(ext, search)
        return [name + fixext(slist.join(config.newword)), name + fixext(slist.join('<s>' + config.newword + '</s>'))]
      }
    } else {
      if (config.applyto == 'full') {
        return [Replace(title, search, config.newword), Replace(title, search, '<s>' + config.newword + '</s>')]
      }
      if (config.applyto == 'name') {
        return [Replace(name, search, config.newword) + fixext(ext), Replace(name, search, '<s>' + config.newword + '</s>') + fixext(ext)]
      }
      if (config.applyto == 'ext') {
        return [name + fixext(Replace(ext, search, config.newword)), name + fixext(Replace(ext, search, '<s>' + config.newword + '</s>'))]
      }
    }
  } else {
    
    if (config.chkAll) {
      if (config.applyto == 'full') {
        return [title.replaceAll(search, config.newword), title.replaceAll(search, '<s>' + config.newword + '</s>')]
      }
      if (config.applyto == 'name') {
        return [name.replaceAll(search, config.newword) + fixext(ext), name.replaceAll(search, '<s>' + config.newword + '</s>') + fixext(ext)]
      }
      if (config.applyto == 'ext') {
        return [name + fixext(ext.replaceAll(search, config.newword)), name + fixext(ext.replaceAll(search, '<s>' + config.newword + '</s>'))]
      }
    } else {
      if (config.applyto == 'full') {
        return [title.replace(search, config.newword), title.replace(search, '<s>' + config.newword + '</s>')]
      }
      if (config.applyto == 'name') {
        return [name.replace(search, config.newword) + fixext(ext), name.replace(search, '<s>' + config.newword + '</s>') + fixext(ext)]
      }
      if (config.applyto == 'ext') {
        return [name + fixext(ext.replace(search, config.newword)), name + fixext(ext.replace(search, '<s>' + config.newword + '</s>'))]
      }
    }
  }
  return [title, title]
}
function RunDelete(isdir: boolean, title: string, config: any) {
  let name = title
  let ext = ''
  let exti = name.lastIndexOf('.')
  if (!isdir && exti >= 0) {
    ext = name.substring(exti + 1)
    name = name.substring(0, exti)
  }

  if (config.type == 'search' && config.search) {
    let search = config.search as string
    if (config.chkReg) {
      
      let reg: RegExp
      try {
        reg = RegExp(search)
      } catch {
        return [title, title] 
      }
      reg = RegExp(search)

      if (config.chkCase) reg = RegExp(search, 'i')
      if (config.chkAll) reg = RegExp(search, 'g')
      if (config.chkCase && config.chkAll) reg = RegExp(search, 'ig')
      if (config.applyto == 'full') {
        
        return [title.replace(reg, ''), title.replace(reg, (L) => (L ? '<b>' + L + '</b>' : ''))]
      }
      if (config.applyto == 'name') {
        return [name.replace(reg, '') + fixext(ext), name.replace(reg, (L) => (L ? '<b>' + L + '</b>' : '')) + fixext(ext)]
      }
      if (config.applyto === 'ext') {
        return [name + fixext(ext.replace(reg, '')), name + fixext(ext.replace(reg, (L) => (L ? '<b>' + L + '</b>' : '')))]
      }
    } else if (config.chkCase) {
      
      if (config.chkAll) {
        if (config.applyto == 'full') {
          let slist = Split(title, search)
          return [slist.join(''), slist.join('<b>' + search + '</b>')]
        }
        if (config.applyto == 'name') {
          let slist = Split(name, search)
          return [slist.join('') + fixext(ext), slist.join('<b>' + search + '</b>') + fixext(ext)]
        }
        if (config.applyto == 'ext') {
          let slist = Split(ext, search)
          return [name + fixext(slist.join('')), name + fixext(slist.join('<b>' + search + '</b>'))]
        }
      } else {
        if (config.applyto == 'full') {
          return [Replace(title, search, ''), Replace(title, search, '<b>' + search + '</b>')]
        }
        if (config.applyto == 'name') {
          return [Replace(name, search, '') + fixext(ext), Replace(name, search, '<b>' + search + '</b>') + fixext(ext)]
        }
        if (config.applyto === 'ext') {
          return [name + fixext(Replace(ext, search, '')), name + fixext(Replace(ext, search, '<b>' + search + '</b>'))]
        }
      }
    } else {
      
      if (config.chkAll) {
        if (config.applyto == 'full') {
          return [title.replaceAll(search, ''), title.replaceAll(search, '<b>' + search + '</b>')]
        }
        if (config.applyto == 'name') {
          return [name.replaceAll(search, '') + fixext(ext), name.replaceAll(search, '<b>' + search + '</b>') + fixext(ext)]
        }
        if (config.applyto == 'ext') {
          return [name + fixext(ext.replaceAll(search, '')), name + fixext(ext.replaceAll(search, '<b>' + search + '</b>'))]
        }
      } else {
        if (config.applyto == 'full') {
          return [title.replace(search, ''), title.replace(search, '<b>' + search + '</b>')]
        }
        if (config.applyto == 'name') {
          return [name.replace(search, '') + fixext(ext), name.replace(search, '<b>' + search + '</b>') + fixext(ext)]
        }
        if (config.applyto == 'ext') {
          return [name + fixext(ext.replace(search, '')), name + fixext(ext.replace(search, '<b>' + search + '</b>'))]
        }
      }
    }
  }

  if (config.type == 'position' && config.beginlen >= 0 && config.endlen >= 0) {
    let title1 = title
    let title2 = title
    if (config.applyto == 'full') {
      title1 = title
      title2 = title
    } else if (config.applyto == 'name') {
      title1 = name
      title2 = name
    } else if (config.applyto == 'ext') {
      title1 = ext
      title2 = ext
    }

    if (config.applyto == 'ext' && (config.beginlen > title1.length || config.endlen > title1.length || config.beginlen + config.endlen > title1.length)) return [title, title] 
    if (config.applyto !== 'ext' && (config.beginlen >= title1.length || config.endlen >= title1.length || config.beginlen + config.endlen >= title1.length)) return [title, title] 

    if (config.beginlen > 0 && config.endlen > 0) {
      
      let del1 = title1.substring(0, config.beginlen)
      let del2 = title1.substring(title1.length - config.endlen)
      let str = title1.substring(config.beginlen)
      str = str.substring(0, str.length - config.endlen)

      title1 = str
      title2 = '<b>' + del1 + '</b>' + str + '<b>' + del2 + '</b>'
    } else if (config.beginlen > 0) {
      
      let del = title1.substring(0, config.beginlen)
      let str = title1.substring(config.beginlen)
      title1 = str
      title2 = '<b>' + del + '</b>' + str
    } else if (config.endlen > 0) {
      
      let str1 = title1.substring(0, title1.length - config.endlen)
      let str2 = title1.substring(0, title1.length - config.endlen)
      let del = title1.substring(title1.length - config.endlen)
      title1 = str1
      title2 = str2 + '<b>' + del + '</b>'
    } else {
      
      return [title, title]
    }

    if (config.applyto == 'full') {
      return [title1, title2]
    }
    if (config.applyto == 'name') {
      return [title1 + fixext(ext), title2 + fixext(ext)]
    }
    if (config.applyto == 'ext') {
      return [name + fixext(title1), name + fixext(title2)]
    }
  }

  if (config.type == 'range' && config.beginword && config.endword) {
    if (config.applyto == 'full') {
      let start = title.indexOf(config.beginword)
      let end = title.indexOf(config.endword, start + 1)
      if (start >= 0 && end >= 0 && start < end - 1) {
        let title1 = title.substring(0, start + 1) + title.substring(end)
        let title2 = title.substring(0, start + 1) + '<b>' + title.substring(start + 1, end) + '</b>' + title.substring(end)
        return [title1, title2]
      }
    } else if (config.applyto == 'name') {
      let start = name.indexOf(config.beginword)
      let end = name.indexOf(config.endword, start + 1)
      if (start >= 0 && end >= 0 && start < end - 1) {
        let name1 = name.substring(0, start + 1) + name.substring(end)
        let name2 = name.substring(0, start + 1) + '<b>' + name.substring(start + 1, end) + '</b>' + name.substring(end)
        return [name1 + fixext(ext), name2 + fixext(ext)]
      }
    } else if (config.applyto == 'ext') {
      let start = ext.indexOf(config.beginword)
      let end = ext.indexOf(config.endword, start + 1)
      if (start >= 0 && end >= 0 && start < end - 1) {
        let ext1 = ext.substring(0, start + 1) + ext.substring(end)
        let ext2 = ext.substring(0, start + 1) + '<b>' + ext.substring(start + 1, end) + '</b>' + ext.substring(end)
        return [name + fixext(ext1), name + fixext(ext2)]
      }
    }
  }

  return [title, title]
}
function RunAdd(isdir: boolean, title: string, config: any) {
  let name = title
  let ext = ''
  let exti = name.lastIndexOf('.')
  if (!isdir && exti >= 0) {
    ext = name.substring(exti + 1)
    name = name.substring(0, exti)
  }

  let title1 = title

  if (config.applyto == 'full') {
    title1 = title
  } else if (config.applyto == 'name') {
    title1 = name
  } else if (config.applyto == 'ext') {
    title1 = ext
  }

  if (config.type == 'search' && config.search) {
    let index = title1.indexOf(config.search)
    if (index >= 0) {
      let title2 = ''
      let start = title1.substring(0, index)
      let mid = title1.substring(index, index + config.search.length)
      let end = title1.substring(index + config.search.length)

      if (config.before && config.after) {
        title1 = start + config.before + mid + config.after + end
        title2 = start + '<i>' + config.before + '</i>' + mid + '<i>' + config.after + '</i>' + end
      } else if (config.before) {
        title1 = start + config.before + mid + end
        title2 = start + '<i>' + config.before + '</i>' + mid + end
      } else if (config.after) {
        title1 = start + mid + config.after + end
        title2 = start + mid + '<i>' + config.after + '</i>' + end
      } else {
        return [title, title]
      }

      if (config.applyto == 'full') {
        return [title1, title2]
      }
      if (config.applyto == 'name') {
        return [title1 + fixext(ext), title2 + fixext(ext)]
      }
      if (config.applyto == 'ext') {
        return [name + fixext(title1), name + fixext(title2)]
      }
    }
  }

  if (config.type == 'position' && (config.beginword || config.endword)) {
    if (title1) {
      let title2 = title1
      if (config.beginword) {
        title1 = config.beginword + title1
        title2 = '<i>' + config.beginword + '</i>' + title2
      }
      if (config.endword) {
        title1 = title1 + config.endword
        title2 = title2 + '<i>' + config.endword + '</i>'
      }
      if (config.applyto == 'full') {
        return [title1, title2]
      }
      if (config.applyto == 'name') {
        return [title1 + fixext(ext), title2 + fixext(ext)]
      }
      if (config.applyto == 'ext') {
        return [name + fixext(title1), name + fixext(title2)]
      }
    }
  }

  return [title, title]
}
function RunIndex(isdir: boolean, title: string, config: any, nodeindex: number) {
  if (!config.format) return [title, title]
  let name = title
  let ext = ''
  let exti = name.lastIndexOf('.')
  if (!isdir && exti >= 0) {
    ext = name.substring(exti)
    name = name.substring(0, exti)
  }

  let bianhao = config.beginindex + config.minnum * nodeindex
  let formate = config.format.replace('#', bianhao.toString().padStart(config.minlen, '0'))
  if (config.type == 'begin') {
    let title1 = formate + name
    let title2 = '<i>' + formate + '</i>' + name
    return [title1 + ext, title2 + ext]
  } else if (config.type == 'end') {
    let title1 = name + formate
    let title2 = name + '<i>' + formate + '</i>'
    return [title1 + ext, title2 + ext]
  }

  return [title, title]
}
function RunOthers(isdir: boolean, title: string, config: any, sj1Base: string) {
  let name = title
  let ext = ''
  let exti = name.lastIndexOf('.')
  if (!isdir && exti >= 0) {
    ext = name.substring(exti)
    name = name.substring(0, exti)
  }

  if (config.nameformat == 'AA') {
    let title1 = name.replace(/[a-zA-Z]+/g, (L) => L.toUpperCase())
    let title2 = name.replace(/[a-zA-Z]+/g, (L) => (L == L.toUpperCase() ? L : '<s>' + L.toUpperCase() + '</s>'))

    if (title1 + ext == title) return [title, title] 
    return [title1 + ext, title2 + ext]
  }
  if (config.nameformat == 'aa') {
    let title1 = name.replace(/[a-zA-Z]+/g, (L) => L.toLowerCase())
    let title2 = name.replace(/[a-zA-Z]+/g, (L) => (L == L.toLowerCase() ? L : '<s>' + L.toLowerCase() + '</s>'))

    if (title1 + ext == title) return [title, title] 
    return [title1 + ext, title2 + ext]
  }
  if (config.nameformat == 'Aa') {
    name = name.toLowerCase()
    let title1 = name.replace(/[a-z]+/, (L) => (L.length > 1 ? L.substring(0, 1).toUpperCase() + L.substring(1) : L.toUpperCase()))
    let title2 = name.replace(/[a-z]+/, (L) => (L.length > 1 ? '<s>' + L.substring(0, 1).toUpperCase() + '</s>' + L.substring(1) : '<s>' + L.toUpperCase() + '</s>'))

    if (title1 + ext == title) return [title, title] 
    return [title1 + ext, title2 + ext]
  }
  if (config.nameformat == 'Aa Aa') {
    name = name.toLowerCase()
    let title1 = name.replace(/[a-z]+/g, (L) => (L.length > 1 ? L.substring(0, 1).toUpperCase() + L.substring(1) : L.toUpperCase()))
    let title2 = name.replace(/[a-z]+/g, (L) => (L.length > 1 ? '<s>' + L.substring(0, 1).toUpperCase() + '</s>' + L.substring(1) : '<s>' + L.toUpperCase() + '</s>'))
    if (title1 + ext == title) return [title, title] 
    return [title1 + ext, title2 + ext]
  }

  if (config.extformat == 'AA') {
    if (ext && ext != ext.toUpperCase()) {
      return [name + ext.toUpperCase(), name + '<s>' + ext.toUpperCase() + '</s>']
    } else {
      return [title, title] 
    }
  }
  if (config.extformat == 'aa') {
    if (ext && ext != ext.toLowerCase()) {
      return [name + ext.toLowerCase(), name + '<s>' + ext.toLowerCase() + '</s>']
    } else {
      return [title, title] 
    }
  }

  
  let randomlen = config.randomlen
  if (sj1Base && randomlen > 0) {
    let ranname = ''
    let ran = Math.random().toString() 
    ran = ran + ran + ran + ran + ran 
    let pos = name.length
    for (let i = 0; i < randomlen; i++) {
      pos = (pos ^ ran.charCodeAt(i)) % 300
      ranname += sj1Base[pos]
    }
    return [ranname + ext, '<s>' + ranname + '</s>' + ext]
  }
  return [title, title] 
}

export function RunReplaceName(renameconfig: any, TreeData: TreeNodeData[], checkedKeys: string[]) {
  let show = renameconfig.show
  let replace = renameconfig.replace
  let checked = new Set(checkedKeys || [])
  if (replace.enable) {
    RunAllNode(TreeData, (node) => {
      if (checked.has(node.key)) {
        let title = RunReplace(node.isdir, node.rawtitle, replace)
        node.newtitle = title[0]
        node.title = show ? title[0] : title[1]
        node.ismatch = node.newtitle != node.rawtitle
      } else {
        node.newtitle = node.rawtitle
        node.title = node.rawtitle
        node.ismatch = false
      }
      return true
    })
    return
  }
  let tdelete = renameconfig.delete
  if (tdelete.enable) {
    RunAllNode(TreeData, (node) => {
      if (checked.has(node.key)) {
        let title = RunDelete(node.isdir, node.rawtitle, tdelete)
        node.newtitle = title[0]
        node.title = show ? title[0] : title[1]
        node.ismatch = node.newtitle != node.rawtitle && node.newtitle != ''
      } else {
        node.newtitle = node.rawtitle
        node.title = node.rawtitle
        node.ismatch = false
      }
      return true
    })
    return
  }
  let add = renameconfig.add
  if (add.enable) {
    RunAllNode(TreeData, (node) => {
      if (checked.has(node.key)) {
        let title = RunAdd(node.isdir, node.rawtitle, add)
        node.newtitle = title[0]
        node.title = show ? title[0] : title[1]
        node.ismatch = node.newtitle != node.rawtitle
      } else {
        node.newtitle = node.rawtitle
        node.title = node.rawtitle
        node.ismatch = false
      }
      return true
    })
    return
  }
  let index = renameconfig.index
  if (index.enable) {
    let nodeindex = 0
    let checkmap = new Set(checkedKeys || [])
    RunAllNode(TreeData, (node) => {
      if (checked.has(node.key)) {
        let title = RunIndex(node.isdir, node.rawtitle, index, nodeindex)
        node.newtitle = title[0]
        node.title = show ? title[0] : title[1]
        node.ismatch = node.newtitle != node.rawtitle
        nodeindex++
      } else {
        node.newtitle = node.rawtitle
        node.title = node.rawtitle
        node.ismatch = false
      }
      return true
    })
    return
  }
  let others = renameconfig.others
  if (others.enable) {
    let sj1Base = '' 
    if (others.randomformat == '0-9') sj1Base = '01234567899876543210012345678998765432100123456789987654321001'
    if (others.randomformat == 'a-z') sj1Base = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghij'
    if (others.randomformat == 'A-Z') sj1Base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJ'
    if (others.randomformat == 'a-zA-Z') sj1Base = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZtuvwxABCDE'
    if (others.randomformat == '0-9a-z') sj1Base = '0123456789abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnop'
    if (others.randomformat == '0-9A-Z') sj1Base = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOP'
    if (others.randomformat == '0-9a-zA-Z') sj1Base = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    if (sj1Base) sj1Base = sj1Base + sj1Base + sj1Base + sj1Base + sj1Base 
    RunAllNode(TreeData, (node) => {
      if (checked.has(node.key)) {
        let title = RunOthers(node.isdir, node.rawtitle, others, sj1Base)
        node.newtitle = title[0]
        node.title = show ? title[0] : title[1]
        node.ismatch = node.newtitle != node.rawtitle
      } else {
        node.newtitle = node.rawtitle
        node.title = node.rawtitle
        node.ismatch = false
      }
      return true
    })
    return
  }
}
