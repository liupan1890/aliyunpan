const { app } = require('electron')
const path = require('path')
const { existsSync, mkdirSync, writeFileSync } = require('fs')
const DEBUGGING = process.env.NODE_ENV === 'development'
export function getResourcesPath(filename: string) {
  if (DEBUGGING) {
    let basePath = path.resolve(app.getAppPath(), '..')
    return path.join(basePath, filename)
  } else {
    let basePath = path.resolve(app.getAppPath(), '..')

    if (filename == 'app.png') {
      try {
        let png = path.join(basePath, filename)
        if (!existsSync(png)) {
          let bufferData = Buffer.from(apppng, 'base64')
          writeFileSync(png, bufferData)
        }
      } catch {}
    }
    if (filename == 'app.ico') {
      try {
        let png = path.join(basePath, filename)
        if (!existsSync(png)) {
          let bufferData = Buffer.from(appicon, 'base64')
          writeFileSync(png, bufferData)
        }
      } catch {}
    }
    return path.join(basePath, filename)
  }
}
export function getCrxPath() {
  if (DEBUGGING) {
    let basePath = path.resolve(app.getAppPath(), '..')
    return path.join(basePath, '..', '..','crx')
  } else {
    let basePath = path.resolve(app.getAppPath(), '..')
    basePath = path.join(basePath, 'crx')
    try {
      if (!existsSync(basePath)) mkdirSync(basePath)
    } catch {}
    try {
      let manifest = path.join(basePath, 'manifest.json')
      if (!existsSync(manifest)) writeFileSync(manifest, crxmanifest, 'utf-8')
    } catch {}
    try {
      let devtoolshtml = path.join(basePath, 'devtools.html')
      if (!existsSync(devtoolshtml)) writeFileSync(devtoolshtml, crxdevtoolshtml, 'utf-8')
    } catch {}
    try {
      let devtoolsjs = path.join(basePath, 'devtools.js')
      if (!existsSync(devtoolsjs)) writeFileSync(devtoolsjs, crxdevtoolsjs, 'utf-8')
    } catch {}

    return basePath
  }
}

export function getUserDataPath(filename: string) {
  return path.join(app.getPath('userData'), filename)
}

export function mkAriaConf(filePath: string) {
  try {
    if (!existsSync(filePath)) writeFileSync(filePath, ariaconf, 'utf-8')
  } catch {}
}

const appicon =
  'AAABAAEAMDAAAAEAIACoJQAAFgAAACgAAAAwAAAAYAAAAAEAIAAAAAAAgCUAABMLAAATCwAAAAAAAAAAAAAAAAAAAAAAAAAAAAD76eJG/+zjd/3r5IT97efB/e/q4P3w7PP98ez9/fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7P398Ozz/e/q4P3t58H96+SE/+zjd/vp4kYAAAAAAAAAAAAAAAAAAAAA/+bdHv3r4ov96uKf/e3nvv3w7PH98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98Ozx/e3nv/3q4p/96+KL/+bdHgAAAAAAAAAA/evii/3q4qD97+nW/fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3v6df96uKg/eviiwAAAAD76eJG/erin/3u6dP98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/97unT/erin/vp4kb/7ON3/e3nv/3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//e3nv//s43f96+SE/fDs9P3x7f/98e3//fHt//3x7f/98e3/7tPJ/8NuQf/DbkH/w25B/8NuQf/HeVL//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3/9uLb/8NuQf/DbkH/w25B/8NuQf/DbkH/+erk//3x7f/98e3//fHt//3x7f/98e3//fDs9f3r5IT97efB/fHt//3x7f/98e3//fHt//3x7f/98e3//fHt/8uEYv/DbkH/w25B/8NuQf/DbkH/7tPJ//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3/47ur/8NuQf/DbkH/w25B/8NuQf/XoYn//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3t58L97+rf/fHt//3x7f/98e3//fHt//3x7f/98e3//fHt/+O7q//DbkH/w25B/8NuQf/DbkH/26qV//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3/y4Ri/8NuQf/DbkH/w25B/8NuQf/ry7///fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3v6uD98Ozx/fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//bi2//DbkH/w25B/8NuQf/DbkH/x3lS//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/u08n/w25B/8NuQf/DbkH/w25B/8d5Uv/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3w7PP98ez6/fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/TmH3/w25B/8NuQf/DbkH/w25B/+vLv//98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/bqpX/w25B/8NuQf/DbkH/w25B/9+zoP/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7P398e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/nw7X/w25B/8NuQf/DbkH/w25B/9ehif/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//nq5P/HeVL/w25B/8NuQf/DbkH/w25B//Lb0v/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/56uT/x3lS/8NuQf/DbkH/w25B/8d5Uv/56uT//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt/+fDtf/DbkH/w25B/8NuQf/DbkH/z45w//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3/26qV/8NuQf/DbkH/w25B/8NuQf/nw7X//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt/9OYff/DbkH/w25B/8NuQf/DbkH/47ur//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3/7tPJ/8NuQf/DbkH/w25B/8NuQf/XoYn//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3/9uLb/8NuQf/DbkH/w25B/8NuQf/DbkH/+erk//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt/8uEYv/DbkH/w25B/8NuQf/DbkH/+erk//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3/47ur/8NuQf/DbkH/w25B/8NuQf/XoYn//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt/+O7q//DbkH/w25B/8NuQf/DbkH/w25B/8NuQf/DbkH/w25B/8NuQf/DbkH/w25B/8NuQf/DbkH/w25B/8NuQf/DbkH/w25B/8NuQf/DbkH/w25B/8NuQf/DbkH/w25B/8NuQf/ry7///fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//bi2//DbkH/w25B/8NuQf/DbkH/w25B/8NuQf/DbkH/w25B/8NuQf/DbkH/w25B/8NuQf/DbkH/w25B/8NuQf/DbkH/w25B/8NuQf/DbkH/w25B/8NuQf/DbkH/w25B/8d5Uv/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/TmH3/w25B/8NuQf/DbkH/w25B/8NuQf/DbkH/w25B/8NuQf/DbkH/w25B/8NuQf/DbkH/w25B/8NuQf/DbkH/w25B/8NuQf/DbkH/w25B/8NuQf/DbkH/w25B/9+zoP/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/nw7X/w25B/8NuQf/DbkH/w25B/8NuQf/DbkH/w25B/8NuQf/DbkH/w25B/8NuQf/DbkH/w25B/8NuQf/DbkH/w25B/8NuQf/DbkH/w25B/8NuQf/DbkH/w25B//Lb0v/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/56uT/x3lS/8NuQf/DbkH/w25B/8+OcP/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt/+vLv//DbkH/w25B/8NuQf/DbkH/z45w//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3/26qV/8NuQf/DbkH/w25B/8NuQf/y29L//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt/9ehif/DbkH/w25B/8NuQf/DbkH/47ur//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3/7tPJ/8NuQf/DbkH/w25B/8NuQf/fs6D//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3/+erk/8d5Uv/DbkH/w25B/8NuQf/DbkH/+erk//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt/8uEYv/DbkH/w25B/8NuQf/LhGL//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3/58O1/8NuQf/DbkH/w25B/8NuQf/XoYn//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt/9+zoP/DbkH/w25B/8NuQf/DbkH/7tPJ//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3/05h9/8NuQf/DbkH/w25B/8NuQf/u08n//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//Lb0v/DbkH/w25B/8NuQf/DbkH/26qV//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/56uT/w25B/8NuQf/DbkH/w25B/8uEYv/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/PjnD/w25B/8NuQf/DbkH/x3lS//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/ju6v/w25B/8NuQf/DbkH/w25B/+O7q//98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/ju6v/w25B/8NuQf/DbkH/w25B/+vLv//98e3//fHt//3x7f/98e3//fHt//3x7f/PjnD/w25B/8NuQf/DbkH/w25B//bi2//98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/56uT/w25B/8NuQf/DbkH/w25B/9ehif/98e3//fHt//3x7f/98e3//fHt//Lb0v/DbkH/w25B/8NuQf/DbkH/05h9//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3/16GJ/8NuQf/DbkH/w25B/8d5Uv/56uT//fHt//3x7f/98e3//fHt/+O7q//DbkH/w25B/8NuQf/DbkH/58O1//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3/68u//8NuQf/DbkH/w25B/8NuQf/nw7X//fHt//3x7f/98e3//fHt/8uEYv/DbkH/w25B/8NuQf/HeVL/+erk//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt/8d5Uv/DbkH/w25B/8NuQf/XoYn//fHt//3x7f/98e3/7tPJ/8NuQf/DbkH/w25B/8NuQf/bqpX//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt/9+zoP/DbkH/w25B/8NuQf/DbkH/+erk//3x7f/98e3/37Og/8NuQf/DbkH/w25B/8NuQf/u08n//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//Lb0v/DbkH/w25B/8NuQf/DbkH/47ur//3x7f/98e3/x3lS/8NuQf/DbkH/w25B/8uEYv/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/PjnD/w25B/8NuQf/DbkH/z45w//3x7f/ry7//w25B/8NuQf/DbkH/w25B/+O7q//98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/ju6v/w25B/8NuQf/DbkH/w25B//bi2//XoYn/w25B/8NuQf/DbkH/w25B//bi2//98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/56uT/w25B/8NuQf/DbkH/w25B/+O7q//HeVL/w25B/8NuQf/DbkH/05h9//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3/16GJ/8NuQf/DbkH/w25B/9ehif/DbkH/w25B/8NuQf/DbkH/58O1//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3/68u//8NuQf/DbkH/w25B/8NuQf/DbkH/w25B/8NuQf/HeVL/+erk//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98ez8/fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt/8d5Uv/DbkH/w25B/8NuQf/DbkH/w25B/8NuQf/bqpX//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7P398Ozz/fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt/9+zoP/DbkH/w25B/8NuQf/DbkH/w25B/8NuQf/u08n//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3w7PP97+rf/fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//Lb0v/DbkH/w25B/8NuQf/DbkH/w25B/8uEYv/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3v6uD97efB/fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/PjnD/w25B/8NuQf/DbkH/w25B/+O7q//98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3t58L96eKE/fDs9P3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fDs9f3p4oT/7ON3/e3nv/3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//e3nv//s43f76eJG/erin/3u6dP98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/97unT/erin/vp4kYAAAAA/enii/3q4qD97unT/fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3u6dP96uKg/eniiwAAAAAAAAAA/+bdHv3p4ov96uKf/e3mvf3w7PH98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98Ozx/e3nvv3q4p/96eKL/+bdHgAAAAAAAAAAAAAAAAAAAAD/6eFF/erhd/3p4oT97ee//e/q3f3w7PP98ez9/fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7f/98e3//fHt//3x7Pr98Ovw/e/q3f3t57/96eKE/erhd//p4UUAAAAAAAAAAAAAAADgAAAAAAcAAIAAAAAAAQAAgAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAEAAIAAAAAAAQAA4AAAAAAHAAA='
const apppng =
  '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'

const crxmanifest = `{"manifest_version": 2,"name": "demo","version": "1.0.0","description": "demo","devtools_page": "devtools.html","permissions": ["http://*/*", "https://*/*"]}`

const crxdevtoolshtml = `<!DOCTYPE html><html><head></head><body><script type="text/javascript" src="devtools.js"></script></body></html>`

const crxdevtoolsjs = `chrome.devtools.network.onRequestFinished.addListener(function (detail) {
  let url = detail.request.url;
  if (url.indexOf("api.aliyundrive.com") > 0) return;
  if (url.indexOf("_tmd_") > 0) return;
  if (url.indexOf(".aliyundrive.com") <= 0) return;
  if (detail.request.method != "POST") return;

  detail.getContent(function (content, mimeType) {
    try {
      if (typeof content == "string" && content.indexOf('"bizExt"') > 0) {
        const data = JSON.parse(content);
        const bizExt = data.content?.data?.bizExt || "";
        if (bizExt) {
          chrome.devtools.inspectedWindow.eval(
            "console.log('" + JSON.stringify({ bizExt: bizExt }) + "')"
          );
        }
      }
    } catch {}
  });
});

 `

const ariaconf = `# debug, info, notice, warn or error
 log-level=error
 file-allocation=trunc
 user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36
 max-concurrent-downloads=64
 max-connection-per-server=16
 enable-rpc=true
 rpc-allow-origin-all=true
 rpc-listen-all=false
 rpc-listen-port=29384
 rpc-secret=S4znWTaZYQi3cpRNb
 rpc-secure=false
 pause-metadata=true
 http-no-cache=true
 disable-ipv6=true
 disk-cache=32M
 continue=true
 allow-overwrite=true
 auto-file-renaming=false
 max-download-result=1000
 no-netrc=true
 reuse-uri=true
 quiet=true
 disable-ipv6=false
 check-certificate=false
 save-session=
 save-session-interval=0
 follow-metalink=false
 follow-torrent=false
 enable-dht=false
 enable-dht6=false
 bt-enable-lpd=false
 enable-peer-exchange=false
 bt-request-peer-speed-limit=1
 dht-file-path=
 dht-file-path6=
 seed-time=0
 force-save=false
 bt-save-metadata=false
 `
