import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const GOAL_API = `${API_BASE_URL}/api/student/goals`;

export const getGoals = async () => {
  const response = await axios.get(GOAL_API);
  return response.data;
};

export const createGoal = async (goal) => {
  const response = await axios.post(
    GOAL_API,
    goal
  );

  return response.data;
};

export const updateGoal = async (
  goalId,
  goal
) => {
  const response = await axios.put(
    `${GOAL_API}/${goalId}`,
    goal
  );

  return response.data;
};

export const completeGoal = async (goalId) => {
  const response = await axios.patch(
    `${GOAL_API}/${goalId}/complete`
  );

  return response.data;
};

export const cancelGoal = async (goalId) => {
  await axios.delete(
    `${GOAL_API}/${goalId}`
  );
};
