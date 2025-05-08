const updateAssessmentStatus = (assessment) => {
  const now = new Date();
  const scheduledDate = assessment.scheduledDate;

  if (!scheduledDate) return assessment;

  if (assessment.status !== "Evaluated") {
    if (Math.abs(now - scheduledDate) <= 5 * 60 * 1000) {
      assessment.status = "In Progress";
    }

    if (now > new Date(scheduledDate.getTime() + 60 * 60 * 1000)) {
      if (!(assessment.score && assessment.remarks)) {
        assessment.status = "Completed";
      } else {
        assessment.status = "Evaluated";
      }
    }
  }

  if (
    assessment.score &&
    assessment.remarks &&
    assessment.status !== "Evaluated"
  ) {
    assessment.status = "Evaluated";
  }

  return assessment;
};

const updateInterviewStatus = (interview) => {
  const now = new Date();
  const scheduledDatetime = interview.scheduledDatetime;

  if (!scheduledDatetime) return interview;

  if (interview.status === "Evaluated") {
    return interview;
  }

  if (
    Math.abs(now - scheduledDatetime) <= 15 * 60 * 1000 &&
    interview.status === "Scheduled"
  ) {
    interview.status = "In Progress";
  }

  if (
    now > new Date(scheduledDatetime.getTime() + 60 * 60 * 1000) &&
    interview.status !== "Evaluated"
  ) {
    if (interview.score && interview.remarks) {
      interview.status = "Evaluated";
    } else {
      interview.status = "Completed";
    }
  }

  return interview;
};

const determineOverallStatus = (candidate) => {
  if (
    [
      "Offer Extended",
      "Offer Accepted",
      "Hired",
      "Rejected",
      "Withdrawn",
    ].includes(candidate.currentStatus)
  ) {
    return candidate.currentStatus;
  }

  if (candidate.interviews && candidate.interviews.length > 0) {
    const sortedInterviews = [...candidate.interviews].sort(
      (a, b) => a.sequence - b.sequence
    );
    const latestInterview = sortedInterviews[sortedInterviews.length - 1];

    if (latestInterview.status === "Evaluated") {
      return "Interview Evaluated";
    }

    if (latestInterview.status === "Completed") {
      return "Interview Completed";
    }

    if (latestInterview.status === "In Progress") {
      return "Interview In Progress";
    }

    if (latestInterview.status === "Scheduled") {
      return "Interview Scheduled";
    }
  }

  if (candidate.assessments && candidate.assessments.length > 0) {
    const sortedAssessments = [...candidate.assessments].sort(
      (a, b) => a.sequence - b.sequence
    );
    const latestAssessment = sortedAssessments[sortedAssessments.length - 1];

    if (
      latestAssessment.status === "Completed" &&
      (latestAssessment.score === undefined ||
        latestAssessment.remarks === undefined)
    ) {
      return "Assessment Completed";
    }

    if (
      latestAssessment.status === "Evaluated" ||
      (latestAssessment.score !== undefined &&
        latestAssessment.remarks !== undefined)
    ) {
      return "Assessment Evaluated";
    }

    if (latestAssessment.status === "In Progress") {
      return "Assessment In Progress";
    }

    if (latestAssessment.status === "Scheduled") {
      return "Assessment Scheduled";
    }
  }

  if (candidate.currentStatus === "Offer Extended") {
    return "Offer Extended";
  }
  if (candidate.currentStatus === "Offer Accepted") {
    return "Offer Accepted";
  }

  return candidate.currentStatus;
};

const canScheduleAssessment = (candidate) => {
  if (candidate.currentStatus === "Rejected") {
    return { canSchedule: false, reason: "Candidate has been rejected" };
  }

  if (!candidate.assessments || candidate.assessments.length === 0) {
    return { canSchedule: true };
  }

  const sortedAssessments = [...candidate.assessments].sort(
    (a, b) => a.sequence - b.sequence
  );
  const lastAssessment = sortedAssessments[sortedAssessments.length - 1];

  if (lastAssessment.status !== "Evaluated") {
    const missingFields = [];
    if (lastAssessment.score === undefined || lastAssessment.score === null) {
      missingFields.push("score");
    }
    if (
      lastAssessment.remarks === undefined ||
      lastAssessment.remarks === null
    ) {
      missingFields.push("remarks");
    }

    return {
      canSchedule: false,
      reason: `Previous assessment (${
        lastAssessment.assessmentName
      }) must be fully evaluated. Missing: ${missingFields.join(", ")}`,
    };
  }

  return { canSchedule: true };
};

const canScheduleInterview = (candidate) => {
  if (candidate.currentStatus === "Rejected") {
    return { canSchedule: false, reason: "Candidate has been rejected" };
  }

  if (!candidate.assessments || candidate.assessments.length === 0) {
    return { canSchedule: false, reason: "Candidate has no assessments" };
  }

  const unevaluatedAssessments = candidate.assessments.filter(
    (a) => a.status !== "Evaluated"
  );

  if (unevaluatedAssessments.length > 0) {
    return {
      canSchedule: false,
      reason: `All assessments must be evaluated. ${unevaluatedAssessments.length} remaining`,
    };
  }

  if (!candidate.interviews || candidate.interviews.length === 0) {
    return { canSchedule: true };
  }

  const sortedInterviews = [...candidate.interviews].sort(
    (a, b) => a.sequence - b.sequence
  );
  const lastInterview = sortedInterviews[sortedInterviews.length - 1];

  if (lastInterview.status !== "Evaluated") {
    return {
      canSchedule: false,
      reason: `Previous interview (${lastInterview.interviewType}) must be evaluated first`,
    };
  }

  return { canSchedule: true };
};

module.exports = {
  updateAssessmentStatus,
  updateInterviewStatus,
  determineOverallStatus,
  canScheduleAssessment,
  canScheduleInterview,
};
