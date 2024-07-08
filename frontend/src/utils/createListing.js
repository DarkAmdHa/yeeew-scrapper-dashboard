import axios from "axios";

export const createListing = async (listingData, token) => {
  const response = await axios.post(
    `/api/listing`,
    {
      data: listingData,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};
