import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  MapPin, 
  GraduationCap, 
  BookOpen, 
  Trash2, 
  ExternalLink,
  Plus,
  Search,
  Filter,
  StickyNote,
  Calendar,
  Star
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { applicationService, Favorite } from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';

const FavoritesManager: React.FC = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const favs = await applicationService.getFavorites(user!.id);
      setFavorites(favs);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (universityId: string) => {
    try {
      await applicationService.removeFromFavorites(user!.id, universityId);
      setFavorites(prev => prev.filter(fav => fav.university_id !== universityId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handleStartApplication = async (favorite: Favorite) => {
    try {
      // In a real app, this would navigate to the application form
      console.log('Starting application for:', favorite.university_name);
      // You could also automatically create a draft application here
    } catch (error) {
      console.error('Error starting application:', error);
    }
  };

  const handleUpdateNotes = async (favoriteId: string, notes: string) => {
    try {
      // Update notes in database (you'd need to add this to the service)
      setFavorites(prev => 
        prev.map(fav => 
          fav.id === favoriteId ? { ...fav, notes } : fav
        )
      );
      setEditingNotes(null);
      setNoteText('');
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  };

  const filteredFavorites = favorites.filter(favorite => {
    const matchesSearch = !searchQuery || 
      favorite.university_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      favorite.university_country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (favorite.program_name && favorite.program_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCountry = !selectedCountry || favorite.university_country === selectedCountry;
    
    return matchesSearch && matchesCountry;
  });

  const countries = [...new Set(favorites.map(fav => fav.university_country))].sort();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Favorites</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {favorites.length} saved {favorites.length === 1 ? 'university' : 'universities'}
          </p>
        </div>
        <Button
          onClick={() => window.location.href = '/universities'}
          leftIcon={<Plus size={16} />}
        >
          Find More Universities
        </Button>
      </div>

      {/* Filters */}
      {favorites.length > 0 && (
        <Card>
          <CardBody className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search favorites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Countries</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>

              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                <Filter size={16} className="mr-2" />
                {filteredFavorites.length} of {favorites.length} shown
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Favorites Grid */}
      {filteredFavorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFavorites.map((favorite) => (
            <Card key={favorite.id} hoverable={true} className="overflow-hidden">
              <CardBody className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {favorite.university_name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <MapPin size={14} className="mr-1 flex-shrink-0" />
                      <span>{favorite.university_country}</span>
                    </div>
                    {favorite.program_name && (
                      <div className="flex items-center text-sm text-blue-600 dark:text-blue-400 mb-2">
                        <BookOpen size={14} className="mr-1 flex-shrink-0" />
                        <span>{favorite.program_name}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-2">
                    <Heart className="w-5 h-5 text-red-500" fill="currentColor" />
                    <button
                      onClick={() => handleRemoveFavorite(favorite.university_id)}
                      className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="mb-4">
                  {editingNotes === favorite.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Add your notes about this university..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none"
                        rows={3}
                      />
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateNotes(favorite.id, noteText)}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingNotes(null);
                            setNoteText('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {favorite.notes ? (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-1">
                                <StickyNote size={14} className="mr-1 text-yellow-600 dark:text-yellow-400" />
                                <span className="text-xs font-medium text-yellow-800 dark:text-yellow-300">Your Notes</span>
                              </div>
                              <p className="text-sm text-yellow-700 dark:text-yellow-200">{favorite.notes}</p>
                            </div>
                            <button
                              onClick={() => {
                                setEditingNotes(favorite.id);
                                setNoteText(favorite.notes || '');
                              }}
                              className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300"
                            >
                              <StickyNote size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingNotes(favorite.id);
                            setNoteText('');
                          }}
                          className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          <StickyNote size={16} className="mx-auto mb-1" />
                          <span className="text-sm">Add notes</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Saved Date */}
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <Calendar size={12} className="mr-1" />
                  <span>Saved {new Date(favorite.created_at).toLocaleDateString()}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={() => handleStartApplication(favorite)}
                    leftIcon={<GraduationCap size={14} />}
                  >
                    Start Application
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    size="sm"
                    leftIcon={<ExternalLink size={14} />}
                  >
                    View Details
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardBody className="p-12 text-center">
            {favorites.length === 0 ? (
              <>
                <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Favorites Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Start exploring universities and save your favorites to keep track of programs you're interested in.
                </p>
                <Button
                  onClick={() => window.location.href = '/universities'}
                  leftIcon={<Search size={16} />}
                >
                  Explore Universities
                </Button>
              </>
            ) : (
              <>
                <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Results Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  No favorites match your current filters. Try adjusting your search criteria.
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCountry('');
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default FavoritesManager;