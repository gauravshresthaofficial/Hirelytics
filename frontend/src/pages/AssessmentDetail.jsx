import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  deleteAssessment,
  fetchAssessments,
} from "../features/assessment/assessmentSlice";
import { fetchCandidates } from "../features/candidate/candidateSlice";
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
} from "antd";
import {
  FileTextOutlined,
  TeamOutlined,
  ArrowLeftOutlined,
  StarOutlined,
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import AssessmentFormModal from "../components/Assessments/AssessmentFormModal";
import AssessmentCandidatesTable from "../components/Assessments/AssessmentCandidatesTable";
import AssessmentStatistics from "../components/Assessments/AssessmentStatistics";
import NotFoundPage from "../components/NotFoundPage";
import Loading from "../components/Loading";

const { Title, Text } = Typography;

const AssessmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const assessments = useSelector((state) => state.assessments.data);
  const candidates = useSelector((state) => state.candidates.data);

  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [associatedCandidates, setAssociatedCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("1");
  const [statusFilter, setStatusFilter] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!assessments?.length) await dispatch(fetchAssessments()).unwrap();
        if (!candidates?.length) await dispatch(fetchCandidates()).unwrap();
      } catch (error) {
        message.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dispatch]);

  useEffect(() => {
    if (!assessments?.length || !candidates?.length || !id) return;

    const currentAssessment = assessments.find((a) => String(a._id) === id);
    setSelectedAssessment(currentAssessment);

    if (currentAssessment) {
      const filtered = candidates.filter((candidate) =>
        candidate.assessments?.some(
          (a) => String(a.assessmentId) === String(currentAssessment._id)
        )
      );
      setAssociatedCandidates(filtered);
    }
  }, [assessments, candidates, id]);

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteAssessment(id)).unwrap();
      message.success("Assessment deleted successfully!");
      navigate("/assessments");
    } catch (err) {
      message.error(err || "Failed to delete assessment.");
    }
  };

  if (loading) {
    return <Spin fullscreen />;
  }

  if (!selectedAssessment) {
    return <NotFoundPage />;
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/assessments")}
        style={{ marginBottom: 16 }}
      >
        Assessment List
      </Button>

      <Card
        title={
          <Flex justify="space-between">
            <Space>
              <FileTextOutlined />
              <Title level={3} style={{ margin: 0 }}>
                {selectedAssessment.assessmentName}
              </Title>
            </Space>
            <Space>
              <AssessmentFormModal
                isEditing={true}
                initialValues={selectedAssessment}
              >
                Edit
              </AssessmentFormModal>
              <Popconfirm
                title="Are you sure you want to delete this assessment?"
                onConfirm={() => handleDelete(selectedAssessment._id)}
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
        <Descriptions column={{ xs: 1, sm: 2, md: 4 }} layout="vertical">
          <Descriptions.Item label={<Text strong>Description</Text>}>
            <Text>{selectedAssessment.description || "N/A"}</Text>
          </Descriptions.Item>
          <Descriptions.Item label={<Text strong>Mode</Text>}>
            <Text>{selectedAssessment.mode}</Text>
          </Descriptions.Item>
          <Descriptions.Item label={<Text strong>Max Score</Text>}>
            <Space>
              <StarOutlined style={{ color: "#faad14" }} />
              <Text>{selectedAssessment.maxScore}</Text>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label={<Text strong>Duration</Text>}>
            <Space>
              <ClockCircleOutlined />
              <Text>{selectedAssessment.duration} minutes</Text>
            </Space>
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
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              label: "List View",
              key: "1",
              children: (
                <AssessmentCandidatesTable
                  candidates={associatedCandidates}
                  assessmentId={id}
                  navigate={navigate}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  // setActiveTab={setActiveTab}
                />
              ),
            },
            {
              label: "Statistics",
              key: "2",
              children: (
                <AssessmentStatistics
                  candidates={associatedCandidates}
                  assessment={selectedAssessment}
                  setActiveTab={setActiveTab}
                  setStatusFilter={setStatusFilter}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default AssessmentDetail;
