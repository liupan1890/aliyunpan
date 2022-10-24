<script lang="ts">
import { usePanTreeStore } from '../../store'
import message from '../../utils/message'
import { modalCloseAll } from '../../utils/modal'
import { defineComponent, ref, reactive } from 'vue'
import PanDAL from '../pandal'
import dayjs from 'dayjs'

export default defineComponent({
  props: {
    visible: {
      type: Boolean,
      required: true
    }
  },
  setup(props) {
    const okLoading = ref(false)
    const formRef = ref()

    const form = reactive({
      name: '',
      type: [],
      min: 0,
      max: 0,
      begin: '',
      end: '',
      ext: '',
      fav: false
    })

    const handleOpen = () => {
      formRef.value.resetFields()
    }

    const handleClose = () => {
      
      if (okLoading.value) okLoading.value = false
      formRef.value.resetFields()
    }

    const rules = [
      {
        validator: (value: number, cb: any) => {
          if (value != 0 && form.max < value) cb('必须是0 或者小于 ' + form.max)
        }
      }
    ]

    return { okLoading, form, formRef, handleOpen, handleClose, rules, dayjs }
  },
  methods: {
    handleHide() {
      modalCloseAll()
    },
    handleOK() {
      this.formRef.validate((data: any) => {
        if (data) return 
        if (this.form.min > 0 && this.form.max > 0 && this.form.min > this.form.max) {
          message.error('最小体积(' + this.form.min + ')不能大于最大体积(' + this.form.max + ')')
          return
        }
        const pantreeStore = usePanTreeStore()
        if (!pantreeStore.user_id || !pantreeStore.drive_id || !pantreeStore.selectDir.file_id) {
          message.error('搜索失败 父文件夹错误')
          return
        }
        let searchid = ''
        if (this.form.min == this.form.max && this.form.min > 0) searchid += 'size:' + this.form.min * 1024 * 1024 + ' '
        else {
          if (this.form.min) searchid += 'min:' + this.form.min * 1024 * 1024 + ' '
          if (this.form.max && this.form.max > this.form.min) searchid += 'max:' + this.form.max * 1024 * 1024 + ' '
        }

        if (this.form.begin) searchid += 'begin:' + this.form.begin + ' '
        if (this.form.end) searchid += 'end:' + this.form.end + ' '

        if (this.form.type && this.form.type.length > 0) {
          const type = this.form.type.filter((t) => t)
          if (type.length > 0) searchid += 'type:' + type.join(',') + ' '
        }

        if (this.form.name) searchid += this.form.name.trim() + ' '

        if (this.form.ext) {
          const ext = this.form.ext.replaceAll('，', ',').replaceAll(' ', '').replaceAll('.', '')
          if (ext != this.form.ext) this.form.ext = ext
          searchid += 'ext:' + ext + ' '
        }

        searchid = searchid.trim()
        if (searchid) {
          PanDAL.aReLoadOneDirToShow('', 'search' + searchid, false)
          modalCloseAll()
        } else {
          message.error('没有填写任何搜索条件')
        }
      })
    }
  }
})
</script>

<template>
  <a-modal :visible="visible" modal-class="modalclass" :footer="false" :unmount-on-close="true" :mask-closable="false" @cancel="handleHide" @before-open="handleOpen" @close="handleClose">
    <template #title>
      <span class="modaltitle">在整个网盘内 高级搜索</span>
    </template>
    <div class="modalbody" style="width: 440px">
      <a-form ref="formRef" :model="form" layout="horizontal" auto-label-width>
        <a-form-item field="name">
          <template #label>文件名： </template>
          <a-input v-model.trim="form.name" placeholder="可以不填" allow-clear />
          <template #extra>
            <span class="opblue" style="font-size: 12px"> 不要有特殊字符 &lt; > : * ? \\ / \' " </span>
          </template>
        </a-form-item>

        <a-form-item field="type">
          <template #label>分类：</template>

          <a-checkbox-group v-model="form.type">
            <a-checkbox value="folder">文件夹</a-checkbox>
            <a-checkbox value="image">图片</a-checkbox>
            <a-checkbox value="video">视频</a-checkbox>
            <a-checkbox value="doc">文档</a-checkbox>
            <a-checkbox value="audio">音频</a-checkbox>
            <a-checkbox value="zip">压缩包</a-checkbox>
            <a-checkbox value="others">其他</a-checkbox>
          </a-checkbox-group>
          <template #extra> <span style="font-size: 12px">可以多选 例如:勾选了图片和视频，则只搜索</span><span class="opblue" style="font-size: 12px">图片和视频</span><span style="font-size: 12px">类型的文件</span> </template>
        </a-form-item>

        <a-form-item field="min">
          <template #label>体积：</template>
          <a-input-number v-model="form.min" tabindex="-1" style="width: 170px" :min="0" :max="102400">
            <template #prefix> 最小 </template>
          </a-input-number>
          <div style="flex: auto"></div>
          <a-input-number v-model="form.max" tabindex="-1" style="width: 170px" :min="form.min" :max="102400">
            <template #prefix> 最大 </template>
          </a-input-number>
          <template #extra> <span style="font-size: 12px">填0不限制大小，单位兆(MB) 例如:1百兆填</span><span class="opblue" style="font-size: 12px">100</span><span style="font-size: 12px">，1GB填</span><span class="opblue" style="font-size: 12px">1024</span> </template>
        </a-form-item>

        <a-form-item field="ext">
          <template #label>后缀名： </template>
          <a-input v-model.trim="form.ext" placeholder="可以不填，例如mkv,mp4" allow-clear />
          <template #extra> <span style="font-size: 12px">前面没有点(.) 多个后缀用逗号(,)间隔 例如:</span><span class="opblue" style="font-size: 12px">mkv,mp4,zip,jpg</span> </template>
        </a-form-item>
        <a-form-item field="begin">
          <template #label>开始： </template>
          <a-date-picker
            v-model="form.begin"
            style="width: 265px; margin: 0"
            shortcuts-position="right"
            placeholder="可以不填,列出某一天 之后 上传的"
            value-format="YYYY-MM-DD"
            :disabled-date="(current:any) => dayjs(current).isAfter(dayjs(form.end||dayjs().add(-1, 'day')))"
            :shortcuts="[
              {
                label: '1周前',
                value: () => dayjs().add(-7, 'day')
              },
              {
                label: '1月前',
                value: () => dayjs().add(-1, 'month')
              },
              {
                label: '半年前',
                value: () => dayjs().add(-6, 'month')
              },
              {
                label: '一年前',
                value: () => dayjs().add(-1, 'year')
              }
            ]" />
        </a-form-item>
        <a-form-item field="end">
          <template #label>结束： </template>
          <a-date-picker
            v-model="form.end"
            style="width: 265px; margin: 0"
            shortcuts-position="right"
            placeholder="可以不填,列出某一天 之前 上传的"
            value-format="YYYY-MM-DD"
            :disabled-date="(current:any) => {return dayjs(current).isBefore(dayjs(form.begin||'2020-01-01'))||dayjs(current).isAfter(dayjs().add(1, 'day'))}"
            :shortcuts="[
              {
                label: '1周前',
                value: () => dayjs().add(-7, 'day')
              },
              {
                label: '1月前',
                value: () => dayjs().add(-1, 'month')
              },
              {
                label: '半年前',
                value: () => dayjs().add(-6, 'month')
              },
              {
                label: '一年前',
                value: () => dayjs().add(-1, 'year')
              }
            ]" />
        </a-form-item>
      </a-form>
      <br />
    </div>
    <div class="modalfoot">
      <div style="flex-grow: 1"></div>
      <a-button v-if="!okLoading" type="outline" size="small" @click="handleHide">取消</a-button>
      <a-button type="primary" size="small" :loading="okLoading" @click="handleOK">搜索</a-button>
    </div>
  </a-modal>
</template>

<style></style>
