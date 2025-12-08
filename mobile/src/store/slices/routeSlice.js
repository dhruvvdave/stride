import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as routeService from '../../services/routeService';

// Async thunks
export const planRoute = createAsyncThunk(
  'route/planRoute',
  async ({ origin, destination }, { rejectWithValue }) => {
    try {
      const response = await routeService.planRoute(origin, destination);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to plan route');
    }
  }
);

export const geocodeLocation = createAsyncThunk(
  'route/geocodeLocation',
  async (query, { rejectWithValue }) => {
    try {
      const response = await routeService.geocode(query);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to geocode location');
    }
  }
);

const initialState = {
  origin: null,
  destination: null,
  routes: {
    smooth: null,
    standard: null,
    fastest: null,
  },
  selectedRoute: null,
  navigationState: {
    isNavigating: false,
    currentStep: 0,
    distanceRemaining: 0,
    timeRemaining: 0,
  },
  loading: false,
  error: null,
  searchResults: [],
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
      state.navigationState.isNavigating = true;
      state.navigationState.currentStep = 0;
    },
    stopNavigation: (state) => {
      state.navigationState.isNavigating = false;
      state.navigationState.currentStep = 0;
      state.navigationState.distanceRemaining = 0;
      state.navigationState.timeRemaining = 0;
    },
    nextStep: (state) => {
      state.navigationState.currentStep += 1;
    },
    updateNavigationState: (state, action) => {
      state.navigationState = { ...state.navigationState, ...action.payload };
    },
    clearRoute: (state) => {
      state.origin = null;
      state.destination = null;
      state.routes = { smooth: null, standard: null, fastest: null };
      state.selectedRoute = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Plan Route
      .addCase(planRoute.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(planRoute.fulfilled, (state, action) => {
        state.loading = false;
        state.routes = action.payload;
      })
      .addCase(planRoute.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Geocode
      .addCase(geocodeLocation.pending, (state) => {
        state.loading = true;
      })
      .addCase(geocodeLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(geocodeLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
  updateNavigationState,
  clearRoute,
  clearError,
} = routeSlice.actions;

export default routeSlice.reducer;
