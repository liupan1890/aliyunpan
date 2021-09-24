import { format } from 'quasar';
import AliHttp from 'src/aliapi/alihttp';
import AliFileList from 'src/aliapi/filelist';
import { GetSorterDirList, GetSorterFileList } from 'src/aliapi/sorthelper';
import { VuexModule, Module, Action, Mutation } from 'vuex-module-decorators';
import { SQL, StoreRoot, StoreSetting, StoreUser } from '.';
import { IStatePanDir, IStatePanFile, IStateTreeItem, ITokenInfo } from './models';

export interface IStateRootFileCheck {
  file_id: string;
  name: string;
  time: number;
  size: number;
}
function getEnmptyDir(drive_id: string, file_id: string, parent_file_id: string, name: string): IStatePanDir {
  return {
    drive_id: drive_id,
    file_id: file_id,
    parent_file_id: parent_file_id,
    name: name,
    time: 0,
    size: 0,
    sizestr: '',
    timestr: '',
    isDir: true,
    loading: 0,
    childrendir: [],
  };
}

interface IStateRoot {
  user_id: string; 
  drive_id: string; 
  selectedFiles: Map<string, boolean>; 
  selectedFileLast: string; 
  rangSelect: boolean;
  showDir: IStatePanDir;
  showDirTime: number; 
  refreshDirFileTime: number; 
  refreshDirTreeTime: number; 
}

export const RootDirMap = new Map<string, IStatePanDir>();
export const RootDirSize = new Map<string, number>();
export let ShowDirFiles: IStatePanFile[] = [];
export let ShowDirTree: IStateTreeItem[] = [
  {
    key: 'root',
    label: '网盘',
    icon: 'iconfont iconfolder',
    children: [],
    time: 0,
    size: 0,
  },
];
const loadSync: { [k: string]: any } = {};
@Module({ namespaced: true, name: 'Root', stateFactory: true })
export default class Root extends VuexModule implements IStateRoot {
  public rangSelect = false;
  public user_id = '';
  public drive_id = '';
  public selectedFiles = new Map<string, boolean>();
  public selectedFileLast = '';

  public showDir = getEnmptyDir('', 'root', '', '根目录');

  public showDirTime = 0; 
  public refreshDirFileTime = 0;
  public refreshDirTreeTime = 0;
  get gSelectedFilesCount(): number {
    return this.selectedFiles.size;
  }
  get gShowFilesCount() {
    return () => ShowDirFiles.length;
  }
  get gSelectedFilesKey(): string[] {
    return [...this.selectedFiles.keys()];
  }
  get gSelectedFiles(): IStatePanFile[] {
    const files: IStatePanFile[] = [];
    const selectedFiles = this.selectedFiles;
    for (let i = 0; i < ShowDirFiles.length; i++) {
      if (selectedFiles.has(ShowDirFiles[i].file_id)) files.push(ShowDirFiles[i]);
    }
    return files;
  }
  get gSelectedFileFirst(): IStatePanFile | undefined {
    const selectedFiles = this.selectedFiles;
    for (let i = 0; i < ShowDirFiles.length; i++) {
      if (selectedFiles.has(ShowDirFiles[i].file_id)) return ShowDirFiles[i];
    }
    return undefined;
  }

  get gFileFullPath() {
    return (parentid: string): string[][] => {
      if (parentid == '') return [];
      if (parentid == 'favorite') return [['favorite', '收藏夹']];
      if (parentid == 'trash') return [['trash', '回收站']];
      if (parentid == 'root') return [['root', '根目录']];

      const pathlist = [];
      const user_id = this.user_id;
      const drive_id = this.drive_id;
      while (true) {
        const find = RootDirMap.get(user_id + drive_id + parentid);
        if (!find) break;
        pathlist.push([find.file_id, find.name]);
        parentid = find.parent_file_id;
        if (parentid == 'root') {
          parentid = '';
          pathlist.push(['root', '根目录']);
          break;
        }
        if (parentid == '') break;
      }
      return pathlist.reverse();
    };
  }

  get gFileFullPathName() {
    return (parentid: string): string[] => {
      if (parentid == '') return [];
      if (parentid == 'favorite') return ['收藏夹'];
      if (parentid == 'trash') return ['回收站'];
      if (parentid == 'root') return ['根目录'];

      const pathlist = [];
      const user_id = this.user_id;
      const drive_id = this.drive_id;
      while (true) {
        const find = RootDirMap.get(user_id + drive_id + parentid);
        if (!find) break;
        pathlist.push(find.name);
        parentid = find.parent_file_id;
        if (parentid == 'root') {
          parentid = '';
          pathlist.push('根目录');
          break;
        }
        if (parentid == '') break;
      }
      return pathlist.reverse();
    };
  }

  get gFileFullPathID() {
    return (parentid: string): string[] => {
      if (parentid == '') return [];
      if (parentid == 'favorite') return ['favorite'];
      if (parentid == 'trash') return ['trash'];
      if (parentid == 'root') return ['root'];

      const pathlist = [];
      const user_id = this.user_id;
      const drive_id = this.drive_id;
      while (true) {
        const find = RootDirMap.get(user_id + drive_id + parentid);
        if (!find) break;
        pathlist.push(find.file_id);
        parentid = find.parent_file_id;
        if (parentid == 'root') {
          parentid = '';
          pathlist.push('root');
          break;
        }
        if (parentid == '') break;
      }
      return pathlist.reverse();
    };
  }

  get gFileDownPath() {
    return (parentid: string): string[] => {
      if (parentid == '') return [];
      if (parentid == 'favorite') return [];
      if (parentid == 'trash') return [];
      if (parentid == 'root') return [];

      const pathlist = [];
      const user_id = this.user_id;
      const drive_id = this.drive_id;
      while (true) {
        const find = RootDirMap.get(user_id + drive_id + parentid);
        if (!find) break;
        pathlist.push(find.name);
        parentid = find.parent_file_id;
        if (parentid == 'root') break;
        if (parentid == '') break;
      }
      return pathlist.reverse();
    };
  }

  get gDirFullChildDirID() {
    return (parentid: string): string[] => {
      if (parentid == '') return [];
      if (parentid == 'favorite') return [];
      if (parentid == 'trash') return [];
      //if (parentid == 'root') return [];
      const pathlist: string[] = [];
      const loadChildDir = (user_id: string, drive_id: string, parentid: string, list: string[]) => {
        const find = RootDirMap.get(user_id + drive_id + parentid);
        if (!find || !find.childrendir || find.childrendir.length <= 0) return; 
        list.push(...find.childrendir);
        for (let i = 0; i < find.childrendir.length; i++) {
          loadChildDir(user_id, drive_id, find.childrendir[i], list);
        }
      };
      loadChildDir(this.user_id, this.drive_id, parentid, pathlist);
      return pathlist;
    };
  }

  get gShowDirFiles() {
    return () => ShowDirFiles;
  }
  get gShowDirTree() {
    return () => ShowDirTree;
  }

  @Mutation
  mChangUser({ user_id, drive_id }: { user_id: string; drive_id: string }) {
    this.user_id = user_id;
    this.drive_id = drive_id;
    this.showDir = getEnmptyDir(drive_id, 'root', '', '根目录');
    this.showDir.loading = user_id == '' ? 0 : Date.now(); 
    ShowDirFiles = [];
    this.selectedFileLast = '';
    this.selectedFiles = new Map<string, boolean>();
    this.refreshDirFileTime = 0;
    RootDirMap.set(user_id + drive_id + 'root', getEnmptyDir(drive_id, 'root', '', '根目录'));
    RootDirMap.set(user_id + drive_id + 'favorite', getEnmptyDir(drive_id, 'favorite', '', '收藏夹'));
    RootDirMap.set(user_id + drive_id + 'trash', getEnmptyDir(drive_id, 'trash', '', '回收站'));
    ShowDirTree = [
      {
        key: 'root',
        label: '网盘',
        icon: 'iconfont iconfolder',
        children: [],
        time: 0,
        size: 0,
      },
    ];
    this.refreshDirTreeTime = Date.now();
  }
  @Mutation 
  mChangDirTree() {
    const order = StoreSetting.uiFileOrder;
    const user_id = this.user_id;
    const drive_id = this.drive_id;
    const getDirSize = (file_id: string) => {
      let size = 0;
      const finddir = RootDirMap.get(user_id + drive_id + file_id);
      if (finddir) {
        size += finddir.size;
        for (let c = 0; c < finddir.childrendir.length; c++) {
          size += getDirSize(finddir.childrendir[c]);
        }
      }
      return size;
    };
    const getone = (dir: IStatePanDir): IStateTreeItem => {
      const one: IStateTreeItem = {
        key: dir.file_id,
        label: dir.name,
        icon: 'iconfont iconfolder',
        children: [],
        time: dir.time,
        size: getDirSize(dir.file_id),
      };
      for (const key of dir.childrendir) {
        const item = RootDirMap.get(user_id + drive_id + key);
        if (item) one.children.push(getone(item));
      }
      one.children = GetSorterDirList(one.children, order.split(' ')[0], order.indexOf('asc') > 0);
      return one;
    };
    const root = RootDirMap.get(user_id + drive_id + 'root');

    if (root) {
      const tree = [getone(root)];
      Object.freeze(tree);
      ShowDirTree = tree;
    } else {
      ShowDirTree = [
        {
          key: 'root',
          label: '网盘',
          icon: 'iconfont iconfolder',
          children: [],
          time: 0,
          size: 0,
        },
      ];
    }
    this.refreshDirTreeTime = Date.now();
  }

  @Action 
  async aLoadAllDirList(root: boolean) {
    if (StoreUser.tokeninfo.user_id && StoreUser.tokeninfo.user_id != '') {
      const token = Object.assign({}, StoreUser.tokeninfo);

      let items = await SQL.GetAllDir(token.user_id, token.default_drive_id);
      if (root) StoreRoot.aChangSelectedDir('root');
      if (!items || items.length == 0) {

        StoreRoot.mTreeLoading(0);
        const data = await AliFileList.ApiAllDirList('pan', 'root', '网盘', token);
        if (data.next_marker === '' && data.items) {
          items = await SQL.GetAllDir(token.user_id, token.default_drive_id); 
        } else {
          items = [];
        }
      }
      await StoreRoot.aRefreshDirSize('');
      StoreRoot.mLoadAllDirList(items); 
      const ts3 = Date.now() - 1000 * 60 * 60 * 3; 
      const ts72 = Date.now() - 1000 * 60 * 60 * 72; 
      const iditems = [
        { drive_id: token.default_drive_id, file_id: 'favorite' }, 
        { drive_id: token.default_drive_id, file_id: 'trash' },
      ];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if ((item.loading < ts3 && item.duration > 600) || item.loading < ts72) {
          iditems.push({ drive_id: item.drive_id, file_id: item.file_id });
        }
      }
      if (window.WinMsgToUI && StoreSetting.uiFolderSize) {
        window.WinMsgToUI({ cmd: 'LoadAllDirFiles', token, items: iditems });
      }
      if (root) StoreRoot.aChangSelectedDir('root');
    }
  }
  @Mutation 
  mLoadAllDirList(children: IStatePanFile[]) {
    const user_id = this.user_id;
    const drive_id = this.drive_id;
    RootDirMap.set(user_id + drive_id + 'root', getEnmptyDir(this.drive_id, 'root', '', '根目录'));
    
    for (let i = 0; i < children.length; i++) {
      if (children[i].isDir) {
        const dir: IStatePanDir = { ...children[i], isDir: true, childrendir: [] }; 
        RootDirMap.set(user_id + drive_id + dir.file_id, dir); 
      }
    }
    
    for (let i = 0; i < children.length; i++) {
      if (children[i].isDir) {
        const parent = RootDirMap.get(user_id + drive_id + children[i].parent_file_id);
        if (parent) {
          parent.childrendir.push(children[i].file_id); 
        }
      }
    }
    StoreRoot.mChangDirTree(); 
  }

  @Action 
  async aRefreshAllDirList() {
    const token = Object.assign({}, StoreUser.tokeninfo);
    StoreRoot.mTreeLoading(0);
    const data = await AliFileList.ApiAllDirList('pan', 'root', '网盘', token);
    if (data.next_marker === '' && data.items) {
      await StoreRoot.aRefreshDirSize('');
      const items = await SQL.GetAllDir(token.user_id, token.default_drive_id); 
      StoreRoot.mLoadAllDirList(items); 
    } else {
      StoreRoot.mTreeLoading(Date.now());
    }
  }

  @Mutation 
  mLoadDirList({ parentid, children }: { parentid: string; children: IStatePanFile[] }) {
    if (parentid == '' || parentid == 'favorite' || parentid == 'trash') return;
    const user_id = this.user_id;
    const drive_id = this.drive_id;
    let issame = true;
    const parentdir = RootDirMap.get(user_id + drive_id + parentid);
    if (parentdir) {
      const list = [];
      let namediff = false;
      for (let i = 0; i < children.length; i++) {
        if (children[i].isDir) {
          list.push(children[i].file_id);
          if (namediff == false && children[i].name !== RootDirMap.get(user_id + drive_id + children[i].file_id)?.name) {
            namediff = true;
          }
        }
      }
      if (namediff == true || parentdir.childrendir.length !== list.length || JSON.stringify(parentdir.childrendir) != JSON.stringify(list)) {
        parentdir.childrendir = list; 
        issame = false;
      }
    }
    
    for (let i = 0; i < children.length; i++) {
      if (children[i].isDir) {
        
        if (RootDirMap.has(user_id + drive_id + children[i].file_id) == false) issame = false;
        const child = RootDirMap.get(user_id + drive_id + children[i].file_id)?.childrendir || [];
        const dir: IStatePanDir = { ...children[i], isDir: true, childrendir: child }; 
        RootDirMap.set(user_id + drive_id + dir.file_id, dir);
      }
    }
    if (!issame) StoreRoot.mChangDirTree();
  }
  @Action 
  async aRefreshDirList({ selectkeys, reload }: { selectkeys: string[]; reload: number }) {
    const user_id = this.user_id;
    const drive_id = this.drive_id;
    await SQL.DeleteDirLoading(user_id, drive_id, selectkeys);
    if (reload > 0) {
      await AliHttp.Sleep(reload);
      const token = Object.assign({}, StoreUser.tokeninfo);
      if (selectkeys.length == 1 && selectkeys[0] == 'favorite') {
      } else if (selectkeys.length == 1 && selectkeys[0] == 'trash') {
      } else {
        for (let i = 0; i < selectkeys.length; i++) {
          AliFileList.ApiFileList(drive_id, selectkeys[0], '', token).then(() => {
            StoreRoot.aRefreshDirSize(selectkeys[0]);
          });
        }
      }
    }
  }
  @Action 
  async aReLoadDir({ dir_id, deletecache }: { dir_id: string; deletecache: boolean }) {
  
    const find = RootDirMap.get(this.user_id + this.drive_id + dir_id);
    if (find == undefined) return;
    if (deletecache) {
      if (dir_id == 'favorite' || dir_id == 'trash') {
      } else await SQL.DeleteDirLoading(this.user_id, this.drive_id, [dir_id]); 
    }

    const token = Object.assign({}, StoreUser.tokeninfo);
    let data = { next_marker: 'error', items: [] as IStatePanFile[] };
    if (dir_id == 'favorite' || dir_id == 'trash') {
      if (this.showDir.loading > 0) return;
      if (dir_id == this.showDir.file_id) StoreRoot.mChangSelectedDirLoading({ dir_id, loading: Date.now() });

      if (dir_id == 'favorite') data = await AliFileList.ApiFavorFileList(find.drive_id, find.file_id, find.name, token);
      else if (dir_id == 'trash') data = await AliFileList.ApiTrashFileList(find.drive_id, find.file_id, find.name, token);
    } else {
      if (dir_id == this.showDir.file_id) StoreRoot.mChangSelectedDirLoading({ dir_id, loading: Date.now() });
      data = await AliFileList.ApiFileList(find.drive_id, find.file_id, find.name, token);
      if (data.next_marker == '') {
        StoreRoot.mLoadDirList({ parentid: dir_id, children: data.items }); 
        StoreRoot.aRefreshDirSize(dir_id);
      }
    }

    if (data.next_marker === '' && data.items && dir_id == this.showDir.file_id) {
      StoreRoot.mChangSelectedDirLoading({ dir_id, loading: 0 });
      StoreRoot.mChangSelectedDirFileList({ dir_id, items: data.items });
    }
  }

  @Mutation 
  mShowDirTime(time: number) {
    this.showDirTime = time;
  }

  @Action 
  aChangSelectedDir(dir_id: string) {
    StoreRoot.mChangSelectedDir({ dir_id, loading: 0 });
    StoreRoot.aReLoadDir({ dir_id, deletecache: false });
  }

  @Mutation 
  mChangSelectedDir({ dir_id, loading }: { dir_id: string; loading: number }) {
    const issamedir = this.showDir.file_id == dir_id; 
    this.showDir = RootDirMap.get(this.user_id + this.drive_id + dir_id) || getEnmptyDir('', '', '', ''); 
    if (this.showDir.loading != loading) this.showDir.loading = loading;
    if (issamedir == false) {
      
      ShowDirFiles = [];
      this.selectedFileLast = '';
      this.selectedFiles = new Map<string, boolean>();
      this.refreshDirFileTime = 0;
    }
  }
  @Mutation 
  mChangSelectedDirLoading({ dir_id, loading }: { dir_id: string; loading: number }) {
    if (this.showDir.file_id == dir_id && this.showDir.loading != loading) this.showDir.loading = loading;
  }

  @Mutation 
  mChangSelectedDirFileList({ dir_id, items }: { dir_id: string; items: IStatePanFile[] }) {
    if (dir_id == 'order') {
      dir_id = this.showDir.file_id;
      items = ShowDirFiles; 
    } else {
      if (this.showDir.file_id != dir_id) return;
    }

    let order = StoreSetting.uiFileOrder;
    const orderduli = StoreSetting.uiFileOrderDuli;
    if (orderduli != '') {
      order = orderduli;
      const duli = localStorage.getItem(this.user_id + '-' + dir_id);
      if (duli) order = duli;
    }
    let dirlist: IStatePanFile[] = [];
    let filelist: IStatePanFile[] = [];
    const user_id = this.user_id;
    const drive_id = this.drive_id;
    const getDirSize = (file_id: string) => {
      if (StoreSetting.uiFolderSize == false) return 0;
      let size = RootDirSize.get(file_id) || 0;
      const finddir = RootDirMap.get(user_id + drive_id + file_id);
      if (finddir) {
        for (let c = 0; c < finddir.childrendir.length; c++) {
          size += getDirSize(finddir.childrendir[c]);
        }
      }
      return size;
    };
    const isloading = this.showDir.loading > 0;
    for (const item of items) {
      if (item.isDir) {
        
        item.size = isloading ? 0 : getDirSize(item.file_id);
        item.sizestr = isloading ? '0' : format.humanStorageSize(item.size);
        dirlist.push(item);
      } else filelist.push(item); 
    }
    if (isloading) {
      if (filelist.length > 0) dirlist.push(...filelist); 
    } else if (StoreSetting.uiFolderOrder) {
      if (filelist.length > 0) dirlist.push(...filelist);
      if (dirlist.length > 0) dirlist = GetSorterFileList(dirlist, order.split(' ')[0], order.indexOf('asc') > 0);
    } else {
      if (dirlist.length > 0) dirlist = GetSorterFileList(dirlist, order.split(' ')[0], order.indexOf('asc') > 0);
      if (filelist.length > 0) filelist = GetSorterFileList(filelist, order.split(' ')[0], order.indexOf('asc') > 0);
      if (filelist.length > 0) dirlist.push(...filelist);
    }

    Object.freeze(dirlist);
    ShowDirFiles = dirlist; 
    this.showDir = Object.assign({}, this.showDir);
  }

  @Mutation //点击右侧文件列表，选中文件
  mChangSelectedFile({ file_id, ctrl, shift }: { file_id: string; ctrl: boolean; shift: boolean }) {
    this.refreshDirFileTime = 0; 
    if (file_id === 'all') {
      this.selectedFileLast = '';
      const s = new Map<string, boolean>();
      if (this.selectedFiles.size != ShowDirFiles.length) {
        
        const children = ShowDirFiles;
        for (let i = 0; i < children.length; i++) {
          s.set(children[i].file_id, true);
        }
      }
      this.selectedFiles = s;
    } else {
      if (shift) {
       
        if (this.selectedFileLast == '' || this.selectedFileLast == file_id) {
          ctrl = true;
        } else {
         
          const s = new Map(this.selectedFiles);
          const children = ShowDirFiles;
          let a = -1;
          let b = -1;
          for (let i = 0; i < children.length; i++) {
            if (children[i].file_id == file_id) a = i;
            if (children[i].file_id == this.selectedFileLast) b = i;
            if (a > 0 && b > 0) break;
          }
          if (a < 0 || b < 0 || a == b) {
            ctrl = true;
          } else {
            if (a > b) [a, b] = [b, a]; 
            for (let n = a; n <= b; n++) {
              s.set(children[n].file_id, true);
            }
            this.selectedFileLast = file_id;
            Object.freeze(s);
            this.selectedFiles = s;
            return;
          }
        }
      }

      if (ctrl) {
        
        if (this.selectedFiles.has(file_id)) this.selectedFiles.delete(file_id);
        else this.selectedFiles.set(file_id, true);
        this.selectedFileLast = file_id;
        return;
      }
      
      if (file_id == '' || this.selectedFiles.has(file_id)) this.selectedFiles = new Map<string, boolean>();
      else this.selectedFiles = new Map<string, boolean>([[file_id, true]]);

      this.selectedFileLast = file_id;
    }
  }

  @Mutation 
  mChangSelectedFileRang(filelist: string[]) {
    this.selectedFileLast = '';
    const s = new Map(this.selectedFiles);
    for (let i = 0; i < filelist.length; i++) {
      s.set(filelist[i], true);
    }
    this.selectedFiles = s;
    this.rangSelect = false;
  }

  @Mutation 
  mClearSelectedFile() {
    this.selectedFiles = new Map<string, boolean>();
    this.refreshDirFileTime = 0;
    this.selectedFileLast = '';
  }

  @Mutation
  mRangSelect(israng: boolean) {
    this.rangSelect = israng;
  }

  @Mutation 
  mRenameFiles({ files, names }: { files: string[]; names: string[] }) {
    this.refreshDirFileTime = 0;
    

    for (let i = 0; i < files.length; i++) {
      const file_id = files[i];
      for (let j = 0; j < ShowDirFiles.length; j++) {
        if (ShowDirFiles[j].file_id == file_id) {
          ShowDirFiles[j].name = names[i]; 
          break;
        }
      }
    }

    this.showDir = Object.assign({}, this.showDir); 
    
    let hasdir = false;
    for (let i = 0; i < files.length; i++) {
      const child = RootDirMap.get(this.user_id + this.drive_id + files[i]);
      if (child) {
        hasdir = true;
        child.name = names[i];
      }
    }
    if (hasdir) StoreRoot.mChangDirTree();
  }

  @Mutation 
  mDeleteFiles({ parentid, files }: { parentid: string; files: string[] }) {
    
    if (parentid == this.showDir.file_id) {
      const newlist: IStatePanFile[] = [];
      for (let j = 0; j < ShowDirFiles.length; j++) {
        const file_id = ShowDirFiles[j].file_id;
        if (files.indexOf(file_id) == -1) newlist.push(ShowDirFiles[j]);
      }
      Object.freeze(newlist);
      ShowDirFiles = newlist;
      this.showDir = Object.assign({}, this.showDir); 
    }
    
    const parentdir = RootDirMap.get(this.user_id + this.drive_id + parentid);
    if (parentdir) {
      const list = [];
      for (let i = 0; i < parentdir.childrendir.length; i++) {
        if (files.includes(parentdir.childrendir[i]) == false) list.push(parentdir.childrendir[i]);
      }
      parentdir.childrendir = list; 
      StoreRoot.mChangDirTree();
    }
  }

  @Mutation 
  mFavorFiles({ isFavor, files }: { isFavor: boolean; files: string[] }) {
    this.refreshDirFileTime = 0;

    for (let i = 0; i < files.length; i++) {
      const file_id = files[i];
      for (let j = 0; j < ShowDirFiles.length; j++) {
        if (ShowDirFiles[j].file_id == file_id) {
          ShowDirFiles[j].starred = isFavor; 
          break;
        }
      }
    }
    this.showDir = Object.assign({}, this.showDir); 
  }

  @Action 
  aDirDetail(dir_id: string) {
    if (dir_id == '' || dir_id == 'favorite' || dir_id == 'trash') return;
    if (loadSync[dir_id]) return;
    const loadDir = async (user_id: string, drive_id: string, dir_id: string, token: ITokenInfo) => {
      loadSync[dir_id] = true;
      let data = { next_marker: 'error', items: [] as IStatePanFile[] };
      const items = await SQL.GetFileByDir(user_id, drive_id, dir_id);
      if (items == undefined || items.loading == 1629795158000) {
        data = await AliFileList.ApiFileList(drive_id, dir_id, '', token);
        if (data.next_marker == '') {
          StoreRoot.mLoadDirList({ parentid: dir_id, children: data.items }); 
          StoreRoot.aRefreshDirSize(dir_id);
        }
      } else {
        data.items = items.filelist;
        data.next_marker = '';
      }

      if (data.next_marker == '') {
        const plist: Promise<void>[] = [];
        for (let i = 0; i < data.items.length; i++) {
          if (data.items[i].isDir) plist.push(loadDir(user_id, drive_id, data.items[i].file_id, token));
        }
        await Promise.all(plist);
      }
      if (loadSync[dir_id]) delete loadSync[dir_id];
    };
    const token = Object.assign({}, StoreUser.tokeninfo);
    loadDir(this.user_id, this.drive_id, dir_id, token);
  }

  @Action 
  async aRefreshDirSize(dir_id: string) {
    if (dir_id == 'favorite' || dir_id == 'trash') return;
    if (StoreSetting.uiFolderSize === false) return;
    const list = await SQL.GetDirSize(this.user_id, this.drive_id, dir_id);
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      RootDirSize.set(item.file_id, item.size);
    }
  }

  @Action 
  aRefreshEvent() {
    if (this.user_id == '') return;
    StoreRoot.mRefreshEvent(this.refreshDirFileTime + 1);
    if (this.refreshDirFileTime < 480) {
      return;
    }
    StoreRoot.mRefreshEvent(0);
    StoreRoot.aRefreshDirSize('');
    const file_id = this.showDir.file_id;
    const drive_id = this.showDir.drive_id;
    const token = Object.assign({}, StoreUser.tokeninfo);
    if (window.WinMsgToUI) {
      
      window.WinMsgToUI({ cmd: 'LoadAllDirFiles', token, items: [{ drive_id, file_id }] });
    }
  }

  @Mutation
  mRefreshEvent(time: number) {
    this.refreshDirFileTime = time;
  }
  @Mutation 
  mTreeLoading(time: number) {
    this.refreshDirTreeTime = time;
  }
}
