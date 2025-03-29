import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IResult extends Document {
  userId: mongoose.Types.ObjectId;
  assessmentId: mongoose.Types.ObjectId;
  answers: Array<{
    questionId: mongoose.Types.ObjectId;
    selectedOption: number;
  }>;
  score: number;
  recommendations: string[];
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ResultSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question',
          required: true,
        },
        selectedOption: {
          type: Number,
          required: true,
        },
      },
    ],
    score: {
      type: Number,
      required: true,
    },
    recommendations: [
      {
        type: String,
      },
    ],
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create model if it doesn't exist
const Result: Model<IResult> = 
  mongoose.models.Result || mongoose.model<IResult>('Result', ResultSchema);

export default Result; 