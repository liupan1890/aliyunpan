import { boot } from 'quasar/wrappers';
import { BootStore } from 'src/store';
import axios, { AxiosInstance } from 'axios';
import { WinMsg } from './winmsg';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
  }
}


const qpsMap = new Map();
const qpsController =
  (QPS = 30, OFFSET = 0) =>
  async (config: any) => {
    if (config.url.indexOf('api.aliyundrive') < 0) return config;

    const now = new Date().getTime();
    let { count, ts } = qpsMap.get(config.url) || {
      count: 1,
      ts: now,
    };
    if ((now / 1000) >> 0 <= (ts / 1000) >> 0) {
      if (count < QPS) {
        count++;
      } else {
        ts = 1000 * Math.ceil(ts / 1000 + 1);
        count = 1;
      }
    } else {
      ts = now;
      count = 1;
    }
    qpsMap.set(config.url, {
      count,
      ts,
    });
    let sleep = ts - now;
    sleep = sleep > 0 ? sleep + OFFSET : 0;
    if (sleep > 0) {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), sleep));
    }
    return config;
  };
axios.interceptors.request.use(qpsController());
axios.defaults.withCredentials = false;
export default boot(({ app }) => {

  app.config.globalProperties.$axios = axios;

  window.WinMsg = WinMsg;
  if (window.electronworker) return;
  BootStore();
});
