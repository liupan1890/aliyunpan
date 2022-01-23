
import SettingYinSi from '@/setting/settingyinsi'
import { Alert, Checkbox, Popover } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { connect, SettingModelState } from 'umi'
import './setting.css'
const TabAbout = (props: any) => {
  function handleYinsiLinkPassword(e: CheckboxChangeEvent) {
    SettingYinSi.mSaveYinsiLinkPassword(e.target.checked)
  }
  function handleYinsiZipPassword(e: CheckboxChangeEvent) {
    SettingYinSi.mSaveYinsiZipPassword(e.target.checked)
  }

  return (
    <div className="settingbody rightbodysc">
      <Alert
        className="warninginfo"
        message="小白羊重视保护用户的隐私"
        description={
          <div>
            默认不会产生任何上传到服务器的流量
          </div>
        }
        type="warning"
      />
      <div className="settinghead">:分享链接提取码自动填写</div>
      <div className="settingrow">
        <Checkbox checked={SettingYinSi.yinsiLinkPassword} onChange={handleYinsiLinkPassword}>
          导入分享链接时，尝试自动填写链接提取码
        </Checkbox>
        <Popover
          content={
            <div>
              <span className="opred">默认不勾选</span>：不尝试自动填写链接提取码，不会提交提取码到小白羊服务器
              <hr />
              有的分享链接需要填写提取码，如果你不知道提取码，
              <br />
              开启后，有极小的几率可以自动填写。(刚开始没有很多数据)
              <br />
              就是类似百度网盘助手自动填写提取码
              <br />
              <div className="hrspace"></div>
              <span className="oporg">注意</span> ，开启后会自动收集你 <span className="opblue">导入的</span>
              分享链接的提取码，
              <br />
              并自动提交到小白羊的服务器（只包括分享链接id,分享链接提取码，2个信息）
              <div className="hrspace"></div>
              当你自己创建分享链接时，不会收集分享链接提取码！只在导入链接时收集
            </div>
          }>
          <i className="iconfont iconbulb" />
        </Popover>
      </div>

      <div className="settinghead">:压缩包密码自动填写</div>
      <div className="settingrow">
        <Checkbox checked={SettingYinSi.yinsiZipPassword} onChange={handleYinsiZipPassword}>
          在线解压时，尝试自动填写解压密码
        </Checkbox>
        <Popover
          content={
            <div>
              <span className="opred">默认不勾选</span>：不尝试自动填写解压密码，不会提交密码到小白羊服务器
              <hr />
              有的压缩包在线解压需要填写密码，如果你不知道密码，
              <br />
              开启后，有极小的几率可以自动填写。(刚开始没有很多数据)
              <br />
              <div className="hrspace"></div>
              <span className="oporg">注意</span> ，开启后会自动收集你 <span className="opblue">在线解压</span>
              的压缩包的密码，
              <br />
              并自动提交到小白羊的服务器（只包括压缩包文件sha1,压缩包密码，2个信息）
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
}))(TabAbout)
