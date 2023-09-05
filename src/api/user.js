import axios from "axios";
const baseUrl = import.meta.env.VITE_API_URL;

export const emailExist = async (email) => {
  try {
    const res = await axios({
      method: "GET",
      url: `${baseUrl}auth/user/${email}`,
    });
    return res;
  } catch (error) {
    throw error; // Rethrow the error for handling at a higher level
  }
};
// For forgot password page
export const emailValid = async (email) => {
  try {
    const res = await axios({
      method: "GET",
      url: `${baseUrl}auth/user/${email}`,
    });
    if (res.status === 205) {
      return true;
    }
  } catch (error) {
    throw error; // Rethrow the error for handling at a higher level
  }
};
export const signUp = async (email, password) => {
  try {
    const res = await axios.post(baseUrl + "auth/signup", {
      email: email,
      password: password,
    });

    return res.data;
  } catch (error) {
    throw error; // Rethrow the error for handling at a higher level
  }
};

export const signIn = async (email, password) => {
  //   validate form data
  console.log(email, password);
  if (!email || !password) {
    throw new Error("Email and password are required !");
  }

  try {
    const res = await axios.post(baseUrl + "auth/signin", {
      email: email,
      password: password,
    });

    return res.data;
  } catch (error) {
    throw error; // Rethrow the error for handling at a higher level
  }
};
