const { app } = window.require('@electron/remote')
export function getFromClipboard() {
  return window.Electron.clipboard.readText() as string
}

export function copyToClipboard(text: string) {
  window.Electron.clipboard.writeText(text, 'clipboard')
}
export function openExternal(url: string) {
  window.Electron.shell.openExternal(url)
}
const path = window.require('path')
export function getResourcesPath(filename: string) {
  try {
    console.log(app.getAppPath())
    let basePath: string = path.resolve(app.getAppPath(), '..') 
    return path.join(basePath, filename)
  } catch {
    return ''
  }
}

export function getAppNewPath() {
  let basePath = path.resolve(app.getAppPath()) 
  let baseNew = path.join(basePath, '..', 'app.new')
  console.log(baseNew)
  return baseNew
}
