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
    ArchivePasswordModal
  },
  setup() {
    const modalStore = useModalStore()
    return { modalStore }
  }
})
</script>

<template>
  <AlphaModal />

  <UserSpaceModal :visible="modalStore.modalname == 'userspace'" />
  <CreatNewFileModal :visible="modalStore.modalname == 'creatfile'" />
  <CreatNewDirModal :visible="modalStore.modalname == 'creatdir'" :dirtype="modalStore.modaldata.dirtype || ''" :parentdirid="modalStore.modaldata.parentdirid || ''" :callback="modalStore.modaldata.callback" />
  <CreatNewShareLinkModal :visible="modalStore.modalname == 'creatshare'" :sharetype="modalStore.modaldata.sharetype || ''" :filelist="modalStore.modaldata.filelist || []" />

  <DaoRuShareLinkModal :visible="modalStore.modalname == 'daorushare'" />
  <DaoRuShareLinkMultiModal :visible="modalStore.modalname == 'daorusharemulti'" />

  <RenameModal :visible="modalStore.modalname == 'rename'" :istree="modalStore.modaldata.istree || false" />
  <RenameMultiModal :visible="modalStore.modalname == 'renamemulti'" :istree="modalStore.modaldata.istree || false" />
  <ShuXingModal :visible="modalStore.modalname == 'shuxing'" :istree="modalStore.modaldata.istree || false" />
  <ShuXingMultiModal :visible="modalStore.modalname == 'shuxingmulti'" :istree="modalStore.modaldata.istree || false" />
  <SearchPanModal :visible="modalStore.modalname == 'searchpan'" />

  <DLNAPlayerModal :visible="modalStore.modalname == 'dlna'" />
  <M3U8DownloadModal :visible="modalStore.modalname == 'm3u8download'" />
  <CopyFileTreeModal :visible="modalStore.modalname == 'copyfiletree'" :filelist="modalStore.modaldata.filelist || []" />
  <ArchiveModal
    :visible="modalStore.modalname == 'archive'"
    :user_id="modalStore.modaldata.user_id || ''"
    :drive_id="modalStore.modaldata.drive_id || ''"
    :file_id="modalStore.modaldata.file_id || ''"
    :file_name="modalStore.modaldata.file_name || ''"
    :parent_file_id="modalStore.modaldata.parent_file_id || ''"
    :password="modalStore.modaldata.password || ''"
  />
  <ArchivePasswordModal
    :visible="modalStore.modalname == 'archivepassword'"
    :user_id="modalStore.modaldata.user_id || ''"
    :drive_id="modalStore.modaldata.drive_id || ''"
    :file_id="modalStore.modaldata.file_id || ''"
    :file_name="modalStore.modaldata.file_name || ''"
    :parent_file_id="modalStore.modaldata.parent_file_id || ''"
    :password="modalStore.modaldata.password || ''"
    :domain_id="modalStore.modaldata.domain_id || ''"
    :ext="modalStore.modaldata.ext || ''"
  />

  <EditShareLinkModal :visible="modalStore.modalname == 'editshare'" :sharelist="modalStore.modaldata.sharelist || []" />
  <ShowShareLinkModal
    :visible="modalStore.modalname == 'showshare'"
    :share_id="modalStore.modaldata.share_id || ''"
    :share_pwd="modalStore.modaldata.share_pwd || ''"
    :share_token="modalStore.modaldata.share_token || ''"
    :withsave="modalStore.modaldata.withsave || false"
    :file_id_list="modalStore.modaldata.file_id_list || []"
  />
  <SelectPanDirModal :visible="modalStore.modalname == 'selectpandir'" :selecttype="modalStore.modaldata.selecttype || ''" :selectid="modalStore.modaldata.selectid || ''" :callback="modalStore.modaldata.callback" />
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
