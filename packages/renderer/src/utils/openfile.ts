import { IAliGetFileModel } from '@/aliapi/alimodels'
import AliFile from '@/aliapi/file'
import AliFileCmd from '@/aliapi/filecmd'
import { useFootStore, usePanFileStore, useSettingStore, useUserStore } from '@/store'
import { IPageCode, IPageImage, IPageOffice, IPageVideo } from '@/store/appstore'
import UserDAL from '@/user/userdal'
import Config from './config'
import message from './message'
import { CleanStringForCmd } from './utils'

let _OpenFile = false
export async function menuOpenFile(file: IAliGetFileModel) {
  if (_OpenFile) return
  _OpenFile = true
  setTimeout(() => {
    _OpenFile = false
  }, 500)

  let file_id = file.file_id
  let drive_id = file.drive_id

  if (file.ext == 'zip' || file.ext == 'rar') {
    
    message.info('此版本暂不支持在线解压')
    return
  }

  if (file.category == 'image' || file.category == 'image2') {
    
    Image(drive_id, file_id, file.name)
    return
  }
  if (file.category == 'image3') {
    message.info('此格式暂不支持预览')
    return
  }

  if (file.category.startsWith('video')) {
    
    Video(drive_id, file_id, file.name, file.icon == 'iconweifa', file.description)
    return
  }

  if (file.category.startsWith('audio')) {
    
    Audio(drive_id, file_id, file.name, file.icon == 'iconweifa')
    return
  }

  if (file.category.startsWith('doc')) {
    
    Office(drive_id, file_id, file.name)
    return
  }
  
  const codeExt = PrismExt(file.ext)
  if (file.size < 100 * 1024 || (file.size < 5 * 1024 * 1024 && codeExt)) {
    Code(drive_id, file_id, file.name, codeExt, file.size)
    return
  }
  message.info('此格式暂不支持预览')
}

async function Audio(drive_id: string, file_id: string, name: string, weifa: boolean) {
  message.loading('Loading...', 2)
  const userID = useUserStore().userID
  const token = await UserDAL.GetUserTokenFromDB(userID)
  if (!token || !token.access_token) {
    message.error('在线预览失败 账号失效，操作取消')
    return
  }
  const data = await AliFile.ApiAudioPreviewUrl(userID, drive_id, file_id)
  if (data && data.url != '') {
    useFootStore().mSaveAudioUrl(data.url)
  }
}

async function Video(drive_id: string, file_id: string, name: string, weifa: boolean, dec: string) {
  message.loading('Loading...', 2)
  const userID = useUserStore().userID
  const token = await UserDAL.GetUserTokenFromDB(userID)
  if (!token || !token.access_token) {
    message.error('在线预览失败 账号失效，操作取消')
    return
  }
  let settingStore = useSettingStore()
  if (settingStore.uiAutoColorVideo && dec == '') {
    AliFileCmd.ApiFileColorBatch(userID, drive_id, 'c5b89b8', [file_id]).then((success) => {
      usePanFileStore().mColorFiles('c5b89b8', success)
    })
  }

  /** 
  播放源 downurl/m3u8
  播放器 mpv/other/web
  downurl=>(mpv/other)
  m3u8=>(mpv/other/web)
  */

  if (settingStore.uiVideoPlayer == 'web') {
    
    const pageVideo: IPageVideo = { user_id: token.user_id, drive_id, file_id, file_name: name }
    window.WebOpenWindow({ page: 'PageVideo', data: pageVideo, theme: 'dark' })
    return
  }

  let url = ''
  let mode = ''
  if (weifa || settingStore.uiVideoMode == 'online') {
    
    
    const data = await AliFile.ApiVideoPreviewUrl(userID, drive_id, file_id)
    if (data && data.url != '') {
      url = data.url
      mode = '转码视频模式_没有字幕请切换原始文件模式'
    }
  }
  if (!url && weifa == false) {
    
    const data = await AliFile.ApiFileDownloadUrl(userID, drive_id, file_id, 14400)
    if (typeof data !== 'string' && data.url && data.url != '') {
      url = data.url
      mode = '原始文件模式'
    }
  }
  if (!url) {
    message.error('视频地址解析失败，操作取消')
    return
  }

  const title = mode + '__' + name

  if (settingStore.uiVideoPlayer == 'mpv') {
    let ag2: string[] = []
    if (window.platform == 'win32') {
      ag2 = ['"' + url + '"', '--title="' + CleanStringForCmd(title) + '"', '--user-agent="' + CleanStringForCmd(Config.userAgent) + '"']
    } else if (window.platform == 'darwin') {
      ag2 = ["'" + url + "'", "--title='" + CleanStringForCmd(title) + "'", "--user-agent='" + CleanStringForCmd(Config.userAgent) + "'"]
    } else if (window.platform == 'linux') {
      ag2 = ["'" + url + "'", "--title='" + CleanStringForCmd(title) + "'", "--user-agent='" + CleanStringForCmd(Config.userAgent) + "'"]
    } else {
      message.error('不支持的系统，操作取消')
      return
    }

    window.WebExecSync(
      {
        command: 'mpv',
        args: ['--referrer=https://www.aliyundrive.com/', '--force-window=immediate', '--hwdec=auto', '--geometry=80%', '--autofit-larger=100%x100%', '--autofit-smaller=640', ...ag2]
      },
      (rdata: any) => {}
    )
  } else {
    let command = settingStore.uiVideoPlayerPath
    let args = ['"' + url + '"']
    if (window.platform == 'win32') {
      command = '"' + settingStore.uiVideoPlayerPath + '"'
      args = ['"' + url + '"'] //win 双引号包裹
      if (command.toLowerCase().indexOf('potplayer') > 0) {
        args = ['"' + url + '"', '/new', '/referer=https://www.aliyundrive.com/']
      } else if (command.toLowerCase().indexOf('mpv') > 0) {
        args = ['"' + url + '"', '--referrer=https://www.aliyundrive.com/', '--title="' + CleanStringForCmd(title) + '"']
      } else {
        if (url.indexOf('x-oss-additional-headers=referer') > 0) {
          message.error('用户token已过期，请点击头像里退出按钮后重新登录账号')
          return
        }
      }
    } else if (window.platform == 'darwin') {
      command = "open -a '" + command + "'"
      args = ["'" + url + "'"] //mac 单引号包裹
      if (url.indexOf('x-oss-additional-headers=referer') > 0) {
        message.error('用户token已过期，请点击头像里退出按钮后重新登录账号')
        return
      }
    } else if (window.platform == 'linux') {
      command = settingStore.uiVideoPlayerPath //不能加引号
      args = ["'" + url + "'"] //linux 单引号包裹

      if (url.indexOf('x-oss-additional-headers=referer') > 0) {
        message.error('用户token已过期，请点击头像里退出按钮后重新登录账号')
        return
      }
    } else {
      message.error('不支持的系统，操作取消')
      return
    }

    window.WebExecSync(
      {
        command,
        args
      },
      (rdata: any) => {}
    )
  }
}

async function Image(drive_id: string, file_id: string, name: string) {
  message.loading('Loading...', 2)
  const userID = useUserStore().userID
  const token = await UserDAL.GetUserTokenFromDB(userID)
  if (!token || !token.access_token) {
    message.error('在线预览失败 账号失效，操作取消')
    return
  }

  const imageidlist: string[] = []
  const imagenamelist: string[] = []
  
  const filelist = usePanFileStore().ListDataRaw
  for (let i = 0, maxi = filelist.length; i < maxi; i++) {
    if (filelist[i].category == 'image' || filelist[i].category == 'image2') {
      imageidlist.push(filelist[i].file_id)
      imagenamelist.push(filelist[i].name)
    }
  }
  if (imageidlist.length == 0) {
    message.error('获取文件预览链接失败，操作取消')
    return
  }

  const pageImage: IPageImage = { user_id: token.user_id, drive_id, file_id, file_name: name, mode: useSettingStore().uiImageMode, imageidlist, imagenamelist }
  window.WebOpenWindow({ page: 'PageImage', data: pageImage, theme: 'dark' })
}

async function Office(drive_id: string, file_id: string, name: string) {
  message.loading('Loading...', 2)
  const userID = useUserStore().userID
  const token = await UserDAL.GetUserTokenFromDB(userID)
  if (!token || !token.access_token) {
    message.error('在线预览失败 账号失效，操作取消')
    return
  }

  const data = await AliFile.ApiOfficePreViewUrl(userID, drive_id, file_id)
  if (!data || !data.preview_url) {
    message.error('获取文件预览链接失败，操作取消')
    return
  }
  const pageOffice: IPageOffice = { user_id: token.user_id, drive_id, file_id, file_name: name, preview_url: data.preview_url, access_token: data.access_token }
  window.WebOpenWindow({ page: 'PageOffice', data: pageOffice })
}

async function Code(drive_id: string, file_id: string, name: string, code_ext: string, file_size: number) {
  message.loading('Loading...', 2)
  const userID = useUserStore().userID
  const token = await UserDAL.GetUserTokenFromDB(userID)
  if (!token || !token.access_token) {
    message.error('在线预览失败 账号失效，操作取消')
    return
  }
  const data = await AliFile.ApiFileDownloadUrl(userID, drive_id, file_id, 14400)
  if (typeof data == 'string') {
    message.error('获取文件预览链接失败，操作取消')
    return
  }

  const pageCode: IPageCode = { user_id: token.user_id, drive_id, file_id, file_name: name, code_ext, file_size, download_url: data.url }
  window.WebOpenWindow({ page: 'PageCode', data: pageCode, theme: 'dark' })
}


export function PrismExt(file_ext: string) {
  const ext = '.' + file_ext.toLowerCase() + '.'
  const fext = file_ext.toLowerCase()
  let iscode = false
  let codeext = ''
  iscode = iscode || ';.markup.html.xml.svg.mathml.ssml.atom.rss.css.clike.javascript.js.abap.'.indexOf(ext) > 0
  iscode = iscode || ';.actionscript.ada.agda.al.antlr4.g4.apacheconf.apex.apl.applescript.abnf.'.indexOf(ext) > 0
  iscode = iscode || ';.aql.arduino.arff.asciidoc.adoc.aspnet.asm6502.autohotkey.autoit.bash.shell.'.indexOf(ext) > 0
  iscode = iscode || ';.basic.batch.bbcode.shortcode.birb.bison.bnfrbnf.brainfuck.brightscript.'.indexOf(ext) > 0
  iscode = iscode || ';.bro.bsl.oscript.c.csharp.cs.dotnet.cpp.cfscript.cfc.chaiscript.cil.clojure.cmake.'.indexOf(ext) > 0
  iscode = iscode || ';.cobol.coffeescript.coffee.concurnas.conc.csp.coq.crystal.css-extras.csv.cypher.n4jsd.'.indexOf(ext) > 0
  iscode = iscode || ';.d.dart.dataweave.dax.dhall.diff.django.jinja2.dns-zone-file.dns-zone..purs.purescript.'.indexOf(ext) > 0
  iscode = iscode || ';.docker.dockerfile.dot.gv.ebnf.editorconfig.eiffel.ejs.eta.elixir.elm.etlua.erb.erlang.'.indexOf(ext) > 0
  iscode = iscode || ';.fsharp.factor.false.firestore-security-rules.flow.fortran.ftl.gml.gamemakerlanguage.'.indexOf(ext) > 0
  iscode = iscode || ';.gcode.gdscript.gedcom.gherkin.git.glsl.go.graphql.groovy.haml.handlebars.hbs.'.indexOf(ext) > 0
  iscode = iscode || ';.haskell.hs.haxe.hcl.hlsl.hoon.http.hpkp.hsts.ichigojam.icon.icu-message-format.'.indexOf(ext) > 0
  iscode = iscode || ';.idris.idr.ignore.gitignore.hgignore.npmignore.inform7.ini.io.j.java.javadoc.javadoclike.'.indexOf(ext) > 0
  iscode = iscode || ';.javastacktrace.jexl.jolie.jq.jsdoc.js-extras.json.webmanifest.json5.jsonp.jsstacktrace.px.'.indexOf(ext) > 0
  iscode = iscode || ';.js-templates.julia.keyman.kotlin.kt.kts.kumir.kum.latex.tex.context.latte.less.lilypond.ly.'.indexOf(ext) > 0
  iscode = iscode || ';.liquid.lisp.emacs.elisp.emacs-lisp.livescript.llvm.log.lolcode.lua.makefile.markdown.md.'.indexOf(ext) > 0
  iscode = iscode || ';.markup-templating.matlab.mel.mizar.mongodb.monkey.moonscript.moon.n1ql.n4js.'.indexOf(ext) > 0
  iscode = iscode || ';.nand2tetris-hdl.naniscript.nani.nasm.neon.nevod.nginx.nim.nix.nsis.objectivec.objc.'.indexOf(ext) > 0
  iscode = iscode || ';.ocaml.opencl.openqasm.qasm.oz.parigp.parser.pascal.objectpascal.pascaligo.psl.pcaxis.'.indexOf(ext) > 0
  iscode = iscode || ';.peoplecode.pcode.perl.php.phpdoc.php-extras.plsql.powerquery.pq.mscript.powershell.'.indexOf(ext) > 0
  iscode = iscode || ';.processing.prolog.promql.properties.protobuf.pug.puppet.pure.purebasic.pbfasm.twig.'.indexOf(ext) > 0
  iscode = iscode || ';.python.py.qsharp.qs.q.qml.qore.r.racket.rkt.jsx.tsx.reason.regex.rego.renpy.rpy.rest.rip.'.indexOf(ext) > 0
  iscode = iscode || ';.robotframework.robot.ruby.rb.rust.sas.sass.scss.scala.scheme.shell-session.sh-session.sql.'.indexOf(ext) > 0
  iscode = iscode || ';.smali.smalltalk.smarty.sml.smlnj.solidity.sol.solution-file.sln.soy.sparql.rq.splunk-spl.sqf.'.indexOf(ext) > 0
  iscode = iscode || ';.squirrel.stan.iecst.stylus.swift.t4-templating.t4-cs.t4.t4-vb.tap.tcl.tt2.textile.toml.turtle.trig.'.indexOf(ext) > 0
  iscode = iscode || ';.typescript.ts.typoscript.tsconfig.unrealscript.uscript.uc.uri.url.v.vala.vbnet.velocity.verilog.'.indexOf(ext) > 0
  iscode = iscode || ';.vim.visual-basic.vb.vba.warpscript.wasm.wiki.wolfram.mathematica.nb.wl.xeora.xeoracube.'.indexOf(ext) > 0
  iscode = iscode || ';.xml-doc.xojo.xquery.yaml.yml.yang.zig.excel-formula.xlsx.xls.shellsession.roboconf.vhdl.'.indexOf(ext) > 0

  if (iscode) {
    codeext = fext
  } else {
    
    switch (fext) {
      case 'prettierrc':
        codeext = 'json'
        break
      case 'vue':
        codeext = 'javascript'
      case 'h':
        codeext = 'c'
        break
      case 'as':
        codeext = 'actionscript'
        break
      case 'sh':
        codeext = 'bash'
        break
      case 'zsh':
        codeext = 'bash'
        break
      case 'bf':
        codeext = 'brainfuck'
        break
      case 'hpp':
        codeext = 'cpp'
        break
      case 'cc':
        codeext = 'cpp'
        break
      case 'hh':
        codeext = 'cpp'
        break
      case 'c++':
        codeext = 'cpp'
        break
      case 'h++':
        codeext = 'cpp'
        break
      case 'cxx':
        codeext = 'cpp'
        break
      case 'hxx':
        codeext = 'cpp'
        break
      case 'cson':
        codeext = 'coffeescript'
        break
      case 'iced':
        codeext = 'coffeescript'
        break
      case 'dns':
        codeext = 'dns-zone'
        break
      case 'zone':
        codeext = 'dns-zone'
        break
      case 'bind':
        codeext = 'dns-zone'
        break
      case 'plist':
        codeext = 'xml'
        break
      case 'xhtml':
        codeext = 'html'
        break
      case 'iml':
        codeext = 'xml'
        break
      case 'mk':
        codeext = 'makefile'
        break
      case 'mak':
        codeext = 'makefile'
        break
      case 'make':
        codeext = 'makefile'
        break
      case 'mkdown':
        codeext = 'markdown'
        break
      case 'mkd':
        codeext = 'markdown'
        break
      case 'nginxconf':
        codeext = 'nginx'
        break
      case 'nimrod':
        codeext = 'nim'
        break
      case 'mm':
        codeext = 'objectivec'
        break
      case 'obj-c':
        codeext = 'objectivec'
        break
      case 'obj-c++':
        codeext = 'objectivec'
        break
      case 'objective-c++':
        codeext = 'objectivec'
        break
      case 'ps':
        codeext = 'powershell'
        break
      case 'ps1':
        codeext = 'powershell'
        break
      case 'gyp':
        codeext = 'python'
        break
      case 'rs':
        codeext = 'rust'
        break
      case 'vb':
        codeext = 'vbnet'
        break
      case 'conf':
        codeext = 'ini'
        break
    }
  }
  return codeext
}
