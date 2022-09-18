<script lang="ts">
import { h } from 'vue'
import { useAppStore } from './store'
import PageLoading from './layout/PageLoading.vue'
import PageMain from './layout/PageMain.vue'
import './assets/global.css'
import './assets/fileitem.css'
import './assets/antd.css'
import PageVideoXBTVue from './layout/PageVideoXBT.vue'
import PageCode from './layout/PageCode.vue'
import PageOffice from './layout/PageOffice.vue'
import PageImage from './layout/PageImage.vue'
import PageHelp from './layout/PageHelp.vue'
import PageVideo from './layout/PageVideo.vue'
import PageWorker from './layout/PageWorker.vue'

export default {
  setup() {
    const appStore = useAppStore()

    return () => {
      if (appStore.appPage == 'PageMain') return h(PageMain)
      if (appStore.appPage == 'PageHelp') return h(PageHelp)
      if (appStore.appPage == 'PageOffice') return h(PageOffice)
      if (appStore.appPage == 'PageVideoXBT') return h(PageVideoXBTVue)
      if (appStore.appPage == 'PageCode') return h(PageCode)
      if (appStore.appPage == 'PageImage') return h(PageImage)
      if (appStore.appPage == 'PageVideo') return h(PageVideo)

      if (appStore.appPage == 'PageWorker') return h(PageWorker)

      return h(PageLoading)
    }
  }
}
</script>

<style></style>
