import APIContent from "./APIContent";
import ScrappedImagesComponent from "./ScrappedImages";

import { toast } from "react-toastify";
import { useContext, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import Spinner from "./Spinner";
import { ArrowPathIcon } from "@heroicons/react/20/solid";
import { clsx } from "yet-another-react-lightbox";

function PriceLineAPIData({ priceLineData, listingId }) {
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
          apiHandle: "priceline",
          ...(priceLineData &&
            priceLineData.id && {
              apiListingId: priceLineData.id,
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
            Priceline API
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
            Refetch From Priceline.com API
          </button>
        </div>
        <div className="col-span-6 h-[1px] w-full bg-gray-500"></div>

        {priceLineData ? (
          <>
            <APIContent heading="Platform ID" content={priceLineData.id} />
            <APIContent
              heading="Platform Data"
              content={
                <p className="mt-2 text-white overflow-hidden whitespace-break-spaces">
                  Coordinates: <br />
                  Latitude:{" "}
                  {priceLineData.data.coordinates &&
                    priceLineData.data.coordinates.lat}{" "}
                  <br />
                  Longitude:{" "}
                  {priceLineData.data.coordinates &&
                    priceLineData.data.coordinates.long}{" "}
                  <br />
                </p>
              }
            />

            <APIContent heading="Summary" content="" />

            <APIContent
              heading="Description"
              content={priceLineData.data.description}
            />
            <APIContent
              heading="Policies"
              content={
                <p className="mt-2 text-white overflow-hidden whitespace-break-spaces">
                  {priceLineData.data.policies && (
                    <>
                      {priceLineData.data.policies.childrenDescription && (
                        <span>
                          Children Description:{" "}
                          {priceLineData.data.policies.childrenDescription}
                          <br />
                        </span>
                      )}
                      {priceLineData.data.policies.petDescription && (
                        <span>
                          Pet Description:{" "}
                          {priceLineData.data.policies.petDescription}
                          <br />
                        </span>
                      )}
                      {priceLineData.data.policies.importantInfo && (
                        <span>
                          Important Info:{" "}
                          {priceLineData.data.policies.importantInfo.join(", ")}
                          <br />
                        </span>
                      )}
                    </>
                  )}
                </p>
              }
            />

            <APIContent
              heading="Highlights"
              content={
                <p className="mt-2 text-white overflow-hidden whitespace-break-spaces">
                  {priceLineData.data.highlights && (
                    <>
                      {priceLineData.data.highlights.features && (
                        <span>
                          Features:{" "}
                          {priceLineData.data.highlights.features.join(", ")}
                          <br />
                        </span>
                      )}
                      {priceLineData.data.highlights.hotelAmenities && (
                        <span>
                          Hotel Amenities:{" "}
                          {priceLineData.data.highlights.hotelAmenities.join(
                            ", "
                          )}
                          <br />
                        </span>
                      )}
                    </>
                  )}
                </p>
              }
            />

            <div className="sm:col-span-6">
              <label
                htmlFor="property-gallery"
                className="block text-lg font-medium leading-6 text-white"
              >
                Property Gallery
              </label>
              <div className="mt-2 text-white">
                {priceLineData.data.propertyGallery && (
                  <ScrappedImagesComponent
                    imageUrls={priceLineData.data.propertyGallery.map(
                      (gallery) => ({
                        src: gallery.imageUrl,
                        width: 800,
                        height: 600,
                      })
                    )}
                  />
                )}
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-white col-span-4">
            Looks like no data from the Priceline API was found for this
            business. Try refetching.
          </p>
        )}
      </div>
    </div>
  );
}

export default PriceLineAPIData;
