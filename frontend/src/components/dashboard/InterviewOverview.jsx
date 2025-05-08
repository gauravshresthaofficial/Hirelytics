import React from "react";
import { Card, Table } from "antd";
import moment from "moment";

const InterviewOverview = ({ candidates }) => {
  const interviews = candidates.flatMap((candidate) =>
    candidate.interviews.map((interview) => ({
      candidate: candidate.fullName,
      status: interview.status,
      score: interview.score || 0,
      date: moment(interview.scheduledDatetime),
    }))
  );

  const columns = [
    { title: "Candidate", dataIndex: "candidate", key: "candidate" },
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Score", dataIndex: "score", key: "score" },
  ];

  return (
    <Card title="Interview Overview">
      <Table
        dataSource={interviews}
        columns={columns}
        rowKey={(record, idx) => idx}
        pagination={false}
      />
    </Card>
  );
};

export default InterviewOverview;
