import React, { useState, useMemo } from "react";
import {
  Table,
  Avatar,
  Tag,
  Space,
  Typography,
  Progress,
  Button,
  Input,
  Select,
  Row,
  Col,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;
const { Option } = Select;

const AssessmentCandidatesTable = ({
  candidates,
  assessmentId,
  navigate,
  statusFilter,
  setStatusFilter,
}) => {
  const [searchText, setSearchText] = useState("");

  // Filtered candidates list
  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const nameMatch = candidate.fullName
        .toLowerCase()
        .includes(searchText.toLowerCase());

      const assessment = candidate.assessments?.find(
        (a) => String(a.assessmentId) === assessmentId
      );
      const status = assessment?.status || "Cancelled";

      const statusMatch = statusFilter === null || status === statusFilter;

      return nameMatch && statusMatch;
    });
  }, [candidates, searchText, statusFilter, assessmentId]);

  const columns = [
    {
      title: "Candidate",
      dataIndex: "fullName",
      key: "fullName",
      render: (text, record) => (
        <Space>
          <Avatar src={record.photoUrl} icon={<UserOutlined />} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "assessments",
      key: "status",
      render: (assessments) => {
        const assessment = assessments?.find(
          (a) => String(a.assessmentId) === assessmentId
        );
        const status = assessment?.status || "Not Started";
        return (
          <Tag
            color={
              status === "Completed"
                ? "green"
                : status === "Scheduled"
                ? "blue"
                : status === "Evaluated"
                ? "purple"
                : "orange"
            }
          >
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Score",
      dataIndex: "assessments",
      key: "score",
      render: (assessments) => {
        const assessment = assessments?.find(
          (a) => String(a.assessmentId) === assessmentId
        );
        return assessment?.score ? (
          <Progress
            percent={Math.round((assessment.score / assessment.maxScore) * 100)}
            size="small"
            format={(percent) => `${assessment.score}/${assessment.maxScore}`}
          />
        ) : (
          "N/A"
        );
      },
    },
    {
      title: "Scheduled Date",
      dataIndex: "assessments",
      key: "date",
      render: (assessments) => {
        const assessment = assessments?.find(
          (a) => String(a.assessmentId) === assessmentId
        );
        return assessment?.scheduledDate
          ? dayjs(assessment.scheduledDate).format("MMM D, YYYY h:mm A")
          : "Not Scheduled";
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

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search by candidate name"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
        <Select
          value={statusFilter}
          onChange={(value) => setStatusFilter(value)}
          style={{ minWidth: "8rem" }}
          allowClear
          placeholder="All"
        >
          <Option value="Completed">Completed</Option>
          <Option value="Scheduled">Scheduled</Option>
          <Option value="Evaluated">Evaluated</Option>
          <Option value="In Progress">In Progress</Option>
          <Option value="Cancelled">Cancelled</Option>
        </Select>
      </Space>
      <Table
        columns={columns}
        dataSource={filteredCandidates}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: true }}
      />
    </>
  );
};

export default AssessmentCandidatesTable;
