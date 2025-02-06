<template>
  <CommonPage show-footer title="文章">
    <template #action>
      <div>
        <n-button type="primary" secondary @click="$table?.handleExport()">
          <TheIcon icon="mdi:download" :size="18" class="mr-5" />
          导出
        </n-button>
        <n-button type="primary" class="ml-16" @click="handleAdd">
          <TheIcon icon="material-symbols:add" :size="18" class="mr-5" />
          新建文章
        </n-button>
      </div>
    </template>

    <CrudTable ref="$table" v-model:query-items="queryItems" :extra-params="extraParams" :scroll-x="1200"
      :columns="columns" :get-data="api.getPosts" @on-checked="onChecked"
      @on-data-change="(data) => (tableData = data)">
      <template #queryBar>
        <QueryBarItem label="标题" :label-width="50">
          <n-input v-model:value="queryItems.title" type="text" placeholder="请输入标题"
            @keypress.enter="$table?.handleSearch" />
        </QueryBarItem>
      </template>
    </CrudTable>
    <!-- 新增/编辑/查看 -->
    <CrudModal v-model:visible="modalVisible" :title="modalTitle" :loading="modalLoading"
      :show-footer="modalAction !== 'view'" @on-save="handleSave">
      <n-form ref="modalFormRef" label-placement="left" label-align="left" :label-width="80" :model="modalForm"
        :disabled="modalAction === 'view'">
        <n-form-item label="作者" path="author">
          <n-input v-model:value="modalForm.author" disabled />
        </n-form-item>
        <n-form-item label="内容" path="message">
          <n-input v-model:value="modalForm.message" disabled />
        </n-form-item>
        <n-form-item label="备注" path="tip" :rule="{
            required: false,
            message: '请输入备注',
            trigger: ['input', 'blur'],
          }">
          <n-input v-model:value="modalForm.tip" placeholder="请输入备注" />
        </n-form-item>
      </n-form>
    </CrudModal>
  </CommonPage>
</template>


<script setup>
  import { NButton, NSwitch } from 'naive-ui'
  import { formatDateTime, renderIcon, isNullOrUndef } from '@/utils'
  import { useCRUD } from '@/composables'
  import api from './api'

  defineOptions({ name: 'Crud' })

  const $table = ref(null)
  /** 表格数据，触发搜索的时候会更新这个值 */
  const tableData = ref([])
  /** QueryBar筛选参数（可选） */
  const queryItems = ref({})
  /** 补充参数（可选） */
  const extraParams = ref({})

  onActivated(() => {
    $table.value?.handleSearch()
  })

  const columns = [
    { type: 'selection', fixed: 'left' },
    {
      title: '不达标',
      key: 'isPublish',
      width: 60,
      align: 'center',
      fixed: 'left',
      render(row) {
        return h(NSwitch, {
          size: 'small',
          rubberBand: false,
          value: row['isPublish'],
          onUpdateValue: () => handlePublish(row),
        })
      },
    },
    {
      title: 'Message',
      key: 'message', width: 150,
      ellipsis: { tooltip: true },
      render: (row) => h('a', { href: row["href"], target: "_blank" }, row['message'])
    },
    {
      title: '备注', key: 'tip', width: 150, ellipsis: { tooltip: true }
    },
    // { title: '分类', key: 'category', width: 80, ellipsis: { tooltip: true } },
    { title: '创建人', key: 'author', width: 80 },
    {
      title: '创建时间',
      key: 'timeStr',
      width: 150,
      render(row) {
        return h('span', formatDateTime(row['timeStr']))
      },
    },
    // {
    //   title: '最后更新时间',
    //   key: 'updateDate',
    //   width: 150,
    //   render(row) {
    //     return h('span', formatDateTime(row['updateDate']))
    //   },
    // },
    {
      title: '操作',
      key: 'actions',
      width: 240,
      align: 'center',
      fixed: 'right',
      hideInExcel: true,
      render(row) {
        return [
          h(
            NButton,
            {
              size: 'small',
              type: 'primary',
              secondary: true,
              onClick: () => handleView(row),
            },
            { default: () => '查看', icon: renderIcon('majesticons:eye-line', { size: 14 }) }
          ),
          h(
            NButton,
            {
              size: 'small',
              type: 'primary',
              style: 'margin-left: 15px;',
              onClick: () => handleEdit(row),
            },
            { default: () => '编辑', icon: renderIcon('material-symbols:edit-outline', { size: 14 }) }
          ),

          h(
            NButton,
            {
              size: 'small',
              type: 'error',
              style: 'margin-left: 15px;',
              onClick: () => handleDelete(row.id),
            },
            {
              default: () => '删除',
              icon: renderIcon('material-symbols:delete-outline', { size: 14 }),
            }
          ),
        ]
      },
    },
  ]

  // 选中事件
  function onChecked(rowKeys) {
    if (rowKeys.length) $message.info(`选中${rowKeys.join(' ')}`)
  }

  // 发布
  function handlePublish(row) {
    if (isNullOrUndef(row.id)) return
    //调用接口修改mock数据
    api.updatePost({ ...row, isPublish: !row.isPublish }).then((res) => {
      console.log(res, 333)
      if (row.isPublish) {
        $message?.success('达标')
      }
      else {
        $message?.error('不达标')
      }
      $table.value?.handleSearch(1);
    })
  }

  const {
    modalVisible,
    modalAction,
    modalTitle,
    modalLoading,
    handleAdd,
    handleDelete,
    handleEdit,
    handleView,
    handleSave,
    modalForm,
    modalFormRef,
  } = useCRUD({
    name: '文章',
    initForm: { author: '大脸怪' },
    doCreate: api.addPost,
    doDelete: api.deletePost,
    doUpdate: api.updatePost,
    refresh: () => $table.value?.handleSearch(1),
  })
</script>