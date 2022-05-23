export interface IID {
  id: string
  pwd: string
}

/**解析分享链接(批量)
 * 链接：https://www.aliyundrive.com/s/BULJVH9ShDe  提取码：XFwH
 */
export function ParseShareIDList(txt: string): IID[] {
  txt = txt.replaceAll('密码', '提取码').replaceAll('password', '提取码').replaceAll('pwd', '提取码').replaceAll('PWD', '提取码')
  txt = txt.replaceAll('\n提取码', '提取码')
  let list: IID[] = []
  txt.split('\n').map((t) => {
    let p = GetShareID(t)
    if (p.id) list.push(p)
  })
  return list
}
/**解析分享链接(一条)
 * 链接：https://www.aliyundrive.com/s/BULJVH9ShDe  提取码：XFwH
 */
export function ParseShareIDOne(txt: string): IID {
  txt = txt.replaceAll('密码', '提取码').replaceAll('password', '提取码').replaceAll('pwd', '提取码').replaceAll('PWD', '提取码')
  txt = txt.replaceAll('\n提取码', '提取码')
  return GetShareID(txt)
}

/**解析分享链接
 * 链接：https://www.aliyundrive.com/s/BULJVH9ShDe  提取码：XFwH
 * 链接：https://www.aliyundrive.com/s/BULJVH9ShDe  密码：XFwH
 * 链接：https://www.aliyundrive.com/s/BULJVH9ShDe  pwd：XFwH
 */
function GetShareID(txt: string): IID {
  const ret = { id: '', pwd: '' }
  let id = txt.match(/(?<=\/s\/)[0-9a-zA-Z]{11,12}/)
  if (id && id.length > 0) ret.id = id[0]
  let pwd = txt.match(/(?<=提取码[^0-9a-zA-Z]{0,6})[0-9a-zA-Z]{4}/)
  if (pwd && pwd.length > 0) ret.pwd = pwd[0]
  return ret
}
