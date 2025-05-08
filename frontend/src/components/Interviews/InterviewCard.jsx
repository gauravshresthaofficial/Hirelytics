import React from "react";
import { Card, Button, Space, Tag } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const InterviewCard = ({ interview, onEdit, onDelete }) => {
  return (
    <Card
      title={interview.interviewName}
      extra={
        <Tag color={interview.mode === "Online" ? "blue" : "green"}>
          {interview.mode}
        </Tag>
      }
      style={{
        width: "100%",
        height: "200px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <p
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        <strong>Description:</strong> {interview.description}
      </p>
      <p>
        <strong>Duration:</strong> {interview.duration} mins
      </p>
      <Space>
        <Button icon={<EditOutlined />} onClick={() => onEdit(interview)}>
          Edit
        </Button>
        <Button
          icon={<DeleteOutlined />}
          danger
          onClick={() => onDelete(interview._id)}
        >
          Delete
        </Button>
      </Space>
    </Card>
  );
};

export default InterviewCard;
