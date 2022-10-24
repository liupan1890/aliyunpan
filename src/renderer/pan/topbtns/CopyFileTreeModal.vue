<script lang="ts">
import { IAliGetFileModel } from '../../aliapi/alimodels'
import { modalCloseAll } from '../../utils/modal'
import { defineComponent, PropType, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import { usePanTreeStore } from '../../store'
import message from '../../utils/message'
import { copyToClipboard } from '../../utils/electronhelper'

import AliFileWalk from '../../aliapi/filewalk'

interface FileNodeData {
  file_id: string
  parent_file_id: string
  name: string
  time: number
  size: number
  isDir: boolean
}

interface ShowNodeData {
  name: string
  isDir: boolean
  nodes: ShowNodeData[]
}

function windowsTree(obj: ShowNodeData, showFile: boolean, showAscii: boolean) {
  const formatStr = showAscii ? ['└─', '├─', '    ', '│  '] : ['\\---', '+---', '    ', '|   ']
  return obj.name + '\n' + windowsSubTree('', obj.nodes, showFile, formatStr) + '\n'
}

function windowsSubTree(prefix: string, nodes: ShowNodeData[], showFile: boolean, formatStr: string[]) {
  const strArray: string[] = []
  nodes = nodes.filter((t) => t.isDir == false).concat(nodes.filter((t) => t.isDir == true))
  const lastIndex = nodes.length - 1
  const hasChild = checkHasChildFile(nodes)
  for (let i = 0, maxi = nodes.length; i < maxi; i++) {
    const node = nodes[i]
    let newPrefix = ''

    
    if (node.isDir) {
      strArray.push(prefix + (i == lastIndex ? formatStr[0] : formatStr[1]) + node.name + '\n')
      newPrefix = prefix + (hasChild && i != lastIndex ? formatStr[3] : formatStr[2])
      strArray.push(windowsSubTree(newPrefix, node.nodes, showFile, formatStr))
    } else if (showFile) {
      strArray.push(prefix + (hasChild ? formatStr[3] : formatStr[2]) + node.name + '\n')
      
      if (i == lastIndex || nodes[i + 1].isDir) strArray.push(prefix + (hasChild ? formatStr[3] : formatStr[2]) + '\n')
    }
  }
  return strArray.join('')
}

function checkHasChildFile(nodes: ShowNodeData[]) {
  for (let i = 0, maxi = nodes.length; i < maxi; i++) {
    const node = nodes[i]
    if (node.isDir && node.nodes.length > 0) return true
  }
  return false
}

function linuxTree(obj: ShowNodeData, showFile: boolean, showAscii: boolean) {
  const formatStr = showAscii ? ['│   ', '├── ', '└── ', '    '] : ['│   ', '├── ', '└── ', '    ']
  return obj.name + '\n' + linuxSubTree('', obj.nodes, showFile, formatStr) + '\n'
}

function linuxSubTree(prefix: string, nodes: ShowNodeData[], showFile: boolean, formatStr: string[]) {
  const strArray: string[] = []
  nodes = nodes.filter((t) => t.isDir == false).concat(nodes.filter((t) => t.isDir == true))
  const lastIndex = nodes.length - 1
  for (let i = 0, maxi = nodes.length; i < maxi; i++) {
    const node = nodes[i]
    let newPrefix = ''

    
    if (node.isDir) {
      strArray.push(prefix + (i == lastIndex ? formatStr[2] : formatStr[1]) + node.name + '\n')
      newPrefix = prefix + (i == lastIndex ? formatStr[3] : formatStr[0])
      strArray.push(linuxSubTree(newPrefix, node.nodes, showFile, formatStr))
    } else if (showFile) {
      strArray.push(prefix + (i == lastIndex ? formatStr[2] : formatStr[1]) + node.name + '\n')
    }
  }
  return strArray.join('')
}

function pathTree(obj: ShowNodeData, showFile: boolean, sepchar: string) {
  return obj.name + '\n' + pathSubTree(obj.name, obj.nodes, showFile, sepchar) + '\n'
}

function pathSubTree(prefix: string, nodes: ShowNodeData[], showFile: boolean, sepchar: string) {
  const strArray: string[] = []
  nodes = nodes.filter((t) => t.isDir == false).concat(nodes.filter((t) => t.isDir == true))
  for (let i = 0, maxi = nodes.length; i < maxi; i++) {
    const node = nodes[i]
    let newPrefix = ''

    
    if (node.isDir) {
      strArray.push(prefix + sepchar + node.name + '\n')
      newPrefix = prefix + sepchar + node.name
      strArray.push(pathSubTree(newPrefix, node.nodes, showFile, sepchar))
    } else if (showFile) {
      strArray.push(prefix + sepchar + node.name + '\n')
    }
  }
  return strArray.join('')
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

  setup(props) {
    const treeLoading = ref(false)
    const formRef = ref()
    const form = reactive({
      treeContent: '',
      showLinux: 'win',
      showFile: 'file',
      showLine: 'ascii',
      treeInfo: ''
    })

    let drive_id = ''
    let file_id = ''
    let file_name = ''
    
    const DirMap: Map<string, FileNodeData> = new Map<string, FileNodeData>()
    
    const ChildrenDirMap: Map<string, FileNodeData[]> = new Map<string, FileNodeData[]>()
    const ChildrenFileMap: Map<string, FileNodeData[]> = new Map<string, FileNodeData[]>()
    let treeData: ShowNodeData = { name: file_name, isDir: true, nodes: [] }
    const handleOpen = () => {
      
      const file = props.filelist[0]
      drive_id = file.drive_id
      file_id = file.file_id
      file_name = file.name
      treeData = { name: file_name, isDir: file.isDir, nodes: [] }
      LoadFileTree()
    }

    const handleClose = () => {
      
      if (treeLoading.value) treeLoading.value = false
      form.treeContent = ''
      form.treeInfo = ''
    }

    const RefreshFileTree = () => {
      
      if (form.showLine == 'path') {
        if (form.showLinux == 'win') {
          form.treeContent = pathTree(treeData, form.showFile == 'file', '\\')
        } else {
          form.treeContent = pathTree(treeData, form.showFile == 'file', '/')
        }
      } else {
        if (form.showLinux == 'win') {
          form.treeContent = windowsTree(treeData, form.showFile == 'file', form.showLine == 'ascii')
        } else {
          form.treeContent = linuxTree(treeData, form.showFile == 'file', form.showLine == 'ascii')
        }
      }
    }

    const LoadFileTree = () => {
      form.treeContent = ''
      form.treeInfo = ''
      
      if (treeData.isDir == false) {
        form.treeInfo = '文件 1 个，文件夹 0 个'
        RefreshFileTree()
        return
      }
      treeLoading.value = true
      
      AliFileWalk.ApiWalkFileList(usePanTreeStore().user_id, drive_id, file_id, file_name, 'name asc', '', 5000)
        .then((dir) => {
          treeLoading.value = false
          if (!dir.next_marker) {
            if (dir.items.length == 8000) {
              message.error('文件夹内包含文件太多，已忽略8000条后面的数据', 10)
            }
            
            
            const root: FileNodeData = { file_id: file_id, parent_file_id: '', name: file_name, time: 0, size: 0, isDir: true }
            DirMap.set(root.file_id, root)
            ChildrenDirMap.set(root.file_id, [])
            ChildrenFileMap.set(root.file_id, [])
            
            let dirCount = 0
            let fileCount = 0
            try {
              let dirParentID: string = ''
              let fileParentID: string = ''
              let childDirList: FileNodeData[] = [] 
              let childFileList: FileNodeData[] = [] 
              let item: FileNodeData
              
              const children = dir.items
              for (let i = 0, maxi = children.length; i < maxi; i++) {
                item = children[i]
                if (item.isDir) {
                  dirCount++
                  DirMap.set(item.file_id, item)
                  if (dirParentID != item.parent_file_id) {
                    if (ChildrenDirMap.has(item.parent_file_id)) {
                      childDirList = ChildrenDirMap.get(item.parent_file_id)! 
                    } else {
                      childDirList = [] 
                      ChildrenDirMap.set(item.parent_file_id, childDirList) 
                    }
                    dirParentID = item.parent_file_id
                  }
                  childDirList.push(item)
                } else {
                  fileCount++
                  if (fileParentID != item.parent_file_id) {
                    if (ChildrenFileMap.has(item.parent_file_id)) {
                      childFileList = ChildrenFileMap.get(item.parent_file_id)! 
                    } else {
                      childFileList = [] 
                      ChildrenFileMap.set(item.parent_file_id, childFileList) 
                    }
                    fileParentID = item.parent_file_id
                  }
                  childFileList.push(item)
                }
              }
            } catch {}
            

            const convert = function (id: string): ShowNodeData | undefined {
              const dir = DirMap.get(id)
              if (!dir) return undefined
              const show: ShowNodeData = { name: dir.name, isDir: dir.isDir, nodes: [] }
              const dirs = ChildrenDirMap.get(id) || []
              for (let j = 0, maxj = dirs.length; j < maxj; j++) {
                const a = convert(dirs[j].file_id)
                if (a) show.nodes.push(a)
              }
              const files = ChildrenFileMap.get(id) || []
              for (let j = 0, maxj = files.length; j < maxj; j++) {
                show.nodes.push({ name: files[j].name, isDir: false, nodes: [] } as ShowNodeData)
              }
              return show
            }
            treeData = convert(file_id) || { name: file_name, isDir: true, nodes: [] }
            form.treeInfo = '文件 ' + fileCount.toString() + ' 个，文件夹 ' + dirCount.toString() + ' 个'
          } else {
            message.warning('解析文件失败 ' + dir.next_marker.replace('TooManyWalkFolders', '包含太多子文件夹'))
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
      this.form.showLinux = val
      this.RefreshFileTree()
    },
    handleShowFile(val: any) {
      this.form.showFile = val
      this.RefreshFileTree()
    },
    handleShowLine(val: any) {
      this.form.showLine = val
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
      if (this.form.treeContent) {
        copyToClipboard(this.form.treeContent)
        message.success('目录树已复制到剪切板')
      } else {
        message.error('新建文件失败 父文件夹错误')
      }
    }
  }
})
</script>

<template>
  <a-modal :visible="visible" modal-class="modalclass" :footer="false" :unmount-on-close="true" :mask-closable="false" @cancel="handleHide" @before-open="handleOpen" @close="handleClose">
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
            <a-select size="small" tabindex="-1" :style="{ width: '96px' }" :disabled="treeLoading" :model-value="form.showLinux" @change="handleShowLinux">
              <a-option value="linux"> Linux </a-option>
              <a-option value="win"> Win10 </a-option>
            </a-select>
          </a-col>
          <a-col flex="12px"></a-col>
          <a-col flex="none" style="text-align: right">显示:</a-col>
          <a-col flex="4px"></a-col>
          <a-col flex="none">
            <a-select size="small" tabindex="-1" :style="{ width: '96px' }" :disabled="treeLoading" :model-value="form.showFile" @change="handleShowFile">
              <a-option value="file"> 文件 </a-option>
              <a-option value="folder"> 文件夹 </a-option>
            </a-select>
          </a-col>
          <a-col flex="12px"></a-col>
          <a-col flex="none" style="text-align: right">连接线:</a-col>
          <a-col flex="4px"></a-col>
          <a-col flex="none">
            <a-select size="small" tabindex="-1" :style="{ width: '90px' }" :disabled="treeLoading" :model-value="form.showLine" @change="handleShowLine">
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

        <a-form-item field="treeContent" label="解析出来的目录树：" class="textareafill">
          <a-textarea v-model="form.treeContent" class="filetreecontent" readonly placeholder="请先点击 解析文件 按钮" @keydown="(e:any) => e.stopPropagation()" />
        </a-form-item>
      </a-form>
    </div>
    <div class="modalfoot" style="width: 80vw">
      <div class="tips">{{ treeLoading ? '目录解析中...' : form.treeInfo }}</div>
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
