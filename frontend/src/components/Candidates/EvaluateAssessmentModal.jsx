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
      console.error(err);
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
          .catch(() => console.error("Validation Failed"));
      }}
      okText="Submit"
      centered
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="score"
          label="Score"
          style={{ flex: 1 }}
          rules={[
            { required: true, message: "Please enter a score" },
            {
              validator: (_, value) => {
                const maxScore = assessment?.maxScore || 100;

                if (value === undefined || value === null || value === "") {
                  return Promise.reject("Please enter a score");
                }

                if (typeof value !== "number" || isNaN(value)) {
                  return Promise.reject("Invalid number format");
                }

                if (!Number.isInteger(value)) {
                  return Promise.reject("Score must be an integer.");
                }

                if (value <= 0) {
                  return Promise.reject("Score must be greater than 0");
                }

                if (value > maxScore) {
                  return Promise.reject(`Score cannot exceed ${maxScore}`);
                }

                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber
            min={0}
            style={{ width: "100%" }}
            placeholder={`Enter score (Max: ${assessment?.maxScore || 100})`}
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
