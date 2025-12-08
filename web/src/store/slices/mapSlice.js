import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as obstaclesService from '../../services/obstacles';

// Async thunks
export const fetchObstacles = createAsyncThunk(
  'map/fetchObstacles',
  async ({ bounds, types }, { rejectWithValue }) => {
    try {
      const response = await obstaclesService.getObstacles({ bounds, types });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch obstacles');
    }
  }
);

export const createObstacle = createAsyncThunk(
  'map/createObstacle',
  async (obstacleData, { rejectWithValue }) => {
    try {
      const response = await obstaclesService.createObstacle(obstacleData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create obstacle');
    }
  }
);

export const reportObstacle = createAsyncThunk(
  'map/reportObstacle',
  async ({ id, reportData }, { rejectWithValue }) => {
    try {
      const response = await obstaclesService.reportObstacle(id, reportData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to report obstacle');
    }
  }
);

const initialState = {
  center: [37.7749, -122.4194], // Default to San Francisco
  zoom: 13,
  obstacles: [],
  selectedObstacle: null,
  userLocation: null,
  loading: false,
  error: null,
};

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setCenter: (state, action) => {
      state.center = action.payload;
    },
    setZoom: (state, action) => {
      state.zoom = action.payload;
    },
    setObstacles: (state, action) => {
      state.obstacles = action.payload;
    },
    selectObstacle: (state, action) => {
      state.selectedObstacle = action.payload;
    },
    setUserLocation: (state, action) => {
      state.userLocation = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch obstacles
      .addCase(fetchObstacles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchObstacles.fulfilled, (state, action) => {
        state.loading = false;
        state.obstacles = action.payload;
      })
      .addCase(fetchObstacles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create obstacle
      .addCase(createObstacle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createObstacle.fulfilled, (state, action) => {
        state.loading = false;
        state.obstacles.push(action.payload);
      })
      .addCase(createObstacle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Report obstacle
      .addCase(reportObstacle.fulfilled, (state, action) => {
        const index = state.obstacles.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.obstacles[index] = action.payload;
        }
      });
  },
});

export const { setCenter, setZoom, setObstacles, selectObstacle, setUserLocation, clearError } = mapSlice.actions;
export default mapSlice.reducer;
