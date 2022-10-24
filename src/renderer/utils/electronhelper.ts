import { throttle } from './debounce'

export function getFromClipboard(): string {
  return window.Electron.clipboard.readText() as string
}

export function copyToClipboard(text: string): void {
  window.Electron.clipboard.writeText(text, 'clipboard')
}
export function openExternal(url: string): void {
  window.Electron.shell.openExternal(url)
}

const ElectronPath = {
  
  AppUserData: '',
  
  AppResourcesPath: '',
  
  AppPlatform: '',
  
  AppArch: '',
  
  AppExecPath: '',

  AppUserName: '',
  env: ''
}


function LoadElectronPath(): void {
  if (!ElectronPath.AppUserData) {
    ElectronPath.AppPlatform = process.platform
    ElectronPath.AppArch = process.arch
    ElectronPath.AppExecPath = process.execPath
    ElectronPath.env = JSON.stringify(process.env)
    ElectronPath.AppUserName = process.env.USERNAME || process.env.USER || ''
    ElectronPath.AppResourcesPath = (process as any).resourcesPath
    if (window.WebPlatformSync) {
      window.WebPlatformSync((data: { appPath: string; execPath: string }) => {
        ElectronPath.AppUserData = data.appPath
        ElectronPath.AppExecPath = data.execPath
        window.Electron.WebPlatformSync = data
      })
    }

    window.Electron.ElectronPath = ElectronPath
  }
}

export function getUserData(): string {
  LoadElectronPath()
  return ElectronPath.AppUserData
}

const path = window.require('path')
export function getResourcesPath(fileName: string): string {
  try {
    LoadElectronPath()
    return path.join(ElectronPath.AppResourcesPath, fileName) as string
  } catch {
    return ''
  }
}

export function getAppNewPath(): string {
  try {
    LoadElectronPath()
    return path.join(ElectronPath.AppResourcesPath, 'app.new') as string
  } catch {
    return ''
  }
}

let ProgressBarBy = ''
let ProgressBarValue = -1
let ProgressBarNew = -1
const setProgressBar = throttle(() => {
  ProgressBarValue = ProgressBarNew
  const mode = ProgressBarValue < 0 ? 'none' : ProgressBarBy == 'download' ? 'normal' : 'paused'
  if (window.WebSetProgressBar) window.WebSetProgressBar({ pro: ProgressBarValue, mode })
}, 5000)


export function SetProgressBar(value: number, by: string): void {
  if (value < 0) value = -1
  if (ProgressBarValue == value && ProgressBarBy == by) return

  ProgressBarNew = value
  ProgressBarBy = by
  if (value < 0 || (ProgressBarValue < 0 && value > 0)) {
    
    const mode = value < 0 ? 'none' : ProgressBarBy == 'download' ? 'normal' : 'paused'
    ProgressBarValue = value
    if (window.WebSetProgressBar) window.WebSetProgressBar({ pro: ProgressBarValue, mode: mode })
  } else {
    
    setProgressBar()
  }
}
