import { ICourse } from '@/models/Course';
import { IResult } from '@/models/Result';
import { IUser } from '@/models/User';

interface RecommendationScore {
  course: ICourse;
  score: number;
  matchFactors: {
    careerPathwayMatch: number;
    skillGapMatch: number;
    levelMatch: number;
    prerequisiteMatch: number;
    userHistoryMatch: number;
  };
}

export class RecommendationEngine {
  private static readonly WEIGHTS = {
    careerPathwayMatch: 0.35,
    skillGapMatch: 0.25,
    levelMatch: 0.15,
    prerequisiteMatch: 0.15,
    userHistoryMatch: 0.10
  };

  /**
   * Calculate similarity between two arrays using Jaccard similarity
   */
  private static calculateSimilarity(arr1: string[], arr2: string[]): number {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  }

  /**
   * Calculate career pathway match score
   */
  private static calculateCareerPathwayMatch(
    course: ICourse,
    assessmentResults: IResult[]
  ): number {
    const userCareerInterests = new Set<string>();
    
    // Extract career interests from assessment results
    assessmentResults.forEach(result => {
      // Use careerPathways from the result
      result.careerPathways.forEach(pathway => {
        userCareerInterests.add(pathway.toLowerCase());
      });
    });

    return this.calculateSimilarity(
      Array.from(userCareerInterests),
      course.careerPathways.map(p => p.toLowerCase())
    );
  }

  /**
   * Calculate skill gap match score
   */
  private static calculateSkillGapMatch(
    course: ICourse,
    user: IUser
  ): number {
    const userSkills = new Set(user.skills || []);
    const courseSkills = new Set(course.skillsDeveloped);
    
    // Calculate how many new skills the course would provide
    const newSkills = new Set([...courseSkills].filter(skill => !userSkills.has(skill)));
    return newSkills.size / courseSkills.size;
  }

  /**
   * Calculate level match score
   */
  private static calculateLevelMatch(
    course: ICourse,
    user: IUser
  ): number {
    const userLevel = user.experienceLevel || 'beginner';
    const courseLevel = course.level || 'beginner';
    
    const levels = ['beginner', 'intermediate', 'advanced'];
    const userLevelIndex = levels.indexOf(userLevel);
    const courseLevelIndex = levels.indexOf(courseLevel);
    
    // Penalize courses that are too advanced
    if (courseLevelIndex > userLevelIndex + 1) return 0;
    
    // Perfect match for same level
    if (userLevelIndex === courseLevelIndex) return 1;
    
    // Slight penalty for one level difference
    return 0.8;
  }

  /**
   * Calculate prerequisite match score
   */
  private static calculatePrerequisiteMatch(
    course: ICourse,
    user: IUser
  ): number {
    if (!course.requirements || course.requirements.length === 0) return 1;
    
    const userSkills = new Set(user.skills || []);
    const metRequirements = course.requirements.filter(req => 
      userSkills.has(req.toLowerCase())
    ).length;
    
    return metRequirements / course.requirements.length;
  }

  /**
   * Calculate user history match score
   */
  private static calculateUserHistoryMatch(
    course: ICourse,
    user: IUser
  ): number {
    if (!user.enrolledCourses || user.enrolledCourses.length === 0) return 0.5;
    
    // Get user's enrolled courses with populated data
    const enrolledCourses = user.enrolledCourses as unknown as ICourse[];
    
    // Calculate similarity with previously enrolled courses
    const similarities = enrolledCourses.map(enrolledCourse => 
      this.calculateSimilarity(
        enrolledCourse.careerPathways || [],
        course.careerPathways || []
      )
    );
    
    // Return average similarity
    return similarities.reduce((a, b) => a + b, 0) / similarities.length;
  }

  /**
   * Generate personalized course recommendations
   */
  public static generateRecommendations(
    courses: ICourse[],
    user: IUser,
    assessmentResults: IResult[],
    limit: number = 5
  ): RecommendationScore[] {
    const recommendations: RecommendationScore[] = courses.map(course => {
      const careerPathwayMatch = this.calculateCareerPathwayMatch(course, assessmentResults);
      const skillGapMatch = this.calculateSkillGapMatch(course, user);
      const levelMatch = this.calculateLevelMatch(course, user);
      const prerequisiteMatch = this.calculatePrerequisiteMatch(course, user);
      const userHistoryMatch = this.calculateUserHistoryMatch(course, user);

      const score = 
        careerPathwayMatch * this.WEIGHTS.careerPathwayMatch +
        skillGapMatch * this.WEIGHTS.skillGapMatch +
        levelMatch * this.WEIGHTS.levelMatch +
        prerequisiteMatch * this.WEIGHTS.prerequisiteMatch +
        userHistoryMatch * this.WEIGHTS.userHistoryMatch;

      return {
        course,
        score,
        matchFactors: {
          careerPathwayMatch,
          skillGapMatch,
          levelMatch,
          prerequisiteMatch,
          userHistoryMatch
        }
      };
    });

    // Sort by score and return top recommendations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Generate personalized recommendations text
   */
  public static generateRecommendationText(
    recommendation: RecommendationScore
  ): string[] {
    const { course, matchFactors } = recommendation;
    const recommendations: string[] = [];

    // Add course-specific recommendation
    recommendations.push(`Consider the ${course.title} program which aligns with your interests.`);

    // Add personalized insights based on match factors
    if (matchFactors.careerPathwayMatch > 0.8) {
      recommendations.push(`This course strongly aligns with your career interests in ${course.careerPathways.join(', ')}.`);
    }

    if (matchFactors.skillGapMatch > 0.8) {
      const newSkills = course.skillsDeveloped.filter(skill => 
        !recommendation.course.skillsDeveloped.includes(skill)
      );
      recommendations.push(`You'll develop valuable skills in ${newSkills.join(', ')}.`);
    }

    if (matchFactors.levelMatch < 0.8) {
      recommendations.push(`This course is at a ${course.level} level, which will help you build on your existing knowledge.`);
    }

    return recommendations;
  }
} 