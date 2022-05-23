<script lang="ts">
import { modalCloseAll, modalCreatNewDir } from '@/utils/modal'
import { computed, defineComponent, h, nextTick, PropType, reactive, ref } from 'vue'
import { usePanTreeStore, useWinStore } from '@/store'
import { CheckFileName, ClearFileName } from '@/utils/utils'
import { Tree as AntdTree } from 'ant-design-vue'
import 'ant-design-vue/es/tree/style/css'
import { EventDataNode } from 'ant-design-vue/es/tree'
import TreeStore, { TreeNodeData } from '@/store/treestore'
import message from '@/utils/message'
import AliFileCmd from '@/aliapi/filecmd'
import PanDAL from '../pandal'
import { Sleep } from '@/utils/format'

const iconfolder = h('i', { class: 'iconfont iconfolder' })
const foldericonfn = () => iconfolder
export default defineComponent({
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    selecttype: {
      type: String,
      required: true
    },
    callback: {
      type: Function as PropType<(user_id: string, drive_id: string, dir_id: string, dir_name: string) => void>
    }
  },
  components: {
    AntdTree
  },
  setup(props) {
    const okLoading = ref(false)

    const pantreeStore = usePanTreeStore()
    const winStore = useWinStore()
    const TreeHeight = computed(() => (winStore.height * 8) / 10 - 126)

    const user_id = ref('')
    const drive_id = ref('')
    const selectdir = ref({ dir_id: 'root', dir_name: '根目录' })

    const handleOpen = async () => {
      
      okLoading.value = true
      user_id.value = pantreeStore.user_id
      drive_id.value = pantreeStore.drive_id
      let expandedKeys: string[] = ['root']

      TreeData.value = TreeStore.GetPanTreeAllNodeForModal(pantreeStore.drive_id)
      let selectid = localStorage.getItem('selectpandir-' + drive_id)
      if (selectid) {
        let data = TreeStore.GetDirPath(pantreeStore.drive_id, selectid)
        if (data && data.length > 0) {
          for (let i = 0, maxi = data.length; i < maxi; i++) {
            let item = data[i]
            expandedKeys.push(item.file_id)
            if (item.file_id == selectid) {
              selectdir.value = { dir_id: item.file_id, dir_name: item.name }
            }
          }
        }
        TreeSelectedKeys.value = [selectid!]
        setTimeout(() => {
          treeref.value?.treeRef?.scrollTo({ key: selectid, offset: 100, align: 'top' })
        }, 400)
      } else {
        selectdir.value = { dir_id: 'root', dir_name: '根目录' }
        TreeSelectedKeys.value = ['root']
      }
      TreeExpandedKeys.value = expandedKeys
      okLoading.value = false
    }

    const handleClose = () => {
      
      if (okLoading.value) okLoading.value = false
      user_id.value = ''
      drive_id.value = ''
      selectdir.value = { dir_id: 'root', dir_name: '根目录' }
      TreeData.value = [{ __v_skip: true, key: 'root', title: '根目录', namesearch: '', isLeaf: false, icon: foldericonfn, children: [] }]
      TreeExpandedKeys.value = []
      TreeSelectedKeys.value = []
    }

    const treeref = ref()
    const TreeData = ref<TreeNodeData[]>([{ __v_skip: true, key: 'root', title: '根目录', namesearch: '', isLeaf: false, icon: foldericonfn, children: [] }])
    const TreeExpandedKeys = ref<string[]>([])
    const TreeSelectedKeys = ref<string[]>([])

    const handleTreeSelect = (keys: any[], info: { event: string; selected: Boolean; nativeEvent: MouseEvent; node: EventDataNode }) => {
      localStorage.setItem('selectpandir-' + drive_id, info.node.key as string)
      selectdir.value = { dir_id: info.node.key as string, dir_name: info.node.title as string }

      
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

    const showCreatNewDir = ref(false)
    const formRef = ref()
    const form = reactive({ dirname: '' })
    const rules = [
      { required: true, message: '文件夹名必填' },
      { minLength: 1, message: '文件夹名不能为空' },
      { maxLength: 100, message: '文件夹名太长(100)' },
      {
        validator: (value: string, cb: any) => {
          let chk = CheckFileName(value)
          if (chk) cb('文件夹名' + chk)
        }
      }
    ]
    const handleCloseNewDir = () => {
      
      if (okLoading.value) okLoading.value = false
      formRef.value.resetFields()
    }
    return { okLoading, handleOpen, handleClose, TreeHeight, treeref, handleTreeSelect, TreeData, TreeExpandedKeys, TreeSelectedKeys, user_id, drive_id, selectdir, showCreatNewDir, formRef, form, rules, handleCloseNewDir }
  },
  methods: {
    handleHide() {
      modalCloseAll()
    },
    handleCreatNew() {
      this.showCreatNewDir = true
    },
    handleHideNewDir() {
      this.showCreatNewDir = false
    },
    handleOKNewDir() {
      this.formRef.validate((data: any) => {
        if (data) return 

        let newname = ClearFileName(this.form.dirname)
        if (!newname) {
          message.error('新建文件夹失败 文件夹名不能为空')
          return
        }

        this.okLoading = true
        let newdirid = ''
        AliFileCmd.ApiCreatNewForder(this.user_id, this.drive_id, this.selectdir.dir_id, newname)
          .then((data: string | undefined) => {
            if (data == undefined) message.error('新建文件夹 失败')
            else if (data == 'QuotaExhausted.Drive') message.error('新建文件夹失败：网盘空间已满')
            else {
              newdirid = data
              message.success('新建文件夹 成功')
              return PanDAL.GetDirFileList(this.user_id, this.drive_id, this.selectdir.dir_id, '')
            }
          })
          .catch((e: any) => {
            message.error('新建文件夹 失败 ' + (e.message || ''))
          })
          .then(async () => {
            await Sleep(200)
            this.selectdir = { dir_id: newdirid, dir_name: newname }
            this.TreeData = TreeStore.GetPanTreeAllNodeForModal(this.drive_id)
            this.TreeSelectedKeys = [newdirid]
            await Sleep(200)            
            this.TreeExpandedKeys = this.TreeExpandedKeys.concat([this.selectdir.dir_id, newdirid])
            this.okLoading = false
            this.showCreatNewDir = false
          })
      })
    },
    handleOK() {
      modalCloseAll()
      if (this.callback) this.callback(this.user_id, this.drive_id, this.selectdir.dir_id, this.selectdir.dir_name)
    }
  }
})
</script>

<template>
  <a-modal :visible="visible" modal-class="modalclass showsharemodal" @cancel="handleHide" @before-open="handleOpen" @close="handleClose" :footer="false" :unmount-on-close="true" :mask-closable="false">
    <template #title>
      <span class="modaltitle">选择一个位置</span>
    </template>
    <div class="modalbody" style="width: 80vw; max-width: 860px; height: calc(80vh - 100px); padding-bottom: 16px">
      <AntdTree
        :tabindex="-1"
        :focusable="false"
        ref="treeref"
        class="sharetree"
        blockNode
        selectable
        :autoExpandParent="false"
        showIcon
        :height="TreeHeight"
        :style="{ height: TreeHeight + 'px' }"
        :showLine="{ showLeafIcon: false }"
        :openAnimation="{}"
        @select="handleTreeSelect"
        v-model:expandedKeys="TreeExpandedKeys"
        v-model:selectedKeys="TreeSelectedKeys"
        :treeData="TreeData"
      >
        <template #switcherIcon>
          <i class="ant-tree-switcher-icon iconfont Arrow" />
        </template>
        <template #icon>
          <i class="iconfont iconfile-folder" />
        </template>
        <template #title="{ dataRef }">
          <span class="sharetitleleft">{{ dataRef.title }}</span>
        </template>
      </AntdTree>
    </div>
    <div id="selectdir">已选择：{{ selectdir.dir_name }}</div>
    <div class="modalfoot">
      <a-button type="outline" size="small" @click="handleCreatNew">新建文件夹</a-button>
      <div style="flex-grow: 1"></div>
      <a-button v-if="!okLoading" type="outline" size="small" tabindex="-1" @click="handleHide">取消</a-button>
      <a-button type="primary" size="small" tabindex="-1" :loading="okLoading" @click="handleOK">选择</a-button>
    </div>
  </a-modal>

  <a-modal :visible="showCreatNewDir" modal-class="modalclass" @cancel="handleHideNewDir" @close="handleCloseNewDir" :footer="false" :unmount-on-close="true" :mask-closable="false">
    <template #title>
      <span class="modaltitle">新建文件夹</span>
    </template>
    <div class="modalbody" style="width: 440px">
      <a-form ref="formRef" :model="form" layout="vertical">
        <a-form-item field="dirname" :rules="rules">
          <template #label>文件夹名：<span class="opblue" style="margin-left: 16px; font-size: 12px"> 不要有特殊字符 &lt; > : * ? \\ / \' " </span> </template>
          <a-input v-model.trim="form.dirname" placeholder="例如：新建文件夹" allow-clear autofocus="autofocus" />
        </a-form-item>
      </a-form>
      <br />
    </div>
    <div class="modalfoot">
      <div style="flex-grow: 1"></div>
      <a-button v-if="!okLoading" type="outline" size="small" @click="handleHideNewDir">取消</a-button>
      <a-button type="primary" size="small" :loading="okLoading" @click="handleOKNewDir">创建</a-button>
    </div>
  </a-modal>
</template>

<style>
#selectdir {
  text-align: left;
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 18px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  -o-text-overflow: ellipsis;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-break: keep-all;
  color: var(--color-text-3);
  height: 18px;
}
</style>
