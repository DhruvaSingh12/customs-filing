import { RequestHandler } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

// CREATE
export const createFiling: RequestHandler = async (req, res) => {
  try {
    const body = req.body ?? {};
    const {
      shipment_id,
      invoice_no,
      invoice_date,
      port_code,
      exporter_gstin = '',
      import_export_flag,
      total_invoice_value,
      currency_code,
      items = [],
    } = body;

    if (!shipment_id || !invoice_no || !invoice_date || !port_code || !import_export_flag || total_invoice_value == null || !currency_code) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    if (exporter_gstin && !GSTIN_REGEX.test(exporter_gstin)) {
      res.status(400).json({ error: 'Invalid exporter_gstin format' });
      return;
    }

    const existing = await prisma.filing.findUnique({ where: { invoice_no }, select: { id: true } });
    if (existing) {
      res.status(409).json({ error: 'Invoice number already exists' });
      return;
    }

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
        items: { create: items },
      },
      include: { items: true },
    });

    res.status(201).json(filing);
    return;
  } catch (error) {
    console.error('❌ createFiling error:', error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002' &&
      Array.isArray(error.meta?.target) &&
      (error.meta.target as string[]).includes('invoice_no')
    ) {
      res.status(409).json({ error: 'Invoice number already exists' });
      return;
    }
    res.status(500).json({ error: 'Failed to create filing' });
    return;
  }
};

// LIST ALL
export const getAllFilings: RequestHandler = async (_req, res) => {
  try {
    const filings = await prisma.filing.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(filings);
    return;
  } catch (error) {
    console.error('❌ getAllFilings error:', error);
    res.status(500).json({ error: 'Failed to fetch filings' });
    return;
  }
};

// GET ONE
export const getFilingById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const filing = await prisma.filing.findUnique({ where: { id }, include: { items: true } });
    if (!filing) {
      res.status(404).json({ error: 'Filing not found' });
      return;
    }
    res.status(200).json(filing);
    return;
  } catch (error) {
    console.error('❌ getFilingById error:', error);
    res.status(500).json({ error: 'Failed to fetch filing' });
    return;
  }
};

// UPDATE
export const updateFiling: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body ?? {};
    const {
      shipment_id,
      invoice_no,
      invoice_date,
      port_code,
      exporter_gstin = '',
      import_export_flag,
      total_invoice_value,
      currency_code,
      items = [],
    } = body;

    if (exporter_gstin && !GSTIN_REGEX.test(exporter_gstin)) {
      res.status(400).json({ error: 'Invalid exporter_gstin format' });
      return;
    }

    const existing = await prisma.filing.findUnique({ where: { id }, select: { status: true, invoice_no: true } });
    if (!existing) {
      res.status(404).json({ error: 'Filing not found' });
      return;
    }
    if (existing.status !== 'draft') {
      res.status(409).json({ error: 'Cannot edit a submitted filing' });
      return;
    }

    if (invoice_no && invoice_no !== existing.invoice_no) {
      const conflict = await prisma.filing.findUnique({ where: { invoice_no } });
      if (conflict) {
        res.status(409).json({ error: 'Invoice number already exists' });
        return;
      }
    }

    const updated = await prisma.filing.update({
      where: { id },
      data: {
        shipment_id,
        invoice_no,
        invoice_date: new Date(invoice_date),
        port_code,
        exporter_gstin,
        import_export_flag,
        total_invoice_value,
        currency_code,
        items: { deleteMany: {}, create: items },
      },
      include: { items: true },
    });

    res.status(200).json(updated);
    return;
  } catch (error) {
    console.error('❌ updateFiling error:', error);
    res.status(500).json({ error: 'Failed to update filing' });
    return;
  }
};

// DELETE
export const deleteFiling: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.filing.delete({ where: { id } });
    res.status(204).send();
    return;
  } catch (error) {
    console.error('❌ deleteFiling error:', error);
    res.status(500).json({ error: 'Failed to delete filing' });
    return;
  }
};
