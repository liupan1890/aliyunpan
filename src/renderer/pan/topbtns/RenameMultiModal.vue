<script lang="ts">
import { modalCloseAll } from '../../utils/modal'
import { computed, defineComponent, h, reactive, ref, watch, watchEffect } from 'vue'
import MySwitchTab from '../../layout/MySwitchTab.vue'
import usePanFileStore from '../panfilestore'
import { AntTreeNodeDragEnterEvent, AntTreeNodeDropEvent, EventDataNode } from 'ant-design-vue/es/tree'
import { Tree as AntdTree } from 'ant-design-vue'
import 'ant-design-vue/es/tree/style/css'
import { usePanTreeStore, useWinStore } from '../../store'
import AliTrash from '../../aliapi/trash'
import message from '../../utils/message'
import AliFileCmd from '../../aliapi/filecmd'
import DebugLog from '../../utils/debuglog'
import { NewRenameConfigData, RunAllNode, RunReplaceName, TreeNodeData } from './renamemulti'
import PanDAL from '../pandal'
import { throttle } from '../../utils/debounce'
import { IAliGetFileModel } from '../../aliapi/alimodels'
import { treeSelectToExpand } from '../../utils/antdtree'

const iconfolder = h('i', { class: 'iconfont iconfile-folder' })
const foldericonfn = () => iconfolder
const fileiconfn = (icon: string) => h('i', { class: 'iconfont ' + icon })

export default defineComponent({
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    istree: {
      type: Boolean,
      required: true
    }
  },
  setup(props) {
    const okLoading = ref(false)
    const treeref = ref()
    const winStore = useWinStore()
    const TreeHeight = computed(() => winStore.height - 42 - 90)
    const switchvalues = [
      { key: 'replace', title: '替换', alt: '' },
      { key: 'delete', title: '删除', alt: '' },
      { key: 'add', title: '增加', alt: '' },
      { key: 'index', title: '编号', alt: '' },
      { key: 'others', title: '其他', alt: '' }
    ]
    const switchvalue = ref('replace')
    const handleSwitch = (val: string) => {
      switchvalue.value = val
      renameconfig.replace.enable = val == 'replace'
      renameconfig.delete.enable = val == 'delete'
      renameconfig.add.enable = val == 'add'
      renameconfig.index.enable = val == 'index'
      renameconfig.others.enable = val == 'others'
    }

    const replacedata = ref<string[]>([])
    const indexdata = [
      { label: '第#个 例如:第001个', value: '第#个' },
      { label: '(#) 例如:(001)', value: '(#)' },
      { label: '[#] 例如:[001]', value: '[#]' },
      { label: '#.  例如:001.', value: '#.' },
      { label: '#-  例如:001-', value: '#-' }
    ]
    const renameconfig = reactive(NewRenameConfigData())

    const TreeData = ref<TreeNodeData[]>([])
    const TreeExpandedKeys = ref<string[]>([])
    const TreeSelectedKeys = ref<string[]>([])
    const TreeCheckedKeys = ref<{ checked: string[]; halfChecked: string[] }>({ checked: [], halfChecked: [] })
    const CheckInfo = ref('')

    const onRunReplaceName = throttle(() => {
      RunReplaceName(renameconfig, TreeData.value, TreeCheckedKeys.value.checked)
    }, 300)

    watchEffect(() => {
      let checklen = TreeCheckedKeys.value.checked.length || 0
      let alllen = 0
      let matchlen = 0
      RunAllNode(TreeData.value, (node) => {
        alllen++
        if (node.ismatch) matchlen++
        return true
      })
      CheckInfo.value = '已选中 ' + checklen + ' 要替换 ' + matchlen + ' 总数 ' + alllen
      onRunReplaceName()
    })

    watch(renameconfig, onRunReplaceName)

    const onLoadData = (treeNode: EventDataNode) => {
      return new Promise<void>((resolve) => {
        if (treeNode.dataRef == undefined || treeNode.dataRef?.children?.length) {
          resolve()
          return
        }
        apiLoad(treeNode.dataRef.key).then((addlist) => {
          treeNode.dataRef!.children = addlist
          if (TreeData.value) TreeData.value = TreeData.value.concat()

          resolve()
        })
      })
    }

    const autoExpand = (list: TreeNodeData[]) => {
      if (list.length < 4) {
        setTimeout(() => {
          for (let i = 0, maxi = list.length; i < maxi; i++) {
            let item = list[i]
            if (item.isLeaf == false) {
              apiLoad(item.key).then((addlist) => {
                item.children = addlist
                if (TreeData.value) TreeData.value = TreeData.value.concat()
                if (TreeExpandedKeys.value) TreeExpandedKeys.value.push(item.key)
              })
            }
          }
        }, 200)
      }
    }

    const apiLoad = (key: any) => {
      let pantreeStore = usePanTreeStore()
      return AliTrash.ApiDirFileListNoLock(pantreeStore.user_id, pantreeStore.drive_id, key as string, '', 'name ASC')
        .then((resp) => {
          const addlist: TreeNodeData[] = []
          if (resp.next_marker == '') {
            for (let i = 0, maxi = resp.items.length; i < maxi; i++) {
              const item = resp.items[i]
              addlist.push({
                key: item.file_id,
                title: item.name,
                rawtitle: item.name,
                newtitle: item.name,
                children: [],
                isdir: item.isdir,
                isLeaf: !item.isdir,
                ismatch: false,
                icon: item.isdir ? foldericonfn : () => fileiconfn(item.icon)
              })
            }
            autoExpand(addlist)
          } else {
            message.error('列出文件失败：' + resp.next_marker)
          }
          if (addlist.length > 0) {
            setTimeout(() => {
              onRunReplaceName()
            }, 300)
          }
          return addlist
        })
        .catch(() => {
          return [] as TreeNodeData[]
        })
    }

    const handleOpen = () => {
      let cachereg = localStorage.getItem('renamemulti')
      if (cachereg) {
        let reglist:string[] = JSON.parse(cachereg)
        replacedata.value = reglist
      }

      
      let filelist: IAliGetFileModel[] = []

      console.log(props)
      if (props.istree) {
        const pantreeStore = usePanTreeStore()
        filelist = [{ ...pantreeStore.selectDir, isdir: true, ext: '', category: '', icon: '', sizestr: '', timestr: '', starred: false, thumbnail: '' }]
      } else {
        const panfileStore = usePanFileStore()
        filelist = panfileStore.GetSelected()
      }

      let data: TreeNodeData[] = []
      let checklist: string[] = []
      filelist.map((item) => {
        data.push({
          key: item.file_id,
          title: item.name,
          rawtitle: item.name,
          newtitle: item.name,
          children: [],
          isdir: item.isdir,
          isLeaf: !item.isdir,
          ismatch: false,
          icon: item.isdir ? foldericonfn : () => fileiconfn(item.icon)
        })

        checklist.push(item.file_id)
      })

      TreeData.value = data
      TreeCheckedKeys.value = { checked: checklist, halfChecked: [] }
    }
    const handleClose = () => {
      
      if (okLoading.value) okLoading.value = false
      switchvalue.value = 'replace'
      replacedata.value = []
      TreeData.value = []
      TreeExpandedKeys.value = []
      TreeSelectedKeys.value = []
      TreeCheckedKeys.value.checked = []
      renameconfig.show = false
      renameconfig.replace = { enable: true, search: '', newword: '', chkCase: true, chkAll: true, chkReg: false, applyto: 'name' }
      renameconfig.delete = { enable: false, type: 'search', search: '', chkCase: true, chkAll: true, chkReg: false, applyto: 'name', beginlen: 0, endlen: 0, beginword: '', endword: '' }
      renameconfig.add = { enable: false, type: 'position', search: '', before: '', after: '', beginword: '', endword: '', applyto: 'name' }
      renameconfig.index = { enable: false, type: 'begin', format: '', minlen: 1, beginindex: 1, minnum: 1 }
      renameconfig.others = { enable: false, nameformat: '', extformat: '', randomformat: '', randomlen: 4 }
    }

    const handleSelectTree = (type: string) => {
      let checklist: string[] = []

      TreeCheckedKeys.value = { checked: checklist, halfChecked: [] }
    }

    const handleTreeCheck = () => {
      onRunReplaceName()
    }

    const onDragEnter = (info: AntTreeNodeDragEnterEvent) => {}

    const onDrop = (info: AntTreeNodeDropEvent) => {
      const dropKey = info.node.key 
      const dragKey = info.dragNode.key 
      const dropPos = info.node.pos?.split('-') || []

      let frompos = info.dragNode.pos || ''
      if (frompos.indexOf('-') > 0) frompos = frompos.substring(0, frompos.lastIndexOf('-') + 1)
      let topos = info.node.pos || ''
      if (topos.indexOf('-') > 0) topos = topos.substring(0, topos.lastIndexOf('-') + 1)
      const isTop = frompos.indexOf(topos) == 0 && frompos.length == topos.length + 2
      console.log(frompos, info.dragNode, 'to', topos, info.node, info.dropPosition, dropPos, isTop)
      if (frompos != topos && !isTop) {
        message.warning('只能在同一个文件夹中拖放排序')
        return false
      }

      const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])
      const loop = (data: TreeNodeData[], key: string | number, callback: any) => {
        data.forEach((item, index) => {
          if (item.key === key) {
            return callback(item, index, data)
          }
          if (item.children) {
            return loop(item.children, key, callback)
          }
        })
      }
      const data = [...TreeData.value]

      

      let dragObj: TreeNodeData = data[0]
      loop(data, dragKey, (item: TreeNodeData, index: number, arr: TreeNodeData[]) => {
        arr.splice(index, 1)
        dragObj = item
      })
      let ar: TreeNodeData[] = []
      let i = 0
      loop(data, dropKey, (item: TreeNodeData, index: number, arr: TreeNodeData[]) => {
        if (isTop) ar = item.children
        else ar = arr
        i = index
      })
      console.log(dropPosition, ar, i)
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj)
      } else if (dropPosition === 0) {
        ar.splice(0, 0, dragObj)
      } else {
        ar.splice(i + 1, 0, dragObj)
      }

      TreeData.value = data
      onRunReplaceName()
    }

    return {
      okLoading,
      treeref,
      TreeHeight,
      handleOpen,
      handleClose,
      switchvalues,
      switchvalue,
      handleSwitch,
      replacedata,
      indexdata,
      renameconfig,
      TreeData,
      TreeExpandedKeys,
      TreeSelectedKeys,
      TreeCheckedKeys,
      treeSelectToExpand,
      handleTreeCheck,
      onLoadData,
      handleSelectTree,
      CheckInfo,
      onRunReplaceName,
      onDragEnter,
      onDrop
    }
  },
  methods: {
    handleHide() {
      if (this.okLoading == false) modalCloseAll()
      else {
        message.warning('批量重命名正在执行中，不能关闭窗口')
      }
    },
    handleOK(type: string) {
      let reg = ''
      if (this.renameconfig.replace.enable && this.renameconfig.replace.chkReg) reg = this.renameconfig.replace.search
      if (this.renameconfig.delete.enable && this.renameconfig.delete.chkReg) reg = this.renameconfig.delete.search

      if (reg) {
        let reglist: string[] = []
        let cachereg = localStorage.getItem('renamemulti')
        if (cachereg) reglist = JSON.parse(cachereg)
        if (!reglist.includes(reg)) {
          reglist.push(reg)
          localStorage.setItem('renamemulti', JSON.stringify(reglist))
        }
      }

      let idlist: string[] = []
      let namelist: string[] = []
      let checkmap = new Set(this.TreeCheckedKeys.checked)
      RunAllNode(this.TreeData, (node) => {
        
        let ismatch = node.newtitle && node.newtitle !== node.rawtitle && checkmap.has(node.key) 
        if (ismatch) {
          idlist.push(node.key)
          namelist.push(node.newtitle)
        }
        return true
      })
      if (idlist.length == 0) {
        message.error('没有需要重命名的文件!')
        return
      }
      this.okLoading = true
      let pantreeStore = usePanTreeStore()
      AliFileCmd.ApiRenameBatch(pantreeStore.user_id, pantreeStore.drive_id, idlist, namelist)
        .then((success) => {
          if (success.length > 0) {
            
            usePanTreeStore().mRenameFiles(success)
            
            usePanFileStore().mRenameFiles(success)
            
            PanDAL.RefreshPanTreeAllNode(pantreeStore.drive_id) 
            message.success('批量重命名 成功')
          } else {
            message.error('批量重命名 失败')
          }
        })
        .catch((err: any) => {
          message.error('批量重命名 失败', err.message || '')
          DebugLog.mSaveDanger('批量重命名失败 ', err)
        })
        .then(() => {
          this.okLoading = false
          modalCloseAll()
        })
    },
    handleContextMenu(menuKey: string, treeNodeKey: string) {
      if (menuKey == 'all') {
        let checklist: string[] = []
        
        RunAllNode(this.TreeData, (node) => {
          checklist.push(node.key)
          return true
        })
        
        if (checklist.length == this.TreeCheckedKeys.checked.length) checklist = []
        this.TreeCheckedKeys = { checked: checklist, halfChecked: [] }
        return
      }
      let checked = new Set(this.TreeCheckedKeys.checked)
      if (menuKey == 'selectall') {
        
        RunAllNode(this.TreeData, (node) => {
          if (node.key == treeNodeKey) {
            if (node.children) node.children.map((t) => checked.add(t.key))
            return false
          }
          return true
        })
      } else if (menuKey == 'selectnone') {
        
        RunAllNode(this.TreeData, (node) => {
          if (node.key == treeNodeKey) {
            if (node.children) {
              node.children.map((t) => {
                checked.delete(t.key)
              })
            }
            return false
          }
          return true
        })
      } else if (menuKey == 'selectfile') {
        
        RunAllNode(this.TreeData, (node) => {
          if (node.key == treeNodeKey) {
            if (node.children) {
              node.children.map((t) => {
                if (t.isdir) checked.delete(t.key)
                else checked.add(t.key)
              })
            }
            return false
          }
          return true
        })
      } else if (menuKey == 'selectfolder') {
        
        RunAllNode(this.TreeData, (node) => {
          if (node.key == treeNodeKey) {
            if (node.children) {
              node.children.map((t) => {
                if (t.isdir) checked.add(t.key)
                else checked.delete(t.key)
              })
            }
            return false
          }
          return true
        })
      }

      this.TreeCheckedKeys.checked = Array.from(checked)
    },
    handleSelectRow(visible: boolean, treeNodeKey: string) {
      if (visible) this.TreeSelectedKeys = [treeNodeKey]
    }
  },
  components: { MySwitchTab, AntdTree }
})
</script>

<template>
  <a-modal :visible="visible" fullscreen modal-class="modalclass renamemulti" @cancel="handleHide" @before-open="handleOpen" @close="handleClose" :footer="false" :unmount-on-close="true" :mask-closable="false">
    <template #title>
      <span class="modaltitle">批量重命名网盘文件</span>
    </template>
    <div class="modalbody" style="height: calc(100vh - 42px)">
      <a-layout style="height: 100%">
        <a-layout-sider class="renameleft" style="width: 300px">
          <div class="headswitch">
            <div class="bghr"></div>
            <div class="sw">
              <MySwitchTab :name="'panleft'" :tabs="switchvalues" :value="switchvalue" @update:value="handleSwitch" />
            </div>
          </div>
          <div class="renamelefttab">
            <a-tabs type="text" :direction="'horizontal'" class="hidetabs" :justify="true" :active-key="switchvalue">
              <a-tab-pane key="replace" title="1">
                <a-typography-text type="secondary"> 查找： </a-typography-text>
                <a-row style="margin-bottom: 16px">
                  <a-col flex="auto">
                    <a-auto-complete :data="replacedata" v-model="renameconfig.replace.search" style="width: 100%" placeholder="输入要查找的字符" allow-clear strict />
                  </a-col>
                </a-row>
                <a-row>
                  <a-col flex="auto">
                    <a-checkbox v-model="renameconfig.replace.chkCase">忽略大小写</a-checkbox>
                    <br />
                    <a-checkbox v-model="renameconfig.replace.chkAll">替换全部匹配项</a-checkbox>
                    <br />
                    <a-checkbox v-model="renameconfig.replace.chkReg">使用正则表达式</a-checkbox>
                  </a-col>
                </a-row>

                <div class="renamehr"><div class="renamehrline"></div></div>

                <a-typography-text type="secondary"> 替换成： </a-typography-text>
                <a-row style="margin-bottom: 16px">
                  <a-col flex="auto">
                    <a-input style="width: 100%" v-model="renameconfig.replace.newword" placeholder="输入新的字符" allow-clear />
                  </a-col>
                </a-row>

                <a-typography-text type="secondary"> 应用于： </a-typography-text>
                <a-row style="margin-bottom: 16px">
                  <a-col flex="auto">
                    <a-select size="small" style="width: 100%" v-model="renameconfig.replace.applyto">
                      <a-option value="full">文件名 + 扩展名　(name.mp4)</a-option>
                      <a-option value="name">仅在文件名中替换 (name)</a-option>
                      <a-option value="ext">仅在扩展名中替换 (.mp4)</a-option>
                    </a-select>
                  </a-col>
                </a-row>

                <a-row style="margin-top: 8px">
                  <a-col flex="none">
                    <a-button type="primary" size="small" tabindex="-1" :loading="okLoading" @click="() => handleOK('replace')">应用替换</a-button>
                  </a-col>
                  <a-col flex="auto"> </a-col>
                  <a-col flex="none">
                    <a-button type="outline" size="small" tabindex="-1" :loading="okLoading" @click="() => handleHide()">退出</a-button>
                  </a-col>
                </a-row>

                <div style="flex: auto"></div>
                <div class="footdesc">
                  <ol>
                    <li>右侧文件夹可点击展开</li>
                    <li>只有已勾选的才会重命名</li>
                  </ol>
                </div>
              </a-tab-pane>
              <a-tab-pane key="delete" title="2">
                <a-typography-text type="secondary"> 删除方式： </a-typography-text>
                <a-row :wrap="false">
                  <a-col flex="auto">
                    <a-select size="small" v-model="renameconfig.delete.type" style="width: 100%" placeholder="请选择">
                      <a-option value="search">删除指定字符</a-option>
                      <a-option value="position">删除指定位置</a-option>
                      <a-option value="range">删除指定区间</a-option>
                    </a-select>
                  </a-col>
                </a-row>
                <div class="renamehr"><div class="renamehrline"></div></div>
                <div v-if="renameconfig.delete.type == 'search'">
                  <a-typography-text type="secondary"> 查找： </a-typography-text>
                  <a-row style="margin-bottom: 16px">
                    <a-col flex="auto">
                      <a-auto-complete :data="replacedata" v-model="renameconfig.delete.search" style="width: 100%" placeholder="输入要查找的字符" allow-clear strict />
                    </a-col>
                  </a-row>
                  <a-row style="margin-bottom: 16px">
                    <a-col flex="auto">
                      <a-checkbox v-model="renameconfig.delete.chkCase">忽略大小写</a-checkbox>
                      <br />
                      <a-checkbox v-model="renameconfig.delete.chkAll">替换全部匹配项</a-checkbox>
                      <br />
                      <a-checkbox v-model="renameconfig.delete.chkReg">使用正则表达式</a-checkbox>
                    </a-col>
                  </a-row>
                </div>

                <div v-if="renameconfig.delete.type == 'position'">
                  <a-row style="margin-bottom: 16px; align-items: center" :wrap="false">
                    <a-col flex="none">
                      <a-typography-text type="secondary"> 从文件名开始删除 </a-typography-text>
                    </a-col>
                    <a-col flex="none">
                      <a-input-number size="small" v-model="renameconfig.delete.beginlen" style="width: 80px; margin: 0 4px" placeholder="长度" :min="0" :max="64" />
                    </a-col>
                    <a-col flex="none"> 个字 </a-col>
                    <a-col flex="auto"> </a-col>
                  </a-row>
                  <a-row style="margin-bottom: 16px; align-items: center" :wrap="false">
                    <a-col flex="none">
                      <a-typography-text type="secondary"> 从文件名结尾删除 </a-typography-text>
                    </a-col>
                    <a-col flex="none">
                      <a-input-number size="small" v-model="renameconfig.delete.endlen" style="width: 80px; margin: 0 4px" placeholder="长度" :min="0" :max="64" />
                    </a-col>
                    <a-col flex="none"> 个字 </a-col>
                    <a-col flex="auto"> </a-col>
                  </a-row>
                </div>

                <div v-if="renameconfig.delete.type == 'range'">
                  <a-typography-text type="secondary"> 查找删除a和b之间的字： </a-typography-text>
                  <a-row style="margin: 16px 0; align-items: center" :wrap="false">
                    <a-col flex="none">
                      <a-typography-text type="secondary"> a </a-typography-text>
                    </a-col>
                    <a-col flex="none">
                      <a-input size="small" v-model="renameconfig.delete.beginword" style="width: 100px; margin: 0 4px" placeholder="要查找的字" />
                    </a-col>
                    <a-col flex="auto"> </a-col>
                    <a-col flex="none"> b </a-col>
                    <a-col flex="none">
                      <a-input size="small" v-model="renameconfig.delete.endword" style="width: 100px; margin: 0 4px" placeholder="要查找的字" />
                    </a-col>
                  </a-row>
                </div>
                <a-typography-text type="secondary"> 应用于： </a-typography-text>
                <a-row style="margin-bottom: 16px">
                  <a-col flex="auto">
                    <a-select size="small" style="width: 100%" v-model="renameconfig.delete.applyto">
                      <a-option value="full">文件名 + 扩展名　(name.mp4)</a-option>
                      <a-option value="name">仅在文件名中删除 (name)</a-option>
                      <a-option value="ext">仅在扩展名中删除 (.mp4)</a-option>
                    </a-select>
                  </a-col>
                </a-row>

                <a-row style="margin-top: 8px">
                  <a-col flex="none">
                    <a-button type="primary" size="small" tabindex="-1" :loading="okLoading" @click="() => handleOK('delete')">应用删除</a-button>
                  </a-col>
                  <a-col flex="auto"> </a-col>
                  <a-col flex="none">
                    <a-button type="outline" size="small" tabindex="-1" :loading="okLoading" @click="() => handleHide()">退出</a-button>
                  </a-col>
                </a-row>
                <div style="flex: auto"></div>
                <div class="footdesc">
                  <ol>
                    <li>右侧文件夹可点击展开</li>
                    <li>只有已勾选的才会重命名</li>
                  </ol>
                </div>
              </a-tab-pane>
              <a-tab-pane key="add" title="3">
                <a-typography-text type="secondary"> 添加方式： </a-typography-text>
                <a-row :wrap="false">
                  <a-col flex="auto">
                    <a-select size="small" style="width: 100%" v-model="renameconfig.add.type" placeholder="请选择">
                      <a-option value="position">添加到指定位置</a-option>
                      <a-option value="search">添加到指定字符</a-option>
                    </a-select>
                  </a-col>
                </a-row>
                <div class="renamehr"><div class="renamehrline"></div></div>
                <div v-if="renameconfig.add.type == 'position'">
                  <a-row style="margin-bottom: 16px; align-items: center" :wrap="false">
                    <a-col flex="none">
                      <a-typography-text type="secondary" style="padding-right: 4px"> 文件名前添加 </a-typography-text>
                    </a-col>
                    <a-col flex="auto">
                      <a-input size="small" v-model="renameconfig.add.beginword" style="width: 100%" placeholder="请输入" />
                    </a-col>
                  </a-row>
                  <a-row style="margin-bottom: 16px; align-items: center" :wrap="false">
                    <a-col flex="none">
                      <a-typography-text type="secondary" style="padding-right: 4px"> 文件名后添加 </a-typography-text>
                    </a-col>
                    <a-col flex="auto">
                      <a-input size="small" v-model="renameconfig.add.endword" style="width: 100%" placeholder="请输入" />
                    </a-col>
                  </a-row>
                </div>
                <div v-if="renameconfig.add.type == 'search'">
                  <a-row style="margin-bottom: 16px; align-items: center" :wrap="false">
                    <a-col flex="none">
                      <a-typography-text type="secondary" style="padding-right: 4px"> 查找第一个 </a-typography-text>
                    </a-col>
                    <a-col flex="auto">
                      <a-input size="small" v-model="renameconfig.add.search" style="width: 100%" placeholder="请输入" />
                    </a-col>
                  </a-row>
                  <a-row style="margin-bottom: 16px; align-items: center" :wrap="false">
                    <a-col flex="none">
                      <a-typography-text type="secondary" style="padding-right: 4px"> 在之前添加 </a-typography-text>
                    </a-col>
                    <a-col flex="auto">
                      <a-input size="small" v-model="renameconfig.add.before" style="width: 100%" placeholder="请输入" />
                    </a-col>
                  </a-row>
                  <a-row style="margin-bottom: 16px; align-items: center" :wrap="false">
                    <a-col flex="none">
                      <a-typography-text type="secondary" style="padding-right: 4px"> 在之后添加 </a-typography-text>
                    </a-col>
                    <a-col flex="auto">
                      <a-input size="small" v-model="renameconfig.add.after" style="width: 100%" placeholder="请输入" />
                    </a-col>
                  </a-row>
                </div>
                <a-typography-text type="secondary"> 应用于： </a-typography-text>
                <a-row style="margin-bottom: 16px">
                  <a-col flex="auto">
                    <a-select size="small" style="width: 100%" v-model="renameconfig.add.applyto">
                      <a-option value="full">文件名 + 扩展名　(name.mp4)</a-option>
                      <a-option value="name">仅在文件名中添加 (name)</a-option>
                      <a-option value="ext">仅在扩展名中添加 (.mp4)</a-option>
                    </a-select>
                  </a-col>
                </a-row>
                <a-row style="margin-top: 8px">
                  <a-col flex="none">
                    <a-button type="primary" size="small" tabindex="-1" :loading="okLoading" @click="() => handleOK('add')">应用添加</a-button>
                  </a-col>
                  <a-col flex="auto"> </a-col>
                  <a-col flex="none">
                    <a-button type="outline" size="small" tabindex="-1" :loading="okLoading" @click="() => handleHide()">退出</a-button>
                  </a-col>
                </a-row>
                <div style="flex: auto"></div>
                <div class="footdesc">
                  <ol>
                    <li>右侧文件夹可点击展开</li>
                    <li>只有已勾选的才会重命名</li>
                  </ol>
                </div>
              </a-tab-pane>
              <a-tab-pane key="index" title="3">
                <a-typography-text type="secondary"> 给文件名增加编号： </a-typography-text>
                <a-row style="margin: 16px 0; align-items: center" :wrap="false">
                  <a-col flex="none">
                    <a-typography-text type="secondary"> 位置： </a-typography-text>
                  </a-col>
                  <a-col flex="auto">
                    <a-select size="small" v-model="renameconfig.index.type" style="width: 100%">
                      <a-option value="begin">文件名前面 01name.mp4</a-option>
                      <a-option value="end">文件名结尾 name01.mp4</a-option>
                    </a-select>
                  </a-col>
                </a-row>

                <a-row style="margin: 16px 0 0 0; align-items: center" :wrap="false">
                  <a-col flex="none">
                    <a-typography-text type="secondary"> 格式： </a-typography-text>
                  </a-col>
                  <a-col flex="auto">
                    <a-auto-complete :data="indexdata" v-model="renameconfig.index.format" placeholder="输入编号格式" allow-clear strict />
                  </a-col>
                </a-row>
                <div class="op"><span class="opred">说明：#代表编号</span></div>
                <a-row style="margin: 16px 0; align-items: center" :wrap="false">
                  <a-col flex="none">
                    <a-typography-text type="secondary"> 编号从几开始： </a-typography-text>
                  </a-col>
                  <a-col flex="none">
                    <a-input-number size="small" v-model="renameconfig.index.beginindex" style="width: 80px" placeholder="请输入" :min="1" />
                  </a-col>
                </a-row>
                <a-row style="margin: 16px 0; align-items: center" :wrap="false">
                  <a-col flex="none">
                    <a-typography-text type="secondary"> 编号每次增加： </a-typography-text>
                  </a-col>
                  <a-col flex="none">
                    <a-input-number size="small" v-model="renameconfig.index.minnum" style="width: 80px" placeholder="请输入" :min="1" />
                  </a-col>
                </a-row>

                <a-row style="margin-top: 16px; align-items: center" :wrap="false">
                  <a-col flex="none">
                    <a-typography-text type="secondary"> 编号最小长度： </a-typography-text>
                  </a-col>
                  <a-col flex="none">
                    <a-input-number size="small" v-model="renameconfig.index.minlen" style="width: 80px" placeholder="请输入" :min="1" :max="100" />
                  </a-col>
                </a-row>
                <div class="op" style="text-align: left"><span class="opred">填2，则编号为 '01'；填4，则编号为'0001'</span></div>

                <a-row style="margin-top: 8px" :wrap="false">
                  <a-col flex="none">
                    <a-button type="primary" size="small" tabindex="-1" :loading="okLoading" @click="() => handleOK('index')">应用编号</a-button>
                  </a-col>
                  <a-col flex="auto"> </a-col>
                  <a-col flex="none">
                    <a-button type="outline" size="small" tabindex="-1" :loading="okLoading" @click="() => handleHide()">退出</a-button>
                  </a-col>
                </a-row>

                <div style="flex: auto"></div>
                <div class="footdesc">
                  <ol>
                    <li>右侧文件夹可点击展开</li>
                    <li>只有已勾选的才会重命名</li>
                    <li class="oporg">右侧文件/文件夹可以拖动重新排序以重新编号</li>
                  </ol>
                </div>
              </a-tab-pane>
              <a-tab-pane key="others" title="3">
                <a-typography-text type="secondary"> 文件名大小写格式化： </a-typography-text>
                <a-row style="margin: 16px 0" :wrap="false">
                  <a-col flex="none">
                    <a-select
                      size="small"
                      :model-value="renameconfig.others.nameformat"
                      @update:modelValue="
                        (val:any) => {
                          renameconfig.others.extformat = ''
                          renameconfig.others.randomformat = ''
                          renameconfig.others.nameformat = val as string
                        }
                      "
                      style="width: 200px"
                      placeholder="请选择"
                    >
                      <a-option value="AA">AA (全部大写)</a-option>
                      <a-option value="aa">aa (全部小写)</a-option>
                      <a-option value="Aa">Aa 第一个单词首字母大写</a-option>
                      <a-option value="Aa Aa">Aa Aa 所有单词首字母大写</a-option>
                    </a-select>
                  </a-col>
                  <a-col flex="auto">
                    <a-button type="primary" size="small" tabindex="-1" :loading="okLoading" @click="() => handleOK('formatname')">应用</a-button>
                  </a-col>
                </a-row>
                <div class="renamehr"><div class="renamehrline"></div></div>
                <a-typography-text type="secondary"> 扩展名大小写格式化： </a-typography-text>
                <a-row style="margin: 16px 0" :wrap="false">
                  <a-col flex="none">
                    <a-select
                      size="small"
                      :model-value="renameconfig.others.extformat"
                      @update:modelValue="
                        (val:any) => {
                          renameconfig.others.nameformat = ''
                          renameconfig.others.randomformat = ''
                          renameconfig.others.extformat=val as string
                        }
                      "
                      style="width: 200px"
                      placeholder="请选择"
                    >
                      <a-option value="AA">AA 全部转换为大写</a-option>
                      <a-option value="aa">aa 全部转换为小写</a-option>
                    </a-select>
                  </a-col>
                  <a-col flex="auto">
                    <a-button type="primary" size="small" tabindex="-1" :loading="okLoading" @click="() => handleOK('formatext')">应用</a-button>
                  </a-col>
                </a-row>

                <div class="renamehr"><div class="renamehrline"></div></div>

                <a-typography-text type="secondary"> 生成随机文件名： </a-typography-text>
                <a-row style="margin: 16px 0; align-items: center">
                  <a-col flex="none">
                    <a-typography-text type="secondary"> 格式： </a-typography-text>
                  </a-col>
                  <a-col flex="auto">
                    <a-select
                      size="small"
                      :model-value="renameconfig.others.randomformat"
                      @update:modelValue="
                        (val:any) => {
                          renameconfig.others.nameformat = ''
                          renameconfig.others.extformat = ''
                          renameconfig.others.randomformat = val as string
                        }
                      "
                      style="width: 100%"
                      placeholder="请选择"
                    >
                      <a-option value="0-9a-z">随机 数字+小写字母</a-option>
                      <a-option value="0-9A-Z">随机 数字+大写字母</a-option>
                      <a-option value="0-9a-zA-Z">随机 数字+大小写字母</a-option>
                      <a-option value="0-9">随机 数字</a-option>
                      <a-option value="a-z">随机 小写字母</a-option>
                      <a-option value="A-Z">随机 大写字母</a-option>
                      <a-option value="a-zA-Z">随机 大小写字母</a-option>
                    </a-select>
                  </a-col>
                </a-row>

                <a-row style="margin: 16px 0; align-items: center" :wrap="false">
                  <a-col flex="none">
                    <a-typography-text type="secondary"> 长度： </a-typography-text>
                  </a-col>
                  <a-col flex="none">
                    <a-input-number size="small" v-model="renameconfig.others.randomlen" style="width: 80px" placeholder="长度" :min="4" :max="64" />
                  </a-col>
                  <a-col flex="auto"> </a-col>
                  <a-col flex="none">
                    <a-popconfirm content="警告：确定要把文件改名成随机名吗？" @ok="() => handleOK('random')">
                      <a-button type="primary" size="small" tabindex="-1" :loading="okLoading">应用</a-button>
                    </a-popconfirm>
                  </a-col>
                </a-row>
                <div class="renamehr"><div class="renamehrline"></div></div>
                <a-row style="margin-top: 8px" :wrap="false">
                  <a-col flex="auto"> </a-col>
                  <a-col flex="none">
                    <a-button type="outline" size="small" tabindex="-1" :loading="okLoading" @click="() => handleHide()">退出</a-button>
                  </a-col>
                </a-row>
                <div style="flex: auto"></div>
                <div class="footdesc">
                  <ol>
                    <li>右侧文件夹可点击展开</li>
                    <li>只有已勾选的才会重命名</li>
                  </ol>
                </div>
              </a-tab-pane>
            </a-tabs>
          </div>
        </a-layout-sider>
        <a-layout-content class="xbyright">
          <div style="height: 20px"></div>
          <div class="toppanbtns" style="height: 26px" tabindex="-1">
            <div class="toppanbtn">
              <a-button type="text" size="small" tabindex="-1" :disabled="okLoading" @click="onRunReplaceName()"> <i class="iconfont iconreload-1-icon" />刷新 </a-button>
              <a-button type="text" size="small" tabindex="-1" :disabled="okLoading" @click="handleContextMenu('all', '')"> <i class="iconfont iconfangkuang" />全选 </a-button>
            </div>
            <div style="padding-top: 3px; color: rgb(var(--primary-6)); flex-shrink: 0">{{ CheckInfo }}</div>
            <div style="flex-grow: 1"></div>
            <a-radio-group type="button" tabindex="-1" v-model="renameconfig.show" class="renameradio">
              <a-radio tabindex="-1" :value="false" title="高亮显示被替换的文字">高亮</a-radio>
              <a-radio tabindex="-1" :value="true" title="显示替换后的文件名">最终</a-radio>
            </a-radio-group>
            <div style="margin-right: 18px"></div>
          </div>
          <div style="height: 16px"></div>
          <div style="width: 100%; padding-right: 16px; overflow: hidden">
            <AntdTree
              :tabindex="-1"
              :focusable="false"
              ref="treeref"
              class="renametree"
              :checkable="true"
              blockNode
              selectable
              checkStrictly
              :autoExpandParent="false"
              showIcon
              :height="TreeHeight"
              :style="{ height: TreeHeight + 'px' }"
              :showLine="{ showLeafIcon: false }"
              @select="treeSelectToExpand"
              @check="handleTreeCheck"
              v-model:expandedKeys="TreeExpandedKeys"
              v-model:selectedKeys="TreeSelectedKeys"
              v-model:checkedKeys="TreeCheckedKeys"
              :treeData="TreeData"
              :loadData="onLoadData"
              draggable
              @dragenter="onDragEnter"
              @drop="onDrop"
            >
              <template #switcherIcon>
                <i class="ant-tree-switcher-icon iconfont Arrow" />
              </template>
              <template #title="{ dataRef }">
                <a-dropdown v-if="dataRef.isdir" class="smallmenu" :trigger="['contextMenu']" @select="(value:any)=>handleContextMenu(value,dataRef.key)" @popup-visible-change="(visible:boolean)=>handleSelectRow(visible,dataRef.key)">
                  <span :class="dataRef.ismatch ? 'match fulltitle' : 'fulltitle'" v-html="dataRef.title" title="点击鼠标右键菜单"></span>
                  <template #content>
                    <a-doption value="selectall">选则全部子项</a-doption>
                    <a-doption value="selectnone">反选全部子项</a-doption>
                    <a-doption value="selectfile">选则子文件</a-doption>
                    <a-doption value="selectfolder">选则子文件夹</a-doption>
                  </template>
                </a-dropdown>
                <span v-else :class="dataRef.ismatch ? 'match fulltitle' : 'fulltitle'" v-html="dataRef.title"></span>
              </template>
            </AntdTree>
          </div>
        </a-layout-content>
      </a-layout>
    </div>
  </a-modal>
</template>

<style>
.renamemulti .arco-modal-header {
  z-index: 2;
  height: 42px !important;
  padding: 3px 4px 2px 4px !important;
  color: var(--color-text-2);
  line-height: 37px !important;
  background: var(--color-menu-light-bg);
  box-shadow: var(--topshadow) 0px 2px 12px 0px;
  border-bottom: none !important;
}

.renamemulti .arco-modal-header,
.renamemulti .arco-modal-title {
  -webkit-app-region: drag;
}

.renamemulti .arco-modal-body {
  padding: 0 !important;
}

.renamemulti .renameleft .arco-layout-sider-children {
  display: flex;
  flex-direction: column;
}
.renamemulti .renamelefttab {
  flex-grow: 1;
  padding: 16px 20px;
}

.renamehr {
  width: 100%;
  padding: 16px 0;
  text-align: center;
}
.renamehr .renamehrline {
  width: 80%;
  margin: 0 auto;
  border-bottom: 1px dashed var(--color-neutral-4);
}

.renamemulti .arco-select-option-suffix {
  color: var(--color-neutral-3);
  font-size: 12px;
}

.renamemulti .op {
  text-align: right;
}
.renamemulti .op > span {
  font-size: 12px;
}

.toppanbtn .iconfont.iconwenjian {
  color: unset !important;
}
.renametree .ant-tree-title .match {
  color: rgba(var(--primary-6), 0.8);
}
.renametree .ant-tree-title i {
  color: green;
  font-style: normal;
  font-weight: bold;
  padding: 0 1px;
  background: #c8e6c9;
}

.renametree .ant-tree-title b {
  color: #e91e63;
  font-style: normal;
  font-weight: bold;
  padding: 0 3px;
  background: #f8bbd0;
  text-decoration: line-through;
}

.renametree .ant-tree-title s {
  color: #ff7d00;
  font-style: normal;
  font-weight: bold;
  padding: 0 3px;
  background: #f7e1bd;
  text-decoration: none;
}

.renamemulti .arco-radio-group-button {
  padding: 0;
  flex-shrink: 0;
  flex-grow: 0;
}

.renamemulti ol {
  padding-inline-start: 16px;
}

.renametree {
  border: 1px solid var(--color-neutral-3);
  padding: 4px;
}
.renametree .ant-tree-icon__customize .iconfont {
  font-size: 18px;
  margin-right: 2px;
}

.renamelefttab .arco-tabs-pane {
  display: flex;
  flex-direction: column;
}

.ant-tree-treenode-draggable {
  -webkit-user-drag: element !important;
}

.smallmenu .arco-dropdown-option {
  line-height: 26px !important;
}
.smallmenu.arco-dropdown-list-wrapper,
.smallmenu .arco-dropdown-list-wrapper {
  max-height: 300px !important;
  overflow-y: auto;
}

.renametree .ant-tree-node-content-wrapper {
  display: flex;
}

.renametree .ant-tree-node-content-wrapper .ant-tree-title {
  flex: auto;
}
.renametree .ant-tree-node-content-wrapper .ant-tree-title .fulltitle {
  width: 100%;
  display: inline-block;
}

.renameradio .arco-radio-button-content {
  line-height: 23px;
}
</style>
