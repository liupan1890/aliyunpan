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


export function ClearFileName(filename: string): string {
  if (!filename) return ''
  /**
   * window 文件名不能含有 < > : " / \ | ? *  不能空格开头结尾 不能以点结尾
   * mac 文件名不能以.开头
   * linux 不能有 /
   *
   * js 可无脑转义元字符: ^ $ . * + ? | \ / ( ) [ ] { } = ! : - ,
   * */
  filename = filename.replace(/[<>\:"\/\\\|\?\*]+/g, '')
  filename = filename.replace(/[\f\n\r\t\v]/g, '')
  while (filename.endsWith(' ') || filename.endsWith('.')) filename = filename.substring(0, filename.length - 1)
  while (filename.startsWith(' ')) filename = filename.substring(1)
  if (window.platform == 'win32') {
  } else if (window.platform == 'darwin') {
    while (filename.startsWith('.')) filename = filename.substring(1)
  } else if (window.platform == 'linux') {
  }
  return filename
}


export function CheckFileName(filename: string): string {
  if (!filename) return '不能为空'
  /**
   * window 文件名不能含有 < > : " / \ | ? *  不能空格开头结尾 不能以点结尾
   * mac 文件名不能以.开头
   * linux 不能有 /
   *
   * js 可无脑转义元字符: ^ $ . * + ? | \ / ( ) [ ] { } = ! : - ,
   * */
  if (filename.match(/[<>\:"\/\\\|\?\*]+/g)) return '不能包含 < > : " /  | ? * '
  if (filename.match(/[\f\n\r\t\v]/g)) return '不能包含 \\f \\n \\r \\t \\v'
  if (filename.endsWith(' ') || filename.endsWith('.')) return '不能以空格或.结尾'
  if (filename.startsWith(' ')) return '不能以空格开头'
  if (window.platform == 'win32') {
  } else if (window.platform == 'darwin') {
    if (filename.startsWith('.')) '不能以.开头'
  } else if (window.platform == 'linux') {
  }
  return ''
}

export function CleanStringForCmd(title: string) {
  title = title.replace(/[<>"\/\\\|\?\* '&%$^`,;=()!\[\]\-~#]+/g, '')
  return title
}
