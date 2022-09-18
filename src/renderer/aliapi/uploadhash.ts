import { Sleep } from '../utils/format'
import { IUploadingUI } from '../utils/dbupload'
import { OpenFileHandle } from '../utils/filehelper'
import DBCache from '../utils/dbcache'

const fspromises = window.require('fs/promises')
const crypto = window.require('crypto')

const os = window.require('os')

const CPU = Math.min(8, Math.max(4, os.cpus().length / 2))


const sha1posMap = new Map<string, number>()

export default class AliUploadHash {
  
  static async GetBuffHashProof(access_token: string, buff: Buffer) {
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

  
  static async GetFilePreHash(filepath: string): Promise<string> {
    let hash = ''
    const filehandle = await OpenFileHandle(filepath)
    if (filehandle.error) return 'error' + filehandle.error

    if (filehandle.handle) {
      const buff = Buffer.alloc(1024)
      await filehandle.handle.read(buff, 0, buff.length, null)
      hash = crypto.createHash('sha1').update(buff).digest('hex')
      hash = hash.toUpperCase()
      await filehandle.handle.close()
    } else {
      hash = 'error读取文件失败'
    }
    return hash
  }

  
  static async GetFileHashProof(prehash: string, access_token: string, item: IUploadingUI): Promise<{ sha1: string; proof_code: string; error: string }> {
    let hash = ''
    let proof_code = ''
    let error = ''
    const size = item.Task.size
    if (size == 0) return { sha1: 'DA39A3EE5E6B4B0D3255BFEF95601890AFD80709', proof_code: '', error: '' }

    if (size > 1024000) {
      
      return this.GetFileHashProofWorker(prehash, access_token, item, size > 1024 * 1024 * 300)
    }

    const sha1 = crypto.createHash('sha1')
    const filehandle = await OpenFileHandle(item.Task.LocalFilePath)
    if (filehandle.error) {
      return { sha1: 'error', proof_code: '', error: filehandle.error }
    }

    if (filehandle.handle) {
      const buff = Buffer.alloc(1024 * 1024)
      let readlen = 0
      while (true) {
        if (!item.IsRunning) break
        const len = await filehandle.handle.read(buff, 0, buff.length, null)
        if (len.bytesRead > 0 && len.bytesRead == buff.length) {
          sha1.update(buff)
        } else if (len.bytesRead > 0) {
          sha1.update(buff.slice(0, len.bytesRead))
        }
        readlen += len.bytesRead
        if (len.bytesRead <= 0) break
      }
      if (item.IsRunning) {
        hash = sha1.digest('hex')
        hash = hash.toUpperCase()
        const m = unescape(encodeURIComponent(access_token))
        const buffa = Buffer.from(m)
        const md5a = crypto.createHash('md5').update(buffa).digest('hex')
        const start = Number(BigInt('0x' + md5a.substr(0, 16)) % BigInt(size))
        const end = Math.min(start + 8, size)
        const buffb = Buffer.alloc(end - start)
        await filehandle.handle.read(buffb, 0, buffb.length, start)
        proof_code = buffb.toString('base64')
        error = ''
      } else {
        
        hash = 'error'
        proof_code = ''
        error = ''
      }
      await filehandle.handle.close()
      return { sha1: hash, proof_code, error }
    } else {
      return { sha1: 'error', proof_code: '', error: '读取文件失败' }
    }
  }

  
  static async GetFileHashProofWorker(prehash: string, access_token: string, item: IUploadingUI, needSleep: boolean): Promise<{ sha1: string; proof_code: string; error: string }> {
    let hash = ''
    let proof_code = ''
    let error = ''
    const size = item.Task.size
    if (size == 0) return { sha1: 'DA39A3EE5E6B4B0D3255BFEF95601890AFD80709', proof_code: '', error: '' }

    if (prehash) {
      let hashlist = await DBCache.getFileHashList(item.Task.size, item.Task.mtime)
      for (let i = 0, maxi = hashlist.length; i < maxi; i++) {
        if (hashlist[i].presha1 == prehash && hashlist[i].name == item.Task.name) {
          
          const filehandle = await OpenFileHandle(item.Task.LocalFilePath)
          if (filehandle.error) {
            return { sha1: 'error', proof_code: '', error: filehandle.error }
          }
          const m = unescape(encodeURIComponent(access_token))
          const buffa = Buffer.from(m)
          const md5a = crypto.createHash('md5').update(buffa).digest('hex')
          const start = Number(BigInt('0x' + md5a.substr(0, 16)) % BigInt(size))
          const end = Math.min(start + 8, size)
          const buffb = Buffer.alloc(end - start)
          await filehandle.handle.read(buffb, 0, buffb.length, start)
          await filehandle.handle.close()
          let proof_code = buffb.toString('base64')
          return { sha1: hashlist[i].sha1, proof_code, error: '' }
        }
      }
    }

    if (needSleep) {
      item.Info.FailedMessage = '等待计算sha1'
      while (sha1posMap.size >= CPU) {
        await Sleep(200) 
      }
      item.Info.FailedMessage = ''
    }
    sha1posMap.set(item.UploadID, 0)
    item.Info.UploadSize = 0 
    const worker: any = new Worker('./sha1filework.js')
    await new Promise((resolve) => {
      worker.addEventListener('message', (event: any) => {
        if (event.data.hash == 'sha1') {
          if (event.data.readlen) {
            
            if (!item.IsRunning) worker.postMessage({ stop: true }) 
            sha1posMap.set(item.UploadID, event.data.readlen as number)
            item.Task.size = event.data.size as number
          }
          if (event.data.sha1) {
            
            hash = event.data.sha1
            proof_code = event.data.proof_code
            error = event.data.error
            resolve(null)
          }
        }
      })
      worker.addEventListener('error', function (event: any) {
        hash = 'error'
        proof_code = ''
        error = event.data.error
        resolve(null)
      })
      worker.postMessage({ hash: 'sha1', localFilePath: item.Task.LocalFilePath, access_token })
    })
      .catch((err: any) => {
        error = err.message || 'workercatch'
      })
      .then(() => {
        sha1posMap.delete(item.UploadID)
        worker.postMessage({ close: true })
      })

    item.Info.UploadSize = 0
    if (!item.IsRunning) return { sha1: 'error', proof_code: '', error: '' }

    
    if (hash != 'error' && prehash) {
      DBCache.saveFileHash({ size: item.Task.size, mtime: item.Task.mtime, presha1: prehash, sha1: hash, name: item.Task.name })
    }

    return { sha1: hash, proof_code, error }
  }

  static GetFileHashProofSpeed(UploadID: string) {
    return sha1posMap.get(UploadID) || 0
  }
}
