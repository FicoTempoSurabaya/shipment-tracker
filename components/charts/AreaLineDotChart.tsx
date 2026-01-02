'use client'

import ReactECharts from 'echarts-for-react'
import echarts from '@/lib/echarts-registry'
import { useTheme } from './ChartTheme'

interface AreaLineDotChartProps {
  data?: Array<{ date: string; hk: number; hke: number; hkne: number }>
  height?: number
}

export default function AreaLineDotChart({ data = [], height = 400 }: AreaLineDotChartProps) {
  const theme = useTheme()

  const option = {
    backgroundColor: 'transparent',
    color: ['#3B82F6', '#10B981', '#EF4444'],
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: ['HK', 'HKE', 'HKNE'],
      textStyle: {
        color: theme.textColor
      },
      top: 20
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '12%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: data.map(item => item.date),
        axisLine: {
          lineStyle: {
            color: theme.axisLineColor
          }
        },
        axisLabel: {
          color: theme.textColor
        }
      }
    ],
    yAxis: [
      {
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
      }
    ],
    series: [
      {
        name: 'HK',
        type: 'line',
        smooth: true,
        lineStyle: {
          width: 3
        },
        symbol: 'circle',
        symbolSize: 8,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(59, 130, 246, 0.3)'
            },
            {
              offset: 1,
              color: 'rgba(59, 130, 246, 0.1)'
            }
          ])
        },
        data: data.map(item => item.hk)
      },
      {
        name: 'HKE',
        type: 'line',
        smooth: true,
        lineStyle: {
          width: 3
        },
        symbol: 'circle',
        symbolSize: 8,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(16, 185, 129, 0.3)'
            },
            {
              offset: 1,
              color: 'rgba(16, 185, 129, 0.1)'
            }
          ])
        },
        data: data.map(item => item.hke)
      },
      {
        name: 'HKNE',
        type: 'line',
        smooth: true,
        lineStyle: {
          width: 3
        },
        symbol: 'circle',
        symbolSize: 8,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(239, 68, 68, 0.3)'
            },
            {
              offset: 1,
              color: 'rgba(239, 68, 68, 0.1)'
            }
          ])
        },
        data: data.map(item => item.hkne)
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
        theme="azure-theme"
      />
    </div>
  )
}