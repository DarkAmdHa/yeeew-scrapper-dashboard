import { toast } from "react-toastify";
import APIContent from "./APIContent";
import { useContext, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import Spinner from "./Spinner";
import { ArrowPathIcon } from "@heroicons/react/20/solid";
import { clsx } from "yet-another-react-lightbox";

function BookingAPIData({ bookingData, listingId }) {
  const [isRefetching, setIsRefetching] = useState(false);
  const { token } = useContext(AppContext);
  const navigate = useNavigate();
  const refetchAPIData = async () => {
    if (isRefetching) return;
    setIsRefetching(true);
    try {
      const { data } = await axios.post(
        `/api/listing/${listingId}/refetch-api-data`,
        {
          apiHandle: "booking",
          ...(bookingData &&
            bookingData.id && {
              apiListingId: bookingData.id,
            }),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(data.message);

      if (data.found) {
        setTimeout(() => {
          navigate(0);
        }, 1500);
      }
    } catch (error) {
      //Handle errors
      toast.error("Failed to refetch api data");
    } finally {
      setIsRefetching(false);
    }
  };

  return (
    <div className=" py-6 sm:py-4">
      <div className="grid grid-cols-1 gap-x-2 gap-y-4 sm:grid-cols-6">
        <div className="col-span-6 flex justify-between items-center">
          <div className="block text-2xl font-medium leading-6 text-white">
            Booking API
          </div>
          <button
            onClick={refetchAPIData}
            className={clsx(
              "px-3 py-2 text-center flex gap-3 text-white bg-[#00aa6c] transition hover:bg-[#367f65] rounded-lg cursor-pointer items-center",
              isRefetching && "opacity-60 pointer-events-none"
            )}
          >
            {isRefetching ? (
              <Spinner width="w-5" height="h-5" border="border-2" />
            ) : (
              <ArrowPathIcon className="w-6" />
            )}
            Refetch From Booking.com API
          </button>
        </div>
        <div className="col-span-6 h-[1px] w-full bg-gray-500"></div>

        {bookingData ? (
          <>
            <APIContent content={bookingData.id} heading="Platform ID" />

            <APIContent content="" heading="Coordinates" />
            <APIContent
              content={
                bookingData.data.coordinates && bookingData.data.coordinates.lat
              }
              heading="Latitude"
            />
            <APIContent
              content={
                bookingData.data.coordinates &&
                bookingData.data.coordinates.long
              }
              heading="Longitude"
            />

            <APIContent content="" heading="Platform Data" />

            {bookingData.data.details && (
              <APIContent
                content={
                  <>
                    <ul className="flex  gap-4">
                      {/* Business Information */}
                      <li className="w-full p-4 border border-gray-700 rounded shadow-md">
                        <h3 className="font-semibold text-lg mb-2">
                          Hotel Details
                        </h3>
                        <p>
                          <strong>Name:</strong>{" "}
                          {bookingData.data.details.businessInformation
                            ?.hotelName || "N/A"}
                        </p>
                        <p>
                          <strong>Address:</strong>{" "}
                          {bookingData.data.details.businessInformation
                            ?.address || "N/A"}
                        </p>
                        <p>
                          <strong>City:</strong>{" "}
                          {bookingData.data.details.businessInformation?.city ||
                            "N/A"}
                        </p>
                        <p>
                          <strong>Country:</strong>{" "}
                          {bookingData.data.details.businessInformation
                            ?.country || "N/A"}
                        </p>
                        <p>
                          <strong>Rating:</strong>{" "}
                          {bookingData.data.details.businessInformation
                            ?.rating ?? "N/A"}
                        </p>
                        <p>
                          <strong>Review Count:</strong>{" "}
                          {bookingData.data.details.businessInformation
                            ?.reviewNumber || "N/A"}
                        </p>
                        <p>
                          <strong>Facilities:</strong>{" "}
                          {bookingData.data.details.businessInformation
                            ?.facilities?.length
                            ? bookingData.data.details.businessInformation.facilities.join(
                                ", "
                              )
                            : "N/A"}
                        </p>
                        <p>
                          <strong>Sustainability Level:</strong>{" "}
                          {bookingData.data.details.businessInformation
                            ?.sustainability || "N/A"}
                        </p>
                        <p>
                          <strong>Booking URL:</strong>{" "}
                          {bookingData.data.details.url ? (
                            <a
                              href={bookingData.data.details.url}
                              className="text-blue-600"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {bookingData.data.details.url}
                            </a>
                          ) : (
                            "N/A"
                          )}
                        </p>
                      </li>

                      {bookingData.data.details.price && (
                        <li className="w-full p-4 border border-gray-700 rounded shadow-md">
                          <h3 className="font-semibold text-lg mb-2">
                            Price Details
                          </h3>
                          <p>
                            <strong>Product Price:</strong>{" "}
                            {bookingData.data.details.price.productPrice
                              ? `$${bookingData.data.details.price.productPrice}`
                              : "N/A"}
                          </p>
                          <p>
                            <strong>Gross Amount Per Night:</strong>{" "}
                            {bookingData.data.details.price.grossAmountPerNight
                              ? `$${bookingData.data.details.price.grossAmountPerNight}`
                              : "N/A"}
                          </p>
                          <p>
                            <strong>All-Inclusive Amount:</strong>{" "}
                            {bookingData.data.details.price.allInclusiveAmount
                              ? `$${bookingData.data.details.price.allInclusiveAmount}`
                              : "N/A"}
                          </p>
                          <p>
                            <strong>Excluded Amount:</strong>{" "}
                            {bookingData.data.details.price.excludedAmount
                              ? `$${bookingData.data.details.price.excludedAmount}`
                              : "N/A"}
                          </p>
                          <p>
                            <strong>Gross Amount (Hotel Currency):</strong>{" "}
                            {bookingData.data.details.price
                              ?.grossAmountHotelCurrency
                              ? `${bookingData.data.details.price.grossAmountHotelCurrency} INR`
                              : "N/A"}
                          </p>
                          <p>
                            <strong>Taxes & Charges:</strong>{" "}
                            {bookingData.data.details.price.taxesAndCharges ||
                              "N/A"}
                          </p>
                        </li>
                      )}
                    </ul>
                  </>
                }
                heading=""
              />
            )}

            <APIContent
              content={
                <ul>
                  {bookingData.data.description &&
                    bookingData.data.description.map((des, index) => (
                      <li key={index}>{des}</li>
                    ))}
                </ul>
              }
              heading="Description"
            />
            <APIContent
              content={
                <ul>
                  {bookingData.data.policies &&
                    bookingData.data.policies.map((pol, index) => (
                      <li key={index}>{pol}</li>
                    ))}
                </ul>
              }
              heading="Policies"
            />
            <APIContent
              content={
                <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {bookingData.data.landmarks &&
                    bookingData.data.landmarks.closestLandmarks &&
                    bookingData.data.landmarks.closestLandmarks.map(
                      (land, index) => (
                        <li
                          key={index}
                          className="flex py-4 px-2 rounded bg-gray-700 "
                        >
                          Latitude: {land.lat} <br />
                          Longitude: {land.long} <br />
                          Name: {land.name} <br />
                          Distance: {land.distance} <br />
                          Votes: {land.votes} <br />
                          Review: {land.review} <br />
                        </li>
                      )
                    )}
                </ul>
              }
              heading="Closest Landmarks:"
            />
            <APIContent
              content={
                <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {bookingData.data.landmarks &&
                    bookingData.data.landmarks.popularLandmarks &&
                    bookingData.data.landmarks.popularLandmarks.map(
                      (land, index) => (
                        <li
                          key={index}
                          className="flex py-4 px-2 rounded bg-gray-700"
                        >
                          Latitude: {land.lat} <br />
                          Longitude: {land.long} <br />
                          Name: {land.name} <br />
                          Distance: {land.distance} <br />
                          Votes: {land.votes} <br />
                          Review: {land.review} <br />
                        </li>
                      )
                    )}
                </ul>
              }
              heading="Popular Landmarks:"
            />
          </>
        ) : (
          <p className="text-sm text-white col-span-4">
            Looks like no data from booking was found for this business. Try
            refetching.
          </p>
        )}
      </div>
    </div>
  );
}

export default BookingAPIData;
