import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCandidates } from "../features/candidate/candidateSlice";
import { fetchPositions } from "../features/position/positionSlice";
import { getCandidatesByStageCount } from "../api/report/reportServices";
import { Card, Statistic, Grid, Flex, Spin, Tooltip } from "antd";
import {
  TeamOutlined,
  GiftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import CandidateSources from "../components/dashboard/new/CandidatesSource";
import SkillDistribution from "../components/dashboard/new/SkillDistribution";
import InterviewStats from "../components/dashboard/new/InterviewStats";
import AssessmentOverview from "../components/dashboard/AssessmentOverview";
import PositionStats from "../components/dashboard/new/PositionStats";
import CalendaComponent from "../components/Interviews/CalendaComponent";

const { useBreakpoint } = Grid;

const STAT_CONFIGS = [
  {
    key: "total",
    title: "Total Candidates",
    icon: TeamOutlined,
    color: "#1890ff",
  },
  {
    key: "offers",
    title: "Offers Extended",
    icon: GiftOutlined,
    color: "#722ed1",
  },
  { key: "hired", title: "Hired", icon: CheckCircleOutlined, color: "#52c41a" },
  {
    key: "rejected",
    title: "Rejected",
    icon: CloseCircleOutlined,
    color: "#f5222d",
  },
];

const Dashboard = () => {
  const screens = useBreakpoint();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const candidates = useSelector((state) => state.candidates.data);
  const positions = useSelector((state) => state.positions.data);
  const [statusCounts, setStatusCounts] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!candidates?.length) dispatch(fetchCandidates());
        if (!positions?.length) dispatch(fetchPositions());
        const { data } = await getCandidatesByStageCount();
        setStatusCounts(data);
      } catch (error) {
        console.error("Dashboard data fetch failed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [dispatch, candidates?.length, positions?.length]);

  const totalCandidates = useMemo(() => {
    return statusCounts
      ? Object.values(statusCounts).reduce((sum, c) => sum + c, 0)
      : 0;
  }, [statusCounts]);

  const getStatValue = (key) => {
    const map = {
      total: totalCandidates,
      offers: statusCounts?.["Offer Extended"] || 0,
      hired: statusCounts?.["Hired"] || 0,
      rejected: statusCounts?.["Rejected"] || 0,
    };
    return map[key] || 0;
  };

  const handleStatClick = (status) => {
    navigate("/candidates", {
      state: { status: status === "Total Candidates" ? "" : status },
    });
  };

  if (isLoading) return <Spin tip="Loading dashboard data" fullscreen />;

  return (
    <Flex
      vertical
      gap="middle"
      style={{ width: "100%", minHeight: "80vh", paddingBottom: 24 }}
    >
      {/* Stat Cards */}
      <Flex
        wrap="wrap"
        gap="middle"
        style={{ justifyContent: screens.xs ? "center" : "flex-start" }}
      >
        {STAT_CONFIGS.map(({ key, title, icon: Icon, color }) => (
          <Card
            key={key}
            onClick={() => handleStatClick(title)}
            style={{ flex: "1 1 200px", minWidth: 200, cursor: "pointer" }}
          >
            <Statistic
              title={title}
              value={getStatValue(key)}
              prefix={<Icon style={{ color }} />}
              valueStyle={{ color }}
            />
          </Card>
        ))}
      </Flex>

      {/* Calendar */}
      <CalendaComponent />

      {/* Candidate Sources + Skills */}
      <Flex
        gap="middle"
        style={{ flexDirection: screens.md ? "row" : "column" }}
      >
        <Card title="Sources" style={{ flex: 1 }}>
          <CandidateSources candidates={candidates} />
        </Card>
        <Card title="Skill Distribution" style={{ flex: 1 }}>
          <SkillDistribution candidates={candidates} />
        </Card>
      </Flex>

      {/* Position Stats */}
      <PositionStats candidates={candidates} positions={positions} />

      {/* Interview Stats + Assessment Overview */}
      <Flex
        gap="middle"
        style={{ flexDirection: screens.md ? "row" : "column" }}
      >
        <Card title="Interview Stats" style={{ flex: 1 }}>
          <InterviewStats candidates={candidates} />
        </Card>
        <Tooltip title="Go to assessment page" placement="top">
          <Card
            title="Assessment Overview"
            style={{ flex: 1, cursor: "pointer" }}
            onClick={() => navigate("/assessments")}
          >
            <AssessmentOverview candidates={candidates} />
          </Card>
        </Tooltip>
      </Flex>
    </Flex>
  );
};

export default Dashboard;
