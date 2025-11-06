import { Request, Response, NextFunction } from 'express';
import Event, { EventStatus } from '../models/Event.model';
import { createEventSchema } from '../schemas/validators';
import createError from 'http-errors';
import mongoose from 'mongoose';

export async function createEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createEventSchema.parse(req.body);
    const { title, startTime, endTime, status } = parsed;
    if (new Date(startTime) >= new Date(endTime)) throw createError(400, 'startTime must be before endTime');

    const ev = await Event.create({
      title,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: status || EventStatus.BUSY,
      owner: new mongoose.Types.ObjectId(req.user.id)
    });
    res.status(201).json(ev);
  } catch (err) {
    next(err);
  }
}

export async function getMyEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const events = await Event.find({ owner: req.user.id }).sort({ startTime: 1 });
    res.json(events);
  } catch (err) {
    next(err);
  }
}

export async function updateEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id;
    const data = req.body;
    const event = await Event.findById(id);
    if (!event) throw createError(404, 'Event not found');
    if (event.owner.toString() !== req.user.id) throw createError(403, 'Not allowed');
    if (data.startTime && data.endTime && new Date(data.startTime) >= new Date(data.endTime)) {
      throw createError(400, 'startTime must be before endTime');
    }
    Object.assign(event, data);
    await event.save();
    res.json(event);
  } catch (err) {
    next(err);
  }
}

export async function deleteEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id;
    const event = await Event.findById(id);
    if (!event) throw createError(404, 'Event not found');
    if (event.owner.toString() !== req.user.id) throw createError(403, 'Not allowed');
    await event.deleteOne();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function getSwappableSlots(req: Request, res: Response, next: NextFunction) {
  try {
    const slots = await Event.find({ owner: { $ne: req.user.id }, status: EventStatus.SWAPPABLE }).sort({ startTime: 1 });
    res.json(slots);
  } catch (err) {
    next(err);
  }
}
