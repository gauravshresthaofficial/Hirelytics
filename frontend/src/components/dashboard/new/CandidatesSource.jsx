import React from "react";
import { Pie, Column } from "@ant-design/charts";
import { Typography } from "antd";

const { Text } = Typography;

const CandidateSources = ({ candidates }) => {
  const sourceCounts = candidates.reduce((acc, candidate) => {
    const source = candidate.source || "Unknown";
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(sourceCounts).map(([source, count]) => ({
    source,
    count,
    percent: ((count / candidates.length) * 100).toFixed(1),
  }));

  const config = {
    data,
    xField: "source",
    yField: "count",
    seriesField: "source",
    legend: true,
  };

  return (
    <div style={{ height: 400 }}>
      {data.length > 0 ? (
        <Column {...config} />
      ) : (
        <Text type="secondary">No source data available</Text>
      )}
    </div>
  );
};

export default CandidateSources;
