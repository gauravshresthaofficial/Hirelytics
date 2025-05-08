import React from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Statistic,
  Divider,
  Space,
  Flex,
} from "antd";
import {
  TeamOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
  ScheduleOutlined,
} from "@ant-design/icons";
import { Pie, Bar, Line } from "@ant-design/charts";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const AssessmentStatistics = ({
  candidates,
  assessment,
  setActiveTab,
  setStatusFilter,
}) => {
  const calculateStats = () => {
    if (!candidates.length || !assessment) return null;

    const statusCount = {
      Completed: 0,
      Scheduled: 0,
      Evaluated: 0,
      Cancelled: 0,
    };

    const scoreData = [];
    const scheduledData = [];
    let totalScore = 0;
    let scoredCount = 0;
    let scheduledCount = 0;
    let evaluatedCount = 0;

    candidates.forEach((candidate) => {
      const candidateAssessment = candidate.assessments?.find(
        (a) => String(a.assessmentId) === String(assessment._id)
      );
      const status = candidateAssessment?.status;
      if (status) {
        statusCount[status] = (statusCount[status] || 0) + 1;
      }

      if (status === "Evaluated") {
        evaluatedCount++;
      }
      if (status === "Scheduled") {
        scheduledCount++;
      }

      if (candidateAssessment?.score !== undefined) {
        const scorePercent = Math.round(
          (candidateAssessment.score / assessment.maxScore) * 100
        );
        scoreData.push({
          candidate: candidate.fullName,
          score: candidateAssessment.score,
          scorePercent,
          status,
        });
        totalScore += candidateAssessment.score;
        scoredCount++;
      }

      if (candidateAssessment?.scheduledDate) {
        scheduledData.push({
          date: dayjs(candidateAssessment.scheduledDate).format("YYYY-MM-DD"),
          count: 1,
          candidate: candidate.fullName,
        });
      }
    });

    const scheduledByDate = scheduledData.reduce((acc, curr) => {
      if (!acc[curr.date]) {
        acc[curr.date] = { date: curr.date, count: 0 };
      }
      acc[curr.date].count += 1;
      return acc;
    }, {});

    const scheduledChartData = Object.values(scheduledByDate).sort(
      (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix()
    );

    const averageScore = scoredCount > 0 ? totalScore / scoredCount : 0;

    return {
      totalCandidates: candidates.length,
      scheduledCount,
      evaluatedCount,
      averageScore,
      maxScore: assessment.maxScore,
      statusData: Object.keys(statusCount).map((status) => ({
        status,
        count: statusCount[status],
        percent: (statusCount[status] / candidates.length) * 100,
      })),
      scoreData,
      scheduledChartData,
    };
  };

  const stats = calculateStats();

  const statusConfig = {
    data: stats?.statusData || [],
    angleField: "count",
    colorField: "status",
    radius: 0.8,
    label: {
      type: "inner",
      content: "{percentage}",
    },
    interactions: [{ type: "element-active" }],
    color: ["#52c41a", "#1890ff", "#722ed1", "#faad14"],
  };

  const scoreConfig = {
    data: stats?.scoreData || [],
    xField: "candidate",
    yField: "scorePercent",
    seriesField: "status",
    isPercent: true,
    max: 100,
    label: {
      position: "middle",
      content: (item) => `${item.scorePercent}%`,
      style: {
        fill: "#fff",
      },
    },
    color: ["#52c41a", "#722ed1"],
    legend: {
      position: "top",
    },
  };

  const scheduledConfig = {
    data: stats?.scheduledChartData || [],
    xField: "date",
    yField: "count",
    xAxis: {
      type: "time",
    },
    smooth: true,
    areaStyle: {
      fill: "#1890ff",
    },
    line: {
      color: "#1890ff",
      size: 2,
    },
    point: {
      size: 4,
      shape: "circle",
    },
  };

  const handleStatRedirect = (status) => {
    setActiveTab("1");
    setStatusFilter(status);
  };

  return (
    <div style={{ width: "100%" }}>
      <Title level={4}>Assessment Statistics</Title>
      {stats ? (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card
                onClick={() => handleStatRedirect(null)}
                style={{ cursor: "pointer" }}
              >
                <Statistic
                  title="Total Candidates"
                  value={stats.totalCandidates}
                  prefix={<TeamOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card
                onClick={() => handleStatRedirect("Scheduled")}
                style={{ cursor: "pointer" }}
              >
                <Statistic
                  title="Scheduled"
                  value={stats.scheduledCount}
                  prefix={<ScheduleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card
                onClick={() => handleStatRedirect("Evaluated")}
                style={{ cursor: "pointer" }}
              >
                <Statistic
                  title="Evaluated"
                  value={stats.evaluatedCount}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title="Average Score"
                  value={stats.averageScore.toFixed(1)}
                  suffix={`/ ${stats.maxScore}`}
                  prefix={<BarChartOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Divider />

          {stats.scoreData.length > 0 && (
            <Card
              title="Score Distribution"
              style={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <Bar {...scoreConfig} />
            </Card>
          )}
          <Divider />
          <Flex style={{ gap: 24 }}>
            <Card
              title="Status Distribution"
              style={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <Pie {...statusConfig} />
            </Card>
            {stats.scheduledChartData.length > 0 && (
              <Card
                title="Scheduled Assessments Over Time"
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <Line {...scheduledConfig} />
              </Card>
            )}
          </Flex>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "24px" }}>
          <Text type="secondary">
            No assessment data available to display statistics
          </Text>
        </div>
      )}
    </div>
  );
};

export default AssessmentStatistics;
