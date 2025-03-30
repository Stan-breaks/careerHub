import { Types } from 'mongoose';
import Course, { ICourse } from '../models/Course';
import Result from '../models/Result';

interface AssessmentScore {
  category: string;
  score: number;
}

interface CourseRecommendation {
  _id: Types.ObjectId;
  title: string;
  code: string;
  description: string;
  level: string;
  duration: string;
  skillsDeveloped: string[];
  careerPathways: string[];
  relevanceScore: number;
  matchFactors: {
    pathwayMatch: number;
    levelMatch: number;
    skillsMatch: number;
    categoryMatch: number;
    diversityBonus: number;
  };
}

interface PathwayMapping {
  [key: string]: {
    low: string[];
    medium: string[];
    high: string[];
  };
}

interface CourseDocument extends Omit<ICourse, '_id'> {
  _id: Types.ObjectId;
}

export async function recommendCourses(
  userId: Types.ObjectId,
  assessmentId: Types.ObjectId,
  scores: AssessmentScore[],
): Promise<CourseRecommendation[]> {
  const careerPathways = determineCareerPathways(scores);
  
  const allCourses = await Course.find({
    isActive: true,
  }).lean().exec() as unknown as CourseDocument[];

  let selectedPathways = new Set<string>();
  let selectedLevels = new Set<string>();
  let selectedCategories = new Set<string>();
  
  const scoredCourses = allCourses.map(course => {
    const { relevanceScore, matchFactors } = calculateCourseRelevance(
      course, 
      scores, 
      careerPathways,
      selectedPathways,
      selectedLevels,
      selectedCategories
    );

    course.careerPathways?.forEach(p => selectedPathways.add(p));
    if (course.level) selectedLevels.add(course.level);
    course.skillsDeveloped?.forEach(s => selectedCategories.add(s.toLowerCase()));

    return {
      ...course,
      relevanceScore,
      matchFactors
    };
  });

  const recommendedCourses = diversifyRecommendations(scoredCourses, 5);

  await Result.findOneAndUpdate(
    { userId, assessmentId },
    { 
      $set: {
        recommendedCourses: recommendedCourses.map(course => course._id),
        careerPathways
      }
    }
  );

  return recommendedCourses.map(course => ({
    _id: course._id,
    title: course.title,
    code: course.code,
    description: course.description,
    level: course.level,
    duration: course.duration,
    skillsDeveloped: course.skillsDeveloped || [],
    careerPathways: course.careerPathways || [],
    relevanceScore: course.relevanceScore,
    matchFactors: course.matchFactors
  }));
}

function calculateCourseRelevance(
  course: CourseDocument,
  scores: AssessmentScore[],
  careerPathways: string[],
  selectedPathways: Set<string>,
  selectedLevels: Set<string>,
  selectedCategories: Set<string>
): { 
  relevanceScore: number; 
  matchFactors: {
    pathwayMatch: number;
    levelMatch: number;
    skillsMatch: number;
    categoryMatch: number;
    diversityBonus: number;
  }
} {
  const pathwayMatch = calculatePathwayMatch(course, careerPathways, scores);
  const levelMatch = calculateLevelMatch(course, scores);
  const { skillsMatch, categoryMatch } = calculateSkillsMatch(course, scores);
  const diversityBonus = calculateDiversityBonus(
    course,
    selectedPathways,
    selectedLevels,
    selectedCategories
  );

  const relevanceScore = Math.min(100, 
    pathwayMatch + 
    levelMatch + 
    skillsMatch +
    categoryMatch + 
    diversityBonus
  );

  return {
    relevanceScore,
    matchFactors: {
      pathwayMatch,
      levelMatch,
      skillsMatch,
      categoryMatch,
      diversityBonus
    }
  };
}

function calculatePathwayMatch(
  course: CourseDocument,
  careerPathways: string[],
  scores: AssessmentScore[]
): number {
  const coursePathways = course.careerPathways || [];
  const matchCount = coursePathways.filter(p => careerPathways.includes(p)).length;
  
  // Weight pathway match by assessment scores
  const avgScore = scores.reduce((sum, score) => sum + score.score, 0) / scores.length;
  const scoreMultiplier = avgScore / 100;
  
  // Scale: 0-30 points
  if (matchCount === 0) return Math.round(10 * scoreMultiplier);
  if (matchCount === 1) return Math.round(20 * scoreMultiplier);
  return Math.round(30 * scoreMultiplier);
}

function calculateLevelMatch(
  course: CourseDocument,
  scores: AssessmentScore[]
): number {
  const avgScore = scores.reduce((sum, score) => sum + score.score, 0) / scores.length;
  
  // Different scoring matrices based on assessment categories
  const levelMatrices: { [key: string]: { [key: string]: number } } = {
    'personality': {
      'beginner': avgScore <= 40 ? 25 : avgScore <= 70 ? 20 : 15,
      'intermediate': avgScore <= 40 ? 15 : avgScore <= 70 ? 25 : 20,
      'advanced': avgScore <= 40 ? 10 : avgScore <= 70 ? 20 : 25
    },
    'aptitude': {
      'beginner': avgScore <= 40 ? 25 : avgScore <= 70 ? 15 : 10,
      'intermediate': avgScore <= 40 ? 15 : avgScore <= 70 ? 25 : 20,
      'advanced': avgScore <= 40 ? 10 : avgScore <= 70 ? 20 : 25
    },
    'interest': {
      'beginner': avgScore <= 40 ? 20 : avgScore <= 70 ? 25 : 15,
      'intermediate': avgScore <= 40 ? 15 : avgScore <= 70 ? 20 : 25,
      'advanced': avgScore <= 40 ? 15 : avgScore <= 70 ? 15 : 20
    }
  };

  // Calculate weighted average of level scores across assessment categories
  let totalWeight = 0;
  let weightedScore = 0;

  scores.forEach(score => {
    const category = score.category.toLowerCase();
    const matrix = levelMatrices[category];
    if (matrix && course.level) {
      const levelScore = matrix[course.level.toLowerCase()] || 15;
      const weight = score.score / 100;
      weightedScore += levelScore * weight;
      totalWeight += weight;
    }
  });

  return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 15;
}

function calculateSkillsMatch(
  course: CourseDocument,
  scores: AssessmentScore[]
): { skillsMatch: number; categoryMatch: number } {
  const skills = course.skillsDeveloped || [];
  if (skills.length === 0) return { skillsMatch: 10, categoryMatch: 5 };

  // Calculate skill relevance based on assessment categories
  let categoryMatches = 0;
  let skillRelevance = 0;

  scores.forEach(score => {
    const category = score.category.toLowerCase();
    const weight = score.score / 100;

    // Check for direct category matches
    if (skills.some(skill => skill.toLowerCase().includes(category))) {
      categoryMatches++;
    }

    // Calculate skill relevance based on assessment score
    const relevantSkills = skills.filter(skill => 
      isSkillRelevantToCategory(skill, category)
    ).length;
    skillRelevance += (relevantSkills / skills.length) * weight;
  });

  const skillsMatch = Math.round(20 * (skillRelevance / scores.length));
  const categoryMatch = Math.round(15 * (categoryMatches / scores.length));

  return { 
    skillsMatch: Math.min(20, skillsMatch), 
    categoryMatch: Math.min(15, categoryMatch) 
  };
}

function isSkillRelevantToCategory(skill: string, category: string): boolean {
  const categorySkillMap: { [key: string]: string[] } = {
    'personality': ['communication', 'leadership', 'teamwork', 'collaboration', 'management'],
    'aptitude': ['technical', 'analytical', 'problem-solving', 'development', 'design'],
    'interest': ['creative', 'innovation', 'research', 'strategy', 'planning']
  };

  const relevantSkills = categorySkillMap[category] || [];
  return relevantSkills.some(s => skill.toLowerCase().includes(s));
}

function calculateDiversityBonus(
  course: CourseDocument,
  selectedPathways: Set<string>,
  selectedLevels: Set<string>,
  selectedCategories: Set<string>
): number {
  let bonus = 0;

  // Bonus for unique pathway (0-5 points)
  const uniquePathways = (course.careerPathways || [])
    .filter(p => !selectedPathways.has(p)).length;
  bonus += Math.min(5, uniquePathways * 2);

  // Bonus for unique level (0-5 points)
  if (course.level && !selectedLevels.has(course.level)) {
    bonus += 5;
  }

  // Bonus for unique skills (0-5 points)
  const uniqueSkills = (course.skillsDeveloped || [])
    .filter(s => !selectedCategories.has(s.toLowerCase())).length;
  bonus += Math.min(5, uniqueSkills);

  return bonus;
}

function diversifyRecommendations(
  courses: (CourseDocument & { 
    relevanceScore: number;
    matchFactors: any;
  })[],
  count: number
): typeof courses {
  const selected: typeof courses = [];
  const seenPathways = new Set<string>();
  const seenLevels = new Set<string>();

  // First, add the top scoring course
  if (courses.length > 0) {
    const topCourse = courses.sort((a, b) => 
      b.relevanceScore - a.relevanceScore
    )[0];
    selected.push(topCourse);
    topCourse.careerPathways?.forEach(p => seenPathways.add(p));
    if (topCourse.level) seenLevels.add(topCourse.level);
  }

  // Then add diverse recommendations
  const remaining = courses.filter(c => !selected.includes(c))
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  while (selected.length < count && remaining.length > 0) {
    // Find the highest scoring course that adds diversity
    const nextIndex = remaining.findIndex(course => {
      const hasNewPathway = (course.careerPathways || [])
        .some(p => !seenPathways.has(p));
      const hasNewLevel = course.level && 
        !seenLevels.has(course.level);
      
      return hasNewPathway || hasNewLevel;
    });

    const nextCourse = remaining[nextIndex !== -1 ? nextIndex : 0];
    if (!nextCourse) break;

    selected.push(nextCourse);
    remaining.splice(nextIndex !== -1 ? nextIndex : 0, 1);

    // Update seen pathways and levels
    nextCourse.careerPathways?.forEach(p => seenPathways.add(p));
    if (nextCourse.level) seenLevels.add(nextCourse.level);
  }

  return selected;
}

function determineCareerPathways(scores: AssessmentScore[]): string[] {
  const pathwayMappings: PathwayMapping = {
    'personality': {
      low: [
        'Technical Support',
        'Quality Assurance',
        'Documentation'
      ],
      medium: [
        'Software Development',
        'Data Analysis',
        'Technical Writing'
      ],
      high: [
        'Project Management',
        'Team Leadership',
        'Product Management'
      ]
    },
    'aptitude': {
      low: [
        'Content Creation',
        'Digital Marketing',
        'User Support'
      ],
      medium: [
        'Web Development',
        'Data Analysis',
        'System Administration'
      ],
      high: [
        'Software Architecture',
        'Data Science',
        'Systems Design'
      ]
    },
    'interest': {
      low: [
        'Career Exploration',
        'Skill Development',
        'Professional Basics'
      ],
      medium: [
        'Full-Stack Development',
        'Cloud Computing',
        'DevOps'
      ],
      high: [
        'AI/ML Engineering',
        'Blockchain Development',
        'Research & Innovation'
      ]
    }
  };

  const recommendedPathways = new Set<string>();
  
  scores.forEach(score => {
    const category = score.category.toLowerCase();
    if (pathwayMappings[category]) {
      let pathways: string[];
      if (score.score < 40) {
        pathways = pathwayMappings[category].low;
      } else if (score.score < 70) {
        pathways = pathwayMappings[category].medium;
      } else {
        pathways = pathwayMappings[category].high;
      }
      pathways.forEach(pathway => recommendedPathways.add(pathway));
    }
  });

  if (recommendedPathways.size === 0) {
    Object.values(pathwayMappings).forEach(categoryPathways => {
      [...categoryPathways.low, ...categoryPathways.medium, ...categoryPathways.high]
        .forEach(pathway => recommendedPathways.add(pathway));
    });
  }

  return Array.from(recommendedPathways).slice(0, 5);
}
