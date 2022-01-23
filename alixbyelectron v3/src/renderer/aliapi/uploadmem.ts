import SettingLog from '@/setting/settinglog'
import UserDAL from '@/store/userdal'
import axios from 'axios'
import AliUpload from './upload'
import AliUploadHash from './uploadhash'

export default class AliUploadMem {
  static async UploadMem(user_id: string, drive_id: string, parentid: string, filename: string, context: string) {
    let token = UserDAL.GetUserToken(user_id)
    if (!token || !token.access_token) return '账号失效，操作取消'
    let hash = 'DA39A3EE5E6B4B0D3255BFEF95601890AFD80709'
    let proof = ''
    let buff = Buffer.from([])
    if (context.length > 0) {
      buff = Buffer.from(context, 'utf-8')
      const dd = await AliUploadHash.GetBuffHashProof(token!.access_token, buff)
      hash = dd.sha1
      proof = dd.proof_code
    }
    const size = buff.length

    const upinfo = await AliUpload.UploadCreatFileWithFolders(user_id, drive_id, parentid, filename, size, hash, proof, '', true)
    if (upinfo.errormsg != '') {
      return upinfo.errormsg
    }
    if (upinfo.isexist) return '网盘中已存在同名文件'
    if (upinfo.israpid) return 'success'

    await axios
      .put(upinfo.part_info_list[0].upload_url, buff, {
        responseType: 'text',
        timeout: 30000,
        headers: {
          'Content-Type': '',
          Authorization: token!.token_type + ' ' + token!.access_token
        }
      })
      .catch(function (e: any) {
        SettingLog.mSaveLog('danger', 'UploadMemError ' + (e.message || ''))
      })
    const result = await AliUpload.UploadFileComplete(user_id, drive_id, upinfo.file_id, upinfo.upload_id, size)
    if (result) return 'success'
    else return '合并文件失败'
  }
}
