import React, { useState, useEffect } from 'react';
import { X, Clock, Download, Eye, ArrowLeft, ArrowRight, FileText, User, RotateCcw } from 'lucide-react';
import Button from '../ui/Button';
import { EnrollmentDocument } from '../../services/documentService';
import { documentService } from '../../services/documentService';

interface DocumentVersionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  document: EnrollmentDocument | null;
}

interface DocumentVersion {
  id: string;
  versionNumber: number;
  createdAt: string;
  createdBy: string;
  changeDescription: string;
  fileSize: string;
}

const DocumentVersionHistory: React.FC<DocumentVersionHistoryProps> = ({
  isOpen,
  onClose,
  document
}) => {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [versionToCompare, setVersionToCompare] = useState<DocumentVersion | null>(null);

  useEffect(() => {
    const loadVersions = async () => {
      if (!document) return;
      
      try {
        setLoading(true);
        const versionHistory = await documentService.getDocumentVersionHistory(document.id);
        setVersions(versionHistory);
        
        if (versionHistory.length > 0) {
          setSelectedVersion(versionHistory[0]);
        }
      } catch (error) {
        console.error('Error loading document versions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && document) {
      loadVersions();
    }
  }, [isOpen, document]);

  const handleViewVersion = (version: DocumentVersion) => {
    if (compareMode && selectedVersion) {
      if (version.id === selectedVersion.id) {
        // Can't compare with self
        return;
      }
      setVersionToCompare(version);
    } else {
      setSelectedVersion(version);
      setVersionToCompare(null);
    }
  };

  const handleDownloadVersion = async (versionId: string) => {
    try {
      await documentService.downloadDocumentVersion(versionId);
      // In a real app, this would trigger a file download
      alert('Version download started');
    } catch (error) {
      console.error('Error downloading version:', error);
      alert('Failed to download version. Please try again.');
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!document) return;
    
    if (window.confirm('Are you sure you want to restore this version? This will create a new version based on this historical version.')) {
      try {
        await documentService.restoreDocumentVersion(document.id, versionId);
        alert('Version restored successfully');
        onClose();
      } catch (error) {
        console.error('Error restoring version:', error);
        alert('Failed to restore version. Please try again.');
      }
    }
  };

  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
    setVersionToCompare(null);
  };

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Version History
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {document.fileName}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleCompareMode}
            >
              {compareMode ? 'Exit Compare Mode' : 'Compare Versions'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              leftIcon={<X size={16} />}
            >
              Close
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Versions List */}
          <div className="w-80 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                Document Versions ({versions.length})
              </h3>
              
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {versions.map((version) => (
                    <div 
                      key={version.id}
                      onClick={() => handleViewVersion(version)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        (selectedVersion?.id === version.id || versionToCompare?.id === version.id)
                          ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">
                          Version {version.versionNumber}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(version.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 line-clamp-2">
                        {version.changeDescription || 'No description provided'}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <User className="w-3 h-3 mr-1" />
                        <span>{version.createdBy}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Version Preview */}
          <div className="flex-1 overflow-y-auto">
            {compareMode ? (
              <div className="h-full flex flex-col">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Compare Versions
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedVersion && versionToCompare 
                      ? `Comparing Version ${selectedVersion.versionNumber} with Version ${versionToCompare.versionNumber}`
                      : 'Select two versions to compare'}
                  </p>
                </div>
                
                <div className="flex-1 p-4">
                  {selectedVersion && versionToCompare ? (
                    <div className="h-full flex">
                      {/* Left Version */}
                      <div className="flex-1 border-r border-gray-200 dark:border-gray-700 pr-2">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded mb-2">
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                            Version {selectedVersion.versionNumber}
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            {new Date(selectedVersion.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="aspect-[8.5/11] bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm overflow-hidden">
                          <div className="h-full flex items-center justify-center">
                            <p className="text-gray-500 dark:text-gray-400">
                              Version preview would be displayed here
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right Version */}
                      <div className="flex-1 pl-2">
                        <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded mb-2">
                          <p className="text-sm font-medium text-green-800 dark:text-green-300">
                            Version {versionToCompare.versionNumber}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            {new Date(versionToCompare.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="aspect-[8.5/11] bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm overflow-hidden">
                          <div className="h-full flex items-center justify-center">
                            <p className="text-gray-500 dark:text-gray-400">
                              Version preview would be displayed here
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          Select Versions to Compare
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Select a version from the list, then select another version to compare
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Compare Navigation */}
                {selectedVersion && versionToCompare && (
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<ArrowLeft size={14} />}
                      disabled={!versions.find(v => v.versionNumber < versionToCompare.versionNumber)}
                      onClick={() => {
                        const prevVersion = versions.find(v => v.versionNumber === versionToCompare.versionNumber - 1);
                        if (prevVersion) setVersionToCompare(prevVersion);
                      }}
                    >
                      Previous Version
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      rightIcon={<ArrowRight size={14} />}
                      disabled={!versions.find(v => v.versionNumber > versionToCompare.versionNumber)}
                      onClick={() => {
                        const nextVersion = versions.find(v => v.versionNumber === versionToCompare.versionNumber + 1);
                        if (nextVersion) setVersionToCompare(nextVersion);
                      }}
                    >
                      Next Version
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col">
                {selectedVersion ? (
                  <>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            Version {selectedVersion.versionNumber}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Created on {new Date(selectedVersion.createdAt).toLocaleString()} by {selectedVersion.createdBy}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadVersion(selectedVersion.id)}
                            leftIcon={<Download size={14} />}
                          >
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestoreVersion(selectedVersion.id)}
                            leftIcon={<RotateCcw size={14} />}
                          >
                            Restore
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 p-6">
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Change Description</h4>
                        <p className="text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          {selectedVersion.changeDescription || 'No description provided for this version.'}
                        </p>
                      </div>
                      
                      <div className="aspect-[8.5/11] bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 shadow-md overflow-hidden">
                        <div className="h-full flex items-center justify-center">
                          <p className="text-gray-500 dark:text-gray-400">
                            Document preview would be displayed here
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<ArrowLeft size={14} />}
                        disabled={!versions.find(v => v.versionNumber < selectedVersion.versionNumber)}
                        onClick={() => {
                          const prevVersion = versions.find(v => v.versionNumber === selectedVersion.versionNumber - 1);
                          if (prevVersion) setSelectedVersion(prevVersion);
                        }}
                      >
                        Previous Version
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        rightIcon={<ArrowRight size={14} />}
                        disabled={!versions.find(v => v.versionNumber > selectedVersion.versionNumber)}
                        onClick={() => {
                          const nextVersion = versions.find(v => v.versionNumber === selectedVersion.versionNumber + 1);
                          if (nextVersion) setSelectedVersion(nextVersion);
                        }}
                      >
                        Next Version
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No Version Selected
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Select a version from the list to view details
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentVersionHistory;