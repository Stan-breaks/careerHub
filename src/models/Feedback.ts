import mongoose, { Schema, Document, Model } from 'mongoose';

// Feedback interface
export interface IFeedback extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'bug' | 'feature' | 'general';
  title: string;
  description: string;
  reviewed: boolean;
  reviewedBy?: mongoose.Types.ObjectId;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

// Feedback Schema
const FeedbackSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['bug', 'feature', 'general'],
      required: [true, 'Please specify feedback type'],
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      trim: true,
    },
    reviewed: {
      type: Boolean,
      default: false,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'resolved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Use mongoose.models.Feedback if it exists, otherwise create a new model
const Feedback: Model<IFeedback> = 
  mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema);

export default Feedback; 