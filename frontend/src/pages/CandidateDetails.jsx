import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  addAssessmentToCandidate,
  addInterviewToCandidate,
  completeCandidateAssessment,
  completeCandidateInterview,
  fetchCandidateById,
  fetchCandidates,
  updateCandidateAssessment,
  updateCandidateInterview,
  updateOfferStatus,
} from "../features/candidate/candidateSlice";
import {
  Card,
  Tabs,
  Button,
  Steps,
  message,
  Avatar,
  Space,
  Flex,
  Typography,
  Divider,
} from "antd";
import { UserOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import CandidateProfile from "../components/Candidates/CandidateProfile";
import AssignAssessmentModal from "../components/Candidates/AssignAssessmentModal";
import ScheduleInterviewModal from "../components/Candidates/ScheduleInterviewModal";
import { fetchAssessments } from "../features/assessment/assessmentSlice";
import { fetchInterviews } from "../features/interview/interviewSlice";
import { fetchUsers } from "../features/user/userSlice";
import EvaluateAssessmentModal from "../components/Candidates/EvaluateAssessmentModal";
import EvaluateInterviewModal from "../components/Candidates/EvaluateInterviewModal";
import CandidiateOffer from "../components/Candidates/CandidateOffer";
import { fetchPositions } from "../features/position/positionSlice";
import CandidateOffer from "../components/Candidates/CandidateOffer";
import CandidateOfferStatusModal from "../components/Candidates/CandidateOfferStatusModal";
import CandidateHireRejectModal from "../components/Candidates/CandidateHireRejectModal";

const { TabPane } = Tabs;
const { Text } = Typography;

const CandidateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const candidate = useSelector((state) =>
    state.candidates.data.find((c) => c._id === id)
  );
  const assessments = useSelector((state) => state.assessments.data);
  const interviews = useSelector((state) => state.interviews.data);
  const users = useSelector((state) => state.users.data);
  const positions = useSelector((state) => state.positions.data);
  const candidates = useSelector((state) => state.candidates.data);

  const eventType = location.state?.type?.toLowerCase();
  const [activeTabKey, setActiveTabKey] = useState("1");
  const [isAssignAssessmentOpen, setIsAssignAssessmentOpen] = useState(false);
  const [isScheduleInterviewOpen, setIsScheduleInterviewOpen] = useState(false);
  const [isEvaluateAssessmentOpen, setIsEvaluateAssessmentOpen] =
    useState(false);
  const [isEvaluateInterviewOpen, setIsEvaluateInterviewOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [selectedInterview, setSelectedInterview] = useState(null);

  useEffect(() => {
    if (eventType === "assessment") {
      setActiveTabKey("2");
    } else if (eventType === "interview") {
      setActiveTabKey("3");
    } else {
      setActiveTabKey("1");
    }
  }, [eventType]);

  useEffect(() => {
    if (!candidates) {
      dispatch(fetchCandidates());
    }
    if (!candidate) {
      dispatch(fetchCandidateById(id));
    }
    if (!assessments || assessments.length === 0) {
      dispatch(fetchAssessments());
    }
    if (!interviews || interviews.length === 0) {
      dispatch(fetchInterviews());
    }
    if (!users || users.length === 0) {
      dispatch(fetchUsers());
    }
    if (!positions || positions.length === 0) {
      dispatch(fetchPositions());
    }
  }, [dispatch, id, candidate, assessments, interviews, users, positions]);

  if (!candidate) {
    return <div>Loading candidate details...</div>;
  } else {
    console.log(candidate);
  }

  const getStepStatus = (stageData, type) => {
    if (!stageData?.length) return "waiting";

    const lastItem = stageData[stageData.length - 1];
    if (lastItem.status === "Evaluated") return "finish";
    if (lastItem.status === "Cancelled") return "error";
    if (lastItem.status === "Scheduled" || lastItem.status === "Pending")
      return "process";

    return "wait";
  };

  const isFinalStage = (status) =>
    ["Offer Accepted", "Offer Rejected", "Hired", "Rejected"].some((s) =>
      status.includes(s)
    );

  const steps = [
    {
      title: "Applied",
      key: "applied",
      status: candidate.currentStatus === "Applied" ? "process" : "finish",
    },
    {
      title: candidate.currentStatus.includes("Assessment")
        ? candidate.currentStatus
        : "Assessment",
      key: "assessment",
      status: getStepStatus(candidate.assessments, "assessment"),
    },
    {
      title: candidate.currentStatus.includes("Interview")
        ? candidate.currentStatus
        : "Interview",
      key: "interview",
      status: getStepStatus(candidate.interviews, "interview"),
    },
    {
      title: isFinalStage(candidate.currentStatus)
        ? candidate.currentStatus
        : "Offer",
      key: "offer",
      status: isFinalStage(candidate.currentStatus)
        ? candidate.currentStatus.includes("Rejected")
          ? "error"
          : "finish"
        : "wait",
    },
  ];

  // Determine the current step
  const currentStep = steps.findIndex((step) =>
    candidate.currentStatus.includes(step.title)
  );

  const handleEvaluationAssessment = async (values) => {
    try {
      dispatch(
        updateCandidateAssessment({
          candidateId: id,
          assessmentId: selectedAssessment.assessmentId,
          assessmentData: values,
        })
      ).unwrap();
      setActiveTabKey("2");
      setIsEvaluateAssessmentOpen(false);
      message.success("Assessment Evaluated successfully");
    } catch (error) {
      message.error("Failed to evaluate assignment");
    }
  };

  const handleScheduleInterview = async (values) => {
    try {
      // Call API to schedule interview
      dispatch(
        addInterviewToCandidate({ candidateId: id, interviewData: values })
      );
      message.success("Interview scheduled successfully!");
      setIsScheduleInterviewOpen(false);
    } catch (err) {
      message.error("Failed to schedule interview.");
    }
  };

  const handleEvaluationInterview = async (values) => {
    try {
      dispatch(
        updateCandidateInterview({
          candidateId: id,
          interviewId: selectedInterview.interviewId,
          interviewData: values,
        })
      ).unwrap();
      setActiveTabKey("3");
      message.success("Interview Evaluated successfully");
      setIsEvaluateInterviewOpen(false);
    } catch (error) {
      message.error("Failed to add interview");
    }
  };

  const handleAssessmentCompleted = (assessmentId) => {
    try {
      dispatch(
        completeCandidateAssessment({ candidateId: id, assessmentId })
      ).unwrap();
      message.success("Assessment Marked as Completed");
    } catch (error) {
      message.error("Failed to marked assessment as completed.");
    }
  };
  const handleInterviewCompleted = (interviewId) => {
    try {
      dispatch(
        completeCandidateInterview({ candidateId: id, interviewId })
      ).unwrap();
      message.success("Interview Marked as Completed");
    } catch (error) {
      message.error("Failed to marked interview as completed.");
    }
  };

  return (
    <div
      style={{
        width: "100%",
        margin: "0 auto",
      }}
    >
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() =>
          navigate("/candidates", {
            state: { pagination: location.state?.pagination },
          })
        }
        style={{ marginBottom: 16 }}
      >
        Candidates List
      </Button>

      <Card
        title={
          <Flex justify="space-between" align="center">
            <Flex align="center" gap="middle">
              <Avatar
                size={40}
                src={candidate.photoUrl}
                icon={<UserOutlined />}
              />
              <span>
                {candidate.fullName} - {candidate.level}
              </span>
            </Flex>
            <Flex gap="small">
              <CandidateHireRejectModal
                candidate={candidate}
                positionId={candidate.offer?.offeredPositionId}
              />
            </Flex>
          </Flex>
        }
        style={{
          width: "100%",
          overflowY: "auto",
          scrollbarGutter: "stable",
        }}
      >
        <Space direction="vertical" size={4}>
          <Text>
            <strong>Email:</strong> {candidate.email}
          </Text>
          <Text>
            <strong>Phone:</strong> {candidate.phoneNumber}
          </Text>
          <Text>
            <strong>Applied Position:</strong> {candidate.appliedPosition}
          </Text>
          <Text>
            <strong>Applied Date:</strong> {candidate.applicationDate}
          </Text>
        </Space>
        <Divider />
        {/* Steps */}
        <Steps
          current={currentStep}
          style={{ margin: "16px 0" }}
          size="small"
          direction="horizontal"
        >
          {steps.map((step) => (
            <Steps.Step
              key={step.key}
              status={step.status}
              title={step.title}
            />
          ))}
        </Steps>
        <Divider />

        <Tabs activeKey={activeTabKey} onChange={setActiveTabKey}>
          {/* Basic Information Section */}
          <TabPane tab="Basic Information" key="1">
            <CandidateProfile candidate={candidate} />
          </TabPane>

          {/* Assessments Section */}
          <TabPane tab="Assessments" key="2">
            {(candidate.currentStatus === "Applied" ||
              candidate.currentStatus === "Assessment Evaluated") && (
              <div style={{ marginBottom: "16px" }}>
                <AssignAssessmentModal candidate={candidate} />
              </div>
            )}

            {/* Display candidate's assessments */}
            {candidate.assessments && candidate.assessments.length > 0 ? (
              candidate.assessments.map((assessment, index) => (
                <Card
                  key={index}
                  title={
                    <Flex justify="space-between" align="center">
                      {assessment.assessmentName}
                      <Flex gap="small">
                        {(assessment.status === "Scheduled" ||
                          assessment.status === " In Progress") && (
                          <Button
                            type="primary"
                            onClick={() =>
                              handleAssessmentCompleted(assessment.assessmentId)
                            }
                          >
                            Mark Completed
                          </Button>
                        )}
                        {assessment.status === "Completed" && (
                          <Button
                            type="primary"
                            // style={{ marginTop: 4 }}
                            onClick={() => {
                              setSelectedAssessment(assessment);
                              setIsEvaluateAssessmentOpen(true);
                            }}
                          >
                            Evaluate
                          </Button>
                        )}
                      </Flex>
                    </Flex>
                  }
                  style={{ marginBottom: "16px" }}
                >
                  <p>
                    <strong>Evaluator:</strong> {assessment.evaluatedBy}
                  </p>
                  <p>
                    <strong>Scheduled Date:</strong> {assessment.scheduledDate}
                  </p>
                  <p>
                    <strong>Status:</strong> {assessment.status}
                  </p>
                  <p>
                    <strong>Score:</strong>{" "}
                    {assessment?.score !== undefined
                      ? `${assessment.score}/${assessment.maxScore}`
                      : "N/A"}
                  </p>
                </Card>
              ))
            ) : (
              <p>No assessments available.</p>
            )}
          </TabPane>

          {/* Interviews Section */}
          <TabPane tab="Interviews" key="3">
            {(candidate.currentStatus === "Interview Evaluated" ||
              candidate.currentStatus === "Assessment Evaluated") && (
              <div style={{ marginBottom: "16px" }}>
                <ScheduleInterviewModal candidate={candidate} />
              </div>
            )}
            {/* Display candidate's interviews */}
            {candidate.interviews && candidate.interviews.length > 0 ? (
              candidate.interviews.map((interview, index) => (
                <Card
                  title={
                    <Flex justify="space-between" align="center">
                      {interview.interviewName}
                      <Flex gap="small">
                        {(interview.status === "Scheduled" ||
                          interview.status === " In Progress") && (
                          <Button
                            type="primary"
                            onClick={() =>
                              handleInterviewCompleted(interview.interviewId)
                            }
                          >
                            Mark Completed
                          </Button>
                        )}
                        {interview.status === "Completed" && (
                          <Button
                            type="primary"
                            onClick={() => {
                              setSelectedInterview(interview);
                              setIsEvaluateInterviewOpen(true);
                            }}
                          >
                            Evaluate
                          </Button>
                        )}
                      </Flex>
                    </Flex>
                  }
                  key={index}
                  style={{ marginBottom: "16px" }}
                >
                  <p>
                    <strong>Interviewer:</strong> {interview.interviewerName}
                  </p>
                  <p>
                    <strong>Scheduled On:</strong>{" "}
                    {new Date(interview.scheduledDatetime).toLocaleString()}
                  </p>
                  <p>
                    {interview.interviewType !== "Online" ? (
                      <strong>Location:</strong>
                    ) : (
                      <strong>Link:</strong>
                    )}{" "}
                    {interview.interviewLocation}
                  </p>
                  <p>
                    <strong>Status:</strong> {interview.status}
                  </p>
                  <p>
                    <strong>Score:</strong>{" "}
                    {interview?.score !== undefined
                      ? `${interview.score}/${interview.maxScore}`
                      : "N/A"}
                  </p>
                </Card>
              ))
            ) : (
              <p>No interviews scheduled.</p>
            )}
          </TabPane>

          {/* Offer Section */}
          <TabPane tab="Offer" key="4">
            {candidate.offer ? (
              <Card
                title={
                  <Flex justify="space-between" align="center">
                    {candidate.offer.offeredPositionName}
                    <Flex gap="small">
                      {candidate.offer.offerStatus === "Pending" && (
                        <CandidateOfferStatusModal
                          candidateId={candidate._id}
                        />
                      )}
                    </Flex>
                  </Flex>
                }
              >
                <p>
                  <strong>Salary:</strong> NRP {candidate.offer.salary}
                </p>
                <p>
                  <strong>Offered Date:</strong> {candidate.offer.offerDate}
                </p>
                <p>
                  <strong>Status:</strong> {candidate.offer.offerStatus}
                </p>
              </Card>
            ) : (
              <CandidateOffer candidate={candidate} positions={positions} />
            )}
          </TabPane>
        </Tabs>

        {/* Assign Assessment Modal */}
        {/* <AssignAssessmentModal /> */}

        {/* Schedule Interview Modal */}

        <EvaluateAssessmentModal
          visible={isEvaluateAssessmentOpen}
          assessment={selectedAssessment}
          onCancel={() => {
            setIsEvaluateAssessmentOpen(false);
            setSelectedAssessment(null);
          }}
          onSubmit={handleEvaluationAssessment}
        />
        <EvaluateInterviewModal
          visible={isEvaluateInterviewOpen}
          interview={selectedInterview}
          onCancel={() => {
            setIsEvaluateInterviewOpen(false);
            setSelectedInterview(null);
          }}
          onSubmit={handleEvaluationInterview}
        />
      </Card>
    </div>
  );
};

export default CandidateDetails;
