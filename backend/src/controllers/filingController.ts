// src/controllers/filingController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createFiling = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      shipment_id,
      invoice_no,
      invoice_date,
      port_code,
      exporter_gstin,
      import_export_flag,
      total_invoice_value,
      currency_code,
      items,
    } = req.body;

    const filing = await prisma.filing.create({
      data: {
        shipment_id,
        invoice_no,
        invoice_date: new Date(invoice_date),
        port_code,
        exporter_gstin,
        import_export_flag,
        total_invoice_value,
        currency_code,
        items: {
          create: items,
        },
      },
      include: { items: true },
    });

    res.status(201).json(filing);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create filing' });
  }
};

export const getAllFilings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const filings = await prisma.filing.findMany({
      include: { items: true },
      orderBy: { created_at: 'desc' },
    });

    res.status(200).json(filings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch filings' });
  }
};

export const getFilingById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const filing = await prisma.filing.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!filing) {
      res.status(404).json({ error: 'Filing not found' });
    } else {
      res.status(200).json(filing);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch filing' });
  }
};
