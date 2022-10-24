import { defineStore } from 'pinia'

export interface KeyboardMessage {
  
  Code: string
  
  Key: string
  Ctrl: boolean
  Shift: boolean
  
  Alt: boolean
  
  Repeat: boolean
  
  IsInput: boolean
  IsEnmpty: boolean
}

export interface KeyboardState {
  KeyDownEvent: KeyboardMessage
  KeyUpEvent: KeyboardMessage
}

const useKeyboardStore = defineStore('keyboard', {
  state: (): KeyboardState => ({
    KeyDownEvent: { Ctrl: false, Shift: false, Alt: false, Repeat: false, IsInput: false, Code: '', Key: '', IsEnmpty: true } as KeyboardMessage,
    KeyUpEvent: { Ctrl: false, Shift: false, Alt: false, Repeat: false, IsInput: false, Code: '', Key: '', IsEnmpty: true } as KeyboardMessage
  }),

  getters: {},

  actions: {
    updateStore(partial: Partial<KeyboardState>) {
      this.$patch(partial)
    },
    KeyDown(event: KeyboardEvent) {
      console.log(event)
      this.KeyDownEvent = { Ctrl: event.ctrlKey, Shift: event.shiftKey, Alt: event.altKey, Repeat: event.repeat, IsInput: false, Code: event.code, Key: event.key.toLowerCase(), IsEnmpty: false }
    }
  }
})

export default useKeyboardStore
