import APIContent from "./APIContent";

function BookingAPIData({ bookingData }) {
  return (
    <div className=" py-6 sm:py-4">
      <div className="grid grid-cols-1 gap-x-2 gap-y-4 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <div className="block text-2xl font-medium leading-6 text-white">
            Booking API
          </div>
        </div>
        <div className="col-span-6 h-[1px] w-full bg-gray-500"></div>

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
            bookingData.data.coordinates && bookingData.data.coordinates.long
          }
          heading="Longitude"
        />

        <APIContent content="" heading="Platform Data" />

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
      </div>
    </div>
  );
}

export default BookingAPIData;
