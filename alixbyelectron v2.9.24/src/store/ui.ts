import { VuexModule, Module, Mutation, Action } from 'vuex-module-decorators';
import { DB } from '.';

interface IStateUI {
  headertag: string; 
  tabsprimary: string; 

  leftMenuActiveColor: string; 
  leftMenuActivebgColor: string; 

  uiheaderindex: string; 
  uiheaderindexpan: string; 
  uiheaderindexpic: string; 
  uiheaderindexdown: string; 
  uiheaderindexrss: string; 
  uiheaderindexshare: string; 

  fileColor: Map<string, string>;
}


@Module({ namespaced: true, name: 'UI', stateFactory: true })
export default class UI extends VuexModule implements IStateUI {
  public uiheaderindexpan = '/pan';
  public uiheaderindexpic = '/pic';
  public uiheaderindexdown = '/down/DowningList';
  public uiheaderindexrss = '/rss/RssSearch';
  public uiheaderindexshare = '/share/MyShare';
  public uiheaderindex = '/pan';

  public headertag = 'bg-white col-12'; 
  public tabsprimary = 'text-red'; 

  public leftMenuActiveColor = 'red-6'; 
  public leftMenuActivebgColor = 'red-1'; 

  public fileColor = new Map<string, string>();

  get gIsPanPage(): boolean {
    return this.uiheaderindex.indexOf('/pan') >= 0;
  }

  get gIsDowningPage(): boolean {
    return this.uiheaderindexdown.indexOf('DowningList') >= 0;
  }
  get gIsDownedPage(): boolean {
    return this.uiheaderindexdown.indexOf('DownedList') >= 0;
  }
  get gIsUploadingPage(): boolean {
    return this.uiheaderindexdown.indexOf('UploadingList') >= 0;
  }

  @Mutation
  mSaveUiheaderindexpan(val: string) {
    this.uiheaderindex = '/pan';
    this.uiheaderindexpan = val;
  }
  @Mutation
  mSaveUiheaderindexpic(val: string) {
    this.uiheaderindex = '/pic';
    this.uiheaderindexpic = val;
  }
  @Mutation
  mSaveUiheaderindexrss(val: string) {
    this.uiheaderindex = '/rss';
    this.uiheaderindexrss = val;
  }
  @Mutation
  mSaveUiheaderindexdown(val: string) {
    this.uiheaderindex = '/down';
    this.uiheaderindexdown = val;
  }
  @Mutation
  mSaveUiheaderindexshare(val: string) {
    this.uiheaderindex = '/share';
    this.uiheaderindexshare = val;
  }

  @Action({ commit: 'mLoadFromDB' })
  async aLoadFromDB() {
    return {
      fileColor: await DB.getValueObject('fileColor'),
    };
  }
  @Mutation
  mLoadFromDB(data: any) {
    if (data.fileColor) {
      const map = new Map<string, string>();
      for (const key in data.fileColor) {
        map.set(key, data.fileColor[key]);
      }
      this.fileColor = map;
    } else {
      this.fileColor = new Map<string, string>();
    }
  }

  @Mutation 
  mChangColor({ selectkeys, color }: { selectkeys: string[]; color: string }) {
    if (selectkeys === undefined || selectkeys.length == 0) return;
    if (color.length > 7) color = color.substr(0, 7);

    const s = new Map(this.fileColor);
    for (let i = 0; i < selectkeys.length; i++) {
      const file_id = selectkeys[i];
      if (color == '#000000') {
        s.delete(file_id);
      } else {
        color = color.replace('#', 'c');
        s.set(file_id, color);
      }
    }
    this.fileColor = s;
    const obj: { [k: string]: any } = {};
    for (const [k, v] of this.fileColor) {
      obj[k] = v;
    }
    DB.saveValueObject('fileColor', obj);
  }
}
