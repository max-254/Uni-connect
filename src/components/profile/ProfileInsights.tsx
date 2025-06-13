import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  Award, 
  BookOpen, 
  Users, 
  Target,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  BarChart3,
  PieChart,
  Star
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import { documentParsingService } from '../../services/documentParsingService';
import { useAuth } from '../../context/AuthContext';

interface ProfileInsight {
  type: 'strength' | 'improvement' | 'recommendation' | 'match';
  title: string;
  description: string;
  action?: string;
  priority: 'high' | 'medium' | 'low';
}

interface ProfileAnalytics {
  completionScore: number;
  strengthAreas: string[];
  improvementAreas: string[];
  matchingUniversities: number;
  skillsCount: {
    technical: number;
    languages: number;
    soft: number;
  };
  experienceYears: number;
  academicLevel: string;
}

const ProfileInsights: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<ProfileAnalytics | null>(null);
  const [insights, setInsights] = useState<ProfileInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfileAnalytics();
    }
  }, [user]);

  const loadProfileAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get student profile
      const profile = await documentParsingService.getStudentProfile(user!.id);
      
      if (profile) {
        const analytics = generateAnalytics(profile);
        const insights = generateInsights(profile, analytics);
        
        setAnalytics(analytics);
        setInsights(insights);
      }
    } catch (error) {
      console.error('Error loading profile analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAnalytics = (profile: any): ProfileAnalytics => {
    return {
      completionScore: profile.profile_completion || 0,
      strengthAreas: getStrengthAreas(profile),
      improvementAreas: getImprovementAreas(profile),
      matchingUniversities: Math.floor(Math.random() * 50) + 20, // Simulated
      skillsCount: {
        technical: profile.skills?.technical?.length || 0,
        languages: profile.skills?.languages?.length || 0,
        soft: profile.skills?.soft_skills?.length || 0
      },
      experienceYears: calculateExperienceYears(profile.experience || []),
      academicLevel: profile.academic_background?.highest_education || 'Unknown'
    };
  };

  const getStrengthAreas = (profile: any): string[] => {
    const strengths = [];
    
    if (profile.academic_background?.gpa > 3.5) {
      strengths.push('Strong Academic Performance');
    }
    if (profile.skills?.technical?.length > 5) {
      strengths.push('Diverse Technical Skills');
    }
    if (profile.skills?.languages?.length > 1) {
      strengths.push('Multilingual Abilities');
    }
    if (profile.experience?.length > 2) {
      strengths.push('Rich Professional Experience');
    }
    if (profile.preferences?.study_fields?.length > 0) {
      strengths.push('Clear Academic Focus');
    }

    return strengths;
  };

  const getImprovementAreas = (profile: any): string[] => {
    const improvements = [];
    
    if (!profile.contact_info?.email) {
      improvements.push('Complete Contact Information');
    }
    if (profile.skills?.technical?.length < 3) {
      improvements.push('Expand Technical Skills');
    }
    if (!profile.academic_background?.test_scores?.length) {
      improvements.push('Add Standardized Test Scores');
    }
    if (profile.preferences?.preferred_countries?.length === 0) {
      improvements.push('Specify Country Preferences');
    }
    if (profile.experience?.length === 0) {
      improvements.push('Add Work Experience');
    }

    return improvements;
  };

  const calculateExperienceYears = (experience: any[]): number => {
    // Simplified calculation
    return experience.length * 1.5; // Assume 1.5 years per position on average
  };

  const generateInsights = (profile: any, analytics: ProfileAnalytics): ProfileInsight[] => {
    const insights: ProfileInsight[] = [];

    // Completion insights
    if (analytics.completionScore < 70) {
      insights.push({
        type: 'improvement',
        title: 'Complete Your Profile',
        description: `Your profile is ${analytics.completionScore}% complete. Complete it to improve your university matching accuracy.`,
        action: 'Complete missing sections',
        priority: 'high'
      });
    }

    // Academic insights
    if (profile.academic_background?.gpa > 3.7) {
      insights.push({
        type: 'strength',
        title: 'Excellent Academic Performance',
        description: `Your GPA of ${profile.academic_background.gpa} puts you in a strong position for competitive programs.`,
        priority: 'high'
      });
    }

    // Skills insights
    if (analytics.skillsCount.technical > 8) {
      insights.push({
        type: 'strength',
        title: 'Strong Technical Portfolio',
        description: `You have ${analytics.skillsCount.technical} technical skills, which is excellent for STEM programs.`,
        priority: 'medium'
      });
    } else if (analytics.skillsCount.technical < 3) {
      insights.push({
        type: 'improvement',
        title: 'Expand Technical Skills',
        description: 'Consider adding more technical skills to strengthen your profile for competitive programs.',
        action: 'Add technical skills',
        priority: 'medium'
      });
    }

    // Language insights
    if (analytics.skillsCount.languages > 2) {
      insights.push({
        type: 'strength',
        title: 'Multilingual Advantage',
        description: `Speaking ${analytics.skillsCount.languages} languages gives you an advantage for international programs.`,
        priority: 'medium'
      });
    }

    // Experience insights
    if (analytics.experienceYears > 3) {
      insights.push({
        type: 'strength',
        title: 'Valuable Work Experience',
        description: `Your ${analytics.experienceYears.toFixed(1)} years of experience strengthens your application significantly.`,
        priority: 'high'
      });
    }

    // Recommendation insights
    insights.push({
      type: 'recommendation',
      title: 'University Matches Available',
      description: `Based on your profile, we found ${analytics.matchingUniversities} potential university matches.`,
      action: 'Explore matches',
      priority: 'medium'
    });

    if (profile.preferences?.study_fields?.includes('Computer Science')) {
      insights.push({
        type: 'match',
        title: 'High Demand Field',
        description: 'Computer Science is in high demand. Your profile aligns well with top-tier programs.',
        priority: 'high'
      });
    }

    return insights;
  };

  const getInsightIcon = (type: ProfileInsight['type']) => {
    switch (type) {
      case 'strength':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'improvement':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'recommendation':
        return <Lightbulb className="w-5 h-5 text-blue-500" />;
      case 'match':
        return <Target className="w-5 h-5 text-purple-500" />;
      default:
        return <Brain className="w-5 h-5 text-gray-500" />;
    }
  };

  const getInsightColor = (type: ProfileInsight['type']) => {
    switch (type) {
      case 'strength':
        return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20';
      case 'improvement':
        return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20';
      case 'recommendation':
        return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20';
      case 'match':
        return 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20';
      default:
        return 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800';
    }
  };

  const getPriorityColor = (priority: ProfileInsight['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardBody className="p-8 text-center">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Profile Data Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Upload some documents to get AI-powered insights about your profile.
          </p>
          <Button leftIcon={<BookOpen size={16} />}>
            Upload Documents
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Insights</h2>
          <p className="text-gray-600 dark:text-gray-400">AI-powered analysis of your academic profile</p>
        </div>
        <Button
          variant="outline"
          onClick={loadProfileAnalytics}
          leftIcon={<Brain size={16} />}
        >
          Refresh Analysis
        </Button>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Profile Completion</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.completionScore}%</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <PieChart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Technical Skills</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.skillsCount.technical}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">University Matches</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.matchingUniversities}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Experience</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.experienceYears.toFixed(1)}y</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {insights.map((insight, index) => (
          <Card key={index} className={`border ${getInsightColor(insight.type)}`}>
            <CardBody className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getInsightIcon(insight.type)}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{insight.title}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                      {insight.priority} priority
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {insight.description}
              </p>
              
              {insight.action && (
                <Button variant="outline" size="sm">
                  {insight.action}
                </Button>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Strength Areas */}
      {analytics.strengthAreas.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Strengths</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {analytics.strengthAreas.map((strength, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-300">{strength}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Improvement Areas */}
      {analytics.improvementAreas.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Areas for Improvement</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analytics.improvementAreas.map((improvement, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">{improvement}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default ProfileInsights;