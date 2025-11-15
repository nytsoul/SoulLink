import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizQuestion {
  question: string;
  type: 'multiple-choice' | 'true-false' | 'scale' | 'text';
  options?: string[];
  correctAnswer?: string | number;
}

export interface IQuiz extends Document {
  userId: mongoose.Types.ObjectId;
  mode: 'love' | 'friends';
  questions: IQuizQuestion[];
  answers?: Record<string, any>;
  score?: number;
  completed: boolean;
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
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    mode: { type: String, enum: ['love', 'friends'], required: true },
    questions: [QuizQuestionSchema],
    answers: { type: Schema.Types.Mixed },
    score: { type: Number },
    completed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

QuizSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IQuiz>('Quiz', QuizSchema);

