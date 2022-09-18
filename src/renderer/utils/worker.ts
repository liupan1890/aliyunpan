export async function WorkerUploadFiles(ingoredList: string[], user_id: string, drive_id: string, parentid: string, files: string[]) {
  let worker: any
  let result: any = null
  await new Promise<void>((resolve) => {
    worker = new Worker('uploadfilesworker.js')
    worker.addEventListener('message', (event: any) => {
      if (event.data.state == 'success') {
        console.log(event)
        result = event.data.result
        resolve()
      }
    })
    worker.addEventListener('error', function (event: any) {
      resolve()
    })
    worker.postMessage({ ingoredList, user_id, drive_id, parentid, files })
  })
    .catch(() => {})
    .then(() => {
      if (worker) worker.terminate()
    })
  return result
}
