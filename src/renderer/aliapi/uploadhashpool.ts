import { IUploadingUI } from '../utils/dbupload'
import { OpenFileHandle } from '../utils/filehelper'
import DBCache from '../utils/dbcache'
import Sha1WorkerPool from '../utils/sha1workerpool'
const path = window.require('path')
const crypto = window.require('crypto')


const sha1PosMap = new Map<number, number>()
const sha1Pool = new Sha1WorkerPool()

export default class AliUploadHashPool {
  static GetFileHashProofSpeed(UploadID: number) {
    return sha1PosMap.get(UploadID) || 0
  }

  
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

  
  static async GetFileHashProofWorker(prehash: string, access_token: string, fileui: IUploadingUI): Promise<{ sha1: string; proof_code: string; error: string }> {
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

    sha1PosMap.set(fileui.UploadID, 0)
    fileui.Info.uploadSize = 0 

    await new Promise<void>((resolve) => {
      sha1Pool.StartWithCallback(
        { hash: 'sha1', localFilePath: path.join(fileui.localFilePath, fileui.File.partPath), access_token },
        (result: any, worker: Worker) => {
          if (result.hash == 'sha1') {
            if (result.readlen) {
              
              if (!fileui.IsRunning) worker.postMessage({ stop: true }) 
              sha1PosMap.set(fileui.UploadID, result.readlen as number)
              fileui.File.size = result.size as number
            }
            if (result.sha1) {
              
              hash = result.sha1
              proof_code = result.proof_code
              error = result.error
              sha1Pool.FinishWithCallback(worker)
              resolve()
            }
          }
        },
        (err: any, worker: Worker) => {
          hash = 'error'
          proof_code = ''
          error = err.message || 'workererror'
          sha1Pool.FinishWithCallback(worker)
          resolve()
        }
      )
    }).catch((err: any) => {
      error = err.message || 'workercatch'
    })

    sha1PosMap.delete(fileui.UploadID)
    fileui.Info.uploadSize = 0

    if (!fileui.IsRunning) return { sha1: 'error', proof_code: '', error: '' }

    
    if (hash != 'error' && prehash && fileui.File.size > 10240000) {
      DBCache.saveFileHash({ size: fileui.File.size, mtime: fileui.File.mtime, presha1: prehash, sha1: hash, name: path.basename(fileui.File.name) })
    }

    return { sha1: hash, proof_code, error }
  }
}
