'use client'

import ReactECharts from 'echarts-for-react'
import echarts from '@/lib/echarts-registry' // ✅ Import yang benar
import { useTheme } from './ChartTheme'

interface PieChartProps {
  data?: Array<{
    name: string
    value: number
  }>
  title?: string
  height?: number
}

export default function PieChart({ data = [], title = '', height = 300 }: PieChartProps) {
  const theme = useTheme()

  const option = {
    backgroundColor: 'transparent',
    title: {
      text: title,
      left: 'center',
      textStyle: {
        color: theme.textColor,
        fontSize: 16
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: {
        color: theme.textColor
      }
    },
    series: [
      {
        name: 'Data',
        type: 'pie',
        radius: '50%',
        center: ['50%', '50%'],
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          color: theme.textColor
        }
      }
    ],
    color: ['#10B981', '#EF4444', '#3B82F6', '#F59E0B', '#8B5CF6']
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