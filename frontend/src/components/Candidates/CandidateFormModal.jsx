import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  Row,
  Col,
  Typography,
  Divider,
  Flex,
  message,
} from "antd";
import moment from "moment";

const { Option } = Select;
const { Title } = Typography;

const CandidateFormModal = ({
  open,
  onCancel,
  onSubmit,
  isEditing,
  initialValues,
  positionOptions,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.resetFields();
    if (open && isEditing && initialValues) {
      const formattedValues = {
        ...initialValues,
        applicationDate: initialValues.applicationDate
          ? moment(initialValues.applicationDate)
          : null,
      };
      form.setFieldsValue(formattedValues);
    }
  }, [open, isEditing, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      if (!isEditing) {
        form.resetFields();
      }
    } catch (error) {
      if (error.errorFields && error.errorFields.length > 0) {
        const firstErrorMsg = error.errorFields[0].errors[0];
        message.error(firstErrorMsg);
      } else {
        message.error("Validation Error.");
      }
      console.error("Validation Failed:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <Title level={4} style={{ marginBottom: 0 }}>
          {isEditing ? "Edit Candidate" : "Add Candidate"}
        </Title>
      }
      open={open}
      onCancel={handleCancel}
      onOk={handleOk}
      width={800}
      styles={{
        body: {
          height: "60vh",
          overflowY: "auto",
          padding: "0 24px",
        },
      }}
      footer={
        <Flex justify="flex-end" gap="small" style={{ padding: "16px 24px" }}>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button type="primary" onClick={handleOk}>
            {isEditing ? "Update" : "Submit"}
          </Button>
        </Flex>
      }
    >
      <Form form={form} layout="vertical" scrollToFirstError={true}>
        <Divider plain orientation="left">
          Personal Information
        </Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="fullName"
              label="Full Name"
              rules={[
                { required: true, message: "Please enter full name" },
                { min: 3, message: "Name must be at least 3 characters long." },
                {
                  max: 100,
                  message: "Name can't be longer than 100 characters.",
                },
              ]}
            >
              <Input placeholder="Gaurav Shrestha" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please enter email" },
                { type: "email", message: "Invalid email format" },
              ]}
            >
              <Input placeholder="gaurav@shrestha.com" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="phoneNumber"
              label="Phone Number"
              rules={[
                {
                  validator(_, value) {
                    if (!value) {
                      return Promise.reject(
                        new Error("Please enter phone number")
                      );
                    }
                    if (!/^\d+$/.test(value)) {
                      return Promise.reject(
                        new Error("Phone number must contain only digits")
                      );
                    }
                    if (value.length !== 10) {
                      return Promise.reject(
                        new Error("Phone number must be exactly 10 digits")
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input placeholder="98xxxxxxxx" maxLength={10} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="applicationDate"
              label="Application Date"
              disabledDate={(current) =>
                current && current > moment().endOf("day")
              }
              rules={[{ required: true, message: "Please select date" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                disabledDate={(current) =>
                  current && current > moment().endOf("day")
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider plain orientation="left">
          Professional Information
        </Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="appliedPosition"
              label="Applied Position"
              rules={[{ required: true, message: "Please select position" }]}
            >
              <Select placeholder="Select position" options={positionOptions} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="level"
              label="Level"
              rules={[{ required: true, message: "Please select level" }]}
            >
              <Select placeholder="Select level">
                {[
                  "Entry-Level",
                  "Junior",
                  "Mid-Level",
                  "Senior",
                  "Lead",
                  "Manager",
                  "Executive",
                ].map((level) => (
                  <Option key={level} value={level}>
                    {level}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="experience"
              label="Experience (Years)"
              rules={[
                {
                  required: true,
                  message: "Please enter years of experience",
                },
                {
                  validator: (_, value) => {
                    if (value && !/^\d*\.?\d+$/.test(value)) {
                      return Promise.reject(
                        "Must be a valid number (e.g., 2 or 2.5)"
                      );
                    }
                    if (value && parseFloat(value) < 0) {
                      return Promise.reject("Experience cannot be negative");
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input placeholder="e.g., 5" type="number" step="0.5" min="0" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="educationBackground"
              label="Education Background"
              rules={[{ required: true, message: "Please enter education" }]}
            >
              <Input placeholder="e.g., BSc Computer Science" />
            </Form.Item>
          </Col>
        </Row>

        <Divider plain orientation="left">
          Skills
        </Divider>
        <Form.Item
          name="skills"
          label="Technical Skills"
          rules={[{ required: true, message: "Please enter skills" }]}
        >
          <Select
            mode="tags"
            placeholder="Add skills (e.g., JavaScript, React)"
            style={{ width: "100%" }}
          >
            {[
              "JavaScript",
              "React",
              "Node.js",
              "Python",
              "Java",
              "C#",
              "SQL",
            ].map((skill) => (
              <Option key={skill} value={skill}>
                {skill}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Divider plain orientation="left">
          Recruitment Details
        </Divider>
        <Form.Item
          name="source"
          label="Source"
          rules={[{ required: true, message: "Please enter source" }]}
        >
          <Input placeholder="e.g., LinkedIn, Referral" />
        </Form.Item>

        <Divider plain orientation="left">
          Additional Information
        </Divider>
        <Form.Item
          name="notes"
          label="Notes"
          rules={[
            {
              validator: (_, value) =>
                value && value.length > 150
                  ? Promise.reject("Notes cannot exceed 150 characters")
                  : Promise.resolve(),
            },
          ]}
        >
          <Input.TextArea
            rows={4}
            maxLength={150}
            showCount={{
              formatter: ({ count, maxLength }) => `${count}/${maxLength}`,
            }}
            placeholder="Any additional notes about the candidate..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CandidateFormModal;
