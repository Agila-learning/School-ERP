import { Request, Response } from 'express';
import PlatformAnnouncement from '../models/PlatformAnnouncement.model';

// @desc    Get all announcements
// @route   GET /api/v1/super-admin/announcements
export const getAnnouncements = async (req: Request, res: Response) => {
  try {
    const query: any = {};
    if (req.query.status) query.status = req.query.status;
    const announcements = await PlatformAnnouncement.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: announcements });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch announcements' });
  }
};

// @desc    Create announcement
// @route   POST /api/v1/super-admin/announcements
export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const ann = await PlatformAnnouncement.create({ ...req.body, createdBy: (req as any).user?._id });
    res.status(201).json({ success: true, data: ann, message: 'Announcement created.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create announcement' });
  }
};

// @desc    Publish announcement
// @route   PATCH /api/v1/super-admin/announcements/:id/publish
export const publishAnnouncement = async (req: Request, res: Response) => {
  try {
    const ann = await PlatformAnnouncement.findByIdAndUpdate(req.params.id, { status: 'PUBLISHED', publishedAt: new Date() }, { new: true });
    if (!ann) return res.status(404).json({ success: false, message: 'Announcement not found' });
    res.json({ success: true, data: ann, message: 'Announcement published.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to publish' });
  }
};

// @desc    Update announcement
// @route   PUT /api/v1/super-admin/announcements/:id
export const updateAnnouncement = async (req: Request, res: Response) => {
  try {
    const ann = await PlatformAnnouncement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ann) return res.status(404).json({ success: false, message: 'Announcement not found' });
    res.json({ success: true, data: ann });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update announcement' });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/v1/super-admin/announcements/:id
export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    await PlatformAnnouncement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Announcement deleted.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to delete announcement' });
  }
};
