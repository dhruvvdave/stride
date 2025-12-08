import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  reportModalOpen: false,
  reportData: {
    type: '',
    severity: 'medium',
    description: '',
    location: null,
    photos: [],
  },
  submitting: false,
  error: null,
};

const obstacleSlice = createSlice({
  name: 'obstacle',
  initialState,
  reducers: {
    openReportModal: (state, action) => {
      state.reportModalOpen = true;
      if (action.payload?.location) {
        state.reportData.location = action.payload.location;
      }
    },
    closeReportModal: (state) => {
      state.reportModalOpen = false;
      state.reportData = {
        type: '',
        severity: 'medium',
        description: '',
        location: null,
        photos: [],
      };
      state.error = null;
    },
    updateReportData: (state, action) => {
      state.reportData = { ...state.reportData, ...action.payload };
    },
    setSubmitting: (state, action) => {
      state.submitting = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  openReportModal,
  closeReportModal,
  updateReportData,
  setSubmitting,
  setError,
  clearError,
} = obstacleSlice.actions;

export default obstacleSlice.reducer;
