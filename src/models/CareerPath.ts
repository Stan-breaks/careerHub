import mongoose, { Schema, Document } from 'mongoose';

export interface ICareerPath extends Document {
  title: string;
  description: string;
  requiredSkills: string[];
  recommendedAssessments: string[];
  averageSalary: {
    entry: number;
    mid: number;
    senior: number;
  };
  growthPotential: number; // 1-5 scale
  educationRequirements: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CareerPathSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  requiredSkills: [{
    type: String,
    required: true,
  }],
  recommendedAssessments: [{
    type: Schema.Types.ObjectId,
    ref: 'Assessment',
  }],
  averageSalary: {
    entry: {
      type: Number,
      required: true,
    },
    mid: {
      type: Number,
      required: true,
    },
    senior: {
      type: Number,
      required: true,
    },
  },
  growthPotential: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  educationRequirements: [{
    type: String,
    required: true,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.CareerPath || mongoose.model<ICareerPath>('CareerPath', CareerPathSchema); 