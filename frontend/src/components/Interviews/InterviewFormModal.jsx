import React, { useState, useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, message, Button } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  createInterview,
  updateInterview,
} from "../../features/interview/interviewSlice";
import { PlusCircleOutlined, EditOutlined } from "@ant-design/icons";

const { Option } = Select;

const InterviewFormModal = ({ isEditing, initialValues }) => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const role = useSelector((state) => state.auth.user.role);

  useEffect(() => {
    if (initialValues && isEditing) {
      form.setFieldsValue({
        ...initialValues,
        duration: initialValues.duration ? Number(initialValues.duration) : 60,
      });
    } else {
      form.resetFields();
    }
  }, [initialValues, isEditing, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      if (isEditing) {
        await dispatch(
          updateInterview({ id: initialValues._id, updatedData: values })
        ).unwrap();
        message.success("Interview updated successfully!");
      } else {
        await dispatch(createInterview(values)).unwrap();
        message.success("Interview created successfully!");
      }
      setIsModalOpen(false);
      form.resetFields();
    } catch (err) {
      message.error(err || "Failed to save interview.");
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
          {isEditing ? "Edit" : "Add Interview"}
        </Button>
      )}

      <Modal
        title={isEditing ? "Edit Interview" : "Add Interview"}
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={handleSubmit}
        confirmLoading={loading}
        okText={isEditing ? "Update" : "Submit"}
        centered
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="interviewName"
            label="Interview Name"
            rules={[
              { required: true, message: "Please enter the name!" },
              {
                validator: (_, value) => {
                  if (!value || value.length >= 3) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Name should be at least 3 characters long")
                  );
                },
              },
            ]}
          >
            <Input placeholder="Enter interview name" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea placeholder="Enter description" />
          </Form.Item>

          <Form.Item
            name="duration"
            label="Duration (minutes)"
            rules={[
              { required: true, message: "Please enter the duration!" },
              {
                type: "number",
                min: 30,
                message: "Duration must be at least 30 minutes",
              },
              {
                type: "number",
                max: 300,
                message: "Duration cannot exceed 300 minutes",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={1}
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
              <Option value="In-Person">In-Person</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="instructionForInterview"
            label="Instructions"
            rules={[
              {
                max: 300,
                message: "Instructions must be 300 characters or fewer",
              },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Enter instructions"
              maxLength={300}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default InterviewFormModal;
