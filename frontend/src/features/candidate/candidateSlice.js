import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

const determineOverallStatus = (candidate) => {
  return candidate.currentStatus || "Pending";
};

export const fetchCandidates = createAsyncThunk(
  "candidates/fetchCandidates",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/candidates");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch data"
      );
    }
  }
);

export const createCandidate = createAsyncThunk(
  "candidates/createCandidate",
  async (candidateData, { rejectWithValue }) => {
    try {
      const response = await api.post("/candidates", candidateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create a candidate"
      );
    }
  }
);

export const updateCandidate = createAsyncThunk(
  "candidates/updateCandidate",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/candidates/${id}`, updatedData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete a candidate"
      );
    }
  }
);

export const deleteCandidate = createAsyncThunk(
  "candidates/deleteCandidate",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/candidates/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete a candidate"
      );
    }
  }
);

export const fetchCandidateById = createAsyncThunk(
  "candidates/fetchCandidateById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/candidates/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch candidate"
      );
    }
  }
);

export const addAssessmentToCandidate = createAsyncThunk(
  "candidates/addAssessmentToCandidate",
  async ({ candidateId, assessmentData }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/candidates/${candidateId}/assessments`,
        assessmentData
      );
      console.log(response.data.data);
      return response.data.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(
        error.response?.data?.error || "Failed to add assessment"
      );
    }
  }
);

export const completeCandidateAssessment = createAsyncThunk(
  "candidates/completeCandidateAssessment",
  async ({ candidateId, assessmentId }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/candidates/${candidateId}/assessments/${assessmentId}/complete`
      );
      console.log(response.data.data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update a candidate assessment"
      );
    }
  }
);

export const updateCandidateAssessment = createAsyncThunk(
  "candidates/updateCandidateAssessment",
  async (
    { candidateId, assessmentId, assessmentData },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(
        `/candidates/${candidateId}/assessments/${assessmentId}`,
        assessmentData
      );
      console.log(response.data.data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update a candidate assessment"
      );
    }
  }
);

export const addInterviewToCandidate = createAsyncThunk(
  "candidates/addInterviewToCandidate",
  async ({ candidateId, interviewData }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/candidates/${candidateId}/interviews`,
        interviewData
      );
      console.log(response.data.data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to Schedule interview"
      );
    }
  }
);

export const completeCandidateInterview = createAsyncThunk(
  "candidates/completeCandidateInterview",
  async ({ candidateId, interviewId }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/candidates/${candidateId}/interviews/${interviewId}/complete`
      );
      console.log(response.data.data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update a candidate interview"
      );
    }
  }
);

export const updateCandidateInterview = createAsyncThunk(
  "candidates/updateCandidateInterview",
  async ({ candidateId, interviewId, interviewData }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/candidates/${candidateId}/interviews/${interviewId}`,
        interviewData
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update a candidate interview"
      );
    }
  }
);

export const updateCandidateStatus = createAsyncThunk(
  "candidates/updateCandidateStatus",
  async ({ candidateId, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/candidates/${candidateId}/status`, {
        status,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update a candidate status"
      );
    }
  }
);

export const makeOfferToCandidate = createAsyncThunk(
  "candidates/makeOfferToCandidate",
  async ({ candidateId, offerData }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/candidates/${candidateId}/offer`,
        offerData
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to offer a candidate"
      );
    }
  }
);

export const updateOfferStatus = createAsyncThunk(
  "candidates/updateOfferStatus",
  async ({ candidateId, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/candidates/${candidateId}/offer`, {
        status,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update offer status"
      );
    }
  }
);

export const hireCandidate = createAsyncThunk(
  "candidates/hireCandidate",
  async ({ candidateId, hireData }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/candidates/${candidateId}/hire`,
        hireData
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to hire candidate"
      );
    }
  }
);

export const rejectCandidate = createAsyncThunk(
  "candidates/rejectCandidate",
  async ({ candidateId, rejectionData }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/candidates/${candidateId}/reject`,
        rejectionData
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to reject candidate"
      );
    }
  }
);

const candidateSlice = createSlice({
  name: "candidates",
  initialState: {
    data: [],
    loading: false,
    error: null,
    completingAssessment: false,
    completeAssessmentError: null,
    completeAssessmentSuccess: false,
    completingInterview: false,
    completeInterviewError: null,
    completeInterviewSuccess: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(fetchCandidates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCandidates.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCandidates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCandidate.fulfilled, (state, action) => {
        state.data.push(action.payload.data);
      })
      .addCase(updateCandidate.fulfilled, (state, action) => {
        const index = state.data.findIndex(
          (candidate) => candidate._id === action.payload._id
        );
        action.payload;
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      .addCase(deleteCandidate.fulfilled, (state, action) => {
        state.data = state.data.filter(
          (candidate) => candidate._id !== action.meta.arg
        );
      })
      .addCase(fetchCandidateById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCandidateById.fulfilled, (state, action) => {
        state.loading = false;
        const candidateIndex = state.data.findIndex(
          (candidate) => candidate._id === action.payload._id
        );
        if (candidateIndex !== -1) {
          state.data[candidateIndex] = action.payload;
        } else {
          state.data.push(action.payload);
        }
      })
      .addCase(fetchCandidateById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addAssessmentToCandidate.fulfilled, (state, action) => {
        const index = state.data.findIndex(
          (candidate) => candidate._id === action.payload._id
        );
        action.payload;
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      .addCase(updateCandidateAssessment.fulfilled, (state, action) => {
        const candidateIndex = state.data.findIndex(
          (candidate) => candidate._id === action.payload._id
        );
        console.log(candidateIndex);
        console.log(action.payload);
        if (candidateIndex !== -1) {
          state.data[candidateIndex] = action.payload;
        }
      })
      .addCase(addInterviewToCandidate.fulfilled, (state, action) => {
        const candidateIndex = state.data.findIndex(
          (candidate) => candidate._id === action.payload._id
        );
        if (candidateIndex !== -1) {
          state.data[candidateIndex] = action.payload;
        }
      })
      .addCase(updateCandidateInterview.fulfilled, (state, action) => {
        const candidateIndex = state.data.findIndex(
          (candidate) => candidate._id === action.payload._id
        );
        if (candidateIndex !== -1) {
          state.data[candidateIndex] = action.payload;
        }
      })
      .addCase(updateCandidateStatus.fulfilled, (state, action) => {
        const candidateIndex = state.data.findIndex(
          (candidate) => candidate._id === action.payload._id
        );
        if (candidateIndex !== -1) {
          state.data[candidateIndex] = action.payload;
        }
      })
      .addCase(makeOfferToCandidate.fulfilled, (state, action) => {
        const candidateIndex = state.data.findIndex(
          (candidate) => candidate._id === action.payload._id
        );
        if (candidateIndex !== -1) {
          state.data[candidateIndex] = action.payload;
        }
      })
      .addCase(updateOfferStatus.fulfilled, (state, action) => {
        const candidateIndex = state.data.findIndex(
          (candidate) => candidate._id === action.payload._id
        );
        if (candidateIndex !== -1) {
          state.data[candidateIndex] = action.payload;
        }
      })
      .addCase(hireCandidate.fulfilled, (state, action) => {
        const candidateIndex = state.data.findIndex(
          (candidate) => candidate._id === action.payload._id
        );
        if (candidateIndex !== -1) {
          state.data[candidateIndex] = action.payload;
        }
      })
      .addCase(rejectCandidate.fulfilled, (state, action) => {
        const candidateIndex = state.data.findIndex(
          (candidate) => candidate._id === action.payload._id
        );
        if (candidateIndex !== -1) {
          state.data[candidateIndex] = action.payload;
        }
      })

      .addCase(completeCandidateAssessment.pending, (state) => {
        state.completingAssessment = true;
        state.completeAssessmentError = null;
        state.completeAssessmentSuccess = false;
      })
      .addCase(completeCandidateAssessment.fulfilled, (state, action) => {
        const candidateIndex = state.data.findIndex(
          (candidate) => candidate._id === action.payload._id
        );
        if (candidateIndex !== -1) {
          state.data[candidateIndex] = action.payload;
        }
      })
      .addCase(completeCandidateAssessment.rejected, (state, action) => {
        state.completingAssessment = false;
        state.completeAssessmentError = action.payload || action.error;
      })

      .addCase(completeCandidateInterview.pending, (state) => {
        state.completingInterview = true;
        state.completeInterviewError = null;
        state.completeInterviewSuccess = false;
      })
      .addCase(completeCandidateInterview.fulfilled, (state, action) => {
        const candidateIndex = state.data.findIndex(
          (candidate) => candidate._id === action.payload._id
        );
        if (candidateIndex !== -1) {
          state.data[candidateIndex] = action.payload;
        }
      })
      .addCase(completeCandidateInterview.rejected, (state, action) => {
        state.completingInterview = false;
        state.completeInterviewError = action.payload || action.error;
      });
  },
});

export default candidateSlice.reducer;
