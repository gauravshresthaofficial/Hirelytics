import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";


export const fetchInterviews = createAsyncThunk(
  "interviews/fetchInterviews",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token; 
      const response = await api.get("/interviews", {
        headers: { Authorization: `Bearer ${token}` }, 
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch interviews"
      );
    }
  }
);


export const createInterview = createAsyncThunk(
  "interviews/createInterview",
  async (interviewData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token; 
      const response = await api.post("/interviews", interviewData, {
        headers: { Authorization: `Bearer ${token}` }, 
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create interview"
      );
    }
  }
);


export const updateInterview = createAsyncThunk(
  "interviews/updateInterview",
  async ({ id, updatedData }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token; 
      const response = await api.put(`/interviews/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` }, 
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update interview"
      );
    }
  }
);


export const deleteInterview = createAsyncThunk(
  "interviews/deleteInterview",
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token; 
      const response = await api.delete(`/interviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` }, 
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete interview"
      );
    }
  }
);

const interviewSlice = createSlice({
  name: "interviews",
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      
      .addCase(fetchInterviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInterviews.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchInterviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(createInterview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInterview.fulfilled, (state, action) => {
        state.loading = false;
        state.data.push(action.payload);
      })
      .addCase(createInterview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(updateInterview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInterview.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.data.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      .addCase(updateInterview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(deleteInterview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInterview.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter((item) => item._id !== action.meta.arg);
      })
      .addCase(deleteInterview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default interviewSlice.reducer;
