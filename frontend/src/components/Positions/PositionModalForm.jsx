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
      message.error(err?.message || "Failed to save position.");
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
          {isEditing ? "Edit" : "Create Position"}
        </Button>
      )}

      <Modal
        open={isModalOpen}
        title={isEditing ? "Edit Position" : "Create Position"}
        onCancel={handleCancel}
        onOk={handleSubmit}
        confirmLoading={loading}
        okText={isEditing ? "Update" : "Create"}
        destroyOnClose
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
              {isEditing ? "Update" : "Create"}
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

          <Form.Item name="requiredSkills" label="Required Skills">
            <Input />
          </Form.Item>

          <Form.Item name="responsibilities" label="Responsibilities">
            <Input />
          </Form.Item>

          <Form.Item name="qualifications" label="Qualifications">
            <Input />
          </Form.Item>

          <Form.Item label="Salary Range" required>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name={["salaryRange", "min"]}
                  rules={[
                    { required: true, message: "Minimum salary is required" },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder="Min"
                    min={0}
                    addonBefore="Min"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={["salaryRange", "max"]}
                  rules={[
                    { required: true, message: "Maximum salary is required" },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder="Max"
                    min={0}
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
