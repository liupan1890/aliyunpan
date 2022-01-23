export interface IShareSiteModel {
  title: string
  url: string
  tip: string
}
class SettingConfigC {
  public appVersion = 'v3.01.20'
  public referer = 'https://www.aliyundrive.com/'
  public userAgent = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) 2.1.8 Chrome/89.0.4389.128 Electron/12.0.9 Safari/537.36'
  public loginUrl =
    'https://auth.aliyundrive.com/v2/oauth/authorize?login_type=custom&response_type=code&redirect_uri=https%3A%2F%2Fwww.aliyundrive.com%2Fsign%2Fcallback&client_id=25dzX3vbYqktVxyX&state=%7B%22origin%22%3A%22*%22%7D'
  public loginUrlAccount =
    'https://passport.aliyundrive.com/mini_login.htm?lang=zh_cn&appName=aliyun_drive&appEntrance=web&styleType=auto&bizParams=&notLoadSsoView=false&notKeepLogin=false&isMobile=false&&rnd=0.1100330129139'
}

const SettingConfig = new SettingConfigC()
export default SettingConfig
