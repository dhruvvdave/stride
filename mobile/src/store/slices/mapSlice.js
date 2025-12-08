import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as obstacleService from '../../services/obstacleService';

// Async thunks
export const fetchObstacles = createAsyncThunk(
  'map/fetchObstacles',
  async (bounds, { rejectWithValue }) => {
    try {
      const response = await obstacleService.getObstacles(bounds);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch obstacles');
    }
  }
);

const initialState = {
  region: {
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  obstacles: [],
  userLocation: null,
  loading: false,
  error: null,
  selectedObstacle: null,
};

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setRegion: (state, action) => {
      state.region = action.payload;
    },
    setUserLocation: (state, action) => {
      state.userLocation = action.payload;
    },
    setSelectedObstacle: (state, action) => {
      state.selectedObstacle = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
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
      });
  },
});

export const { setRegion, setUserLocation, setSelectedObstacle, clearError } = mapSlice.actions;
export default mapSlice.reducer;
