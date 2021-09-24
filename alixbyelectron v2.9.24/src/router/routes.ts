import { RouteRecordRaw } from 'vue-router';
import MainLayout from 'layouts/MainLayout.vue';
import PanLeft from 'src/pages/pan/PanLeft.vue';
import PanRight from 'src/pages/pan/PanRight.vue';
import PicLeft from 'src/pages/pic/PicLeft.vue';
import PicRight from 'src/pages/pic/PicRight.vue';
import DownLeft from 'src/pages/down/DownLeft.vue';
import DownRight from 'src/pages/down/DownRight.vue';
import DowningList from 'src/pages/down/DowningList.vue';
import DownedList from 'src/pages/down/DownedList.vue';
import UploadingList from 'src/pages/down/UploadingList.vue';
import UploadList from 'src/pages/down/UploadList.vue';
import RssLeft from 'src/pages/rss/RssLeft.vue';
import RssRight from 'src/pages/rss/RssRight.vue';
import RssSearch from 'src/pages/rss/RssSearch.vue';

import RssFileSync from 'src/pages/rss/RssFileSync.vue';
import RssFileScan from 'src/pages/rss/RssFileScan.vue';
import RssFileCopy from 'src/pages/rss/RssFileCopy.vue';
import RssOffline from 'src/pages/rss/RssOffline.vue';
import RssHelp from 'src/pages/rss/RssHelp.vue';

import ShareLeft from 'src/pages/share/ShareLeft.vue';
import ShareRight from 'src/pages/share/ShareRight.vue';
import MyShare from 'src/pages/share/MyShare.vue';
import OtherShare from 'src/pages/share/OtherShare.vue';
import RssShare from 'src/pages/share/RssShare.vue';
import RssSend from 'src/pages/share/RssSend.vue';
import RssLink from 'src/pages/share/RssLink.vue';

const routes: RouteRecordRaw[] = [
  {
    name: 'MainLayout',
    path: '/',
    component: MainLayout,
    children: [
      {
        name: 'default',
        path: '',
        redirect: { name: 'pan' },
      },
      {
        name: 'pan',
        path: 'pan',
        components: {
          Left: PanLeft,
          Right: PanRight,
        },
      },
      {
        name: 'pic',
        path: 'pic',
        components: {
          Left: PicLeft,
          Right: PicRight,
        },
      },
      {
        name: 'down',
        path: 'down',
        components: {
          Left: DownLeft,
          Right: DownRight,
        },
        redirect: { name: 'DowningList' },
        children: [
          {
            name: 'DowningList',
            path: 'DowningList',
            component: DowningList,
          },
          {
            name: 'DownedList',
            path: 'DownedList',
            component: DownedList,
          },
          {
            name: 'UploadingList',
            path: 'UploadingList',
            component: UploadingList,
          },
          {
            name: 'UploadList',
            path: 'UploadList',
            component: UploadList,
          },
        ],
      },
      {
        name: 'share',
        path: 'share',
        components: {
          Left: ShareLeft,
          Right: ShareRight,
        },
        redirect: { name: 'MyShare' },
        children: [
          {
            name: 'MyShare',
            path: 'MyShare',
            component: MyShare,
          },
          {
            name: 'OtherShare',
            path: 'OtherShare',
            component: OtherShare,
          },
          {
            name: 'RssShare',
            path: 'RssShare',
            component: RssShare,
          },
          {
            name: 'RssSend',
            path: 'RssSend',
            component: RssSend,
          },
          {
            name: 'RssLink',
            path: 'RssLink',
            component: RssLink,
          },
        ],
      },
      {
        name: 'rss',
        path: 'rss',
        components: {
          Left: RssLeft,
          Right: RssRight,
        },
        redirect: { name: 'RssSearch' },
        children: [
          {
            name: 'RssSearch',
            path: 'RssSearch',
            component: RssSearch,
          },

          {
            name: 'RssFileSync',
            path: 'RssFileSync',
            component: RssFileSync,
          },
          {
            name: 'RssFileScan',
            path: 'RssFileScan',
            component: RssFileScan,
          },
          {
            name: 'RssFileCopy',
            path: 'RssFileCopy',
            component: RssFileCopy,
          },

          {
            name: 'RssOffline',
            path: 'RssOffline',
            component: RssOffline,
          },
          {
            name: 'RssHelp',
            path: 'RssHelp',
            component: RssHelp,
          },
        ],
      },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue'),
  },
];

export default routes;
