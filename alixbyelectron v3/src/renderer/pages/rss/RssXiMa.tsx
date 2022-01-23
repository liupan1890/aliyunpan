import SettingDown from '@/setting/settingdown'
import SettingLog from '@/setting/settinglog'
import { Sleep } from '@/store/format'

import { Alert, Button, Card, Menu, Dropdown, List, Popover, Tooltip, message, Modal, Input, Select } from 'antd'
import React from 'react'
import { connect } from 'umi'
import './rss.css'
const path = window.require('path')
const fspromises = window.require('fs/promises')

async function GetAllFiles(dir: string, filelist: string[]) {
  if (dir.endsWith(path.sep) == false) dir = dir + path.sep
  try {
    let childfiles = await fspromises.readdir(dir).catch((e: any) => {
      if (e.code && e.code === 'EPERM') {
        e = '没有权限访问文件夹'
        message.error('没有权限访问文件夹：' + dir)
      }
      if (e.message) e = e.message
      if (typeof e == 'string' && e.indexOf('EACCES') >= 0) message.error('没有权限访问文件夹：' + dir)
      SettingLog.mSaveLog('danger', 'XMGetAllFiles文件失败：' + dir + ' ' + (e || ''))
      return []
    })

    let alltask: Promise<void>[] = []
    let dirlist: string[] = []
    for (let i = 0, maxi = childfiles.length; i < maxi; i++) {
      const name = childfiles[i] as string
      if (name.startsWith('.')) continue
      if (name.startsWith('#')) continue
      const item = dir + name
      alltask.push(
        fspromises
          .lstat(item)
          .then((stat: any) => {
            if (stat.isDirectory()) dirlist.push(item)
            else if (stat.isSymbolicLink()) {
            } else if (stat.isFile()) filelist.push(item)
          })
          .catch()
      )
      if (alltask.length > 10) {
        await Promise.all(alltask).catch(() => {})
        alltask = []
      }
    }
    if (alltask.length > 0) {
      await Promise.all(alltask).catch(() => {})
      alltask = []
    }

    for (let i = 0, maxi = dirlist.length; i < maxi; i++) {
      await GetAllFiles(dirlist[i], filelist)
    }
  } catch (e: any) {
    SettingLog.mSaveLog('danger', 'GetAllFiles' + (e.message || ''))
  }
  return true
}
class RssXiMa extends React.Component<{ dispatch: any }, { dirpath: string; extvalue: string[]; loading: boolean }> {
  constructor(props: any) {
    super(props)
    this.state = { dirpath: '', extvalue: [], loading: false }
  }
  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'RssXiMa' + (error.message || ''))
      if (error.stack) SettingLog.mSaveLog('danger', error.stack)
    } catch {}
  }

  handleSelectDownFolder = () => {
    if (window.WebShowOpenDialogSync) {
      window.WebShowOpenDialogSync(
        {
          title: '选择一个文件夹，对文件夹内全部文件执行洗码',
          buttonLabel: '选择',
          properties: ['openDirectory', 'createDirectory'],
          defaultPath: SettingDown.downSavePath
        },
        (result: string[] | undefined) => {
          if (result && result[0]) {
            this.setState({ dirpath: result[0] })
          }
        }
      )
    }
  }

  handleXiMa = async () => {
    if (this.state.loading) return
    if (!this.state.dirpath) {
      message.error('还没有选择要执行洗码的文件夹')
      return
    }
    this.setState({ loading: true })

    const RootDir = this.state.dirpath
    const filelist: string[] = []
    await GetAllFiles(RootDir, filelist)
    if (filelist.length == 0) {
      message.error('选择的文件夹下找不到任何文件')
    } else {
      let rand = Date.now()
      const rand1 = rand % 256
      rand = rand / 128
      const rand2 = Math.floor(rand % 256)
      let rand3 = Math.floor(Math.random() * 255)
      let extlist = this.state.extvalue
      for (let i = 0, maxi = filelist.length; i < maxi; i++) {
        let file = filelist[i].toLowerCase().trimEnd()
        if (extlist.length > 0) {
          let find = false
          for (let j = 0; j < extlist.length; i++) {
            if (file.endsWith(extlist[j])) {
              find = true
              break
            }
          }
          if (find == false) continue
        }
        try {
          const rand4 = (i % 255) + 1
          if (rand4 == 200) rand3 = Math.floor(Math.random() * 255)
          const buff = Buffer.from([0, rand1, rand2, rand3, rand4])
          fspromises.appendFile(filelist[i], buff).catch((e: any) => {})
        } catch {}
      }
      await Sleep(2000)
      message.success('成功更新 ' + filelist.length + ' 个文件,一秒更新几百个文件很快的')
    }
    this.setState({ loading: false })
  }

  handleChange = (value: string[]) => {
    let arr: string[] = []
    for (let i = 0; i < value.length; i++) {
      let val = value[i]
      while (val.startsWith('.') || val.startsWith(' ')) val = val.substring(1)
      if (arr.includes(val) == false) arr.push(val)
    }
    this.setState({ extvalue: arr })
  }

  render() {
    return (
      <div className="rssbody rightbodysc">
        <div className="settinghead first">:选择要洗码的本地文件夹</div>
        <div className="settingrow">
          <Input.Search value={this.state.dirpath} readOnly={true} enterButton="选择" onSearch={this.handleSelectDownFolder} style={{ maxWidth: '400px' }} />
          <Button style={{ height: '32px', marginLeft: '32px' }} type="primary" onClick={this.handleXiMa} loading={this.state.loading}>
            执行洗码
          </Button>
        </div>
        <br />
        <div className="settingrow">
          <Select mode="tags" size="small" value={this.state.extvalue} style={{ width: '100%', maxWidth: '400px' }} placeholder="要处理的文件格式" onChange={this.handleChange} tokenSeparators={[',']}></Select>
          <br />
          <span className="oporg">提示</span>：如果只洗码指定格式的文件，请输入逗号分隔的文件后缀名。例如<a>mp4,avi,flv</a>
        </div>
        <br />
        <div className="settinghead">:洗码操作步骤</div>
        <div className="settingrow">
          <ol>
            <li>选择要洗码的文件所在的文件夹</li>
            <li>点击执行洗码（1秒处理几百个文件，很快的，等待完成提示）</li>
            <li>把洗码后的文件上传到阿里云盘</li>
          </ol>
          <div className="hrspace"></div>
          <span className="oporg">警告</span>：会对文件夹内全部子文件、子文件夹递归执行洗码操作，会直接修改原文件！
          <br />
          <span className="oporg">警告</span>：洗码操作不可逆，不可恢复，如果原文件很重要请提前自己 备份一份！ <br />
          <span className="oporg">警告</span>：仅推荐对常见视频格式洗码(.mp4.mkv.mov.avi.wmv.flv...)
        </div>

        <div className="settinghead">:洗码功能由来</div>
        <div className="settingrow">
          我的阿里云盘中备份了“生活大爆炸第五季”，
          <br />
          其中“生活大爆炸.H265.1080P.SE05.17.mkv”被判定为违规文件，不能下载，不能在线预览
          <br />
          我就开始在网上各种搜索，但发现能搜到的都是“人人字幕”制作发布的生活大爆炸第五季
          <br />
          所以很多人分享的生活大爆炸第五季里，都是这个“...SE05.17.mkv”违规文件
          <br />
          也就是找不到这一集了，最后只能迅雷下载这一集，洗码后上传到阿里云盘
          <br />
        </div>

        <div className="settinghead">:洗码方法说明</div>
        <div className="settingrow">
          <ul>
            <li>当一个文件被阿里云盘判定违规，会同时处理所有人网盘内完全一样的文件(sha1+size)</li>
            <li>
              洗码会在原始文件的<span className="opblue">结尾增加</span>5字节的<span className="opblue">随机</span>数字(改变文件sha1/size/md5/crc)
            </li>
            <li>被洗码后的文件可以认为是全世界独一无二的，理论上自己不去分享就不会被审查</li>
            <li>人人字幕发布的原始视频，会因很多人分享被屏蔽，自己洗码的视频不会受牵连</li>
            <li>常见视频格式均为封包格式，洗码追加的随机数据会被忽略，不会损坏视频文件</li>
          </ul>
        </div>

        <div className="settinghead">:洗码功能提示</div>
        <div className="settingrow">
          <ol>
            <li>
              如果原文件很重要请提前<span className="oporg">自己备份一份</span>！万一，你的文件特殊被洗码损坏了呢
            </li>
            <li>仅推荐对常见视频格式洗码(.mp4.mkv.mov.avi.wmv.flv...)</li>
            <li>对一个文件洗码时是添加5字节随机数据，有42亿种随机结果，不会产生重复的sha1</li>
            <li>可以对同一个文件多次执行洗码，每次都会产生全新的文件(没意义)</li>
            <li>洗码后的文件，因为云盘中没有相同文件，所以不能秒传需要自己慢慢上传</li>
            <li>
              洗码后的文件，虽然不会提示这个文件禁止分享，但实测<span className="oporg">分享后很快就会被屏蔽</span>
            </li>
            <li>洗码方法并非针对阿里云盘，理论上所有网盘均适用</li>
            <li>
              <span className="oporg">阿里云盘并未公开审核算法，洗码方法并不能确保文件状态，仅延长自己的保存时间</span>
            </li>
            <li>网盘内已存在的文件，只能先下载，后洗码，最后重新上传替换</li>
            <li>洗码操作不可逆，洗码后不可恢复，再次提醒保存好自己的原始文件</li>
          </ol>
        </div>

        <div className="settinghead">:洗码格式测试</div>
        <div className="settingrow">
          <ol>
            <li>.mp4.mkv.mov.avi.wmv.flv已测试通过</li>
            <li>.jpg.png.apng.tif.gif.heic已测试通过</li>
            <li>.zip.rar.7z.tar已测试通过</li>
            <li>
              .gz文件测试<span className="opred">失败</span>，会提示多余的附加数据
            </li>
            <li>
              .txt等文本类(.css.html.ini.csv.ass)测试<span className="opred">失败</span>，打开文件后在结尾会显示5个空白字符(或乱码)
            </li>
            <li>更多格式请自行测试(洗码--检查文件是否可用)</li>
          </ol>
        </div>

        <div className="settinghead">:常见视频文件审核方法</div>
        <div className="settingrow">
          <ol>
            <li>首先对文件名，文件sha1值对比审查，查到违规记录则屏蔽，若查不到</li>
            <li>对一个视频，生成固定时间的多张截图，AI审核截图内容判定+人工判定(审核比较慢)</li>
            <li>判定违规后，会保存违规文件的截图和违规原因</li>
            <li>审核新的视频文件时，生成新视频截图后，AI审核时会和已保存的违规截图进行对比</li>
            <li>如果多张同一时间的截图都相似度极高，就可以直接屏蔽了(加快了审核速度)</li>
          </ol>
          <p>
            所以，当一个视频被判定为违规后，对这个视频进行格式转换、文件数据改变(包括洗码)
            <br />
            只要遇到审核，就会很快被继续屏蔽。常见对抗方式：
          </p>
          <ol>
            <li>对文件进行7z压缩并加密文件和文件名</li>
            <li>对视频截取编辑（比如删掉前面5分钟的视频，追加半小时无关内容）</li>
            <li>将视频转码为不常见的格式(云盘无法在线预览的格式)</li>
          </ol>
        </div>
      </div>
    )
  }
}

export default connect(({}: {}) => ({}))(RssXiMa)
