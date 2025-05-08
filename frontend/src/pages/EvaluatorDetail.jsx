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
  Table,
  Tag,
  Avatar,
  Form,
  Input,
  Select,
  message,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  CalendarOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import EvaluatorFormModal from "../components/evaluators/EvaluatorModalForm";
import { fetchCandidates } from "../features/candidate/candidateSlice";
import { fetchUsers, updateUser } from "../features/user/userSlice";

const { Title, Text } = Typography;

const EvaluatorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const users = useSelector((state) => state.users.data);
  const candidates = useSelector((state) => state.candidates.data);
  const [selectedEvaluator, setSelectedEvaluator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEvaluator, setEditingEvaluator] = useState(null);
  const [form] = Form.useForm();

  // Search and filter states
  const [candidateSearch, setCandidateSearch] = useState("");
  const [candidateStatusFilter, setCandidateStatusFilter] = useState(null);
  const [assessmentSearch, setAssessmentSearch] = useState("");
  const [assessmentStatusFilter, setAssessmentStatusFilter] = useState(null);
  const [interviewSearch, setInterviewSearch] = useState("");
  const [interviewStatusFilter, setInterviewStatusFilter] = useState(null);

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

  const handleEdit = (record) => {
    setIsEditing(true);
    setEditingEvaluator(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      //   await dispatch(deleteUs(id)).unwrap();
      message.success("Evaluator deleted successfully!");
      navigate("/evaluators");
    } catch (err) {
      message.error("Failed to delete evaluator.");
    }
  };

  const handleUpdate = async (values) => {
    try {
      await dispatch(
        updateUser({ id: editingEvaluator._id, updatedData: values })
      ).unwrap();
      message.success("Evaluator updated successfully!");
      setIsModalOpen(false);
      setIsEditing(false);
      setEditingEvaluator(null);
      form.resetFields();
    } catch (err) {
      message.error("Failed to update evaluator.");
    }
  };

  // Get candidates assigned to this evaluator for assessments or interviews
  const getAssociatedCandidates = () => {
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
  };

  // Filter candidates based on search and status
  const getFilteredCandidates = () => {
    return getAssociatedCandidates().filter((candidate) => {
      const matchesSearch =
        candidate.fullName
          .toLowerCase()
          .includes(candidateSearch.toLowerCase()) ||
        candidate.appliedPosition
          .toLowerCase()
          .includes(candidateSearch.toLowerCase());

      const matchesStatus =
        !candidateStatusFilter ||
        candidate.currentStatus === candidateStatusFilter;

      return matchesSearch && matchesStatus;
    });
  };

  // Get assessments with search and status filters
  const getFilteredAssessments = () => {
    return getAssociatedCandidates().flatMap((candidate) =>
      getAssessmentsForEvaluator(candidate)
        .map((assessment) => ({ ...assessment, candidate }))
        .filter((assessment) => {
          const matchesSearch =
            assessment.assessmentName
              .toLowerCase()
              .includes(assessmentSearch.toLowerCase()) ||
            assessment.candidate.fullName
              .toLowerCase()
              .includes(assessmentSearch.toLowerCase());

          const matchesStatus =
            !assessmentStatusFilter ||
            assessment.status === assessmentStatusFilter;

          return matchesSearch && matchesStatus;
        })
    );
  };

  // Get interviews with search and status filters
  const getFilteredInterviews = () => {
    return getAssociatedCandidates().flatMap((candidate) =>
      getInterviewsForEvaluator(candidate)
        .map((interview) => ({ ...interview, candidate }))
        .filter((interview) => {
          const matchesSearch =
            interview.interviewName
              .toLowerCase()
              .includes(interviewSearch.toLowerCase()) ||
            interview.candidate.fullName
              .toLowerCase()
              .includes(interviewSearch.toLowerCase());

          const matchesStatus =
            !interviewStatusFilter ||
            interview.status === interviewStatusFilter;

          return matchesSearch && matchesStatus;
        })
    );
  };

  const getAssessmentsForEvaluator = (candidate) => {
    return (
      candidate.assessments?.filter(
        (assessment) =>
          assessment.assignedEvaluatorId?.$oid === selectedEvaluator._id ||
          assessment.assignedEvaluatorId === selectedEvaluator._id
      ) || []
    );
  };

  const getInterviewsForEvaluator = (candidate) => {
    return (
      candidate.interviews?.filter(
        (interview) =>
          interview.assignedEvaluatorId?.$oid === selectedEvaluator._id ||
          interview.assignedEvaluatorId === selectedEvaluator._id
      ) || []
    );
  };

  const candidateColumns = [
    {
      title: "Candidate",
      dataIndex: "fullName",
      key: "fullName",
      render: (text, record) => (
        <Space>
          <Avatar src={record.picture} icon={<UserOutlined />} />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Position Applied",
      dataIndex: "appliedPosition",
      key: "appliedPosition",
    },
    {
      title: "Status",
      dataIndex: "currentStatus",
      key: "currentStatus",
      render: (status) => (
        <Tag color={getStatusTagColor(status)}>{status || "Not Started"}</Tag>
      ),
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

  const assessmentColumns = [
    {
      title: "Assessment",
      dataIndex: "assessmentName",
      key: "assessmentName",
    },
    {
      title: "Candidate",
      key: "candidate",
      render: (_, assessment) => <Text>{assessment?.candidate?.fullName}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={getStatusTagColor(status)}>{status}</Tag>,
    },
    {
      title: "Score",
      key: "score",
      render: (assessment) => (
        <Text>
          {assessment.score || 0}/{assessment.maxScore || 100}
        </Text>
      ),
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
    },
  ];

  const interviewColumns = [
    {
      title: "Interview",
      dataIndex: "interviewName",
      key: "interviewName",
    },
    {
      title: "Candidate",
      key: "candidate",
      render: (_, interview) => <Text>{interview?.candidate?.fullName}</Text>,
    },
    {
      title: "Type",
      dataIndex: "interviewType",
      key: "type",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={getStatusTagColor(status)}>{status}</Tag>,
    },
    {
      title: "Score",
      key: "score",
      render: (interview) => (
        <Text>
          {interview.score || 0}/{interview.maxScore || 100}
        </Text>
      ),
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
    },
  ];

  const statusOptions = [
    "Scheduled",
    "In Progress",
    "Completed",
    "Evaluated",
    "Rejected",
    "Hired",
  ];

  const getStatusTagColor = (status) => {
    switch (status) {
      case "Assessment Scheduled":
      case "Interview Scheduled":
      case "Scheduled":
        return "blue";
      case "Assessment In Progress":
      case "Interview In Progress":
      case "In Progress":
        return "orange";
      case "Assessment Completed":
      case "Interview Completed":
      case "Completed":
        return "green";
      case "Assessment Evaluated":
      case "Interview Evaluated":
      case "Evaluated":
        return "purple";
      case "Offer Extended":
        return "magenta";
      case "Offer Accepted":
        return "green";
      case "Hired":
        return "success";
      case "Cancelled":
      case "Rejected":
        return "red";
      case "Withdrawn":
        return "gray";
      default:
        return "orange";
    }
  };

  if (loading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "2rem" }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!selectedEvaluator) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <Title level={4}>Evaluator not found</Title>
        <Button type="primary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
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
              <Popconfirm
                title="Are you sure you want to delete this evaluator?"
                onConfirm={() => handleDelete(selectedEvaluator._id)}
                okText="Yes"
                cancelText="No"
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
          <Descriptions.Item label={<Text strong>Email</Text>}>
            {selectedEvaluator.email}
          </Descriptions.Item>
          <Descriptions.Item label={<Text strong>Role</Text>}>
            <Tag color="blue">{selectedEvaluator.role}</Tag>
          </Descriptions.Item>
          {selectedEvaluator.googleId && (
            <Descriptions.Item label={<Text strong>Google ID</Text>}>
              {selectedEvaluator.googleId}
            </Descriptions.Item>
          )}
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
        style={{ overflowY: "auto" }}
      >
        <Tabs
          defaultActiveKey="1"
          tabBarStyle={{ marginBottom: 0 }}
          items={[
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
                  <Flex gap={16} style={{ marginBottom: 16, marginTop: 16 }}>
                    <Input
                      placeholder="Search candidates"
                      prefix={<SearchOutlined />}
                      value={candidateSearch}
                      onChange={(e) => setCandidateSearch(e.target.value)}
                      style={{ width: 300 }}
                      allowClear
                    />
                    <Select
                      placeholder="Filter by status"
                      value={candidateStatusFilter}
                      onChange={setCandidateStatusFilter}
                      style={{ width: 200 }}
                      allowClear
                    >
                      {statusOptions.map((status) => (
                        <Select.Option key={status} value={status}>
                          {status}
                        </Select.Option>
                      ))}
                    </Select>
                  </Flex>
                  <Table
                    columns={candidateColumns}
                    dataSource={getFilteredCandidates()}
                    rowKey={(record) => record._id}
                    pagination={{
                      defaultPageSize: 5,
                      showSizeChanger: true,
                      pageSizeOptions: ["5", "10", "20"],
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} candidates`,
                    }}
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
                  <Flex gap={16} style={{ marginBottom: 16, marginTop: 16 }}>
                    <Input
                      placeholder="Search assessments"
                      prefix={<SearchOutlined />}
                      value={assessmentSearch}
                      onChange={(e) => setAssessmentSearch(e.target.value)}
                      style={{ width: 300 }}
                      allowClear
                    />
                    <Select
                      placeholder="Filter by status"
                      value={assessmentStatusFilter}
                      onChange={setAssessmentStatusFilter}
                      style={{ width: 200 }}
                      allowClear
                    >
                      {statusOptions.map((status) => (
                        <Select.Option key={status} value={status}>
                          {status}
                        </Select.Option>
                      ))}
                    </Select>
                  </Flex>
                  <Table
                    columns={assessmentColumns}
                    dataSource={getFilteredAssessments()}
                    rowKey={(record) => record._id?.$oid || record._id}
                    pagination={{
                      defaultPageSize: 5,
                      showSizeChanger: true,
                      pageSizeOptions: ["5", "10", "20"],
                    }}
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
                  <Flex gap={16} style={{ marginBottom: 16, marginTop: 16 }}>
                    <Input
                      placeholder="Search interviews"
                      prefix={<SearchOutlined />}
                      value={interviewSearch}
                      onChange={(e) => setInterviewSearch(e.target.value)}
                      style={{ width: 300 }}
                      allowClear
                    />
                    <Select
                      placeholder="Filter by status"
                      value={interviewStatusFilter}
                      onChange={setInterviewStatusFilter}
                      style={{ width: 200 }}
                      allowClear
                    >
                      {statusOptions.map((status) => (
                        <Select.Option key={status} value={status}>
                          {status}
                        </Select.Option>
                      ))}
                    </Select>
                  </Flex>
                  <Table
                    columns={interviewColumns}
                    dataSource={getFilteredInterviews()}
                    rowKey={(record) => record._id?.$oid || record._id}
                    pagination={{
                      defaultPageSize: 5,
                      showSizeChanger: true,
                      pageSizeOptions: ["5", "10", "20"],
                    }}
                  />
                </>
              ),
            },
          ]}
        />
      </Card>

      {/* <EvaluatorFormModal
        visible={isModalOpen}
        isEditing={isEditing}
        initialValues={selectedEvaluator}
        onCancel={() => {
          setIsModalOpen(false);
          setIsEditing(false);
          setEditingEvaluator(null);
          form.resetFields();
        }}
        onSubmit={handleUpdate}
        form={form}
      /> */}
    </div>
  );
};

export default EvaluatorDetail;
