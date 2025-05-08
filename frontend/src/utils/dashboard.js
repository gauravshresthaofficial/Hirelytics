// Add these utility functions outside your component

const calculatePipelineStage = (statusCounts) => {
  if (!statusCounts) return 0;
  if (statusCounts["Hired"] > 0) return 4;
  if (statusCounts["Offer Extended"] > 0) return 3;
  if (calculateInterviewCount(statusCounts) > 0) return 2;
  if (calculateAssessmentCount(statusCounts) > 0) return 1;
  return 0;
};

const calculateAssessmentCount = (statusCounts) => {
  if (!statusCounts) return 0;
  return (
    (statusCounts["Assessment Scheduled"] || 0) +
    (statusCounts["Assessment In Progress"] || 0) +
    (statusCounts["Assessment Completed"] || 0) +
    (statusCounts["Assessment Evaluated"] || 0)
  );
};

const calculateInterviewCount = (statusCounts) => {
  if (!statusCounts) return 0;
  return (
    (statusCounts["Interview Scheduled"] || 0) +
    (statusCounts["Interview In Progress"] || 0) +
    (statusCounts["Interview Completed"] || 0) +
    (statusCounts["Interview Evaluated"] || 0)
  );
};

const getRecentActivity = (candidates) => {
  if (!candidates) return [];

  const activities = [];

  candidates.forEach((candidate) => {
    // Add assessment activities
    candidate.assessments?.forEach((assessment) => {
      activities.push({
        type: "assessment",
        candidateId: candidate._id,
        candidateName: candidate.fullName,
        description: `${assessment.status} - ${assessment.assessmentName}`,
        date: assessment.scheduledDate,
        avatar: candidate.photoUrl,
      });
    });

    // Add interview activities
    candidate.interviews?.forEach((interview) => {
      activities.push({
        type: "interview",
        candidateId: candidate._id,
        candidateName: candidate.fullName,
        description: `${interview.status} - ${interview.interviewName}`,
        date: interview.scheduledDatetime,
        avatar: candidate.photoUrl,
      });
    });
  });

  return activities
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
};

export {
  calculatePipelineStage,
  calculateAssessmentCount,
  calculateInterviewCount,
  getRecentActivity,
};
