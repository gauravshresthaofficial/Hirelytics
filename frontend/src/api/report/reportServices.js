import api from "../api";

/**
 * Fetches candidates by their current status
 * @param {string} status - The candidate status to filter by
 * @returns {Promise<Array>} Array of candidate objects
 */
export const getCandidatesByStatus = async (status) => {
  try {
    const response = await api.get(`/reports/status/${status}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching candidates by status:", error);
    throw error;
  }
};

/**
 * Fetches candidates by the position they applied for
 * @param {string} position - The position to filter candidates by
 * @returns {Promise<Array>} Array of candidate objects
 */
export const getCandidatesByPosition = async (position) => {
  try {
    const response = await api.get(`/reports/position/${position}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching candidates by position:", error);
    throw error;
  }
};

/**
 * Fetches assessment results for a specific assessment
 * @param {string} assessmentId - The ID of the assessment
 * @returns {Promise<Array>} Array of assessment result objects
 */
export const getAssessmentResults = async (assessmentId) => {
  try {
    const response = await api.get(`/reports/assessment/${assessmentId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching assessment results:", error);
    throw error;
  }
};

/**
 * Fetches interview results for a specific interview type
 * @param {string} interviewType - The type of interview
 * @returns {Promise<Array>} Array of interview result objects
 */
export const getInterviewResults = async (interviewType) => {
  try {
    const response = await api.get(`/reports/interview/${interviewType}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching interview results:", error);
    throw error;
  }
};

/**
 * Fetches count of candidates in each recruitment stage
 * @returns {Promise<Object>} Object with stage names as keys and counts as values
 */
export const getCandidatesByStageCount = async () => {
  try {
    const response = await api.get("/reports/stages");
    return response.data;
  } catch (error) {
    console.error("Error fetching stage counts:", error);
    throw error;
  }
};

/**
 * Fetches list of all evaluators
 * @returns {Promise<Array>} Array of evaluator objects
 */
export const getEvaluatorList = async () => {
  try {
    const response = await api.get("/reports/evaluators");
    return response.data;
  } catch (error) {
    console.error("Error fetching evaluator list:", error);
    throw error;
  }
};

/**
 * Fetches candidates assigned to a specific evaluator for assessments
 * @param {string} evaluatorId - The ID of the evaluator
 * @returns {Promise<Array>} Array of candidate objects
 */
export const getCandidatesByEvaluatorForAssessment = async (evaluatorId) => {
  try {
    const response = await api.get(
      `/reports/evaluator/${evaluatorId}/assessments`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching candidates by evaluator for assessment:",
      error
    );
    throw error;
  }
};

/**
 * Fetches candidates assigned to a specific evaluator for interviews
 * @param {string} evaluatorId - The ID of the evaluator
 * @returns {Promise<Array>} Array of candidate objects
 */
export const getCandidatesByEvaluatorForInterview = async (evaluatorId) => {
  try {
    const response = await api.get(
      `/reports/evaluator/${evaluatorId}/interviews`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching candidates by evaluator for interview:",
      error
    );
    throw error;
  }
};

/**
 * Fetches all dashboard data in a single request (optimized version)
 * @returns {Promise<Object>} Object containing all dashboard data
 */
export const getDashboardData = async () => {
  try {
    const [stageCounts, evaluators] = await Promise.all([
      getCandidatesByStageCount(),
      getEvaluatorList(),
    ]);

    const metrics = {
      totalCandidates: Object.values(stageCounts.data).reduce(
        (sum, count) => sum + count,
        0
      ),
      candidatesInProgress:
        (stageCounts.data.assessment || 0) +
        (stageCounts.data.interview || 0) +
        (stageCounts.data.offer || 0),
      assessmentsScheduled: stageCounts.data.assessment || 0,
      interviewsScheduled: stageCounts.data.interview || 0,
      offersExtended: stageCounts.data.offer || 0,
    };

    return {
      stageCounts: stageCounts.data,
      evaluators: evaluators.data,
      metrics,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};
