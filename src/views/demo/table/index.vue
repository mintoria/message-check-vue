<template>
  <CommonPage show-footer title="ei-pc">
    <template #action>
      <div>
        <n-select v-model:value="queryItems.branch" :options="branchOptions" placeholder="请选择分支" style="width: 200px;"
          @update:value="onBranchChange" :loading="branchLoading" @search="onBranchSearch" filterable
          :clear-filter-after-select="false" />
      </div>
    </template>

    <CrudTable ref="$table" v-model:query-items="queryItems" :extra-params="extraParams" :scroll-x="1200"
      :columns="columns" :get-data="getTableData" @on-checked="onChecked" @on-data-change="(data) => {
        console.log('onDataChange triggered', data)
        tableData = data
      }">
    </CrudTable>
    <!-- 新增/编辑/查看 -->
    <CrudModal v-model:visible="modalVisible" :title="modalTitle" :loading="modalLoading"
      :show-footer="modalAction !== 'view'" @on-save="handleSave">
      <n-form ref="modalFormRef" label-placement="left" label-align="left" :label-width="80" :model="modalForm"
        :disabled="modalAction === 'view'">
        <n-form-item label="作者" path="author">
          <n-input v-model:value="modalForm.committer_name" disabled />
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
  import { debounce } from '@/utils'
  import publicData from '../../../../mock/ei-pc/3.5.0.json'
  import api from './api'
  import { reactive, ref, h, onActivated, computed, onMounted } from 'vue'

  defineOptions({ name: 'Crud' })

  const $table = ref(null)
  /** 表格数据，触发搜索的时候会更新这个值 */
  const tableData = ref([])
  /** QueryBar筛选参数（可选） */
  const queryItems = ref({ branch: "master" })
  /** 补充参数（可选） */
  const isSwitchOperation = ref(false)
  const extraParams = computed(() => ({
    _fromSwitch: isSwitchOperation.value
  }))
  // ei-pc分支
  const branchOptions = ref([])
  const branchLoading = ref(false)

  const getBranchOptions = (value) => {
    branchLoading.value = true
    api.getBranches({ search: value }).then((res) => {
      branchOptions.value = res.data.map((item) => ({
        label: item.name,
        value: item.name,
      }))
      queryItems.value.branch = branchOptions.value[0]?.value
    }).finally(() => {
      branchLoading.value = false
      $table.value?.handleSearch(undefined)
    })
  }

  const onBranchSearch = (value) => {
    console.log('onBranchSearch triggered', value)
    debouncedSearch(value)
  }

  const debouncedSearch = debounce((value) => {
    branchLoading.value = true
    getBranchOptions(value)
  }, 500)

  const onBranchChange = (value) => {
    console.log(value, 'selected value')
    queryItems.value.branch = value;
    // 这里可以添加其他需要在分支改变时执行的逻辑
    $table.value?.handleSearch(undefined)
  }

  onActivated(() => {
    //p
    getBranchOptions()
  })
  const pData = ref([])
  onMounted(() => {
    console.log('publicData', publicData)
    pData.value = publicData
  })

  const columns = reactive([
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
          value: pData.value.findIndex(item => item.id === row.id) !== -1,
          onUpdateValue: () => handlePublish(row)
        })
      },
    },
    {
      title: 'Message',
      key: 'message', width: 150,
      ellipsis: { tooltip: true },
      render: (row) => h('a', {
        href: row["web_url"], target: "_blank", style: {
          color: row['isPublish'] ? 'green' : '',
        }
      }, row['message'])
    },
    {
      title: '备注', key: 'tip', width: 150, ellipsis: { tooltip: true },
      render(row) {
        return h('span',
          pData.value.find(item => item.id === row.id)?.tip || ""
        )
      }
    },
    // { title: '分类', key: 'category', width: 80, ellipsis: { tooltip: true } },
    {
      title: '创建人', key: 'committer_name', width: 80
    },
    {
      title: '创建时间',
      key: 'committed_date',
      width: 150,
      render(row) {
        return h('span', formatDateTime(row['committed_date']))
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
  ])

  // 选中事件
  function onChecked(rowKeys) {
    if (rowKeys.length) $message.info(`选中${rowKeys.join(' ')}`)
  }

  // 1. 将 API 方法包装一层
  const getTableData = async (params) => {
    console.log('getTableData params:', params)  // 添加日志
    if (params._fromSwitch) {
      return { data: tableData.value }
    }
    return api.getPosts(params)
  }

  // 修改 handlePublish
  function handlePublish(row) {
    if (isNullOrUndef(row.id)) return
    console.log('handlePublish triggered', row)

    const isPublish = pData.value.findIndex(item => item.id === row.id) !== -1
    const postFunc = isPublish ? api.deletePost : api.updatePost

    // 先更新本地数据
    if (!isPublish) {
      pData.value.push(row)
    } else {
      pData.value = pData.value.filter(item => item.id !== row.id)
    }

    // 直接更新表格数据
    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      tableData.value[index] = {
        ...tableData.value[index],
        isPublish: !isPublish
      }
    }

    // 后台同步
    postFunc({ ...row }).then(() => {
      $message?.success(isPublish ? '达标' : '不达标')
    }).catch(() => {
      // 如果失败，回滚本地数据
      if (!isPublish) {
        pData.value = pData.value.filter(item => item.id !== row.id)
      } else {
        pData.value.push(row)
      }
      $message?.error('操作失败')
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
    name: 'Commit',
    initForm: { author: '大脸怪' },
    doCreate: api.addPost,
    doDelete: api.deletePost,
    doUpdate: api.updatePost,
    refresh: () => $table.value?.handleSearch(1),
  })
</script>