import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PREFERENCE_API = `${API_BASE_URL}/api/student/preferences`;

export const getPreferences = async () => {
  const response = await axios.get(PREFERENCE_API);
  return response.data;
};

export const updatePreferences = async (preferences) => {
  const response = await axios.put(
    PREFERENCE_API,
    preferences
  );

  return response.data;
};
