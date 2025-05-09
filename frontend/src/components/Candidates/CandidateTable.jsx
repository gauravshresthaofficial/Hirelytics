import React from "react";
import { Table, Button, Space, Tag } from "antd";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";

const CandidateTable = ({
  data,
  loading,
  pagination,
  onPaginationChange,
  onViewProfile,
  onEdit,
}) => {
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
      title: "Level",
      dataIndex: "level",
      key: "level",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => onViewProfile(record)}>
            View
          </Button>
          {role.toLowerCase() != "evaluator" && (
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

  const role = useSelector((state) => state.auth.user.role);

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

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey={(record) => record._id}
      loading={loading}
      pagination={{
        ...pagination,
        showSizeChanger: true,
        pageSizeOptions: ["5", "10", "20"],
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} candidates`,
        onChange: onPaginationChange, // listen for pagination changes
      }}
    />
  );
};

export default CandidateTable;
