import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Event, { EventStatus } from '../models/Event.model';
import SwapRequest, { SwapStatus } from '../models/SwapRequest.model';
import { swapRequestSchema, swapResponseSchema } from '../schemas/validators';
import createError from 'http-errors';
import logger from '../utils/logger';
import { io } from '../server'; 

export async function createSwapRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = swapRequestSchema.parse(req.body);
    const { mySlotId, theirSlotId } = parsed;

    if (mySlotId === theirSlotId) throw createError(400, 'Slots must be different');

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const mySlot = await Event.findById(mySlotId).session(session);
      const theirSlot = await Event.findById(theirSlotId).session(session);

      if (!mySlot || !theirSlot) throw createError(404, 'Slot(s) not found');

      if (mySlot.owner.toString() !== req.user.id) throw createError(403, 'You do not own mySlotId');
      if (theirSlot.owner.toString() === req.user.id) throw createError(400, 'Cannot request your own slot');

      if (mySlot.status !== EventStatus.SWAPPABLE || theirSlot.status !== EventStatus.SWAPPABLE) {
        throw createError(400, 'Both slots must be SWAPPABLE');
      }

      const swap = await SwapRequest.create([{
        myUser: req.user.id,
        theirUser: theirSlot.owner,
        mySlot: mySlot._id,
        theirSlot: theirSlot._id,
        status: SwapStatus.PENDING
      }], { session });

      mySlot.status = EventStatus.SWAP_PENDING;
      theirSlot.status = EventStatus.SWAP_PENDING;
      await mySlot.save({ session });
      await theirSlot.save({ session });

      await session.commitTransaction();
      session.endSession();

      const created = swap[0] as any;
      try {
        io.to(String(theirSlot.owner)).emit('swap:incoming', { requestId: String(created._id), from: req.user.id });
      } catch (e) {
        logger.warn('Socket notify failed: ' + String(e));
      }

      res.status(201).json(created);
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  } catch (err) {
    next(err);
  }
}

export async function respondSwapRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = swapResponseSchema.parse(req.body);
    const { accept } = parsed;
    const requestId = req.params.requestId;

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const swap = await SwapRequest.findById(requestId).session(session);
      if (!swap) throw createError(404, 'Swap request not found');
      if (swap.theirUser.toString() !== req.user.id) throw createError(403, 'Not allowed to respond');

      if (swap.status !== SwapStatus.PENDING) throw createError(400, 'Swap is not pending');

      const mySlot = await Event.findById(swap.mySlot).session(session);
      const theirSlot = await Event.findById(swap.theirSlot).session(session);

      if (!mySlot || !theirSlot) throw createError(404, 'One or both slots not found');

      if (accept) {
        if (mySlot.status !== EventStatus.SWAP_PENDING || theirSlot.status !== EventStatus.SWAP_PENDING) {
          throw createError(409, 'One or both slots are no longer available for swap');
        }

        const myOwner = mySlot.owner;
        const theirOwner = theirSlot.owner;

        mySlot.owner = theirOwner;
        theirSlot.owner = myOwner;

        mySlot.status = EventStatus.BUSY;
        theirSlot.status = EventStatus.BUSY;

        await mySlot.save({ session });
        await theirSlot.save({ session });

        swap.status = SwapStatus.ACCEPTED;
        await swap.save({ session });

        await session.commitTransaction();
        session.endSession();

        io.to(String(swap.myUser)).emit('swap:accepted', { requestId: String(swap._id) });
        io.to(String(swap.theirUser)).emit('swap:accepted', { requestId: String(swap._id) });

        res.json({ success: true, status: 'ACCEPTED' });
      } else {
        mySlot.status = EventStatus.SWAPPABLE;
        theirSlot.status = EventStatus.SWAPPABLE;
        await mySlot.save({ session });
        await theirSlot.save({ session });

        swap.status = SwapStatus.REJECTED;
        await swap.save({ session });

        await session.commitTransaction();
        session.endSession();

        io.to(String(swap.myUser)).emit('swap:rejected', { requestId: String(swap._id) });

        res.json({ success: true, status: 'REJECTED' });
      }
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  } catch (err) {
    next(err);
  }
}

export const getMySwapRequests = async (req: Request, res: Response) => {
  const userId = req.user.id;

  const incoming = await SwapRequest.find({ to: userId, status: "PENDING" })
    .populate("myUser theirUser")
    .sort({ createdAt: -1 });

  const outgoing = await SwapRequest.find({ from: userId })
    .populate("myUser theirUser")
    .sort({ createdAt: -1 });

  res.json({ incoming, outgoing });
};
