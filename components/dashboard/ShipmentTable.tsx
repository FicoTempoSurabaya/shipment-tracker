'use client'

import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Edit, 
  Trash2, 
  DollarSign, 
  ArrowUpDown
} from 'lucide-react'

// --- TIPE DATA ---
interface ShipmentData {
  submit_id: number
  nama_lengkap: string
  nama_freelance?: string
  tanggal: string
  shipment_id: number
  jumlah_toko: number
  terkirim: number
  gagal: number
  alasan?: string
  biaya_freelance?: number 
}

interface ShipmentTableProps {
  data: ShipmentData[]
  isAdmin?: boolean
  onEdit?: (shipment: ShipmentData) => void
  onDelete?: (shipment: ShipmentData) => void
  onFreelanceCost?: (shipment: ShipmentData) => void
}

export default function ShipmentTable({ 
  data, 
  isAdmin = false,
  onEdit,
  onDelete,
  onFreelanceCost
}: ShipmentTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns: ColumnDef<ShipmentData>[] = [
    {
      accessorKey: 'nama_lengkap',
      header: ({ column }) => (
        <button className="flex items-center gap-1 hover:text-blue-600 transition-colors uppercase whitespace-nowrap"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Nama Lengkap <ArrowUpDown size={14} />
        </button>
      ),
      cell: ({ row }) => <span className="font-bold text-text-primary whitespace-nowrap">{row.getValue('nama_lengkap')}</span>,
    },
    {
      accessorKey: 'nama_freelance',
      header: ({ column }) => (
        <button className="flex items-center gap-1 hover:text-blue-600 transition-colors uppercase whitespace-nowrap"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Freelance <ArrowUpDown size={14} />
        </button>
      ),
      cell: ({ row }) => {
        const name = row.getValue('nama_freelance') as string
        return name ? (
          <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 whitespace-nowrap">
            {name}
          </span>
        ) : <span className="text-text-muted text-xs">-</span>
      }
    },
    {
      accessorKey: 'tanggal',
      header: ({ column }) => (
        <button className="flex items-center gap-1 hover:text-blue-600 transition-colors uppercase whitespace-nowrap"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Tanggal <ArrowUpDown size={14} />
        </button>
      ),
      cell: ({ row }) => <span className="whitespace-nowrap">{new Date(row.getValue('tanggal')).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' })}</span>,
    },
    {
      accessorKey: 'shipment_id',
      header: ({ column }) => (
        <button className="flex items-center gap-1 hover:text-blue-600 transition-colors uppercase whitespace-nowrap"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          ID <ArrowUpDown size={14} />
        </button>
      ),
      cell: ({ row }) => <span className="font-bold text-accent-primary whitespace-nowrap">#{row.getValue('shipment_id')}</span>,
    },
    {
      accessorKey: 'jumlah_toko',
      header: ({ column }) => (
        <button className="flex items-center gap-1 hover:text-blue-600 transition-colors uppercase whitespace-nowrap"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Toko <ArrowUpDown size={14} />
        </button>
      ),
      cell: ({ row }) => <span className="font-medium pl-2">{row.getValue('jumlah_toko')}</span>,
    },
    {
      id: 'status',
      header: 'STATUS',
      cell: ({ row }) => (
        <div className="flex flex-col text-xs font-bold gap-0.5 whitespace-nowrap">
          <span className="text-emerald-600">OK: {row.original.terkirim}</span>
          {(row.original.gagal > 0) && <span className="text-rose-600">Fail: {row.original.gagal}</span>}
        </div>
      )
    },
    {
      accessorKey: 'alasan',
      header: 'ALASAN',
      cell: ({ row }) => {
        const alasan = row.getValue('alasan') as string
        return alasan ? <div className="min-w-[150px] text-xs text-text-secondary italic">"{alasan}"</div> : <span className="text-text-muted">-</span>
      }
    },
    {
      id: 'actions',
      header: 'AKSI',
      cell: ({ row }) => isAdmin && (
        <div className="flex items-center gap-2 px-2">
          {row.original.nama_freelance && (
            <button onClick={() => onFreelanceCost?.(row.original)} className={`p-1.5 rounded-lg border ${(row.original.biaya_freelance || 0) > 0 ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-white text-gray-400 border-gray-300 hover:text-accent-primary'}`} title="Cost">
              <DollarSign size={14} />
            </button>
          )}
          <button onClick={() => onEdit?.(row.original)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100" title="Edit">
            <Edit size={14} />
          </button>
          <button onClick={() => onDelete?.(row.original)} className="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100 hover:bg-red-100" title="Hapus">
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ]

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-azure-surface p-2 rounded-2xl shadow-neu-pressed border border-white/50">
        <Search className="text-text-muted ml-2" size={20} />
        <input
          type="text"
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Cari data shipment..."
          className="bg-transparent border-none outline-none text-sm w-full h-10 text-text-primary"
        />
      </div>

      {/* --- UNIFIED TABLE VIEW (DESKTOP & MOBILE) --- */}
      <div className="bg-azure-surface rounded-2xl shadow-neu-flat border border-white/40 overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-transparent">
          <table className="w-full text-sm text-left border-collapse min-w-max">
            <thead className="bg-slate-300 text-slate-700 font-bold uppercase text-[11px] tracking-wider border-b-2 border-slate-400">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  <th className="px-4 py-4 w-10 text-center border-r border-slate-400/30">No</th>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-4 py-4 whitespace-nowrap">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-300">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-text-muted italic">
                    Data tidak ditemukan dalam periode ini.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row, index) => (
                  <tr key={row.id} className="hover:bg-white/50 transition-colors">
                    <td className="px-4 py-3 text-center text-text-secondary text-xs border-r border-slate-200/50">
                      {index + 1 + (table.getState().pagination.pageIndex * table.getState().pagination.pageSize)}
                    </td>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 py-3 text-text-primary">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Container */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-2">
        <span className="text-xs font-bold text-text-secondary bg-slate-200/50 px-3 py-1 rounded-full">
          Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
        </span>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-2.5 rounded-xl bg-azure-surface shadow-neu-flat disabled:opacity-30 hover:shadow-neu-pressed transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="px-3 py-2 rounded-xl bg-azure-surface shadow-neu-inset text-xs font-bold outline-none cursor-pointer"
          >
            {[10, 20, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>Tampil {pageSize}</option>
            ))}
          </select>

          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-2.5 rounded-xl bg-azure-surface shadow-neu-flat disabled:opacity-30 hover:shadow-neu-pressed transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}