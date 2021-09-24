import { VuexModule, Module } from 'vuex-module-decorators';

interface IStateConfig {
  appVersion: string; //
  loginUrl: string; //
  referer: string; //
  userAgent: string; //
}
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
@Module({ namespaced: true, name: 'Config', stateFactory: true })
export default class Config extends VuexModule implements IStateConfig {
  public appVersion = 'v2.9.24';
  public referer = 'https://www.aliyundrive.com/';
  public userAgent = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) 2.1.8 Chrome/89.0.4389.128 Electron/12.0.9 Safari/537.36';
  public loginUrl =
    'https://auth.aliyundrive.com/v2/oauth/authorize?login_type=custom&response_type=code&redirect_uri=https%3A%2F%2Fwww.aliyundrive.com%2Fsign%2Fcallback&client_id=25dzX3vbYqktVxyX&state=%7B%22origin%22%3A%22*%22%7D';
  //'https://auth.aliyundrive.com/v2/oauth/authorize?login_type=custom&response_type=code&redirect_uri=https%3A%2F%2Fwww.aliyundrive.com%2Fsign%2Fcallback&client_id=25dzX3vbYqktVxyX&state=%7B%22origin%22%3A%22file%3A%2F%2F%22%7D';

}
