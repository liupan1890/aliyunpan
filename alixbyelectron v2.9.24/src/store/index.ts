import { store } from 'quasar/wrappers';
import { getModule } from 'vuex-module-decorators';
import { createStore } from 'vuex';
import db from './db';
import sql from './sql';
import Config from './config';
import Setting from './setting';
import Root from './root';
import Pic from './pic';
import UI from './ui';
import User from './user';
import Down from './down';
import Upload from './upload';

export const DB = db;
export const SQL = sql;
export const Store = createStore({
  modules: {
    Config,
    Setting,
    Root,
    Pic,
    UI,
    User,
    Down,
    Upload,
  },
  strict: !!process.env.DEBUGGING,
});
window.$Store = Store;
export const StoreConfig = getModule(Config, Store);
export const StoreSetting = getModule(Setting, Store);
export const StoreRoot = getModule(Root, Store);
export const StorePic = getModule(Pic, Store);
export const StoreUI = getModule(UI, Store);
export const StoreUser = getModule(User, Store);
export const StoreDown = getModule(Down, Store);
export const StoreUpload = getModule(Upload, Store);

let eventtime = 1;
export const BootStore = function () {
  setTimeout(() => {
    Store.dispatch('Setting/aLoadFromDB').then(() => {
      sql.init().then(() => {
        DB.updateToSql();
      });
      Store.dispatch('UI/aLoadFromDB');
      Store.dispatch('User/aLoadFromDB');
      Store.dispatch('Down/aLoadFromDB');
      Store.dispatch('Upload/aLoadFromDB');
      console.log('BootStore');
      if (window.WinMsgToUI) {
        window.WinMsgToUI({ cmd: 'CacheServer' });
        window.WinMsgToUI({ cmd: 'UploadServer' });
      }
    });
  }, 1000);

  function downevent() {
    try {
      eventtime++;
      if (eventtime > 86400) eventtime = 1;
      Store.dispatch('Root/aRefreshEvent');
      if (eventtime % 600 == 500) {
        Store.dispatch('User/aRefreshAllUser');
      }
      Store.dispatch('Down/aSpeedEvent').catch((e) => {
        console.log(e);
      });
    } catch {}
    setTimeout(() => {
      downevent();
    }, 1000);
  }
  setTimeout(() => {
    downevent();
  }, 3000);
};

export default store(function (/* { ssrContext } */) {
  return Store;
});
