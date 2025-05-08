import {
  Form,
  message,
  Button,
  Modal,
  Input,
  Select,
  InputNumber,
  Typography,
} from "antd";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { makeOfferToCandidate } from "../../features/candidate/candidateSlice";

const { TextArea } = Input;
const { Text } = Typography;

const CandidateOffer = ({ candidate, positions }) => {
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleOfferClick = () => {
    setIsOfferModalOpen(true);
  };
  const handleOfferConfirm = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      dispatch(
        makeOfferToCandidate({ candidateId: candidate._id, offerData: values })
      ).unwrap();

      message.success("Candidate has been offered successfully");
      setIsOfferModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error("Offer failed:", error);
      message.error("Failed to Offer candidate");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsOfferModalOpen(false);
    form.resetFields();
  };

  const options = positions.map((position) => ({
    label: position.positionName,
    value: position._id,
  }));

  return (
    <>
      {candidate.currentStatus === "Interview Evaluated" &&
      candidate.currentStatus !== "Rejected" ? (
        <Button type="primary" onClick={handleOfferClick}>
          Offer
        </Button>
      ) : (
        <Text>No offer available.</Text>
      )}

      <Modal
        title={`Offer ${candidate.fullName}`}
        open={isOfferModalOpen}
        onOk={handleOfferConfirm}
        onCancel={handleCancel}
        confirmLoading={loading}
        okText="Offer Position"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="offeredPositionId">
            <Select
              showSearch
              placeholder="Position"
              options={options}
            ></Select>
          </Form.Item>
          <Form.Item
            name="salary"
            label="Salary"
            rules={[{ required: true, message: "Please enter the salary" }]}
          >
            <InputNumber
              placeholder="Salary in Rs."
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item
            name="benefits"
            label="Benefits"
            rules={[
              {
                required: true,
                message: "Please provide benefits",
              },
              { min: 10, message: "Should be at least 10 characters" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Benefits"
              showCount
              maxLength={500}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CandidateOffer;
