import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as obstacleService from '../../services/obstacleService';

// Async thunks
export const reportObstacle = createAsyncThunk(
  'obstacle/report',
  async (obstacleData, { rejectWithValue }) => {
    try {
      const response = await obstacleService.reportObstacle(obstacleData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to report obstacle');
    }
  }
);

export const voteObstacle = createAsyncThunk(
  'obstacle/vote',
  async ({ obstacleId, voteType }, { rejectWithValue }) => {
    try {
      const response = await obstacleService.voteObstacle(obstacleId, voteType);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to vote');
    }
  }
);

const initialState = {
  reportingLocation: null,
  selectedType: null,
  selectedSeverity: null,
  photo: null,
  description: '',
  isReporting: false,
  loading: false,
  error: null,
};

const obstacleSlice = createSlice({
  name: 'obstacle',
  initialState,
  reducers: {
    setReportingLocation: (state, action) => {
      state.reportingLocation = action.payload;
    },
    setObstacleType: (state, action) => {
      state.selectedType = action.payload;
    },
    setObstacleSeverity: (state, action) => {
      state.selectedSeverity = action.payload;
    },
    setPhoto: (state, action) => {
      state.photo = action.payload;
    },
    setDescription: (state, action) => {
      state.description = action.payload;
    },
    resetReporting: (state) => {
      state.reportingLocation = null;
      state.selectedType = null;
      state.selectedSeverity = null;
      state.photo = null;
      state.description = '';
      state.isReporting = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Report Obstacle
      .addCase(reportObstacle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reportObstacle.fulfilled, (state) => {
        state.loading = false;
        state.reportingLocation = null;
        state.selectedType = null;
        state.selectedSeverity = null;
        state.photo = null;
        state.description = '';
        state.isReporting = false;
      })
      .addCase(reportObstacle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Vote Obstacle
      .addCase(voteObstacle.pending, (state) => {
        state.loading = true;
      })
      .addCase(voteObstacle.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(voteObstacle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setReportingLocation,
  setObstacleType,
  setObstacleSeverity,
  setPhoto,
  setDescription,
  resetReporting,
  clearError,
} = obstacleSlice.actions;

export default obstacleSlice.reducer;
