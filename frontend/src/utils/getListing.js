import axios from "axios";

export const getListing = async (id, token) => {
  const response = await axios.get(`/api/listing/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};
