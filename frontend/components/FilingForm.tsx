"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { FilingFormData, FilingWithItems } from "@/types/filing"
import { Trash, Plus } from "lucide-react"

enum FilingStatus {
  draft = "draft",
  submitted = "submitted",
  error = "error"
}

// Define the schema for filing items
const filingItemSchema = z.object({
  id: z.string().optional(),
  item_id: z.string().optional(),
  commodity_desc: z.string().min(1, "Description is required"),
  hs_code: z.string().min(1, "HS Code is required"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unit_code: z.string().min(1, "Unit code is required"),
  unit_price: z.coerce.number().positive("Unit price must be positive"),
  line_item_value: z.coerce.number().positive("Line item value must be positive"),
  origin_country_code: z.string().length(2, "Country code must be 2 characters"),
  net_mass: z.coerce.number().positive("Net mass must be positive").optional(),
  gross_mass: z.coerce.number().positive("Gross mass must be positive").optional(),
})

// Define the schema for the filing form
const filingFormSchema = z.object({
  shipment_id: z.string().min(1, "Shipment ID is required"),
  invoice_no: z.string().min(1, "Invoice number is required"),
  invoice_date: z.string().min(1, "Invoice date is required"),
  port_code: z.string().min(1, "Port code is required"),
  exporter_gstin: z.string().length(15, "GSTIN must be 15 characters").optional(),
  import_export_flag: z.string().length(1, "Flag must be 1 character"),
  total_invoice_value: z.coerce.number().positive("Value must be positive"),
  currency_code: z.string().length(3, "Currency code must be 3 characters"),
  status: z.nativeEnum(FilingStatus),
  items: z.array(filingItemSchema).min(1, "At least one item is required"),
})

interface FilingFormProps {
  filing?: FilingWithItems
  isAdmin?: boolean
  userId: string
}

export function FilingForm({ filing, isAdmin = false, userId }: FilingFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize form with existing filing data or defaults
  // Define interfaces for form data
  interface FilingItemFormData {
    id?: string;
    item_id?: string;
    commodity_desc: string;
    hs_code: string;
    quantity: number;
    unit_code: string;
    unit_price: number;
    line_item_value: number;
    origin_country_code: string;
    net_mass?: number;
    gross_mass?: number;
  }

  interface FilingFormValues extends z.infer<typeof filingFormSchema> {
    items: FilingItemFormData[];
  }

  const form = useForm<FilingFormValues>({
    resolver: zodResolver(filingFormSchema),
    defaultValues: filing
      ? {
          ...filing,
          invoice_date: new Date(filing.invoice_date).toISOString().split("T")[0],
          total_invoice_value: Number(filing.total_invoice_value),
          items: filing.items.map((item: FilingItemFormData) => ({
            ...item,
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
            line_item_value: Number(item.line_item_value),
            net_mass: item.net_mass ? Number(item.net_mass) : undefined,
            gross_mass: item.gross_mass ? Number(item.gross_mass) : undefined,
          })),
        }
      : {
          shipment_id: "",
          invoice_no: "",
          invoice_date: new Date().toISOString().split("T")[0],
          port_code: "",
          exporter_gstin: "",
          import_export_flag: "E", // Default to Export
          total_invoice_value: 0,
          currency_code: "USD", // Default currency
          status: FilingStatus.draft,
          items: [
            {
              commodity_desc: "",
              hs_code: "",
              quantity: 0,
              unit_code: "",
              unit_price: 0,
              line_item_value: 0,
              origin_country_code: "",
            },
          ],
        },
  })

  // Setup field array for items
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const onSubmit = async (data: z.infer<typeof filingFormSchema>) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const apiUrl = `/api/filings${filing ? `/${filing.id}` : ""}`
      const method = filing ? "PUT" : "POST"

      // Add createdById if creating a new filing
      const filingData: FilingFormData = {
        ...data,
        ...(filing ? {} : { createdById: userId }),
      }

      const response = await fetch(apiUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filingData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to save filing")
      }

      // Redirect to filings list
      router.push(isAdmin ? "/admin" : "/dashboard")
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred while saving the filing")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate line item value when quantity or unit price changes
  const calculateLineItemValue = (index: number) => {
    const quantity = form.getValues(`items.${index}.quantity`)
    const unitPrice = form.getValues(`items.${index}.unit_price`)
    const lineItemValue = quantity * unitPrice
    form.setValue(`items.${index}.line_item_value`, lineItemValue)
  }

  // Calculate total invoice value when line item values change
  const calculateTotalInvoiceValue = () => {
    const items = form.getValues("items")
    const total = items.reduce((sum, item) => sum + (item.line_item_value || 0), 0)
    form.setValue("total_invoice_value", total)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{filing ? "Edit Filing" : "New Filing"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="shipment_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shipment ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invoice_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invoice_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="port_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Port Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="exporter_gstin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exporter GSTIN</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={15} />
                    </FormControl>
                    <FormDescription>Must be exactly 15 characters</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="import_export_flag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Import/Export Flag</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select flag" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="I">Import (I)</SelectItem>
                        <SelectItem value="E">Export (E)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency Code</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="INR">INR</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="total_invoice_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Invoice Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={FilingStatus.draft}>Draft</SelectItem>
                        <SelectItem value={FilingStatus.submitted}>Submitted</SelectItem>
                        <SelectItem value={FilingStatus.error}>Error</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-4">Filing Items</h3>
              {fields.map((field, index) => (
                <Card key={field.id} className="mb-4">
                  <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm">Item {index + 1}</CardTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Remove item</span>
                    </Button>
                  </CardHeader>
                  <CardContent className="py-3 px-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.commodity_desc`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.hs_code`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>HS Code</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e)
                                calculateLineItemValue(index)
                                calculateTotalInvoiceValue()
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.unit_code`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Code</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.unit_price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e)
                                calculateLineItemValue(index)
                                calculateTotalInvoiceValue()
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.line_item_value`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Line Item Value</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e)
                                calculateTotalInvoiceValue()
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.origin_country_code`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Origin Country Code</FormLabel>
                          <FormControl>
                            <Input {...field} maxLength={2} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.net_mass`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Net Mass</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.gross_mass`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gross Mass</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() =>
                  append({
                    commodity_desc: "",
                    hs_code: "",
                    quantity: 0,
                    unit_code: "",
                    unit_price: 0,
                    line_item_value: 0,
                    origin_country_code: "",
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : filing ? "Update Filing" : "Create Filing"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
