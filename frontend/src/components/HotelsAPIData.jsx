import APIContent from "./APIContent";
import ScrappedImagesComponent from "./ScrappedImages";

function HotelsAPIData({ hotelsData }) {
  return (
    <div className=" py-6 sm:py-4">
      <div className="grid grid-cols-1 gap-x-2 gap-y-4 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <div className="block text-2xl font-medium leading-6 text-white">
            Hotels API
          </div>
        </div>
        <div className="col-span-6 h-[1px] w-full bg-gray-500"></div>

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
                    {hotelsData.data.summary.policies.childAndBed.join(", ")}
                    <br />
                  </span>
                )}
                {hotelsData.data.summary.policies.paymentOptions && (
                  <span>
                    Payment Options:{" "}
                    {hotelsData.data.summary.policies.paymentOptions.join(", ")}
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
                    {hotelsData.data.summary.policies.shouldMention.join(", ")}
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
                    {hotelsData.data.summary.highlights.amenities.join(", ")}
                    <br />
                  </span>
                )}
                {hotelsData.data.summary.highlights.topAmenities && (
                  <span>
                    Top Amenities:{" "}
                    {hotelsData.data.summary.highlights.topAmenities.join(", ")}
                    <br />
                  </span>
                )}
                {hotelsData.data.summary.highlights.highlight && (
                  <span>
                    Highlights:{" "}
                    {hotelsData.data.summary.highlights.highlight.join(", ")}
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
                    {hotelsData.data.summary.location.whatsAround.join(", ")}
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

        <div className="sm:col-span-6">
          <span className="block text-lg font-medium leading-6 text-white">
            Property Gallery{" "}
          </span>

          <div className="mt-2 text-white">
            {hotelsData.data.propertyGallery && (
              <ScrappedImagesComponent
                imageUrls={hotelsData.data.propertyGallery.map((gallery) => ({
                  src: gallery.url,
                  width: 800,
                  height: 600,
                }))}
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
            {hotelsData.data.propertyContentSectionGroups.aboutThisProperty &&
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
      </div>
    </div>
  );
}

export default HotelsAPIData;
