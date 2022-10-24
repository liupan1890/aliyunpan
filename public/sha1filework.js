const worker = self
const fspromises = global.require('fs/promises')
var crypto = global.require('crypto')
let running = false
process.noAsar = true
worker.addEventListener('message', (event) => {
  if (event.data.hash && event.data.hash == 'sha1') {
    const localFilePath = event.data.localFilePath
    const access_token = event.data.access_token
    fileSha1(localFilePath, access_token).catch((e) => {
      worker.postMessage({ hash: 'sha1', sha1: 'error', proof_code: '', error: FileSystemErrorMessage(e.code, e.message) })
      running = false
    })
  }
  if (event.data.stop) {
    running = false
  }
  if (event.data.close) {
    close()
  }
})
worker.addEventListener('error', (e) => {
  worker.postMessage({ hash: 'sha1', sha1: 'error', proof_code: '', error: FileSystemErrorMessage(e.code, e.message) })
  running = false
})

async function fileSha1(localFilePath, access_token) {
  running = true
  let hash = ''
  var sha1 = crypto.createHash('sha1')
  const fileHandle = await fspromises.open(localFilePath, 'r')
  try {
    if (fileHandle) {
      const stat = await fileHandle.stat()
      const size = stat.size
      const buff = Buffer.alloc(4 * 1024 * 1024)
      let readlen = 0

      let timer = setInterval(function () {
        const message = '计算sha1(' + Math.floor((readlen * 100) / size).toString() + '%)'
        worker.postMessage({ hash: 'sha1', readlen, size, message })
      }, 300)

      while (true) {
        if (!running) break
        const len = await fileHandle.read(buff, 0, buff.length, null)
        if (len.bytesRead > 0 && len.bytesRead == buff.length) {
          sha1.update(buff)
        } else if (len.bytesRead > 0) {
          sha1.update(buff.slice(0, len.bytesRead))
        }
        readlen += len.bytesRead

        if (len.bytesRead <= 0) break
      }
      clearInterval(timer)
      let proof_code = ''
      if (running) {
        hash = sha1.digest('hex')
        hash = hash.toUpperCase()
        const m = unescape(encodeURIComponent(access_token))
        const buffa = Buffer.from(m)
        const md5a = crypto.createHash('md5').update(buffa).digest('hex')
        const start = Number(BigInt('0x' + md5a.substr(0, 16)) % BigInt(size))
        const end = Math.min(start + 8, size)
        const buffb = Buffer.alloc(end - start)
        await fileHandle.read(buffb, 0, buffb.length, start)
        proof_code = buffb.toString('base64')
      } else {
        hash = 'error'
        proof_code = ''
        /** 这里无所谓了，外部会error='' */
      }

      worker.postMessage({ hash: 'sha1', sha1: hash, proof_code, error: '' })
      running = false
    } else {
      worker.postMessage({ hash: 'sha1', sha1: 'error', proof_code: '', error: '打开文件失败' })
      running = false
    }
  } catch {}
  try {
    await fileHandle?.close()
  } catch {}
}

function FileSystemErrorMessage(code, message) {
  if (!code && !message) return '读取文件失败'

  if (code) {
    switch (code) {
      case 'EACCES':
        return '没有权限访问'
      case 'EEXIST':
        return '存在重名文件'
      case 'EISDIR':
        return '不能是文件夹'
      case 'EMFILE':
        return '同时打开文件过多'
      case 'ENFILE':
        return '同时打开文件过多'
      case 'ENOENT':
        return '该路径不存在'
      case 'ENOTDIR':
        return '不能是文件'
      case 'ENOTEMPTY':
        return '文件夹不为空'
      case 'EPERM':
        return '没有权限访问'
      case 'EBUSY':
        return '文件被其他程序占用'
      case 'ETIMEDOUT':
        return '操作超时'
      case 'EDQUOT':
        return '超出磁盘配额'
      case 'EFBIG':
        return '文件太大'
      case 'EIDRM':
        return '文件已被删除'
      case 'EIO':
        return 'IO错误'
      case 'ELOOP':
        return '路径级别过多'
      case 'ENAMETOOLONG':
        return '文件名太长'
      case 'ENODEV':
        return '找不到设备'
      case 'ENOMEM':
        return '没有足够的空间'
      case 'ENOSPC':
        return '没有可用空间'
      case 'EROFS':
        return '只读文件'
    }
  }
  if (message && typeof message == 'string' && message.indexOf('EACCES') >= 0) return '没有权限访问'
  let err = (code || '') + (message || '')
  if (err) return err
  return '读取文件失败'
}
