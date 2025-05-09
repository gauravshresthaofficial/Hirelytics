import React, { useEffect, useState } from "react";
import { Modal, Form, Input, message, Select, Button, Flex } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { createUser, updateUser } from "../../features/user/userSlice";
import { PlusCircleOutlined, EditOutlined } from "@ant-design/icons";

const EvaluatorFormModal = ({ isEditing, initialValues }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { role: currentUserRole, _id: currentUserId } = useSelector(
    (state) => state.auth.user
  );

  // const roles = ["evaluator", "admin", "hr"];

  useEffect(() => {
    if (isModalOpen) {
      if (isEditing && initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
      }
    }
  }, [initialValues, isEditing, form, isModalOpen]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const updatedValues = { ...values, role: "evaluator" }; 

      if (isEditing && initialValues?._id) {
        await dispatch(
          updateUser({
            id: initialValues._id,
            updatedData: updatedValues,
          })
        ).unwrap();
        message.success("Evaluator updated successfully");
      } else {
        await dispatch(createUser(values)).unwrap();
        message.success("Evaluator created successfully");
      }

      form.resetFields();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Submit failed:", error);
      message.error(error || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  // Conditional rendering logic
  const shouldRenderButton = () => {
    if (currentUserRole === "evaluator") {
      return isEditing && initialValues?._id === currentUserId;
    }
    return true;
  };

  return (
    <>
      {shouldRenderButton() && (
        <Button
          type="primary"
          icon={isEditing ? <EditOutlined /> : <PlusCircleOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          {isEditing ? "Edit" : "Add Evaluator"}
        </Button>
      )}

      <Modal
        open={isModalOpen}
        title={isEditing ? "Edit Evaluator" : "Add Evaluator"}
        onCancel={handleCancel}
        onOk={handleSubmit}
        confirmLoading={loading}
        destroyOnClose
        centered
        footer={
          <Flex justify="flex-end" gap="small" style={{ padding: "16px 24px" }}>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button type="primary" onClick={handleSubmit} loading={loading}>
              {isEditing ? "Update" : "Submit"}
            </Button>
          </Flex>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[
              { required: true, message: "Please input the full name!" },
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
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please input the email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input />
          </Form.Item>

          {/* <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Please select a role!" }]}
          >
            <Select placeholder="Select a role">
              {roles.map((role) => (
                <Select.Option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item> */}

          {isEditing && (
            <Form.Item name="googleId" label="Google ID" hidden>
              <Input disabled />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default EvaluatorFormModal;
