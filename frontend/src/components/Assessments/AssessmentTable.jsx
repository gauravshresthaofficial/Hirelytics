import React from "react";
import { Table, Button, Space, Popconfirm, Tag } from "antd";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AssessmentFormModal from "./AssessmentFormModal";

const AssessmentTable = ({ data, loading }) => {
  const navigate = useNavigate();

  const columns = [
    {
      title: "Name",
      dataIndex: "assessmentName",
      key: "assessmentName",
      sorter: (a, b) => a.assessmentName.localeCompare(b.assessmentName),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Max Score",
      dataIndex: "maxScore",
      key: "maxScore",
      sorter: (a, b) => a.maxScore - b.maxScore,
    },
    {
      title: "Duration (mins)",
      dataIndex: "duration",
      key: "duration",
      sorter: (a, b) => a.duration - b.duration,
    },
    {
      title: "Mode",
      dataIndex: "mode",
      key: "mode",
      filterMultiple: false,
      render: (mode) => (
        <Tag color={mode === "Online" ? "blue" : "green"}>{mode}</Tag>
      ),
      filters: [
        { text: "Online", value: "Online" },
        { text: "Offline", value: "Offline" },
      ],
      onFilter: (value, record) => record.mode === value,
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => navigate(`/assessments/${record._id}`)}
          >
            View
          </Button>
          <AssessmentFormModal isEditing={true} initialValues={record} />
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey={(record) => record._id}
      loading={loading}
      rowClassName={() => "clickable-row"}
      pagination={{
        defaultPageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ["5", "10", "20"],
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} assessments`,
      }}
    />
  );
};

export default AssessmentTable;
