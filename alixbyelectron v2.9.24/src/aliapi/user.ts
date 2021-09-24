import { DB, StoreUser } from 'src/store';
import { ITokenInfo } from 'src/store/models';
import AliHttp from './alihttp';
import { NotifyError } from './notify';

function IsSuccess(code: number) {
  return code >= 200 && code <= 300;
}

export const TokenMap = new Map<string, number>();
export default class AliUser {
  static async ApiTokenRefresh(token: ITokenInfo) {
    const time = TokenMap.get(token.user_id) || 0; 
    if (Date.now() - time < 1000 * 60 * 3) return; 

    const url = 'https://api.aliyundrive.com/token/refresh';

    const postdata = { refresh_token: token.refresh_token };
    const resp = await AliHttp.Post(url, postdata, token);
    if (IsSuccess(resp.code)) {
      TokenMap.set(resp.body.user_id, Date.now());
      token.access_token = resp.body.access_token;
      token.refresh_token = resp.body.refresh_token;
      token.expires_in = resp.body.expires_in;
      token.token_type = resp.body.token_type;
      token.user_id = resp.body.user_id;
      token.user_name = resp.body.user_name;
      token.avatar = resp.body.avatar;
      token.nick_name = resp.body.nick_name;
      token.default_drive_id = resp.body.default_drive_id;
      token.default_sbox_drive_id = resp.body.default_sbox_drive_id;
      token.role = resp.body.role;
      token.status = resp.body.status;
      token.expire_time = resp.body.expire_time;
      token.state = resp.body.state;
      token.pin_setup = resp.body.pin_setup;
      token.is_first_login = resp.body.is_first_login;
      token.need_rp_verify = resp.body.need_rp_verify;
      await DB.saveUser(token);
      StoreUser.mRefresh(Object.assign({}, token));
      return true;
    } else {
      NotifyError('刷新账号[' + token.user_name + '] token 失败');
    }
    return false;
  }
  static async ApiUserInfo(token: ITokenInfo) {
    const url = 'v2/databox/get_personal_info';
    const postdata = '';
    const resp = await AliHttp.Post(url, postdata, token);
    if (IsSuccess(resp.code)) {
      token.used_size = resp.body.personal_space_info.used_size;
      token.total_size = resp.body.personal_space_info.total_size;
      token.spu_id = resp.body.personal_rights_info.spu_id;
      token.is_expires = resp.body.personal_rights_info.is_expires;
      token.name = resp.body.personal_rights_info.name;
      StoreUser.mRefresh(Object.assign({}, token));
      return true;
    }
    return false;
  }
  static async ApiUserPic(token: ITokenInfo) {
    const url = 'adrive/v1/user/albums_info';

    const postdata = {};
    const resp = await AliHttp.Post(url, postdata, token);
    if (IsSuccess(resp.code)) {
      token.pic_drive_id = resp.body.driveId;
      return true;
    }
    return false;
  }
  static async ApiUserAvatar(token: ITokenInfo): Promise<Blob | undefined> {
    const url = token.avatar;
    const resp = await AliHttp.Down(url, token);
    if (IsSuccess(resp.code)) {
      return resp.body as Blob;
    }
    return undefined;
  }
}
