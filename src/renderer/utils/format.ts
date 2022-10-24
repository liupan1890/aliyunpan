const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']


export function humanSize(bytes: number | string | undefined): string {
  if (!bytes && bytes != 0) return ''
  if (typeof bytes === 'string') bytes = parseInt(bytes)
  let u = 0
  while (bytes >= 1024 && u < units.length - 1) {
    bytes /= 1024
    ++u
  }
  return `${bytes.toFixed(2)}${units[u]}`
}
const speedunits = ['B', 'KB', 'M', 'G']


export function humanSizeSpeed(bytes: number | string | undefined): string {
  if (!bytes && bytes != 0) return ''
  if (typeof bytes === 'string') bytes = parseInt(bytes)
  let u = 0
  while (bytes >= 1024 && u < speedunits.length - 1) {
    bytes /= 1024
    ++u
  }
  if (bytes > 100) return `${bytes.toFixed(0)}${speedunits[u]}/s`
  if (bytes > 10) return `${bytes.toFixed(1)}${speedunits[u]}/s`
  return `${bytes.toFixed(2)}${units[u]}/s`
}


export function humanCount(bytes: number) {
  if (bytes < 1000) return bytes
  if (bytes < 10000) return (bytes / 1000).toFixed(2) + 'K'
  return (bytes / 10000).toFixed(2) + '万'
}

const byTime = [365 * 24 * 60 * 60 * 1000, 24 * 60 * 60 * 1000, 60 * 60 * 1000, 60 * 1000, 1000]
const unit = ['年', '天', '小时', '分钟', '秒']

export function humanTimeAgo(value: number | string | undefined): string {
  if (!value) return ''
  if (typeof value === 'string') value = parseInt(value)
  if (value > 1000000000 && value < 10000000000) value = value * 1000
  const date = new Date(value)
  let ct = new Date().getTime() - date.getTime()
  if (ct < 0) return ''

  const sb = []
  for (let i = 0; i < byTime.length; i++) {
    if (ct < byTime[i]) {
      continue
    }
    const temp = Math.floor(ct / byTime[i])
    ct = ct % byTime[i]
    if (temp > 0) {
      sb.push(temp + unit[i])
    }

    /* sb.length控制最多输出几个时间单位：
        一个时间单位如：N分钟前
        两个时间单位如：M分钟N秒前
        三个时间单位如：M年N分钟X秒前
    */
    if (sb.length >= 1) {
      break
    }
  }
  return sb.join('') + '前'
}


export function humanDateTime(value: number | string | undefined): string {
  if (!value) return ''
  if (typeof value === 'string') value = parseInt(value)
  if (value > 1000000000 && value < 10000000000) value = value * 1000
  const date = new Date(value)
  const y = date.getFullYear().toString()
  if (y == 'NaN') return ''
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

export function humanDateTimeYMD(value: number | string | undefined): string {
  if (!value) return ''
  if (typeof value === 'string') value = parseInt(value)
  if (value > 1000000000 && value < 10000000000) value = value * 1000
  const date = new Date(value)
  const y = date.getFullYear().toString()
  if (y == 'NaN') return ''
  let m: number | string = date.getMonth() + 1
  m = m < 10 ? '0' + m.toString() : m.toString()
  let d: number | string = date.getDate()
  d = d < 10 ? '0' + d.toString() : d.toString()

  return y + '-' + m + '-' + d 
}

export function humanDateTimeDateStr(value: string | undefined): string {
  if (!value) return ''
  const date = new Date(value)
  const y = date.getFullYear().toString()
  if (y == 'NaN') return ''
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

export function humanDateTimeDateStrYMD(value: string | undefined): string {
  if (!value) return ''
  const date = new Date(value)
  const y = date.getFullYear().toString()
  if (y == 'NaN') return ''
  let m: number | string = date.getMonth() + 1
  m = m < 10 ? '0' + m.toString() : m.toString()
  let d: number | string = date.getDate()
  d = d < 10 ? '0' + d.toString() : d.toString()

  return y + '-' + m + '-' + d 
}


export function humanTime(value: number | string | undefined): string {
  if (!value) return ''
  if (typeof value === 'string') value = parseInt(value)
  const hours = Math.floor(value / 3600)
  value = value % 3600
  const minutes = Math.floor(value / 60)
  value = value % 60
  const seconds = Math.floor(value)

  const hourStr = (hours < 10 ? '0' : '') + String(hours)
  const minStr = (minutes < 10 ? '0' : '') + String(minutes)
  const secStr = (seconds < 10 ? '0' : '') + String(seconds)
  return hourStr + ':' + minStr + ':' + secStr 
}

export function humanTimeFM(value: number | string | undefined): string {
  if (!value) return ''
  if (typeof value === 'string') value = parseInt(value)
  if (value <= 0) return '00:00'

  const minutes = Math.floor(value / 60)
  value = value % 60
  const seconds = Math.floor(value)

  const minStr = (minutes < 10 ? '0' : '') + String(minutes)
  const secStr = (seconds < 10 ? '0' : '') + String(seconds)
  return minStr + ':' + secStr 
}

export function humanExpiration(expiration: string | undefined, timenow: number = new Date().getTime()): string {
  if (expiration) {
    const date = Math.floor((new Date(expiration).getTime() - timenow) / 1000) 
    if (date <= 0) return '过期失效'
    else if (date < 60) return date + '秒后'
    else if (date < 3600) return (date / 60).toFixed(1) + '分钟'
    else if (date < 3600 * 24) return (date / 3600).toFixed(1) + '小时'
    else return (date / 3600 / 24).toFixed(1) + '天后'
  } else {
    return '永久'
  }
}


export function GetKeyHashHex(full: string): string {
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
      break
    case 2:
      k1 ^= buffa.readUInt8(i + 1) << 8
      break
    case 1:
      k1 ^= buffa.readUInt8(i)
      k1 = ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff
      k1 = (k1 << 15) | (k1 >>> 17)
      k1 = ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff
      h1 ^= k1
      break
  }

  h1 ^= buffa.length
  h1 ^= h1 >>> 16
  h1 = ((h1 & 0xffff) * 0x85ebca6b + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff
  h1 ^= h1 >>> 13
  h1 = ((h1 & 0xffff) * 0xc2b2ae35 + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16)) & 0xffffffff
  h1 ^= h1 >>> 16
  return (h1 >>> 0).toString(16).padStart(8, '0') 
}


export function GetKeyHashNumber(full: string): number {
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
      break
    case 2:
      k1 ^= buffa.readUInt8(i + 1) << 8
      break
    case 1:
      k1 ^= buffa.readUInt8(i)
      k1 = ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff
      k1 = (k1 << 15) | (k1 >>> 17)
      k1 = ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff
      h1 ^= k1
      break
  }

  h1 ^= buffa.length
  h1 ^= h1 >>> 16
  h1 = ((h1 & 0xffff) * 0x85ebca6b + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff
  h1 ^= h1 >>> 13
  h1 = ((h1 & 0xffff) * 0xc2b2ae35 + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16)) & 0xffffffff
  h1 ^= h1 >>> 16
  return h1 >>> 0 
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

export function guid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
const pk = 'abcDEfgFGHJIdeoOPQpyzABqwxC5678KLhijklmnMNWXYZ012rstuv34RSTUV99'
export function randomSharePassword(): string {
  return 'xxxx'.replace(/[x]/g, function (c) {
    const r = Math.floor((Math.random() * 169) | 0) % (pk.length - 1)
    return pk.substring(r, r + 1)
  })
}


export function b64encode(str: string): string {
  try {
    return Buffer.from(str).toString('base64')
  } catch {
    return ''
  }
}


export function b64decode(base64: string): string {
  try {
    return Buffer.from(base64, 'base64').toString()
  } catch {
    return ''
  }
}

export function B64decode(b64str: string): string {
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

export function B64encode(str: string): string {
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


export function Unicode(str: string): string {
  const v = str.split('')
  let ascii = ''
  for (let i = 0, maxi = v.length; i < maxi; i++) {
    const code = Number(v[i].charCodeAt(0))
    ascii += '\\u' + code.toString(16).padStart(4, '0')
  }
  return ascii
}
