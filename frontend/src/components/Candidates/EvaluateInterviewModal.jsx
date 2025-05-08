import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber, message, DatePicker } from "antd";

const { TextArea } = Input;

const EvaluateInterviewModal = ({ visible, interview, onCancel, onSubmit }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (interview) {
      form.setFieldsValue({
        score: interview.score,
        remarks: interview.remarks,
      });
    }
  }, [interview, form]);

  const handleEvaluation = async (values) => {
    try {
      const payload = {
        ...values,
        status: "Evaluated",
      };
      await onSubmit(payload);
      form.resetFields();
    } catch (err) {
      message.error("Failed to submit evaluation.");
    }
  };

  return (
    <Modal
      title={`Evaluate ${interview?.interviewName}`}
      open={visible}
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then(handleEvaluation)
          .catch((info) => console.error("Validation Failed:", info));
      }}
      okText="Submit Evaluation"
      centered
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="score"
          label="Score"
          style={{ flex: 1 }}
          rules={[
            { required: true, message: "Please enter score" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || (value >= 0 && value <= interview?.maxScore)) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  `Score must be between 0-${interview?.maxScore}`
                );
              },
            }),
          ]}
        >
          <InputNumber
            min={0}
            max={interview?.maxScore}
            style={{ width: "100%" }}
            placeholder={`Max score: ${interview?.maxScore}`}
          />
        </Form.Item>

        <Form.Item
          name="remarks"
          label="Evaluation Remarks"
          rules={[
            { required: true, message: "Please enter remarks" },
            { max: 500, message: "Remarks cannot exceed 500 characters" },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Enter detailed evaluation comments..."
            showCount
            maxLength={500}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EvaluateInterviewModal;
