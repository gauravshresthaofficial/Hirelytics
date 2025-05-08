import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

export const fetchAssessments = createAsyncThunk(
  "assessments/fetchAssessments",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await api.get("/assessments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch assessments"
      );
    }
  }
);

export const createAssessment = createAsyncThunk(
  "assessments/createAssessment",
  async (assessmentData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await api.post("/assessments", assessmentData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create assessment"
      );
    }
  }
);

export const updateAssessment = createAsyncThunk(
  "assessments/updateAssessment",
  async ({ id, updatedData }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await api.put(`/assessments/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update assessment"
      );
    }
  }
);

export const deleteAssessment = createAsyncThunk(
  "assessments/deleteAssessment",
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await api.delete(`/assessments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete assessment"
      );
    }
  }
);

const assessmentSlice = createSlice({
  name: "assessments",
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(fetchAssessments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssessments.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAssessments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createAssessment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAssessment.fulfilled, (state, action) => {
        state.loading = false;
        state.data.push(action.payload);
      })
      .addCase(createAssessment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateAssessment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAssessment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.data.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      .addCase(updateAssessment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteAssessment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAssessment.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter((item) => item._id !== action.meta.arg);
      })
      .addCase(deleteAssessment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default assessmentSlice.reducer;
