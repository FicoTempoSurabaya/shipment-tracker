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
import { ChevronLeft, ChevronRight, Search, Edit, Trash2, DollarSign } from 'lucide-react'

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
  const [rowSelection, setRowSelection] = useState({})

  const columns: ColumnDef<ShipmentData>[] = [
    ...(isAdmin ? [
      {
        accessorKey: 'nama_lengkap',
        header: 'Nama Lengkap',
        cell: ({ row }: { row: any }) => (
          <div className="font-medium">{row.getValue('nama_lengkap')}</div>
        ),
      },
      {
        accessorKey: 'nama_freelance',
        header: 'Nama Freelance',
        cell: ({ row }: { row: any }) => (
          <div>{row.getValue('nama_freelance') || '-'}</div>
        ),
      },
    ] : []),
    {
      accessorKey: 'tanggal',
      header: 'Tanggal',
      cell: ({ row }: { row: any }) => (
        <div>{new Date(row.getValue('tanggal')).toLocaleDateString('id-ID')}</div>
      ),
    },
    {
      accessorKey: 'shipment_id',
      header: 'Shipment ID',
    },
    {
      accessorKey: 'jumlah_toko',
      header: 'Jumlah Toko',
    },
    {
      accessorKey: 'terkirim',
      header: 'Terkirim',
    },
    {
      accessorKey: 'gagal',
      header: 'Gagal',
    },
    {
      accessorKey: 'alasan',
      header: 'Alasan',
      cell: ({ row }: { row: any }) => (
        <div className="max-w-xs truncate">{row.getValue('alasan') || '-'}</div>
      ),
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }: { row: any }) => {
        const shipment = row.original as ShipmentData
        
        return (
          <div className="flex space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(shipment)}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                title="Edit"
              >
                <Edit size={16} />
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={() => onDelete(shipment)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
                title="Hapus"
              >
                <Trash2 size={16} />
              </button>
            )}
            
            {isAdmin && shipment.nama_freelance && onFreelanceCost && (
              <button
                onClick={() => onFreelanceCost(shipment)}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
                title="Biaya Freelance"
              >
                <DollarSign size={16} />
              </button>
            )}
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="neumorphic p-6">
      {/* Header dengan Search */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-text-primary">
          TABEL RINCIAN SHIPMENT
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={20} />
          <input
            type="text"
            placeholder="Cari berdasarkan tanggal, nama, atau shipment..."
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10 pr-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
          />
        </div>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-azure-bg">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-semibold text-text-primary border-b border-azure-shadow-dark"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: ' ↑',
                          desc: ' ↓',
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-azure-bg/50 border-b border-azure-shadow-dark/20">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-sm text-text-secondary">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-text-secondary">
          Menampilkan {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )} dari {table.getFilteredRowModel().rows.length} data
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-2 rounded-lg border border-azure-shadow-dark disabled:opacity-50 disabled:cursor-not-allowed hover:bg-azure-bg"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-text-primary">
            Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-2 rounded-lg border border-azure-shadow-dark disabled:opacity-50 disabled:cursor-not-allowed hover:bg-azure-bg"
          >
            <ChevronRight size={16} />
          </button>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="px-3 py-1 border border-azure-shadow-dark rounded-lg text-sm"
          >
            {[10, 15, 20, 30, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Tampilkan {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}