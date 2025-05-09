import React from "react";
import { Card, Descriptions, Space, Divider, Tag } from "antd";
import { ClockCircleOutlined, IdcardOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const CandidateProfile = ({ candidate }) => {
  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Divider orientation="left" plain>
        Personal Information
      </Divider>
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Full Name">
          {candidate.fullName}
        </Descriptions.Item>
        <Descriptions.Item label="Phone Number">
          {candidate.phoneNumber}
        </Descriptions.Item>
        <Descriptions.Item label="Education Background">
          {candidate.educationBackground}
        </Descriptions.Item>
        <Descriptions.Item label="Experience (Years)" span={2}>
          {candidate.experience} years
        </Descriptions.Item>
        {candidate.skills && (
          <Descriptions.Item label="Skills">
            <Space wrap>
              {candidate.skills.map((skill) => (
                <Tag key={skill}>{skill}</Tag>
              ))}
            </Space>
          </Descriptions.Item>
        )}
        <Descriptions.Item label="Remark">
          {candidate.notes ? candidate.notes : "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Source">{candidate.source}</Descriptions.Item>
      </Descriptions>
      <Divider orientation="left" plain>
        Application Details
      </Divider>

      <Descriptions bordered column={1} size="middle">
        <Descriptions.Item
          label={
            <Space>
              <IdcardOutlined />
              <span>Applied Position</span>
            </Space>
          }
        >
          {candidate.appliedPosition}
        </Descriptions.Item>

        <Descriptions.Item
          label={
            <Space>
              <ClockCircleOutlined />
              <span>Application Date</span>
            </Space>
          }
        >
          {dayjs(candidate.applicationDate).format("MMMM D, YYYY") ||
            "Not specified"}
        </Descriptions.Item>
      </Descriptions>
    </Space>
  );
};

export default CandidateProfile;
