import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as userService from '../../services/userService';

// Async thunks
export const fetchUserStats = createAsyncThunk(
  'user/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getStats();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

export const fetchAchievements = createAsyncThunk(
  'user/fetchAchievements',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getAchievements();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch achievements');
    }
  }
);

export const fetchVehicles = createAsyncThunk(
  'user/fetchVehicles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getVehicles();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch vehicles');
    }
  }
);

export const fetchLeaderboard = createAsyncThunk(
  'user/fetchLeaderboard',
  async (period, { rejectWithValue }) => {
    try {
      const response = await userService.getLeaderboard(period);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaderboard');
    }
  }
);

const initialState = {
  stats: {
    totalDistance: 0,
    obstaclesReported: 0,
    points: 0,
    rank: 0,
  },
  achievements: [],
  vehicles: [],
  favorites: [],
  leaderboard: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addVehicle: (state, action) => {
      state.vehicles.push(action.payload);
    },
    updateVehicle: (state, action) => {
      const index = state.vehicles.findIndex(v => v.id === action.payload.id);
      if (index !== -1) {
        state.vehicles[index] = action.payload;
      }
    },
    removeVehicle: (state, action) => {
      state.vehicles = state.vehicles.filter(v => v.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Stats
      .addCase(fetchUserStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Achievements
      .addCase(fetchAchievements.fulfilled, (state, action) => {
        state.achievements = action.payload;
      })
      // Fetch Vehicles
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.vehicles = action.payload;
      })
      // Fetch Leaderboard
      .addCase(fetchLeaderboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.leaderboard = action.payload;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, addVehicle, updateVehicle, removeVehicle } = userSlice.actions;
export default userSlice.reducer;
