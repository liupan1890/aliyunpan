export function getFromClipboard() {
  return window.Electron.clipboard.readText() as string
}

export function copyToClipboard(text: string) {
  window.Electron.clipboard.writeText(text, 'clipboard')
}
export function openExternal(url: string) {
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


function LoadElectronPath() {
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

export function getUserData() {
  LoadElectronPath()
  return ElectronPath.AppUserData
}
const path = window.require('path')
export function getResourcesPath(filename: string) {
  try {
    LoadElectronPath()
    return path.join(ElectronPath.AppResourcesPath, filename)
  } catch {
    return ''
  }
}

export function getAppNewPath() {
  try {
    LoadElectronPath()
    return path.join(ElectronPath.AppResourcesPath, 'app.new')
  } catch {
    return ''
  }
}
