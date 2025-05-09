import React, { useState, useMemo } from "react";
import {
  Table,
  Avatar,
  Tag,
  Space,
  Progress,
  Button,
  Input,
  Select,
  Row,
  Col,
} from "antd";
import { FilterOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

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

      const statusMatch =
        statusFilter === null ||
        statusFilter === undefined ||
        status === statusFilter;

      return nameMatch && statusMatch;
    });
  }, [candidates, searchText, statusFilter, assessmentId]);

  const columns = [
    {
      title: "Candidate",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: "Status",
      dataIndex: "assessments",
      key: "status",
      filters: [
        { text: "Completed", value: "Completed" },
        { text: "Scheduled", value: "Scheduled" },
        { text: "Evaluated", value: "Evaluated" },
        { text: "In Progress", value: "In Progress" },
        { text: "Cancelled", value: "Cancelled" },
      ],
      onFilter: (value, record) => {
        const assessment = record.assessments?.find(
          (a) => String(a.assessmentId) === assessmentId
        );
        return assessment?.status === value;
      },
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
      sorter: (a, b) => {
        const scoreA = a.assessments?.find(
          (x) => String(x.assessmentId) === assessmentId
        );
        const scoreB = b.assessments?.find(
          (x) => String(x.assessmentId) === assessmentId
        );
        return (scoreA?.score || 0) - (scoreB?.score || 0);
      },
      render: (assessments) => {
        const assessment = assessments?.find(
          (a) => String(a.assessmentId) === assessmentId
        );
        return assessment?.score ? (
          <Progress
            percent={Math.round((assessment.score / assessment.maxScore) * 100)}
            size="small"
            format={() => `${assessment.score}/${assessment.maxScore}`}
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
      sorter: (a, b) => {
        const dateA = a.assessments?.find(
          (x) => String(x.assessmentId) === assessmentId
        )?.scheduledDate;
        const dateB = b.assessments?.find(
          (x) => String(x.assessmentId) === assessmentId
        )?.scheduledDate;
        return new Date(dateA || 0) - new Date(dateB || 0);
      },
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
      title: "Evaluated Date",
      dataIndex: "assessments",
      key: "evaluatedDate",
      sorter: (a, b) => {
        const dateA = a.assessments?.find(
          (x) => String(x.assessmentId) === assessmentId
        )?.evaluationDate;
        const dateB = b.assessments?.find(
          (x) => String(x.assessmentId) === assessmentId
        )?.evaluationDate;
        return new Date(dateA || 0) - new Date(dateB || 0);
      },
      render: (assessments) => {
        const assessment = assessments?.find(
          (a) => String(a.assessmentId) === assessmentId
        );
        return assessment?.evaluationDate
          ? dayjs(assessment.evaluationDate).format("MMM D, YYYY h:mm A")
          : "Not Evaluated";
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
          allowClear
          placeholder="Filter by status"
          suffixIcon={<FilterOutlined />}
          style={{ width: 250 }}
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
