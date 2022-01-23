const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']

export function humanSize(bytes: number | string) {
  if (typeof bytes === 'string') bytes = parseInt(bytes)
  let u = 0
  while (bytes >= 1024 && u < units.length - 1) {
    bytes /= 1024
    ++u
  }
  return `${bytes.toFixed(2)}${units[u]}`
}

export function humanDateTime(value: number | string) {
  if (typeof value === 'string') value = parseInt(value)
  const date = new Date(value)
  const y = date.getFullYear().toString()
  let m: number | string = date.getMonth() + 1
  m = m < 10 ? '0' + m.toString() : m.toString()
  let d: number | string = date.getDate()
  d = d < 10 ? '0' + d.toString() : d.toString()
  let h: number | string = date.getHours()
  h = h < 10 ? '0' + h.toString() : h.toString()
  let minute: number | string = date.getMinutes()
  minute = minute < 10 ? '0' + minute.toString() : minute.toString()
  let second: number | string = date.getSeconds()
  second = second < 10 ? '0' + second.toString() : second.toString()
  return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second
}

export function humanTime(value: number | string) {
  if (typeof value === 'string') value = parseInt(value)
  var hours = Math.floor(value / 3600)
  value = value % 3600
  var minutes = Math.floor(value / 60)
  value = value % 60
  var seconds = Math.floor(value)

  var hourStr = (hours < 10 ? '0' : '') + String(hours)
  var minStr = (minutes < 10 ? '0' : '') + String(minutes)
  var secStr = (seconds < 10 ? '0' : '') + String(seconds)
  return hourStr + ':' + minStr + ':' + secStr
}

export function humanExpiration(expiration: string | undefined, timenow: number = new Date().getTime()) {
  if (expiration) {
    const date = Math.floor((new Date(expiration).getTime() - timenow) / 1000)
    if (date < 0) return '过期已失效'
    else if (date < 60) return date + '秒后过期'
    else if (date < 3600) return Math.floor(date / 60) + '分钟过期'
    else if (date < 3600 * 24) return Math.floor(date / 3600) + '小时过期'
    else return Math.floor(date / 3600 / 24) + '天后过期'
  } else {
    return '永久有效'
  }
}

export function GetKeyHashHex(full: string) {
  const buffa = Buffer.from(full)

  let h1b, k1

  const remainder = buffa.length & 3
  const bytes = buffa.length - remainder
  let h1 = 0
  const c1 = 0xcc9e2d51
  const c2 = 0x1b873593
  let i = 0

  while (i < bytes) {
    k1 = buffa.readUInt8(i) | (buffa.readUInt8(++i) << 8) | (buffa.readUInt8(++i) << 16) | (buffa.readUInt8(++i) << 24)
    ++i
    k1 = ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff
    k1 = (k1 << 15) | (k1 >>> 17)
    k1 = ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff
    h1 ^= k1
    h1 = (h1 << 13) | (h1 >>> 19)
    h1b = ((h1 & 0xffff) * 5 + ((((h1 >>> 16) * 5) & 0xffff) << 16)) & 0xffffffff
    h1 = (h1b & 0xffff) + 0x6b64 + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16)
  }

  k1 = 0
  switch (remainder) {
    case 3:
      k1 ^= buffa.readUInt8(i + 2) << 16
    case 2:
      k1 ^= buffa.readUInt8(i + 1) << 8
    case 1:
      k1 ^= buffa.readUInt8(i)
      k1 = ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff
      k1 = (k1 << 15) | (k1 >>> 17)
      k1 = ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff
      h1 ^= k1
  }

  h1 ^= buffa.length
  h1 ^= h1 >>> 16
  h1 = ((h1 & 0xffff) * 0x85ebca6b + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff
  h1 ^= h1 >>> 13
  h1 = ((h1 & 0xffff) * 0xc2b2ae35 + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16)) & 0xffffffff
  h1 ^= h1 >>> 16
  return (h1 >>> 0).toString(16).padStart(8, '0')
}

export function GetKeyHashNumber(full: string) {
  const buffa = Buffer.from(full)

  let h1b, k1

  const remainder = buffa.length & 3
  const bytes = buffa.length - remainder
  let h1 = 0
  const c1 = 0xcc9e2d51
  const c2 = 0x1b873593
  let i = 0

  while (i < bytes) {
    k1 = buffa.readUInt8(i) | (buffa.readUInt8(++i) << 8) | (buffa.readUInt8(++i) << 16) | (buffa.readUInt8(++i) << 24)
    ++i
    k1 = ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff
    k1 = (k1 << 15) | (k1 >>> 17)
    k1 = ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff
    h1 ^= k1
    h1 = (h1 << 13) | (h1 >>> 19)
    h1b = ((h1 & 0xffff) * 5 + ((((h1 >>> 16) * 5) & 0xffff) << 16)) & 0xffffffff
    h1 = (h1b & 0xffff) + 0x6b64 + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16)
  }

  k1 = 0
  switch (remainder) {
    case 3:
      k1 ^= buffa.readUInt8(i + 2) << 16
    case 2:
      k1 ^= buffa.readUInt8(i + 1) << 8
    case 1:
      k1 ^= buffa.readUInt8(i)
      k1 = ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff
      k1 = (k1 << 15) | (k1 >>> 17)
      k1 = ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff
      h1 ^= k1
  }

  h1 ^= buffa.length
  h1 ^= h1 >>> 16
  h1 = ((h1 & 0xffff) * 0x85ebca6b + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff
  h1 ^= h1 >>> 13
  h1 = ((h1 & 0xffff) * 0xc2b2ae35 + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16)) & 0xffffffff
  h1 ^= h1 >>> 16
  return h1 >>> 0
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

export function SortNumber(a: string, b: string): number {
  if (a.substring(0, 1) != b.substring(0, 1) && '0123456789零一二三四五六七八九十壹贰叁肆伍陆柒捌玖'.indexOf(a.substring(0, 1)) == -1) return a.localeCompare(b, 'zh-CN')
  const a10 = a.indexOf('十')
  if (a10 < 0) {
  } else if (a10 == 0) a = '1' + a.substring(1)
  else {
    const a09 = a.substring(a10 - 1, 1)
    if ('一二三四五六七八九'.indexOf(a09) < 0) a = a.substring(0, a10) + '1' + a.substring(a10 + 1)
  }

  const b10 = b.indexOf('十')
  if (b10 < 0) {
  } else if (b10 == 0) b = '1' + b.substring(1)
  else {
    const b09 = b.substring(b10 - 1, 1)
    if ('一二三四五六七八九'.indexOf(b09) < 0) b = b.substring(0, b10) + '1' + b.substring(b10 + 1)
  }
  a = replaceHanNumber(a)
  b = replaceHanNumber(b)
  const aNums = a.match(/[0-9]+/g)
  const bNums = b.match(/[0-9]+/g)

  if (!aNums || !bNums) {
    return a.localeCompare(b, 'zh-CN')
  }
  for (let i = 0, minLen = Math.min(aNums.length, bNums.length); i < minLen; i++) {
    const aIndex = a.indexOf(aNums[i])
    const bIndex = b.indexOf(bNums[i])

    const aPrefix = a.substring(0, aIndex)
    const bPrefix = b.substring(0, bIndex)

    if (aIndex !== bIndex || aPrefix !== bPrefix) {
      return a.localeCompare(b, 'zh-CN')
    }

    if (aNums[i] === bNums[i]) {
      if (i === minLen - 1) {
        return a.substring(aIndex).localeCompare(b.substring(bIndex), 'zh-CN')
      } else {
        a = a.substring(aIndex + aNums[i].length)
        b = b.substring(bIndex + bNums[i].length)
      }
    } else if (~~aNums[i] === ~~bNums[i]) {
      return aNums[i].lastIndexOf((~~aNums[i]).toString()) - bNums[i].lastIndexOf((~~bNums[i]).toString())
    } else {
      return ~~aNums[i] - ~~bNums[i]
    }
  }
  return a.localeCompare(b, 'zh-CN')
}

export function StringsToMap(list: string[]): Map<string, boolean> {
  const map = new Map<string, boolean>()
  try {
    for (let i = 0, maxi = list.length; i < maxi; i++) {
      map.set(list[i], true)
    }
  } catch {}
  return map
}

export function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
const pk = 'abcDEfgFGHJIdeoOPQpyzABqwxC5678KLhijklmnMNWXYZ012rstuv34RSTUV99'
export function randomSharePassword() {
  return 'xxxx'.replace(/[x]/g, function (c) {
    var r = Math.floor((Math.random() * 169) | 0) % (pk.length - 1)
    return pk.substring(r, r + 1)
  })
}

export function b64encode(str: string) {
  try {
    return Buffer.from(str).toString('base64')
  } catch {
    return ''
  }
}

export function b64decode(base64: string) {
  try {
    return Buffer.from(base64, 'base64').toString()
  } catch {
    return ''
  }
}

export function B64decode(b64str: string) {
  if (!b64str) return ''
  try {
    b64str = b64str.replaceAll('-', '+')
    b64str = b64str.replaceAll('_', '/')
    b64str = b64str.replaceAll('*', '=')
    return b64decode(b64str)
  } catch {
    return ''
  }
}

export function B64encode(str: string) {
  if (!str) return ''
  try {
    let b64str = b64encode(str)
    b64str = b64str.replaceAll('+', '-')
    b64str = b64str.replaceAll('/', '_')
    b64str = b64str.replaceAll('=', '*')
    return b64str
  } catch {
    return ''
  }
}

export function Sleep(msTime: number) {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          success: true,
          time: msTime
        }),
      msTime
    )
  )
}

export function Unicode(str: string) {
  var v = str.split('')
  var ascii = ''
  for (let i = 0, maxi = v.length; i < maxi; i++) {
    var code = Number(v[i].charCodeAt(0))
    ascii += '\\u' + code.toString(16).padStart(4, '0')
  }
  return ascii
}

export function SafeJsonStr(str: string) {
  return str.replaceAll('\\', '\\\\').replaceAll('"', '\\"')
}
