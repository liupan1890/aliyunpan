import { useSettingStore } from '../store'

export function GetShareUrlFormate(share_name: string, share_url: string, share_pwd: string) {
  let Formate = useSettingStore().uiShareFormate.replaceAll('\\n', '\n')
  let s1 = Formate.indexOf('URL')
  if (!share_pwd) {
    
    let s2 = Formate.indexOf('PWD')
    if (s1 >= 0 && s2 > s1) Formate = Formate.substring(0, s1 + 3) + Formate.substring(s2 + 3)
    console.log(Formate)
  }
  let url = Formate.replace('URL', share_url).replace('PWD', share_pwd).replace('NAME', share_name)
  if (url && s1 >= 0) return url
  return share_name + ' ' + share_url + (share_pwd ? ' 提取码：' + share_pwd : '')
}
