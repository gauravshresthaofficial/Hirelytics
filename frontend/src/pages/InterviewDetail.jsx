import React, { useEffect, useState } from "react";
import {
  Card,
  Descriptions,
  Typography,
  Spin,
  Button,
  Badge,
  Popconfirm,
  Flex,
  Tabs,
  Space,
  Form,
  message,
  Table,
  Tag,
} from "antd";
import {
  FileTextOutlined,
  TeamOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  LaptopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchInterviews,
  deleteInterview,
  updateInterview,
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
      message.error("Failed to delete interview.");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "2rem",
          width: "100%",
          height: "100%",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!selectedInterview) {
    return <NotFoundPage />;
  }

  // Filter candidates by the interview they're scheduled for
  const associatedCandidates = candidates.filter((candidate) =>
    candidate.interviews?.some(
      (interview) => interview.interviewId === selectedInterview._id
    )
  );

  const candidateColumns = [
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Interview Status",
      dataIndex: "interviews",
      key: "interviewStatus",
      render: (interviews) => {
        const interview = interviews?.find(
          (i) => i.interviewId === selectedInterview._id
        );
        return (
          <Tag color={getInterviewStatusColor(interview?.status)}>
            {interview?.status || "Not Scheduled"}
          </Tag>
        );
      },
    },
    {
      title: "Scheduled Date",
      dataIndex: "interviews",
      key: "scheduledDate",
      render: (interviews) => {
        const interview = interviews?.find(
          (i) => i.interviewId === selectedInterview._id
        );
        return (
          dayjs(interview?.scheduledDatetime).format("MMM D, YYYY h:mm A") ||
          "N/A"
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
      >
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Candidates" key="1">
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
            />
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default InterviewDetail;
