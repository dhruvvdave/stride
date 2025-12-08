import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { closeReportModal, updateReportData, setSubmitting } from '../../store/slices/obstacleSlice';
import { createObstacle } from '../../store/slices/mapSlice';
import toast from 'react-hot-toast';

const obstacleTypes = [
  { value: 'speed_bump', label: 'Speed Bump', icon: '🚧' },
  { value: 'pothole', label: 'Pothole', icon: '🕳️' },
  { value: 'rough_road', label: 'Rough Road', icon: '⚠️' },
  { value: 'construction', label: 'Construction', icon: '🏗️' },
  { value: 'flooding', label: 'Flooding', icon: '🌊' },
  { value: 'railroad', label: 'Railroad Crossing', icon: '🚂' },
  { value: 'steep_grade', label: 'Steep Grade', icon: '⛰️' },
];

const severityLevels = [
  { value: 'low', label: 'Low', color: 'bg-success-main' },
  { value: 'medium', label: 'Medium', color: 'bg-warning-main' },
  { value: 'high', label: 'High', color: 'bg-danger-main' },
];

const ReportObstacleModal = () => {
  const dispatch = useDispatch();
  const { reportModalOpen, reportData, submitting } = useSelector((state) => state.obstacle);
  const { userLocation } = useSelector((state) => state.map);

  const handleClose = () => {
    dispatch(closeReportModal());
  };

  const handleTypeSelect = (type) => {
    dispatch(updateReportData({ type }));
  };

  const handleSeveritySelect = (severity) => {
    dispatch(updateReportData({ severity }));
  };

  const handleDescriptionChange = (e) => {
    dispatch(updateReportData({ description: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reportData.type) {
      toast.error('Please select an obstacle type');
      return;
    }

    dispatch(setSubmitting(true));

    try {
      const obstacleData = {
        type: reportData.type,
        severity: reportData.severity,
        description: reportData.description,
        latitude: reportData.location?.lat || userLocation?.lat,
        longitude: reportData.location?.lng || userLocation?.lng,
      };

      await dispatch(createObstacle(obstacleData)).unwrap();
      toast.success('Obstacle reported successfully!');
      handleClose();
    } catch (error) {
      toast.error('Failed to report obstacle');
    } finally {
      dispatch(setSubmitting(false));
    }
  };

  return (
    <Modal
      isOpen={reportModalOpen}
      onClose={handleClose}
      title="Report Obstacle"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Obstacle Type */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Obstacle Type *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {obstacleTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleTypeSelect(type.value)}
                className={`
                  p-4 rounded-lg border-2 transition-all text-left
                  ${reportData.type === type.value
                    ? 'border-primary-main bg-primary-lighter'
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              >
                <div className="text-2xl mb-2">{type.icon}</div>
                <div className="font-medium text-gray-900">{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Severity */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Severity *
          </label>
          <div className="flex space-x-3">
            {severityLevels.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => handleSeveritySelect(level.value)}
                className={`
                  flex-1 px-4 py-3 rounded-lg font-semibold text-white transition-all
                  ${level.color}
                  ${reportData.severity === level.value ? 'ring-4 ring-offset-2 ring-gray-300' : 'opacity-60'}
                `}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={reportData.description}
            onChange={handleDescriptionChange}
            placeholder="Add any additional details..."
            rows={4}
            className="w-full px-4 py-3 rounded-md border border-gray-400 focus:border-primary-main focus:ring-2 focus:ring-primary-main focus:outline-none transition-all"
          />
        </div>

        {/* Submit Button */}
        <div className="flex space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            fullWidth
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            fullWidth
            disabled={submitting || !reportData.type}
          >
            {submitting ? 'Reporting...' : 'Report Obstacle'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReportObstacleModal;
