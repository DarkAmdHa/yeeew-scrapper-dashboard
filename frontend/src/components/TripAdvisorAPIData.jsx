import APIContent from "./APIContent";
import TripAdvisorReview from "./TripAdvisorReview";

function TripAdvisorAPIData({ tripadvisorData }) {
  return (
    <div className=" py-6 sm:py-4">
      <div className="grid grid-cols-1 gap-x-2 gap-y-4 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <div className="block text-2xl font-medium leading-6 text-white">
            Trip Advisor API Data
          </div>
        </div>
        <div className="col-span-6 h-[1px] w-full bg-gray-500"></div>

        <p className="text-sm text-white col-span-4">
          Currently only collecting the first 20 reviews provided by default by the
          API. Additional reviews can be fetched using paginated queries if needed.
        </p>
        <APIContent content={tripadvisorData.id} heading="Platform ID" />

        <APIContent
          content={
            <ul className="flex flex-col gap-4">
              {tripadvisorData.data.reviews &&
                tripadvisorData.data.reviews.map((review, index) => (
                  <TripAdvisorReview review={review} key={`review-${index}`} />
                ))}
            </ul>
          }
          heading="Reviews"
        />
      </div>
    </div>
  );
}

export default TripAdvisorAPIData;
