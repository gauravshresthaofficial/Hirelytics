import React from "react";
import { Table, Button, Space, Tag } from "antd";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";

// Moved outside component since it's static
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

const statusFilters = [
  { text: "Applied", value: "Applied" },
  { text: "Assessment Scheduled", value: "Assessment Scheduled" },
  { text: "Assessment In Progress", value: "Assessment In Progress" },
  { text: "Assessment Completed", value: "Assessment Completed" },
  { text: "Assessment Evaluated", value: "Assessment Evaluated" },
  { text: "Interview Scheduled", value: "Interview Scheduled" },
  { text: "Interview In Progress", value: "Interview In Progress" },
  { text: "Interview Completed", value: "Interview Completed" },
  { text: "Interview Evaluated", value: "Interview Evaluated" },
  { text: "Offer Extended", value: "Offer Extended" },
  { text: "Offer Accepted", value: "Offer Accepted" },
  { text: "Hired", value: "Hired" },
  { text: "Rejected", value: "Rejected" },
];

const levelFilters = [
  { text: "Entry-Level", value: "Entry-Level" },
  { text: "Junior", value: "Junior" },
  { text: "Mid-Level", value: "Mid-Level" },
  { text: "Senior", value: "Senior" },
  { text: "Lead", value: "Lead" },
  { text: "Manager", value: "Manager" },
  { text: "Executive", value: "Executive" },
];

const CandidateTable = ({
  data,
  loading,
  pagination,
  onPaginationChange,
  onViewProfile,
  onEdit,
  filteredInfo,
  setFilteredInfo,
  positionOptions,
}) => {
  const { role } = useSelector((state) => state.auth.user || {});

  const columns = [
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Applied Position",
      dataIndex: "appliedPosition",
      key: "appliedPosition",
      filters: positionOptions,
      filteredValue: filteredInfo.appliedPosition || null,
      onFilter: (value, record) => record.appliedPosition === value,
    },
    {
      title: "Status",
      dataIndex: "currentStatus",
      key: "currentStatus",
      filters: statusFilters,
      onFilter: (value, record) => record.currentStatus === value,
      filterMultiple: true,
      filteredValue: filteredInfo.currentStatus || null,
      render: (currentStatus) => (
        <Tag color={getStatusTagColor(currentStatus)}>
          {currentStatus || "Not Started"}
        </Tag>
      ),
    },
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
      filters: levelFilters,
      filteredValue: filteredInfo.level || null,
      onFilter: (value, record) => record.level === value,
      filterMultiple: true,
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => onViewProfile(record)}>
            View
          </Button>
          {role?.toLowerCase() !== "evaluator" && (
            <Button
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              type="primary"
            >
              Edit
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleTableChange = (pagination, filters, sorter) => {
    setFilteredInfo(filters);
    onPaginationChange(pagination.current, pagination.pageSize);
  };

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey={(record) => record._id}
      loading={loading}
      onChange={handleTableChange}
      pagination={{
        ...pagination,
        showSizeChanger: true,
        pageSizeOptions: ["5", "10", "20"],
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} candidates`,
      }}
    />
  );
};

export default CandidateTable;
