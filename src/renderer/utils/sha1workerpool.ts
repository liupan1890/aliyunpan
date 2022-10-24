const MAXSIZE = Math.max(2, navigator.hardwareConcurrency - 1)

export interface Sha1Model {
  hash: string
  localFilePath: string
  access_token: string
}

export default class Sha1WorkerPool {
  queueWithCallback: [args: any, callback: (result: any, worker: Worker) => void, error: (err: any, worker: Worker) => void][] = []
  freeWorkers: Worker[] = []
  workers: Set<Worker> = new Set() 

  public Init() {
    if (this.workers.size > 0) return

    for (let i = 0; i < MAXSIZE; i++) {
      const worker = new Worker('./sha1filework.js')
      this.freeWorkers.push(worker)
      this.workers.add(worker)
    }
  }


  public StartWithCallback(args: Sha1Model, callback: (result: any, worker: Worker) => void, error: (err: any, worker: Worker) => void) {
    this.Init()
    if (this.freeWorkers.length > 0) {
      const worker = this.freeWorkers.pop()!
      worker.onmessage = (e: any) => {
        callback(e.data, worker)
      }
      worker.onerror = (e: any) => {
        error(e, worker)
      }
      worker.postMessage(args)
    } else {
      this.queueWithCallback.push([args, callback, error])
    }
  }

  public FinishWithCallback(worker: Worker) {
    worker.onmessage = null
    worker.onerror = null
    this.freeWorkers.push(worker)
    if (this.queueWithCallback.length > 0) {
      const item = this.queueWithCallback.shift()!
      this.StartWithCallback(item[0], item[1], item[2])
    }
  }
}
