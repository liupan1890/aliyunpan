import SettingDebug from '@/setting/settingdebug'
import { Button, Input, InputNumber, Popconfirm, Popover, Select } from 'antd'
import { connect, SettingModelState } from 'umi'
import AppCache from '../../store/appcache'
import './setting.css'

const TabDebug = ({ dispatch, setting }: { dispatch: any; setting: SettingModelState }) => {
  function handleFileListMaxChange(val: number) {
    SettingDebug.mSaveDebugFileListMax(val)
  }
  function handleFavorListMaxChange(val: number) {
    SettingDebug.mSaveDebugFavorListMax(val)
  }
  function handleDowningListMaxChange(val: number) {
    SettingDebug.mSaveDebugDowningListMax(val)
  }
  function handleDownedListMaxChange(val: number) {
    SettingDebug.mSaveDebugDownedListMax(val)
  }
  function handleFolderSizeCacheHourChange(val: string) {
    try {
      SettingDebug.mSaveDebugFolderSizeCacheHour(parseInt(val))
    } catch {}
  }

  const handleClearCache = (delby: string) => AppCache.aClearCache(delby)

  return (
    <div className="settingbody  rightbodysc">
      <div className="settinghead first">
        :缓存路径
        <span className="opblue" style={{ marginLeft: '16px' }}>
          {'　'}( {AppCache.AppCacheSize} ){'　'}
        </span>
      </div>
      <div className="settingrow">
        <Input value={AppCache.AppUserData} placeholder="C:\Users\用户名\AppData\Roaming\alixby" readOnly />
      </div>
      <div className="settingrow">
        <Popconfirm title="确认要清理？" onConfirm={(e) => handleClearCache('db')}>
          <Button danger style={{ marginRight: '16px' }}>
            清理数据库
          </Button>
        </Popconfirm>
        <Popconfirm title="确认要清理？" onConfirm={(e) => handleClearCache('cache')}>
          <Button danger style={{ marginRight: '16px' }}>
            清理缓存
          </Button>
        </Popconfirm>
        <Popconfirm title="确认要重置？会重启小白羊" onConfirm={(e) => handleClearCache('all')}>
          <Button type="primary" danger>
            删除全部数据(重置)
          </Button>
        </Popconfirm>
        <Popover
          placement="bottom"
          content={
            <div>
              小白羊基于Electron，会产生一些缓存文件，可以删除释放空间
              <br />
              <span className="oporg">警告</span>：删除缓存可能导致小白羊数据丢失，但重启后小白羊可以正常运行
              <hr />
              <span className="opred">清理数据库</span>：推荐定期清理，可以明显释放空间，对小白羊没有影响
              <div className="hrspace"></div>
              <span className="opred">清理缓存</span>：自动清理可以删除的文件，对小白羊没有大的影响
              <div className="hrspace"></div>
              <span className="opred">删除全部数据</span>：恢复到第一次安装时的状态，删除全部数据、文件
              <div className="hrspace"></div>
              <div className="hrspace"></div>
              1. 小白羊运行中，部分文件会被锁定所以不能删除
              <br />
              2. 如果你想手动打开缓存路径删除文件，要先彻底退出小白羊再删除
              <br />
              3. 删除缓存只影响小白羊的运行，跟用户网盘里的文件<span className="opblue">没有</span>任何关联
              <div className="hrspace"></div>
              <div className="hrspace"></div>
              <span className="oporg">手动删除文件帮助</span>：
              <br />
              <span className="opblue">databases</span>：保存了 上传、下载、文件夹体积 数据
              <br />
              删除后小白羊里的所有 上传中/已上传/下载中/已下载/文件夹体积 数据全部会丢失
              <div className="hrspace"></div>
              <span className="opblue">IndexedDB</span>：保存了 用户账号 和 用户设置 数据
              <br />
              删除后小白羊里的所有 设置项 初始化为默认值，需要重新登录阿里账号
              <br />
              还保存了 文件颜色标记 数据，删除后 标记过颜色的文件 都取消标记
              <br />
              还保存了 分享链接相关 数据，删除后 导入过的分享链接记录 被清空
              <div className="hrspace"></div>
              <span className="opblue">其他文件</span>：Electron自动创建的文件，不重要，随便删除
            </div>
          }>
          <i className="iconfont iconbulb" />
        </Popover>
      </div>

      <div className="settinghead">:文件列表 显示限制</div>
      <div className="settingrow">
        <InputNumber addonAfter="个" value={SettingDebug.debugFileListMax} style={{ width: 190 }} min={1000} max={10000} onChange={handleFileListMaxChange} />
        <Popover
          placement="right"
          content={
            <div>
              <span className="opred">默认3000</span> <span className="oporg">(1000-10000)</span>：只显示前3000个文件
              <hr />
              如果文件夹内文件过多，会需要较长时间列出全部文件
              <br />
              适当的限制可以<span className="opblue">减少加载中等待</span>的时间，操作更快捷
            </div>
          }>
          <i className="iconfont iconbulb" />
        </Popover>
      </div>

      <div className="settinghead">:收藏夹/回收站 显示限制</div>
      <div className="settingrow">
        <InputNumber addonAfter="个" value={SettingDebug.debugFavorListMax} style={{ width: 190 }} min={100} max={3000} onChange={handleFavorListMaxChange} />
        <Popover
          placement="right"
          content={
            <div>
              <span className="opred">默认1000</span> <span className="oporg">(100-3000)</span>：只显示前1000个文件
              <hr />
              如果回收站内文件过多，会需要较长时间列出全部文件
              <br />
              适当的限制可以<span className="opblue">减少加载中等待</span>的时间，操作更快捷
            </div>
          }>
          <i className="iconfont iconbulb" />
        </Popover>
      </div>

      <div className="settinghead">:下载中/上传中 显示限制</div>
      <div className="settingrow">
        <InputNumber addonAfter="个" value={SettingDebug.debugDowningListMax} style={{ width: 190 }} min={100} max={3000} onChange={handleDowningListMaxChange} />
        <Popover
          content={
            <div>
              <span className="opred">默认1000</span> <span className="oporg">(100-3000)</span>：只显示前1000个要下载/上传的文件
              <hr />
              如果下载中/上传中队列里的文件过多，会导致刷新进度时CPU占用提升
              <br />
              适当的限制可以减少刷新进度需要的计算量，<span className="opblue">不影响</span>文件的正常下载/上传
              <br />
              每下载/上传完一个文件，会自动向下执行/显示
            </div>
          }>
          <i className="iconfont iconbulb" />
        </Popover>
      </div>

      <div className="settinghead">:下载完/上传完 保存限制</div>
      <div className="settingrow">
        <InputNumber addonAfter="条" value={SettingDebug.debugDownedListMax} style={{ width: 190 }} min={1000} max={50000} onChange={handleDownedListMaxChange} />
        <Popover
          content={
            <div>
              <span className="opred">默认5000</span> <span className="oporg">(1000-50000)</span>：只保留最新的5000个下载/上传记录
              <hr />
              如果 下载完/上传完 队列里的文件过多，会导致数据库文件体积较大
              <br />
              适当的限制可以减少缓存文件夹的体积！但超出时会自动清理最早的记录！
              <div className="hrspace"></div>
              <span className="oporg">警告</span>：超出限制时，最早的 已上传/已下载 记录会被<span className="opblue">覆盖清理</span>(实际上也没啥用)
            </div>
          }>
          <i className="iconfont iconbulb" />
        </Popover>
      </div>

      <div className="settinghead">:计算文件夹体积 频率限制</div>
      <div className="settingrow">
        <Select value={SettingDebug.debugFolderSizeCacheHour.toString()} style={{ width: 190 }} onChange={handleFolderSizeCacheHourChange} getPopupContainer={(triggerNode:HTMLElement)=>triggerNode.parentElement!}>
          <Select.Option value="2">启动后立即刷新</Select.Option>
          <Select.Option value="8">缓存 8 小时有效</Select.Option>
          <Select.Option value="24">缓存 1 天有效</Select.Option>
          <Select.Option value="72">缓存 3 天有效</Select.Option>
          <Select.Option value="168">缓存 7 天有效</Select.Option>
        </Select>
        <Popover
          content={
            <div>
              <span className="opred">默认3天有效</span>：每个文件夹3天内只计算一次
              <hr />
              启用自动统计文件夹体积后，小白羊会定时计算文件夹的体积并缓存到数据库
              <div className="hrspace"></div>
              例如3天有效，就是说对一个文件计算他的体积，3天内都使用缓存结果不更新
              <br />
              3天后才重新计算这个文件夹的体积
              <div className="hrspace"></div>
              适当的限制可以<span className="opblue">减少重复计算</span>文件夹体积的操作
              <br />
              但也会导致显示的文件夹体积不够准确
              <div className="hrspace"></div>
              如果你想<span className="opblue">立即刷新</span>一个文件夹的准确体积，可以在此文件夹上右键，选择 <span className="opblue">详情</span>
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
}))(TabDebug)
