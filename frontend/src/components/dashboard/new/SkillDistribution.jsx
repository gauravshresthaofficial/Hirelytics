import React from "react";
import { Pie } from "@ant-design/charts";
import { Typography } from "antd";

const { Text } = Typography;

const SkillDistribution = ({ candidates }) => {
  const skillCounts = candidates.reduce((acc, candidate) => {
    candidate.skills?.forEach((skill) => {
      const normalizedSkill = skill.trim().toLowerCase();
      acc[normalizedSkill] = (acc[normalizedSkill] || 0) + 1;
    });
    return acc;
  }, {});

  const data = Object.entries(skillCounts).map(([skill, count]) => ({
    skill: skill.charAt(0).toUpperCase() + skill.slice(1),
    value: count,
  }));

  const config = {
    data,
    angleField: "value",
    colorField: "skill",
    // startAngle: Math.PI,
    // endAngle: Math.PI * 1.5,
    radius: 1,
    label: {
      type: "outer",
      content: "{name} ({percentage})",
    },
    // interactions: [{ type: "element-active" }],
  };

  return (
    <div style={{ height: 400 }}>
      {data.length ? (
        <Pie {...config} />
      ) : (
        <Text type="secondary">No skill data available</Text>
      )}
    </div>
  );
};

export default SkillDistribution;
