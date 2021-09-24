import AliUser from 'src/aliapi/user';
import { VuexModule, Module, Action, Mutation } from 'vuex-module-decorators';
import { DB, StoreUser, StoreRoot, StoreSetting, SQL } from './index';
import { ITokenInfo } from './models';
import { format } from 'quasar';
import AliFileList from 'src/aliapi/filelist';
import { NotifyError } from 'src/aliapi/notify';

interface IStateUser {
  isLogin: boolean;
  avatar: string;
  username: string;
  usertoken: string;
  userspace: string;
  tokeninfo: ITokenInfo;
  tokenlist: ITokenInfo[];
}

function getEnmptyToken() {
  return {
    access_token: '',
    refresh_token: '',
    expires_in: 0,
    token_type: '',
    user_id: '',
    user_name: '',
    avatar: '',
    nick_name: '',
    default_drive_id: '',
    default_sbox_drive_id: '',
    role: '',
    status: '',
    expire_time: '',
    state: '',
    pin_setup: false,
    is_first_login: false,
    need_rp_verify: false,
    name: '',
    spu_id: '',
    is_expires: false,
    used_size: 0,
    total_size: 0,
    spaceinfo: '',
    pic_drive_id: '',
  };
}

@Module({ namespaced: true, name: 'User', stateFactory: true })
export default class User extends VuexModule implements IStateUser {
  public tokenlist: ITokenInfo[] = [];
  public tokeninfo: ITokenInfo = getEnmptyToken();
  public username = '昵称';
  public usertoken = '';
  public userspace = '';
  public userid = '';
  public avatar = 'img/userface.png';
  public isLogin = false;

  get getUser() {
    return (userid: string): ITokenInfo | undefined => {
      for (let i = 0; i < this.tokenlist.length; i++) {
        if (this.tokenlist[i].user_id == userid) {
          return Object.assign({}, this.tokenlist[i]);
        }
      }
      return undefined;
    };
  }

  @Mutation 
  mRefresh(token: ITokenInfo) {
    for (let i = 0; i < this.tokenlist.length; i++) {
      if (this.tokenlist[i].user_id === token.user_id) {
        this.tokenlist[i] = token;
      }
    }
    if (this.tokeninfo?.user_id == token.user_id) {
      this.tokeninfo = token;
      this.username = token.nick_name != '' ? token.nick_name : token.user_name;
      this.usertoken = token.user_id + '\n' + token.default_drive_id + '\n' + token.refresh_token + '\n' + token.token_type + ' ' + token.access_token;
      this.userspace = format.humanStorageSize(token.used_size) + ' / ' + format.humanStorageSize(token.total_size);
      this.userid = token.user_id;
      this.isLogin = true;
    }
    DB.saveUser(token);
  }
  @Mutation
  mSaveLogoff() {
    if (this.tokeninfo) {
      const userid = this.tokeninfo.user_id;
      DB.deleteUser(userid);
      for (let i = 0; i < this.tokenlist.length; i++) {
        if (this.tokenlist[i].user_id === userid) {
          this.tokenlist.splice(i, 1);
          i--;
        }
      }
    }
    this.tokeninfo = getEnmptyToken();
    this.username = '昵称';
    this.userspace = '';
    this.userid = '';
    this.avatar = 'img/userface.png';
    this.isLogin = false;

    if (this.tokenlist.length > 0) {
      StoreUser.mChangeUser(this.tokenlist[this.tokenlist.length - 1].user_id);
    } else {
      StoreRoot.mChangUser({ user_id: '', drive_id: '' });
    }
  }
  @Mutation
  mSaveLogin(token: ITokenInfo) {
    this.tokeninfo = token;
    this.username = token.nick_name != '' ? token.nick_name : token.user_name;
    this.usertoken = token.user_id + '\n' + token.default_drive_id + '\n' + token.refresh_token + '\n' + token.token_type + ' ' + token.access_token;
    this.userspace = format.humanStorageSize(token.used_size) + ' / ' + format.humanStorageSize(token.total_size);
    this.userid = token.user_id;
    this.avatar = 'img/userface.png';
    this.isLogin = true;
    DB.saveUser(token);
    for (let i = 0; i < this.tokenlist.length; i++) {
      if (this.tokenlist[i].user_id === token.user_id) {
        this.tokenlist[i] = token;
        return;
      }
    }
    this.tokenlist.push(token);
  }
  @Mutation
  mSaveAvatar({ userid, avatar }: { userid: string; avatar: Blob }) {
    try {
      const URL = window.URL || window.webkitURL;
      const imgURL = URL.createObjectURL(avatar);
      if (userid == this.tokeninfo?.user_id) {
        this.avatar = imgURL;
      }
    } catch {}
  }
  @Action
  async aSaveLogin(token: ITokenInfo) {
    let needrefresh = true;
    try {
      const subtime = (Date.parse(token.expire_time) - Date.now()) / 1000;
      needrefresh = subtime < 3600; 
    } catch {}
    if (needrefresh) {
      const login = await AliUser.ApiTokenRefresh(token);
      if (login == false) {
        NotifyError('账号 ' + token.user_name + ' ' + token.nick_name + ' 需要退出后重新登录');
        return;
      }
    }
    await AliFileList.ApiFileListTestLimit(token);
    StoreRoot.mChangUser({ user_id: token.user_id, drive_id: token.default_drive_id });
    const avatardata = await DB.getFile('Avatar_' + token.user_id);
    if (avatardata) {
      StoreUser.mSaveAvatar({ userid: token.user_id, avatar: avatardata });
    }
    await Promise.all([AliUser.ApiUserInfo(token), AliUser.ApiUserPic(token)])
      .then(() => {
        StoreUser.mSaveLogin(token); 
        StoreRoot.aLoadAllDirList(true);
        if (avatardata) {
          StoreUser.mSaveAvatar({ userid: token.user_id, avatar: avatardata });
        }
      })
      .then(() => {
        AliUser.ApiUserAvatar(token).then((data) => {
          if (data) {
            DB.saveFile('Avatar_' + token.user_id, data);
            StoreUser.mSaveAvatar({ userid: token.user_id, avatar: data });
          } else {
            if (avatardata) {
              StoreUser.mSaveAvatar({ userid: token.user_id, avatar: avatardata });
            }
          }
        });
      });
  }

  @Action
  async aLoadFromDB() {
    const tokenlist = await DB.getUserAll();
    const userlist = [];
    for (let i = 0; i < tokenlist.length; i++) {
      const token = tokenlist[i];
      let needrefresh = true;
      try {
        const subtime = (Date.parse(token.expire_time) - Date.now()) / 1000;
        needrefresh = subtime < 6000; 
      } catch {}
      if (needrefresh || true) {
        const islogin = await AliUser.ApiTokenRefresh(token);
        if (islogin) userlist.push(token);
      } else {
      }
    }
    StoreUser.mLoadFromDB(userlist);
  }
  @Mutation
  mLoadFromDB(tokenlist: ITokenInfo[]) {
    this.tokenlist.splice(0); 
    if (tokenlist.length > 0) {
      this.tokenlist.push(...tokenlist); 
      let userid = '';
      for (let i = 0; i < tokenlist.length; i++) {
        if (tokenlist[i].user_id == StoreSetting.uiDefaultUser) {
          userid = StoreSetting.uiDefaultUser;
        }
      }
      if (userid == '') userid = tokenlist[tokenlist.length - 1].user_id;
      StoreUser.mChangeUser(userid);
    }
  }

  @Mutation
  mChangeUser(userid: string) {
    if (userid == this.tokeninfo?.user_id) return; 
    StoreSetting.mSaveUiDefaultUser(userid);
    let token: ITokenInfo | undefined = undefined;
    if (this.tokenlist) {
      if (this.tokenlist.length > 0) {
        for (let i = 0; i < this.tokenlist.length; i++) {
          if (this.tokenlist[i].user_id === userid) token = this.tokenlist[i];
        }
      }
    }
    if (token) {
      this.tokeninfo = token;
      this.username = token.nick_name == '' ? token.user_name : token.nick_name;
      this.userspace = format.humanStorageSize(token.used_size) + ' / ' + format.humanStorageSize(token.total_size);
      this.userid = token.user_id;
      this.avatar = 'img/userface.png';
      this.isLogin = true;
      StoreUser.aSaveLogin(Object.assign({}, token)); 
    } else {
      this.tokeninfo = getEnmptyToken();
      this.username = '昵称';
      this.userspace = '';
      this.userid = '';
      this.avatar = 'img/userface.png';
      this.isLogin = false;
    }
  }

  @Action 
  async aRefreshAllUser() {
    const tokenlist = await DB.getUserAll();
    
    for (let i = 0; i < tokenlist.length; i++) {
      try {
        const token = tokenlist[i];
        let needrefresh = true;
        
        const isinfo = await AliUser.ApiUserInfo(token);
        if (isinfo) {
          
          try {
            const subtime = (Date.parse(token.expire_time) - Date.now()) / 1000;
            needrefresh = subtime < 2000; 
          } catch {}
        }
        
        if (needrefresh) {
          await AliUser.ApiTokenRefresh(token);
        }
        const items = await SQL.GetAllDir(token.user_id, token.default_drive_id);
        const ts3 = Date.now() - 1000 * 60 * 60 * 24; 
        const iditems = []; 
        for (let d = 0; d < items.length; d++) {
          const item = items[d];
          if (item.loading == 1629795158000 || (item.loading < ts3 && item.duration > 600)) {
            
            iditems.push({ drive_id: item.drive_id, file_id: item.file_id });
            if (iditems.length > 1000) break; 
          }
        }
        if (window.WinMsgToUI && StoreSetting.uiFolderSize && iditems.length > 0) {
          window.WinMsgToUI({ cmd: 'LoadAllDirFiles', token, items: iditems });
        }
      } catch {}
    }
  }
}
