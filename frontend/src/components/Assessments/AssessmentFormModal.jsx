import React, { useState, useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, message, Button } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  createAssessment,
  updateAssessment,
} from "../../features/assessment/assessmentSlice";
import { PlusCircleOutlined, EditOutlined } from "@ant-design/icons";

const { Option } = Select;

const AssessmentFormModal = ({ isEditing, initialValues }) => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false); // loading state for submit button
  const dispatch = useDispatch();
  const role = useSelector((state) => state.auth.user.role);

  useEffect(() => {
    if (initialValues && isEditing) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, isEditing, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      if (isEditing) {
        await dispatch(
          updateAssessment({ id: initialValues._id, updatedData: values })
        ).unwrap();
        message.success("Assessment updated successfully!");
      } else {
        await dispatch(createAssessment(values)).unwrap();
        message.success("Assessment created successfully!");
      }
      setIsModalOpen(false);
      form.resetFields();
    } catch (err) {
      message.error(err?.message || "Failed to save assessment.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {role.toLowerCase() != "evaluator" && (
        <Button
          type="primary"
          icon={isEditing ? <EditOutlined /> : <PlusCircleOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          {isEditing ? "Edit" : "Create Assessment"}
        </Button>
      )}

      <Modal
        title={isEditing ? "Edit Assessment" : "Create Assessment"}
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={handleSubmit}
        confirmLoading={loading}
        okText={isEditing ? "Update" : "Create"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="assessmentName"
            label="Assessment Name"
            rules={[{ required: true, message: "Please enter the name!" }]}
          >
            <Input placeholder="Enter assessment name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter a description!" }]}
          >
            <Input.TextArea placeholder="Enter description" />
          </Form.Item>

          <Form.Item
            name="maxScore"
            label="Max Score"
            rules={[{ required: true, message: "Please enter the max score!" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter max score"
            />
          </Form.Item>

          <Form.Item
            name="duration"
            label="Duration (minutes)"
            rules={[{ required: true, message: "Please enter the duration!" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter duration"
            />
          </Form.Item>

          <Form.Item
            name="mode"
            label="Mode"
            rules={[{ required: true, message: "Please select a mode!" }]}
          >
            <Select placeholder="Select mode">
              <Option value="Online">Online</Option>
              <Option value="Offline">Offline</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AssessmentFormModal;
