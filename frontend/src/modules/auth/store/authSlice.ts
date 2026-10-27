import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../../../core/api/axios';

export interface Role {
  _id: string;
  name: string;
  code?: string;
  permissions: string[];
}

// A teacher's single class+section+subject assignment
export interface TeacherResponsibility {
  _id: string;
  classId: { _id: string; name: string };
  sectionId: { _id: string; name: string };
  subjectId: { _id: string; name: string; code?: string };
  isClassCoordinator: boolean;
  isExaminationIncharge: boolean;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: Role[];
  token: string;
  refreshToken: string;
  dashboardRoute?: string;
  // Teacher-specific
  responsibilities?: TeacherResponsibility[];
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  activePortal: string | null;
  dashboardRoute: string | null;
}

const initialState: AuthState = {
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null,
  isLoading: false,
  error: null,
  activePortal: localStorage.getItem('activePortal') || null,
  dashboardRoute: null,
};

export const login = createAsyncThunk('auth/login', async (credentials: any, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    const payload = data.data;
    localStorage.setItem('user', JSON.stringify(payload));
    localStorage.setItem('token', payload.token);
    localStorage.setItem('refreshToken', payload.refreshToken);
    return payload;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken });
    }
    return true;
  } catch {
    return true;
  }
});

/**
 * Fetch full user profile including responsibilities after login.
 * Used to hydrate teacher assignments without requiring a fresh login.
 */
export const fetchUserProfile = createAsyncThunk('auth/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    return data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.activePortal = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tenantId');
      localStorage.removeItem('activePortal');
    },
    clearError: (state) => {
      state.error = null;
    },
    setActivePortal: (state, action: PayloadAction<string>) => {
      state.activePortal = action.payload;
      localStorage.setItem('activePortal', action.payload);
    },
    setResponsibilities: (state, action: PayloadAction<TeacherResponsibility[]>) => {
      if (state.user) {
        state.user.responsibilities = action.payload;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.dashboardRoute = action.payload.dashboardRoute || null;
      })
      .addCase(login.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<any>) => {
        if (state.user) {
          state.user.responsibilities = action.payload.responsibilities || [];
          state.user.roles = action.payload.roles || state.user.roles;
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.activePortal = null;
        state.dashboardRoute = null;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tenantId');
        localStorage.removeItem('activePortal');
      });
  },
});

export const { logout, clearError, setActivePortal, setResponsibilities } = authSlice.actions;
export default authSlice.reducer;
