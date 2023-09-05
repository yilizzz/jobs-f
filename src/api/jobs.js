import axios from "axios";
const baseUrl = import.meta.env.VITE_API_URL;

export const getAllJobs = async (userId) => {
  try {
    const res = await axios({
      method: "GET",
      url: `${baseUrl}jobs/${userId}`,
    });

    return res.data;
  } catch (err) {
    throw err;
  }
};
export const modifyJob = async (jobData, id, token) => {
  try {
    const res = await axios({
      method: "PUT",
      url: `${baseUrl}jobs/${id}`,
      data: jobData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  } catch (err) {
    throw err;
  }
};
export const addJob = async (jobData, token) => {
  try {
    const res = await axios({
      method: "POST",
      url: `${baseUrl}jobs/`,
      data: jobData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  } catch (error) {
    throw error; // Rethrow the error for handling at a higher level
  }
};
export const deleteJob = async (id, token) => {
  try {
    const res = await axios({
      method: "DELETE",
      url: `${baseUrl}jobs/${id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("DeleteJob: " + res);
    return res;
  } catch (err) {
    throw err;
  }
};
export const searchJobs = async (userId, keywords) => {
  try {
    const res = await axios({
      method: "GET",
      url: `${baseUrl}jobs/search/${userId}/${keywords}`,
      params: {
        userId: userId,
        keywords: keywords,
      },
    });

    return res.data;
  } catch (err) {
    throw err;
  }
};
