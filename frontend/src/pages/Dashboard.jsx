import { useEffect, useState, useMemo, lazy, Suspense } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCandidates } from "../features/candidate/candidateSlice";
import { fetchPositions } from "../features/position/positionSlice";
import { getCandidatesByStageCount } from "../api/report/reportServices";
import {
  Card,
  Statistic,
  Grid,
  Flex,
  Spin,
  Tooltip,
  Skeleton,
  Space,
} from "antd";
import {
  TeamOutlined,
  GiftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const CandidateSources = lazy(() =>
  import("../components/dashboard/new/CandidatesSource")
);
const SkillDistribution = lazy(() =>
  import("../components/dashboard/new/SkillDistribution")
);
const InterviewStats = lazy(() =>
  import("../components/dashboard/new/InterviewStats")
);
const AssessmentOverview = lazy(() =>
  import("../components/dashboard/AssessmentOverview")
);
const PositionStats = lazy(() =>
  import("../components/dashboard/new/PositionStats")
);
const CalendaComponent = lazy(() =>
  import("../components/Interviews/CalendaComponent")
);

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
      <Suspense
        fallback={
          <Skeleton.Node active style={{ width: "100%", height: "400px" }} />
        }
      >
        <CalendaComponent />
      </Suspense>

      <Flex
        gap="middle"
        style={{ flexDirection: screens.md ? "row" : "column", width: "100%" }}
      >
        <Suspense
          fallback={
            <Skeleton
              paragraph={{ rows: 8 }}
              active
              style={{ width: "50%", height: "400px" }}
            />
          }
        >
          <Card title="Sources" style={{ flex: 1 }}>
            <CandidateSources candidates={candidates} />
          </Card>
        </Suspense>

        <Suspense
          fallback={
            <Skeleton
              active
              paragraph={{ rows: 8 }}
              style={{ width: "50%", height: "400px" }}
            />
          }
        >
          <Card title="Skill Distribution" style={{ flex: 1 }}>
            <SkillDistribution candidates={candidates} />
          </Card>
        </Suspense>
      </Flex>

      {/* Position Stats */}
      <Suspense
        fallback={
          <Skeleton.Node active style={{ width: "100%", height: "400px" }} />
        }
      >
        <PositionStats candidates={candidates} positions={positions} />
      </Suspense>

      {/* Interview Stats + Assessment Overview */}
      <Flex
        gap="middle"
        style={{ flexDirection: screens.md ? "row" : "column" }}
      >
        <Suspense fallback={<Spin tip="Loading Interview Stats..." />}>
          <Card title="Interview Stats" style={{ flex: 1 }}>
            <InterviewStats candidates={candidates} />
          </Card>
        </Suspense>
        <Tooltip title="Go to assessment page" placement="top">
          <Suspense fallback={<Spin tip="Loading Assessment Overview..." />}>
            <Card
              title="Assessment Overview"
              style={{ flex: 1, cursor: "pointer" }}
              onClick={() => navigate("/assessments")}
            >
              <AssessmentOverview candidates={candidates} />
            </Card>
          </Suspense>
        </Tooltip>
      </Flex>
    </Flex>
  );
};

export default Dashboard;
