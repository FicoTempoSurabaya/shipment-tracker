'use client'

import ReactECharts from 'echarts-for-react'
import echarts from '@/lib/echarts-registry'
import { useTheme } from './ChartTheme'

interface RadarChartProps {
  data?: Array<{
    name: string
    value: number
  }>
  title?: string
  height?: number
}

export default function RadarChart({ data = [], title = '', height = 300 }: RadarChartProps) {
  const theme = useTheme()

  const indicator = data.map(item => ({
    name: item.name,
    max: 100
  }))

  const option = {
    backgroundColor: 'transparent',
    title: {
      text: title,
      left: 'center',
      textStyle: {
        color: theme.textColor
      }
    },
    tooltip: {},
    radar: {
      indicator: indicator,
      shape: 'circle',
      splitNumber: 5,
      axisName: {
        color: theme.textColor
      },
      splitLine: {
        lineStyle: {
          color: theme.splitLineColor
        }
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(59, 130, 246, 0.1)', 'rgba(59, 130, 246, 0.05)'],
          shadowColor: 'rgba(0, 0, 0, 0.2)',
          shadowBlur: 10
        }
      },
      axisLine: {
        lineStyle: {
          color: theme.axisLineColor
        }
      }
    },
    series: [
      {
        name: 'Performance',
        type: 'radar',
        data: [
          {
            value: data.map(item => item.value),
            name: 'Score',
            areaStyle: {
              color: 'rgba(59, 130, 246, 0.3)'
            },
            lineStyle: {
              color: '#3B82F6',
              width: 2
            },
            itemStyle: {
              color: '#3B82F6'
            }
          }
        ]
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