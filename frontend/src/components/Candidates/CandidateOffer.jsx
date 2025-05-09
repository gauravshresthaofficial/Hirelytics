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
import EmailTemplateSelector from "../common/EmailTemplate";

const { TextArea } = Input;
const { Text } = Typography;
const { Option } = Select;

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
      message.error(error || "Failed to Offer candidate");
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
        centered
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

                  if (typeof value !== "number" || isNaN(value)) {
                    return Promise.reject("Salary must be a valid number");
                  }

                  if (!Number.isInteger(value)) {
                    return Promise.reject("Salary must be an integer");
                  }

                  if (value <= 0) {
                    return Promise.reject("Salary must be greater than 0");
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              placeholder="Salary in Rs."
              style={{ width: "100%" }}
              formatter={(value) =>
                `NRP ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\s?NRP\s?|,/g, "")}
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

          <EmailTemplateSelector />
        </Form>
      </Modal>
    </>
  );
};

export default CandidateOffer;
