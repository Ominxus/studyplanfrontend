import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const STUDY_PLAN_API = `${API_BASE_URL}/api/student/plans`;

export const generateStudyPlan = async (request) => {
  const response = await axios.post(
    `${STUDY_PLAN_API}/generate`,
    request
  );

  return response.data;
};

export const getLatestStudyPlan = async () => {
  const response = await axios.get(
    `${STUDY_PLAN_API}/latest`
  );

  return response.data;
};
