import React, { lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import NotFoundPage from "../components/NotFoundPage";

// Lazy load the pages
const Login = lazy(() => import("../pages/Login"));
const AssessmentPage = lazy(() => import("../pages/AssessmentPage"));
const InterviewPage = lazy(() => import("../pages/InterviewPage"));
const CandidatePage = lazy(() => import("../pages/CandidatePage"));
const CandidateDetails = lazy(() => import("../pages/CandidateDetails"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const PositionPage = lazy(() => import("../pages/PositionPage"));
const AssessmentDetail = lazy(() => import("../pages/AssessmentDetail"));
const PositionDetail = lazy(() => import("../pages/PositionDetail"));
const InterviewDetail = lazy(() => import("../pages/InterviewDetail"));
const EvaluatorPage = lazy(() => import("../pages/EvaluatorPage"));
const EvaluatorDetail = lazy(() => import("../pages/EvaluatorDetail"));

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidates"
          element={
            <ProtectedRoute>
              <CandidatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidates/:id"
          element={
            <ProtectedRoute>
              <CandidateDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessments"
          element={
            <ProtectedRoute>
              <AssessmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessments/:id"
          element={
            <ProtectedRoute>
              <AssessmentDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interviews"
          element={
            <ProtectedRoute>
              <InterviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interviews/:id"
          element={
            <ProtectedRoute>
              <InterviewDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/positions"
          element={
            <ProtectedRoute>
              <PositionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/positions/:id"
          element={
            <ProtectedRoute>
              <PositionDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/evaluators"
          element={
            <ProtectedRoute>
              <EvaluatorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/evaluators/:id"
          element={
            <ProtectedRoute>
              <EvaluatorDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
