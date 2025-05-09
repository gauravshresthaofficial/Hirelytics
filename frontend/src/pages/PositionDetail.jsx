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
  DollarCircleOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPositions,
  deletePosition,
  updatePosition,
} from "../features/position/positionSlice";
import PositionFormModal from "../components/Positions/PositionModalForm";
import { fetchCandidates } from "../features/candidate/candidateSlice";

const { Title, Text } = Typography;

const PositionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const positions = useSelector((state) => state.positions.data);
  const candidates = useSelector((state) => state.candidates.data);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!positions?.length) await dispatch(fetchPositions()).unwrap();
        if (!candidates?.length) await dispatch(fetchCandidates()).unwrap();
      } catch (error) {
        message.error("Failed to load positions");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dispatch]);

  useEffect(() => {
    if (!positions?.length || !id) return;
    const current = positions.find((p) => String(p._id) === id);
    setSelectedPosition(current);
  }, [positions, id]);

  const handleDelete = async (id) => {
    try {
      await dispatch(deletePosition(id)).unwrap();
      message.success("Position deleted successfully!");
      navigate("/positions");
    } catch (err) {
      message.error(err || "Failed to delete position.");
    }
  };

  if (loading) {
    return <Spin tip="Loading dashboard data..." fullscreen />;
  }

  if (!selectedPosition) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <Title level={4}>Position not found</Title>
        <Button type="primary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  // Filter candidates by the applied position
  const associatedCandidates = candidates.filter(
    (candidate) => candidate.appliedPosition === selectedPosition.positionName
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
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Status",
      dataIndex: "currentStatus",
      key: "currentStatus",
      render: (currentStatus) => (
        <Tag color={getStatusTagColor(currentStatus)}>
          {currentStatus || "Not Started"}
        </Tag>
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

  const getStatusTagColor = (status) => {
    switch (status) {
      case "Assessment Scheduled":
        return "blue";
      case "Assessment In Progress":
        return "orange";
      case "Assessment Completed":
        return "green";
      case "Assessment Evaluated":
        return "purple";
      case "Interview Scheduled":
        return "cyan";
      case "Interview In Progress":
        return "gold";
      case "Interview Completed":
        return "lime";
      case "Interview Evaluated":
        return "geekblue";
      case "Offer Extended":
        return "magenta";
      case "Offer Accepted":
        return "green";
      case "Hired":
        return "success";
      case "Rejected":
        return "red";
      case "Withdrawn":
        return "gray";
      default:
        return "orange"; // Default color for unknown statuses
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/positions")}
        style={{ marginBottom: 16 }}
      >
        Position List
      </Button>

      <Card
        title={
          <Flex justify="space-between">
            <Space>
              <FileTextOutlined />
              <Title level={3} style={{ margin: 0 }}>
                {selectedPosition.positionName}
              </Title>
            </Space>
            <Space>
              <PositionFormModal
                isEditing={true}
                initialValues={selectedPosition}
              />
              <Popconfirm
                title="Are you sure you want to delete this position?"
                onConfirm={() => handleDelete(selectedPosition._id)}
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
          <Descriptions.Item label={<Text strong>Department</Text>}>
            <Space>
              <TagOutlined /> {selectedPosition.department || "N/A"}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label={<Text strong>Salary Range</Text>}>
            <Space>
              NPR{selectedPosition.salaryRange?.min} - NPR
              {selectedPosition.salaryRange?.max}
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
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Candidates" key="1">
            <Table
              columns={candidateColumns}
              dataSource={associatedCandidates}
              rowKey={(record) => record._id.$oid}
              pagination={{
                defaultPageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ["5", "10", "20"],
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} positions`,
              }}
            />
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default PositionDetail;
