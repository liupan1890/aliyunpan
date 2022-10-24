import UserDAL from '../user/userdal'
import DebugLog from '../utils/debuglog'
import axios from 'axios'
import AliUpload from './upload'
import AliUploadHashPool from './uploadhashpool'

export default class AliUploadMem {
  
  static async UploadMem(user_id: string, drive_id: string, parent_file_id: string, CreatFileName: string, context: string) {
    const token = await UserDAL.GetUserTokenFromDB(user_id)
    if (!token || !token.access_token) return '账号失效，操作取消'
    let hash = 'DA39A3EE5E6B4B0D3255BFEF95601890AFD80709' 
    let proof = ''
    let buff = Buffer.from([])
    if (context.length > 0) {
      buff = Buffer.from(context, 'utf-8')
      const dd = await AliUploadHashPool.GetBuffHashProof(token!.access_token, buff)
      hash = dd.sha1
      proof = dd.proof_code
    }
    const size = buff.length

    const upinfo = await AliUpload.UploadCreatFileWithFolders(user_id, drive_id, parent_file_id, CreatFileName, size, hash, proof, 'refuse')
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
      .catch(function (err: any) {
        DebugLog.mSaveDanger('UploadMemError', err)
      })
    const result = await AliUpload.UploadFileComplete(user_id, drive_id, upinfo.file_id, upinfo.upload_id, size, hash)
    if (result) return 'success'
    else return '合并文件失败'
  }
}
