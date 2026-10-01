import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const DEADLINE_API = `${API_BASE_URL}/api/student/deadlines`;

export const getDeadlines = async (courseId = null) => {
  const response = await axios.get(
    DEADLINE_API,
    courseId
      ? { params: { courseId } }
      : {}
  );

  return response.data;
};

export const createDeadline = async (deadline) => {
  const response = await axios.post(
    DEADLINE_API,
    deadline
  );

  return response.data;
};

export const updateDeadline = async (
  deadlineId,
  deadline
) => {
  const response = await axios.put(
    `${DEADLINE_API}/${deadlineId}`,
    deadline
  );

  return response.data;
};

export const completeDeadline = async (deadlineId) => {
  const response = await axios.patch(
    `${DEADLINE_API}/${deadlineId}/complete`
  );

  return response.data;
};

export const cancelDeadline = async (deadlineId) => {
  await axios.delete(
    `${DEADLINE_API}/${deadlineId}`
  );
};
