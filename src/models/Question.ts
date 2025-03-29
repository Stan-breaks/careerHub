import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOption {
  text: string;
  value: number;
}

export interface IQuestion extends Document {
  text: string;
  type: 'multiple-choice' | 'likert-scale';
  options: IOption[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OptionSchema = new Schema({
  text: {
    type: String,
    required: [true, 'Please provide option text'],
    trim: true,
  },
  value: {
    type: Number,
    required: [true, 'Please provide option value'],
  },
});

const QuestionSchema: Schema = new Schema(
  {
    text: {
      type: String,
      required: [true, 'Please provide question text'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['multiple-choice', 'likert-scale'],
      required: [true, 'Please specify question type'],
    },
    options: [OptionSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Create model if it doesn't exist
const Question: Model<IQuestion> = 
  mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);

export default Question; 