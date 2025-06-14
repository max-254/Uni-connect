import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Plus, User, Clock, CheckCircle, AlertTriangle, Trash2, Edit, Save } from 'lucide-react';
import Button from '../ui/Button';
import { adminService } from '../../services/adminService';

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any;
}

const NotesModal: React.FC<NotesModalProps> = ({
  isOpen,
  onClose,
  application
}) => {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [internalOnly, setInternalOnly] = useState(true);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');

  useEffect(() => {
    if (isOpen && application) {
      loadNotes();
    }
  }, [isOpen, application]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const notesData = await adminService.getApplicationNotes(application.id);
      setNotes(notesData);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !application) return;
    
    try {
      const newNoteData = await adminService.addApplicationNote(
        application.id, 
        newNote,
        internalOnly
      );
      
      setNotes(prev => [newNoteData, ...prev]);
      setNewNote('');
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleEditNote = (note: any) => {
    setEditingNoteId(note.id);
    setEditedContent(note.content);
  };

  const handleSaveEdit = async () => {
    if (!editingNoteId || !editedContent.trim()) return;
    
    try {
      await adminService.updateApplicationNote(editingNoteId, editedContent);
      
      // Update note in local state
      setNotes(prev => 
        prev.map(note => 
          note.id === editingNoteId 
            ? { ...note, content: editedContent } 
            : note
        )
      );
      
      setEditingNoteId(null);
      setEditedContent('');
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await adminService.deleteApplicationNote(noteId);
      
      // Remove note from local state
      setNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Application Notes
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {application.studentName} - {application.universityName}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            leftIcon={<X size={16} />}
          >
            Close
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Add Note Form */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Add New Note
              </h3>
              <div className="space-y-4">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Add a note about this application..."
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="internal-only"
                      type="checkbox"
                      checked={internalOnly}
                      onChange={(e) => setInternalOnly(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="internal-only" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Internal note only (not visible to student)
                    </label>
                  </div>
                  <Button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    leftIcon={<Plus size={16} />}
                  >
                    Add Note
                  </Button>
                </div>
              </div>
            </div>

            {/* Notes List */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Notes History
              </h3>
              
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : notes.length > 0 ? (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div 
                      key={note.id} 
                      className={`p-4 rounded-lg border ${
                        note.internalOnly 
                          ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20' 
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {note.addedBy}
                            </p>
                            <div className="flex items-center space-x-2">
                              {note.internalOnly && (
                                <span className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center">
                                  <AlertTriangle size={12} className="mr-1" />
                                  Internal Only
                                </span>
                              )}
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(note.timestamp).toLocaleDateString()} at {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          
                          {editingNoteId === note.id ? (
                            <div className="mt-2 space-y-2">
                              <textarea
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingNoteId(null);
                                    setEditedContent('');
                                  }}
                                  leftIcon={<X size={14} />}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={handleSaveEdit}
                                  leftIcon={<Save size={14} />}
                                >
                                  Save
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                              {note.content}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {editingNoteId !== note.id && (
                        <div className="mt-3 flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditNote(note)}
                            leftIcon={<Edit size={14} />}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNote(note.id)}
                            leftIcon={<Trash2 size={14} />}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Notes Found
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    There are no notes for this application yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-end">
            <Button
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesModal;