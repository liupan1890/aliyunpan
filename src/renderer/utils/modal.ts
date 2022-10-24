import { IAliGetFileModel, IAliShareItem } from '../aliapi/alimodels'
import { useModalStore } from '../store'

export function modalCloseAll() {
  useModalStore().showModal('', {})
}

export function modalUserSpace() {
  useModalStore().showModal('userspace', {})
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

export function modalShowShareLink(share_id: string, share_pwd: string, share_token: string, withsave: boolean, file_id_list: string[]) {
  useModalStore().showModal('showshare', { share_id, share_pwd, share_token, withsave, file_id_list })
}

export function modalSelectPanDir(selecttype: string, selectid: string, callback: (user_id: string, drive_id: string, dirID: string, dirName: string) => void) {
  useModalStore().showModal('selectpandir', { selecttype, selectid, callback })
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

export function modalCopyFileTree(filelist: IAliGetFileModel[]) {
  useModalStore().showModal('copyfiletree', { filelist })
}

export function modalArchive(user_id: string, drive_id: string, file_id: string, file_name: string, parent_file_id: string, password: string) {
  useModalStore().showModal('archive', { user_id, drive_id, file_id, file_name, parent_file_id, password })
}

export function modalArchivePassword(user_id: string, drive_id: string, file_id: string, file_name: string, parent_file_id: string, domain_id: string, ext: string) {
  useModalStore().showModal('archivepassword', { user_id, drive_id, file_id, file_name, parent_file_id, domain_id, ext })
}

export function modalUpload(file_id: string, filelist: string[]) {
  useModalStore().showModal('upload', { file_id, filelist })
}

export function modalDownload(istree: boolean) {
  useModalStore().showModal('download', { istree })
}
