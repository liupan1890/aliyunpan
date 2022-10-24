import message from '../utils/message'


export async function RunBatch(title: string, list: any[], max: number, func: (t: any) => Promise<void | any>) {
  const loadingKey = 'runbatch' + Date.now().toString() + '_' + title
  if (title) message.success('正在执行' + title + '( 0 / ' + list.length + ' )', 0, loadingKey)
  let parr: Promise<any>[] = []
  for (let i = 0, maxi = list.length; i < maxi; i++) {
    parr.push(func(list[i]))
    if (parr.length == max) {
      await Promise.all(parr)
        .catch(() => {})
        .then(() => {
          parr = []
        })
      if (title) message.success('正在执行' + title + '( ' + i + ' / ' + maxi + ' )', 0, loadingKey)
    }
  }
  if (parr.length > 0)
    await Promise.all(parr)
      .catch(() => {})
      .then(() => {
        parr = []
      })

  if (title) message.success('成功执行' + title, 1, loadingKey)
}
