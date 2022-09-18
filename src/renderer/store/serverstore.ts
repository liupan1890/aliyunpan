import { defineStore } from 'pinia'


export interface IShareSiteModel {
  title: string
  url: string
  tip: string
}

export interface ServerState {
  
  ShareSiteList: IShareSiteModel[]
  HelpUrl: string
}

const useServerStore = defineStore('serverstore', {
  state: (): ServerState => ({
    ShareSiteList: [],
    HelpUrl: 'aHR0cHM6Ly9naXRodWIuY29tL2xpdXBhbjE4OTAvYWxpeXVucGFuL3dpa2k='
  }),
  actions: {
    
    mSaveShareSiteList(ShareSiteList: IShareSiteModel[]) {
      this.ShareSiteList = ShareSiteList || []
    },
    
    mSaveHelpUrl(url: string) {
      this.HelpUrl = url || 'aHR0cHM6Ly9naXRodWIuY29tL2xpdXBhbjE4OTAvYWxpeXVucGFuL3dpa2k='
    }
  }
})

export default useServerStore
