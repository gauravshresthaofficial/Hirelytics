import React, { useState } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  Tag,
  Popconfirm,
  Card,
  Select,
} from "antd";
import {
  SearchOutlined,
  PlusCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import InterviewFormModal from "./InterviewFormModal";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const InterviewTable = ({ interviews }) => {
  const [searchText, setSearchText] = useState("");
  const [filterMode, setFilterMode] = useState("All");
  const [filterDuration, setFilterDuration] = useState(null);
  const navigate = useNavigate();

  const columns = [
    {
      title: "Interview Name",
      dataIndex: "interviewName",
      key: "interviewName",
      sorter: (a, b) => a.interviewName.localeCompare(b.interviewName),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
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
      render: (mode) => (
        <Tag color={mode === "Online" ? "blue" : "green"}>{mode}</Tag>
      ),
      filters: [
        { text: "Online", value: "Online" },
        { text: "In-Person", value: "In-Person" },
      ],
      onFilter: (value, record) => record.mode === value,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => navigate(`/interviews/${record._id}`)}
          >
            View
          </Button>
          <InterviewFormModal isEditing={true} initialValues={record} />
        </Space>
      ),
    },
  ];

  const filteredData = interviews
    .filter((interview) =>
      interview.interviewName.toLowerCase().includes(searchText.toLowerCase())
    )
    .filter((interview) => {
      if (filterMode === "All") return true;
      return interview.mode === filterMode;
    })
    .filter((interview) => {
      if (filterDuration === null) return true;
      if (filterDuration === "<30") return interview.duration < 30;
      if (filterDuration === "30-60")
        return interview.duration >= 30 && interview.duration <= 60;
      if (filterDuration === ">60") return interview.duration > 60;
      return true;
    });

  return (
    <Card width="100%" height="100%">
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <Space wrap>
          <Input
            placeholder="Search interviews"
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            value={filterDuration}
            placeholder="All Durations"
            onChange={setFilterDuration}
            style={{ width: 180 }}
            allowClear
          >
            {/* <Option value="All">All Durations</Option> */}
            <Option value="<30">Less than 30 mins</Option>
            <Option value="30-60">30-60 mins</Option>
            <Option value=">60">More than 60 mins</Option>
          </Select>
        </Space>
        <InterviewFormModal isEditing={false} />
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="_id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} interviews`,
        }}
      />
    </Card>
  );
};

export default InterviewTable;
