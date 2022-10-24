import { IAliGetFileModel } from '../aliapi/alimodels'
import { DirData } from '../store/treestore'


export function OrderNode(order: string, list: DirData[]) {
  const orders = order.split(' ')
  const orderby = orders[0].toLowerCase()
  order = orders[1].toLowerCase()
  if (orderby == 'size' && order == 'asc') return OrderBySizeAsc(list)
  if (orderby == 'size' && order == 'desc') return OrderBySizeDesc(list)
  if (orderby == 'updated_at' && order == 'asc') return OrderByTimeAsc(list)
  if (orderby == 'updated_at' && order == 'desc') return OrderByTimeDesc(list)
  if (orderby == 'name' && order == 'asc') return OrderByNameAsc(list)
  if (orderby == 'name' && order == 'desc') return OrderByNameDesc(list)
  return list
}

export function OrderDir(orderby: string, order: string, list: IAliGetFileModel[]) {
  orderby = orderby.toLowerCase()
  order = order.toLowerCase()
  if (orderby == 'size' && order == 'asc') return OrderBySizeAsc(list)
  if (orderby == 'size' && order == 'desc') return OrderBySizeDesc(list)
  if (orderby == 'updated_at' && order == 'asc') return OrderByTimeAsc(list)
  if (orderby == 'updated_at' && order == 'desc') return OrderByTimeDesc(list)
  if (orderby == 'name' && order == 'asc') return OrderByNameAsc(list)
  if (orderby == 'name' && order == 'desc') return OrderByNameDesc(list)
  return list
}

export function OrderFile(orderby: string, order: string, list: IAliGetFileModel[]) {
  orderby = orderby.toLowerCase()
  order = order.toLowerCase()
  if (orderby == 'size' && order == 'asc') return OrderBySizeAsc(list)
  if (orderby == 'size' && order == 'desc') return OrderBySizeDesc(list)
  if (orderby == 'updated_at' && order == 'asc') return OrderByTimeAsc(list)
  if (orderby == 'updated_at' && order == 'desc') return OrderByTimeDesc(list)
  if (orderby == 'name' && order == 'asc') return OrderByNameAsc(list)
  if (orderby == 'name' && order == 'desc') return OrderByNameDesc(list)
  return list
}


function OrderByTimeAsc(list: { time: number; name: string }[]) {
  let t = 0
  return list.sort(function (a, b) {
    t = a.time - b.time
    if (t == 0) return _OrderName(a.name, b.name)
    else return t
  })
}

function OrderByTimeDesc(list: { time: number; name: string }[]) {
  return list.sort(function (b, a) {
    const t = a.time - b.time
    if (t == 0) return _OrderName(a.name, b.name)
    else return t
  })
}

function OrderBySizeAsc(list: { size: number; name: string }[]) {
  return list.sort(function (a, b) {
    const t = a.size - b.size
    if (t == 0) return _OrderName(a.name, b.name)
    else return t
  })
}

function OrderBySizeDesc(list: { size: number; name: string }[]) {
  return list.sort(function (b, a) {
    const t = a.size - b.size
    if (t == 0) return _OrderName(a.name, b.name)
    else return t
  })
}

function OrderByNameAsc(list: { name: string }[]) {
  return list.sort(function (a, b) {
    return _OrderName(a.name, b.name)
  })
}

function OrderByNameDesc(list: { name: string }[]) {
  return list.sort(function (b, a) {
    return _OrderName(a.name, b.name)
  })
}

const intlcn = new Intl.Collator(['zh-CN-u-co-pinyin', 'jp', 'en'], { numeric: true })
const intlen = new Intl.Collator(['en', 'zh-CN-u-co-pinyin', 'jp'], { numeric: true })
const azreg = new RegExp('[a-zA-Z]')

function _OrderName(a: string, b: string) {
  
  a = replaceHanNumber(a)
  b = replaceHanNumber(b)
  if (azreg.test(a.charAt(0)) || azreg.test(b.charAt(0))) return intlen.compare(a, b)
  return intlcn.compare(a, b)
}

function replaceHanNumber(a: string): string {
  let b = ''
  let c = ''

  for (let i = 0, maxi = a.length; i < maxi; i++) {
    c = a[i]
    switch (c) {
      case '零':
        b += '0' 
        break
      case '一':
        b += '1'
        break
      case 'Ⅰ':
        b += '1'
        break
      case '壹':
        b += '1'
        break
      case '二':
        b += '2'
        break
      case 'Ⅱ':
        b += '2'
        break
      case '贰':
        b += '2'
        break
      case '三':
        b += '3'
        break
      case 'Ⅲ':
        b += '3'
        break
      case '叁':
        b += '3'
        break
      case '四':
        b += '4'
        break
      case 'Ⅳ':
        b += '4'
        break
      case '肆':
        b += '4'
        break
      case '五':
        b += '5'
        break
      case 'Ⅴ':
        b += '5'
        break
      case '伍':
        b += '5'
        break
      case '六':
        b += '6'
        break
      case 'Ⅵ':
        b += '6'
        break
      case '陆':
        b += '6'
        break
      case '七':
        b += '7'
        break
      case 'Ⅶ':
        b += '7'
        break
      case '柒':
        b += '7'
        break
      case '八':
        b += '8'
        break
      case 'Ⅷ':
        b += '8'
        break
      case '捌':
        b += '8'
        break
      case '九':
        b += '9'
        break
      case 'Ⅸ':
        b += '9'
        break
      case '玖':
        b += '9'
        break
      case '十':
        b += ''
        break
      case 'Ⅹ':
        b += ''
        break
      case '拾':
        b += ''
        break
      case '百':
        b += ''
        break
      case '佰':
        b += ''
        break
      case '千':
        b += ''
        break
      case '仟':
        b += ''
        break
      case '万':
        b += ''
        break
      default:
        b += c
    }
  }
  return b
}
