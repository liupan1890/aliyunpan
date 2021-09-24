import axios from 'axios';
import { ITokenInfo } from 'src/store/models';
import AliUpload from './upload';

export default class AliUploadMem {
  static async UploadMem(drive_id: string, parentid: string, filename: string, context: string, token: ITokenInfo) {
    let hash = 'DA39A3EE5E6B4B0D3255BFEF95601890AFD80709'; 
    let proof = '';
    let buff = Buffer.from([]);
    if (context.length > 0) {
      buff = Buffer.from(context, 'utf-8');
      const dd = await AliUpload.GetBuffHashProof(token.access_token, buff);
      hash = dd.sha1;
      proof = dd.proof_code;
    }
    const size = buff.length;

    const upinfo = await AliUpload.UploadCreatFileWithFolders(drive_id, parentid, filename, size, hash, proof, '', token);
    if (upinfo.errormsg != '') {
      return upinfo.errormsg;
    }
    if (upinfo.israpid) return 'success';

    await axios
      .put(upinfo.part_info_list[0].upload_url, buff, {
        responseType: 'text',
        headers: {
          timeout: 30000,
          //Expect: '100-continue',
          'Content-Type': '',
          Authorization: token.token_type + ' ' + token.access_token,
        },
      })
      .catch(function (error) {
        console.log(error);
      });
    const result = await AliUpload.UploadFileComplete(drive_id, upinfo.file_id, upinfo.upload_id, size, token);
    if (result) return 'success';
    else return '合并文件失败';
  }
}
