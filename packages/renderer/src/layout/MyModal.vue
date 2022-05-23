<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useModalStore } from '@/store'
import CreatNewFileModal from '../pan/topbtns/CreatNewFileModal.vue'
import RenameModal from '../pan/topbtns/RenameModal.vue'
import RenameMultiModal from '@/pan/topbtns/RenameMultiModal.vue'
import CreatNewDirModal from '@/pan/topbtns/CreatNewDirModal.vue'
import DaoRuShareLinkModal from '@/pan/topbtns/DaoRuShareLinkModal.vue'
import EditShareLinkModal from '../share/share/EditShareLinkModal.vue'
import DaoRuShareLinkMultiModal from '@/pan/topbtns/DaoRuShareLinkMultiModal.vue'
import ShowShareLinkModal from '@/share/share/ShowShareLinkModal.vue'
import SelectPanDirModal from '@/pan/topbtns/SelectPanDirModal.vue'
import CreatNewShareLinkModal from '@/pan/topbtns/CreatNewShareLinkModal.vue'
import ShuXingModal from '@/pan/topbtns/ShuXingModal.vue'
import ShuXingMultiModal from '../pan/topbtns/ShuXingMultiModal.vue'
import SearchPanModal from '@/pan/topbtns/SearchPanModal.vue'
import DLNAPlayerModal from '@/pan/topbtns/DLNAPlayerModal.vue'
import M3U8DownloadModal from '@/pan/topbtns/M3U8DownloadModal.vue'
import AlphaModal from '@/pan/topbtns/AlphaModal.vue'

export default defineComponent({
  components: {
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
    AlphaModal
  },
  setup() {
    const modalStore = useModalStore()
    return { modalStore }
  }
})
</script>

<template>
  <AlphaModal />

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

  <EditShareLinkModal :visible="modalStore.modalname == 'editshare'" :sharelist="modalStore.modaldata.sharelist || []" />
  <ShowShareLinkModal
    :visible="modalStore.modalname == 'showshare'"
    :share_id="modalStore.modaldata.share_id || ''"
    :share_pwd="modalStore.modaldata.share_pwd || ''"
    :share_token="modalStore.modaldata.share_token || ''"
    :withsave="modalStore.modaldata.withsave || false"
    :file_id_list="modalStore.modaldata.file_id_list || []"
  />
  <SelectPanDirModal :visible="modalStore.modalname == 'selectpandir'" :selecttype="modalStore.modaldata.selecttype || ''" :callback="modalStore.modaldata.callback" />
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

.modalfoot {
  display: flex;
}
.modalfoot button:not(:last-of-type) {
  margin-right: 12px;
}

.modalbody .arco-form-item-label-col {
  padding-right: 4px;
}
</style>
