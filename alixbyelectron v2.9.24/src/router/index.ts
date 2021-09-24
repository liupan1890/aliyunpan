import { route } from 'quasar/wrappers';
import { Store } from 'src/store';
import { createRouter, createWebHashHistory, createWebHistory, RouteLocationNormalized } from 'vue-router';
import routes from './routes';

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    history: createHistory(process.env.MODE === 'ssr' ? void 0 : process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach((to, from) => {
    handleHeadTab(to);
    return true;
  });
  return Router;
});

function handleHeadTab(to: RouteLocationNormalized) {
  if (to.matched) {
    if (to.fullPath.startsWith('/pan')) {
      Store.commit('UI/mSaveUiheaderindexpan', to.fullPath);
    } else if (to.fullPath.startsWith('/pic')) {
      Store.commit('UI/mSaveUiheaderindexpic', to.fullPath);
    } else if (to.fullPath.startsWith('/rss')) {
      Store.commit('UI/mSaveUiheaderindexrss', to.fullPath);
    } else if (to.fullPath.startsWith('/down')) {
      Store.commit('UI/mSaveUiheaderindexdown', to.fullPath);
    } else if (to.fullPath.startsWith('/share')) {
      Store.commit('UI/mSaveUiheaderindexshare', to.fullPath);
    }
  }
}
