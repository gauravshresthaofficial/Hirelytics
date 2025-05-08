import React from "react";
import { Card } from "antd";
import { Bar } from "@ant-design/charts";

const PositionOverview = ({ candidates, positions }) => {
  const appCount = positions.map((pos) => {
    const numApplied = candidates.filter(
      (c) => c.appliedPosition === pos.positionName
    ).length;

    return {
      position: pos.positionName,
      count: numApplied,
    };
  });

  const config = {
    data: appCount,
    xField: "count", // Count on X-axis
    yField: "position", // Position on Y-axis
    seriesField: "position", // For color coding
    legend: false,
    barWidthRatio: 0.6,
    isStack: false,
    isGroup: false,
    label: {
      position: "right",
      style: {
        fill: "#595959",
        fontSize: 14,
      },
    },
    tooltip: {
      showMarkers: false,
    },
    height: 400,
    autoFit: true,
    interactions: [{ type: "active-region" }],
  };

  return (
    <Card title="Position Overview (Applicants per Position)">
      <Bar {...config} />
    </Card>
  );
};

export default PositionOverview;
