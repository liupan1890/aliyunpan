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
    replace: { enable: true, search: '', newword: '', chkCase: true, chkAll: true, chkReg: false, applyto: 'full' },
    delete: { enable: false, type: 'search', search: '', chkCase: true, chkAll: true, chkReg: false, beginlen: 0, endlen: 0, beginword: '', endword: '' },
    add: { enable: false, type: 'position', search: '', before: '', after: '', beginword: '', endword: '' },
    index: { enable: false, type: 'begin', format: '', minlen: 1, beginindex: 1, minnum: 1 },
    others: { enable: false, nameformat: '', extformat: '', randomformat: '', randomlen: 4 }
  }
}

export function RunAllNode(nodelist: TreeNodeData[], func: (node: TreeNodeData) => void) {
  for (let i = 0, maxi = nodelist.length; i < maxi; i++) {
    let node = nodelist[i]
    func(node)

    if (node.children && node.children.length > 0) RunAllNode(node.children, func)
  }
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

export function RunReplace(isdir: boolean, title: string, config: any) {
  let search = config.search as string
  if (!search || !config.newword) return [title, title]

  let name = title
  let ext = ''
  let exti = name.lastIndexOf('.')
  if (!isdir && exti >= 0) {
    ext = name.substring(exti)
    name = name.substring(0, exti)
  }

  if (config.chkReg) {
    
    let reg = RegExp(search)
    if (config.chkCase) reg = RegExp(search, 'i')
    if (config.chkAll) reg = RegExp(search, 'g')
    if (config.chkCase && config.chkAll) reg = RegExp(search, 'ig')
    if (config.applyto == 'full') {
      
      return [title.replace(reg, config.newword), title.replace(reg, '<i>' + config.newword + '</i>')]
    }
    if (config.applyto == 'name') {
      return [name.replace(reg, config.newword) + ext, name.replace(reg, '<i>' + config.newword + '</i>') + ext]
    } else {
      return [name + ext.replace(reg, config.newword), name + ext.replace(reg, '<i>' + config.newword + '</i>')]
    }
  } else if (config.chkCase) {
    
    if (config.chkAll) {
      if (config.applyto == 'full') {
        let slist = Split(title, search)
        return [slist.join(config.newword), slist.join('<i>' + config.newword + '</i>')]
      }
      if (config.applyto == 'name') {
        let slist = Split(name, search)
        return [slist.join(config.newword) + ext, slist.join('<i>' + config.newword + '</i>') + ext]
      } else {
        let slist = Split(ext, search)
        return [name + slist.join(config.newword), name + slist.join('<i>' + config.newword + '</i>')]
      }
    } else {
      if (config.applyto == 'full') {
        return [Replace(title, search, config.newword), Replace(title, search, '<i>' + config.newword + '</i>')]
      }
      if (config.applyto == 'name') {
        return [Replace(name, search, config.newword) + ext, Replace(name, search, '<i>' + config.newword + '</i>') + ext]
      } else {
        return [name + Replace(ext, search, config.newword), name + Replace(ext, search, '<i>' + config.newword + '</i>')]
      }
    }
  } else {
    
    if (config.chkAll) {
      if (config.applyto == 'full') {
        return [title.replaceAll(search, config.newword), title.replaceAll(search, '<i>' + config.newword + '</i>')]
      }
      if (config.applyto == 'name') {
        return [name.replaceAll(search, config.newword) + ext, name.replaceAll(search, '<i>' + config.newword + '</i>') + ext]
      } else {
        return [name + ext.replaceAll(search, config.newword), name + ext.replaceAll(search, '<i>' + config.newword + '</i>')]
      }
    } else {
      if (config.applyto == 'full') {
        return [title.replace(search, config.newword), title.replace(search, '<i>' + config.newword + '</i>')]
      }
      if (config.applyto == 'name') {
        return [name.replace(search, config.newword) + ext, name.replace(search, '<i>' + config.newword + '</i>') + ext]
      } else {
        return [name + ext.replace(search, config.newword), name + ext.replace(search, '<i>' + config.newword + '</i>')]
      }
    }
  }
}
export function RunDelete(isdir: boolean, title: string, config: any) {
  let name = title
  let ext = ''
  let exti = name.lastIndexOf('.')
  if (!isdir && exti >= 0) {
    ext = name.substring(exti)
    name = name.substring(0, exti)
  }

  if (config.type == 'search' && config.search) {
    let search = config.search as string
    if (config.chkReg) {
      
      let reg = RegExp(search)
      if (config.chkCase) reg = RegExp(search, 'i')
      if (config.chkAll) reg = RegExp(search, 'g')
      if (config.chkCase && config.chkAll) reg = RegExp(search, 'ig')
      if (config.applyto == 'full') {
        
        return [title.replace(reg, ''), title.replace(reg, '<b>' + search + '</b>')]
      }
      if (config.applyto == 'name') {
        return [name.replace(reg, '') + ext, name.replace(reg, '<b>' + search + '</b>') + ext]
      } else {
        return [name + ext.replace(reg, ''), name + ext.replace(reg, '<b>' + search + '</b>')]
      }
    } else if (config.chkCase) {
      
      if (config.chkAll) {
        let slist = Split(name, search)
        return [slist.join('') + ext, slist.join('<b>' + search + '</b>') + ext]
      } else {
        return [Replace(name, search, '') + ext, Replace(name, search, '<b>' + search + '</b>') + ext]
      }
    } else {
      
      if (config.chkAll) {
        return [name.replaceAll(search, '') + ext, name.replaceAll(search, '<b>' + search + '</b>') + ext]
      } else {
        return [name.replace(search, '') + ext, name.replace(search, '<b>' + search + '</b>') + ext]
      }
    }
  }

  if (config.type == 'position' && config.beginlen >= 0 && config.endlen >= 0) {
    let title1 = name
    let title2 = name
    if (config.beginlen > 0 && config.beginlen < title1.length) {
      let del = title1.substring(0, config.beginlen)
      let str = title1.substring(config.beginlen)
      title1 = str
      title2 = '<b>' + del + '</b>' + str
    }

    if (config.beginlen < title1.length && config.endlen > 0 && config.endlen < title1.length) {
      let str1 = title1.substring(0, title1.length - config.endlen)
      let str2 = title2.substring(0, title2.length - config.endlen)
      let del = title1.substring(title1.length - config.endlen)
      title1 = str1
      title2 = str2 + '<b>' + del + '</b>'
    }
    return [title1 + ext, title2 + ext]
  }

  if (config.type == 'range' && config.beginword && config.endword) {
    let start = name.indexOf(config.beginword)
    let end = name.indexOf(config.endword, start + 1)
    if (start >= 0 && end >= 0 && start < end) {
      let title1 = name.substring(0, start + 1) + name.substring(end)
      let title2 = name.substring(0, start + 1) + '<b>' + name.substring(start + 1, end) + '</b>' + name.substring(end)
      return [title1 + ext, title2 + ext]
    }
  }

  return [title, title]
}
export function RunAdd(isdir: boolean, title: string, config: any) {
  let name = title
  let ext = ''
  let exti = name.lastIndexOf('.')
  if (!isdir && exti >= 0) {
    ext = name.substring(exti)
    name = name.substring(0, exti)
  }

  if (config.type == 'search' && config.search) {
    let index = name.indexOf(config.search)
    if (index >= 0) {
      let start = name.substring(0, index)
      let mid = name.substring(index, index + config.search.length)
      let end = name.substring(index + config.search.length)

      let title1 = name
      let title2 = name
      if (config.before && config.after) {
        title1 = start + config.before + mid + config.after + end
        title2 = start + '<i>' + config.before + '</i>' + mid + '<i>' + config.after + '</i>' + end
      } else if (config.before) {
        title1 = start + config.before + mid + end
        title2 = start + '<i>' + config.before + '</i>' + mid + end
      } else if (config.after) {
        title1 = start + mid + config.after + end
        title2 = start + mid + '<i>' + config.after + '</i>' + end
      }

      return [title1 + ext, title2 + ext]
    }
  }

  if (config.type == 'position') {
    let title1 = name
    let title2 = name
    if (config.beginword) {
      title1 = config.beginword + title1
      title2 = '<i>' + config.beginword + '</i>' + title2
    }
    if (config.endword) {
      title1 = title1 + config.endword
      title2 = title2 + '<i>' + config.endword + '</i>'
    }
    return [title1 + ext, title2 + ext]
  }

  return [title, title]
}
export function RunIndex(isdir: boolean, title: string, config: any, nodeindex: number) {
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
export function RunOthers(isdir: boolean, title: string, config: any, sj1Base: string) {
  let name = title
  let ext = ''
  let exti = name.lastIndexOf('.')
  if (!isdir && exti >= 0) {
    ext = name.substring(exti)
    name = name.substring(0, exti)
  }

  if (config.nameformat == 'AA') {
    return [name.toUpperCase() + ext, name.toUpperCase() + ext]
  }
  if (config.nameformat == 'aa') {
    return [name.toLowerCase() + ext, name.toLowerCase() + ext]
  }
  if (config.nameformat == 'Aa') {
    name = name.toLowerCase()
    let title1 = name.replace(/[a-z]+/, (L) => (L.length > 1 ? L.substring(0, 1).toUpperCase() + L.substring(1) : L.toUpperCase()))
    let title2 = name.replace(/[a-z]+/, (L) => (L.length > 1 ? '<i>' + L.substring(0, 1).toUpperCase() + '</i>' + L.substring(1) : '<i>' + L.toUpperCase() + '</i>'))
    return [title1 + ext, title2 + ext]
  }
  if (config.nameformat == 'Aa Aa') {
    name = name.toLowerCase()
    let title1 = name.replace(/[a-z]+/g, (L) => (L.length > 1 ? L.substring(0, 1).toUpperCase() + L.substring(1) : L.toUpperCase()))
    let title2 = name.replace(/[a-z]+/g, (L) => (L.length > 1 ? '<i>' + L.substring(0, 1).toUpperCase() + '</i>' + L.substring(1) : '<i>' + L.toUpperCase() + '</i>'))
    return [title1 + ext, title2 + ext]
  }

  if (config.extformat == 'AA') {
    return [name + ext.toUpperCase(), name + '<i>' + ext.toUpperCase() + '</i>']
  }
  if (config.extformat == 'aa') {
    return [name + ext.toLowerCase(), name + '<i>' + ext.toLowerCase() + '</i>']
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
    return [ranname + ext, '<i>' + ranname + '</i>' + ext]
  }

  return [title, title]
}

export function RunReplaceName(renameconfig: any, TreeData: TreeNodeData[], checkedKeys: string[]) {
  let show = renameconfig.show
  let replace = renameconfig.replace
  if (replace.enable) {
    RunAllNode(TreeData, (node) => {
      let title = RunReplace(node.isdir, node.rawtitle, replace)
      node.newtitle = title[0]
      node.title = show ? title[0] : title[1]
      node.ismatch = node.newtitle != node.rawtitle
    })
    return
  }
  let tdelete = renameconfig.delete
  if (tdelete.enable) {
    RunAllNode(TreeData, (node) => {
      let title = RunDelete(node.isdir, node.rawtitle, tdelete)
      node.newtitle = title[0]
      node.title = show ? title[0] : title[1]
      node.ismatch = node.newtitle != node.rawtitle
    })
    return
  }
  let add = renameconfig.add
  if (add.enable) {
    RunAllNode(TreeData, (node) => {
      let title = RunAdd(node.isdir, node.rawtitle, add)
      node.newtitle = title[0]
      node.title = show ? title[0] : title[1]
      node.ismatch = node.newtitle != node.rawtitle
    })
    return
  }
  let index = renameconfig.index
  if (index.enable) {
    let nodeindex = 0
    let checkmap = new Set(checkedKeys || [])
    RunAllNode(TreeData, (node) => {
      if (!checkmap.has(node.key)) {
        node.newtitle = node.rawtitle
        node.title = node.rawtitle
        node.ismatch = false
      } else {
        let title = RunIndex(node.isdir, node.rawtitle, index, nodeindex)
        node.newtitle = title[0]
        node.title = show ? title[0] : title[1]
        node.ismatch = node.newtitle != node.rawtitle
        nodeindex++
      }
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
      let title = RunOthers(node.isdir, node.rawtitle, others, sj1Base)
      node.newtitle = title[0]
      node.title = show ? title[0] : title[1]
      node.ismatch = node.newtitle != node.rawtitle
    })
    return
  }
}
