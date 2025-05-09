// src/pages/InterviewPage.js
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tabs, Card, message } from "antd";
import InterviewCalendar from "../components/Interviews/CalendaComponent";
import InterviewTable from "../components/Interviews/InterviewTable";
import {
  fetchInterviews,
  deleteInterview,
} from "../features/interview/interviewSlice";

const { TabPane } = Tabs;

const InterviewPage = () => {
  const dispatch = useDispatch();
  const { data: interviews } = useSelector((state) => state.interviews);

  useEffect(() => {
    dispatch(fetchInterviews());
  }, [dispatch]);

  return <InterviewTable interviews={interviews} />;
};

export default InterviewPage;
