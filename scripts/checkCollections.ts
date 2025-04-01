import mongoose from 'mongoose';
import Course from '../src/models/Course';
import Assessment from '../src/models/Assessment';
import Result from '../src/models/Result';
import CareerPath from '../src/models/CareerPath';

async function checkCollections() {
  try {
    await mongoose.connect('mongodb://localhost:27017/careerhub');
    console.log('Successfully connected to MongoDB.\n');
    
    // Check courses
    console.log('=== Courses ===');
    const courses = await Course.find().lean();
    for (const course of courses) {
      console.log(`- ${course.title}`);
      console.log(`  Code: ${course.code}`);
      console.log(`  Career Pathways: ${course.careerPathways?.join(', ') || 'None'}`);
      console.log(`  Skills: ${course.skillsDeveloped?.join(', ') || 'None'}\n`);
    }

    // Check career paths
    console.log('\n=== Career Paths ===');
    const careerPaths = await CareerPath.find().lean();
    for (const path of careerPaths) {
      console.log(`- ${path.title}`);
      console.log(`  Required Skills: ${path.requiredSkills?.join(', ') || 'None'}\n`);
    }

    // Check assessments
    console.log('\n=== Assessments ===');
    const assessments = await Assessment.find().populate('questions').lean();
    for (const assessment of assessments) {
      console.log(`- ${assessment.title}`);
      console.log(`  Type: ${assessment.type}`);
      console.log(`  Questions: ${assessment.questions?.length || 0}\n`);
    }

    // Check recent results
    console.log('\n=== Recent Results ===');
    const results = await Result.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('assessmentId')
      .lean();
    
    for (const result of results) {
      const assessment = result.assessmentId as any;
      console.log(`- Assessment: ${assessment?.title || 'Unknown'}`);
      console.log(`  Score: ${result.score}`);
      console.log(`  Recommended Courses: ${result.recommendedCourses?.length || 0}`);
      console.log(`  Career Pathways: ${result.careerPathways?.join(', ') || 'None'}\n`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkCollections(); 