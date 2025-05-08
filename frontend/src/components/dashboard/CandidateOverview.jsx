import React from "react";
import { Card } from "antd";
import { Pie, Line } from "@ant-design/plots";

const CandidateOverview = ({ candidates }) => {
  const statusCounts = candidates.reduce((acc, candidate) => {
    acc[candidate.currentStatus] = (acc[candidate.currentStatus] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(statusCounts).map(([type, value]) => ({
    type,
    value,
  }));

  return (
    <Card title="Candidate Status Overview" style={{ flexGrow: 1 }}>
      <Pie
        data={pieData}
        angleField="value"
        colorField="type"
        radius={0.8}
        label={{ type: "spider" }}
      />
    </Card>
  );
};

export default CandidateOverview;
