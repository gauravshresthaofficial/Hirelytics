import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  message,
  Tag,
  Select,
} from "antd";
import {
  hireCandidate,
  rejectCandidate,
} from "../../features/candidate/candidateSlice";
import moment from "moment";
import EmailTemplateSelector from "../common/EmailTemplate";

const { TextArea } = Input;
const { Option } = Select;

const CandidateHireRejectModal = ({ candidate, positionId }) => {
  const candidateId = candidate._id;
  const dispatch = useDispatch();
  const [hireModalVisible, setHireModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [hireForm] = Form.useForm();
  const [rejectForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleHire = async () => {
    try {
      const values = await hireForm.validateFields();
      setLoading(true);

      await dispatch(
        hireCandidate({
          candidateId,
          hireData: {
            positionId: positionId,
            agreedSalary: values.agreedSalary,
            startDate: values.startDate.format("YYYY-MM-DD"),
          },
        })
      ).unwrap();

      message.success("Candidate hired successfully!");
      setHireModalVisible(false);
      hireForm.resetFields();
    } catch (error) {
      message.error(error || "Failed to hire candidate");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      const values = await rejectForm.validateFields();
      setLoading(true);

      await dispatch(
        rejectCandidate({
          candidateId,
          rejectionData: values,
        })
      ).unwrap();

      message.success("Candidate rejected successfully");
      setRejectModalVisible(false);
      rejectForm.resetFields();
    } catch (error) {
      message.error(error || "Failed to reject candidate");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {candidate.currentStatus === "Offer Accepted" && (
        <Button type="primary" onClick={() => setHireModalVisible(true)}>
          Hire Candidate
        </Button>
      )}
      {candidate.currentStatus !== "Hired" &&
        candidate.currentStatus !== "Rejected" && (
          <Button
            type="primary"
            danger
            onClick={() => setRejectModalVisible(true)}
          >
            Reject Candidate
          </Button>
        )}
      {candidate.currentStatus === "Hired" && <Tag color="success">Hired</Tag>}
      {candidate.currentStatus === "Rejected" && (
        <Tag color="error">Rejected</Tag>
      )}

      {/* Hire Modal */}
      <Modal
        title="Hire Candidate"
        open={hireModalVisible}
        onOk={handleHire}
        onCancel={() => {
          setHireModalVisible(false);
          hireForm.resetFields();
        }}
        confirmLoading={loading}
        okText="Confirm Hire"
        centered
      >
        <Form form={hireForm} layout="vertical">
          <Form.Item
            name="agreedSalary"
            label="Agreed Salary"
            rules={[
              {
                required: true,
                message: "Please input the salary",
              },
              {
                validator: (_, value) => {
                  if (value === undefined || value === null || value === "") {
                    return Promise.reject("Please input the salary");
                  }

                  const num = Number(value);
                  if (isNaN(num)) {
                    return Promise.reject("Salary must be a valid number");
                  }

                  if (num <= 0) {
                    return Promise.reject("Salary must be greater than 0");
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={1}
              precision={2}
              step={1000}
              formatter={(value) =>
                `NRP ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\s?NRP\s?|,/g, "")}
            />
          </Form.Item>
          import moment from 'moment';
          <Form.Item
            name="startDate"
            label="Start Date"
            rules={[
              {
                required: true,
                message: "Please select start date",
              },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              disabledDate={(current) =>
                current && current <= moment().endOf("day")
              }
            />
          </Form.Item>
          <EmailTemplateSelector />
        </Form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Reject Candidate"
        open={rejectModalVisible}
        onOk={handleReject}
        onCancel={() => {
          setRejectModalVisible(false);
          rejectForm.resetFields();
        }}
        confirmLoading={loading}
        centered
        okText="Confirm Rejection"
        okButtonProps={{ danger: true }}
      >
        <Form form={rejectForm} layout="vertical">
          <Form.Item
            name="rejectionReason"
            label="Rejection Reason"
            rules={[{ required: true, message: "Please provide a reason" }]}
          >
            <TextArea
              rows={4}
              maxLength={150}
              placeholder="Explain why the candidate is being rejected"
            />
          </Form.Item>
          <EmailTemplateSelector />
        </Form>
      </Modal>
    </>
  );
};

export default CandidateHireRejectModal;
