<script lang="ts">
import { IAliGetFileModel } from '../../aliapi/alimodels'
import { modalCloseAll } from '../../utils/modal'
import { defineComponent, PropType, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import { usePanTreeStore } from '../../store'
import message from '../../utils/message'
import { copyToClipboard } from '../../utils/electronhelper'

import { Checkbox as AntdCheckbox } from 'ant-design-vue'
import 'ant-design-vue/es/checkbox/style/css'
import AliFileWalk from '../../aliapi/filewalk'

interface FileNodeData {
  file_id: string
  parent_file_id: string
  name: string
  time: number
  size: number
  isdir: boolean
}

interface ShowNodeData {
  name: string
  isdir: boolean
  nodes: ShowNodeData[]
}

function windowsTree(obj: ShowNodeData, showfile: boolean, showascii: boolean) {
  let format_str = showascii ? ['└─', '├─', '    ', '│  '] : ['\\---', '+---', '    ', '|   ']
  return obj.name + '\n' + windowsSubTree('', obj.nodes, showfile, format_str) + '\n'
}

function windowsSubTree(prefix: string, nodes: ShowNodeData[], showfile: boolean, format_str: string[]) {
  let strarry: string[] = []
  nodes = nodes.filter((t) => t.isdir == false).concat(nodes.filter((t) => t.isdir == true))
  let lastindex = nodes.length - 1
  let haschild = checkHasChildFile(nodes)
  for (let i = 0, maxi = nodes.length; i < maxi; i++) {
    let node = nodes[i]
    let new_prefix = ''

    
    if (node.isdir) {
      strarry.push(prefix + (i == lastindex ? format_str[0] : format_str[1]) + node.name + '\n')
      new_prefix = prefix + (haschild && i != lastindex ? format_str[3] : format_str[2])
      strarry.push(windowsSubTree(new_prefix, node.nodes, showfile, format_str))
    } else if (showfile) {
      strarry.push(prefix + (haschild ? format_str[3] : format_str[2]) + node.name + '\n')
      
      if (i == lastindex || nodes[i + 1].isdir) strarry.push(prefix + (haschild ? format_str[3] : format_str[2]) + '\n')
    }
  }
  return strarry.join('')
}

function checkHasChildFile(nodes: ShowNodeData[]) {
  for (let i = 0, maxi = nodes.length; i < maxi; i++) {
    let node = nodes[i]
    if (node.isdir && node.nodes.length > 0) return true
  }
  return false
}

function linuxTree(obj: ShowNodeData, showfile: boolean, showascii: boolean) {
  let format_str = showascii ? ['│   ', '├── ', '└── ', '    '] : ['│   ', '├── ', '└── ', '    ']
  return obj.name + '\n' + linuxSubTree('', obj.nodes, showfile, format_str) + '\n'
}

function linuxSubTree(prefix: string, nodes: ShowNodeData[], showfile: boolean, format_str: string[]) {
  let strarry: string[] = []
  nodes = nodes.filter((t) => t.isdir == false).concat(nodes.filter((t) => t.isdir == true))
  let lastindex = nodes.length - 1
  for (let i = 0, maxi = nodes.length; i < maxi; i++) {
    let node = nodes[i]
    let new_prefix = ''

    
    if (node.isdir) {
      strarry.push(prefix + (i == lastindex ? format_str[2] : format_str[1]) + node.name + '\n')
      new_prefix = prefix + (i == lastindex ? format_str[3] : format_str[0])
      strarry.push(linuxSubTree(new_prefix, node.nodes, showfile, format_str))
    } else if (showfile) {
      strarry.push(prefix + (i == lastindex ? format_str[2] : format_str[1]) + node.name + '\n')
    }
  }
  return strarry.join('')
}

function pathTree(obj: ShowNodeData, showfile: boolean, sepchar: string) {
  return obj.name + '\n' + pathSubTree(obj.name, obj.nodes, showfile, sepchar) + '\n'
}

function pathSubTree(prefix: string, nodes: ShowNodeData[], showfile: boolean, sepchar: string) {
  let strarry: string[] = []
  nodes = nodes.filter((t) => t.isdir == false).concat(nodes.filter((t) => t.isdir == true))
  let lastindex = nodes.length - 1
  for (let i = 0, maxi = nodes.length; i < maxi; i++) {
    let node = nodes[i]
    let new_prefix = ''

    
    if (node.isdir) {
      strarry.push(prefix + sepchar + node.name + '\n')
      new_prefix = prefix + sepchar + node.name
      strarry.push(pathSubTree(new_prefix, node.nodes, showfile, sepchar))
    } else if (showfile) {
      strarry.push(prefix + sepchar + node.name + '\n')
    }
  }
  return strarry.join('')
}

export default defineComponent({
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    filelist: {
      type: Array as PropType<IAliGetFileModel[]>,
      required: true
    }
  },
  components: {
    AntdCheckbox
  },
  setup(props) {
    const treeLoading = ref(false)
    const formRef = ref()
    const form = reactive({
      treecontent: '',
      showlinux: 'win',
      showfile: 'file',
      showline: 'ascii',
      treeinfo: ''
    })

    let drive_id = ''
    let file_id = ''
    let file_name = ''
    
    let DirMap: Map<string, FileNodeData> = new Map<string, FileNodeData>()
    
    let ChildrenDirMap: Map<string, FileNodeData[]> = new Map<string, FileNodeData[]>()
    let ChildrenFileMap: Map<string, FileNodeData[]> = new Map<string, FileNodeData[]>()
    let TreeData: ShowNodeData = { name: file_name, isdir: true, nodes: [] }
    const handleOpen = () => {
      
      let file = props.filelist[0]
      drive_id = file.drive_id
      file_id = file.file_id
      file_name = file.name
      TreeData = { name: file_name, isdir: file.isdir, nodes: [] }
      LoadFileTree()
    }

    const handleClose = () => {
      
      if (treeLoading.value) treeLoading.value = false
      form.treecontent = ''
      form.treeinfo = ''
    }

    const RefreshFileTree = () => {
      
      if (form.showline == 'path') {
        if (form.showlinux == 'win') {
          form.treecontent = pathTree(TreeData, form.showfile == 'file', '\\')
        } else {
          form.treecontent = pathTree(TreeData, form.showfile == 'file', '/')
        }
      } else {
        if (form.showlinux == 'win') {
          form.treecontent = windowsTree(TreeData, form.showfile == 'file', form.showline == 'ascii')
        } else {
          form.treecontent = linuxTree(TreeData, form.showfile == 'file', form.showline == 'ascii')
        }
      }
    }

    const LoadFileTree = () => {
      form.treecontent = ''
      form.treeinfo = ''
      
      if (TreeData.isdir == false) {
        form.treeinfo = '文件 1 个，文件夹 0 个'
        RefreshFileTree()
        return
      }
      treeLoading.value = true
      
      AliFileWalk.ApiWalkFileList(usePanTreeStore().user_id, drive_id, file_id, file_name, 'name asc', '', 5000)
        .then((dir) => {
          treeLoading.value = false
          if (!dir.next_marker) {
            if (dir.items.length == 5000) {
              message.error('文件夹内包含文件太多，已忽略5000条后面的数据', 10)
            }
            
            
            let root: FileNodeData = { file_id: file_id, parent_file_id: '', name: file_name, time: 0, size: 0, isdir: true }
            DirMap.set(root.file_id, root)
            ChildrenDirMap.set(root.file_id, [])
            ChildrenFileMap.set(root.file_id, [])
            
            let dircount = 0
            let filecount = 0
            try {
              let dirparentid: string = ''
              let fileparentid: string = ''
              let childdirlist: FileNodeData[] = [] 
              let childfilelist: FileNodeData[] = [] 
              let item: FileNodeData
              
              let children = dir.items
              for (let i = 0, maxi = children.length; i < maxi; i++) {
                item = children[i]
                if (item.isdir) {
                  dircount++
                  DirMap.set(item.file_id, item)
                  if (dirparentid != item.parent_file_id) {
                    if (ChildrenDirMap.has(item.parent_file_id)) {
                      childdirlist = ChildrenDirMap.get(item.parent_file_id)! 
                    } else {
                      childdirlist = [] 
                      ChildrenDirMap.set(item.parent_file_id, childdirlist) 
                    }
                    dirparentid = item.parent_file_id
                  }
                  childdirlist.push(item)
                } else {
                  filecount++
                  if (fileparentid != item.parent_file_id) {
                    if (ChildrenFileMap.has(item.parent_file_id)) {
                      childfilelist = ChildrenFileMap.get(item.parent_file_id)! 
                    } else {
                      childfilelist = [] 
                      ChildrenFileMap.set(item.parent_file_id, childfilelist) 
                    }
                    fileparentid = item.parent_file_id
                  }
                  childfilelist.push(item)
                }
              }
            } catch {}
            

            const convert = function (id: string): ShowNodeData | undefined {
              let dir = DirMap.get(id)
              if (!dir) return undefined
              let show: ShowNodeData = { name: dir.name, isdir: dir.isdir, nodes: [] }
              let dirs = ChildrenDirMap.get(id) || []
              for (let j = 0, maxj = dirs.length; j < maxj; j++) {
                let a = convert(dirs[j].file_id)
                if (a) show.nodes.push(a)
              }
              let files = ChildrenFileMap.get(id) || []
              for (let j = 0, maxj = files.length; j < maxj; j++) {
                show.nodes.push({ name: files[j].name, isdir: false, nodes: [] })
              }
              return show
            }
            TreeData = convert(file_id) || { name: file_name, isdir: true, nodes: [] }
            form.treeinfo = '文件 ' + filecount.toString() + ' 个，文件夹 ' + dircount.toString() + ' 个'
          } else {
            message.warning('解析文件失败 ' + dir.next_marker)
          }
          RefreshFileTree()
        })
        .catch(() => {
          treeLoading.value = false
        })
    }
    return { treeLoading, handleOpen, handleClose, LoadFileTree, RefreshFileTree, formRef, form, dayjs }
  },
  methods: {
    handleShowLinux(val: any) {
      this.form.showlinux = val
      this.RefreshFileTree()
    },
    handleShowFile(val: any) {
      this.form.showfile = val
      this.RefreshFileTree()
    },
    handleShowLine(val: any) {
      this.form.showline = val
      this.RefreshFileTree()
    },
    handleLoadFileTree() {
      if (this.treeLoading) {
        message.error('正在解析中...')
        return
      }
      this.LoadFileTree()
    },

    handleHide() {
      modalCloseAll()
    },
    handleOK() {
      if (this.form.treecontent) {
        copyToClipboard(this.form.treecontent)
        message.success('目录树已复制到剪切板')
      } else {
        message.error('新建文件失败 父文件夹错误')
      }
    }
  }
})
</script>

<template>
  <a-modal :visible="visible" modal-class="modalclass" @cancel="handleHide" @before-open="handleOpen" @close="handleClose" :footer="false" :unmount-on-close="true" :mask-closable="false">
    <template #title>
      <span class="modaltitle">复制目录树</span>
    </template>
    <div class="modalbody" style="width: 80vw; max-width: 860px; height: calc(80vh - 100px)">
      <a-form ref="formRef" :model="form" layout="vertical" style="height: 100%; display: flex">
        <a-row style="margin-bottom: 20px; align-items: center">
          <a-col flex="none">
            <a-button type="primary" size="small" :loading="treeLoading" @click="() => handleLoadFileTree()">解析文件</a-button>
          </a-col>
          <a-col flex="auto"></a-col>
          <a-col flex="none" style="text-align: right">风格:</a-col>
          <a-col flex="4px"></a-col>
          <a-col flex="none">
            <a-select size="small" tabindex="-1" :style="{ width: '96px' }" :disabled="treeLoading" :model-value="form.showlinux" @change="handleShowLinux">
              <a-option value="linux"> Linux </a-option>
              <a-option value="win"> Win10 </a-option>
            </a-select>
          </a-col>
          <a-col flex="12px"></a-col>
          <a-col flex="none" style="text-align: right">显示:</a-col>
          <a-col flex="4px"></a-col>
          <a-col flex="none">
            <a-select size="small" tabindex="-1" :style="{ width: '96px' }" :disabled="treeLoading" :model-value="form.showfile" @change="handleShowFile">
              <a-option value="file"> 文件 </a-option>
              <a-option value="folder"> 文件夹 </a-option>
            </a-select>
          </a-col>
          <a-col flex="12px"></a-col>
          <a-col flex="none" style="text-align: right">连接线:</a-col>
          <a-col flex="4px"></a-col>
          <a-col flex="none">
            <a-select size="small" tabindex="-1" :style="{ width: '90px' }" :disabled="treeLoading" :model-value="form.showline" @change="handleShowLine">
              <a-option value="ascii"> ├── </a-option>
              <a-option value="asni"> +--- </a-option>
              <a-option value="path"> 路径 </a-option>
            </a-select>
          </a-col>
          <a-col flex="12px"></a-col>
          <a-col flex="none" style="text-align: right">
            <a-button type="primary" size="small" :loading="treeLoading" @click="() => handleOK()">复制到剪切板</a-button>
          </a-col>
        </a-row>

        <a-form-item field="treecontent" label="解析出来的目录树：" class="textareafill">
          <a-textarea class="filetreecontent" v-model="form.treecontent" readonly placeholder="请先点击 解析文件 按钮" @keydown="(e) => e.stopPropagation()" />
        </a-form-item>
      </a-form>
    </div>
    <div class="modalfoot" style="width: 80vw">
      <div class="tips">{{ treeLoading ? '目录解析中...' : form.treeinfo }}</div>
      <div style="flex-grow: 1"></div>
      <a-button type="outline" size="small" @click="handleHide">关闭</a-button>
    </div>
  </a-modal>
</template>

<style>
.filetreecontent {
  word-break: keep-all;
  white-space: pre;
  overflow: auto;
}
</style>
