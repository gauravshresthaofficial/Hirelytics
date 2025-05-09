import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Row,
  Col,
  Button,
  Flex,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  createPosition,
  updatePosition,
} from "../../features/position/positionSlice";
import { PlusCircleOutlined, EditOutlined } from "@ant-design/icons";

const PositionFormModal = ({ isEditing, initialValues }) => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const role = useSelector((state) => state.auth.user.role);

  const departments = [
    "Engineering",
    "Design",
    "Product",
    "Human Resources",
    "Finance",
    "Marketing",
    "Sales",
    "Customer Support",
    "Operations",
    "Legal",
    "IT",
  ];

  useEffect(() => {
    if (isEditing && initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [initialValues, isEditing, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (isEditing && initialValues?._id) {
        await dispatch(
          updatePosition({ id: initialValues._id, updatedData: values })
        ).unwrap();
        message.success("Position updated successfully");
      } else {
        await dispatch(createPosition(values)).unwrap();
        message.success("Position created successfully");
      }

      form.resetFields();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Submit failed:", err);
      message.error(err || "Failed to save position.");
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
          {isEditing ? "Edit" : "Add Position"}
        </Button>
      )}

      <Modal
        open={isModalOpen}
        title={isEditing ? "Edit Position" : "Add Position"}
        onCancel={handleCancel}
        onOk={handleSubmit}
        confirmLoading={loading}
        destroyOnClose
        width="50vw"
        styles={{
          body: {
            height: "60vh",
            overflowY: "auto",
            padding: "0 24px",
          },
        }}
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
            name="positionName"
            label="Position Name"
            rules={[
              { required: true, message: "Please input the position name!" },
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

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="department"
            label="Department"
            rules={[{ required: true, message: "Please select a department!" }]}
          >
            <Select placeholder="Select a department">
              {departments.map((dept) => (
                <Select.Option key={dept} value={dept}>
                  {dept}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="requiredSkills"
            label="Required Skills"
            rules={[
              { required: true, message: "Please enter required skills" },
              { max: 500, message: "Max 500 characters allowed" },
            ]}
          >
            <Input.TextArea
              placeholder="e.g., React, Node.js, MongoDB"
              rows={3}
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="responsibilities"
            label="Responsibilities"
            rules={[
              { required: true, message: "Please enter responsibilities" },
              { max: 1000, message: "Max 1000 characters allowed" },
            ]}
          >
            <Input.TextArea
              placeholder="List key job responsibilities"
              rows={4}
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Form.Item
            name="qualifications"
            label="Qualifications"
            rules={[
              { required: true, message: "Please enter qualifications" },
              { max: 1000, message: "Max 1000 characters allowed" },
            ]}
          >
            <Input.TextArea
              placeholder="e.g., Bachelor's degree in Computer Science"
              rows={4}
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Form.Item label="Salary Range" required>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name={["salaryRange", "min"]}
                  rules={[
                    { required: true, message: "Minimum salary is required" },
                    {
                      type: "number",
                      min: 0,
                      message: "Minimum salary must be at least 0",
                    },
                    {
                      validator: (_, value) =>
                        Number.isInteger(value)
                          ? Promise.resolve()
                          : Promise.reject("Salary must be an integer."),
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder="Min"
                    addonBefore="Min"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={["salaryRange", "max"]}
                  dependencies={["salaryRange", "min"]}
                  rules={[
                    { required: true, message: "Maximum salary is required" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const min = getFieldValue(["salaryRange", "min"]);

                        if (value === undefined || value === null) {
                          return Promise.reject("Maximum salary is required");
                        }

                        if (!Number.isInteger(value)) {
                          return Promise.reject("Salary must be an integer.");
                        }

                        if (value < min) {
                          return Promise.reject(
                            "Maximum salary must be greater than or equal to minimum salary"
                          );
                        }

                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Input
                    style={{ width: "100%" }}
                    placeholder="Max"
                    addonBefore="Max"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default PositionFormModal;
