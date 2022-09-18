
export function debounce(func: Function, wait: number, immediate: boolean = true, lastcall: boolean = true, leakcall: boolean = false) {
  if (lastcall !== false) lastcall = true
  if (immediate !== false) immediate = true
  var previous = 0
  var timer: any = null
  return function (...args: any) {
    // @ts-ignore
    var context = this
    var now = Date.now()

    var timeoutToCall = function timeoutToCall() {
      if (!leakcall && timer) {
        clearTimeout(timer)
        timer = null
      }

      if (!timer) {
        timer = setTimeout(function () {
          timer = null
          func.apply(context, args)
        }, wait)
      }
    }

    if (now - previous > wait) {
      previous = now

      if (immediate) {
        func.apply(context, args)
      } else if (lastcall) {
        timeoutToCall()
      }
    } else {
      previous = now
      if (lastcall) timeoutToCall()
    }
  }
}


export function throttle(func: Function, wait: number, immediate: boolean = true, lastcall: boolean = true) {
  return debounce(func, wait, immediate, lastcall, true)
}
