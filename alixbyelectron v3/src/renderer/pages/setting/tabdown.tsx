import SettingDown from '@/setting/settingdown'
import DownDAL from '@/store/downdal'
import UploadDAL from '@/store/uploaddal'
import { Checkbox, Input, InputNumber, message, Popover, Select, Tag } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import React from 'react'
import { connect, SettingModelState } from 'umi'
import './setting.css'
const TabDown = ({ dispatch, setting }: { dispatch: any; setting: SettingModelState }) => {
  function handleSelectDownFolder() {
    if (window.WebShowOpenDialogSync) {
      window.WebShowOpenDialogSync(
        {
          title: '选择一个文件夹，把所有文件下载到此文件夹内',
          buttonLabel: '选择',
          properties: ['openDirectory', 'createDirectory'],
          defaultPath: SettingDown.downSavePath
        },
        (result: string[] | undefined) => {
          if (result && result[0]) {
            SettingDown.mSaveDownSavePath(result[0])
          }
        }
      )
    }
  }
  function handleDownSavePathDefaultChange(e: CheckboxChangeEvent) {
    SettingDown.mSaveDownSavePathDefault(e.target.checked)
  }
  function handleDownSavePathFullChange(e: CheckboxChangeEvent) {
    SettingDown.mSaveDownSavePathFull(e.target.checked)
  }
  function handleDownSaveBreakWeiGuiChange(e: CheckboxChangeEvent) {
    SettingDown.mSaveDownSaveBreakWeiGui(e.target.checked)
  }
  function handleDownAutoShutDownChange(e: CheckboxChangeEvent) {
    SettingDown.mSaveDownAutoShutDown(e.target.checked)
  }
  function handleDownSaveShowProChange(e: CheckboxChangeEvent) {
    SettingDown.mSaveDownSaveShowPro(e.target.checked)
  }
  function handleDownUploadBreakExistChange(e: CheckboxChangeEvent) {
    SettingDown.mSaveDownUploadBreakExist(e.target.checked)
  }
  function handleDownSmallFileFirstChange(e: CheckboxChangeEvent) {
    SettingDown.mSaveDownSmallFileFirst(e.target.checked)
  }

  function handleDownFileMax(val: string) {
    try {
      SettingDown.mSaveDownFileMax(parseInt(val))
    } catch {}
  }
  function handleDownThreadMax(val: string) {
    try {
      SettingDown.mSaveDownThreadMax(parseInt(val))
    } catch {}
  }
  function handleDownGlobalSpeed(val: string) {
    try {
      SettingDown.mSaveDownGlobalSpeed(parseInt(val))
    } catch {}
  }

  function handleDownIngoredList(val: string, isadd: boolean) {
    if (DownDAL.QueryIsDowning()) {
      message.error('有正在下载的文件，不能修改规则')
      return
    }
    if (UploadDAL.QueryIsUploading()) {
      message.error('有正在上传的文件，不能修改规则')
      return
    }
    try {
      SettingDown.mSaveDownIngoredList(val, isadd)
    } catch {}
  }

  let taginput = React.useRef<any>(null)

  return (
    <div className="settingbody  rightbodysc">
      <div className="settinghead first">:文件下载保存位置</div>
      <div className="settingrow">
        <Input.Search value={SettingDown.downSavePath} readOnly={true} enterButton="更改" onSearch={handleSelectDownFolder} />
      </div>
      <div className="settingrow">
        <Checkbox checked={SettingDown.downSavePathDefault} onChange={handleDownSavePathDefaultChange}>
          新建下载任务时 默认使用此路径
        </Checkbox>
        <Popover
          placement="right"
          content={
            <div>
              <span className="opred">默认勾选</span>：直接下载文件不询问
              <hr />
              如果想要<span className="opblue">每次</span>下载文件时都要重新选择，请去掉勾选
            </div>
          }>
          <i className="iconfont iconbulb" />
        </Popover>
      </div>

      <div className="settingrow">
        <Checkbox checked={SettingDown.downSavePathFull} onChange={handleDownSavePathFullChange}>
          新建下载任务时 按照网盘完整路径保存
        </Checkbox>
        <Popover
          placement="right"
          content={
            <div>
              <span className="opred">默认勾选</span>：下载文件时会自动附加完整的网盘路径
              <hr />
              如果不想要自动附加网盘路径请去掉勾选，不推荐！
              <br />
              (可能导致下载后的文件错乱、被覆盖、下载失败)
              <div className="hrspace"></div>
              参阅底部的 <span className="opblue">帮助</span> ，详细解释了为什么一定要网盘路径
            </div>
          }>
          <i className="iconfont iconbulb" />
        </Popover>
      </div>

      <div className="settingrow">
        <Checkbox checked={SettingDown.downSaveBreakWeiGui} onChange={handleDownSaveBreakWeiGuiChange}>
          新建下载任务时 自动跳过违规文件
        </Checkbox>
        <Popover
          placement="right"
          content={
            <div>
              <span className="opred">默认勾选</span>：下载文件时会自动取消违规文件的下载
              <hr />
              文件是否违规是阿里云盘自己判断的 <br />
              违规文件下载后也只是一张违规图片，没有实际意义 <br />
              推荐勾选后跳过不下载
            </div>
          }>
          <i className="iconfont iconbulb" />
        </Popover>
      </div>

      <div className="settinghead">:同时上传/下载任务</div>
      <div className="settingrow">
        <Select value={SettingDown.downFileMax.toString()} virtual={false} style={{ width: 230 }} onChange={handleDownFileMax} getPopupContainer={(triggerNode:HTMLElement)=>triggerNode.parentElement!}>
          <Select.Option value="1">同时运行1个文件</Select.Option>
          <Select.Option value="3">同时运行3个文件</Select.Option>
          <Select.Option value="5">同时运行5个文件</Select.Option>
          <Select.Option value="10">同时运行10个文件</Select.Option>
          <Select.Option value="30">同时运行30个文件</Select.Option>
          <Select.Option value="60">同时运行60个文件</Select.Option>
        </Select>
        <Popover
          placement="right"
          content={
            <div>
              <span className="opred">默认5</span>：同时下载5个文件
              <hr />
              上传/下载 <span className="opblue">大量小文件</span> 时，应该调整为60，可以加速传输 <br />
              上传/下载 <span className="opblue">大文件</span> 时，推荐设置为5，设置更高也没有加速效果
            </div>
          }>
          <i className="iconfont iconbulb" />
        </Popover>
      </div>

      <div className="settinghead">:每个文件下载线程</div>
      <div className="settingrow">
        <Select value={SettingDown.downThreadMax.toString()} virtual={false} style={{ width: 230 }} onChange={handleDownThreadMax} getPopupContainer={(triggerNode:HTMLElement)=>triggerNode.parentElement!}>
          <Select.Option value="1">每个文件启动1个线程</Select.Option>
          <Select.Option value="2">每个文件启动2个线程</Select.Option>
          <Select.Option value="4">每个文件启动4个线程</Select.Option>
          <Select.Option value="8">每个文件启动8个线程</Select.Option>
          <Select.Option value="16">每个文件启动16个线程</Select.Option>
          <Select.Option value="64">每个文件启动64个线程**</Select.Option>
          <Select.Option value="128">每个文件启动128个线程**</Select.Option>
        </Select>
        <Popover
          placement="right"
          content={
            <div>
              <span className="opred">默认16</span>：每个文件16线程并发下载
              <hr />
              一个文件的下载线程越多下载速度越快
              <br />
              但默认单个文件仅支持最大16线程就可以满速下载
              <br />
              若不能满速，需要64/128线程时，要用户自己
              <br />
              <span className="opblue">手动替换</span>支持更多线程的aria2c
              <hr />
              注：需要重新启动下载任务才能生效
            </div>
          }>
          <i className="iconfont iconbulb" />
        </Popover>
      </div>

      <div className="settinghead">:全局下载速度限制</div>
      <div className="settingrow">
        <InputNumber addonAfter="MB/s" value={SettingDown.downGlobalSpeed.toString()} onChange={handleDownGlobalSpeed} min={'0'} max={'999'} />
        <Popover
          placement="right"
          content={
            <div>
              <span className="opred">默认0</span> <span className="oporg">(0-999)</span>：不限速
              <hr />
              填 10 就是最高 10MB/s (100兆宽带)
              <br />
              适当的限速可以一边下载一边玩游戏
              <br />
              不限速时会全速下载影响别人上网
              <div className="hrspace"></div>
              <div className="hrspace"></div>
              注：只是下载速度，不限制上传速度
            </div>
          }>
          <i className="iconfont iconbulb" />
        </Popover>
      </div>

      <div className="settinghead">:传输完成后自动关机</div>
      <div className="settingrow">
        <Checkbox checked={SettingDown.downAutoShutDown > 0} onChange={handleDownAutoShutDownChange}>
          下载中&&上传中 列表里的任务全部完成后自动关机
        </Checkbox>
        <Popover
          placement="right"
          content={
            <div>
              <span className="opred">默认不勾选</span>：下载上传完不自动关机
              <hr />
              这是一次性的选项，即重新打开小白羊时会恢复不勾选
              <br /> <br />
              下载上传完后，会弹窗提示：倒数1分钟后自动关机
              <br />
              倒数结束前随时可以点击取消按钮，取消自动关机
              <br />
              部分linux系统可能会因为权限不足关机失败
            </div>
          }>
          <i className="iconfont iconbulb" />
        </Popover>
      </div>
      <div className="settinghead">:传输中在任务栏显示进度</div>
      <div className="settingrow">
        <Checkbox checked={SettingDown.downSaveShowPro} onChange={handleDownSaveShowProChange}>
          下载中&&上传中 在任务栏显示进度(用来提示你正在传输中)
        </Checkbox>
        <Popover
          placement="right"
          content={
            <div>
              <span className="opred">默认勾选</span>：下载上传中，显示进度
              <hr />
              总体的下载上传进度仅仅是粗略计算的(为了性能)
              <br />
              勾选后会在任务栏(win/mac)显示进度条，会在状态栏显示总传输剩余的时间
            </div>
          }>
          <i className="iconfont iconbulb" />
        </Popover>
      </div>
      <div className="settinghead">:下载时优先下载小文件</div>
      <div className="settingrow">
        <Checkbox checked={SettingDown.downSmallFileFirst} onChange={handleDownSmallFileFirstChange}>
          优先下载小于100MB的小文件
        </Checkbox>
        <Popover
          placement="right"
          content={
            <div>
              <span className="opred">默认不勾选</span>：默认按照下载中列表的顺序下载
              <hr />
              有的时候需要一次下载很多文件，大文件会比较耗时
              <br />
              着急用小文件，可以勾选此选项
              <br />
              优先下载小文件
            </div>
          }>
          <i className="iconfont iconbulb" />
        </Popover>
      </div>
      <div className="settinghead">:上传时跳过网盘内同名文件</div>
      <div className="settingrow">
        <Checkbox checked={SettingDown.downUploadBreakExist} onChange={handleDownUploadBreakExistChange}>
          上传时若网盘中存在同名文件，直接跳过不上传
        </Checkbox>
        <Popover
          content={
            <div>
              <span className="opred">默认不勾选</span>：默认上传文件时会严格对比sha1确保所有文件正确上传
              <hr />
              有的时候需要多次上传同一个文件夹（包含巨量文件）
              <br />
              默认需要计算比较每一个文件的sha1确保上传正确的文件
              <br />
              但大文件计算sha1时比较慢
              <br />
              <span className="oporg"> 如果你自己明确知道文件夹内所有文件都没有被修改过，只是新增文件</span>
              <br />
              可以勾选此选项，如果网盘内存在同名文件会直接跳过不上传
              <br />
              即只上传新增的文件，节省上传时间
              <br />
              <span className="opred"> 注意：是直接跳过同名，不管文件 内容/大小 是否修改过！</span>
            </div>
          }>
          <i className="iconfont iconbulb" />
        </Popover>
      </div>
      <div className="settinghead">
        :上传/下载前过滤文件
        <Popover
          content={
            <div>
              <span className="opred">默认无</span>：上传下载时可以根据文件名结尾去过滤文件(不上传/下载)
              <hr />
              1. 配置的规则是过滤文件的，不会过滤文件夹。空文件夹也会被正常上传/下载 <br />
              2. 规则可以是任意字符(一般是填扩展名)，按文件名是否以规则结尾过滤，不论大小写 <br />
              3. 过滤是全局一直生效的，配置后每次上传下载都会过滤，不想过滤了可以删除规则 <br />
              4. 需要先配置好规则再上传/下载文件。<span className="oporg">有文件正在上传/下载时不能修改规则！</span> <br />
              5. 最多可以配置30个规则 <br />
              <div className="hrspace"></div>
              <div className="hrspace"></div>
              <code>
                if(filename.toLower().endWith('<span className="opred">.mp3</span>')==false) break
              </code>
              <br />
              例如：填<span className="opred">.mp3</span>,则上传/下载时会自动过滤掉以.mp3结尾的文件 <br />
              如果一个文件夹里有很多文件，但过滤后没有任何文件需要上传，只会创建一个空文件夹
              <br />
              例如：填<span className="opred">001.ppt.txt</span>,则上传/下载时会自动过滤掉以001.ppt.txt结尾的文件
              <div className="hrspace"></div>
              <div className="hrspace"></div>
              默认已添加：<span className="opred">thumbs.db</span>, <span className="opred">desktop.ini</span>, <span className="opred">.ds_store</span>, <span className="opred">.td</span>, <span className="opred">.downloading</span>
            </div>
          }>
          <i className="iconfont iconbulb" />
        </Popover>
      </div>
      <div className="settingrow" style={{ maxWidth: '600px' }}>
        {SettingDown.downIngoredList.map((tag, index) => {
          return (
            <Tag key={'gl' + index} color="red" closable onClose={(e) => handleDownIngoredList(tag, false)}>
              {tag}
            </Tag>
          )
        })}
        <Input.Search
          ref={taginput}
          size="small"
          placeholder="Add New"
          className="taginput"
          enterButton="添加"
          onSearch={(val) => {
            handleDownIngoredList(val, true)
            if (taginput.current) taginput.current.setValue('')
          }}
        />
      </div>
    </div>
  )
}

export default connect(({ setting }: { setting: SettingModelState }) => ({
  setting
}))(TabDown)
