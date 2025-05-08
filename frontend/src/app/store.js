import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import assessmentReducer from "../features/assessment/assessmentSlice";
import interviewReducer from "../features/interview/interviewSlice";
import candidateReducer from "../features/candidate/candidateSlice";
import userReducer from "../features/user/userSlice";
import positionReducer from "../features/position/positionSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    assessments: assessmentReducer,
    interviews: interviewReducer,
    candidates: candidateReducer,
    users: userReducer,
    positions: positionReducer,
  },
});
