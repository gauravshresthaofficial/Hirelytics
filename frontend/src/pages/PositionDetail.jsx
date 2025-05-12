import React, { useEffect, useState, useMemo } from "react";
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
  Select,
  message,
} from "antd";
import {
  FileTextOutlined,
  TeamOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPositions,
  deletePosition,
} from "../features/position/positionSlice";
import PositionFormModal from "../components/Positions/PositionModalForm";
import { fetchCandidates } from "../features/candidate/candidateSlice";

const { Title, Text } = Typography;
const { Search } = Input;

const statusOptions = [
  { value: "Assessment Scheduled", label: "Assessment Scheduled" },
  { value: "Assessment In Progress", label: "Assessment In Progress" },
  { value: "Assessment Completed", label: "Assessment Completed" },
  { value: "Assessment Evaluated", label: "Assessment Evaluated" },
  { value: "Interview Scheduled", label: "Interview Scheduled" },
  { value: "Interview In Progress", label: "Interview In Progress" },
  { value: "Interview Completed", label: "Interview Completed" },
  { value: "Interview Evaluated", label: "Interview Evaluated" },
  { value: "Offer Extended", label: "Offer Extended" },
  { value: "Offer Accepted", label: "Offer Accepted" },
  { value: "Hired", label: "Hired" },
  { value: "Rejected", label: "Rejected" },
  { value: "Withdrawn", label: "Withdrawn" },
];

const PositionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const positions = useSelector((state) => state.positions.data);
  const candidates = useSelector((state) => state.candidates.data);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);

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
        return "orange";
    }
  };

  const filteredCandidates = useMemo(() => {
    let result = candidates.filter(
      (candidate) =>
        candidate.appliedPosition === selectedPosition?.positionName
    );

    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      result = result.filter(
        (candidate) =>
          candidate.fullName?.toLowerCase().includes(lowerSearch) ||
          candidate.email?.toLowerCase().includes(lowerSearch) ||
          candidate.phoneNumber?.toLowerCase().includes(lowerSearch)
      );
    }

    if (statusFilter) {
      result = result.filter(
        (candidate) => candidate.currentStatus === statusFilter
      );
    }

    return result;
  }, [candidates, selectedPosition, searchText, statusFilter]);

  const candidateColumns = [
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a, b) => a.fullName?.localeCompare(b.fullName),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email?.localeCompare(b.email),
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      sorter: (a, b) => a.phoneNumber?.localeCompare(b.phoneNumber),
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
      filters: statusOptions.map((opt) => ({
        text: opt.label,
        value: opt.value,
      })),
      filteredValue: statusFilter ? [statusFilter] : [],
      onFilter: (value, record) => record.currentStatus === value,
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
            <Tag>{selectedPosition.department || "N/A"}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={<Text strong>Salary Range</Text>}>
            NPR {selectedPosition.salaryRange?.min} - NPR{" "}
            {selectedPosition.salaryRange?.max}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        title={
          <Flex justify="space-between" align="center">
            <Space>
              <TeamOutlined />
              <Title level={4} style={{ margin: 0 }}>
                Associated Candidates
              </Title>
              <Badge
                count={filteredCandidates.length}
                style={{ backgroundColor: "#1890ff" }}
              />
            </Space>
          </Flex>
        }
        extra={
          <Flex gap={16}>
            <Input
              placeholder="Search candidates..."
              prefix={<SearchOutlined />}
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
            />
            <Select
              allowClear
              placeholder="Filter by status"
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              suffixIcon={<FilterOutlined />}
              style={{ width: 250 }}
            />
          </Flex>
        }
      >
        <Table
          columns={candidateColumns}
          dataSource={filteredCandidates}
          rowKey={(record) => record._id}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} candidates`,
          }}
        />
      </Card>
    </div>
  );
};

export default PositionDetail;
