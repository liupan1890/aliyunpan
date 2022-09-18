export function ArrayCopyReverse(arr: any[]) {
  let copy: any[] = []
  for (let i = arr.length - 1; i >= 0; i--) {
    copy.push(arr[i])
  }
  return copy
}
export function ArrayCopy(arr: any[]) {
  let copy: any[] = []
  for (let i = 0, maxi = arr.length; i < maxi; i++) {
    copy.push(arr[i])
  }
  return copy
}

export function MapKeyToArray<T>(map: Map<T, any>) {
  let arr: T[] = []
  let keys = map.keys()
  for (let i = 0, maxi = map.size; i < maxi; i++) {
    arr.push(keys.next().value)
  }
  return arr
}

export function MapValueToArray<T>(map: Map<any, T>) {
  let arr: T[] = []
  let keys = map.values()
  for (let i = 0, maxi = map.size; i < maxi; i++) {
    arr.push(keys.next().value)
  }
  return arr
}

export function ArrayToMap<T>(keyname: string, arr: T[]) {
  let map = new Map<any, T>()
  let item: any
  for (let i = 0, maxi = arr.length; i < maxi; i++) {
    item = arr[i]
    map.set(item[keyname], item)
  }
  return map
}

export function ArrayKeyList(keyname: string, arr: any[]) {
  const selectkeys: string[] = []
  for (let i = 0, maxi = arr.length; i < maxi; i++) {
    selectkeys.push(arr[i][keyname])
  }
  return selectkeys
}

export function BlobToString(body: Blob, encoding: string): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsText(body, encoding)
    reader.onload = function () {
      resolve((reader.result as string) || '')
    }
  })
}

export function BlobToBuff(body: Blob): Promise<ArrayBuffer | undefined> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsArrayBuffer(body)
    reader.onload = function () {
      resolve(reader.result as ArrayBuffer)
    }
  })
}

const { deflateRawSync, inflateRawSync } = window.require('zlib')

export function GzipObject(input: object): Buffer {
  return deflateRawSync(JSON.stringify(input))
}

export function UnGzipObject(input: Buffer): object {
  return JSON.parse(inflateRawSync(input).toString())
}

export function HanToPin(input: string): string {
  if (!input) return ''
  let arr = pinyinlite(input, { keepUnrecognized: true })
  let strarr = new Array<string>(arr.length * 2 + 1)
  let l = false
  for (let p = 1, i = 0, maxi = arr.length; i < maxi; p += 2, i++) {
    strarr[p] = arr[i].join(' ')
    l = strarr[p].length > 1
    if (l) {
      strarr[p - 1] = ' '
      strarr[p + 1] = ' '
    } else {
      strarr[p + 1] = ''
    }
  }
  strarr[0] = ''
  return strarr.join('')
}


export function GetOssExpires(downurl: string) {
  if (!downurl || downurl.includes('x-oss-expires=') == false) return 0
  try {
    
    let expires = downurl.substring(downurl.indexOf('x-oss-expires=') + 'x-oss-expires='.length)
    expires = expires.substring(0, expires.indexOf('&'))
    const lasttime = parseInt(expires) - Math.floor(Date.now() / 1000) 
    return lasttime
  } catch {
    return 0
  }
}

export function hashCode(key: string) {
  let hash = 0
  for (let i = 0, maxi = key.length; i < maxi; i++) {
    hash = ((hash << 5) - hash + key.charCodeAt(i++)) << 0
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}
const crypto = window.require('crypto')
export function md5Code(key: string) {
  const buffa = Buffer.from(key)
  const md5a = crypto.createHash('md5').update(buffa).digest('hex')
  return md5a
}
