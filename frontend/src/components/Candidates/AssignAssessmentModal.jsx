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

const { Option } = Select;
const NEPAL_TIMEZONE = "Asia/Kathmandu";

const AssignAssessmentModal = ({ candidate }) => {
  const dispatch = useDispatch();

  const candidates = useSelector((state) => state.candidates.data);
  const assessments = useSelector((state) => state.assessments.data);
  const users = useSelector((state) => state.users.data);

  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);

  // Filter eligible candidates
  const eligibleCandidates = candidates.filter((c) =>
    ["Assessment Evaluated", "Applied"].includes(c.currentStatus)
  );

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        scheduledDate: getNextThursdayAtTwo(),
      });
      dispatch(fetchCandidates());
      dispatch(fetchAssessments());
      dispatch(fetchUsers());
    }
  }, [visible, form, dispatch]);

  const getNextThursdayAtTwo = () => {
    const now = moment().tz(NEPAL_TIMEZONE);
    const currentWeekday = now.day();
    const daysUntilThursday = (4 - currentWeekday + 7) % 7 || 7;
    return now
      .add(daysUntilThursday, "days")
      .set({ hour: 14, minute: 0, second: 0, millisecond: 0 });
  };

  const handleSubmit = async (values) => {
    const candidateId = candidate?._id || selectedCandidateId;

    if (!candidateId) {
      message.error("Please select a candidate!");
      return;
    }

    const assessmentData = {
      ...values,
      scheduledDate: moment(values.scheduledDate).utc().format(),
    };

    try {
      await dispatch(
        addAssessmentToCandidate({ candidateId, assessmentData })
      ).unwrap();
      message.success("Assessment assigned successfully!");
      setVisible(false);
      form.resetFields();
      setSelectedCandidateId(null);
    } catch (error) {
      message.error(error || "Failed to assign assessment.");
    }
  };

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
          setSelectedCandidateId(null);
        }}
        onOk={() => {
          form
            .validateFields()
            .then((values) => {
              if (!candidate && !selectedCandidateId) {
                message.error("Please select a candidate!");
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
          {!candidate && (
            <Form.Item label="Candidate" required>
              <Select
                placeholder="Select a candidate"
                onChange={(value) => setSelectedCandidateId(value)}
                disabled={eligibleCandidates.length === 0}
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
            name="assessmentId"
            label="Assessment"
            rules={[
              { required: true, message: "Please select an assessment!" },
            ]}
          >
            <Select placeholder="Select an assessment">
              {assessments.map((a) => (
                <Option key={a._id} value={a._id}>
                  {a.assessmentName}
                </Option>
              ))}
            </Select>
          </Form.Item>

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
              {users.map((u) => (
                <Option key={u._id} value={u._id}>
                  {u.fullName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AssignAssessmentModal;
