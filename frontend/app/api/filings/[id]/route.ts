import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions, Role } from "@/lib/nextauth.config"
import { prisma } from "@/lib/prisma"
import type { FilingFormData } from "@/types/filing"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  // let TS infer types for context to satisfy ParamCheck
  const { id: filingId } = params

  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data: FilingFormData = await request.json()

    const existingFiling = await prisma.filing.findUnique({ where: { id: filingId } })
    if (!existingFiling) {
      return NextResponse.json({ error: "Filing not found" }, { status: 404 })
    }

    if (session.user.role !== Role.admin && existingFiling.createdById !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.filingItem.deleteMany({ where: { filingId } })

    const filing = await prisma.filing.update({
      where: { id: filingId },
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
        items: {
          create: data.items.map(item => ({
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
      include: { items: true },
    })

    return NextResponse.json(filing)
  } catch (error) {
    console.error("Error updating filing:", error)
    return NextResponse.json({ error: "Failed to update filing" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id: filingId } = params
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existingFiling = await prisma.filing.findUnique({ where: { id: filingId } })
    if (!existingFiling) {
      return NextResponse.json({ error: "Filing not found" }, { status: 404 })
    }

    if (session.user.role !== Role.admin && existingFiling.createdById !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.filing.delete({ where: { id: filingId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting filing:", error)
    return NextResponse.json({ error: "Failed to delete filing" }, { status: 500 })
  }
}
