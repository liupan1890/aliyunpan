import { defineStore } from 'pinia'
import { nextTick } from 'vue'

export interface ModalState {
  modalname: string
  modaldata: any
}

const useModalStore = defineStore('modal', {
  state: (): ModalState => ({
    modalname: '',
    modaldata: {}
  }),

  actions: {
    showModal(modalname: string, modaldata: any) {
      if (modalname && modalname == this.modalname) {
        
        this.$patch({ modalname: '', modaldata: {} })
        setTimeout(() => {
          this.$patch({ modalname, modaldata })
        }, 300)
      } else this.$patch({ modalname, modaldata })
    }
  }
})

export default useModalStore
