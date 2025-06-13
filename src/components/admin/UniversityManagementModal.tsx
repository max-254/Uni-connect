import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { adminService } from '../../services/adminService';

interface UniversityManagementModalProps {
  university: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const UniversityManagementModal: React.FC<UniversityManagementModalProps> = ({
  university,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    acceptanceRate: '',
    programs: [''],
    requirements: {
      gpa: '',
      testScore: ''
    },
    fees: {
      tuition: '',
      total: ''
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (university) {
      setFormData({
        name: university.name || '',
        country: university.country || '',
        acceptanceRate: university.acceptanceRate || '',
        programs: university.programs || [''],
        requirements: {
          gpa: university.requirements?.gpa || '',
          testScore: university.requirements?.testScore || ''
        },
        fees: {
          tuition: university.fees?.tuition || '',
          total: university.fees?.total || ''
        }
      });
    } else {
      // Reset form for new university
      setFormData({
        name: '',
        country: '',
        acceptanceRate: '',
        programs: [''],
        requirements: {
          gpa: '',
          testScore: ''
        },
        fees: {
          tuition: '',
          total: ''
        }
      });
    }
  }, [university]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleProgramChange = (index: number, value: string) => {
    const newPrograms = [...formData.programs];
    newPrograms[index] = value;
    setFormData(prev => ({
      ...prev,
      programs: newPrograms
    }));
  };

  const addProgram = () => {
    setFormData(prev => ({
      ...prev,
      programs: [...prev.programs, '']
    }));
  };

  const removeProgram = (index: number) => {
    setFormData(prev => ({
      ...prev,
      programs: prev.programs.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      if (university) {
        await adminService.updateUniversity(university.id, formData);
      } else {
        await adminService.createUniversity(formData);
      }
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving university:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {university ? 'Edit University' : 'Add New University'}
          </h2>
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
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="University Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter university name"
                    required
                  />
                  <Input
                    label="Country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="Enter country"
                    required
                  />
                  <Input
                    label="Acceptance Rate"
                    value={formData.acceptanceRate}
                    onChange={(e) => handleInputChange('acceptanceRate', e.target.value)}
                    placeholder="e.g., 15%"
                  />
                </div>
              </CardBody>
            </Card>

            {/* Programs */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Programs</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addProgram}
                    leftIcon={<Plus size={16} />}
                  >
                    Add Program
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {formData.programs.map((program, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={program}
                        onChange={(e) => handleProgramChange(index, e.target.value)}
                        placeholder="Enter program name"
                        className="flex-1"
                      />
                      {formData.programs.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProgram(index)}
                          leftIcon={<Trash2 size={16} />}
                          className="text-red-600 hover:text-red-700"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Admission Requirements</h3>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Minimum GPA"
                    value={formData.requirements.gpa}
                    onChange={(e) => handleNestedInputChange('requirements', 'gpa', e.target.value)}
                    placeholder="e.g., 3.5"
                  />
                  <Input
                    label="Test Score Requirement"
                    value={formData.requirements.testScore}
                    onChange={(e) => handleNestedInputChange('requirements', 'testScore', e.target.value)}
                    placeholder="e.g., SAT 1400+"
                  />
                </div>
              </CardBody>
            </Card>

            {/* Fees */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fees</h3>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Annual Tuition"
                    value={formData.fees.tuition}
                    onChange={(e) => handleNestedInputChange('fees', 'tuition', e.target.value)}
                    placeholder="e.g., $50,000"
                  />
                  <Input
                    label="Total Annual Cost"
                    value={formData.fees.total}
                    onChange={(e) => handleNestedInputChange('fees', 'total', e.target.value)}
                    placeholder="e.g., $75,000"
                  />
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              isLoading={loading}
              leftIcon={<Save size={16} />}
            >
              {university ? 'Update University' : 'Create University'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityManagementModal;