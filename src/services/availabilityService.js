import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const AVAILABILITY_API = `${API_BASE_URL}/api/student/availability`;

export const getAvailability = async () => {
  const response = await axios.get(AVAILABILITY_API);
  return response.data;
};

export const createAvailability = async (availability) => {
  const response = await axios.post(
    AVAILABILITY_API,
    availability
  );

  return response.data;
};

export const updateAvailability = async (
  availabilityId,
  availability
) => {
  const response = await axios.put(
    `${AVAILABILITY_API}/${availabilityId}`,
    availability
  );

  return response.data;
};

export const deactivateAvailability = async (
  availabilityId
) => {
  await axios.delete(
    `${AVAILABILITY_API}/${availabilityId}`
  );
};
