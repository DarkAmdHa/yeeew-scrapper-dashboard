import { ArrowPathIcon } from "@heroicons/react/20/solid";
import APIContent from "./APIContent";
import TripAdvisorReview from "./TripAdvisorReview";
import { useContext, useState } from "react";
import clsx from "clsx";
import { toast } from "react-toastify";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import Spinner from "./Spinner";

function TripAdvisorAPIData({ tripadvisorData, listingId }) {
  const [isRefetching, setIsRefetching] = useState(false);
  const { token } = useContext(AppContext);
  const navigate = useNavigate();

  const refetchReviews = async () => {
    if (isRefetching) return;
    setIsRefetching(true);
    try {
      //Refetch Reviews
      const { data } = await axios.post(
        `/api/listing/${listingId}/refetchReviews`,
        {
          ...(tripadvisorData &&
            tripadvisorData.id && { apiListingId: tripadvisorData.id }),
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
      toast.error("Failed to refetch reviews");
    } finally {
      setIsRefetching(false);
    }
  };

  return (
    <div className=" py-6 sm:py-4">
      <div className="grid grid-cols-1 gap-x-2 gap-y-4 sm:grid-cols-6">
        <div className="col-span-6 flex justify-between items-center">
          <div className="block text-2xl font-medium leading-6 text-white">
            Trip Advisor API Data
          </div>
          <button
            onClick={refetchReviews}
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
            Refetch Reviews
          </button>
        </div>
        <div className="col-span-6 h-[1px] w-full bg-gray-500"></div>

        {tripadvisorData ? (
          <>
            <p className="text-sm text-white col-span-4">
              Currently only collecting the first 20 reviews provided by default
              by the API. Additional reviews can be fetched using paginated
              queries if needed.
            </p>
            <APIContent content={tripadvisorData.id} heading="Platform ID" />

            <APIContent
              content={
                <ul className="flex flex-col gap-4">
                  {tripadvisorData.data.reviews &&
                    tripadvisorData.data.reviews.map((review, index) => (
                      <TripAdvisorReview
                        review={review}
                        key={`review-${index}`}
                      />
                    ))}
                </ul>
              }
              heading="Reviews"
            />
          </>
        ) : (
          <p className="text-sm text-white col-span-4">
            Looks like no reviews were found for this business. Try refetching
            the reviews.
          </p>
        )}
      </div>
    </div>
  );
}

export default TripAdvisorAPIData;
