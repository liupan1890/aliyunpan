import { EventDataNode } from 'ant-design-vue/es/tree'


export function treeSelectToExpand(keys: any[], info: { event: string; selected: Boolean; nativeEvent: MouseEvent; node: EventDataNode }) {
  let parent = info.nativeEvent.target as HTMLElement
  if (parent) {
    for (let i = 0; i < 10; i++) {
      if (parent.nodeName == 'DIV' && (parent.className == 'ant-tree-treenode' || parent.className.indexOf('ant-tree-treenode ') >= 0)) break
      if (parent.parentElement) parent = parent.parentElement
    }
    const children = parent.children
    if (children) {
      for (let i = 0, maxi = children.length; i < maxi; i++) {
        if (info.node.isLeaf) {
          
          if (children[i].className.indexOf('ant-tree-checkbox') >= 0) (children[i] as HTMLElement).click()
        } else {
          
          if (children[i].className.indexOf('ant-tree-switcher') >= 0) (children[i] as HTMLElement).click()
        }
      }
    }
  }
}
