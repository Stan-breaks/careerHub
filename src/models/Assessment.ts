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

// Result interface
export interface IResult extends Document {
  user: mongoose.Types.ObjectId;
  assessment: mongoose.Types.ObjectId;
  answers: Array<{
    question: mongoose.Types.ObjectId;
    selectedOption: number;
  }>;
  score: number;
  recommendations: string[];
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Result Schema
const ResultSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
    },
    answers: [
      {
        question: {
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

// Create Result model if it doesn't exist
const Result: Model<IResult> = 
  mongoose.models.Result || mongoose.model<IResult>('Result', ResultSchema);

export { Question, Result };
export default Assessment; 