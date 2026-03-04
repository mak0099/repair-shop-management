"use client";

import { useFormContext } from "react-hook-form"; // Changed from useForm, FormProvider
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { TextField } from "@/components/forms/text-field";
import { TextareaField } from "@/components/forms/textarea-field";
import { CheckboxField } from "@/components/forms/checkbox-field";
import { SelectField } from "@/components/forms/select-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { InvoiceSetup } from "../invoice-setup.schema";
import { useUpdateInvoiceSetup } from "../invoice-setup.api"; // Removed useInvoiceSetup

interface InvoiceSetupFormProps {
  initialData: InvoiceSetup | null | undefined; // Added prop for initialData
}

export function InvoiceSetupForm({ initialData }: InvoiceSetupFormProps) {
  // Removed useInvoiceSetup, as data fetching is now in the parent
  const { mutate: updateConfig, isPending } = useUpdateInvoiceSetup();

  // Get form context from parent FormProvider
  const form = useFormContext<InvoiceSetup>();

  function onSubmit(data: InvoiceSetup) {
    updateConfig(
      { id: initialData?.id || "current", data },
      {
        onSuccess: () => toast.success("Invoice settings updated"),
        onError: (err: Error) => toast.error(err.message),
      }
    );
  }

  const dateFormatOptions = [
    { label: "DD/MM/YYYY (31/12/2024)", value: "dd/MM/yyyy" },
    { label: "MM/DD/YYYY (12/31/2024)", value: "MM/dd/yyyy" },
    { label: "YYYY-MM-DD (2024-12-31)", value: "yyyy-MM-dd" },
    { label: "DD MMM YYYY (31 Dec 2024)", value: "dd MMM yyyy" },
  ];

  const paperSizeOptions = [
    { label: "A4 (Standard)", value: "A4" },
    { label: "A5 (Half Page)", value: "A5" },
    { label: "Thermal (80mm POS)", value: "Thermal 80mm" },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Invoice Configuration</CardTitle>
      </CardHeader>
      <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="shop">Shop Info</TabsTrigger>
                  <TabsTrigger value="labels">Labels</TabsTrigger>
                  <TabsTrigger value="footer">Footer</TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField control={form.control} name="invoicePrefix" label="Invoice Prefix" placeholder="INV-" />
                    <TextField control={form.control} name="nextInvoiceNumber" label="Next Invoice No." type="number" />
                    <SelectField 
                      control={form.control} 
                      name="dateFormat" 
                      label="Date Format" 
                      placeholder="Select format"
                      options={dateFormatOptions}
                    />
                    <SelectField 
                      control={form.control} 
                      name="templateSize" 
                      label="Paper Size" 
                      placeholder="Select size"
                      options={paperSizeOptions}
                    />
                  </div>
                  <div className="flex gap-6 pt-2">
                    <CheckboxField control={form.control} name="showLogo" label="Show Shop Logo" />
                    <CheckboxField control={form.control} name="showSignature" label="Show Signature Line" />
                  </div>
                </TabsContent>

                {/* Shop Information */}
                <TabsContent value="shop" className="space-y-4 pt-4">
                  <TextField control={form.control} name="shopName" label="Shop Name" placeholder="My Repair Shop" />
                  <TextareaField control={form.control} name="shopAddress" label="Shop Address" rows={2} placeholder="123 Street, City..." />
                  <TextField control={form.control} name="shopContact" label="Contact Info" placeholder="Phone / Email" />
                </TabsContent>

                {/* Labels Customization */}
                <TabsContent value="labels" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4 border p-4 rounded-lg bg-slate-50/50">
                      <h4 className="font-bold text-xs uppercase text-slate-500">Header & Customer</h4>
                      <TextField control={form.control} name="invoiceTitle" label="Invoice Title" placeholder="INVOICE / RECEIPT" />
                      <TextField control={form.control} name="invoiceNumberLabel" label="Invoice No. Label" placeholder="Invoice #" />
                      <TextField control={form.control} name="dateLabel" label="Date Label" placeholder="Date" />
                      <TextField control={form.control} name="customerInfoLabel" label="Customer Info Label" placeholder="Bill To" />
                      <TextField control={form.control} name="paymentMethodLabel" label="Payment Method Label" placeholder="Payment Method" />
                    </div>
                    
                    <div className="space-y-4 border p-4 rounded-lg bg-slate-50/50">
                      <h4 className="font-bold text-xs uppercase text-slate-500">Table Columns</h4>
                      <TextField control={form.control} name="itemColumnLabel" label="Item Column" placeholder="Description" />
                      <TextField control={form.control} name="quantityColumnLabel" label="Qty Column" placeholder="Qty" />
                      <TextField control={form.control} name="priceColumnLabel" label="Price Column" placeholder="Price" />
                      <TextField control={form.control} name="totalColumnLabel" label="Total Column" placeholder="Total" />
                    </div>

                    <div className="space-y-4 border p-4 rounded-lg bg-slate-50/50 md:col-span-2">
                      <h4 className="font-bold text-xs uppercase text-slate-500">Totals & Summary</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <TextField control={form.control} name="subtotalLabel" label="Subtotal Label" placeholder="Subtotal" />
                        <TextField control={form.control} name="taxLabel" label="Tax Label" placeholder="Tax / VAT" />
                        <TextField control={form.control} name="discountLabel" label="Discount Label" placeholder="Discount" />
                        <TextField control={form.control} name="grandTotalLabel" label="Grand Total Label" placeholder="Grand Total" />
                        <TextField control={form.control} name="amountPaidLabel" label="Amount Paid Label" placeholder="Amount Paid" />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Footer Settings */}
                <TabsContent value="footer" className="space-y-4 pt-4">
                  <TextField control={form.control} name="thankYouMessage" label="Thank You Message" placeholder="Thank you for your business!" />
                  <TextareaField control={form.control} name="termsAndConditions" label="Terms & Conditions" rows={4} placeholder="Warranty terms..." />
                  <TextField control={form.control} name="signatureLabel" label="Signature Label" placeholder="Authorized Signature" />
                </TabsContent>
              </Tabs>

              <Button type="submit" disabled={isPending} className="w-full bg-slate-900 hover:bg-slate-800">
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Configuration
              </Button>
            </form>
          </Form>
      </CardContent>
    </Card>
  );
}