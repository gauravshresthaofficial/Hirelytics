import React from "react";
import { Row, Col, Statistic, Typography } from "antd";
import { Line } from "@ant-design/charts";
import {
  CheckCircleOutlined,
  StarOutlined,
  TeamOutlined,
  ScheduleOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const InterviewStats = ({ candidates }) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const interviews = candidates.flatMap((candidate) =>
    (candidate.interviews || [])
      .filter((interview) => {
        const date = new Date(interview.scheduledDatetime);
        return (
          date.getMonth() === currentMonth && date.getFullYear() === currentYear
        );
      })
      .map((interview) => ({
        ...interview,
        candidateName: candidate.fullName,
        date: interview.scheduledDatetime,
      }))
  );

  const totalInterviews = interviews.length;
  const completed = interviews.filter(
    (i) => i.status === "Completed" || i.status === "Evaluated"
  );
  const completedCount = completed.length;

  const interviewsByDate = interviews.reduce((acc, interview) => {
    const dateObj = new Date(interview.date);
    const dateOnly = dateObj.toISOString().split("T")[0]; // "YYYY-MM-DD"

    if (
      dateObj.getMonth() === currentMonth &&
      dateObj.getFullYear() === currentYear
    ) {
      acc[dateOnly] = (acc[dateOnly] || 0) + 1;
    }

    return acc;
  }, {});

  const chartData = Object.entries(interviewsByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const chartConfig = {
    data: chartData,
    xField: "date",
    yField: "count",
    smooth: true,
    point: {
      size: 5,
      shape: "circle",
      style: { fill: "#1890ff" },
    },
    tooltip: {
      formatter: (datum) => ({
        name: "Interviews",
        value: datum.count,
      }),
    },
    xAxis: {
      label: {
        rotate: -45,
        autoRotate: false,
      },
    },
    yAxis: {
      title: { text: "Interview Count" },
    },
    height: 300,
    // width: "100%",
  };

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8}>
          <Statistic
            title="Total Interviews"
            value={totalInterviews}
            prefix={<TeamOutlined />}
          />
        </Col>
        <Col xs={12} sm={8}>
          <Statistic
            title="Completed"
            value={completedCount}
            prefix={<CheckCircleOutlined />}
          />
        </Col>
        <Col xs={12} sm={8}>
          <Statistic
            title="Scheduled"
            value={totalInterviews - completedCount}
            prefix={<ScheduleOutlined />}
          />
        </Col>
      </Row>

      {totalInterviews > 0 ? (
        <Line {...chartConfig} />
      ) : (
        <Text type="secondary">
          No interview data to display for this month
        </Text>
      )}
    </div>
  );
};

export default InterviewStats;
