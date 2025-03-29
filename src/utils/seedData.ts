import mongoose from 'mongoose';
import Question from '@/models/Question';
import Assessment from '@/models/Assessment';
import Course from '@/models/Course';
import CareerPath from '@/models/CareerPath';
import dbConnect from '@/lib/mongodb';

/**
 * This function checks if default assessments already exist and creates them if they don't
 */
export async function seedDefaultAssessments(adminId: string): Promise<void> {
  await dbConnect();
  
  // Check if assessments already exist
  const assessmentCount = await Assessment.countDocuments();
  if (assessmentCount > 0) {
    console.log('Assessments already exist, skipping seed');
    return;
  }
  
  // Create default questions for Career Aptitude Assessment
  const careerQuestions = [
    {
      text: "How do you prefer to solve problems?",
      type: "multiple-choice" as const,
      options: [
        { text: "Methodically analyzing all available information", value: 8 },
        { text: "Following your intuition and gut feeling", value: 4 },
        { text: "Discussing with others to reach a consensus", value: 6 },
        { text: "Trial and error until finding a solution", value: 2 }
      ],
      createdBy: new mongoose.Types.ObjectId(adminId)
    },
    {
      text: "Which work environment would you thrive in most?",
      type: "multiple-choice" as const,
      options: [
        { text: "A structured office with clear procedures", value: 8 },
        { text: "A creative space with flexible hours", value: 5 },
        { text: "A collaborative team setting with frequent interaction", value: 6 },
        { text: "A remote position with independent workflow", value: 7 }
      ],
      createdBy: new mongoose.Types.ObjectId(adminId)
    },
    {
      text: "When learning something new, you prefer to:",
      type: "multiple-choice" as const,
      options: [
        { text: "Read detailed documentation and follow step-by-step guides", value: 7 },
        { text: "Watch someone demonstrate and then try it yourself", value: 5 },
        { text: "Jump right in and learn through practice", value: 3 },
        { text: "Discuss the theory behind it before applying", value: 8 }
      ],
      createdBy: new mongoose.Types.ObjectId(adminId)
    },
    {
      text: "When working on a project, what aspect is most important to you?",
      type: "multiple-choice" as const,
      options: [
        { text: "Meeting deadlines and staying on schedule", value: 6 },
        { text: "Creating innovative and unique solutions", value: 8 },
        { text: "Ensuring the highest quality output", value: 7 },
        { text: "Collaborating effectively with team members", value: 5 }
      ],
      createdBy: new mongoose.Types.ObjectId(adminId)
    },
    {
      text: "How do you handle unexpected challenges?",
      type: "multiple-choice" as const,
      options: [
        { text: "Carefully analyze the situation before proceeding", value: 7 },
        { text: "Adapt quickly and find alternative approaches", value: 8 },
        { text: "Seek advice from colleagues or mentors", value: 4 },
        { text: "Follow established protocols for handling issues", value: 6 }
      ],
      createdBy: new mongoose.Types.ObjectId(adminId)
    }
  ];

  // Create default questions for Tech Personality Assessment
  const techQuestions = [
    {
      text: "How do you approach learning new technologies?",
      type: "multiple-choice" as const,
      options: [
        { text: "I dive deep into documentation and technical specifications", value: 8 },
        { text: "I prefer hands-on experimentation to see how things work", value: 6 },
        { text: "I look for tutorials and guided courses", value: 4 },
        { text: "I collaborate with others who already understand it", value: 3 }
      ],
      createdBy: new mongoose.Types.ObjectId(adminId)
    },
    {
      text: "When debugging a complex problem, you typically:",
      type: "multiple-choice" as const,
      options: [
        { text: "Systematically isolate variables until finding the root cause", value: 9 },
        { text: "Use intuition based on past experiences", value: 6 },
        { text: "Collaborate with team members to brainstorm solutions", value: 5 },
        { text: "Start over with a different approach", value: 3 }
      ],
      createdBy: new mongoose.Types.ObjectId(adminId)
    },
    {
      text: "What motivates you most in your work?",
      type: "multiple-choice" as const,
      options: [
        { text: "Creating elegant, efficient solutions to technical challenges", value: 8 },
        { text: "Continuous learning and mastering new skills", value: 7 },
        { text: "Building products that positively impact users", value: 6 },
        { text: "Recognition from peers and advancement opportunities", value: 4 }
      ],
      createdBy: new mongoose.Types.ObjectId(adminId)
    },
    {
      text: "How do you handle tight deadlines?",
      type: "multiple-choice" as const,
      options: [
        { text: "Create a detailed plan and methodically work through it", value: 8 },
        { text: "Focus intensely and work long hours until completion", value: 6 },
        { text: "Prioritize critical components and negotiate on less important ones", value: 7 },
        { text: "Bring in additional resources or team members", value: 5 }
      ],
      createdBy: new mongoose.Types.ObjectId(adminId)
    },
    {
      text: "When working on a team project, which role do you naturally assume?",
      type: "multiple-choice" as const,
      options: [
        { text: "Technical lead focusing on architecture and implementation", value: 8 },
        { text: "Project coordinator ensuring everyone stays on track", value: 6 },
        { text: "Creative problem-solver generating new ideas", value: 7 },
        { text: "Support role helping others and filling gaps", value: 5 }
      ],
      createdBy: new mongoose.Types.ObjectId(adminId)
    },
    {
      text: "How do you prefer to communicate about technical concepts?",
      type: "multiple-choice" as const,
      options: [
        { text: "Detailed written documentation with examples", value: 8 },
        { text: "Visual diagrams and flowcharts", value: 7 },
        { text: "Face-to-face conversations and whiteboarding", value: 6 },
        { text: "Code samples and working prototypes", value: 9 }
      ],
      createdBy: new mongoose.Types.ObjectId(adminId)
    }
  ];

  try {
    // Create the career questions
    const savedCareerQuestions = await Question.insertMany(careerQuestions);
    
    // Create the career assessment using the question IDs
    await Assessment.create({
      title: "Career Aptitude Assessment",
      description: "Discover your natural abilities and preferences to find the career path that best suits your talents and personality.",
      type: "career",
      questions: savedCareerQuestions.map(q => q._id),
      createdBy: new mongoose.Types.ObjectId(adminId),
      isActive: true
    });

    // Create the tech questions
    const savedTechQuestions = await Question.insertMany(techQuestions);
    
    // Create the tech personality assessment
    await Assessment.create({
      title: "Tech Industry Personality Assessment",
      description: "Identify your strengths, work style, and ideal role in the technology sector to guide your professional development.",
      type: "personality",
      questions: savedTechQuestions.map(q => q._id),
      createdBy: new mongoose.Types.ObjectId(adminId),
      isActive: true
    });

    console.log('Default assessments created successfully');
  } catch (error) {
    console.error('Error creating default assessments:', error);
    throw error;
  }
}

/**
 * This function checks if default courses already exist and creates them if they don't
 */
export async function seedDefaultCourses(adminId: string): Promise<void> {
  await dbConnect();
  
  // Check if courses already exist
  const courseCount = await Course.countDocuments();
  if (courseCount > 0) {
    console.log('Courses already exist, skipping seed');
    return;
  }
  
  const defaultCourses = [
    {
      title: "Web Development Fundamentals",
      code: "WD101",
      department: "Information Technology",
      description: "Learn the core concepts of web development including HTML, CSS, and JavaScript.",
      duration: "8 weeks",
      level: "beginner",
      topics: ["HTML", "CSS", "JavaScript", "Responsive Design"],
      prerequisites: [],
      objectives: [
        "Understand the structure of web pages using HTML5",
        "Style web pages using CSS3",
        "Create interactive elements with JavaScript",
        "Build responsive websites for different devices"
      ],
      careerPathways: ["Front-end Developer", "Web Designer", "UI Developer"],
      requirements: ["Basic computer skills", "Internet access"],
      skillsDeveloped: ["HTML5", "CSS3", "JavaScript", "Responsive Design"],
      instructor: new mongoose.Types.ObjectId(adminId),
      createdBy: new mongoose.Types.ObjectId(adminId),
      isActive: true
    },
    {
      title: "Data Science for Beginners",
      code: "DS101",
      department: "Data Science",
      description: "An introduction to data science concepts, tools, and methodologies.",
      duration: "10 weeks",
      level: "beginner",
      topics: ["Python", "Statistics", "Data Visualization", "Machine Learning Basics"],
      prerequisites: ["Basic programming knowledge"],
      objectives: [
        "Set up a data science environment with Python",
        "Analyze datasets using statistical methods",
        "Create meaningful data visualizations",
        "Build basic predictive models"
      ],
      careerPathways: ["Data Analyst", "Junior Data Scientist", "Business Analyst"],
      requirements: ["Basic mathematics knowledge", "Computer with 8GB RAM or higher"],
      skillsDeveloped: ["Python", "Data Analysis", "Data Visualization", "Statistical Methods"],
      instructor: new mongoose.Types.ObjectId(adminId),
      createdBy: new mongoose.Types.ObjectId(adminId),
      isActive: true
    },
    {
      title: "Project Management Fundamentals",
      code: "PM101",
      department: "Business",
      description: "Essential skills for managing projects effectively in any industry.",
      duration: "6 weeks",
      level: "intermediate",
      topics: ["Project Planning", "Resource Management", "Risk Assessment", "Agile Methodologies"],
      prerequisites: ["1+ years professional experience"],
      objectives: [
        "Create comprehensive project plans",
        "Manage team resources efficiently",
        "Identify and mitigate project risks",
        "Apply Agile principles to project management"
      ],
      careerPathways: ["Project Coordinator", "Scrum Master", "Project Manager"],
      requirements: ["Professional work experience", "Team collaboration experience"],
      skillsDeveloped: ["Project Planning", "Risk Management", "Team Leadership", "Agile Methodologies"],
      instructor: new mongoose.Types.ObjectId(adminId),
      createdBy: new mongoose.Types.ObjectId(adminId),
      isActive: true
    }
  ];

  try {
    await Course.insertMany(defaultCourses);
    console.log('Default courses created successfully');
  } catch (error) {
    console.error('Error creating default courses:', error);
    throw error;
  }
}

/**
 * This function checks if default career paths already exist and creates them if they don't
 */
export async function seedDefaultCareerPaths(): Promise<void> {
  await dbConnect();
  
  // Check if career paths already exist
  const careerPathCount = await CareerPath.countDocuments();
  if (careerPathCount > 0) {
    console.log('Career paths already exist, skipping seed');
    return;
  }
  
  const defaultCareerPaths = [
    {
      title: "Software Developer",
      description: "Design, develop, and maintain software applications across various platforms and technologies.",
      requiredSkills: ["Programming", "Problem Solving", "Debugging", "Software Testing", "Git"],
      recommendedAssessments: [] as mongoose.Types.ObjectId[],
      averageSalary: {
        entry: 65000,
        mid: 95000,
        senior: 130000
      },
      growthPotential: 5,
      educationRequirements: ["Bachelor's in Computer Science or related field", "Coding bootcamp", "Self-taught with portfolio"],
      isActive: true
    },
    {
      title: "Data Scientist",
      description: "Analyze and interpret complex data sets to inform business decisions and strategies using statistical techniques and machine learning.",
      requiredSkills: ["Python/R", "Statistical Analysis", "Machine Learning", "Data Visualization", "SQL"],
      recommendedAssessments: [] as mongoose.Types.ObjectId[],
      averageSalary: {
        entry: 70000,
        mid: 100000,
        senior: 140000
      },
      growthPotential: 5,
      educationRequirements: ["Master's or PhD in Statistics, Computer Science, or related field", "Bachelor's with specialized certifications"],
      isActive: true
    },
    {
      title: "UX/UI Designer",
      description: "Create intuitive, accessible, and engaging user experiences through research-informed design across digital platforms.",
      requiredSkills: ["User Research", "Wireframing", "Prototyping", "Visual Design", "User Testing"],
      recommendedAssessments: [] as mongoose.Types.ObjectId[],
      averageSalary: {
        entry: 60000,
        mid: 85000,
        senior: 120000
      },
      growthPotential: 4,
      educationRequirements: ["Bachelor's in Design, HCI, or related field", "Design bootcamp", "Self-taught with strong portfolio"],
      isActive: true
    },
    {
      title: "Project Manager",
      description: "Plan, execute, and oversee projects from initiation to completion, ensuring they are delivered on time, within scope, and on budget.",
      requiredSkills: ["Leadership", "Communication", "Risk Management", "Budgeting", "Stakeholder Management"],
      recommendedAssessments: [] as mongoose.Types.ObjectId[],
      averageSalary: {
        entry: 65000,
        mid: 90000,
        senior: 125000
      },
      growthPotential: 4,
      educationRequirements: ["Bachelor's degree", "PMP or Agile certification", "Business management training"],
      isActive: true
    },
    {
      title: "Cloud Solutions Architect",
      description: "Design and implement cloud infrastructure and solutions to meet organizational needs while ensuring security, scalability, and cost efficiency.",
      requiredSkills: ["Cloud Platforms (AWS/Azure/GCP)", "Network Architecture", "Security", "Infrastructure as Code", "Containerization"],
      recommendedAssessments: [] as mongoose.Types.ObjectId[],
      averageSalary: {
        entry: 85000,
        mid: 120000,
        senior: 160000
      },
      growthPotential: 5,
      educationRequirements: ["Bachelor's in Computer Science or IT", "Cloud certifications (AWS, Azure, GCP)", "5+ years IT experience"],
      isActive: true
    },
    {
      title: "Cybersecurity Analyst",
      description: "Protect computer systems and networks from information disclosure, theft, and damage to hardware, software, or data.",
      requiredSkills: ["Network Security", "Vulnerability Assessment", "Security Controls", "Threat Intelligence", "Incident Response"],
      recommendedAssessments: [] as mongoose.Types.ObjectId[],
      averageSalary: {
        entry: 70000,
        mid: 95000,
        senior: 135000
      },
      growthPotential: 5,
      educationRequirements: ["Bachelor's in Cybersecurity or related field", "Security certifications (CISSP, CEH, CompTIA Security+)"],
      isActive: true
    },
    {
      title: "Business Analyst",
      description: "Bridge the gap between IT and business using data analytics to assess processes, determine requirements, and deliver data-driven recommendations.",
      requiredSkills: ["Requirements Gathering", "Process Modeling", "Data Analysis", "Communication", "Problem Solving"],
      recommendedAssessments: [] as mongoose.Types.ObjectId[],
      averageSalary: {
        entry: 60000,
        mid: 85000,
        senior: 110000
      },
      growthPotential: 4,
      educationRequirements: ["Bachelor's in Business, IT, or related field", "MBA or specialized certifications"],
      isActive: true
    },
    {
      title: "DevOps Engineer",
      description: "Combine software development and IT operations to shorten the system development life cycle while delivering features, fixes, and updates.",
      requiredSkills: ["CI/CD", "Infrastructure as Code", "Containerization", "Scripting", "Monitoring Tools"],
      recommendedAssessments: [] as mongoose.Types.ObjectId[],
      averageSalary: {
        entry: 75000,
        mid: 105000,
        senior: 145000
      },
      growthPotential: 5,
      educationRequirements: ["Bachelor's in Computer Science or related field", "DevOps certifications", "Programming and systems administration experience"],
      isActive: true
    }
  ];

  try {
    // Find career assessments to link to career paths
    const careerAssessment = await Assessment.findOne({ type: "career" });
    const personalityAssessment = await Assessment.findOne({ type: "personality" });
    
    // If assessments are found, add them to recommended assessments for appropriate career paths
    if (careerAssessment && careerAssessment._id) {
      defaultCareerPaths.forEach(path => {
        path.recommendedAssessments.push(careerAssessment._id as mongoose.Types.ObjectId);
      });
    }
    
    if (personalityAssessment && personalityAssessment._id) {
      defaultCareerPaths.forEach(path => {
        path.recommendedAssessments.push(personalityAssessment._id as mongoose.Types.ObjectId);
      });
    }
    
    // Create the career paths
    await CareerPath.insertMany(defaultCareerPaths);
    
    console.log('Default career paths created successfully');
  } catch (error) {
    console.error('Error creating default career paths:', error);
    throw error;
  }
} 