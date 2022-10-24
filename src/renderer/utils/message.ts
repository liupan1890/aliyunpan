import { Message } from '@arco-design/web-vue'
import { h } from 'vue'

const MessageMap = new Map<string, number>()
function getCount(msg: string) {
  let count = MessageMap.get(msg) || 0
  count++
  MessageMap.set(msg, count)
  return count
}
export default class message {
  static info(msg: string, duration: number = 3, key: string = '') {
    const count = getCount(key || msg)
    return Message.info({
      id: key || msg,
      content: count > 1 ? () => h('div', { innerHTML: msg + '<span class="messagebadge"><span>' + count + '</span></span>' }) : msg,
      position: 'bottom',
      duration: duration * 1000,
      onClose: (id) => MessageMap.delete(key || msg)
    })
  }

  static error(msg: string, duration: number = 3, key: string = '') {
    const count = getCount(key || msg)
    return Message.error({
      id: key || msg,
      content: count > 1 ? () => h('div', { innerHTML: msg + '<span class="messagebadge"><span>' + count + '</span></span>' }) : msg,
      position: 'bottom',
      duration: duration * 1000,
      onClose: (id) => MessageMap.delete(key || msg)
    })
  }

  static success(msg: string, duration: number = 3, key: string = '') {
    const count = getCount(key || msg)
    return Message.success({
      id: key || msg,
      content: count > 1 ? () => h('div', { innerHTML: msg + '<span class="messagebadge"><span>' + count + '</span></span>' }) : msg,
      position: 'bottom',
      duration: duration == 0 ? 1 : duration * 1000,
      onClose: (id) => MessageMap.delete(key || msg)
    })
  }

  static warning(msg: string, duration: number = 3, key: string = '') {
    const count = getCount(key || msg)
    return Message.warning({
      id: key || msg,
      content: count > 1 ? () => h('div', { innerHTML: msg + '<span class="messagebadge"><span>' + count + '</span></span>' }) : msg,
      position: 'bottom',
      duration: duration * 1000,
      onClose: (id) => MessageMap.delete(key || msg)
    })
  }

  static loading(msg: string, duration: number = 3, key: string = '') {
    const count = 0 
    return Message.loading({
      id: key || msg,
      content: count > 1 ? () => h('div', { innerHTML: msg + '<span class="messagebadge"><span>' + count + '</span></span>' }) : msg,
      position: 'bottom',
      duration: duration * 1000
    })
  }
}
