import { defineStore } from 'pinia'
import { onHideRightMenuScroll } from '../utils/keyboardhelper'

export interface ModalState {
  modalName: string
  modalData: any
}

const useModalStore = defineStore('modal', {
  state: (): ModalState => ({
    modalName: '',
    modalData: {}
  }),

  actions: {
    showModal(modalName: string, modalData: any) {
      if (modalName) onHideRightMenuScroll()
      if (modalName && modalName == this.modalName) {
        
        this.$patch({ modalName: '', modalData: {} })
        setTimeout(() => {
          this.$patch({ modalName, modalData })
        }, 300)
      } else this.$patch({ modalName, modalData })
    }
  }
})

export default useModalStore
