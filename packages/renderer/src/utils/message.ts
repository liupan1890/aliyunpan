import { Message } from '@arco-design/web-vue'
export default class message {
  static info(msg: string, duration: number = 3, key: string = '') {
    if (!key && duration > 0 && msg) key = msg
    if (key) return Message.info({ id: key, content: msg, position: 'bottom', duration: duration * 1000 })
    return Message.info({ content: msg, position: 'bottom', duration: duration * 1000 })
  }
  static error(msg: string, duration: number = 3, key: string = '') {
    if (!key && duration > 0 && msg) key = msg
    if (key) return Message.error({ id: key, content: msg, position: 'bottom', duration: duration * 1000 })
    return Message.error({ content: msg, position: 'bottom', duration: duration * 1000 })
  }

  static success(msg: string, duration: number = 3, key: string = '') {
    if (!key && duration > 0 && msg) key = msg
    if (key) return Message.success({ id: key, content: msg, position: 'bottom', duration: duration * 1000 })
    return Message.success({ content: msg, position: 'bottom', duration: duration * 1000 })
  }

  static warning(msg: string, duration: number = 3, key: string = '') {
    if (!key && duration > 0 && msg) key = msg
    if (key) return Message.warning({ id: key, content: msg, position: 'bottom', duration: duration * 1000 })
    return Message.warning({ content: msg, position: 'bottom', duration: duration * 1000 })
  }

  static loading(msg: string, duration: number = 3, key: string = '') {
    if (!key && duration > 0 && msg) key = msg
    if (key) return Message.loading({ id: key, content: msg, position: 'bottom', duration: duration * 1000 })
    return Message.loading({ content: msg, position: 'bottom', duration: duration * 1000 })
  }
}
