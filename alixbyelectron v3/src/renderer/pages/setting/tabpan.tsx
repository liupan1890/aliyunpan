import SettingPan from '@/setting/settingpan'
import { Checkbox, Input, InputNumber, Popover, Radio, RadioChangeEvent, Select, Tooltip } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { SelectValue } from 'antd/lib/select'
import { connect, SettingModelState } from 'umi'
import './setting.css'
const TabPan = ({ dispatch, setting }: { dispatch: any; setting: SettingModelState }) => {
  function handleAutoFolderSizeChange(e: CheckboxChangeEvent) {
    SettingPan.mSaveUiFolderSize(e.target.checked)
  }
  function handleFileOpenDoubleChange(e: CheckboxChangeEvent) {
    SettingPan.mSaveUiFileOpenDouble(e.target.checked)
  }

  function handleFileOrderDuliChange(val: string) {
    SettingPan.mSaveUiFileOrderDuli(val)
    window.getDvaApp()._store.dispatch({ type: 'pan/mChangSelectDirFileOrder' })
  }

  function handleTimeFolderFormateChange(e: any) {
    SettingPan.mSaveUiTimeFolderFormate(e.target.value || '')
  }
  function handleTimeFolderIndexChange(val: string) {
    try {
      SettingPan.mSaveUiTimeFolderIndex(parseInt(val))
    } catch {}
  }
  function handleXBTNumberChange(e: RadioChangeEvent) {
    try {
      SettingPan.mSaveUiXBTNumber(parseInt(e.target.value || '36'))
    } catch {}
  }
  function handleTrashAutoCleanDayChange(e: RadioChangeEvent) {
    try {
      SettingPan.mSaveUiTrashAutoCleanDay(parseInt(e.target.value || '9999'))
    } catch {}
  }

  function handleShareDaysChange(e: RadioChangeEvent) {
    try {
      SettingPan.mSaveUiShareDays(e.target.value || 'always')
    } catch {}
  }

  function handleSharePasswordChange(e: RadioChangeEvent) {
    try {
      SettingPan.mSaveUiSharePassword(e.target.value || 'random')
    } catch {}
  }

  return (
    <div className="settingbody rightbodysc">
      <div className="settinghead first">:文件夹体积</div>
      <div className="settingrow">
        <Checkbox checked={SettingPan.uiFolderSize} onChange={handleAutoFolderSizeChange}>
          启用自动统计文件夹体积
        </Checkbox>
        <Popover
          placement="right"
          content={
            <div>
              <span className="opred">默认勾选</span>：小白羊会在后台异步的自动计算文件夹的体积
              <hr />
              开启后才能显示文件夹的体积，文件夹可以按照体积排序
              <div className="hrspace"></div>
              注：文件夹体积不是时时更新的，会有误差，定时自动更新
            </div>
          }>
          <i className="iconfont iconbulb" />
        </Popover>
      </div>

      <div className="settinghead">:打开文件触发</div>
      <div className="settingrow">
        <Checkbox checked={SettingPan.uiFileOpenDouble} onChange={handleFileOpenDoubleChange}>
          启用 双击整行 打开文件/文件夹
        </Checkbox>
        <Popover
          placement="right"
          content={
            <div>
              <span className="opred">默认不勾选</span>：点击文件名的<span className="opblue">文字</span> 触发打开文件/文件夹
              <hr />
              开启后，双击整行才会打开文件/文件夹
              <br />
              默认不开启，单击文件名时打开文件/文件夹
              <br />
              打开文件即在线预览，打开文件夹即进入文件夹
            </div>
          }>
          <i className="iconfont iconbulb" />
        </Popover>
      </div>

      <div className="settinghead">:文件夹独立排序</div>
      <div className="settingrow">
        <Select value={SettingPan.uiFileOrderDuli} style={{ width: 230 }} onChange={handleFileOrderDuliChange} getPopupContainer={(triggerNode:HTMLElement)=>triggerNode.parentElement!}>
          <Select.Option value="">不要开启独立排序</Select.Option>
          <Select.Option value="name asc">开启&默认文件名 升序</Select.Option>
          <Select.Option value="name desc">开启&默认文件名 降序</Select.Option>
          <Select.Option value="updated_at asc">开启&默认时间 升序</Select.Option>
          <Select.Option value="updated_at desc">开启&默认时间 降序</Select.Option>
          <Select.Option value="size asc">开启&默认大小 升序</Select.Option>
          <Select.Option value="size desc">开启&默认大小 降序</Select.Option>
        </Select>
        <Popover
          content={
            <div>
              <span className="opred">默认不开启</span>：所有文件夹按照全局的规则排序
              <hr />
              开启后每个文件夹内的文件都是按照自己的规则排序的（会记住）
              <br />
              例如A文件夹按时间降序，B文件夹按大小降序，C文件夹按名称升序
            </div>
          }>
          <i className="iconfont iconbulb" />
        </Popover>
      </div>

      <div className="settinghead">:新建日期文件夹</div>
      <div className="settingrow">
        <Tooltip overlay={'编写 文件夹名的 命名规则'} placement="bottom">
          <Input value={SettingPan.uiTimeFolderFormate} placeholder="yyyy-MM-dd HH-mm-ss" style={{ maxWidth: '230px' }} onChange={handleTimeFolderFormateChange} />
        </Tooltip>
        <Tooltip overlay={'编号的起始数字'} placement="bottom">
          <InputNumber value={SettingPan.uiTimeFolderIndex.toString()} onChange={handleTimeFolderIndexChange} min={'1'} style={{ maxWidth: '100px', marginLeft: '16px', marginTop: '-1px' }} />
        </Tooltip>
        <Popover
          content={
            <div>
              <span className="opred">默认yyyy-MM-dd HH-mm-ss</span>：2021-08-08 12-30-00
              <hr />
              这里是编写命名规则，创建文件夹时会自动替换成当前时间对应的名字
              <br />
              年=<span className="oporg">yyyy</span>, 月=<span className="oporg">MM</span>, 日=<span className="oporg">dd</span>, 时=<span className="oporg">HH</span>, 分=
              <span className="oporg">mm</span>, 秒=
              <span className="oporg">ss</span>, 编号=
              <span className="oporg">#</span>
              <div className="hrspace"></div>
              编号可以通过n个#来设置最短的长度，可以在这里修改编号起始位置
              <br />
              每次成功创建一个文件夹，编号会自动加1
              <div className="hrspace"></div>
              例如:<span className="opblue">#### 创建于yyyy年MM月dd日</span> --&gt;
              <span className="opblue">0001 创建于2021年08月08日</span>
              <br />
              例如:<span className="opblue">yyyy年MM月相册 ##</span> --&gt;
              <span className="opblue">2021年08月相册 01</span>
            </div>
          }>
          <i className="iconfont iconbulb" />
        </Popover>
      </div>
      <div className="settinghead">:创建分享链接 时效/提取码</div>
      <div className="settingrow">
        <Radio.Group value={SettingPan.uiShareDays} buttonStyle="solid" onChange={handleShareDaysChange}>
          <Radio.Button value="always">永久</Radio.Button>
          <Radio.Button value="week">一周</Radio.Button>
          <Radio.Button value="month">一月</Radio.Button>
        </Radio.Group>
        <span style={{ marginRight: '8px' }}></span>
        <Radio.Group value={SettingPan.uiSharePassword} buttonStyle="solid" onChange={handleSharePasswordChange}>
          <Radio.Button value="random">随机</Radio.Button>
          <Radio.Button value="last">上次</Radio.Button>
          <Radio.Button value="nopassword">无</Radio.Button>
        </Radio.Group>
        <Popover
          content={
            <div>
              创建新的分享链接时，默认指定的设置
              <hr />
              <span className="oporg">永久</span>：分享链接永久有效
              <br />
              <span className="oporg">一周</span>：分享链接7天内有效
              <br />
              <span className="oporg">一月</span>：分享链接30天内有效
              <br />
              <div className="hrspace"></div>
              <span className="oporg">随机</span>：随机生成4位数字字母组合
              <br />
              <span className="oporg">上次</span>：上一次创建时填写的密码
              <br />
              <span className="oporg">无</span>：空的，不需要提取码
              <br />
            </div>
          }>
          <i className="iconfont iconbulb" />
        </Popover>
      </div>
      <div className="settinghead">:视频文件详情里雪碧图数量</div>
      <div className="settingrow">
        <Radio.Group value={SettingPan.uiXBTNumber.toString()} buttonStyle="solid" onChange={handleXBTNumberChange}>
          <Radio.Button value="24">24张</Radio.Button>
          <Radio.Button value="36">36张</Radio.Button>
          <Radio.Button value="48">48张</Radio.Button>
          <Radio.Button value="60">60张</Radio.Button>
          <Radio.Button value="72">72张</Radio.Button>
        </Radio.Group>
        <Popover
          content={
            <div>
              <span className="opred">默认36张</span>：视频文件详情里显示36张截图
              <hr />
              按照视频播放总时长/36的平均间隔去截图
            </div>
          }>
          <i className="iconfont iconbulb" />
        </Popover>
      </div>
      <div className="settinghead">:自动清理回收站</div>
      <div className="settingrow">
        <Radio.Group value={SettingPan.uiTrashAutoCleanDay.toString()} buttonStyle="solid" onChange={handleTrashAutoCleanDayChange}>
          <Radio.Button value="9999">不开启</Radio.Button>
          <Radio.Button value="2">2天</Radio.Button>
          <Radio.Button value="7">7天</Radio.Button>
          <Radio.Button value="15">15天</Radio.Button>
          <Radio.Button value="30">30天</Radio.Button>
        </Radio.Group>
        <Popover
          content={
            <div>
              <span className="opred">默认不开启</span>：不自动清理回收站内的文件
              <hr />
              阿里云盘没有提供回收站内文件过期清理功能
              <br />
              回收站内的文件会一直占用网盘空间
              <br />
              例如选择<span className="opred">30天</span>，并不是每隔30天清空回收站！
              <br />
              而是每天都会自动检测，删除放入回收站已超过30天的文件
              <br />
              你刚刚删除(少于30天)的文件不会被清理！
              <div className="hrspace"></div>
              <span className="oporg">警告：</span>谨慎开启，回收站内文件清理后无法恢复
            </div>
          }>
          <i className="iconfont iconbulb" />
        </Popover>
      </div>
    </div>
  )
}

export default connect(({ setting }: { setting: SettingModelState }) => ({
  setting
}))(TabPan)
