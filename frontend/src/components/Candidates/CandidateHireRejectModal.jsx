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
} from "antd";
import {
  hireCandidate,
  rejectCandidate,
} from "../../features/candidate/candidateSlice";

const { TextArea } = Input;

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
      message.error("Failed to hire candidate");
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
      message.error("Failed to reject candidate");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {candidate.currentStatus === "Offer Accepted" && (
        <Button
          type="primary"
          style={{ marginRight: 8 }}
          onClick={() => setHireModalVisible(true)}
        >
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
      >
        <Form form={hireForm} layout="vertical">
          <Form.Item
            name="agreedSalary"
            label="Agreed Salary"
            rules={[{ required: true, message: "Please input the salary" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              formatter={(value) =>
                `NRP ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\s?NRP\s?|,/g, "")}
            />
          </Form.Item>
          <Form.Item
            name="startDate"
            label="Start Date"
            rules={[{ required: true, message: "Please select start date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
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
              placeholder="Explain why the candidate is being rejected"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CandidateHireRejectModal;
