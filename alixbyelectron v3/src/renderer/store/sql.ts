import SettingLog from '@/setting/settinglog'
import { IStateDownFile,  IStateUploadFile } from './models'


function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time))
}

const isdebugsql = false
export class SQLDatabase {
  private db: any = null
  private isopening = false
  constructor() {}

  public async init() {
    while (true) {
      if (this.db) return 'success'
      if (this.isopening) {
        console.log('db sleep22')
        await sleep(1000)
      } else {
        this.isopening = true
        try {
          console.log('db open')
          const db2 = window.openDatabase('xbyv2', '1.0', '', 10 * 1024 * 1024)
          if (db2) {
            this.db = db2
            this.db.transaction(
              function (tx: any) {
                tx.executeSql(`CREATE TABLE IF NOT EXISTS DirSizeCache (
          userdriveid INTEGER  NOT NULL,
          file_id TEXT  NOT NULL,          
          parent_file_id TEXT  NOT NULL,          
          logtime INTEGER  NOT NULL,
          size INTEGER  NOT NULL,
          filecount INTEGER  NOT NULL,
          dircount INTEGER  NOT NULL,
          PRIMARY KEY (userdriveid,file_id) )`)
                tx.executeSql('CREATE INDEX IF NOT EXISTS idx_DirSizeCache_Parent ON DirSizeCache ( userdriveid,parent_file_id )')
                tx.executeSql(`CREATE TABLE IF NOT EXISTS Downing (
          DownID TEXT PRIMARY KEY NOT NULL,
          GID TEXT  NOT NULL,
          userid TEXT NOT NULL,
          DownSavePath TEXT  NOT NULL,  
          ariaRemote INTEGER  NOT NULL,  
          file_id TEXT  NOT NULL,  
          drive_id TEXT  NOT NULL,  
          name TEXT  NOT NULL,  
          size INTEGER  NOT NULL,  
          sizestr TEXT  NOT NULL,  
          icon TEXT  NOT NULL,  
          isDir INTEGER  NOT NULL,  
          sha1 TEXT  NOT NULL,  
          crc64 TEXT  NOT NULL,  
          DownTime INTEGER  NOT NULL,  
          DownSize INTEGER  NOT NULL,  
          DownProcess INTEGER  NOT NULL,  
          DownUrl TEXT  NOT NULL         
          )`)

                tx.executeSql(`CREATE TABLE IF NOT EXISTS Downed (
          DownID TEXT PRIMARY KEY NOT NULL,
          userid TEXT NOT NULL,
          DownSavePath TEXT  NOT NULL,  
          ariaRemote INTEGER  NOT NULL,  
          file_id TEXT  NOT NULL,  
          drive_id TEXT  NOT NULL,  
          name TEXT  NOT NULL,  
          size INTEGER  NOT NULL,  
          sizestr TEXT  NOT NULL,  
          icon TEXT  NOT NULL,  
          isDir INTEGER  NOT NULL,  
          sha1 TEXT  NOT NULL,  
          crc64 TEXT  NOT NULL,  
          DownTime INTEGER  NOT NULL     
          )`)

                tx.executeSql(`CREATE TABLE IF NOT EXISTS Uploading (
          UploadID TEXT PRIMARY KEY NOT NULL,
          userid TEXT NOT NULL,
          localFilePath TEXT  NOT NULL,  
          parent_id TEXT  NOT NULL,  
          drive_id TEXT  NOT NULL,  
          path TEXT  NOT NULL,  
          name TEXT  NOT NULL,  
          size INTEGER  NOT NULL,  
          sizestr TEXT  NOT NULL,  
          icon TEXT  NOT NULL,  
          isDir INTEGER  NOT NULL,  
          isMiaoChuan INTEGER  NOT NULL,  
          sha1 TEXT  NOT NULL,  
          crc64 TEXT  NOT NULL,  
          DownTime INTEGER  NOT NULL,  
          DownSize INTEGER  NOT NULL,  
          DownProcess INTEGER  NOT NULL,  
          upload_id TEXT  NOT NULL,         
          file_id TEXT  NOT NULL         
          )`)

                tx.executeSql(`CREATE TABLE IF NOT EXISTS Uploaded (
          UploadID TEXT PRIMARY KEY NOT NULL,
          userid TEXT NOT NULL,
          localFilePath TEXT  NOT NULL,  
          parent_id TEXT  NOT NULL,  
          drive_id TEXT  NOT NULL,  
          path TEXT  NOT NULL,  
          name TEXT  NOT NULL,  
          size INTEGER  NOT NULL,  
          sizestr TEXT  NOT NULL,  
          icon TEXT  NOT NULL,  
          isDir INTEGER  NOT NULL,  
          isMiaoChuan INTEGER  NOT NULL,  
          sha1 TEXT  NOT NULL,  
          crc64 TEXT  NOT NULL,  
          DownTime INTEGER  NOT NULL
          )`)
              },
              function (error: any) {
                SettingLog.mSaveLog('danger', 'sqlerror:' + error.message)
              }
            )
            this.isopening = false
            console.log('db success')

            return 'success'
          } else return 'dberror'
        } catch {
          console.log('db sleep')
          this.isopening = false
          await sleep(1000)
        }
      }
    }
  }

  public async OldSaveDownings(downlist: IStateDownFile[]) {
    if (!downlist || downlist.length == 0) return 'success'
    if (!this.db) await this.init().catch(() => {})
    return await new Promise<string>((resolve) => {
      this.db.transaction(
        function (tx: any) {
          for (let i = 0, maxi = downlist.length; i < maxi; i++) {
            const item = downlist[i]
            tx.executeSql('INSERT OR REPLACE INTO Downing values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [
              item.DownID,
              item.Info.GID,
              item.Info.user_id,
              item.Info.DownSavePath,
              item.Info.ariaRemote,
              item.Info.file_id,
              item.Info.drive_id,
              item.Info.name,
              item.Info.size,
              item.Info.sizestr,
              item.Info.icon,
              item.Info.isDir,
              item.Info.sha1,
              item.Info.crc64,
              item.Down.DownTime,
              item.Down.DownSize,
              item.Down.DownProcess,
              ''
            ])
          }
        },
        function (error: any) {
          SettingLog.mSaveLog('danger', 'sqlerror:' + error.message)
          resolve('error')
        },
        function () {
          resolve('success')
        }
      )
    })
  }

  public async OldSaveDowneds(downlist: IStateDownFile[]) {
    if (!downlist || downlist.length == 0) return 'success'
    if (!this.db) await this.init().catch(() => {})
    return await new Promise<string>((resolve) => {
      this.db.transaction(
        function (tx: any) {
          for (let i = 0, maxi = downlist.length; i < maxi; i++) {
            const item = downlist[i]
            tx.executeSql('INSERT OR REPLACE INTO Downed values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [
              item.DownID,
              '',
              item.Info.DownSavePath,
              item.Info.ariaRemote,
              '',
              '',
              item.Info.name,
              item.Info.size,
              item.Info.sizestr,
              item.Info.icon,
              item.Info.isDir,
              '',
              '',
              item.Down.DownTime
            ])
          }
        },
        function (error: any) {
          SettingLog.mSaveLog('danger', 'sqlerror:' + error.message)
          resolve('error')
        },
        function () {
          resolve('success')
        }
      )
    })
  }

  public async GetAllDowning() {
    if (!this.db) await this.init().catch(() => {})
    return await new Promise<Map<string, IStateDownFile>>((resolve) => {
      const downlist = new Map<string, IStateDownFile>()
      this.db.transaction(
        function (tx: any) {
          tx.executeSql(
            'select * from Downing order by DownTime asc',
            [],
            function (tx: any, results: any) {
              for (let i = 0, maxi = results.rows.length; i < maxi; i++) {
                const item = results.rows.item(i)
                const downing: IStateDownFile = {
                  DownID: item.DownID,
                  Info: {
                    GID: item.GID,
                    user_id: item.user_id,
                    DownSavePath: item.DownSavePath,
                    ariaRemote: item.ariaRemote === true || item.ariaRemote === 'true',
                    file_id: item.file_id,
                    drive_id: item.drive_id,
                    name: item.name,
                    size: item.size,
                    sizestr: item.sizestr,
                    icon: item.icon,
                    isDir: item.isDir === true || item.isDir === 'true',
                    sha1: item.sha1,
                    crc64: item.crc64
                  },
                  Down: {
                    DownState: '已暂停',
                    DownTime: item.DownTime,
                    DownSize: item.DownSize,
                    DownSpeed: 0,
                    DownSpeedStr: '',
                    DownProcess: item.DownProcess || 0,
                    IsStop: true,
                    IsDowning: false,
                    IsCompleted: false,
                    IsFailed: false,
                    FailedCode: 0,
                    FailedMessage: '',
                    AutoTry: 0,
                    DownUrl: item.DownUrl || ''
                  }
                }
                Object.freeze(downing.Info)
                downlist.set(downing.DownID, downing)
              }
              resolve(downlist)
            },
            null
          )
        },
        function (error: any) {
          SettingLog.mSaveLog('danger', 'sqlerror:' + error.message)
          resolve(downlist)
        }
      )
    })
  }

  public async GetAllDowned() {
    if (!this.db) await this.init().catch(() => {})
    return await new Promise<IStateDownFile[]>((resolve) => {
      this.db.transaction(
        function (tx: any) {
          tx.executeSql(
            'select * from Downed order by DownTime desc',
            [],
            function (tx: any, results: any) {
              const downlist: IStateDownFile[] = []
              for (let i = 0, maxi = results.rows.length; i < maxi; i++) {
                const item = results.rows.item(i)
                const downed: IStateDownFile = {
                  DownID: item.DownID,
                  Info: {
                    GID: '',
                    user_id: '',
                    DownSavePath: item.DownSavePath,
                    ariaRemote: item.ariaRemote === true || item.ariaRemote === 'true',
                    file_id: '',
                    drive_id: '',
                    name: item.name,
                    size: item.size,
                    sizestr: item.sizestr,
                    icon: item.icon,
                    isDir: item.isDir === true || item.isDir === 'true',
                    sha1: '',
                    crc64: ''
                  },
                  Down: {
                    DownState: '已完成',
                    DownTime: item.DownTime,
                    DownSize: item.size,
                    DownSpeed: 0,
                    DownSpeedStr: '',
                    DownProcess: 100,
                    IsStop: true,
                    IsDowning: false,
                    IsCompleted: true,
                    IsFailed: false,
                    FailedCode: 0,
                    FailedMessage: '',
                    AutoTry: 0,
                    DownUrl: ''
                  }
                }
                downlist.push(downed)
              }
              resolve(downlist)
            },
            null
          )
        },
        function (error: any) {
          SettingLog.mSaveLog('danger', 'sqlerror:' + error.message)
          resolve([])
        }
      )
    })
  }

  public async DeleteDowns(isDowned: boolean, down_ids: string[]) {
    if (!down_ids || down_ids.length == 0) return 'success'
    if (!this.db) await this.init().catch(() => {})
    return await new Promise<string>((resolve) => {
      this.db.transaction(
        function (tx: any) {
          let sql1 = 'delete from Downing where DownID in ('
          if (isDowned) sql1 = 'delete from Downed where DownID in ('
          for (let i = 0, maxi = down_ids.length; i < maxi; i++) {
            if (i > 0) {
              sql1 += ',"' + down_ids[i] + '"'
            } else {
              sql1 += '"' + down_ids[i] + '"'
            }
          }
          tx.executeSql(sql1 + ')', [])
        },
        function (error: any) {
          SettingLog.mSaveLog('danger', 'sqlerror:' + error.message)
          resolve('error')
        },
        function () {
          resolve('success')
        }
      )
    })
  }

  public async DeleteDownsAll(isDowned: boolean) {
    if (!this.db) await this.init().catch(() => {})
    return await new Promise<string>((resolve) => {
      this.db.transaction(
        function (tx: any) {
          if (isDowned) tx.executeSql('delete from Downed', [])
          else tx.executeSql('delete from Downing', [])
        },
        function (error: any) {
          SettingLog.mSaveLog('danger', 'sqlerror:' + error.message)
          resolve('error')
        },
        function () {
          resolve('success')
        }
      )
    })
  }

  public async MoveDowningToDowned(DownID: string, down: IStateDownFile) {
    if (!this.db) await this.init().catch(() => {})
    return await new Promise<string>((resolve) => {
      this.db.transaction(
        function (tx: any) {
          tx.executeSql('delete from Downing where DownID =?', [DownID])
          tx.executeSql('INSERT OR REPLACE INTO Downed values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [
            down.DownID,
            '',
            down.Info.DownSavePath,
            down.Info.ariaRemote,
            '',
            '',
            down.Info.name,
            down.Info.size,
            down.Info.sizestr,
            down.Info.icon,
            down.Info.isDir,
            '',
            '',
            down.Down.DownTime
          ])
        },
        function (error: any) {
          SettingLog.mSaveLog('danger', 'sqlerror:' + error.message)
          resolve('error')
        },
        function () {
          resolve('success')
        }
      )
    })
  }

  public async OldSaveUploadings(uploadlist: IStateUploadFile[]) {
    if (!uploadlist || uploadlist.length == 0) return 'success'
    if (!this.db) await this.init().catch(() => {})
    return await new Promise<string>((resolve) => {
      this.db.transaction(
        function (tx: any) {
          for (let i = 0, maxi = uploadlist.length; i < maxi; i++) {
            const item = uploadlist[i]
            tx.executeSql('INSERT OR REPLACE INTO Uploading values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [
              item.UploadID,
              item.Info.user_id,
              item.Info.localFilePath,
              item.Info.parent_id,
              item.Info.drive_id,
              item.Info.path,
              item.Info.name,
              item.Info.size,
              item.Info.sizestr,
              '',
              item.Info.isDir,
              item.Info.isMiaoChuan,
              item.Info.sha1,
              item.Info.crc64,
              item.Upload.DownTime,
              item.Upload.DownSize,
              item.Upload.DownProcess,
              item.Upload.upload_id,
              item.Upload.file_id
            ])
          }
        },
        function (error: any) {
          SettingLog.mSaveLog('danger', 'sqlerror:' + error.message)
          resolve('error')
        },
        function () {
          resolve('success')
        }
      )
    })
  }

  public async SaveToUploading(UploadID: string, file_id: string, upload_id: string) {
    if (!UploadID) return 'success'
    if (!this.db) await this.init().catch(() => {})
    return await new Promise<string>((resolve) => {
      this.db.transaction(
        function (tx: any) {
          tx.executeSql('update Uploading set file_id=?,upload_id=? where UploadID=?', [file_id, upload_id, UploadID])
        },
        function (error: any) {
          SettingLog.mSaveLog('danger', 'sqlerror:' + error.message)
          resolve('error')
        },
        function () {
          resolve('success')
        }
      )
    })
  }

  public async OldSaveUploadeds(uploadlist: IStateUploadFile[]) {
    if (!uploadlist || uploadlist.length == 0) return 'success'
    if (!this.db) await this.init().catch(() => {})
    return await new Promise<string>((resolve) => {
      this.db.transaction(
        function (tx: any) {
          for (let i = 0, maxi = uploadlist.length; i < maxi; i++) {
            const item = uploadlist[i]
            tx.executeSql('INSERT OR REPLACE INTO Uploaded values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [
              item.UploadID,
              '',
              item.Info.localFilePath,
              '',
              '',
              item.Info.path,
              item.Info.name,
              item.Info.size,
              item.Info.sizestr,
              '',
              item.Info.isDir,
              item.Info.isMiaoChuan,
              '',
              '',
              item.Upload.DownTime
            ])
          }
        },
        function (error: any) {
          SettingLog.mSaveLog('danger', 'sqlerror:' + error.message)
          resolve('error')
        },
        function () {
          resolve('success')
        }
      )
    })
  }

  public async GetAllUploading() {
    if (!this.db) await this.init().catch(() => {})
    return await new Promise<Map<string, IStateUploadFile>>((resolve) => {
      const uploadlist = new Map<string, IStateUploadFile>()
      this.db.transaction(
        function (tx: any) {
          tx.executeSql(
            'select * from Uploading order by DownTime asc',
            [],
            function (tx: any, results: any) {
              for (let i = 0, maxi = results.rows.length; i < maxi; i++) {
                const item = results.rows.item(i)
                const isDir = item.isDir === true || item.isDir === 'true'
                const upload: IStateUploadFile = {
                  UploadID: item.UploadID,
                  Info: {
                    user_id: item.user_id,
                    localFilePath: item.localFilePath,
                    parent_id: item.parent_id,
                    drive_id: item.drive_id,
                    path: item.path,
                    name: item.name,
                    size: item.size,
                    sizestr: item.sizestr,
                    icon: isDir ? 'iconfont iconfolder' : 'iconfont iconwenjian',
                    isDir: isDir,
                    isMiaoChuan: item.isMiaoChuan === true || item.isMiaoChuan === 'true',
                    sha1: item.sha1,
                    crc64: item.crc64
                  },
                  Upload: {
                    DownState: '已暂停',
                    DownTime: item.DownTime,
                    DownSize: item.DownSize,
                    DownSpeed: 0,
                    DownSpeedStr: '',
                    DownProcess: item.DownProcess || 0,
                    IsStop: true,
                    IsDowning: false,
                    IsCompleted: false,
                    IsFailed: false,
                    FailedCode: 0,
                    FailedMessage: '',
                    AutoTry: 0,
                    upload_id: item.upload_id || '',
                    file_id: item.file_id || '',
                    IsBreakExist: false
                  }
                }
                Object.freeze(upload.Info)
                uploadlist.set(upload.UploadID, upload)
              }
              resolve(uploadlist)
            },
            null
          )
        },
        function (error: any) {
          SettingLog.mSaveLog('danger', 'sqlerror:' + error.message)
          resolve(uploadlist)
        }
      )
    })
  }

  public async GetAllUploaded() {
    if (!this.db) await this.init().catch(() => {})
    return await new Promise<IStateUploadFile[]>((resolve) => {
      this.db.transaction(
        function (tx: any) {
          tx.executeSql(
            'select * from Uploaded order by DownTime desc',
            [],
            function (tx: any, results: any) {
              const uploadlist: IStateUploadFile[] = []
              for (let i = 0, maxi = results.rows.length; i < maxi; i++) {
                const item = results.rows.item(i)
                const isDir = item.isDir === true || item.isDir === 'true'
                const uploaded: IStateUploadFile = {
                  UploadID: item.UploadID,
                  Info: {
                    user_id: '',
                    localFilePath: item.localFilePath,
                    parent_id: '',
                    drive_id: '',
                    path: item.path,
                    name: item.name,
                    size: item.size,
                    sizestr: item.sizestr,
                    icon: isDir ? 'iconfont iconfolder' : 'iconfont iconwenjian',
                    isDir: isDir,
                    isMiaoChuan: item.isMiaoChuan === true || item.isMiaoChuan === 'true',
                    sha1: '',
                    crc64: ''
                  },
                  Upload: {
                    DownState: '已完成',
                    DownTime: item.DownTime,
                    DownSize: item.size,
                    DownSpeed: 0,
                    DownSpeedStr: '',
                    DownProcess: 100,
                    IsStop: true,
                    IsDowning: false,
                    IsCompleted: true,
                    IsFailed: false,
                    FailedCode: 0,
                    FailedMessage: '',
                    AutoTry: 0,
                    upload_id: '',
                    file_id: '',
                    IsBreakExist: false
                  }
                }
                uploadlist.push(uploaded)
              }
              resolve(uploadlist)
            },
            null
          )
        },
        function (error: any) {
          SettingLog.mSaveLog('danger', 'sqlerror:' + error.message)
          resolve([])
        }
      )
    })
  }

  public async DeleteUploads(isUploaded: boolean, upload_ids: string[]) {
    if (!upload_ids || upload_ids.length == 0) return 'success'
    if (!this.db) await this.init().catch(() => {})
    return await new Promise<string>((resolve) => {
      this.db.transaction(
        function (tx: any) {
          let sql1 = 'delete from Uploading where UploadID in ('
          if (isUploaded) sql1 = 'delete from Uploaded where UploadID in ('
          for (let i = 0, maxi = upload_ids.length; i < maxi; i++) {
            if (i > 0) {
              sql1 += ',"' + upload_ids[i] + '"'
            } else {
              sql1 += '"' + upload_ids[i] + '"'
            }
          }
          tx.executeSql(sql1 + ')', [])
        },
        function (error: any) {
          SettingLog.mSaveLog('danger', 'sqlerror:' + error.message)
          resolve('error')
        },
        function () {
          resolve('success')
        }
      )
    })
  }

  public async DeleteUploadsAll(isUploaded: boolean) {
    if (!this.db) await this.init().catch(() => {})
    return await new Promise<string>((resolve) => {
      this.db.transaction(
        function (tx: any) {
          if (isUploaded) tx.executeSql('delete from Uploaded', [])
          else tx.executeSql('delete from Uploading', [])
        },
        function (error: any) {
          SettingLog.mSaveLog('danger', 'sqlerror:' + error.message)
          resolve('error')
        },
        function () {
          resolve('success')
        }
      )
    })
  }

  public async MoveUploadingToUpload(UploadID: string, upload: IStateUploadFile) {
    if (!this.db) await this.init().catch(() => {})
    return await new Promise<string>((resolve) => {
      this.db.transaction(
        function (tx: any) {
          tx.executeSql('delete from Uploading where UploadID =?', [UploadID])
          tx.executeSql('INSERT OR REPLACE INTO Uploaded values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [
            upload.UploadID,
            '',
            upload.Info.localFilePath,
            '',
            '',
            upload.Info.path,
            upload.Info.name,
            upload.Info.size,
            upload.Info.sizestr,
            '',
            upload.Info.isDir,
            upload.Info.isMiaoChuan,
            '',
            '',
            upload.Upload.DownTime
          ])
        },
        function (error: any) {
          SettingLog.mSaveLog('danger', 'sqlerror:' + error.message)
          resolve('error')
        },
        function () {
          resolve('success')
        }
      )
    })
  }

  public async ClearOldLogs(max: number) {
    if (max < 1000) max = 1000
    if (!this.db) await this.init().catch(() => {})

    const uploadedCount = await new Promise<number>((resolve) => {
      this.db.transaction(
        function (tx: any) {
          tx.executeSql(
            'select count(*) as count from Uploaded',
            [],
            function (tx: any, results: any) {
              if (results.rows.length > 0) resolve(results.rows[0].count)
              else resolve(0)
            },
            null
          )
        },
        function (error: any) {
          SettingLog.mSaveLog('danger', 'sqlerror:' + error.message)
          resolve(0)
        }
      )
    })
    if (uploadedCount > max) {
      await new Promise<string>((resolve) => {
        this.db.transaction(
          function (tx: any) {
            tx.executeSql('delete from Uploaded where UploadID in ( select UploadID from Uploaded order by DownTime asc limit ?)', [uploadedCount - max])
          },
          function (error: any) {
            SettingLog.mSaveLog('danger', 'sqlerror:' + error.message)
            resolve('error')
          },
          function () {
            resolve('success')
          }
        )
      }).catch(() => {})
    }

    const downededCount = await new Promise<number>((resolve) => {
      this.db.transaction(
        function (tx: any) {
          tx.executeSql(
            'select count(*) as count from Downed',
            [],
            function (tx: any, results: any) {
              if (results.rows.length > 0) resolve(results.rows[0].count)
              else resolve(0)
            },
            null
          )
        },
        function (error: any) {
          SettingLog.mSaveLog('danger', 'sqlerror:' + error.message)
          resolve(0)
        }
      )
    })
    if (downededCount > max) {
      await new Promise<string>((resolve) => {
        this.db.transaction(
          function (tx: any) {
            tx.executeSql('delete from Downed where DownID in ( select DownID from Downed order by DownTime asc limit ?)', [downededCount - max])
          },
          function (error: any) {
            SettingLog.mSaveLog('danger', 'sqlerror:' + error.message)
            resolve('error')
          },
          function () {
            resolve('success')
          }
        )
      }).catch(() => {})
    }
  }
}
const sql = new SQLDatabase()
export default sql
