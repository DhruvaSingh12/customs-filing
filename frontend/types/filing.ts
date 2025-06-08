import type { Filing, FilingItem, FilingStatus } from "@prisma/client"

export type FilingWithItems = Filing & {
  items: FilingItem[]
  createdBy?: {
    name: string | null
    email: string | null
  } | null
}

export interface FilingFormData {
  shipment_id: string
  invoice_no: string
  invoice_date: Date | string
  port_code: string
  exporter_gstin?: string
  import_export_flag: string
  total_invoice_value: number
  currency_code: string
  status: FilingStatus
  items: FilingItemFormData[]
  createdById?: string
}

export interface FilingItemFormData {
  id?: string
  item_id?: string
  commodity_desc: string
  hs_code: string
  quantity: number
  unit_code: string
  unit_price: number
  line_item_value: number
  origin_country_code: string
  net_mass?: number
  gross_mass?: number
}
