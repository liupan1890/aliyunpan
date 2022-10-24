import { Sleep } from '../utils/format'
import { IUploadingUI } from '../utils/dbupload'
import { OpenFileHandle } from '../utils/filehelper'
import DBCache from '../utils/dbcache'

const path = window.require('path')
const crypto = window.require('crypto')

const os = window.require('os')

const CPU = Math.min(8, Math.max(4, os.cpus().length / 2))


const sha1PosMap = new Map<number, number>()

export default class AliUploadHash {
  
  static async GetBuffHashProof(access_token: string, buff: Buffer): Promise<{ sha1: string; proof_code: string }> {
    if (buff.length == 0) return { sha1: 'DA39A3EE5E6B4B0D3255BFEF95601890AFD80709', proof_code: '' }
    let hash = crypto.createHash('sha1').update(buff).digest('hex')
    hash = hash.toUpperCase()
    const m = unescape(encodeURIComponent(access_token))
    const buffa = Buffer.from(m)
    const md5a = crypto.createHash('md5').update(buffa).digest('hex')
    const start = Number(BigInt('0x' + md5a.substr(0, 16)) % BigInt(buff.length))
    const end = Math.min(start + 8, buff.length)
    const buffb = buff.slice(start, end)
    const proof_code = buffb.toString('base64')

    return { sha1: hash, proof_code }
  }

  
  static async GetFilePreHash(filePath: string): Promise<string> {
    let hash = ''
    const fileHandle = await OpenFileHandle(filePath)
    if (fileHandle.error) return 'error' + fileHandle.error

    if (fileHandle.handle) {
      const buff = Buffer.alloc(1024)
      await fileHandle.handle.read(buff, 0, buff.length, null)
      hash = crypto.createHash('sha1').update(buff).digest('hex')
      hash = hash.toUpperCase()
      await fileHandle.handle.close()
    } else {
      hash = 'error读取文件失败'
    }
    return hash
  }

  
  static async GetFileHashProof(prehash: string, access_token: string, fileui: IUploadingUI): Promise<{ sha1: string; proof_code: string; error: string }> {
    let hash = ''
    let proof_code = ''
    let error = ''
    const size = fileui.File.size
    if (size == 0) return { sha1: 'DA39A3EE5E6B4B0D3255BFEF95601890AFD80709', proof_code: '', error: '' }

    if (size > 1024000) {
      
      return this.GetFileHashProofWorker(prehash, access_token, fileui, size > 1024 * 1024 * 300)
    }

    const sha1 = crypto.createHash('sha1')
    const fileHandle = await OpenFileHandle(path.join(fileui.localFilePath, fileui.File.partPath))
    if (fileHandle.error) {
      return { sha1: 'error', proof_code: '', error: fileHandle.error }
    }

    if (fileHandle.handle) {
      const buff = Buffer.alloc(1024 * 1024)
      while (true) {
        if (!fileui.IsRunning) break
        const len = await fileHandle.handle.read(buff, 0, buff.length, null)
        if (len.bytesRead > 0 && len.bytesRead == buff.length) {
          sha1.update(buff)
        } else if (len.bytesRead > 0) {
          sha1.update(buff.slice(0, len.bytesRead))
        }
        if (len.bytesRead <= 0) break
      }
      if (fileui.IsRunning) {
        hash = sha1.digest('hex')
        hash = hash.toUpperCase()
        const m = unescape(encodeURIComponent(access_token))
        const buffa = Buffer.from(m)
        const md5a = crypto.createHash('md5').update(buffa).digest('hex')
        const start = Number(BigInt('0x' + md5a.substr(0, 16)) % BigInt(size))
        const end = Math.min(start + 8, size)
        const buffb = Buffer.alloc(end - start)
        await fileHandle.handle.read(buffb, 0, buffb.length, start)
        proof_code = buffb.toString('base64')
        error = ''
      } else {
        
        hash = 'error'
        proof_code = ''
        error = ''
      }
      await fileHandle.handle.close()
      return { sha1: hash, proof_code, error }
    } else {
      return { sha1: 'error', proof_code: '', error: '读取文件失败' }
    }
  }

  
  static async GetFileHashProofWorker(prehash: string, access_token: string, fileui: IUploadingUI, needSleep: boolean): Promise<{ sha1: string; proof_code: string; error: string }> {
    let hash = ''
    let proof_code = ''
    let error = ''
    const size = fileui.File.size
    if (size == 0) return { sha1: 'DA39A3EE5E6B4B0D3255BFEF95601890AFD80709', proof_code: '', error: '' }

    if (fileui.File.size >= 10240000 && !prehash.startsWith('error')) {
      const sha1 = await DBCache.getFileHash(fileui.File.size, fileui.File.mtime, prehash, path.basename(fileui.File.name))
      if (sha1) {
        
        const fileHandle = await OpenFileHandle(path.join(fileui.localFilePath, fileui.File.partPath))
        if (fileHandle.error) {
          return { sha1: 'error', proof_code: '', error: fileHandle.error }
        }
        const m = unescape(encodeURIComponent(access_token))
        const buffa = Buffer.from(m)
        const md5a = crypto.createHash('md5').update(buffa).digest('hex')
        const start = Number(BigInt('0x' + md5a.substr(0, 16)) % BigInt(size))
        const end = Math.min(start + 8, size)
        const buffb = Buffer.alloc(end - start)
        await fileHandle.handle.read(buffb, 0, buffb.length, start)
        await fileHandle.handle.close()
        const proof_code = buffb.toString('base64')
        return { sha1, proof_code, error: '' }
      }
    }

    if (needSleep) {
      fileui.Info.failedMessage = '等待计算sha1'
      while (sha1PosMap.size >= CPU) {
        await Sleep(200) 
      }
      fileui.Info.failedMessage = ''
    }
    sha1PosMap.set(fileui.UploadID, 0)
    fileui.Info.uploadSize = 0 
    const worker: any = new Worker('./sha1filework.js')
    await new Promise<void>((resolve) => {
      worker.addEventListener('message', (event: any) => {
        if (event.data.hash == 'sha1') {
          if (event.data.readlen) {
            
            if (!fileui.IsRunning) worker.postMessage({ stop: true }) 
            sha1PosMap.set(fileui.UploadID, event.data.readlen as number)
            fileui.File.size = event.data.size as number
          }
          if (event.data.sha1) {
            
            hash = event.data.sha1
            proof_code = event.data.proof_code
            error = event.data.error
            resolve()
          }
        }
      })
      worker.addEventListener('error', function (event: any) {
        hash = 'error'
        proof_code = ''
        error = event.data.error
        resolve()
      })
      worker.postMessage({ hash: 'sha1', localFilePath: path.join(fileui.localFilePath, fileui.File.partPath), access_token })
    })
      .catch((err: any) => {
        error = err.message || 'workercatch'
      })
      .then(() => {
        sha1PosMap.delete(fileui.UploadID)
        worker.postMessage({ close: true })
      })

    fileui.Info.uploadSize = 0
    if (!fileui.IsRunning) return { sha1: 'error', proof_code: '', error: '' }

    
    if (hash != 'error' && prehash) {
      DBCache.saveFileHash({ size: fileui.File.size, mtime: fileui.File.mtime, presha1: prehash, sha1: hash, name: path.basename(fileui.File.name) })
    }

    return { sha1: hash, proof_code, error }
  }

  static GetFileHashProofSpeed(UploadID: number): number {
    return sha1PosMap.get(UploadID) || 0
  }
}
