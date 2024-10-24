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

function HotelsAPIData({ hotelsData, listingId }) {
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
          apiHandle: "hotels",
          ...(hotelsData &&
            hotelsData.id && {
              apiListingId: hotelsData.id,
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
            Hotels API
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
            Refetch From Hotels.com API
          </button>
        </div>
        <div className="col-span-6 h-[1px] w-full bg-gray-500"></div>

        {hotelsData ? (
          <>
            <APIContent heading="Platform ID" content={hotelsData.id} />
            <APIContent
              heading="Platform Data "
              content={
                <p className="mt-2 text-white overflow-hidden whitespace-break-spaces">
                  Coordinates: <br />
                  Latitude:{" "}
                  {hotelsData.data.coordinates &&
                    hotelsData.data.coordinates.lat}{" "}
                  <br />
                  Longitude:{" "}
                  {hotelsData.data.coordinates &&
                    hotelsData.data.coordinates.long}{" "}
                  <br />
                </p>
              }
            />

            <APIContent heading="Summary" content="" />

            <APIContent
              heading="Tagline"
              content={hotelsData.data.summary.tagLine}
            />
            <APIContent
              heading="Policies"
              content={
                hotelsData.data.summary.policies && (
                  <>
                    {hotelsData.data.summary.policies.checkinInstructions && (
                      <span>
                        Check-in Instructions:{" "}
                        {hotelsData.data.summary.policies.checkinInstructions.join(
                          ", "
                        )}
                        <br />
                      </span>
                    )}
                    {hotelsData.data.summary.policies.needToKnow && (
                      <span>
                        Need to Know:{" "}
                        {hotelsData.data.summary.policies.needToKnow.join(", ")}
                        <br />
                      </span>
                    )}
                    {hotelsData.data.summary.policies.childAndBed && (
                      <span>
                        Child and Bed:{" "}
                        {hotelsData.data.summary.policies.childAndBed.join(
                          ", "
                        )}
                        <br />
                      </span>
                    )}
                    {hotelsData.data.summary.policies.paymentOptions && (
                      <span>
                        Payment Options:{" "}
                        {hotelsData.data.summary.policies.paymentOptions.join(
                          ", "
                        )}
                        <br />
                      </span>
                    )}
                    {hotelsData.data.summary.policies.pets && (
                      <span>
                        Pets: {hotelsData.data.summary.policies.pets.join(", ")}
                        <br />
                      </span>
                    )}
                    {hotelsData.data.summary.policies.shouldMention && (
                      <span>
                        Should Mention:{" "}
                        {hotelsData.data.summary.policies.shouldMention.join(
                          ", "
                        )}
                        <br />
                      </span>
                    )}
                  </>
                )
              }
            />

            <APIContent
              heading="Highlights"
              content={
                hotelsData.data.summary.highlights && (
                  <>
                    {hotelsData.data.summary.highlights.amenities && (
                      <span>
                        Amenities:{" "}
                        {hotelsData.data.summary.highlights.amenities.join(
                          ", "
                        )}
                        <br />
                      </span>
                    )}
                    {hotelsData.data.summary.highlights.topAmenities && (
                      <span>
                        Top Amenities:{" "}
                        {hotelsData.data.summary.highlights.topAmenities.join(
                          ", "
                        )}
                        <br />
                      </span>
                    )}
                    {hotelsData.data.summary.highlights.highlight && (
                      <span>
                        Highlights:{" "}
                        {hotelsData.data.summary.highlights.highlight.join(
                          ", "
                        )}
                        <br />
                      </span>
                    )}
                    {hotelsData.data.summary.highlights.property && (
                      <span>
                        Property:{" "}
                        {hotelsData.data.summary.highlights.property.join(", ")}
                        <br />
                      </span>
                    )}
                  </>
                )
              }
            />

            <APIContent
              heading="Location"
              content={
                hotelsData.data.summary.location && (
                  <>
                    {hotelsData.data.summary.location.whatsAround && (
                      <span>
                        What&apos;s Around:{" "}
                        {hotelsData.data.summary.location.whatsAround.join(
                          ", "
                        )}
                        <br />
                      </span>
                    )}
                    {hotelsData.data.summary.location.mapImage && (
                      <span>
                        Map Image:{" "}
                        <a
                          href={hotelsData.data.summary.location.mapImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 underline"
                        >
                          View Map
                        </a>
                        <br />
                      </span>
                    )}
                  </>
                )
              }
            />

            <APIContent
              heading="Nearby POIs: "
              content={
                hotelsData.data.summary.nearbyPOIs &&
                hotelsData.data.summary.nearbyPOIs.map((poi, index) => (
                  <span key={index}>
                    {poi.text}: {poi.moreInfo}
                    <br />
                  </span>
                ))
              }
            />

            <APIContent
              heading="Review Info:"
              content={hotelsData.data.reviewInfo}
            />

            {hotelsData.data.rooms && (
              <div className="sm:col-span-6">
                <span className="block text-lg font-medium leading-6 text-white">
                  Rooms
                </span>
                <div className="mt-2 text-white">
                  {hotelsData.data.rooms.length ? (
                    hotelsData.data.rooms.map((room, index) => (
                      <div key={index} className="mb-4">
                        <span className="block text-lg font-bold">
                          {room.roomName}
                        </span>
                        <p>
                          Features: {room.features.join(", ")} <br />
                          Description: {room.description} <br />
                          Rate Plans:{" "}
                          {room.ratePlans.map((plan, idx) => (
                            <span key={idx}>
                              {plan.available ? "Available" : "Not Available"},
                              Price: {plan.price} AUD, {plan.cancellationPolicy}{" "}
                              <br />
                            </span>
                          ))}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-white col-span-4">
                      No room offers found for this business.
                    </p>
                  )}
                </div>
              </div>
            )}

            {hotelsData.data.minimumPrice ? (
              <APIContent
                heading="Minimum Price"
                content={`AUD ${hotelsData.data.minimumPrice}`}
              />
            ) : (
              ""
            )}

            <div className="sm:col-span-6">
              <span className="block text-lg font-medium leading-6 text-white">
                Property Gallery{" "}
              </span>

              <div className="mt-2 text-white">
                {hotelsData.data.propertyGallery && (
                  <ScrappedImagesComponent
                    imageUrls={hotelsData.data.propertyGallery.map(
                      (gallery) => ({
                        src: gallery.url,
                        width: 800,
                        height: 600,
                      })
                    )}
                  />
                )}
              </div>
            </div>

            <div className="sm:col-span-6">
              <label
                htmlFor="content-sections"
                className="block text-lg font-medium leading-6 text-white"
              >
                Property Content Sections
              </label>
              <div className="mt-2 text-white">
                About This Property:{" "}
                {hotelsData.data.propertyContentSectionGroups
                  .aboutThisProperty &&
                  hotelsData.data.propertyContentSectionGroups.aboutThisProperty.map(
                    (about, index) => (
                      <span key={index}>
                        {about}
                        <br />
                      </span>
                    )
                  )}{" "}
                <br />
                Policies:{" "}
                {hotelsData.data.propertyContentSectionGroups.policies &&
                  hotelsData.data.propertyContentSectionGroups.policies.map(
                    (policy, index) => (
                      <span key={index}>
                        {policy}
                        <br />
                      </span>
                    )
                  )}
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-white col-span-4">
            Looks like no data from the Hotels API was found for this business.
            Try refetching.
          </p>
        )}
      </div>
    </div>
  );
}

export default HotelsAPIData;
