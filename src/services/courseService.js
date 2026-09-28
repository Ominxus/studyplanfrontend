import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const COURSE_API = `${API_BASE_URL}/api/student/courses`;

export const getCourses = async () => {
  const response = await axios.get(COURSE_API);
  return response.data;
};

export const createCourse = async (course) => {
  const response = await axios.post(COURSE_API, course);
  return response.data;
};
