import mongoose, { Schema, Document, Types } from 'mongoose';

export enum EventStatus {
  BUSY = 'BUSY',
  SWAPPABLE = 'SWAPPABLE',
  SWAP_PENDING = 'SWAP_PENDING'
}

export interface IEvent extends Document {
  title: string;
  startTime: Date;
  endTime: Date;
  status: EventStatus;
  owner: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>({
  title: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: Object.values(EventStatus), default: EventStatus.BUSY },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model<IEvent>('Event', EventSchema);
