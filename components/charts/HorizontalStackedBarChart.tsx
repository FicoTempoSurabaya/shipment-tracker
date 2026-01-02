'use client'

import ReactECharts from 'echarts-for-react'
import echarts from '@/lib/echarts-registry' // ✅ Import yang benar
import { useTheme } from './ChartTheme'

interface HorizontalStackedBarChartProps {
  data?: Array<{
    name: string
    total: number
    success: number
    failed: number
  }>
  height?: number
}

export default function HorizontalStackedBarChart({ data = [], height = 300 }: HorizontalStackedBarChartProps) {
  const theme = useTheme()

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function (params: any[]) {
        let result = `${params[0].name}<br/>`
        params.forEach((param) => {
          result += `${param.marker} ${param.seriesName}: ${param.value}<br/>`
        })
        return result
      }
    },
    legend: {
      data: ['Berhasil', 'Gagal'],
      textStyle: {
        color: theme.textColor
      },
      top: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: theme.axisLineColor
        }
      },
      axisLabel: {
        color: theme.textColor
      },
      splitLine: {
        lineStyle: {
          color: theme.splitLineColor,
          type: 'dashed'
        }
      }
    },
    yAxis: {
      type: 'category',
      data: data.map(item => item.name),
      axisLine: {
        lineStyle: {
          color: theme.axisLineColor
        }
      },
      axisLabel: {
        color: theme.textColor
      }
    },
    series: [
      {
        name: 'Berhasil',
        type: 'bar',
        stack: 'total',
        label: {
          show: true,
          position: 'insideRight'
        },
        itemStyle: {
          color: '#10B981'
        },
        data: data.map(item => item.success)
      },
      {
        name: 'Gagal',
        type: 'bar',
        stack: 'total',
        label: {
          show: true,
          position: 'insideRight'
        },
        itemStyle: {
          color: '#EF4444'
        },
        data: data.map(item => item.failed)
      }
    ]
  }

  return (
    <div className="w-full">
      <ReactECharts
        echarts={echarts}
        option={option}
        style={{ height: `${height}px`, width: '100%' }}
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  )
}