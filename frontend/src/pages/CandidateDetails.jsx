import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  completeCandidateAssessment,
  completeCandidateInterview,
  fetchCandidates,
  updateCandidateAssessment,
  updateCandidateInterview,
} from "../features/candidate/candidateSlice";
import {
  Card,
  Tabs,
  Button,
  Steps,
  message,
  Tag,
  Avatar,
  Space,
  Flex,
  Typography,
  Divider,
  Spin,
  Descriptions,
} from "antd";
import {
  UserOutlined,
  ArrowLeftOutlined,
  MailOutlined,
  PhoneOutlined,
  SolutionOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import CandidateProfile from "../components/Candidates/CandidateProfile";
import AssignAssessmentModal from "../components/Candidates/AssignAssessmentModal";
import ScheduleInterviewModal from "../components/Candidates/ScheduleInterviewModal";
import { fetchAssessments } from "../features/assessment/assessmentSlice";
import { fetchInterviews } from "../features/interview/interviewSlice";
import { fetchUsers } from "../features/user/userSlice";
import EvaluateAssessmentModal from "../components/Candidates/EvaluateAssessmentModal";
import EvaluateInterviewModal from "../components/Candidates/EvaluateInterviewModal";
import CandidateOffer from "../components/Candidates/CandidateOffer";
import { fetchPositions } from "../features/position/positionSlice";
import CandidateOfferStatusModal from "../components/Candidates/CandidateOfferStatusModal";
import CandidateHireRejectModal from "../components/Candidates/CandidateHireRejectModal";
import dayjs from "dayjs";
import NotFoundPage from "../components/NotFoundPage";

const { TabPane } = Tabs;
const { Text } = Typography;

const CandidateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Selectors
  const { data: candidates, loading } = useSelector(
    (state) => state.candidates
  );
  const candidate = candidates.find((c) => c._id === id);
  const assessments = useSelector((state) => state.assessments.data);
  const interviews = useSelector((state) => state.interviews.data);
  const users = useSelector((state) => state.users.data);
  const positions = useSelector((state) => state.positions.data);
  const { _id: userId, role: userRole } = useSelector(
    (state) => state.auth.user
  );

  // State
  const [activeTabKey, setActiveTabKey] = useState("1");
  const [isEvaluateAssessmentOpen, setIsEvaluateAssessmentOpen] =
    useState(false);
  const [isEvaluateInterviewOpen, setIsEvaluateInterviewOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [selectedInterview, setSelectedInterview] = useState(null);

  // Derived values
  const eventType = location.state?.type?.toLowerCase();

  // Memoized values
  const isFinalStage = useMemo(() => {
    return ["Offer Accepted", "Offer Rejected", "Hired", "Rejected"].some((s) =>
      candidate?.currentStatus?.includes(s)
    );
  }, [candidate?.currentStatus]);

  const steps = useMemo(
    () => [
      {
        title: "Applied",
        key: "applied",
        status: candidate?.currentStatus === "Applied" ? "process" : "finish",
      },
      {
        title: candidate?.currentStatus?.includes("Assessment")
          ? candidate.currentStatus
          : "Assessment",
        key: "assessment",
        status: getStepStatus(candidate?.assessments, "assessment"),
      },
      {
        title: candidate?.currentStatus?.includes("Interview")
          ? candidate.currentStatus
          : "Interview",
        key: "interview",
        status: getStepStatus(candidate?.interviews, "interview"),
      },
      {
        title: isFinalStage ? candidate?.currentStatus : "Offer",
        key: "offer",
        status: isFinalStage
          ? candidate?.currentStatus?.includes("Rejected")
            ? "error"
            : "finish"
          : "wait",
      },
    ],
    [candidate, isFinalStage]
  );

  const currentStep = useMemo(
    () =>
      steps.findIndex((step) => candidate?.currentStatus?.includes(step.title)),
    [steps, candidate]
  );

  // Effects
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
    const status = candidate?.currentStatus || "";
    if (status.includes("Assessment")) {
      setActiveTabKey("2");
    } else if (status.includes("Interview")) {
      setActiveTabKey("3");
    } else if (["Offer Extended", "Offer Accepted", "Hired"].includes(status)) {
      setActiveTabKey("4");
    } else {
      setActiveTabKey("1");
    }
  }, [candidate?.currentStatus]);

  useEffect(() => {
    const fetchRequiredData = async () => {
      const promises = [];
      if (!candidates || candidates.length === 0) {
        promises.push(dispatch(fetchCandidates()));
      }
      if (!assessments || assessments.length === 0) {
        promises.push(dispatch(fetchAssessments()));
      }
      if (!interviews || interviews.length === 0) {
        promises.push(dispatch(fetchInterviews()));
      }
      if (!users || users.length === 0) {
        promises.push(dispatch(fetchUsers()));
      }
      if (!positions || positions.length === 0) {
        promises.push(dispatch(fetchPositions()));
      }
      await Promise.all(promises);
    };

    fetchRequiredData();
  }, [dispatch, id]);

  // Helper functions
  function getStepStatus(stageData, type) {
    if (!stageData?.length) return "waiting";

    const lastItem = stageData[stageData.length - 1];
    if (lastItem.status === "Evaluated") return "finish";
    if (lastItem.status === "Cancelled") return "error";
    if (lastItem.status === "Scheduled" || lastItem.status === "Pending")
      return "process";

    return "wait";
  }

  const getStatusTagColor = useCallback((status) => {
    switch (status) {
      case "Scheduled":
        return "blue";
      case "In Progress":
        return "orange";
      case "Completed":
        return "green";
      case "Evaluated":
        return "purple";
      case "Cancelled":
        return "red";
      default:
        return "orange";
    }
  }, []);

  const getOfferStatusColor = useCallback((status) => {
    switch (status) {
      case "Pending":
        return "gold";
      case "Accepted":
        return "green";
      case "Rejected":
        return "red";
      default:
        return "default";
    }
  }, []);

  // Handlers
  const handleEvaluationAssessment = async (values) => {
    try {
      await dispatch(
        updateCandidateAssessment({
          candidateId: id,
          assessmentId: selectedAssessment.assessmentId,
          assessmentData: values,
        })
      ).unwrap();
      setActiveTabKey("2");
      setIsEvaluateAssessmentOpen(false);
      message.success("Assessment evaluated successfully");
    } catch (error) {
      message.error(error || "Failed to evaluate assessment");
    }
  };

  const handleEvaluationInterview = async (values) => {
    try {
      await dispatch(
        updateCandidateInterview({
          candidateId: id,
          interviewId: selectedInterview.interviewId,
          interviewData: values,
        })
      ).unwrap();
      setActiveTabKey("3");
      setIsEvaluateInterviewOpen(false);
      message.success("Interview evaluated successfully");
    } catch (error) {
      message.error(error || "Failed to evaluate interview");
    }
  };

  const handleAssessmentCompleted = async (assessmentId) => {
    try {
      await dispatch(
        completeCandidateAssessment({ candidateId: id, assessmentId })
      ).unwrap();
      message.success("Assessment marked as completed");
    } catch (error) {
      message.error(error || "Failed to mark assessment as completed");
    }
  };

  const handleInterviewCompleted = async (interviewId) => {
    try {
      await dispatch(
        completeCandidateInterview({ candidateId: id, interviewId })
      ).unwrap();
      message.success("Interview marked as completed");
    } catch (error) {
      message.error(error || "Failed to mark interview as completed");
    }
  };

  // Early returns
  if (!candidate && !loading) {
    return <NotFoundPage />;
  }

  if (loading) {
    return <Spin fullscreen />;
  }

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
              <Avatar size={40} icon={<UserOutlined />} />
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
        <Descriptions
          column={{ xs: 1, sm: 2, md: 4 }}
          layout="vertical"
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Descriptions.Item label={<Text strong>Email</Text>}>
            <Space>
              <MailOutlined />
              <Text>{candidate.email}</Text>
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label={<Text strong>Phone</Text>}>
            <Space>
              <PhoneOutlined />
              <Text>{candidate.phoneNumber || "N/A"}</Text>
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label={<Text strong>Position</Text>}>
            <Space>
              <SolutionOutlined />
              <Text>{candidate.appliedPosition}</Text>
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label={<Text strong>Applied Date</Text>}>
            <Space>
              <CalendarOutlined />
              <Text>
                {dayjs(candidate.applicationDate).format("MMMM D, YYYY")}
              </Text>
            </Space>
          </Descriptions.Item>
        </Descriptions>
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

        <Tabs
          activeKey={activeTabKey}
          onChange={setActiveTabKey}
          items={[
            {
              key: "1",
              label: "Basic Information",
              children: <CandidateProfile candidate={candidate} />,
            },
            {
              key: "2",
              label: "Assessments",
              children: (
                <>
                  {(candidate.currentStatus === "Applied" ||
                    candidate.currentStatus === "Assessment Evaluated") && (
                    <div style={{ marginBottom: "16px" }}>
                      <AssignAssessmentModal candidate={candidate} />
                    </div>
                  )}

                  {candidate.assessments?.length > 0 ? (
                    candidate.assessments.map((assessment, index) => (
                      <Card
                        key={index}
                        title={
                          <Flex justify="space-between" align="center">
                            <Space>
                              {assessment.assessmentName}
                              <Tag color={getStatusTagColor(assessment.status)}>
                                {assessment.status}
                              </Tag>
                            </Space>
                            <Flex gap="small">
                              {candidate.currentStatus ==
                                "Assessment Scheduled" &&
                                assessment.status == "Scheduled" && (
                                  <Button
                                    type="primary"
                                    onClick={() =>
                                      handleAssessmentCompleted(
                                        assessment.assessmentId
                                      )
                                    }
                                    disabled={
                                      !(
                                        userRole === "hr" ||
                                        userRole === "admin" ||
                                        (userRole === "evaluator" &&
                                          userId ===
                                            assessment.assignedEvaluatorId)
                                      ) ||
                                      !(
                                        assessment.status === "Scheduled" ||
                                        assessment.status === "In Progress"
                                      )
                                    }
                                  >
                                    Mark Completed
                                  </Button>
                                )}

                              {(candidate.currentStatus ==
                                "Assessment Completed" ||
                                candidate.currentStatus ==
                                  "Assessment Scheduled") &&
                                assessment.status == "Completed" && (
                                  <Button
                                    type="primary"
                                    onClick={() => {
                                      setSelectedAssessment(assessment);
                                      setIsEvaluateAssessmentOpen(true);
                                    }}
                                    disabled={
                                      !(
                                        userRole === "hr" ||
                                        userRole === "admin" ||
                                        (userRole === "evaluator" &&
                                          userId ===
                                            assessment.assignedEvaluatorId)
                                      ) || assessment.status !== "Completed"
                                    }
                                  >
                                    Evaluate
                                  </Button>
                                )}
                            </Flex>
                          </Flex>
                        }
                        style={{ marginBottom: "16px" }}
                      >
                        <Space direction="vertical">
                          <p>
                            <strong>Evaluator:</strong> {assessment.evaluatedBy}
                          </p>
                          <p>
                            <strong>Scheduled Date:</strong>{" "}
                            {dayjs(assessment.scheduledDate).format(
                              "MMMM D, YYYY h:mm A"
                            )}
                          </p>
                          {assessment.evaluationDate && (
                            <p>
                              <strong>Evaluation Date:</strong>{" "}
                              {dayjs(assessment.evaluationDate).format(
                                "MMMM D, YYYY h:mm A"
                              )}
                            </p>
                          )}
                          <p>
                            <strong>Score:</strong>{" "}
                            {assessment?.score !== undefined
                              ? `${assessment.score}/${assessment.maxScore}`
                              : "N/A"}
                          </p>
                        </Space>
                      </Card>
                    ))
                  ) : (
                    <p>No assessments available.</p>
                  )}
                </>
              ),
            },
            {
              key: "3",
              label: "Interviews",
              children: (
                <>
                  {(candidate.currentStatus === "Interview Evaluated" ||
                    candidate.currentStatus === "Assessment Evaluated") && (
                    <div style={{ marginBottom: "16px" }}>
                      <ScheduleInterviewModal candidate={candidate} />
                    </div>
                  )}

                  {candidate.interviews?.length > 0 ? (
                    candidate.interviews.map((interview, index) => (
                      <Card
                        title={
                          <Flex justify="space-between" align="center">
                            <Space>
                              {interview.interviewName}
                              <Tag color={getStatusTagColor(interview.status)}>
                                {interview.status}
                              </Tag>
                            </Space>
                            <Flex gap="small">
                              {(interview.status === "Scheduled" ||
                                interview.status === " In Progress") && (
                                <Button
                                  type="primary"
                                  onClick={() =>
                                    handleInterviewCompleted(
                                      interview.interviewId
                                    )
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
                        <Space direction="vertical">
                          <p>
                            <strong>Interviewer:</strong>{" "}
                            {interview.interviewerName}
                          </p>
                          <p>
                            <strong>Scheduled On:</strong>{" "}
                            {dayjs(interview.scheduledDatetime).format(
                              "MMMM D, YYYY h:mm A"
                            )}
                          </p>
                         <p>
  {interview.interviewType !== "Online" ? (
    <>
      <strong>Location:</strong> {interview.interviewLocation}
    </>
  ) : (
    <>
      <strong>Link:</strong> {interview.interviewLink}
    </>
  )}
</p>

                          <p>
                            <strong>Score:</strong>{" "}
                            {interview?.score !== undefined
                              ? `${interview.score}/${interview.maxScore}`
                              : "N/A"}
                          </p>
                        </Space>
                      </Card>
                    ))
                  ) : (
                    <p>No interviews scheduled.</p>
                  )}
                </>
              ),
            },
            {
              key: "4",
              label: "Offer",
              children: (
                <>
                  {candidate.offer ? (
                    <Card
                      title={
                        <Flex justify="space-between" align="center">
                          <Space>
                            {candidate.offer.offeredPositionName}
                            <Tag
                              color={getOfferStatusColor(
                                candidate.offer.offerStatus
                              )}
                            >
                              {candidate.offer.offerStatus}
                            </Tag>
                          </Space>
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
                      <Space direction="vertical">
                        <p>
                          <strong>Salary:</strong> NRP {candidate.offer.salary}
                        </p>
                        <p>
                          <strong>Offered Date:</strong>{" "}
                          {dayjs(candidate.offer.offerDate).format(
                            "MMMM D, YYYY"
                          )}
                        </p>
                        {candidate.offer?.acceptanceDate && (
                          <p>
                            <strong>Offered Date:</strong>{" "}
                            {dayjs(candidate.offer.acceptanceDate).format(
                              "MMMM D, YYYY"
                            )}
                          </p>
                        )}
                        {candidate.offer?.rejectionDate && (
                          <p>
                            <strong>Offered Date:</strong>{" "}
                            {dayjs(candidate.offer.rejectionDate).format(
                              "MMMM D, YYYY"
                            )}
                          </p>
                        )}
                      </Space>
                    </Card>
                  ) : (
                    <CandidateOffer
                      candidate={candidate}
                      positions={positions}
                    />
                  )}
                </>
              ),
            },
          ]}
        />

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
