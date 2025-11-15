import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  chatId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content: string;
  messageType: 'text' | 'image' | 'video' | 'system';
  encrypted: boolean;
  readAt?: Date;
  createdAt: Date;
}

export interface IChat extends Document {
  participants: mongoose.Types.ObjectId[];
  mode: 'love' | 'friends';
  lastMessage?: mongoose.Types.ObjectId;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    chatId: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    messageType: {
      type: String,
      enum: ['text', 'image', 'video', 'system'],
      default: 'text',
    },
    encrypted: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

const ChatSchema = new Schema<IChat>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    mode: { type: String, enum: ['love', 'friends'], required: true },
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
    lastMessageAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

MessageSchema.index({ chatId: 1, createdAt: -1 });
ChatSchema.index({ participants: 1 });
ChatSchema.index({ lastMessageAt: -1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
export default mongoose.model<IChat>('Chat', ChatSchema);

