import { Request, Response } from 'express';
import SupportTicket from '../models/SupportTicket.model';
import PlatformAuditLog from '../models/PlatformAuditLog.model';

const generateTicketNumber = async (): Promise<string> => {
  const count = await SupportTicket.countDocuments();
  return `TKT-${String(count + 1).padStart(6, '0')}`;
};

// @desc    Get all tickets
// @route   GET /api/v1/super-admin/tickets
export const getTickets = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const query: any = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.priority) query.priority = req.query.priority;
    if (req.query.tenantId) query.tenantId = req.query.tenantId;
    if (req.query.assignedTo) query.assignedTo = req.query.assignedTo;

    const [tickets, total] = await Promise.all([
      SupportTicket.find(query)
        .populate('tenantId', 'name code')
        .populate('raisedBy', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email')
        .sort({ createdAt: -1 }).skip(skip).limit(limit),
      SupportTicket.countDocuments(query)
    ]);

    const stats = {
      open: await SupportTicket.countDocuments({ status: 'OPEN' }),
      inProgress: await SupportTicket.countDocuments({ status: 'IN_PROGRESS' }),
      critical: await SupportTicket.countDocuments({ priority: 'CRITICAL', status: { $ne: 'CLOSED' } }),
      unassigned: await SupportTicket.countDocuments({ assignedTo: null, status: { $ne: 'CLOSED' } }),
    };

    res.json({ success: true, data: tickets, pagination: { total, page, pages: Math.ceil(total / limit) }, stats });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch tickets' });
  }
};

// @desc    Create ticket
// @route   POST /api/v1/super-admin/tickets
export const createTicket = async (req: Request, res: Response) => {
  try {
    const ticketNumber = await generateTicketNumber();
    const ticket = await SupportTicket.create({
      ...req.body,
      ticketNumber,
      raisedBy: (req as any).user?._id,
    });
    res.status(201).json({ success: true, data: ticket, message: `Ticket ${ticketNumber} created.` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create ticket' });
  }
};

// @desc    Update ticket
// @route   PUT /api/v1/super-admin/tickets/:id
export const updateTicket = async (req: Request, res: Response) => {
  try {
    const { status, assignedTo, priority, resolution } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    if (status) ticket.status = status;
    if (assignedTo !== undefined) ticket.assignedTo = assignedTo;
    if (priority) ticket.priority = priority;
    if (resolution) ticket.resolution = resolution;
    if (status === 'RESOLVED') ticket.resolvedAt = new Date();
    if (status === 'CLOSED') ticket.closedAt = new Date();

    await ticket.save();
    res.json({ success: true, data: ticket, message: 'Ticket updated.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update ticket' });
  }
};

// @desc    Get ticket by ID
// @route   GET /api/v1/super-admin/tickets/:id
export const getTicketById = async (req: Request, res: Response) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('tenantId', 'name code adminEmail')
      .populate('raisedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email');
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, data: ticket });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch ticket' });
  }
};
