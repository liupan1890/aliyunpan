const FootMap = new Map<string, string>()

export function FootLoading(msg: string, key: string) {
  console.log('FootLoading', key, msg)

  if (msg != '') FootMap.set(key, msg)
  else FootMap.delete(key)

  let info = ''
  FootMap.forEach(function (value, key) {
    const item = '<span style="margin-right:8px">' + value + '</span>'
    if (info.includes(item) == false) info += item
  })

  const doc = document.getElementById('footLoading')
  if (doc) {
    if (!info) {
      doc.innerHTML = ''
    } else {
      doc.innerHTML =
        '<div class="arco-spin"><div class="arco-spin-icon"><svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" class="arco-icon arco-icon-loading arco-icon-spin" stroke-width="4" stroke-linecap="butt" stroke-linejoin="miter"><path d="M42 24c0 9.941-8.059 18-18 18S6 33.941 6 24 14.059 6 24 6"></path></svg></div></div>' +
        info
    }
  }
}
