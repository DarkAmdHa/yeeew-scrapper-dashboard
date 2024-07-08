import axios from "axios";

export const getUser = async (token) => {
  const response = await axios.get("/api/auth/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};
