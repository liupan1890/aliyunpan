import React from 'react'
import { connect, GlobalModelState } from 'umi'
import './dark.css'
import './index.css'
import './pageleft.css'
import PageCode from './window/pagecode'
import PageImage from './window/pageimage'
import PageMain from './window/pagemain'
import PageHelp from './window/pagehelp'
import PageOffice from './window/pageoffice'
import PageVideoXBT from './window/pagevideoxbt'

class IndexPage extends React.Component {
  constructor(props: any) {
    super(props)
  }
  render() {
    const { global } = this.props as { global: GlobalModelState }
    if (global.showPage == 'pageMain') return <PageMain />
    else if (global.showPage == 'pageHelp') return <PageHelp />
    else if (global.showPage == 'pageOffice') return <PageOffice />
    else if (global.showPage == 'pageImage') return <PageImage />
    else if (global.showPage == 'pageCode') return <PageCode />
    else if (global.showPage == 'pageVideoXBT') return <PageVideoXBT />
    else if (global.showPage == 'pageWorker') return <div>pageWorker</div>
    else
      return (
        <div className="desktop-loading">
          <div className="desktop-loading-container">
            <img className="desktop-loading-img" src="https://gw.alicdn.com/imgextra/i3/O1CN01qJY8yD1Vbox6bZgxv_!!6000000002672-2-tps-72-72.png" alt="loading-img" />
          </div>
        </div>
      )
  }
}

function mapStateToProps({ global }: { global: GlobalModelState }) {
  return { global }
}
export default connect(mapStateToProps)(IndexPage)
