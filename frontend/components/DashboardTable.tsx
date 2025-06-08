"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { FilingWithItems } from "@/types/filing"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Edit, MoreHorizontal, Trash } from "lucide-react"
import type { FilingStatus } from "@prisma/client"

interface DashboardTableProps {
  filings: FilingWithItems[]
  isAdmin?: boolean
}

export function DashboardTable({ filings, isAdmin = false }: DashboardTableProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedFiling, setSelectedFiling] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!selectedFiling) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/filings/${selectedFiling}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete filing")
      }

      setIsDeleteDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Failed to delete filing:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusBadge = (status: FilingStatus) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Draft</Badge>
      case "submitted":
        return <Badge variant="default">Submitted</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString()
  }

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(value)
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice No</TableHead>
              <TableHead>Shipment ID</TableHead>
              <TableHead>Invoice Date</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Status</TableHead>
              {isAdmin && <TableHead>Created By</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-8 text-muted-foreground">
                  No filings found
                </TableCell>
              </TableRow>
            ) : (
              filings.map((filing) => (
                <TableRow key={filing.id}>
                  <TableCell className="font-medium">{filing.invoice_no}</TableCell>
                  <TableCell>{filing.shipment_id}</TableCell>
                  <TableCell>{formatDate(filing.invoice_date)}</TableCell>
                  <TableCell>{formatCurrency(Number(filing.total_invoice_value), filing.currency_code)}</TableCell>
                  <TableCell>{getStatusBadge(filing.status)}</TableCell>
                  {isAdmin && <TableCell>{filing.createdBy?.name || filing.createdBy?.email || "Unknown"}</TableCell>}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`${isAdmin ? "/admin" : "/dashboard"}/filings/${filing.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedFiling(filing.id)
                            setIsDeleteDialogOpen(true)
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this filing?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the filing and all its items.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
