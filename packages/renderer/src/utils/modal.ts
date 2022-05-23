import { IAliGetFileModel, IAliShareItem } from '@/aliapi/alimodels'
import { useModalStore } from '@/store'

export function modalCloseAll() {
  useModalStore().showModal('', {})
}

export function modalCreatNewFile() {
  useModalStore().showModal('creatfile', {})
}
export function modalCreatNewDir(dirtype: string, parentdirid: string = '', callback: any = undefined) {
  useModalStore().showModal('creatdir', { dirtype, parentdirid, callback })
}

export function modalCreatNewShareLink(sharetype: string, filelist: IAliGetFileModel[]) {
  useModalStore().showModal('creatshare', { sharetype, filelist })
}

export function modalDaoRuShareLink() {
  useModalStore().showModal('daorushare', {})
}
export function modalDaoRuShareLinkMulti() {
  useModalStore().showModal('daorusharemulti', {})
}

export function modalRename(istree: boolean, ismulti: boolean) {
  useModalStore().showModal(ismulti ? 'renamemulti' : 'rename', { istree })
}

export function modalEditShareLink(sharelist: IAliShareItem[]) {
  useModalStore().showModal('editshare', { sharelist })
}
/**
 * @param withsave 是否显示保存按钮
 * @param file_id_list  需要高亮显示的文件id列表
 */
export function modalShowShareLink(share_id: string, share_pwd: string, share_token: string, withsave: boolean, file_id_list: string[]) {
  useModalStore().showModal('showshare', { share_id, share_pwd, share_token, withsave, file_id_list })
}

export function modalSelectPanDir(selecttype: string, callback: (user_id: string, drive_id: string, dir_id: string, dir_name: string) => void) {
  useModalStore().showModal('selectpandir', { selecttype, callback })
}

export function modalShuXing(istree: boolean, ismulti: boolean) {
  ismulti = false 
  useModalStore().showModal(ismulti ? 'shuxingmulti' : 'shuxing', { istree })
}

export function modalSearchPan() {
  useModalStore().showModal('searchpan', {})
}

export function modalDLNAPlayer() {
  useModalStore().showModal('dlna', {})
}
export function modalM3U8Download() {
  useModalStore().showModal('m3u8download', {})
}
