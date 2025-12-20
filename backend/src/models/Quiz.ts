import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizQuestion {
  question: string;
  type: 'multiple-choice' | 'true-false' | 'scale' | 'text';
  options?: string[];
  correctAnswer?: string | number;
}

export interface IQuiz extends Document {
  userId: mongoose.Types.ObjectId;
  takerId?: mongoose.Types.ObjectId;
  mode: 'love' | 'friends';
  type: 'solo' | 'compatibility';
  code?: string;
  questions: IQuizQuestion[];
  answers?: Record<string, any>;
  creatorAnswers?: Record<string, any>;
  takerAnswers?: Record<string, any>;
  score?: number;
  completed: boolean;
  status: 'created' | 'waiting_for_taker' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const QuizQuestionSchema = new Schema<IQuizQuestion>({
  question: { type: String, required: true },
  type: { type: String, enum: ['multiple-choice', 'true-false', 'scale', 'text'], required: true },
  options: [{ type: String }],
  correctAnswer: Schema.Types.Mixed,
}, { _id: false });

const QuizSchema = new Schema<IQuiz>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Creator
    takerId: { type: Schema.Types.ObjectId, ref: 'User' }, // Taker (optional initially)
    mode: { type: String, enum: ['love', 'friends'], required: true },
    type: { type: String, enum: ['solo', 'compatibility'], default: 'solo' },
    code: { type: String, unique: true, sparse: true }, // Share code
    questions: [QuizQuestionSchema],
    answers: { type: Schema.Types.Mixed }, // Creator's answers (legacy support + solo)
    creatorAnswers: { type: Schema.Types.Mixed }, // Explicit creator answers
    takerAnswers: { type: Schema.Types.Mixed }, // Taker's answers
    score: { type: Number },
    completed: { type: Boolean, default: false },
    status: { type: String, enum: ['created', 'waiting_for_taker', 'completed'], default: 'created' },
  },
  {
    timestamps: true,
  }
);

QuizSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IQuiz>('Quiz', QuizSchema);

