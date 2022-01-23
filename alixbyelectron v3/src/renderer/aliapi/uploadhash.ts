import SettingLog from '@/setting/settinglog'
import { Sleep } from '@/store/format'
import { IStateUploadFile } from '@/store/models'

const fspromises = window.require('fs/promises')
const crypto = window.require('crypto')

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
    const filehandle = await fspromises.open(filepath, 'r').catch((e: any) => {
      if (e.code && e.code === 'EPERM') e = '文件没有读取权限'
      if (e.code && e.code === 'EBUSY') e = '文件被占用或锁定中'
      if (e.message) e = e.message
      if (typeof e == 'string' && e.indexOf('EACCES') >= 0) e = '文件没有读取权限'
      SettingLog.mSaveLog('danger', 'PreHash上传文件失败：' + filepath + ' ' + (e || ''))
      return typeof e == 'string' && e.startsWith('文件') ? e : '读取文件失败'
    })
    if (filehandle && typeof filehandle == 'string') return 'error' + filehandle

    if (filehandle) {
      const buff = Buffer.alloc(1024)
      await filehandle.read(buff, 0, buff.length, null)
      hash = crypto.createHash('sha1').update(buff).digest('hex')
      hash = hash.toUpperCase()
      await filehandle?.close()
    } else {
      hash = 'error读取文件失败'
    }
    return hash
  }

  static async GetFileHashProof(access_token: string, file: IStateUploadFile) {
    let hash = ''
    let proof_code = ''
    const size = file.Info.size
    if (size == 0) return { sha1: 'DA39A3EE5E6B4B0D3255BFEF95601890AFD80709', proof_code: '' }

    if (size > 1024 * 1024 * 5) {
      if (size > 1024 * 1024 * 300) return this.GetFileHashProofBigSleep(access_token, file)
      return this.GetFileHashProofBig(access_token, file)
    }

    file.Upload.FailedMessage = '计算sha1'

    const sha1 = crypto.createHash('sha1')
    const filehandle = await fspromises.open(file.Info.localFilePath, 'r').catch((e: any) => {
      if (e.code && e.code === 'EPERM') e = '文件没有读取权限'
      if (e.code && e.code === 'EBUSY') e = '文件被占用或锁定中'
      if (e.message) e = e.message
      if (typeof e == 'string' && e.indexOf('EACCES') >= 0) e = '文件没有读取权限'
      SettingLog.mSaveLog('danger', 'HashProof上传文件失败：' + file.Info.localFilePath + ' ' + (e || ''))
      return typeof e == 'string' && e.startsWith('文件') ? e : '读取文件失败'
    })
    if (filehandle && typeof filehandle == 'string') {
      file.Upload.FailedMessage = ''
      return { sha1: 'error', proof_code: filehandle }
    }

    if (filehandle) {
      const buff = Buffer.alloc(1024 * 1024)
      let readlen = 0
      while (true) {
        if (file.Upload.DownState !== 'active') break
        const len = await filehandle.read(buff, 0, buff.length, null)
        if (len.bytesRead > 0 && len.bytesRead == buff.length) {
          sha1.update(buff)
        } else if (len.bytesRead > 0) {
          sha1.update(buff.slice(0, len.bytesRead))
        }
        readlen += len.bytesRead
        file.Upload.FailedMessage = '计算sha1(' + Math.floor((readlen * 100) / size).toString() + '%)'
        if (len.bytesRead <= 0) break
      }
      if (file.Upload.DownState == 'active') {
        hash = sha1.digest('hex')
        hash = hash.toUpperCase()
        const m = unescape(encodeURIComponent(access_token))
        const buffa = Buffer.from(m)
        const md5a = crypto.createHash('md5').update(buffa).digest('hex')
        const start = Number(BigInt('0x' + md5a.substr(0, 16)) % BigInt(size))
        const end = Math.min(start + 8, size)
        const buffb = Buffer.alloc(end - start)
        await filehandle.read(buffb, 0, buffb.length, start)
        proof_code = buffb.toString('base64')
      } else {
        hash = 'error'
        proof_code = ''
      }
      await filehandle?.close()
      file.Upload.FailedMessage = ''
      return { sha1: hash, proof_code }
    } else {
      file.Upload.FailedMessage = ''
      return { sha1: 'error', proof_code: '读取文件失败' }
    }
  }

  static async GetFileHashProofBigSleep(access_token: string, file: IStateUploadFile) {
    let hash = ''
    let proof_code = ''
    const size = file.Info.size
    if (size == 0) return { sha1: 'DA39A3EE5E6B4B0D3255BFEF95601890AFD80709', proof_code: '' }
    file.Upload.FailedMessage = '等待计算sha1'
    while (sha1posMap.size > 2) {
      await Sleep(100)
    }
    file.Upload.FailedMessage = '计算sha1'
    sha1posMap.set(file.UploadID, 0)
    file.Upload.DownSize = 0
    await new Promise((resolve) => {
      const worker: any = new Worker('./nodework.js')
      worker.addEventListener('message', (event: any) => {
        if (event.data.hash == 'sha1') {
          if (event.data.readlen) {
            if (file.Upload.DownState !== 'active') worker.postMessage({ stop: true })
            if (sha1posMap.has(file.UploadID)) sha1posMap.set(file.UploadID, event.data.readlen as number)
            file.Upload.FailedMessage = event.data.message
            file.Info.size = event.data.size as number
          }
          if (event.data.sha1) {
            sha1posMap.delete(file.UploadID)
            hash = event.data.sha1
            proof_code = event.data.proof_code
            resolve(null)
          }
        }
      })
      worker.addEventListener('error', function (event: any) {
        sha1posMap.delete(file.UploadID)
        hash = event.data.sha1
        proof_code = event.data.proof_code
        resolve(null)
      })
      worker.postMessage({ hash: 'sha1', localFilePath: file.Info.localFilePath, access_token })
    })
      .catch(() => {})
      .then(() => {
        sha1posMap.delete(file.UploadID)
      })

    file.Upload.DownSize = 0
    file.Upload.FailedMessage = ''
    if (file.Upload.DownState !== 'active') return { sha1: 'error', proof_code: '' }

    if (hash == 'error') {
      proof_code = ''
    }
    return { sha1: hash, proof_code }
  }

  static async GetFileHashProofBig(access_token: string, file: IStateUploadFile) {
    let hash = ''
    let proof_code = ''
    const size = file.Info.size
    if (size == 0) return { sha1: 'DA39A3EE5E6B4B0D3255BFEF95601890AFD80709', proof_code: '' }
    file.Upload.FailedMessage = '计算sha1'
    sha1posMap.set(file.UploadID, 0)
    file.Upload.DownSize = 0
    await new Promise((resolve) => {
      const worker: any = new Worker('./nodework.js')
      worker.addEventListener('message', (event: any) => {
        if (event.data.hash == 'sha1') {
          if (event.data.readlen) {
            if (file.Upload.DownState !== 'active') worker.postMessage({ stop: true })
            if (sha1posMap.has(file.UploadID)) sha1posMap.set(file.UploadID, event.data.readlen as number)
            file.Upload.FailedMessage = event.data.message
            file.Info.size = event.data.size as number
          }
          if (event.data.sha1) {
            sha1posMap.delete(file.UploadID)
            hash = event.data.sha1
            proof_code = event.data.proof_code
            resolve(null)
          }
        }
      })
      worker.addEventListener('error', function (event: any) {
        sha1posMap.delete(file.UploadID)
        hash = event.data.sha1
        proof_code = event.data.proof_code
        resolve(null)
      })
      worker.postMessage({ hash: 'sha1', localFilePath: file.Info.localFilePath, access_token })
    })
      .catch(() => {})
      .then(() => {
        sha1posMap.delete(file.UploadID)
      })

    file.Upload.DownSize = 0
    file.Upload.FailedMessage = ''
    if (file.Upload.DownState !== 'active') return { sha1: 'error', proof_code: '' }
    return { sha1: hash, proof_code }
  }

  static GetFileHashProofSpeed(UploadID: string) {
    return sha1posMap.get(UploadID) || 0
  }
}
