import { IStateDownFile, IStatePanDirSize, IStatePanFile, IStatePanFileByDir, IStateUploadFile } from './models';

function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

const isdebugsql = false;

export class SQLDatabase {
  private db: any = null;
  private isopening = false;

  public async init() {
    while (true) {
      if (this.db) return 'success';
      if (this.isopening) {
        console.log('db sleep22');
        await sleep(1000);
      } else {
        this.isopening = true;
        try {
          console.log('db open');
          const db2 = window.openDatabase('xbyv2', '1.0', '', 10 * 1024 * 1024);
          if (db2) {
            this.db = db2;
            this.db.transaction(
              function (tx: any) {
                tx.executeSql(`CREATE TABLE IF NOT EXISTS DirLoading (
          user_id TEXT  NOT NULL,
          drive_id TEXT NOT NULL,
          file_id TEXT  NOT NULL,  
          loading INTEGER  NOT NULL,
          PRIMARY KEY (user_id,drive_id,file_id) )`);

                tx.executeSql(`CREATE TABLE IF NOT EXISTS Dir (
          user_id TEXT  NOT NULL,
          drive_id TEXT NOT NULL,
          file_id TEXT  NOT NULL,          
          parent_file_id TEXT  NOT NULL,          
          name TEXT  NOT NULL,
          starred INTEGER  NOT NULL,
          time INTEGER  NOT NULL,
          timestr TEXT  NOT NULL,
          size INTEGER  NOT NULL,
          filecount INTEGER  NOT NULL,
          PRIMARY KEY (user_id,drive_id,file_id) )`);
                tx.executeSql('CREATE INDEX IF NOT EXISTS idx_Dir_Parent ON Dir ( user_id,drive_id,parent_file_id )');
                tx.executeSql(`CREATE TABLE IF NOT EXISTS File (
          user_id TEXT  NOT NULL,
          drive_id TEXT NOT NULL,
          file_id TEXT  NOT NULL,          
          parent_file_id TEXT  NOT NULL,          
          name TEXT  NOT NULL,
          starred INTEGER  NOT NULL,
          size INTEGER  NOT NULL,
          sha1 TEXT  NOT NULL,
          ext TEXT  NOT NULL,
          time INTEGER  NOT NULL,
          timestr TEXT  NOT NULL,          
          sizestr TEXT  NOT NULL,          
          thumbnail TEXT  NOT NULL,
          width INTEGER  NOT NULL,
          height INTEGER  NOT NULL,
          duration INTEGER  NOT NULL,
          icon TEXT  NOT NULL,
          info TEXT  NOT NULL,
          PRIMARY KEY (user_id,drive_id,file_id) )`);
                tx.executeSql('CREATE INDEX IF NOT EXISTS idx_File_Parent ON File ( user_id,drive_id,parent_file_id )');
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
          )`);

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
          )`);

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
          )`);

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
          )`);
              },
              function (error: any) {
                console.log(error);
              }
            );
            this.isopening = false;
            console.log('db success');

            return 'success';
          } else return 'dberror';
        } catch {
          console.log('db sleep');
          this.isopening = false;
          await sleep(1000);
        }
      }
    }
  }

  public async DeleteDir(user_id: string, drive_id: string, file_id: string) {
    if (!user_id) return 'success';
    if (!this.db) await this.init();
    return await new Promise<string>((resolve) => {
      this.db.transaction(
        function (tx: any) {
          if (drive_id && file_id) {
            tx.executeSql('delete from DirLoading where user_id=? and drive_id=? and file_id=?', [user_id, drive_id, file_id]);
            tx.executeSql('delete from Dir where user_id=? and drive_id=? and file_id=?', [user_id, drive_id, file_id]);
            tx.executeSql('delete from File where user_id=? and drive_id=? and parent_file_id=?', [user_id, drive_id, file_id]);
          } else if (drive_id) {
            tx.executeSql('delete from DirLoading where user_id=? and drive_id=? ', [user_id, drive_id]);
            tx.executeSql('delete from Dir where user_id=? and drive_id=? ', [user_id, drive_id]);
            tx.executeSql('delete from File where user_id=? and drive_id=? ', [user_id, drive_id]);
          } else {
            tx.executeSql('delete from DirLoading where user_id=? ', [user_id]);
            tx.executeSql('delete from Dir where user_id=? ', [user_id]);
            tx.executeSql('delete from File where user_id=?', [user_id]);
          }
        },
        function (error: any) {
          if (isdebugsql) console.log(error);
          resolve('error');
        },
        function () {
          resolve('success');
        }
      );
    });
  }


  public async SaveAllDir(user_id: string, drive_id: string, list: IStatePanFile[]) {
    if (!this.db) await this.init();
    await new Promise<string>((resolve) => {
      this.db.transaction(
        function (tx: any) {

          tx.executeSql('delete from Dir where user_id=? and drive_id=?', [user_id, drive_id]);
        },
        function (error: any) {
          if (isdebugsql) console.log(error);
          resolve('error');
        },
        function () {
          resolve('success');
        }
      );
    });
    return await new Promise<string>((resolve) => {
      this.db.transaction(
        function (tx: any) {
          if (list) {
            for (let i = 0; i < list.length; i++) {
              const item = list[i];
              tx.executeSql(
                'INSERT OR REPLACE INTO Dir values(?,?,?,?,?,?,?,?,ifnull((select sum([size]) from [File] where [File].user_id=? and [File].drive_id=?  and [File].parent_file_id=?),0),?)',
                [user_id, item.drive_id, item.file_id, item.parent_file_id, item.name, item.starred, item.time, item.timestr, user_id, item.drive_id, item.file_id, 0]
              );
            }
          }
        },
        function (error: any) {
          if (isdebugsql) console.log(error);
          resolve('error');
        },
        function () {
          resolve('success');
        }
      );
    });
  }


  public async GetAllDir(user_id: string, drive_id: string) {
    if (!user_id || !drive_id) return [];
    if (!this.db) await this.init();
    return await new Promise<IStatePanFile[]>((resolve) => {
      this.db.transaction(
        function (tx: any) {
          tx.executeSql(
            'select Dir.*,DirLoading.loading from Dir left join DirLoading on Dir.user_id=DirLoading.user_id and Dir.drive_id=DirLoading.drive_id and Dir.file_id=DirLoading.file_id where Dir.user_id=? and Dir.drive_id=?',
            [user_id, drive_id],
            function (tx: any, results: any) {
              const len = results.rows.length;
              const dirlist: IStatePanFile[] = [];
              for (let i = 0; i < len; i++) {
                const item = results.rows.item(i);
                const loading = item.loading || 1629795158000;
                const dir: IStatePanFile = {
                  drive_id: item.drive_id,
                  file_id: item.file_id,
                  parent_file_id: item.parent_file_id,
                  name: item.name,
                  starred: item.starred === true || item.starred === 'true',
                  ext: '',
                  time: item.time,
                  size: item.size,
                  sizestr: '', 
                  timestr: item.timestr,
                  sha1: '',
                  thumbnail: '',
                  width: 0,
                  height: 0,
                  duration: item.filecount,
                  icon: 'iconfolder',
                  info: '',
                  isDir: true,
                  loading: loading,
                };
                dirlist.push(dir);
              }
              resolve(dirlist);
            },
            null
          );
        },
        function (error: any) {
          if (isdebugsql) console.log(error);
          resolve([]); 
        }
      );
    });
  }

  public async GetAllChildDir(user_id: string, drive_id: string, dir_id: string) {
    const fulllist = [dir_id];
    const alldir = await this.GetAllDir(user_id, drive_id);
    const fund = (idlist: string[]) => {
      for (let i = 0; i < idlist.length; i++) {
        const idlist2: string[] = [];
        for (let j = 0; j < alldir.length; j++) {
          if (alldir[j].parent_file_id == idlist[i]) {
            fulllist.push(alldir[j].file_id);
            idlist2.push(alldir[j].file_id);
          }
        }
        if (idlist2.length > 0) fund(idlist2);
      }
    };
    fund([dir_id]);
    return fulllist;
  }


  public async GetDirSize(user_id: string, drive_id: string, file_id: string) {
    if (!user_id || !drive_id) return [];
    if (!this.db) await this.init();
    return await new Promise<IStatePanDirSize[]>((resolve) => {
      this.db.transaction(
        function (tx: any) {
          if (file_id == '') {
            tx.executeSql(
              'select file_id,[size] from Dir where user_id=? and drive_id=?',
              [user_id, drive_id],
              function (tx: any, results: any) {
                const len = results.rows.length;
                const dirlist: IStatePanDirSize[] = [];
                for (let i = 0; i < len; i++) {
                  const item = results.rows.item(i);
                  const dir: IStatePanDirSize = {
                    file_id: item.file_id,
                    size: item.size || 0,
                  };
                  dirlist.push(dir);
                }
                resolve(dirlist);
              },
              null
            );
          } else {
            tx.executeSql(
              'select file_id,[size] from Dir where user_id=? and drive_id=? and file_id=?',
              [user_id, drive_id, file_id],
              function (tx: any, results: any) {
                const len = results.rows.length;
                const dirlist: IStatePanDirSize[] = [];
                for (let i = 0; i < len; i++) {
                  const item = results.rows.item(i);
                  const dir: IStatePanDirSize = {
                    file_id: item.file_id,
                    size: item.size || 0,
                  };
                  dirlist.push(dir);
                }
                resolve(dirlist);
              },
              null
            );
          }
        },
        function (error: any) {
          if (isdebugsql) console.log(error);
          resolve([]); 
        }
      );
    });
  }


  public async SaveFileList(user_id: string, drive_id: string, dir_id: string, list: IStatePanFile[]) {
    if (!user_id || !drive_id || !dir_id) return 'success';
    if (!this.db) await this.init();


    await new Promise<string>((resolve) => {
      this.db.transaction(
        function (tx: any) {
          tx.executeSql('delete from Dir where user_id=? and drive_id=? and parent_file_id=?', [user_id, drive_id, dir_id]); 
          tx.executeSql('delete from File where user_id=? and drive_id=? and parent_file_id=?', [user_id, drive_id, dir_id]); 
        },
        function (error: any) {
          if (isdebugsql) console.log(error);
          resolve('error');
        },
        function () {
          resolve('success');
        }
      );
    });

    await new Promise<string>((resolve) => {
      this.db.transaction(
        function (tx: any) {

          if (list) {
            for (let i = 0; i < list.length; i++) {
              const item = list[i];
              if (item.isDir) {

                tx.executeSql(
                  'INSERT OR REPLACE INTO Dir values(?,?,?,?,?,?,?,?,  ifnull((select sum([size]) from [File] where user_id=? and drive_id=?  and parent_file_id=?),0),(select count([size]) from [File] where user_id=? and drive_id=?  and parent_file_id=?) )',
                  [
                    user_id,
                    item.drive_id,
                    item.file_id,
                    item.parent_file_id,
                    item.name,
                    item.starred,
                    item.time,
                    item.timestr,
                    user_id,
                    item.drive_id,
                    item.file_id,
                    user_id,
                    item.drive_id,
                    item.file_id,
                  ]
                );
              } else {
                tx.executeSql('INSERT OR REPLACE INTO File values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [
                  user_id,
                  item.drive_id,
                  item.file_id,
                  item.parent_file_id,
                  item.name,
                  item.starred,
                  item.size,
                  '', //item.sha1,
                  item.ext,
                  '', //item.time,
                  '', //item.timestr,
                  item.sizestr,
                  '', //item.thumbnail,
                  0, //item.width,
                  0, //item.height,
                  0, //item.duration,
                  item.icon,
                  '', //item.info,
                ]);
              }
            }
          }

          tx.executeSql('INSERT OR REPLACE INTO [DirLoading] values(?,?,?,?)', [user_id, drive_id, dir_id, Date.now()]);
        },
        function (error: any) {
          if (isdebugsql) console.log(error);
          resolve('error');
        },
        function () {
          resolve('success');
        }
      );
    });

    return await new Promise<string>((resolve) => {
      this.db.transaction(
        function (tx: any) {

          tx.executeSql(
            'Update [Dir] set [size]=ifnull((select sum([size]) from [File] where user_id=? and drive_id=?  and parent_file_id=?),0),filecount=(select count([size]) from [File] where user_id=? and drive_id=?  and parent_file_id=?) where user_id=? and drive_id=? and file_id=?',
            [user_id, drive_id, dir_id, user_id, drive_id, dir_id, user_id, drive_id, dir_id]
          );
        },
        function (error: any) {
          if (isdebugsql) console.log(error);
          resolve('error');
        },
        function () {
          resolve('success');
        }
      );
    });
  }

  public async DeleteDirLoading(user_id: string, drive_id: string, file_ids: string[]) {
    if (!user_id || !drive_id) return 'success';
    if (!this.db) await this.init();
    return await new Promise<string>((resolve) => {
      this.db.transaction(
        function (tx: any) {
          let sql1 = 'delete from DirLoading where user_id=? and drive_id=? and file_id in (';
          for (let i = 0; i < file_ids.length; i++) {
            if (i > 0) {
              sql1 += ',"' + file_ids[i] + '"';
            } else {
              sql1 += '"' + file_ids[i] + '"';
            }
          }
          tx.executeSql(sql1 + ')', [user_id, drive_id]);
        },
        function (error: any) {
          if (isdebugsql) console.log(error);
          resolve('error');
        },
        function () {
          resolve('success');
        }
      );
    });
  }


  public async GetFileByDir(user_id: string, drive_id: string, file_id: string) {
    if (!user_id || !drive_id || !file_id) return undefined;
    if (!this.db) await this.init();
    const dir: IStatePanFileByDir = {
      user_id,
      drive_id,
      file_id,
      loading: 1629795158000,
      filelist: [],
    };

    return await new Promise<IStatePanFileByDir | undefined>((resolve) => {
      this.db.transaction(
        function (tx: any) {

          tx.executeSql(
            'SELECT * FROM DirLoading where user_id=? and drive_id=? and file_id=?',
            [user_id, drive_id, file_id],
            function (tx: any, results: any) {
              if (results.rows.length > 0 && dir != undefined) {
                const item = results.rows.item(0);
                const ts = Date.now() - 3 * 60 * 60 * 1000;
                if (item.loading < ts) {
                  dir.loading = 1629795158000; 
                } else {
                  dir.loading = item.loading;
                }
              }
            },
            null
          );

          tx.executeSql(
            'SELECT * FROM Dir where user_id=? and drive_id=? and parent_file_id=?',
            [user_id, drive_id, file_id],
            function (tx: any, results: any) {
              const filelist: IStatePanFile[] = [];
              for (let i = 0; i < results.rows.length; i++) {
                const item = results.rows.item(i);
                const dir: IStatePanFile = {
                  drive_id: item.drive_id,
                  file_id: item.file_id,
                  parent_file_id: item.parent_file_id,
                  name: item.name,
                  starred: item.starred === true || item.starred === 'true',
                  time: item.time,
                  size: item.size,
                  ext: item.ext,
                  sizestr: item.sizestr,
                  timestr: item.timestr,
                  sha1: '',
                  thumbnail: '',
                  width: 0,
                  height: 0,
                  duration: 0,
                  icon: 'iconfolder',
                  info: '',
                  isDir: true,
                  loading: 1629795158000,
                };
                filelist.push(dir);
              }
              dir.filelist.push(...filelist);
            },
            null
          );

          tx.executeSql(
            'SELECT * FROM File where user_id=? and drive_id=? and parent_file_id=?',
            [user_id, drive_id, file_id],
            function (tx: any, results: any) {
              const filelist: IStatePanFile[] = [];
              for (let i = 0; i < results.rows.length; i++) {
                const item = results.rows.item(i);
                const dir: IStatePanFile = {
                  drive_id: item.drive_id,
                  file_id: item.file_id,
                  parent_file_id: item.parent_file_id,
                  name: item.name,
                  starred: item.starred === true || item.starred === 'true',
                  ext: item.ext,
                  time: 0, //item.time,
                  size: item.size,
                  sizestr: item.sizestr,
                  timestr: '', //item.timestr,
                  sha1: '', //item.sha1,
                  thumbnail: '', //item.thumbnail,
                  width: 0, //item.width,
                  height: 0, //item.height,
                  duration: 0, //item.duration,
                  icon: item.icon,
                  isDir: false,
                  info: '', //item.info,
                  loading: 1629795158000,
                };
                filelist.push(dir);
              }
              if (filelist.length == 0 && dir.loading < Date.now() - 20 * 60 * 1000) {
                dir.loading = 1629795158000; 
              }
              dir.filelist.push(...filelist);
            },
            null
          );
        },
        function (error: any) {
          if (isdebugsql) console.log(error);
          resolve(undefined); 
        },
        function () {
          resolve(dir); 
        }
      );
    });
  }

  public async UpdateDirSize(user_id: string, drive_id: string, file_id: string) {
    if (!user_id || !drive_id) return;
    if (!this.db) await this.init();
    this.db.transaction(function (tx: any) {
      if (file_id && file_id != '') {
        
        tx.executeSql(
          'Update [Dir] set [size]=ifnull((select sum([size]) from [File] where user_id=? and drive_id=?  and parent_file_id=?),0),filecount=(select count([size]) from [File] where user_id=? and drive_id=?  and parent_file_id=?) where user_id=? and drive_id=? and file_id=?',
          [user_id, drive_id, file_id, user_id, drive_id, file_id, user_id, drive_id, file_id]
        );
      } else {
        tx.executeSql(
          'Update [Dir] set [size]=ifnull((select sum([size]) from [File] where [Dir].user_id=[File].user_id and [Dir].drive_id=[File].drive_id and [Dir].file_id=[File].parent_file_id),0),filecount=(select count([size]) from [File] where [Dir].user_id=[File].user_id and [Dir].drive_id=[File].drive_id and [Dir].file_id=[File].parent_file_id) where user_id=? ',
          [user_id]
        );
      }
    });
  }

  public async RenameFiles(user_id: string, drive_id: string, files: string[], names: string[]) {
    if (!user_id || !drive_id) return;
    if (!this.db) await this.init();
    return await new Promise<string>((resolve) => {
      this.db.transaction(
        function (tx: any) {
          for (let i = 0; i < files.length; i++) {
            tx.executeSql('Update [Dir] set [name]=? where user_id=? and drive_id=? and file_id=?', [names[i], user_id, drive_id, files[i]]);
            tx.executeSql('Update [File] set [name]=? where user_id=? and drive_id=? and file_id=?', [names[i], user_id, drive_id, files[i]]);
          }
        },
        function (error: any) {
          if (isdebugsql) console.log(error);
          resolve('error');
        },
        function () {
          resolve('success');
        }
      );
    });
  }
  public async DeleteFiles(user_id: string, drive_id: string, parentid: string, files: string[]) {
    if (!user_id || !drive_id || files.length == 0) return;
    if (!this.db) await this.init();
    return await new Promise<string>((resolve) => {
      this.db.transaction(
        function (tx: any) {

          let sql1 = 'delete from [Dir] where user_id=? and drive_id=? and file_id in (';
          let sql2 = 'delete from [File] where user_id=? and drive_id=? and parent_file_id in (';

          let sql3 = 'delete from [File] where user_id=? and drive_id=? and file_id in (';
          for (let i = 0; i < files.length; i++) {
            if (i > 0) {
              sql1 += ',"' + files[i] + '"';
              sql2 += ',"' + files[i] + '"';
              sql3 += ',"' + files[i] + '"';
            } else {
              sql1 += '"' + files[i] + '"';
              sql2 += '"' + files[i] + '"';
              sql3 += '"' + files[i] + '"';
            }
          }
          tx.executeSql(sql1 + ')', [user_id, drive_id]);
          tx.executeSql(sql2 + ')', [user_id, drive_id]);
          tx.executeSql(sql3 + ')', [user_id, drive_id]);

          tx.executeSql(
            'Update [Dir] set [size]=ifnull((select sum([size]) from [File] where user_id=? and drive_id=?  and parent_file_id=?),0),filecount=(select count([size]) from [File] where user_id=? and drive_id=?  and parent_file_id=?) where user_id=? and drive_id=? and file_id=?',
            [user_id, drive_id, parentid, user_id, drive_id, parentid, user_id, drive_id, parentid]
          );
        },
        function (error: any) {
          if (isdebugsql) console.log(error);
          resolve('error');
        },
        function () {
          resolve('success');
        }
      );
    });
  }
  public async FavorFiles(user_id: string, drive_id: string, isfavor: boolean, files: string[]) {
    if (!user_id || !drive_id || files.length == 0) return;
    if (!this.db) await this.init();
    return await new Promise<string>((resolve) => {
      this.db.transaction(
        function (tx: any) {
          let sql1 = 'Update [Dir] set [starred]=? where user_id=? and drive_id=? and file_id in (';
          let sql2 = 'Update [File] set [starred]=? where user_id=? and drive_id=? and file_id in (';
          for (let i = 0; i < files.length; i++) {
            if (i > 0) {
              sql1 += ',"' + files[i] + '"';
              sql2 += ',"' + files[i] + '"';
            } else {
              sql1 += '"' + files[i] + '"';
              sql2 += '"' + files[i] + '"';
            }
          }
          tx.executeSql(sql1 + ')', [isfavor, user_id, drive_id]);
          tx.executeSql(sql2 + ')', [isfavor, user_id, drive_id]);
        },
        function (error: any) {
          if (isdebugsql) console.log(error);
          resolve('error');
        },
        function () {
          resolve('success');
        }
      );
    });
  }

  public async SaveDownings(downlist: IStateDownFile[]) {
    if (!downlist || downlist.length == 0) return 'success';
    if (!this.db) await this.init();
    return await new Promise<string>((resolve) => {
      this.db.transaction(
        function (tx: any) {
          for (let i = 0; i < downlist.length; i++) {
            const item = downlist[i];
            tx.executeSql('INSERT OR REPLACE INTO Downing values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [
              item.DownID,
              item.Info.GID,
              item.Info.userid,
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
              item.Down.DownUrl,
            ]);
          }
        },
        function (error: any) {
          if (isdebugsql) console.log(error);
          resolve('error');
        },
        function () {
          resolve('success');
        }
      );
    });
  }

  public async SaveDowneds(downlist: IStateDownFile[]) {
    if (!downlist || downlist.length == 0) return 'success';
    if (!this.db) await this.init();
    return await new Promise<string>((resolve) => {
      this.db.transaction(
        function (tx: any) {
          for (let i = 0; i < downlist.length; i++) {
            const item = downlist[i];
            tx.executeSql('INSERT OR REPLACE INTO Downed values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [
              item.DownID,
              '', //item.Info.userid,
              item.Info.DownSavePath,
              item.Info.ariaRemote,
              '', //item.Info.file_id,
              '', //item.Info.drive_id,
              item.Info.name,
              item.Info.size,
              item.Info.sizestr,
              item.Info.icon,
              item.Info.isDir,
              '', //item.Info.sha1,
              '', //item.Info.crc64,
              item.Down.DownTime,
            ]);
          }
        },
        function (error: any) {
          if (isdebugsql) console.log(error);
          resolve('error');
        },
        function () {
          resolve('success');
        }
      );
    });
  }

  public async GetAllDowning() {
    if (!this.db) await this.init();
    return await new Promise<IStateDownFile[]>((resolve) => {
      this.db.transaction(
        function (tx: any) {
          tx.executeSql(
            'select * from Downing order by DownTime asc',
            [],
            function (tx: any, results: any) {
              const len = results.rows.length;
              const downlist: IStateDownFile[] = [];
              for (let i = 0; i < len; i++) {
                const item = results.rows.item(i);
                const downing: IStateDownFile = {
                  DownID: item.DownID,
                  Info: {
                    GID: item.GID,
                    userid: item.userid,
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
                    crc64: item.crc64,
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
                    DownUrl: item.DownUrl || '',
                  },
                };
                downlist.push(downing);
              }
              resolve(downlist);
            },
            null
          );
        },
        function (error: any) {
          if (isdebugsql) console.log(error);
          resolve([]); 
        }
      );
    });
  }

  public async GetAllDowned() {
    if (!this.db) await this.init();
    return await new Promise<IStateDownFile[]>((resolve) => {
      this.db.transaction(
        function (tx: any) {
          tx.executeSql(
            'select * from Downed order by DownTime desc',
            [],
            function (tx: any, results: any) {
              const len = results.rows.length;
              const downlist: IStateDownFile[] = [];
              for (let i = 0; i < len; i++) {
                const item = results.rows.item(i);
                const downed: IStateDownFile = {
                  DownID: item.DownID,
                  Info: {
                    GID: item.GID,
                    userid: '', //item.userid,
                    DownSavePath: item.DownSavePath,
                    ariaRemote: item.ariaRemote === true || item.ariaRemote === 'true',
                    file_id: '', //item.file_id,
                    drive_id: '', //item.drive_id,
                    name: item.name,
                    size: item.size,
                    sizestr: item.sizestr,
                    icon: item.icon,
                    isDir: item.isDir === true || item.isDir === 'true',
                    sha1: '', //item.sha1,
                    crc64: '', //item.crc64,
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
                    DownUrl: '',
                  },
                };
                downlist.push(downed);
              }
              resolve(downlist);
            },
            null
          );
        },
        function (error: any) {
          if (isdebugsql) console.log(error);
          resolve([]); 
        }
      );
    });
  }

  public async DeleteDowns(isDowned: boolean, down_ids: string[]) {
    if (!down_ids || down_ids.length == 0) return 'success';
    if (!this.db) await this.init();
    return await new Promise<string>((resolve) => {
      this.db.transaction(
        function (tx: any) {
          let sql1 = 'delete from Downing where DownID in (';
          if (isDowned) sql1 = 'delete from Downed where DownID in (';
          for (let i = 0; i < down_ids.length; i++) {
            if (i > 0) {
              sql1 += ',"' + down_ids[i] + '"';
            } else {
              sql1 += '"' + down_ids[i] + '"';
            }
          }
          tx.executeSql(sql1 + ')', []);
        },
        function (error: any) {
          if (isdebugsql) console.log(error);
          resolve('error');
        },
        function () {
          resolve('success');
        }
      );
    });
  }

  public async SaveUploadings(uploadlist: IStateUploadFile[]) {
    if (!uploadlist || uploadlist.length == 0) return 'success';
    if (!this.db) await this.init();
    return await new Promise<string>((resolve) => {
      this.db.transaction(
        function (tx: any) {
          for (let i = 0; i < uploadlist.length; i++) {
            const item = uploadlist[i];
            tx.executeSql('INSERT OR REPLACE INTO Uploading values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [
              item.UploadID,
              item.Info.userid,
              item.Info.localFilePath,
              item.Info.parent_id,
              item.Info.drive_id,
              item.Info.path,
              item.Info.name,
              item.Info.size,
              item.Info.sizestr,
              '', //item.Info.icon,
              item.Info.isDir,
              item.Info.isMiaoChuan,
              item.Info.sha1,
              item.Info.crc64,
              item.Upload.DownTime,
              item.Upload.DownSize,
              item.Upload.DownProcess,
              item.Upload.upload_id,
              item.Upload.file_id,
            ]);
          }
        },
        function (error: any) {
          if (isdebugsql) console.log(error);
          resolve('error');
        },
        function () {
          resolve('success');
        }
      );
    });
  }

  public async SaveUploadeds(uploadlist: IStateUploadFile[]) {
    if (!uploadlist || uploadlist.length == 0) return 'success';
    if (!this.db) await this.init();
    return await new Promise<string>((resolve) => {
      this.db.transaction(
        function (tx: any) {
          for (let i = 0; i < uploadlist.length; i++) {
            const item = uploadlist[i];
            tx.executeSql('INSERT OR REPLACE INTO Uploaded values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [
              item.UploadID,
              '', //item.Info.userid,
              item.Info.localFilePath,
              '', //item.Info.parent_id,
              '', //item.Info.drive_id,
              item.Info.path,
              item.Info.name,
              item.Info.size,
              item.Info.sizestr,
              '', //item.Info.icon,
              item.Info.isDir,
              item.Info.isMiaoChuan,
              '', //item.Info.sha1,
              '', //item.Info.crc64,
              item.Upload.DownTime,
            ]);
          }
        },
        function (error: any) {
          if (isdebugsql) console.log(error);
          resolve('error');
        },
        function () {
          resolve('success');
        }
      );
    });
  }

  public async GetAllUploading() {
    if (!this.db) await this.init();
    return await new Promise<IStateUploadFile[]>((resolve) => {
      this.db.transaction(
        function (tx: any) {
          tx.executeSql(
            'select * from Uploading order by DownTime asc',
            [],
            function (tx: any, results: any) {
              const len = results.rows.length;
              const uploadlist: IStateUploadFile[] = [];
              for (let i = 0; i < len; i++) {
                const item = results.rows.item(i);
                const isDir = item.isDir === true || item.isDir === 'true';
                const upload: IStateUploadFile = {
                  UploadID: item.UploadID,
                  Info: {
                    userid: item.userid,
                    localFilePath: item.localFilePath,
                    parent_id: item.parent_id,
                    drive_id: item.drive_id,
                    path: item.path,
                    name: item.name,
                    size: item.size,
                    sizestr: item.sizestr,
                    icon: isDir ? 'iconfont iconfolder' : 'iconfont iconwenjian', //item.icon,
                    isDir: isDir,
                    isMiaoChuan: item.isMiaoChuan === true || item.isMiaoChuan === 'true',
                    sha1: item.sha1,
                    crc64: item.crc64,
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
                  },
                };
                uploadlist.push(upload);
              }
              resolve(uploadlist);
            },
            null
          );
        },
        function (error: any) {
          if (isdebugsql) console.log(error);
          resolve([]); 
        }
      );
    });
  }

  public async GetAllUploaded() {
    if (!this.db) await this.init();
    return await new Promise<IStateUploadFile[]>((resolve) => {
      this.db.transaction(
        function (tx: any) {
          tx.executeSql(
            'select * from Uploaded order by DownTime desc',
            [],
            function (tx: any, results: any) {
              const len = results.rows.length;
              const uploadlist: IStateUploadFile[] = [];
              for (let i = 0; i < len; i++) {
                const item = results.rows.item(i);
                const isDir = item.isDir === true || item.isDir === 'true';
                const uploaded: IStateUploadFile = {
                  UploadID: item.UploadID,
                  Info: {
                    userid: '', //item.userid,
                    localFilePath: item.localFilePath,
                    parent_id: '', //item.parent_id,
                    drive_id: '', //item.drive_id,
                    path: item.path,
                    name: item.name,
                    size: item.size,
                    sizestr: item.sizestr,
                    icon: isDir ? 'iconfont iconfolder' : 'iconfont iconwenjian', //item.icon,
                    isDir: isDir,
                    isMiaoChuan: item.isMiaoChuan === true || item.isMiaoChuan === 'true',
                    sha1: '', //item.sha1,
                    crc64: '', // item.crc64,
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
                    file_id: item.file_id || '',
                  },
                };
                uploadlist.push(uploaded);
              }
              resolve(uploadlist);
            },
            null
          );
        },
        function (error: any) {
          if (isdebugsql) console.log(error);
          resolve([]); 
        }
      );
    });
  }

  public async DeleteUploads(isUploaded: boolean, upload_ids: string[]) {
    if (!upload_ids || upload_ids.length == 0) return 'success';
    if (!this.db) await this.init();
    return await new Promise<string>((resolve) => {
      this.db.transaction(
        function (tx: any) {
          let sql1 = 'delete from Uploading where UploadID in (';
          if (isUploaded) sql1 = 'delete from Uploaded where UploadID in (';
          for (let i = 0; i < upload_ids.length; i++) {
            if (i > 0) {
              sql1 += ',"' + upload_ids[i] + '"';
            } else {
              sql1 += '"' + upload_ids[i] + '"';
            }
          }
          tx.executeSql(sql1 + ')', []);
        },
        function (error: any) {
          if (isdebugsql) console.log(error);
          resolve('error');
        },
        function () {
          resolve('success');
        }
      );
    });
  }
}
const sql = new SQLDatabase();
export default sql;
