import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/nextauth.config"
import { prisma } from "@/lib/prisma"
import type { FilingFormData } from "@/types/filing"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data: FilingFormData = await request.json()

    const filing = await prisma.filing.create({
      data: {
        shipment_id: data.shipment_id,
        invoice_no: data.invoice_no,
        invoice_date: new Date(data.invoice_date),
        port_code: data.port_code,
        exporter_gstin: data.exporter_gstin,
        import_export_flag: data.import_export_flag,
        total_invoice_value: data.total_invoice_value,
        currency_code: data.currency_code,
        status: data.status,
        createdById: session.user.id,
        items: {
          create: data.items.map((item) => ({
            item_id: item.item_id,
            commodity_desc: item.commodity_desc,
            hs_code: item.hs_code,
            quantity: item.quantity,
            unit_code: item.unit_code,
            unit_price: item.unit_price,
            line_item_value: item.line_item_value,
            origin_country_code: item.origin_country_code,
            net_mass: item.net_mass,
            gross_mass: item.gross_mass,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    return NextResponse.json(filing)
  } catch (error) {
    console.error("Error creating filing:", error)
    return NextResponse.json({ error: "Failed to create filing" }, { status: 500 })
  }
}
