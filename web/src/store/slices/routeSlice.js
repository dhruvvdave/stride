import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as routingService from '../../services/routing';

// Async thunks
export const planRoute = createAsyncThunk(
  'route/planRoute',
  async ({ origin, destination, preferences }, { rejectWithValue }) => {
    try {
      const response = await routingService.planRoute({ origin, destination, preferences });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to plan route');
    }
  }
);

export const saveRoute = createAsyncThunk(
  'route/saveRoute',
  async (routeData, { rejectWithValue }) => {
    try {
      const response = await routingService.saveRoute(routeData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save route');
    }
  }
);

const initialState = {
  origin: null,
  destination: null,
  routes: [], // Array of route options (smooth, standard, fastest)
  selectedRoute: null,
  isNavigating: false,
  currentStep: 0,
  loading: false,
  error: null,
};

const routeSlice = createSlice({
  name: 'route',
  initialState,
  reducers: {
    setOrigin: (state, action) => {
      state.origin = action.payload;
    },
    setDestination: (state, action) => {
      state.destination = action.payload;
    },
    selectRoute: (state, action) => {
      state.selectedRoute = action.payload;
    },
    startNavigation: (state) => {
      state.isNavigating = true;
      state.currentStep = 0;
    },
    stopNavigation: (state) => {
      state.isNavigating = false;
      state.currentStep = 0;
    },
    nextStep: (state) => {
      if (state.selectedRoute && state.currentStep < state.selectedRoute.steps.length - 1) {
        state.currentStep += 1;
      }
    },
    previousStep: (state) => {
      if (state.currentStep > 0) {
        state.currentStep -= 1;
      }
    },
    clearRoute: (state) => {
      state.origin = null;
      state.destination = null;
      state.routes = [];
      state.selectedRoute = null;
      state.isNavigating = false;
      state.currentStep = 0;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Plan route
      .addCase(planRoute.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(planRoute.fulfilled, (state, action) => {
        state.loading = false;
        state.routes = action.payload;
        // Auto-select the smooth route if available
        if (action.payload.length > 0) {
          const smoothRoute = action.payload.find(r => r.type === 'smooth') || action.payload[0];
          state.selectedRoute = smoothRoute;
        }
      })
      .addCase(planRoute.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Save route
      .addCase(saveRoute.fulfilled, (state) => {
        // Route saved successfully
      });
  },
});

export const {
  setOrigin,
  setDestination,
  selectRoute,
  startNavigation,
  stopNavigation,
  nextStep,
  previousStep,
  clearRoute,
  clearError,
} = routeSlice.actions;

export default routeSlice.reducer;
