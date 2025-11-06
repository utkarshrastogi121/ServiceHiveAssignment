import mongoose, { Schema, Document, Types } from 'mongoose';

export enum SwapStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export interface ISwapRequest extends Document {
  myUser: Types.ObjectId;
  theirUser: Types.ObjectId;
  mySlot: Types.ObjectId;
  theirSlot: Types.ObjectId;
  status: SwapStatus;
  createdAt: Date;
  updatedAt: Date;
}

const SwapRequestSchema = new Schema<ISwapRequest>({
  myUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  theirUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  mySlot: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  theirSlot: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  status: { type: String, enum: Object.values(SwapStatus), default: SwapStatus.PENDING }
}, { timestamps: true });

export default mongoose.model<ISwapRequest>('SwapRequest', SwapRequestSchema);
