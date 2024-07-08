import axios from "axios";

export const getListings = async (
  page = 1,
  limit = 5,
  sort = "-createdAt",
  token
) => {
  const response = await axios.get(
    `/api/listing?page=${page}&limit=${limit}&sort=${sort}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};
