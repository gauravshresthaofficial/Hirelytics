// src/pages/InterviewPage.js
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tabs, Card, message } from "antd";
import InterviewCalendar from "../components/Interviews/CalendaComponent";
import InterviewTable from "../components/Interviews/InterviewTable";
import { fetchInterviews } from "../features/interview/interviewSlice";

const InterviewPage = () => {
  const dispatch = useDispatch();
  const { data: interviews, loading } = useSelector(
    (state) => state.interviews
  );

  useEffect(() => {
    dispatch(fetchInterviews());
  }, [dispatch]);

  return <InterviewTable interviews={interviews} loading={loading} />;
};

export default InterviewPage;
