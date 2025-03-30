import mongoose, { Schema, Document, Model } from 'mongoose';

// Option interfaces
export interface IOption {
  text: string;
  value: number;
}

// Question interface
export interface IQuestion extends Document {
  text: string;
  options: IOption[];
  category: 'personality' | 'career' | 'academic';
}

// Question Schema
const QuestionSchema: Schema = new Schema({
  text: {
    type: String,
    required: [true, 'Please provide a question text'],
  },
  options: [
    {
      text: {
        type: String,
        required: [true, 'Please provide an option text'],
      },
      value: {
        type: Number,
        required: [true, 'Please provide a value for this option'],
      },
    },
  ],
  category: {
    type: String,
    enum: ['personality', 'career', 'academic'],
    required: [true, 'Please specify the question category'],
  },
});

// Create and export the models
const Question = mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);

// Assessment interface
export interface IAssessment extends Document {
  title: string;
  description: string;
  type: 'personality' | 'career' | 'academic';
  questions: mongoose.Types.ObjectId[] | IQuestion[];
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Assessment Schema
const AssessmentSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide assessment title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide assessment description'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['personality', 'career', 'academic'],
      required: [true, 'Please specify assessment type'],
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Create model if it doesn't exist
const Assessment: Model<IAssessment> = 
  mongoose.models.Assessment || mongoose.model<IAssessment>('Assessment', AssessmentSchema);

export { Question };
export default Assessment;