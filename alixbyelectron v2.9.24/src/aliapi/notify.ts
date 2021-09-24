import { Notify } from 'quasar';

export function NotifyError(msg: string) {
  return Notify.create({
    icon: 'iconfont iconinfo_circle',
    type: 'negative',
    message: msg,
  });
}

export function NotifySuccess(msg: string) {
  return Notify.create({
    icon: 'iconfont iconcheck',
    type: 'positive',
    message: msg,
  });
}

export function NotifyInfo(msg: string) {
  return Notify.create({
    icon: 'iconfont iconinfo_circle',
    type: 'negative',
    color: 'grey-8',
    message: msg,
  });
}
export function NotifyWarning(msg: string) {
  return Notify.create({
    icon: 'iconfont iconinfo_circle',
    type: 'warning',
    message: msg,
  });
}
