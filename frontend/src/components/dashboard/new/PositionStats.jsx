import React from "react";
import { Row, Col, Statistic, Typography, Card } from "antd";
import { Bar } from "@ant-design/charts";
import { UserOutlined, DollarOutlined } from "@ant-design/icons";

const { Text } = Typography;

const PositionStats = ({ candidates, positions }) => {
  const calculatePositionCounts = () => {
    return candidates.reduce((acc, candidate) => {
      const position = candidate.appliedPosition || "Unknown";
      acc[position] = (acc[position] || 0) + 1;
      return acc;
    }, {});
  };

  const positionCounts = calculatePositionCounts();

  const positionData = Object.entries(positionCounts).map(
    ([position, count]) => ({
      position,
      count,
    })
  );

  const calculateOfferAcceptanceRates = () => {
    return positions.map((position) => {
      const positionCandidates = candidates.filter(
        (c) => c.appliedPosition === position.positionName
      );
      const totalOffers = positionCandidates.filter((c) => c.offer).length;
      const acceptedOffers = positionCandidates.filter(
        (c) => c.offer?.offerStatus === "Accepted"
      ).length;

      return {
        position: position.positionName,
        offers: totalOffers,
        accepted: acceptedOffers,
        acceptanceRate:
          totalOffers > 0
            ? ((acceptedOffers / totalOffers) * 100).toFixed(1)
            : 0,
      };
    });
  };

  const offerAcceptanceData = calculateOfferAcceptanceRates();

  const positionChartConfig = {
    data: positionData,
    xField: "position",
    yField: "count",
    seriesField: "position",
    legend: false,
    xAxis: {
      label: {
        autoHide: false,
        autoRotate: true,
        style: {
          angle: -45,
          textAlign: "end",
        },
      },
    },
  };

  const offerChartConfig = {
    data: offerAcceptanceData,
    xField: "position",
    yField: "acceptanceRate",
    seriesField: "position",
    legend: false,
    xAxis: {
      label: {
        autoHide: false,
        autoRotate: true,
        style: {
          angle: -45,
          textAlign: "end",
        },
      },
    },
    yAxis: {
      title: {
        text: "Acceptance Rate (%)",
      },
    },
  };

  const calculateAverageSalary = () => {
    const totalSalary = positions.reduce((sum, p) => {
      const avgSalary = (p.salaryRange?.min + p.salaryRange?.max) / 2;
      return sum + avgSalary;
    }, 0);
    return totalSalary / positions.length || 0;
  };

  const averageSalary = calculateAverageSalary();

  return (
    <Card title="Positions Statistics">
      {/* Statistics Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8}>
          <Statistic
            title="Total Positions"
            value={positions.length}
            prefix={<UserOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Statistic
            title="Active Candidates"
            value={candidates.length}
            prefix={<UserOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Statistic
            title="Avg Salary"
            value={averageSalary}
            prefix={<DollarOutlined />}
            precision={0}
          />
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Text strong>Candidate Distribution by Position</Text>
          <div style={{ height: 300, marginTop: 16 }}>
            {positionData.length > 0 ? (
              <Bar {...positionChartConfig} />
            ) : (
              <Text type="secondary">No position data available</Text>
            )}
          </div>
        </Col>
        <Col xs={24} md={12}>
          <Text strong>Offer Acceptance Rate by Position</Text>
          <div style={{ height: 300, marginTop: 16 }}>
            {offerAcceptanceData.length > 0 ? (
              <Bar {...offerChartConfig} />
            ) : (
              <Text type="secondary">No offer data available</Text>
            )}
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default PositionStats;
