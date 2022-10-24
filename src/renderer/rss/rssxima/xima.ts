import { FileSystemErrorMessage } from '../../utils/filehelper'
import DebugLog from '../../utils/debuglog'
import message from '../../utils/message'

const { Buffer } = window.require('buffer')
const fspromises = window.require('fs/promises')
const path = window.require('path')

export async function DoXiMa(dirPath: string, breakSmall: boolean, matchExtList: string[]): Promise<number> {
  const fileList: string[] = []
  await GetAllFiles(dirPath, breakSmall, fileList)
  if (fileList.length == 0) {
    message.error('选择的文件夹下找不到任何文件')
    return 0
  } else {
    let rand = Date.now()
    const rand1 = rand % 256
    rand = rand / 128
    const rand2 = Math.floor(rand % 256)
    let rand3 = Math.floor(Math.random() * 255)

    let runCount = 0
    for (let i = 0, maxi = fileList.length; i < maxi; i++) {
      const file = fileList[i].toLowerCase().trimEnd()
      if (matchExtList.length > 0) {
        
        let find = false
        for (let j = 0; j < matchExtList.length; j++) {
          if (file.endsWith(matchExtList[j])) {
            find = true
            break
          }
        }
        if (find == false) continue 
      }
      try {
        const rand4 = (i % 255) + 1
        if (rand4 == 200) rand3 = Math.floor(Math.random() * 255)
        const buff = Buffer.from([0, rand1, rand2, rand3, rand4])
        fspromises.appendFile(fileList[i], buff).catch(() => {})
        runCount++
      } catch (err: any) {
        DebugLog.mSaveDanger('XM appendFile' + (err.message || '') + fileList[i])
      }
    }
    return runCount
  }
}

async function GetAllFiles(dir: string, breakSmall: boolean, fileList: string[]) {
  if (dir.endsWith(path.sep) == false) dir = dir + path.sep
  try {
    const childfiles = await fspromises.readdir(dir).catch((err: any) => {
      err = FileSystemErrorMessage(err.code, err.message)
      DebugLog.mSaveDanger('XMGetAllFiles文件失败：' + dir, err)
      message.error('跳过文件夹：' + err + ' ' + dir)
      return []
    })

    let allTask: Promise<void>[] = []
    const dirList: string[] = []
    for (let i = 0, maxi = childfiles.length; i < maxi; i++) {
      const name = childfiles[i] as string
      if (name.startsWith('.')) continue
      if (name.startsWith('#')) continue
      const item = dir + name
      allTask.push(
        fspromises
          .lstat(item)
          .then((stat: any) => {
            if (stat.isDirectory()) dirList.push(item)
            else if (stat.isSymbolicLink()) {
              // donothing
            } else if (stat.isFile()) {
              if (breakSmall == false || stat.size > 5 * 1024 * 1024) fileList.push(item)
            }
          })
          .catch()
      )
      if (allTask.length > 10) {
        await Promise.all(allTask).catch(() => {})
        allTask = []
      }
    }

    if (allTask.length > 0) {
      await Promise.all(allTask).catch(() => {})
      allTask = []
    }

    for (let i = 0, maxi = dirList.length; i < maxi; i++) {
      await GetAllFiles(dirList[i], breakSmall, fileList)
    }
  } catch (err: any) {
    DebugLog.mSaveDanger('GetAllFiles' + (err.message || ''))
  }

  return true
}
