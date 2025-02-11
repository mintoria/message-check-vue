<template>
    <AppPage :show-footer="true">
        <n-card class="mt-12" title="不达标commit概览" segmented>
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <label style="margin-right: 12px; font-size: 14px;">创建人</label>
                <n-select title="创建人" :label-width="50" v-model:value="value" :options="options"
                    @update:value="handleUpdateValue" style=" width: 300px;" />
            </div>
            <CrudTable ref="$table" v-model:query-items="queryItems" :extra-params="extraParams" :scroll-x="1200"
                :columns="columns" :get-data="api.getFilterErrorPosts" @on-data-change="(data) => {
                    tableData = data
                }">
            </CrudTable>
        </n-card>
        <n-card class="mt-12" title="错误率占比" segmented>
            <VChart :option="skillsOption" class="h-480 w-full" autoresize />
        </n-card>
        <n-card class="mt-12" title="单人commit提交率" segmented>
            <VChart :option="trendOption" class="h-480 w-full" autoresize />
        </n-card>

    </AppPage>
</template>

<script setup>
    import { useUserStore } from '@/store'
    import * as echarts from 'echarts/core'
    import { TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
    import { BarChart, LineChart, PieChart } from 'echarts/charts'
    import { UniversalTransition } from 'echarts/features'
    import { CanvasRenderer } from 'echarts/renderers'
    import VChart from 'vue-echarts'
    import api from '../table/api.js';
    import { NButton, NSwitch } from 'naive-ui'
    import { formatDateTime, renderIcon, isNullOrUndef } from '@/utils'
    import { useCRUD } from '@/composables'
    import { onActivated } from 'vue'

    defineOptions({ name: 'Crud' })

    const $table = ref(null)
    /** 表格数据，触发搜索的时候会更新这个值 */
    const tableData = ref([])
    /** QueryBar筛选参数（可选） */
    const queryItems = ref({})
    /** 补充参数（可选） */
    const extraParams = ref({})

    /** select value值 */
    const value = ref('')

    /** select options */
    const options = ref([
        { label: "全部", value: "" },
        { label: '李晓珊', value: '李晓珊' },
        { label: '李淑峰', value: '李淑峰' },
        { label: '王学良', value: '王学良' },
        { label: '陈帅11', value: '陈帅11' },
        { label: '张明雪01', value: '张明雪01' },
    ])


    /** select change事件 */
    function handleUpdateValue(value) {
        queryItems.value.author = value
        $table.value?.handleSearch()
    }

    const columns = [
        // { type: 'selection', fixed: 'left' },
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
                    value: true,
                    disabled: true,
                    onUpdateValue: () => { $message.info('不可操作') },
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
        // {title: '分类', key: 'category', width: 80, ellipsis: {tooltip: true } },
        { title: '创建人', key: 'committer_name', width: 80 },
        {
            title: '创建时间',
            key: 'created_at',
            width: 150,
            render(row) {
                return h('span', formatDateTime(row['created_at']))
            },
        }
    ]




    const skillsOption = reactive({
        tooltip: {
            trigger: 'item',
            formatter({ name, value }) {
                return `${name} ${value}%`
            },
        },
        legend: {
            left: 'center',
        },
        series: [
            {
                top: '7%',
                type: 'pie',
                radius: ['40%', '85%'],
                avoidLabelOverlap: true,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2,
                },
                label: {
                    show: false,
                    position: 'center',
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 36,
                        fontWeight: 'bold',
                    },
                },
                labelLine: {
                    show: false,
                },
                data: [
                ],
            },
        ],
    });
    const trendOption = reactive({
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                crossStyle: {
                    color: '#999',
                },
            },
        },
        legend: {
            top: '5%',
            data: ['star', 'fork'],
        },
        xAxis: [
            {
                type: 'category',
                data: [],
                axisPointer: {
                    type: 'shadow',
                },
            },
        ],
        yAxis: [
            {
                type: 'value',
                axisLabel: {
                    formatter: '{value}',
                },
            }
        ],
        series: [
            {
                name: '不达标数',
                type: 'bar',
                data: [],
            },
        ],
    });

    // 将获取数据的逻辑抽取为独立函数
    const fetchChartData = async () => {
        try {
            const response = await api.getFilterErrorPosts();
            let datas = response.data;
            let dataObj = {};
            let data = [];
            let trendData = [];

            datas.forEach((item) => {
                if (!Object.keys(dataObj).includes(item.committer_name)) {
                    dataObj[item.committer_name] = [];
                }
                dataObj[item.committer_name].push(item.isPublish ? 1 : 0);
            });

            let xAxisData = Object.keys(dataObj);
            trendOption.xAxis[0].data = xAxisData;

            for (let key in dataObj) {
                let count = 0;
                dataObj[key].forEach((item) => {
                    if (item == 1) count++;
                });
                data.push({
                    name: key,
                    value: count / dataObj[key].length,
                });
            }

            xAxisData.forEach((item) => {
                let count = 0;
                dataObj[item].forEach((item) => {
                    if (item == 1) count++;
                });
                trendData.push(count);
            });

            skillsOption.series[0].data = data;
            trendOption.series[0].data = trendData;
        } catch (error) {
            console.error(error);
        }
    }

    // 组件被激活时获取数据
    onActivated(() => {
        $table.value?.handleSearch()
        fetchChartData()
    })

    const userStore = useUserStore()

    echarts.use([
        TooltipComponent,
        GridComponent,
        LegendComponent,
        BarChart,
        LineChart,
        CanvasRenderer,
        UniversalTransition,
        PieChart,
    ])


</script>