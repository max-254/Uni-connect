import React, { useState, useEffect } from 'react';
import { 
  Target, 
  TrendingUp, 
  Award, 
  MapPin, 
  DollarSign, 
  BookOpen, 
  Star, 
  Heart,
  ChevronRight,
  Filter,
  BarChart3,
  Brain,
  Zap,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import { matchingService, UniversityMatch, MatchingRecommendations } from '../../services/matchingService';
import { useAuth } from '../../context/AuthContext';

const UniversityRecommendations: React.FC = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<MatchingRecommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'reach' | 'match' | 'safety'>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const recs = await matchingService.generateUniversityRecommendations(user!.id);
      setRecommendations(recs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (universityId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(universityId)) {
        newFavorites.delete(universityId);
      } else {
        newFavorites.add(universityId);
      }
      return newFavorites;
    });
  };

  const getMatchCategoryColor = (category: string) => {
    switch (category) {
      case 'reach':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
      case 'match':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      case 'safety':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getMatchCategoryIcon = (category: string) => {
    switch (category) {
      case 'reach':
        return <TrendingUp size={14} />;
      case 'match':
        return <Target size={14} />;
      case 'safety':
        return <CheckCircle size={14} />;
      default:
        return <Info size={14} />;
    }
  };

  const getCurrentMatches = () => {
    if (!recommendations) return [];
    
    switch (activeTab) {
      case 'reach':
        return recommendations.reachSchools;
      case 'match':
        return recommendations.matchSchools;
      case 'safety':
        return recommendations.safetySchools;
      default:
        return recommendations.topRecommendations;
    }
  };

  const renderMatchCard = (match: UniversityMatch) => {
    const isExpanded = expandedMatch === match.id;
    
    return (
      <Card key={match.id} hoverable={true} className="overflow-hidden">
        <CardBody className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                  {match.name}
                </h3>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMatchCategoryColor(match.matchCategory)}`}>
                  {getMatchCategoryIcon(match.matchCategory)}
                  <span className="ml-1 capitalize">{match.matchCategory}</span>
                </span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                <MapPin size={14} className="mr-1" />
                <span>{match.country}</span>
                {match.stateProvince && <span>, {match.stateProvince}</span>}
              </div>

              {/* Match Score */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {match.matchScore}% Match
                  </span>
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${match.matchScore}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => toggleFavorite(match.id)}
                className={`p-2 rounded-full transition-colors ${
                  favorites.has(match.id)
                    ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                }`}
              >
                <Heart size={16} fill={favorites.has(match.id) ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Acceptance Rate</p>
              <p className="font-semibold text-gray-900 dark:text-white">{match.acceptanceRate}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Tuition</p>
              <p className="font-semibold text-gray-900 dark:text-white text-xs">{match.internationalFees.tuitionFee}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Language Test</p>
              <p className="font-semibold text-gray-900 dark:text-white text-xs">{match.requirements.languageTest}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">GPA Required</p>
              <p className="font-semibold text-gray-900 dark:text-white">{match.requirements.gpa}</p>
            </div>
          </div>

          {/* Match Reasons */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Why it's a good match:</h4>
            <div className="space-y-1">
              {match.matchReasons.slice(0, 2).map((reason, index) => (
                <div key={index} className="flex items-center text-sm text-green-700 dark:text-green-300">
                  <CheckCircle size={12} className="mr-2 flex-shrink-0" />
                  <span>{reason}</span>
                </div>
              ))}
              {match.matchReasons.length > 2 && !isExpanded && (
                <button
                  onClick={() => setExpandedMatch(isExpanded ? null : match.id)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  +{match.matchReasons.length - 2} more reasons
                </button>
              )}
            </div>
          </div>

          {/* Concerns */}
          {match.concerns.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Consider:</h4>
              <div className="space-y-1">
                {match.concerns.slice(0, isExpanded ? match.concerns.length : 1).map((concern, index) => (
                  <div key={index} className="flex items-center text-sm text-yellow-700 dark:text-yellow-300">
                    <AlertTriangle size={12} className="mr-2 flex-shrink-0" />
                    <span>{concern}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expanded Content */}
          {isExpanded && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              {/* Detailed Match Criteria */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Match Analysis:</h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(match.matchingCriteria).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                          <div 
                            className="bg-blue-600 h-1 rounded-full"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-900 dark:text-white w-8">
                          {Math.round(value)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* All Match Reasons */}
              {match.matchReasons.length > 2 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">All match reasons:</h4>
                  <div className="space-y-1">
                    {match.matchReasons.slice(2).map((reason, index) => (
                      <div key={index} className="flex items-center text-sm text-green-700 dark:text-green-300">
                        <CheckCircle size={12} className="mr-2 flex-shrink-0" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Programs */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Available Programs:</h4>
                <div className="flex flex-wrap gap-1">
                  {match.courses.slice(0, 6).map((course, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                    >
                      {course}
                    </span>
                  ))}
                  {match.courses.length > 6 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      +{match.courses.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button className="flex-1" size="sm">
              Apply Now
            </Button>
            <Button 
              variant="outline" 
              className="flex-1" 
              size="sm"
              leftIcon={<BookOpen size={14} />}
            >
              View Details
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedMatch(isExpanded ? null : match.id)}
              leftIcon={isExpanded ? <ChevronRight size={14} className="rotate-90" /> : <ChevronRight size={14} />}
            >
              {isExpanded ? 'Less' : 'More'}
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Failed to Load Recommendations
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={loadRecommendations}>Try Again</Button>
        </CardBody>
      </Card>
    );
  }

  if (!recommendations) {
    return (
      <Card>
        <CardBody className="p-8 text-center">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Recommendations Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Complete your profile and upload documents to get AI-powered university recommendations.
          </p>
          <Button leftIcon={<BookOpen size={16} />}>
            Complete Profile
          </Button>
        </CardBody>
      </Card>
    );
  }

  const currentMatches = getCurrentMatches();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">University Recommendations</h2>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered matches based on your profile and preferences
          </p>
        </div>
        <Button
          variant="outline"
          onClick={loadRecommendations}
          leftIcon={<Brain size={16} />}
        >
          Refresh Matches
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardBody className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Matches</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{recommendations.totalMatches}</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6 text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Reach Schools</h3>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{recommendations.reachSchools.length}</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Match Schools</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{recommendations.matchSchools.length}</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Safety Schools</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{recommendations.safetySchools.length}</p>
          </CardBody>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Strengths */}
            <div>
              <h4 className="font-medium text-green-800 dark:text-green-300 mb-3">Your Strengths</h4>
              <div className="space-y-2">
                {recommendations.insights.strongestAreas.map((area, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-green-700 dark:text-green-300">{area}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Improvements */}
            <div>
              <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-3">Areas to Improve</h4>
              <div className="space-y-2">
                {recommendations.insights.improvementAreas.map((area, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                    <span className="text-sm text-yellow-700 dark:text-yellow-300">{area}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-3">Recommendations</h4>
              <div className="space-y-2">
                {recommendations.insights.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-blue-700 dark:text-blue-300">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Category Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'all', label: 'All Recommendations', count: recommendations.topRecommendations.length },
            { id: 'reach', label: 'Reach Schools', count: recommendations.reachSchools.length },
            { id: 'match', label: 'Match Schools', count: recommendations.matchSchools.length },
            { id: 'safety', label: 'Safety Schools', count: recommendations.safetySchools.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* University Matches */}
      <div className="space-y-6">
        {currentMatches.length > 0 ? (
          currentMatches.map(match => renderMatchCard(match))
        ) : (
          <Card>
            <CardBody className="p-8 text-center">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No {activeTab === 'all' ? '' : activeTab} matches found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try updating your profile or preferences to get more recommendations.
              </p>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UniversityRecommendations;