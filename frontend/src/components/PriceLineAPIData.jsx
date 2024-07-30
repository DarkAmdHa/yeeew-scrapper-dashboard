import APIContent from "./APIContent";
import ScrappedImagesComponent from "./ScrappedImages";

function PriceLineAPIData({ priceLineData }) {
  return (
    <div className=" py-6 sm:py-4">
      <div className="grid grid-cols-1 gap-x-2 gap-y-4 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <div className="block text-2xl font-medium leading-6 text-white">
            Priceline API
          </div>
        </div>
        <div className="col-span-6 h-[1px] w-full bg-gray-500"></div>

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
                      {priceLineData.data.highlights.hotelAmenities.join(", ")}
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
      </div>
    </div>
  );
}

export default PriceLineAPIData;
