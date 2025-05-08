import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber, message, DatePicker } from "antd";

const { TextArea } = Input;

const EvaluateAssessmentModal = ({
  visible,
  assessment,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (assessment) {
      form.setFieldsValue({
        score: assessment.score,
        remarks: assessment.remarks,
      });
    }
  }, [assessment, form]);

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
      title={`Evaluate ${assessment?.assessmentName}`}
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
          rules={[{ required: true, message: "Please enter a score" }]}
        >
          <InputNumber
            min={0}
            max={assessment?.maxScore}
            style={{ width: "100%" }}
            placeholder={`Enter score (Max: ${assessment?.maxScore})`}
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

export default EvaluateAssessmentModal;
