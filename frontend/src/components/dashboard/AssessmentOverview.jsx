import React from "react";
import { Table } from "antd";

const AssessmentOverview = ({ candidates }) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const allAssessments = candidates.flatMap((candidate) =>
    (candidate.assessments || [])
      .filter((assess) => {
        const date = new Date(assess.submittedAt || assess.createdAt);
        return (
          date.getMonth() === currentMonth && date.getFullYear() === currentYear
        );
      })
      .map((assess) => ({
        candidate: candidate.fullName,
        status: assess.status,
        score: assess.score || 0,
        maxScore: assess.maxScore || 0,
        title: assess.assessmentName,
        date: new Date(assess.submittedAt || assess.createdAt),
      }))
  );

  const sortedAssessments = allAssessments
    .sort((a, b) => b.scheduledDate - a.scheduledDate)
    .slice(0, 6);

  const columns = [
    { title: "Candidate", dataIndex: "candidate", key: "candidate" },
    { title: "Assessment", dataIndex: "title", key: "title" },
    { title: "Status", dataIndex: "status", key: "status" },
    {
      title: "Score",
      dataIndex: "score",
      key: "score",
      render: (_, record) => {
        return `${record.score}/${record.maxScore}`;
      },
    },
  ];

  return (
    <Table
      dataSource={sortedAssessments}
      columns={columns}
      rowKey={(record, idx) => idx}
      pagination={false}
    />
  );
};

export default AssessmentOverview;
