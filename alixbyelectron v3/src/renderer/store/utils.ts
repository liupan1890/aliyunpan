export function ArrayCopyReverse(arr: any[]) {
  let copy: any[] = []
  for (let i = arr.length - 1; i >= 0; i--) {
    copy.push(arr[i])
  }
  return copy
}
export function ArrayCopy(arr: any[]) {
  let copy: any[] = []
  for (let i = 0, maxi = arr.length; i < maxi; i++) {
    copy.push(arr[i])
  }
  return copy
}
