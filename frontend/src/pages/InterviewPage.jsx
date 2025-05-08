// src/pages/InterviewPage.js
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tabs, Card, message } from "antd";
import InterviewCalendar from "../components/Interviews/CalendaComponent";
import InterviewTable from "../components/Interviews/InterviewTable";
import {
  fetchInterviews,
  createInterview,
  updateInterview,
  deleteInterview,
} from "../features/interview/interviewSlice";

const { TabPane } = Tabs;

const InterviewPage = () => {
  const dispatch = useDispatch();
  const { data: interviews } = useSelector((state) => state.interviews);

  useEffect(() => {
    dispatch(fetchInterviews());
  }, [dispatch]);

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteInterview(id)).unwrap();
      message.success("Interview deleted successfully!");
    } catch (err) {
      message.error(err || "Failed to delete interview.");
    }
  };

  return (
    <Card style={{ overflow: "auto", width: "100%" }}>
      <InterviewTable
        interviews={interviews}
        // onCreate={handleCreate}
        // onUpdate={handleUpdate}
        // onDelete={handleDelete}
      />
    </Card>
  );
};

export default InterviewPage;
