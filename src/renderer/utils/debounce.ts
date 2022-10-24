import message from './message'


export function debounce(func: Function, wait: number, immediate: boolean = true, lastCall: boolean = true, leakCall: boolean = false) {
  if (lastCall !== false) lastCall = true
  if (immediate !== false) immediate = true
  let previous = 0
  let timer: any
  return function (...args: any) {
    // @ts-ignore
    const context = this
    const now = Date.now()

    const timeoutToCall = function timeoutToCall() {
      if (!leakCall && timer) {
        clearTimeout(timer)
        timer = undefined
      }

      if (!timer) {
        timer = setTimeout(function () {
          timer = undefined
          func.apply(context, args)
        }, wait)
      }
    }

    if (now - previous > wait) {
      previous = now

      if (immediate) {
        func.apply(context, args)
      } else if (lastCall) {
        timeoutToCall()
      }
    } else {
      previous = now
      if (lastCall) timeoutToCall()
    }
  }
}


export function throttle(func: Function, wait: number, immediate: boolean = true, lastCall: boolean = true) {
  return debounce(func, wait, immediate, lastCall, true)
}

const clkcimap = new Set<string>()

export function clickWait(cmdkey: string, wait: number = -1): boolean {
  if (clkcimap.has(cmdkey)) {
    message.info('上一个操作还在执行中，稍等1秒再点')
    return true
  }
  clkcimap.add(cmdkey)
  if (wait > 0) {
    setTimeout(() => {
      clkcimap.delete(cmdkey)
    }, wait)
  }
  return false
}

export function clickWaitDelete(cmdkey: string): void {
  clkcimap.delete(cmdkey)
}
