import DebugLog from './debuglog'
const fspromises = window.require('fs/promises')


export async function OpenFileHandle(filepath: string): Promise<{ handle: any; error: string }> {
  const result: { handle: any; error: string } = { handle: undefined, error: '' }
  const fileHandle = await fspromises.open(filepath, 'r').catch((err: any) => {
    err = FileSystemErrorMessage(err.code, err.message)
    DebugLog.mSaveDanger('UpOne上传文件失败：' + filepath, err)
    result.error = err
    return undefined
  })
  if (fileHandle) result.handle = fileHandle
  return result
}

export function FileSystemErrorMessage(code: string, message: string): string {
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
  const err = (code || '') + (message || '')
  if (err) return err
  return '读取文件失败'
}


export function ClearFileName(fileName: string): string {
  if (!fileName) return ''

  fileName = fileName.replace(/[<>:"/\\|?*]+/g, '')
  fileName = fileName.replace(/[\f\n\r\t\v]/g, '')
  while (fileName.endsWith(' ') || fileName.endsWith('.')) fileName = fileName.substring(0, fileName.length - 1)
  while (fileName.startsWith(' ')) fileName = fileName.substring(1)
  if (window.platform == 'win32') {
    // donothing
  } else if (window.platform == 'darwin') {
    while (fileName.startsWith('.')) fileName = fileName.substring(1)
  } else if (window.platform == 'linux') {
    // donothing
  }
  return fileName
}


export function CheckFileName(fileName: string): string {
  if (!fileName) return '不能为空'

  if (fileName.match(/[<>:"/\\|?*]+/g)) return '不能包含 < > : " / \\ | ? * '
  if (fileName.match(/[\f\n\r\t\v]/g)) return '不能包含 \\f \\n \\r \\t \\v'
  if (fileName.endsWith(' ') || fileName.endsWith('.')) return '不能以空格或.结尾'
  if (fileName.startsWith(' ')) return '不能以空格开头'
  if (window.platform == 'win32') {
    // donothing
  } else if (window.platform == 'darwin') {
    if (fileName.startsWith('.')) return '不能以.开头'
  } else if (window.platform == 'linux') {
    // donothing
  }
  return ''
}


export function CleanStringForCmd(title: string) {
  title = title.replace(/[<>"/\\|?* '&%$^`,;=()![\]\-~#]+/g, '')
  return title
}


export function CheckWindowsBreakPath(filePath: string) {
  if (filePath.endsWith('$RECYCLE.BIN')) return true
  if (filePath.endsWith('$Recycle.Bin')) return true
  if (filePath.endsWith('$LOGFILE')) return true
  if (filePath.endsWith('$VOLUME')) return true
  if (filePath.endsWith('$BITMAP')) return true
  if (filePath.endsWith('$MFT')) return true
  if (filePath.endsWith('$WINDOWS.~BT')) return true
  if (filePath.endsWith('$WinREAgent')) return true
  if (filePath.endsWith('$GetCurrent')) return true
  if (filePath.endsWith('$SysReset')) return true
  if (filePath.endsWith('$Windows.~WS')) return true
  if (filePath.endsWith('System Volume Information')) return true
  if (filePath.endsWith('Documents and Settings')) return true
  if (filePath.endsWith('Config.Msi')) return true
  if (filePath.endsWith('pagefile.sys')) return true
  if (filePath.endsWith('swapfile.sys')) return true
  if (filePath.endsWith('hiberfil.sys')) return true

  return false
}
