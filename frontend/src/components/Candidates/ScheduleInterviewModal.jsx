import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Select,
  DatePicker,
  Input,
  Button,
  message,
  Space,
} from "antd";
import { useSelector, useDispatch } from "react-redux";
import dayjs from "dayjs";
import {
  addInterviewToCandidate,
  fetchCandidates,
} from "../../features/candidate/candidateSlice";
import { fetchInterviews } from "../../features/interview/interviewSlice";
import { fetchUsers } from "../../features/user/userSlice";

const { Option } = Select;

const ScheduleInterviewModal = ({ candidate }) => {
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedInterviewId, setSelectedInterviewId] = useState(null);
  const [selectedInterviewMode, setSelectedInterviewMode] = useState(null);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
  const [generatingLink, setGeneratingLink] = useState(false);

  const candidates = useSelector((state) => state.candidates.data);
  const interviews = useSelector((state) => state.interviews.data);
  const users = useSelector((state) => state.users.data);

  const eligibleCandidates = candidates.filter((c) => {
    const statusEligible = [
      "Assessment Evaluated",
      "Interview Evaluated",
    ].includes(c.currentStatus);
    const hasAlreadyInterview = c.interviews?.some(
      (a) => a.interviewId === selectedInterviewId
    );
    return statusEligible && (!selectedInterviewId || !hasAlreadyInterview);
  });

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        scheduledDatetime: dayjs()
          .add(1, "day")
          .set("hour", 10)
          .set("minute", 0),
      });

      if (!candidates || candidates.length === 0) dispatch(fetchCandidates());
      if (!interviews || interviews.length === 0) dispatch(fetchInterviews());
      if (!users || users.length === 0) dispatch(fetchUsers());
    } else {
      form.resetFields();
      setSelectedCandidateIds([]);
      setSelectedInterviewId(null);
      setSelectedInterviewMode(null);
    }
  }, [visible]);

  const generateGoogleMeetLink = () => {
    setGeneratingLink(true);
    setTimeout(() => {
      const randomId = Math.random().toString(36).substring(2, 10);
      const meetLink = `https://meet.google.com/${randomId}`;
      form.setFieldsValue({
        interviewLink: meetLink,
      });
      setGeneratingLink(false);
      message.success("Google Meet link generated!");
    }, 1000);
  };

  const handleInterviewChange = (interviewId) => {
    setSelectedInterviewId(interviewId);
    const selectedInterview = interviews.find(
      (interview) => interview._id === interviewId
    );
    const mode = interviewId === "hr" ? "Offline" : selectedInterview?.mode;
    setSelectedInterviewMode(mode);
    form.setFieldsValue({
      interviewLocation: undefined,
      interviewLink: undefined,
    });
  };

  const handleSubmit = async (values) => {
    const candidateIds = candidate ? [candidate._id] : selectedCandidateIds;

    if (!candidateIds || candidateIds.length === 0) {
      message.error("Please select at least one candidate!");
      return;
    }

    const interviewData = {
      ...values,
      interviewMode: selectedInterviewMode,
      interviewLocation:
        selectedInterviewMode === "Online"
          ? undefined
          : values.interviewLocation,
      interviewLink:
        selectedInterviewMode === "Online" ? values.interviewLink : undefined,
      scheduledDatetime: dayjs(values.scheduledDatetime).toISOString(),
    };

    try {
      await Promise.all(
        candidateIds.map((id) =>
          dispatch(
            addInterviewToCandidate({ candidateId: id, interviewData })
          ).unwrap()
        )
      );
      message.success("Interview(s) scheduled successfully!");
      setVisible(false);
      form.resetFields();
      setSelectedCandidateIds([]);
    } catch (error) {
      message.error(error || "Failed to schedule interview(s).");
    }
  };

  const disabledDate = (current) => current && current < dayjs().startOf("day");

  const disabledDateTime = (current) => {
    if (current && dayjs(current).isSame(dayjs(), "day")) {
      return {
        disabledHours: () => range(0, dayjs().hour()),
        disabledMinutes: (h) =>
          h === dayjs().hour() ? range(0, dayjs().minute()) : [],
      };
    }
    return {};
  };

  const range = (start, end) => {
    const result = [];
    for (let i = start; i <= end; i++) result.push(i);
    return result;
  };

  const handleOk = () => {
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
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedCandidateIds([]);
    setSelectedInterviewId(null);
    setSelectedInterviewMode(null);
    setVisible(false);
  };

  return (
    <>
      <Button
        type="primary"
        onClick={() => setVisible(true)}
        disabled={!candidate && eligibleCandidates.length === 0}
      >
        Schedule Interview
      </Button>

      <Modal
        title={`Schedule Interview${
          candidate ? ` for ${candidate.fullName}` : ""
        }`}
        open={visible}
        centered
        okText={"Submit"}
        onCancel={handleCancel}
        onOk={handleOk}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="interviewId"
            label="Interview"
            rules={[{ required: true, message: "Please select an interview!" }]}
          >
            <Select
              placeholder="Select an interview"
              onChange={handleInterviewChange}
            >
              {interviews.map((interview) => (
                <Option key={interview._id} value={interview._id}>
                  {interview.interviewName} ({interview.mode})
                </Option>
              ))}
              <Option value="hr">HR Interview</Option>
            </Select>
          </Form.Item>

          {!candidate && (
            <Form.Item
              name="candidateIds"
              label="Candidates"
              rules={[{ required: true, message: "Please select candidates!" }]}
            >
              <Select
                mode="multiple"
                placeholder="Select eligible candidates"
                value={selectedCandidateIds}
                onChange={setSelectedCandidateIds}
                disabled={!selectedInterviewId}
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
            name="scheduledDatetime"
            label="Scheduled Date and Time"
            rules={[
              { required: true, message: "Please select date and time!" },
            ]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: "100%" }}
              disabledDate={disabledDate}
              disabledTime={disabledDateTime}
              placeholder="Select date and time"
            />
          </Form.Item>

          {selectedInterviewMode === "Online" ? (
            <Form.Item
              name="interviewLink"
              label="Meeting Link"
              rules={[
                {
                  required: true,
                  message: "Please enter meeting link or generate one!",
                },
                { type: "url", message: "Please enter a valid URL" },
              ]}
            >
              <Space.Compact style={{ width: "100%" }}>
                <Input
                  placeholder="https://meet.google.com/..."
                  type="url"
                  value={form.getFieldValue("interviewLink")}
                  onChange={(e) =>
                    form.setFieldsValue({ interviewLink: e.target.value })
                  }
                />
                <Button
                  type="primary"
                  loading={generatingLink}
                  onClick={generateGoogleMeetLink}
                >
                  Generate Meet Link
                </Button>
              </Space.Compact>
            </Form.Item>
          ) : (
            <Form.Item
              name="interviewLocation"
              label="Interview Location"
              rules={[
                { required: true, message: "Please enter interview location!" },
              ]}
            >
              <Input placeholder="Enter physical location (e.g., Office Room 5)" />
            </Form.Item>
          )}

          <Form.Item
            name="assignedEvaluatorId"
            label="Evaluator"
            rules={[{ required: true, message: "Please select an evaluator!" }]}
          >
            <Select placeholder="Select evaluator">
              {users
                .filter((user) => user.role.toLowerCase() === "evaluator")
                .map((user) => (
                  <Option key={user._id} value={user._id}>
                    {user.fullName}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ScheduleInterviewModal;
