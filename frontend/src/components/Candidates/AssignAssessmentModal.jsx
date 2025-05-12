import React, { useEffect, useState } from "react";
import { Modal, Form, Select, DatePicker, Button, message } from "antd";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment-timezone";
import {
  addAssessmentToCandidate,
  fetchCandidates,
} from "../../features/candidate/candidateSlice";
import { fetchAssessments } from "../../features/assessment/assessmentSlice";
import { fetchUsers } from "../../features/user/userSlice";
import EmailTemplateSelector from "../common/EmailTemplate";

const { Option } = Select;
const NEPAL_TIMEZONE = "Asia/Kathmandu";

const AssignAssessmentModal = ({ candidate }) => {
  const dispatch = useDispatch();

  const candidates = useSelector((state) => state.candidates.data);
  const assessments = useSelector((state) => state.assessments.data);
  const users = useSelector((state) => state.users.data);

  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);

  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);

  const eligibleCandidates = candidates.filter((c) => {
    const statusEligible = ["Assessment Evaluated", "Applied"].includes(
      c.currentStatus
    );
    console.log(c.assessments);
    const hasAlreadyAssessment = c.assessments?.some(
      (a) => a.assessmentId === selectedAssessmentId
    );
    return statusEligible && (!selectedAssessmentId || !hasAlreadyAssessment);
  });

  useEffect(() => {
    if (visible) {
      // Initialize form values
      form.setFieldsValue({
        scheduledDate: getNextThursdayAtTwo(),
      });

      // Fetch data
    } else {
      // Reset form when modal closes
      form.resetFields();
      setSelectedCandidateIds([]);
      setSelectedAssessmentId(null);
    }
    if (!candidates || candidates.length == 0) dispatch(fetchCandidates());
    if (!assessments || assessments.length == 0) dispatch(fetchAssessments());
    if (!users || users.length == 0) dispatch(fetchUsers());
  }, []); // Only depend on visible

  // Move stable functions outside the component
  const getNextThursdayAtTwo = () => {
    const now = moment().tz(NEPAL_TIMEZONE);
    const currentWeekday = now.day();
    const daysUntilThursday = (4 - currentWeekday + 7) % 7 || 7;
    return now
      .add(daysUntilThursday, "days")
      .set({ hour: 14, minute: 0, second: 0, millisecond: 0 });
  };

  const handleSubmit = async (values) => {
    const candidateIds = candidate ? [candidate._id] : selectedCandidateIds;

    if (!candidateIds || candidateIds.length === 0) {
      message.error("Please select at least one candidate!");
      return;
    }

    const assessmentData = {
      ...values,
      scheduledDate: moment(values.scheduledDate).utc().format(),
    };

    try {
      await Promise.all(
        candidateIds.map((id) =>
          dispatch(
            addAssessmentToCandidate({ candidateId: id, assessmentData })
          ).unwrap()
        )
      );
      message.success("Assessment(s) assigned successfully!");
      setVisible(false);
      form.resetFields();
      setSelectedCandidateIds([]);
    } catch (error) {
      console.log(error);
      message.error(error || "Failed to assign assessment(s).");
    }
  };

  console.log("hey");

  return (
    <>
      <Button
        type="primary"
        onClick={() => setVisible(true)}
        disabled={!candidate && eligibleCandidates.length === 0}
      >
        Add Assessment
      </Button>

      <Modal
        title={`Assign Assessment${
          candidate ? ` to ${candidate.fullName}` : ""
        }`}
        open={visible}
        onCancel={() => {
          setVisible(false);
          form.resetFields();
          setSelectedCandidateIds(null);
        }}
        onOk={() => {
          form
            .validateFields()
            .then((values) => {
              const hasSelectedCandidates =
                candidate ||
                (selectedCandidateIds && selectedCandidateIds.length > 0);

              if (!hasSelectedCandidates) {
                message.error("Please select at least one candidate!");
                return;
              }

              handleSubmit(values);
            })
            .catch((error) => {
              if (error.errorFields && error.errorFields.length > 0) {
                const firstErrorMsg = error.errorFields[0].errors[0];
                message.error(firstErrorMsg);
              } else {
                message.error("Validation Error.");
              }
              console.error("Validation Failed:", error);
            });
        }}
        centered
        okText={"Submit"}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            scheduledDate: getNextThursdayAtTwo(),
          }}
        >
          <Form.Item
            name="assessmentId"
            label="Assessment"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Select Assessment"
              onChange={(val) => setSelectedAssessmentId(val)}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {assessments.map((assessment) => (
                <Option key={assessment._id} value={assessment._id}>
                  {assessment.assessmentName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {!candidate && (
            <Form.Item
              name="candidateIds"
              label="Select Candidates"
              rules={[{ required: true, message: "Please select candidates" }]}
            >
              <Select
                mode="multiple"
                placeholder="Select eligible candidates"
                value={selectedCandidateIds}
                onChange={(value) => setSelectedCandidateIds(value)}
                disabled={!selectedAssessmentId}
              >
                {eligibleCandidates.map((c) => (
                  <Option key={c._id} value={c._id}>
                    {c.fullName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="scheduledDate"
            label="Scheduled Date"
            rules={[{ required: true, message: "Please select a date!" }]}
          >
            <DatePicker
              showTime
              style={{ width: "100%" }}
              format="YYYY-MM-DD HH:mm"
              placeholder="Select date and time"
            />
          </Form.Item>

          <Form.Item
            name="assignedEvaluatorId"
            label="Evaluator"
            rules={[{ required: true, message: "Please select an evaluator!" }]}
          >
            <Select placeholder="Select an evaluator">
              {users
                .filter((u) => u.role.toLowerCase() == "evaluator")
                .map((u) => (
                  <Option key={u._id} value={u._id}>
                    {u.fullName}
                  </Option>
                ))}
            </Select>
          </Form.Item>
          <EmailTemplateSelector />
        </Form>
      </Modal>
    </>
  );
};

export default AssignAssessmentModal;
