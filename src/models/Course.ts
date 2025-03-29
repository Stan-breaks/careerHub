import mongoose, { Schema, Document, Model } from 'mongoose';

// Course interface
export interface ICourse extends Document {
  title: string;
  code: string;
  department: string;
  description: string;
  duration: string;
  level: string;
  instructor?: mongoose.Types.ObjectId;
  careerPathways: string[];
  requirements: string[];
  skillsDeveloped: string[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Course Schema
const CourseSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide course title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Please provide course code'],
      trim: true,
      unique: true,
    },
    department: {
      type: String,
      required: [true, 'Please provide department'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide course description'],
      trim: true,
    },
    duration: {
      type: String,
      required: [true, 'Please provide course duration'],
      trim: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    careerPathways: [
      {
        type: String,
        trim: true,
      },
    ],
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    skillsDeveloped: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Create model if it doesn't exist
const Course: Model<ICourse> = 
  mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);

export default Course; 