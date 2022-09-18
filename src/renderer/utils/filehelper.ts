import DebugLog from './debuglog'
const fspromises = window.require('fs/promises')


export async function OpenFileHandle(filepath: string) {
  const result: { handle: any; error: string } = { handle: undefined, error: '' }
  const filehandle = await fspromises.open(filepath, 'r').catch((err: any) => {
    if (err.code && err.code === 'EPERM') err = '文件没有读取权限'
    if (err.code && err.code === 'EBUSY') err = '文件被占用或锁定中'
    DebugLog.mSaveDanger('UpOne上传文件失败：' + filepath, err)
    if (err.message) err = err.message
    if (typeof err == 'string' && err.indexOf('EACCES') >= 0) err = '文件没有读取权限'
    result.error = typeof err == 'string' && err.startsWith('文件') ? err : '读取文件失败'
    return undefined
  })
  if (filehandle) result.handle = filehandle
  return result
}


export function ClearFileName(filename: string): string {
  if (!filename) return ''

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

  if (filename.match(/[<>\:"\/\\\|\?\*]+/g)) return '不能包含 < > : " / \\ | ? * '
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


export function CheckWindowsBreakPath(filepath: string) {
  if (filepath.endsWith('$RECYCLE.BIN')) return true
  if (filepath.endsWith('$LOGFILE')) return true
  if (filepath.endsWith('$VOLUME')) return true
  if (filepath.endsWith('$BITMAP')) return true
  if (filepath.endsWith('$MFT')) return true
  if (filepath.endsWith('$WINDOWS.~BT')) return true
  if (filepath.endsWith('$WinREAgent')) return true
  if (filepath.endsWith('$GetCurrent')) return true
  if (filepath.endsWith('$SysReset')) return true
  if (filepath.endsWith('$Windows.~WS')) return true
  if (filepath.endsWith('System Volume Information')) return true
  if (filepath.endsWith('Documents and Settings')) return true
  if (filepath.endsWith('Config.Msi')) return true
  if (filepath.endsWith('pagefile.sys')) return true
  if (filepath.endsWith('swapfile.sys')) return true
  if (filepath.endsWith('hiberfil.sys')) return true

  return false
}
