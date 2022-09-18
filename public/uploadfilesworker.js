const worker = self
process.noAsar = true
const path = global.require('path')
const fspromises = global.require('fs/promises')

worker.addEventListener('message', (event) => {
  let { ingoredList, user_id, drive_id, parentid, files } = event.data
  UploadLocalFiles(ingoredList, user_id, drive_id, parentid, files).catch((e) => {
    worker.postMessage({ state: 'error', message: e.message })
  })
})
worker.addEventListener('error', (e) => {
  worker.postMessage({ state: 'error', message: e.message })
})

/** 快速hash 8位 */
function hashCode(key) {
  let hash = 0
  for (let i = 0, maxi = key.length; i < maxi; i++) {
    hash = ((hash << 5) - hash + key.charCodeAt(i++)) << 0
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']

/** 11.02MB  */
function humanSize(bytes) {
  if (!bytes && bytes != 0) return ''
  if (typeof bytes === 'string') bytes = parseInt(bytes)
  let u = 0
  while (bytes >= 1024 && u < units.length - 1) {
    bytes /= 1024
    ++u
  }
  return `${bytes.toFixed(2)}${units[u]}`
}

async function UploadLocalFiles(ingoredList, user_id, drive_id, parentid, files) {
  let addlist = []
  let errlist = []

  const PID = hashCode(drive_id + '_' + parentid)
  let plist = []
  /** number 最长16位 9007199254740992 now() 1654699553396 长13位 */
  let dirtime = Math.floor(Date.now() / 1000) * 1000000 /** 总长16位，0-10万给文件夹，数大的显示在前面 */
  let filetime = dirtime + 100000 + 1000000000000000 /** 总长16位，10万-99万给文件，数大的显示在前面 */
  let addcount = 0
  const formax = ingoredList.length
  for (let i = 0, maxi = files.length; i < maxi; i++) {
    let filepath = files[i]
    /** 过滤掉特殊文件 */
    if (filepath.endsWith('$RECYCLE.BIN')) continue
    if (filepath.endsWith('$LOGFILE')) continue
    if (filepath.endsWith('$VOLUME')) continue
    if (filepath.endsWith('$BITMAP')) continue
    if (filepath.endsWith('$MFT')) continue
    if (filepath.endsWith('System Volume Information')) continue
    const filepathlower = filepath.toLowerCase()
    plist.push(
      fspromises
        .lstat(filepath)
        .then((stat) => {
          if (stat.isSymbolicLink()) return /** 过滤掉软链接文件 */
          let isdir = stat.isDirectory()
          if (isdir == false) {
            if (stat.isFile() == false) return /** 过滤非文件 */
            for (let j = 0; j < formax; j++) {
              if (filepathlower.endsWith(ingoredList[j])) return /** 后缀过滤 */
            }
          }
          let name = path.basename(filepath)
          const UploadID = PID + '_' + hashCode(filepath) + '_' + (isdir ? 'd' : 'f') + '_' + hashCode(name) + '_' + stat.size.toString(16)
          addlist.push({
            UploadID: UploadID,
            UploadTime: 0,
            user_id: user_id,
            localFilePath: filepath,
            parent_id: parentid,
            drive_id: drive_id,
            name: name,
            mtime: stat.mtime.getTime() /** 毫秒 */,
            size: stat.size,
            sizestr: humanSize(stat.size),
            icon: isdir ? 'iconfont iconfile-folder' : 'iconfont iconwenjian',
            isDir: isdir,
            up_rapid: false,
            up_file_id: ''
          })
        })
        .catch((e) => {
          if (e.code && e.code === 'EPERM') {
            errlist.push('上传文件出错 没有权限访问 ' + filepath)
            return
          }
          if (e.code && e.code === 'EBUSY') {
            errlist.push('上传文件出错 文件被占用或锁定中 ' + filepath)
            return
          }
          errlist.push('上传文件出错 ' + filepath + ' ' + JSON.stringify(e))
        })
    )

    if (plist.length >= 10) {
      await Promise.all(plist).catch(() => {})
      /** 等待全部结束，没有任务修改addlist时 */
      plist = []

      if (addlist.length >= 2000) {
        /** 太多了，先保存一点 */
        const savefilelist = []
        const savedirlist = []
        for (let i = 0, maxi = addlist.length; i < maxi; i++) {
          const item = addlist[i]
          if (item.isDir) {
            item.UploadTime = dirtime++
            savedirlist.push(item)
          } else {
            item.UploadTime = filetime++
            savefilelist.push(item)
          }
        }

        addcount += addlist.length
        addlist = []
        await saveUploadFileBatch(savefilelist.concat(savedirlist))
      }
    }
  }
  await Promise.all(plist).catch(() => {})
  /** 等待全部结束，没有任务修改addlist时 */
  const savefilelist = []
  const savedirlist = []
  for (let i = 0, maxi = addlist.length; i < maxi; i++) {
    const item = addlist[i]
    if (item.isDir) {
      item.UploadTime = dirtime++
      savedirlist.push(item)
    } else {
      item.UploadTime = filetime++
      savefilelist.push(item)
    }
  }
  addcount += addlist.length
  await saveUploadFileBatch(savefilelist.concat(savedirlist))
  worker.postMessage({ state: 'success', addcount, errlist })
}

async function saveUploadFileBatch(savelist) {
  let db = await openDB('XBYDB3Upload')
  if (db) {
    await saveDB(db, 'iuploadfile', savelist)
    db.close()
  }
}

function openDB(dbName) {
  return new Promise((resolve, reject) => {
    const request = global.indexedDB.open(dbName)
    request.onsuccess = function (event) {
      resolve(event.target.result)
    }
    request.onerror = function (event) {
      resolve(undefined)
    }
  })
}
function saveDB(db, storeName, savelist) {
  return new Promise((resolve, reject) => {
    var tran = db.transaction([storeName], 'readwrite')
    var store = tran.objectStore(storeName)
    for (let i = 0, maxi = savelist.length; i < maxi; i++) {
      store.put(savelist[i])
    }
    tran.oncomplete = function (event) {
      console.log(event)
      resolve(true)
    }
    tran.onerror = function (event) {
      console.log(event)
      resolve(false)
    }
  })
}
