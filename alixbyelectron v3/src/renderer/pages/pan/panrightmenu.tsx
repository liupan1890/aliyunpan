import { Menu } from 'antd'
import { ShowCopyMoveModal } from './copymovemodal'
import { menuFileColorChange, topRestoreSelectFile, topTrashDeleteSelectFile } from './filemenu'

export function FileColorMenu(isOnTree: boolean) {
  return (
    <Menu.SubMenu
      key="biaoji"
      title="标记颜色　"
      icon={<i className="iconfont iconcheckbox-full" />}
      onTitleClick={(e) => {
        e.domEvent.stopPropagation()
        e.domEvent.preventDefault()
      }}>
      <Menu.Item key="biaoji1" onClick={() => menuFileColorChange(isOnTree, '#df5659')} icon={<i className="iconfont iconcheckbox-full" style={{ fontSize: '19px', color: '#df5659' }} />}>
        鹅冠红
      </Menu.Item>
      <Menu.Item key="biaoji2" onClick={() => menuFileColorChange(isOnTree, '#9c27b0')} icon={<i className="iconfont iconcheckbox-full" style={{ fontSize: '19px', color: '#9c27b0' }} />}>
        兰花紫
      </Menu.Item>
      <Menu.Item key="biaoji4" onClick={() => menuFileColorChange(isOnTree, '#42a5f5')} icon={<i className="iconfont iconcheckbox-full" style={{ fontSize: '19px', color: '#42a5f5' }} />}>
        晴空蓝
      </Menu.Item>
      <Menu.Item key="biaoji5" onClick={() => menuFileColorChange(isOnTree, '#00bc99')} icon={<i className="iconfont iconcheckbox-full" style={{ fontSize: '19px', color: '#00bc99' }} />}>
        竹叶青
      </Menu.Item>
      <Menu.Item key="biaoji6" onClick={() => menuFileColorChange(isOnTree, '#4caf50')} icon={<i className="iconfont iconcheckbox-full" style={{ fontSize: '19px', color: '#4caf50' }} />}>
        宝石绿
      </Menu.Item>
      <Menu.Item key="biaoji7" onClick={() => menuFileColorChange(isOnTree, '#ff9800')} icon={<i className="iconfont iconcheckbox-full" style={{ fontSize: '19px', color: '#ff9800' }} />}>
        金盏黄
      </Menu.Item>
      <Menu.Item key="biaoji9" onClick={() => menuFileColorChange(isOnTree, '')} icon={<i className="iconfont iconcheckbox-full" style={{ fontSize: '19px' }} />}>
        取消颜色
      </Menu.Item>
    </Menu.SubMenu>
  )
}
export function FileCopyMenu(isOnTree: boolean, drive_id: string) {
  return (
    <Menu.SubMenu
      key="fuzhi2"
      title="复制移动　"
      icon={<i className="iconfont iconcopy" />}
      onTitleClick={(e) => {
        e.domEvent.stopPropagation()
        e.domEvent.preventDefault()
      }}>
      <Menu.Item key="fuzhidao" icon={<i className="iconfont iconcopy" style={{ fontSize: '19px' }} />} onClick={() => ShowCopyMoveModal(drive_id, isOnTree, 'copy')}>
        复制到...
      </Menu.Item>
      <Menu.Item key="yidongdao" icon={<i className="iconfont iconscissor" style={{ fontSize: '19px' }} />} onClick={() => ShowCopyMoveModal(drive_id, isOnTree, 'move')}>
        移动到...
      </Menu.Item>
    </Menu.SubMenu>
  )
}
export function TrashMenu(isOnTrash: boolean) {
  return (
    <Menu mode="vertical" style={{ display: isOnTrash ? '' : 'none' }} selectedKeys={[]} prefixCls="ptm ant-dropdown-menu">
      <Menu.Item key="huifu" icon={<i className="iconfont iconrecover" />} onClick={() => topRestoreSelectFile()}>
        恢复选中
      </Menu.Item>
      <Menu.Item key="chedi" icon={<i className="iconfont icondelete" />} onClick={() => topTrashDeleteSelectFile()}>
        彻底删除
      </Menu.Item>
    </Menu>
  )
}
