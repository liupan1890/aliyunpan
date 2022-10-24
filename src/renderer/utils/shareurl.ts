import { useSettingStore } from '../store'

export function GetShareUrlFormate(share_name: string, share_url: string, share_pwd: string): string {
  let Formate = useSettingStore().uiShareFormate.replaceAll('\\n', '\n')
  const s1 = Formate.indexOf('URL')
  if (!share_pwd) {
    
    const s2 = Formate.indexOf('PWD')
    if (s1 >= 0 && s2 > s1) Formate = Formate.substring(0, s1 + 3) + Formate.substring(s2 + 3)
    console.log(Formate)
  }
  const url = Formate.replace('URL', share_url).replace('PWD', share_pwd).replace('NAME', share_name)
  if (url && s1 >= 0) return url
  return share_name + ' ' + share_url + (share_pwd ? ' 提取码：' + share_pwd : '')
}

export interface IID {
  id: string
  pwd: string
}


export function ParseShareIDList(txt: string): IID[] {
  txt = txt.replaceAll('密码', '提取码').replaceAll('password', '提取码').replaceAll('pwd', '提取码').replaceAll('PWD', '提取码')
  txt = txt.replaceAll('\n提取码', '提取码')
  const list: IID[] = []
  txt.split('\n').map((t) => {
    const p = GetShareID(t)
    if (p.id) list.push(p)
    return true
  })
  return list
}

export function ParseShareIDOne(txt: string): IID {
  txt = txt.replaceAll('密码', '提取码').replaceAll('password', '提取码').replaceAll('pwd', '提取码').replaceAll('PWD', '提取码')
  txt = txt.replaceAll('\n提取码', '提取码')
  return GetShareID(txt)
}


function GetShareID(txt: string): IID {
  const ret = { id: '', pwd: '' }
  const id = txt.match(/(?<=\/s\/)[0-9a-zA-Z]{11,12}/)
  if (id && id.length > 0) ret.id = id[0]
  const pwd = txt.match(/(?<=提取码[^0-9a-zA-Z]{0,6})[0-9a-zA-Z]{4}/)
  if (pwd && pwd.length > 0) ret.pwd = pwd[0]
  return ret
}
