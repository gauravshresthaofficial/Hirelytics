import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  Descriptions,
  Typography,
  Spin,
  Button,
  Badge,
  Flex,
  Tabs,
  Space,
  Table,
  Tag,
  Input,
  Select,
  message,
  Progress,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  ArrowLeftOutlined,
  MailOutlined,
  FileTextOutlined,
  CalendarOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import EvaluatorFormModal from "../components/evaluators/EvaluatorModalForm";
import { fetchCandidates } from "../features/candidate/candidateSlice";
import { fetchUsers } from "../features/user/userSlice";
import NotFoundPage from "../components/NotFoundPage";

const { Title, Text } = Typography;

// Constants
const STATUS_OPTIONS = [
  "Scheduled",
  "In Progress",
  "Completed",
  "Evaluated",
  "Rejected",
  "Hired",
];

const STATUS_COLORS = {
  "Assessment Scheduled": "blue",
  "Interview Scheduled": "blue",
  Scheduled: "blue",
  "Assessment In Progress": "orange",
  "Interview In Progress": "orange",
  "In Progress": "orange",
  "Assessment Completed": "green",
  "Interview Completed": "green",
  Completed: "green",
  "Assessment Evaluated": "purple",
  "Interview Evaluated": "purple",
  Evaluated: "purple",
  "Offer Extended": "magenta",
  "Offer Accepted": "green",
  Hired: "success",
  Cancelled: "red",
  Rejected: "red",
  Withdrawn: "gray",
  default: "orange",
};

const EvaluatorDetail = () => {
  // Hooks and State
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const users = useSelector((state) => state.users.data);
  const candidates = useSelector((state) => state.candidates.data);
  const [selectedEvaluator, setSelectedEvaluator] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search and filter states
  const [searchFilters, setSearchFilters] = useState({
    candidate: "",
    assessment: "",
    interview: "",
  });
  const [statusFilters, setStatusFilters] = useState({
    candidate: null,
    assessment: null,
    interview: null,
  });

  // Data Loading
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!users?.length) await dispatch(fetchUsers()).unwrap();
        if (!candidates?.length) await dispatch(fetchCandidates()).unwrap();
      } catch (error) {
        message.error("Failed to load evaluators");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dispatch]);

  useEffect(() => {
    if (!users?.length || !id) return;
    const current = users.find(
      (u) => String(u._id) === id && u.role === "evaluator"
    );
    setSelectedEvaluator(current);
  }, [users, id]);

  // Data Processing
  const getAssociatedCandidates = useCallback(() => {
    if (!selectedEvaluator || !candidates?.length) return [];

    return candidates.filter((candidate) => {
      const hasAssessments = candidate.assessments?.some(
        (assessment) =>
          assessment.assignedEvaluatorId?.$oid === selectedEvaluator._id ||
          assessment.assignedEvaluatorId === selectedEvaluator._id
      );

      const hasInterviews = candidate.interviews?.some(
        (interview) =>
          interview.assignedEvaluatorId?.$oid === selectedEvaluator._id ||
          interview.assignedEvaluatorId === selectedEvaluator._id
      );

      return hasAssessments || hasInterviews;
    });
  }, [selectedEvaluator, candidates]);

  const getAssessmentsForEvaluator = useCallback(
    (candidate) => {
      return (
        candidate.assessments?.filter(
          (assessment) =>
            assessment.assignedEvaluatorId?.$oid === selectedEvaluator._id ||
            assessment.assignedEvaluatorId === selectedEvaluator._id
        ) || []
      );
    },
    [selectedEvaluator]
  );

  const getInterviewsForEvaluator = useCallback(
    (candidate) => {
      return (
        candidate.interviews?.filter(
          (interview) =>
            interview.assignedEvaluatorId?.$oid === selectedEvaluator._id ||
            interview.assignedEvaluatorId === selectedEvaluator._id
        ) || []
      );
    },
    [selectedEvaluator]
  );

  // Filtered Data
  const filteredCandidates = useMemo(() => {
    return getAssociatedCandidates().filter((candidate) => {
      const matchesSearch =
        candidate.fullName
          .toLowerCase()
          .includes(searchFilters.candidate.toLowerCase()) ||
        candidate.appliedPosition
          .toLowerCase()
          .includes(searchFilters.candidate.toLowerCase());

      const matchesStatus =
        !statusFilters.candidate ||
        candidate.currentStatus === statusFilters.candidate;

      return matchesSearch && matchesStatus;
    });
  }, [
    getAssociatedCandidates,
    searchFilters.candidate,
    statusFilters.candidate,
  ]);

  const filteredAssessments = useMemo(() => {
    return getAssociatedCandidates().flatMap((candidate) =>
      getAssessmentsForEvaluator(candidate)
        .map((assessment) => ({ ...assessment, candidate }))
        .filter((assessment) => {
          const matchesSearch =
            assessment.assessmentName
              .toLowerCase()
              .includes(searchFilters.assessment.toLowerCase()) ||
            assessment.candidate.fullName
              .toLowerCase()
              .includes(searchFilters.assessment.toLowerCase());

          const matchesStatus =
            !statusFilters.assessment ||
            assessment.status === statusFilters.assessment;

          return matchesSearch && matchesStatus;
        })
    );
  }, [
    getAssociatedCandidates,
    getAssessmentsForEvaluator,
    searchFilters.assessment,
    statusFilters.assessment,
  ]);

  const filteredInterviews = useMemo(() => {
    return getAssociatedCandidates().flatMap((candidate) =>
      getInterviewsForEvaluator(candidate)
        .map((interview) => ({ ...interview, candidate }))
        .filter((interview) => {
          const matchesSearch =
            interview.interviewName
              .toLowerCase()
              .includes(searchFilters.interview.toLowerCase()) ||
            interview.candidate.fullName
              .toLowerCase()
              .includes(searchFilters.interview.toLowerCase());

          const matchesStatus =
            !statusFilters.interview ||
            interview.status === statusFilters.interview;

          return matchesSearch && matchesStatus;
        })
    );
  }, [
    getAssociatedCandidates,
    getInterviewsForEvaluator,
    searchFilters.interview,
    statusFilters.interview,
  ]);

  // Handlers
  const handleSearchChange = (type, value) => {
    setSearchFilters((prev) => ({ ...prev, [type]: value }));
  };

  const handleStatusFilterChange = (type, value) => {
    setStatusFilters((prev) => ({ ...prev, [type]: value }));
  };

  const getStatusTagColor = (status) => {
    return STATUS_COLORS[status] || STATUS_COLORS.default;
  };

  // Table Columns
  const candidateColumns = useMemo(
    () => [
      {
        title: "Candidate",
        dataIndex: "fullName",
        key: "fullName",
        render: (text) => <Text>{text}</Text>,
        sorter: (a, b) => a.fullName.localeCompare(b.fullName),
      },
      {
        title: "Position Applied",
        dataIndex: "appliedPosition",
        key: "appliedPosition",
        sorter: (a, b) => a.appliedPosition.localeCompare(b.appliedPosition),
        filters: [
          { text: "Frontend Developer", value: "Frontend Developer" },
          { text: "Backend Developer", value: "Backend Developer" },
          { text: "UI/UX Designer", value: "UI/UX Designer" },
          // Add more positions as needed
        ],
        onFilter: (value, record) => record.appliedPosition === value,
      },
      {
        title: "Status",
        dataIndex: "currentStatus",
        key: "currentStatus",
        render: (status) => (
          <Tag color={getStatusTagColor(status)}>{status || "Not Started"}</Tag>
        ),
        filters: [
          { text: "Not Started", value: "Not Started" },
          { text: "In Progress", value: "In Progress" },
          { text: "Completed", value: "Completed" },
          { text: "Rejected", value: "Rejected" },
          { text: "Hired", value: "Hired" },
        ],
        onFilter: (value, record) =>
          (record.currentStatus || "Not Started") === value,
        sorter: (a, b) =>
          (a.currentStatus || "").localeCompare(b.currentStatus || ""),
      },
      {
        title: "Actions",
        key: "actions",
        render: (_, record) => (
          <Button
            type="link"
            onClick={() => navigate(`/candidates/${record._id}`)}
          >
            View Profile
          </Button>
        ),
      },
    ],
    [navigate]
  );

  const assessmentColumns = useMemo(
    () => [
      {
        title: "Assessment",
        dataIndex: "assessmentName",
        key: "assessmentName",
        sorter: (a, b) => a.assessmentName.localeCompare(b.assessmentName),
      },
      {
        title: "Candidate",
        key: "candidate",
        render: (_, { candidate }) => <Text>{candidate?.fullName}</Text>,
        sorter: (a, b) =>
          (a.candidate?.fullName || "").localeCompare(
            b.candidate?.fullName || ""
          ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status) => (
          <Tag color={getStatusTagColor(status)}>{status}</Tag>
        ),
        filters: [
          { text: "Completed", value: "Completed" },
          { text: "Pending", value: "Pending" },
          { text: "In Progress", value: "In Progress" },
        ],
        onFilter: (value, record) => record.status === value,
      },
      {
        title: "Score",
        key: "score",
        render: ({ score = 0, maxScore = 100 }) => {
          const percentage = Math.round((score / maxScore) * 100);
          return (
            <Progress
              percent={percentage}
              format={() => `${score}/${maxScore}`}
              size="small"
            />
          );
        },
        sorter: (a, b) => (a.score || 0) - (b.score || 0),
      },
      {
        title: "Date",
        dataIndex: "evaluationDate",
        key: "date",
        render: (date) => (
          <Text>
            {date ? new Date(date).toLocaleDateString() : "Not evaluated"}
          </Text>
        ),
        sorter: (a, b) =>
          new Date(a.evaluationDate || 0) - new Date(b.evaluationDate || 0),
      },
    ],
    []
  );

  const interviewColumns = useMemo(
    () => [
      {
        title: "Interview",
        dataIndex: "interviewName",
        key: "interviewName",
        sorter: (a, b) => a.interviewName.localeCompare(b.interviewName),
      },
      {
        title: "Candidate",
        key: "candidate",
        render: (_, { candidate }) => <Text>{candidate?.fullName}</Text>,
        sorter: (a, b) =>
          (a.candidate?.fullName || "").localeCompare(
            b.candidate?.fullName || ""
          ),
      },
      {
        title: "Type",
        dataIndex: "interviewType",
        key: "type",
        filters: [
          { text: "Online", value: "Online" },
          { text: "Onsite", value: "Onsite" },
        ],
        onFilter: (value, record) => record.interviewType === value,
        sorter: (a, b) => a.interviewType.localeCompare(b.interviewType),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status) => (
          <Tag color={getStatusTagColor(status)}>{status}</Tag>
        ),
        filters: [
          { text: "Scheduled", value: "Scheduled" },
          { text: "Completed", value: "Completed" },
          { text: "Cancelled", value: "Cancelled" },
        ],
        onFilter: (value, record) => record.status === value,
      },
      {
        title: "Score",
        key: "score",
        render: ({ score = 0, maxScore = 100 }) => {
          const percentage = Math.round((score / maxScore) * 100);
          return (
            <Progress
              percent={percentage}
              format={() => `${score}/${maxScore}`}
              size="small"
            />
          );
        },
        sorter: (a, b) => (a.score || 0) - (b.score || 0),
      },
      {
        title: "Date",
        dataIndex: "conductedDate",
        key: "date",
        render: (date) => (
          <Text>
            {date ? new Date(date).toLocaleDateString() : "Not conducted"}
          </Text>
        ),
        sorter: (a, b) =>
          new Date(a.conductedDate || 0) - new Date(b.conductedDate || 0),
      },
    ],
    []
  );

  // Tab Items
  const tabItems = useMemo(
    () => [
      {
        key: "1",
        label: (
          <Space>
            <UserOutlined />
            Candidates
          </Space>
        ),
        children: (
          <>
            <Flex gap={16} style={{ margin: "16px 0" }}>
              <Input
                placeholder="Search candidates"
                prefix={<SearchOutlined />}
                value={searchFilters.candidate}
                onChange={(e) =>
                  handleSearchChange("candidate", e.target.value)
                }
                style={{ width: 300 }}
                allowClear
              />
              <Select
                placeholder="Filter by status"
                value={statusFilters.candidate}
                onChange={(value) =>
                  handleStatusFilterChange("candidate", value)
                }
                suffixIcon={<FilterOutlined />}
                style={{ width: 250 }}
                allowClear
              >
                {STATUS_OPTIONS.map((status) => (
                  <Select.Option key={status} value={status}>
                    {status}
                  </Select.Option>
                ))}
              </Select>
            </Flex>
            <Table
              columns={candidateColumns}
              dataSource={filteredCandidates}
              rowKey="_id"
              pagination={{
                defaultPageSize: 5,
                showSizeChanger: true,
                pageSizeOptions: ["5", "10", "20"],
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} candidates`,
              }}
              scroll={{ x: true }}
            />
          </>
        ),
      },
      {
        key: "2",
        label: (
          <Space>
            <FileTextOutlined />
            Assessments
          </Space>
        ),
        children: (
          <>
            <Flex gap={16} style={{ margin: "16px 0" }}>
              <Input
                placeholder="Search assessments"
                prefix={<SearchOutlined />}
                value={searchFilters.assessment}
                onChange={(e) =>
                  handleSearchChange("assessment", e.target.value)
                }
                style={{ width: 300 }}
                allowClear
              />
              <Select
                placeholder="Filter by status"
                value={statusFilters.assessment}
                onChange={(value) =>
                  handleStatusFilterChange("assessment", value)
                }
                suffixIcon={<FilterOutlined />}
                style={{ width: 250 }}
                allowClear
              >
                {STATUS_OPTIONS.map((status) => (
                  <Select.Option key={status} value={status}>
                    {status}
                  </Select.Option>
                ))}
              </Select>
            </Flex>
            <Table
              columns={assessmentColumns}
              dataSource={filteredAssessments}
              rowKey={(record) => record._id?.$oid || record._id}
              pagination={{
                defaultPageSize: 5,
                showSizeChanger: true,
                pageSizeOptions: ["5", "10", "20"],
              }}
              scroll={{ x: true }}
            />
          </>
        ),
      },
      {
        key: "3",
        label: (
          <Space>
            <CalendarOutlined />
            Interviews
          </Space>
        ),
        children: (
          <>
            <Flex gap={16} style={{ margin: "16px 0" }}>
              <Input
                placeholder="Search interviews"
                prefix={<SearchOutlined />}
                value={searchFilters.interview}
                onChange={(e) =>
                  handleSearchChange("interview", e.target.value)
                }
                style={{ width: 300 }}
                allowClear
              />
              <Select
                placeholder="Filter by status"
                value={statusFilters.interview}
                onChange={(value) =>
                  handleStatusFilterChange("interview", value)
                }
                suffixIcon={<FilterOutlined />}
                style={{ width: 250 }}
                allowClear
              >
                {STATUS_OPTIONS.map((status) => (
                  <Select.Option key={status} value={status}>
                    {status}
                  </Select.Option>
                ))}
              </Select>
            </Flex>
            <Table
              columns={interviewColumns}
              dataSource={filteredInterviews}
              rowKey={(record) => record._id?.$oid || record._id}
              pagination={{
                defaultPageSize: 5,
                showSizeChanger: true,
                pageSizeOptions: ["5", "10", "20"],
              }}
              scroll={{ x: true }}
            />
          </>
        ),
      },
    ],
    [
      searchFilters,
      statusFilters,
      candidateColumns,
      assessmentColumns,
      interviewColumns,
      filteredCandidates,
      filteredAssessments,
      filteredInterviews,
    ]
  );

  if (loading) {
    return <Spin fullscreen />;
  }

  if (!selectedEvaluator) {
    return <NotFoundPage />;
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/evaluators")}
        style={{ marginBottom: 16 }}
      >
        Evaluator List
      </Button>

      <Card
        title={
          <Flex justify="space-between">
            <Space>
              <UserOutlined />
              <Title level={3} style={{ margin: 0 }}>
                {selectedEvaluator.fullName}
              </Title>
            </Space>
            <Space>
              <EvaluatorFormModal
                isEditing={true}
                initialValues={selectedEvaluator}
              >
                Edit
              </EvaluatorFormModal>
            </Space>
          </Flex>
        }
        style={{ marginBottom: 24 }}
      >
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} layout="vertical">
          <Descriptions.Item label={<Text strong>Email</Text>}>
            <Space>
              <MailOutlined />
              {selectedEvaluator.email}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label={<Text strong>Role</Text>}>
            <Tag color="blue">
              {selectedEvaluator.role.charAt(0).toUpperCase() +
                selectedEvaluator.role.slice(1)}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        title={
          <Space>
            <TeamOutlined />
            <Title level={4} style={{ margin: 0 }}>
              Associated Candidates
            </Title>
            <Badge
              count={getAssociatedCandidates().length}
              style={{ backgroundColor: "#1890ff" }}
            />
          </Space>
        }
        style={{ overflow: "hidden" }}
      >
        <Tabs
          defaultActiveKey="1"
          tabBarStyle={{ marginBottom: 0 }}
          items={tabItems}
        />
      </Card>
    </div>
  );
};

export default EvaluatorDetail;
