import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Descriptions,
  Typography,
  Spin,
  Button,
  Badge,
  Popconfirm,
  Flex,
  Space,
  Table,
  Tag,
  Input,
  message,
  Select,
  Progress,
} from "antd";
import {
  FileTextOutlined,
  TeamOutlined,
  ArrowLeftOutlined,
  FilterOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  LaptopOutlined,
  UserOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchInterviews,
  deleteInterview,
} from "../features/interview/interviewSlice";
import InterviewFormModal from "../components/Interviews/InterviewFormModal";
import { fetchCandidates } from "../features/candidate/candidateSlice";
import NotFoundPage from "../components/NotFoundPage";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const InterviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const interviews = useSelector((state) => state.interviews.data);
  const candidates = useSelector((state) => state.candidates.data);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!interviews?.length) await dispatch(fetchInterviews()).unwrap();
        if (!candidates?.length) await dispatch(fetchCandidates()).unwrap();
      } catch (error) {
        message.error("Failed to load interviews");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dispatch]);

  useEffect(() => {
    if (!interviews?.length || !id) return;
    const current = interviews.find((i) => String(i._id) === id);
    setSelectedInterview(current);
  }, [interviews, id]);

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteInterview(id)).unwrap();
      message.success("Interview deleted successfully!");
      navigate("/interviews");
    } catch (err) {
      message.error(err || "Failed to delete interview.");
    }
  };

  // Filter candidates by the interview they're scheduled for and search/filter criteria
  const associatedCandidates = useMemo(() => {
    return candidates
      .filter((candidate) =>
        candidate.interviews?.some(
          (interview) => interview.interviewId === selectedInterview?._id
        )
      )
      .filter((candidate) => {
        // Search filter
        const matchesSearch =
          searchText === "" ||
          candidate.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
          candidate.email.toLowerCase().includes(searchText.toLowerCase());

        // Status filter
        const interview = candidate.interviews?.find(
          (i) => i.interviewId === selectedInterview?._id
        );
        const matchesStatus =
          statusFilter === null ||
          statusFilter === undefined ||
          interview?.status === statusFilter;

        return matchesSearch && matchesStatus;
      });
  }, [candidates, selectedInterview, searchText, statusFilter]);

  const getInterviewStatusColor = (status) => {
    switch (status) {
      case "Scheduled":
        return "blue";
      case "In Progress":
        return "orange";
      case "Completed":
        return "green";
      case "Evaluated":
        return "purple";
      case "Rescheduled":
        return "cyan";
      case "Cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  const candidateColumns = [
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },

    {
      title: "Interview Status",
      dataIndex: "interviews",
      key: "interviewStatus",
      render: (interviews) => {
        const interview = interviews?.find(
          (i) => i.interviewId === selectedInterview?._id
        );
        return (
          <Tag color={getInterviewStatusColor(interview?.status)}>
            {interview?.status || "Not Scheduled"}
          </Tag>
        );
      },
      filters: [
        { text: "Scheduled", value: "Scheduled" },
        { text: "In Progress", value: "In Progress" },
        { text: "Completed", value: "Completed" },
        { text: "Evaluated", value: "Evaluated" },
        { text: "Rescheduled", value: "Rescheduled" },
        { text: "Cancelled", value: "Cancelled" },
      ],
      onFilter: (value, record) => {
        const interview = record.interviews?.find(
          (i) => i.interviewId === selectedInterview?._id
        );
        return interview?.status === value;
      },
    },
    {
      title: "Score",
      dataIndex: "interviews",
      key: "score",
      render: (interviews) => {
        const interview = interviews?.find(
          (a) => String(a.interviewId) === selectedInterview?._id
        );
        return interview?.score ? (
          <Progress
            percent={Math.round((interview.score / interview.maxScore) * 100)}
            size="small"
            format={() => `${interview.score}/${interview.maxScore}`}
          />
        ) : (
          "N/A"
        );
      },
    },
    {
      title: "Scheduled Date",
      dataIndex: "interviews",
      key: "scheduledDate",
      render: (interviews) => {
        const interview = interviews?.find(
          (i) => i.interviewId === selectedInterview?._id
        );
        return interview?.scheduledDatetime
          ? dayjs(interview.scheduledDatetime).format("MMM D, YYYY h:mm A")
          : "N/A";
      },
      sorter: (a, b) => {
        const interviewA = a.interviews?.find(
          (i) => i.interviewId === selectedInterview?._id
        );
        const interviewB = b.interviews?.find(
          (i) => i.interviewId === selectedInterview?._id
        );
        return (
          new Date(interviewA?.scheduledDatetime || 0) -
          new Date(interviewB?.scheduledDatetime || 0)
        );
      },
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
  ];

  if (loading) {
    return <Spin fullscreen />;
  }

  if (!selectedInterview) {
    return <NotFoundPage />;
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/interviews")}
        style={{ marginBottom: 16 }}
      >
        Interview List
      </Button>

      <Card
        title={
          <Flex justify="space-between">
            <Space>
              <FileTextOutlined />
              <Title level={3} style={{ margin: 0 }}>
                {selectedInterview.interviewName}
              </Title>
            </Space>
            <Space>
              <InterviewFormModal
                isEditing={true}
                initialValues={selectedInterview}
              />
              <Popconfirm
                title="Are you sure you want to delete this interview?"
                onConfirm={() => handleDelete(selectedInterview._id)}
                okText="Yes"
                cancelText="No"
                getPopupContainer={(trigger) => trigger.parentNode}
                placement="topRight"
              >
                <Button icon={<DeleteOutlined />} danger>
                  Delete
                </Button>
              </Popconfirm>
            </Space>
          </Flex>
        }
        variant="borderless"
        style={{ marginBottom: 24 }}
      >
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} layout="vertical">
          <Descriptions.Item label={<Text strong>Description</Text>}>
            {selectedInterview.description || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label={<Text strong>Duration</Text>}>
            <Space>
              <ClockCircleOutlined />
              {selectedInterview.duration} minutes
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label={<Text strong>Mode</Text>}>
            <Space>
              {selectedInterview.mode === "Online" ? (
                <LaptopOutlined />
              ) : (
                <UserOutlined />
              )}
              {selectedInterview.mode}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label={<Text strong>Instructions</Text>}>
            {selectedInterview.instructionForInterview || "N/A"}
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
              count={associatedCandidates.length}
              style={{ backgroundColor: "#1890ff" }}
            />
          </Space>
        }
        extra={
          <Space gap="16px">
            <Input
              placeholder="Search candidates"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              enterButton
              style={{ width: 250 }}
            />
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
              suffixIcon={<FilterOutlined />}
              style={{ width: 250 }}
            >
              <Select.Option value="Scheduled">Scheduled</Select.Option>
              <Select.Option value="In Progress">In Progress</Select.Option>
              <Select.Option value="Completed">Completed</Select.Option>
              <Select.Option value="Evaluated">Evaluated</Select.Option>
              <Select.Option value="Rescheduled">Rescheduled</Select.Option>
              <Select.Option value="Cancelled">Cancelled</Select.Option>
            </Select>
          </Space>
        }
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Table
            columns={candidateColumns}
            dataSource={associatedCandidates}
            rowKey={(record) => record._id}
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20"],
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} candidates`,
            }}
            scroll={{ x: true }}
            locale={{
              emptyText:
                searchText || statusFilter
                  ? "No candidates match your filters"
                  : "No candidates associated with this interview",
            }}
          />
        </Space>
      </Card>
    </div>
  );
};

export default InterviewDetail;
