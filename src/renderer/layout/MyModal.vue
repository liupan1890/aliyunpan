<script lang="ts">
import { defineComponent } from 'vue'
import { useModalStore } from '../store'
import UserSpaceModal from '../user/UserSpaceModal.vue'
import CreatNewFileModal from '../pan/topbtns/CreatNewFileModal.vue'
import RenameModal from '../pan/topbtns/RenameModal.vue'
import RenameMultiModal from '../pan/topbtns/RenameMultiModal.vue'
import CreatNewDirModal from '../pan/topbtns/CreatNewDirModal.vue'
import DaoRuShareLinkModal from '../pan/topbtns/DaoRuShareLinkModal.vue'
import EditShareLinkModal from '../share/share/EditShareLinkModal.vue'
import DaoRuShareLinkMultiModal from '../pan/topbtns/DaoRuShareLinkMultiModal.vue'
import ShowShareLinkModal from '../share/share/ShowShareLinkModal.vue'
import SelectPanDirModal from '../pan/topbtns/SelectPanDirModal.vue'
import CreatNewShareLinkModal from '../pan/topbtns/CreatNewShareLinkModal.vue'
import ShuXingModal from '../pan/topbtns/ShuXingModal.vue'
import ShuXingMultiModal from '../pan/topbtns/ShuXingMultiModal.vue'
import SearchPanModal from '../pan/topbtns/SearchPanModal.vue'
import DLNAPlayerModal from '../pan/topbtns/DLNAPlayerModal.vue'
import M3U8DownloadModal from '../pan/topbtns/M3U8DownloadModal.vue'
import CopyFileTreeModal from '../pan/topbtns/CopyFileTreeModal.vue'
import ArchiveModal from '../pan/topbtns/ArchiveModal.vue'
import ArchivePasswordModal from '../pan/topbtns/ArchivePasswordModal.vue'
import AlphaModal from '../pan/topbtns/AlphaModal.vue'
import UploadModal from '../pan/topbtns/UploadModal.vue'
import DownloadModal from '../pan/topbtns/DownloadModal.vue'

export default defineComponent({
  components: {
    UserSpaceModal,
    CreatNewFileModal,
    RenameModal,
    RenameMultiModal,
    CreatNewDirModal,
    DaoRuShareLinkModal,
    EditShareLinkModal,
    DaoRuShareLinkMultiModal,
    ShowShareLinkModal,
    SelectPanDirModal,
    CreatNewShareLinkModal,
    ShuXingModal,
    ShuXingMultiModal,
    SearchPanModal,
    DLNAPlayerModal,
    M3U8DownloadModal,
    AlphaModal,
    CopyFileTreeModal,
    ArchiveModal,
    ArchivePasswordModal,
    UploadModal,
    DownloadModal
  },
  setup() {
    const modalStore = useModalStore()
    return { modalStore }
  }
})
</script>

<template>
  <AlphaModal />

  <UserSpaceModal :visible="modalStore.modalName == 'userspace'" />
  <CreatNewFileModal :visible="modalStore.modalName == 'creatfile'" />
  <CreatNewDirModal :visible="modalStore.modalName == 'creatdir'" :dirtype="modalStore.modalData.dirtype || ''" :parentdirid="modalStore.modalData.parentdirid || ''" :callback="modalStore.modalData.callback" />
  <CreatNewShareLinkModal :visible="modalStore.modalName == 'creatshare'" :sharetype="modalStore.modalData.sharetype || ''" :filelist="modalStore.modalData.filelist || []" />

  <DaoRuShareLinkModal :visible="modalStore.modalName == 'daorushare'" />
  <DaoRuShareLinkMultiModal :visible="modalStore.modalName == 'daorusharemulti'" />

  <RenameModal :visible="modalStore.modalName == 'rename'" :istree="modalStore.modalData.istree || false" />
  <RenameMultiModal :visible="modalStore.modalName == 'renamemulti'" :istree="modalStore.modalData.istree || false" />
  <ShuXingModal :visible="modalStore.modalName == 'shuxing'" :istree="modalStore.modalData.istree || false" />
  <ShuXingMultiModal :visible="modalStore.modalName == 'shuxingmulti'" :istree="modalStore.modalData.istree || false" />
  <SearchPanModal :visible="modalStore.modalName == 'searchpan'" />

  <DLNAPlayerModal :visible="modalStore.modalName == 'dlna'" />
  <M3U8DownloadModal :visible="modalStore.modalName == 'm3u8download'" />
  <CopyFileTreeModal :visible="modalStore.modalName == 'copyfiletree'" :filelist="modalStore.modalData.filelist || []" />
  <ArchiveModal
    :visible="modalStore.modalName == 'archive'"
    :user_id="modalStore.modalData.user_id || ''"
    :drive_id="modalStore.modalData.drive_id || ''"
    :file_id="modalStore.modalData.file_id || ''"
    :file_name="modalStore.modalData.file_name || ''"
    :parent_file_id="modalStore.modalData.parent_file_id || ''"
    :password="modalStore.modalData.password || ''" />
  <ArchivePasswordModal
    :visible="modalStore.modalName == 'archivepassword'"
    :user_id="modalStore.modalData.user_id || ''"
    :drive_id="modalStore.modalData.drive_id || ''"
    :file_id="modalStore.modalData.file_id || ''"
    :file_name="modalStore.modalData.file_name || ''"
    :parent_file_id="modalStore.modalData.parent_file_id || ''"
    :password="modalStore.modalData.password || ''"
    :domain_id="modalStore.modalData.domain_id || ''"
    :ext="modalStore.modalData.ext || ''" />

  <EditShareLinkModal :visible="modalStore.modalName == 'editshare'" :sharelist="modalStore.modalData.sharelist || []" />
  <ShowShareLinkModal
    :visible="modalStore.modalName == 'showshare'"
    :share_id="modalStore.modalData.share_id || ''"
    :share_pwd="modalStore.modalData.share_pwd || ''"
    :share_token="modalStore.modalData.share_token || ''"
    :withsave="modalStore.modalData.withsave || false"
    :file_id_list="modalStore.modalData.file_id_list || []" />

  <UploadModal :visible="modalStore.modalName == 'upload'" :file_id="modalStore.modalData.file_id || ''" :filelist="modalStore.modalData.filelist || []" />
  <DownloadModal :visible="modalStore.modalName == 'download'" :istree="modalStore.modalData.istree || false" />

  <SelectPanDirModal :visible="modalStore.modalName == 'selectpandir'" :selecttype="modalStore.modalData.selecttype || ''" :selectid="modalStore.modalData.selectid || ''" :callback="modalStore.modalData.callback" />
</template>
<style>
.modalclass .arco-modal-body {
  padding: 24px 16px 16px 16px;
}

.modaltitle .titletips {
  padding: 0 4px;
  font-size: 14px;
  line-height: 25px;
  color: rgb(var(--primary-6));
}
.modaltitle .onerowtitle {
  font-size: 16px;
  line-height: 25px;
  flex-grow: 1;
  white-space: nowrap;
  word-break: keep-all;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 32px;
}

.modalfoot {
  display: flex;
  align-items: center;
}
.modalfoot .tips {
  font-size: 14px;
  line-height: 25px;
  color: var(--color-text-2);
}

.modalfoot button:not(:last-of-type) {
  margin-right: 12px;
}

.modalbody .arco-form-item-label-col {
  padding-right: 4px;
}
</style>
