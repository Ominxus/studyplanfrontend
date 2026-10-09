import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AI_API =
  `${API_BASE_URL}/api/student/ai`;

export const getPlanningInsight = async () => {
  const response = await axios.get(
    `${AI_API}/planning-insight`
  );

  return response.data;
};
