/* eslint-disable no-unused-vars */
import { message } from 'ant-design-vue'
import DB from './db'

interface Dir {
  file_id: string
}

// 1122334455667788

// datamap

// 11

// 62ad76cd1f7dfdc28ad64c1eb6f22492a672a510
function GetDirSize(file_id: string) {
  let obj = DirSizeDataMap
  let i = 0
  const maxi = file_id.length - 4
  while (i < maxi) {
    const key = file_id.substring(i, i + 4)
    obj = obj.get(key)
    if (!obj) return 0
    i += 4
  }
  
  return obj.get(file_id.substring(i)) || 0
}

let DirSizeDataMap: Map<string, any> = new Map<string, any>()
function SetDirSizeMap(file_id: string, size: number) {
  let obj = DirSizeDataMap

  let i = 0
  const maxi = file_id.length - 8
  while (i < maxi) {
    const key = file_id.substring(i, i + 8)
    let find = obj.get(key)
    if (!find) {
      find = new Map<string, any>()
      obj.set(key, find)
    }
    obj = find
    i += 8
  }

  obj.set(file_id.substring(i), size)
}

let DirSizeDataObj: { [key: string]: any } = Object.create(null)
function SetDirSizeObject(file_id: string, size: number) {
  let obj = DirSizeDataObj

  let i = 0
  const maxi = file_id.length - 8
  while (i < maxi) {
    const key = file_id.substring(i, i + 8)
    let find = obj[key]
    if (!find) {
      find = Object.create(null)
      obj[key] = find
    }
    obj = find
    i += 8
  }

  obj[file_id.substring(i)] = size
}

export async function LoadObject() {
  console.time('LoadObject')
  window.openDatabase = {}
  const drive_id = '8699982'
  const jsonsize = await DB.getValueObject('DirFileSize_' + drive_id)
  window.openDatabase.sizemap = jsonsize ? (jsonsize as { [key: string]: number }) : {}
  // const jsonsizetime = await DB.getValueObject('DirFileSizeTime_' + drive_id)
  // window.openDatabase.sizetimemap = jsonsizetime ? (jsonsizetime as { [key: string]: number }) : {}
  console.timeEnd('LoadObject')
  message.success('LoadObject')
}

export async function CreatMap() {
  console.time('CreatMap')
  DirSizeDataMap = new Map<string, any>()
  const sizemap = window.openDatabase.sizemap as { [key: string]: number }
  const keys = Object.keys(sizemap)
  for (let i = 0, maxi = keys.length; i < maxi; i++) {
    // SetDirSizeMap(keys[i], sizemap[keys[i]])
    DirSizeDataMap.set(keys[i], [sizemap[keys[i]], 'size', true])
  }
  window.openDatabase.DirSizeDataMap = DirSizeDataMap
  DirSizeDataMap = new Map<string, any>()
  console.timeEnd('CreatMap')
  message.success('CreatMap')
}

export async function CreatObject() {
  console.time('CreatObject')
  DirSizeDataObj = Object.create(null)
  const sizemap = window.openDatabase.sizemap as { [key: string]: number }
  const keys = Object.keys(sizemap)
  for (let i = 0, maxi = keys.length; i < maxi; i++) {
    // SetDirSizeObject(keys[i], sizemap[keys[i]])
    DirSizeDataObj[keys[i]] = [sizemap[keys[i]], 'size', true]
  }
  window.openDatabase.DirSizeDataObj = DirSizeDataObj
  DirSizeDataObj = Object.create(null)
  console.timeEnd('CreatObject')
  message.success('CreatObject')
}
