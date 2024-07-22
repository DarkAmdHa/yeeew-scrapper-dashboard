import { useContext, useEffect, useState } from "react";
import FAQComponent from "../components/FAQComponent";
import ScrappedImages from "../components/ScrappedImages";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { getListing } from "../utils/getListing";
import { useParams } from "react-router-dom";
import SpinnerOverlay from "../components/SpinnerOverlay";
import TypesArray from "../components/TypesArray";
import RoomTypes from "../components/RoomTypes";
import Amenities from "../components/Amenities";
import Surroundings from "../components/Surroundings";

const initialState = {
  businessName: "",
  businessURL: "",
  tripType: [],
  highlightsAndTopAmenities: [],
  accommodationType: [],
  scrapedImages: [],
  scraped: false,
  roomsFromBooking: [],
  propertyAmenitiesFromBooking: [],
  propertySurroundingsFromBooking: [],
  faq: [],
  address: "",
  contactName: "",
  customSlug: "",
  email: "",
  phoneNumber: "",
  whatsappNumber: "",
  latitude: "",
  longitude: "",
};

export default function BusinessPage() {
  let params = useParams();
  const { token } = useContext(AppContext);

  const [listing, setListing] = useState(initialState);
  const [changeableListing, setChangeableListing] = useState(initialState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const id = params.id;

    const fetchListing = async () => {
      setIsLoading(true);
      try {
        const data = await getListing(id, token);
        setListing(data);
        setChangeableListing(data);
      } catch (error) {
        console.error("Listing could not be fetched");
        toast.error(
          error.response && error.response.data.message
            ? error.response.data.message
            : "Listing could not be fetched"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [params, token]);

  const [platformForm, setPlatformForm] = useState({
    bookingUrl: "",
    bookingHighlights: "",
    bookingSummary: "",
  });
  const [scrappedInfoForm, setScrappedInfoForm] = useState({
    phoneNumber: "",
    whatsappNumber: "",
    customSlug: "",
  });

  const handleSubmit = (e) => {};
  const handleChange = (e) => {};
  return (
    <div className="space-y-10 divide-y divide-gray-900/10  px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
        {isLoading && <SpinnerOverlay />}

        <div className="px-4 sm:px-0">
          <h2 className="text-base font-semibold leading-7 text-white">
            Business Details
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-400">
            This information will be used to scrape the business data.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2"
        >
          <div className="px-4 py-6 sm:p-8">
            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              {(changeableListing.scraped || changeableListing.exported) && (
                <div className="sm:col-span-6 gap-6 text-sm justify-end flex">
                  {changeableListing.scraped && (
                    <div className="flex items-center justify-end gap-x-2 sm:justify-start">
                      <div className="text-green-400 bg-green-400/10 flex-none rounded-full p-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-current" />
                      </div>
                      <div className="text-green-400 hidden sm:block">
                        Scraped
                      </div>
                    </div>
                  )}

                  {changeableListing.exported && (
                    <div className="flex items-center justify-end gap-x-2 sm:justify-start">
                      <div className="text-green-400 bg-green-400/10 flex-none rounded-full p-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-current" />
                      </div>
                      <div className="text-green-400 hidden sm:block">
                        Exported
                      </div>
                    </div>
                  )}
                </div>
              )}

              {changeableListing.exportLinks &&
              changeableListing.exportLinks.length ? (
                <div className="sm:col-span-4">
                  <div className="block text-md font-medium leading-6 text-white">
                    Yeeew! Listing
                  </div>
                  <ul className=" list-none mt-1">
                    {changeableListing.exportLinks.map((link, index) => (
                      <li key={link + "-" + index}>
                        <a
                          href={link}
                          target="_blank"
                          className="text-blue-500 underline text-xs"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                ""
              )}
              <div className="sm:col-span-4">
                <label
                  htmlFor="businessName"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Business Name
                </label>
                <div className="mt-2">
                  <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                    <input
                      type="text"
                      name="businessName"
                      id="businessName"
                      required
                      onChange={handleChange}
                      value={changeableListing.businessName}
                      className="block flex-1 border-0 bg-transparent py-1.5 pl-3 text-white placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      placeholder="McDonald's"
                    />
                  </div>
                </div>
              </div>
              <div className="sm:col-span-4">
                <label
                  htmlFor="businessURL"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Business URL
                </label>
                <div className="mt-2">
                  <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                    <input
                      type="text"
                      name="businessURL"
                      id="businessURL"
                      onChange={handleChange}
                      value={changeableListing.businessURL}
                      className="block flex-1 border-0 bg-transparent p-1.5 text-white placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      placeholder="www.example.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-x-6 border-t border-gray-500/10 px-4 py-4 sm:px-8">
            {/* <button
              type="submit"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Save
            </button> */}
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
        <div className="px-4 sm:px-0">
          <h2 className="text-base font-semibold leading-7 text-white">
            Scrapped Information
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-400">
            This will be filled once scrapped
          </p>
        </div>

        <form className="bg-gray-800 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
          <div className="px-4 py-6 sm:p-8">
            <div className="grid  grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label
                  htmlFor="trip-type"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Trip Type
                </label>
                <div className="mt-2">
                  <TypesArray
                    items={changeableListing.tripType}
                    handleChangeMain={setChangeableListing}
                    nameInMain={"tripType"}
                    name="Trip Types"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="accommodation-type"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Accommodation Type
                </label>
                <div className="mt-2">
                  <TypesArray
                    items={changeableListing.accommodationType}
                    handleChangeMain={setChangeableListing}
                    nameInMain={"accommodationType"}
                    name="Accommodation Types"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label
                  htmlFor="accommodation-type"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Highlights And Top Amenities
                </label>
                <div className="mt-2">
                  <TypesArray
                    items={changeableListing.highlightsAndTopAmenities}
                    handleChangeMain={setChangeableListing}
                    nameInMain={"highlightsAndTopAmenities"}
                    name="Highlights"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label
                  htmlFor="accommodation-type"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Room Types
                </label>
                <p className="text-sm text-gray-500">
                  Scrapped from Booking.com
                </p>
                <div className="mt-2">
                  <RoomTypes rooms={changeableListing.roomsFromBooking} />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label
                  htmlFor="accommodation-type"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Property Amenities
                </label>
                <p className="text-sm text-gray-500">
                  Scrapped from Booking.com
                </p>
                <div className="mt-2">
                  <Amenities
                    amenities={changeableListing.propertyAmenitiesFromBooking}
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label
                  htmlFor="accommodation-type"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Property Surroundings
                </label>
                <p className="text-sm text-gray-500">
                  Scrapped from Booking.com
                </p>
                <div className="mt-2">
                  <Surroundings
                    surroundings={
                      changeableListing.propertySurroundingsFromBooking
                    }
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label
                  htmlFor="address"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Address
                </label>
                <div className="mt-2">
                  <input
                    id="address"
                    name="address"
                    value={changeableListing.address}
                    onChange={handleChange}
                    type="text"
                    autoComplete="off"
                    className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="longitude"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Longitude
                </label>
                <div className="mt-2">
                  <input
                    id="longitude"
                    name="longitude"
                    value={changeableListing.longitude}
                    onChange={handleChange}
                    type="text"
                    autoComplete="off"
                    className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="latitude"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Lattitude
                </label>
                <div className="mt-2">
                  <input
                    id="latitude"
                    name="latitude"
                    value={changeableListing.latitude}
                    onChange={handleChange}
                    type="text"
                    autoComplete="off"
                    className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label
                  htmlFor="contactName"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Contact Name
                </label>
                <div className="mt-2">
                  <input
                    id="contactName"
                    name="contactName"
                    value={changeableListing.contactName}
                    onChange={handleChange}
                    type="text"
                    autoComplete="off"
                    className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Contact Email
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    value={changeableListing.email}
                    onChange={handleChange}
                    type="email"
                    autoComplete="email"
                    className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label
                  htmlFor="phone-number"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Contact Phone
                  <span className="text-gray-400 block text-xs mt-1">
                    Format: XXX-XXX-XXXX
                  </span>
                </label>
                <div className="mt-2">
                  <input
                    id="phone-number"
                    name="phoneNumber"
                    type="tel"
                    autoComplete="tel"
                    value={changeableListing.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label
                  htmlFor="whatsapp-number"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Whatsapp Number
                  <span className="text-gray-400 block text-xs mt-1">
                    Format: XXX-XXX-XXXX
                  </span>
                </label>
                <div className="mt-2 relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    className="w-6 h-6 absolute inset-y-0 left-2 flex items-center text-gray-400 top-1/2 -translate-y-1/2"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                    />
                  </svg>

                  <input
                    id="whatsapp-number"
                    name="whatsappNumber"
                    type="tel"
                    autoComplete="tel"
                    value={changeableListing.whatsappNumber}
                    onChange={handleChange}
                    placeholder="Enter Whatsapp number"
                    className="pl-10 block w-full rounded-md border-0 py-1.5 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label
                  htmlFor="customSlug"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Custom Slug
                  <span className="text-gray-400 block text-xs mt-1">
                    Custom slug for this business
                  </span>
                </label>
                <div className="mt-2">
                  <input
                    id="customSlug"
                    name="customSlug"
                    type="text"
                    autoComplete="off"
                    value={changeableListing.customSlug}
                    onChange={handleChange}
                    placeholder="Enter custom slug"
                    className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <p className="block text-sm font-medium leading-6 text-white">
                  Scrapped Images
                  <span className="text-gray-400 block text-xs mt-1">
                    All business specific images scrapped during the information
                    gethering process
                  </span>
                </p>
                <div className="mt-2">
                  <ScrappedImages
                    imageUrls={changeableListing.scrapedImages.map((url) => ({
                      src: url,
                      width: 800,
                      height: 600,
                    }))}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-x-6 border-t border-gray-500/10 px-4 py-4 sm:px-8">
            {/* <button
              type="submit"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Save
            </button> */}
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
        <div className="px-4 sm:px-0">
          <h2 className="text-base font-semibold leading-7 text-white">
            APIs Information
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-400">
            This will be filled once scrapped
          </p>
        </div>

        <div className="bg-gray-800 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
          <div className="px-4 py-6 sm:p-8">
            {changeableListing &&
              changeableListing.apiData &&
              changeableListing.apiData.booking && (
                <div className=" py-6 sm:py-4">
                  <div className="grid grid-cols-1 gap-x-2 gap-y-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <div className="block text-2xl font-medium leading-6 text-white">
                        Booking API
                      </div>
                    </div>

                    <div className="sm:col-span-6">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium leading-6 text-white"
                      >
                        Platform ID
                      </label>
                      <div className="mt-2 text-white">
                        {changeableListing.apiData.booking.id}
                      </div>
                    </div>
                    <div className="sm:col-span-6">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium leading-6 text-white"
                      >
                        Platform Data
                      </label>
                      <p className="mt-2 text-white overflow-hidden whitespace-break-spaces">
                        Description:
                        <ul>
                          {changeableListing.apiData.booking.data.description &&
                            changeableListing.apiData.booking.data.description.map(
                              (des, index) => <li key={index}>{des}</li>
                            )}
                        </ul>
                      </p>
                      <p className="mt-2 text-white overflow-hidden whitespace-break-spaces">
                        Policies:
                        <ul>
                          {changeableListing.apiData.booking.data.policies &&
                            changeableListing.apiData.booking.data.policies.map(
                              (pol, index) => <li key={index}>{pol}</li>
                            )}
                        </ul>
                      </p>
                      <p className="mt-2 text-white overflow-hidden whitespace-break-spaces">
                        Closest Landmarks:
                        <ul>
                          {changeableListing.apiData.booking.data.landmarks &&
                            changeableListing.apiData.booking.data.landmarks
                              .closestLandmarks &&
                            changeableListing.apiData.booking.data.landmarks.closestLandmarks.map(
                              (land, index) => (
                                <li key={index}>
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
                      </p>
                      <p className="mt-2 text-white overflow-hidden whitespace-break-spaces">
                        Popular Landmarks:
                        <ul>
                          {changeableListing.apiData.booking.data.landmarks &&
                            changeableListing.apiData.booking.data.landmarks
                              .popularLandmarks &&
                            changeableListing.apiData.booking.data.landmarks.popularLandmarks.map(
                              (land, index) => (
                                <li key={index}>
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
                      </p>
                      <p className="mt-2 text-white overflow-hidden whitespace-break-spaces">
                        Coordinates: Latitude:{" "}
                        {changeableListing.apiData.booking.data.coordinates &&
                          changeableListing.apiData.booking.data.coordinates
                            .lat}{" "}
                        <br />
                        Longitude:{" "}
                        {changeableListing.apiData.booking.data.coordinates &&
                          changeableListing.apiData.booking.data.coordinates
                            .long}{" "}
                        <br />
                      </p>
                    </div>
                  </div>
                </div>
              )}
            {changeableListing &&
              changeableListing.apiData &&
              changeableListing.apiData.hotels && (
                <div className=" py-6 sm:py-4">
                  <div className="grid grid-cols-1 gap-x-2 gap-y-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <div className="block text-2xl font-medium leading-6 text-white">
                        Hotels API
                      </div>
                    </div>
                    <div className="col-span-6 h-[1px] w-full bg-gray-500"></div>

                    <div className="sm:col-span-6">
                      <label
                        htmlFor="platform-id"
                        className="block text-lg font-medium leading-6 text-white"
                      >
                        Platform ID
                      </label>
                      <div className="mt-2 text-white">
                        {changeableListing.apiData.hotels.id}
                      </div>
                    </div>

                    <div className="sm:col-span-6">
                      <label
                        htmlFor="coordinates"
                        className="block text-lg font-medium leading-6 text-white"
                      >
                        Platform Data
                      </label>
                      <p className="mt-2 text-white overflow-hidden whitespace-break-spaces">
                        Coordinates: <br />
                        Latitude:{" "}
                        {changeableListing.apiData.hotels.data.coordinates &&
                          changeableListing.apiData.hotels.data.coordinates
                            .lat}{" "}
                        <br />
                        Longitude:{" "}
                        {changeableListing.apiData.hotels.data.coordinates &&
                          changeableListing.apiData.hotels.data.coordinates
                            .long}{" "}
                        <br />
                      </p>
                    </div>

                    <div className="sm:col-span-6">
                      <label
                        htmlFor="summary"
                        className="block text-lg font-medium leading-6 text-white"
                      >
                        Summary
                      </label>
                      <p className="mt-2 text-white overflow-hidden whitespace-break-spaces">
                        <span className="block text-lg font-medium leading-6 text-white">
                          Tagline:{" "}
                        </span>
                        {changeableListing.apiData.hotels.data.summary.tagLine}{" "}
                        <br />
                        <span className="block text-lg font-medium leading-6 text-white">
                          Policies:{" "}
                        </span>
                        {changeableListing.apiData.hotels.data.summary
                          .policies && (
                          <>
                            {changeableListing.apiData.hotels.data.summary
                              .policies.checkinInstructions && (
                              <span>
                                Check-in Instructions:{" "}
                                {changeableListing.apiData.hotels.data.summary.policies.checkinInstructions.join(
                                  ", "
                                )}
                                <br />
                              </span>
                            )}
                            {changeableListing.apiData.hotels.data.summary
                              .policies.needToKnow && (
                              <span>
                                Need to Know:{" "}
                                {changeableListing.apiData.hotels.data.summary.policies.needToKnow.join(
                                  ", "
                                )}
                                <br />
                              </span>
                            )}
                            {changeableListing.apiData.hotels.data.summary
                              .policies.childAndBed && (
                              <span>
                                Child and Bed:{" "}
                                {changeableListing.apiData.hotels.data.summary.policies.childAndBed.join(
                                  ", "
                                )}
                                <br />
                              </span>
                            )}
                            {changeableListing.apiData.hotels.data.summary
                              .policies.paymentOptions && (
                              <span>
                                Payment Options:{" "}
                                {changeableListing.apiData.hotels.data.summary.policies.paymentOptions.join(
                                  ", "
                                )}
                                <br />
                              </span>
                            )}
                            {changeableListing.apiData.hotels.data.summary
                              .policies.pets && (
                              <span>
                                Pets:{" "}
                                {changeableListing.apiData.hotels.data.summary.policies.pets.join(
                                  ", "
                                )}
                                <br />
                              </span>
                            )}
                            {changeableListing.apiData.hotels.data.summary
                              .policies.shouldMention && (
                              <span>
                                Should Mention:{" "}
                                {changeableListing.apiData.hotels.data.summary.policies.shouldMention.join(
                                  ", "
                                )}
                                <br />
                              </span>
                            )}
                          </>
                        )}
                        <br />
                        <span className="block text-lg font-medium leading-6 text-white">
                          Highlights:{" "}
                        </span>
                        <br />
                        {changeableListing.apiData.hotels.data.summary
                          .highlights && (
                          <>
                            {changeableListing.apiData.hotels.data.summary
                              .highlights.amenities && (
                              <span>
                                Amenities:{" "}
                                {changeableListing.apiData.hotels.data.summary.highlights.amenities.join(
                                  ", "
                                )}
                                <br />
                              </span>
                            )}
                            {changeableListing.apiData.hotels.data.summary
                              .highlights.topAmenities && (
                              <span>
                                Top Amenities:{" "}
                                {changeableListing.apiData.hotels.data.summary.highlights.topAmenities.join(
                                  ", "
                                )}
                                <br />
                              </span>
                            )}
                            {changeableListing.apiData.hotels.data.summary
                              .highlights.highlight && (
                              <span>
                                Highlights:{" "}
                                {changeableListing.apiData.hotels.data.summary.highlights.highlight.join(
                                  ", "
                                )}
                                <br />
                              </span>
                            )}
                            {changeableListing.apiData.hotels.data.summary
                              .highlights.property && (
                              <span>
                                Property:{" "}
                                {changeableListing.apiData.hotels.data.summary.highlights.property.join(
                                  ", "
                                )}
                                <br />
                              </span>
                            )}
                          </>
                        )}
                        <br />
                        <span className="block text-lg font-medium leading-6 text-white">
                          Location:{" "}
                        </span>
                        {changeableListing.apiData.hotels.data.summary
                          .location && (
                          <>
                            {changeableListing.apiData.hotels.data.summary
                              .location.whatsAround && (
                              <span>
                                What's Around:{" "}
                                {changeableListing.apiData.hotels.data.summary.location.whatsAround.join(
                                  ", "
                                )}
                                <br />
                              </span>
                            )}
                            {changeableListing.apiData.hotels.data.summary
                              .location.mapImage && (
                              <span>
                                Map Image:{" "}
                                <a
                                  href={
                                    changeableListing.apiData.hotels.data
                                      .summary.location.mapImage
                                  }
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
                        )}
                        <br />
                        <span className="block text-lg font-medium leading-6 text-white">
                          Nearby POIs:{" "}
                        </span>
                        {changeableListing.apiData.hotels.data.summary
                          .nearbyPOIs &&
                          changeableListing.apiData.hotels.data.summary.nearbyPOIs.map(
                            (poi, index) => (
                              <span key={index}>
                                {poi.text}: {poi.moreInfo}
                                <br />
                              </span>
                            )
                          )}
                      </p>
                    </div>

                    <div className="sm:col-span-6">
                      <span className="block text-lg font-medium leading-6 text-white">
                        Review Info:{" "}
                      </span>

                      <div className="mt-2 text-white">
                        {changeableListing.apiData.hotels.data.reviewInfo}
                      </div>
                    </div>

                    <div className="sm:col-span-6">
                      <span className="block text-lg font-medium leading-6 text-white">
                        Property Gallery{" "}
                      </span>

                      <div className="mt-2 text-white">
                        {changeableListing.apiData.hotels.data
                          .propertyGallery && (
                          <ScrappedImages
                            imageUrls={changeableListing.apiData.hotels.data.propertyGallery.map(
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
                        {changeableListing.apiData.hotels.data
                          .propertyContentSectionGroups.aboutThisProperty &&
                          changeableListing.apiData.hotels.data.propertyContentSectionGroups.aboutThisProperty.map(
                            (about, index) => (
                              <span key={index}>
                                {about}
                                <br />
                              </span>
                            )
                          )}{" "}
                        <br />
                        Policies:{" "}
                        {changeableListing.apiData.hotels.data
                          .propertyContentSectionGroups.policies &&
                          changeableListing.apiData.hotels.data.propertyContentSectionGroups.policies.map(
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
              )}
            {changeableListing &&
              changeableListing.apiData &&
              changeableListing.apiData.priceline && (
                <div className=" py-6 sm:py-4">
                  <div className="grid grid-cols-1 gap-x-2 gap-y-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <div className="block text-2xl font-medium leading-6 text-white">
                        Priceline API
                      </div>
                    </div>

                    <div className="sm:col-span-6">
                      <label
                        htmlFor="platform-id"
                        className="block text-lg font-medium leading-6 text-white"
                      >
                        Platform ID
                      </label>
                      <div className="mt-2 text-white">
                        {changeableListing.apiData.priceline.id}
                      </div>
                    </div>

                    <div className="sm:col-span-6">
                      <label
                        htmlFor="coordinates"
                        className="block text-lg font-medium leading-6 text-white"
                      >
                        Platform Data
                      </label>
                      <p className="mt-2 text-white overflow-hidden whitespace-break-spaces">
                        Coordinates: <br />
                        Latitude:{" "}
                        {
                          changeableListing.apiData.priceline.data.coordinates
                            .lat
                        }{" "}
                        <br />
                        Longitude:{" "}
                        {
                          changeableListing.apiData.priceline.data.coordinates
                            .long
                        }{" "}
                        <br />
                      </p>
                    </div>

                    <div className="sm:col-span-6">
                      <label
                        htmlFor="description"
                        className="block text-lg font-medium leading-6 text-white"
                      >
                        Description
                      </label>
                      <p className="mt-2 text-white overflow-hidden whitespace-break-spaces">
                        {changeableListing.apiData.priceline.data.description}
                      </p>
                    </div>

                    <div className="sm:col-span-6">
                      <label
                        htmlFor="policies"
                        className="block text-lg font-medium leading-6 text-white"
                      >
                        Policies
                      </label>
                      <p className="mt-2 text-white overflow-hidden whitespace-break-spaces">
                        {changeableListing.apiData.priceline.data.policies && (
                          <>
                            {changeableListing.apiData.priceline.data.policies
                              .childrenDescription && (
                              <span>
                                Children Description:{" "}
                                {
                                  changeableListing.apiData.priceline.data
                                    .policies.childrenDescription
                                }
                                <br />
                              </span>
                            )}
                            {changeableListing.apiData.priceline.data.policies
                              .petDescription && (
                              <span>
                                Pet Description:{" "}
                                {
                                  changeableListing.apiData.priceline.data
                                    .policies.petDescription
                                }
                                <br />
                              </span>
                            )}
                            {changeableListing.apiData.priceline.data.policies
                              .importantInfo && (
                              <span>
                                Important Info:{" "}
                                {changeableListing.apiData.priceline.data.policies.importantInfo.join(
                                  ", "
                                )}
                                <br />
                              </span>
                            )}
                          </>
                        )}
                      </p>
                    </div>

                    <div className="sm:col-span-6">
                      <label
                        htmlFor="highlights"
                        className="block text-lg font-medium leading-6 text-white"
                      >
                        Highlights
                      </label>
                      <p className="mt-2 text-white overflow-hidden whitespace-break-spaces">
                        {changeableListing.apiData.priceline.data
                          .highlights && (
                          <>
                            {changeableListing.apiData.priceline.data.highlights
                              .features && (
                              <span>
                                Features:{" "}
                                {changeableListing.apiData.priceline.data.highlights.features.join(
                                  ", "
                                )}
                                <br />
                              </span>
                            )}
                            {changeableListing.apiData.priceline.data.highlights
                              .hotelAmenities && (
                              <span>
                                Hotel Amenities:{" "}
                                {changeableListing.apiData.priceline.data.highlights.hotelAmenities.join(
                                  ", "
                                )}
                                <br />
                              </span>
                            )}
                          </>
                        )}
                      </p>
                    </div>

                    <div className="sm:col-span-6">
                      <label
                        htmlFor="property-gallery"
                        className="block text-lg font-medium leading-6 text-white"
                      >
                        Property Gallery
                      </label>
                      <div className="mt-2 text-white">
                        {changeableListing.apiData.priceline.data
                          .propertyGallery && (
                          <ScrappedImages
                            imageUrls={changeableListing.apiData.priceline.data.propertyGallery.map(
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
              )}
          </div>
          <div className="flex items-center justify-end gap-x-6 border-t border-gray-500/10 px-4 py-4 sm:px-8"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
        <div className="px-4 sm:px-0">
          <h2 className="text-base font-semibold leading-7 text-white">
            Business Content
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-400">
            Business specific content, generated using all the business
            information scrapped
          </p>
        </div>

        <form className="bg-gray-800 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
          <div className="px-4 py-6 sm:p-8">
            <div className="flex flex-col max-w-2xl  gap-x-6 gap-y-8 ">
              <div className="">
                <label
                  htmlFor="overview"
                  className="block text-lg font-medium leading-6 text-white"
                >
                  Overview
                  <span className="text-gray-400 block text-xs mt-1">
                    Provide an overview of the business
                  </span>
                </label>
                <div className="mt-2">
                  <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                    <textarea
                      type="text"
                      name="overview"
                      id="overview"
                      value={changeableListing.overview}
                      onChange={handleChange}
                      className="block flex-1 border-0 bg-transparent py-1.5 pl-3 text-white placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      placeholder="Provide an overview of the business"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="aboutAccomodation"
                  className="block text-lg font-medium leading-6 text-white"
                >
                  About Accommodation
                  <span className="text-gray-400 block text-xs mt-1">
                    Provide a brief description of the accommodation
                  </span>
                </label>
                <div className="mt-2">
                  <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                    <textarea
                      type="text"
                      name="aboutAccomodation"
                      id="aboutAccomodation"
                      value={changeableListing.aboutAccomodation}
                      onChange={handleChange}
                      className="block pl-3 flex-1 border-0 bg-transparent py-1.5 pl-1 text-white placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      placeholder="Provide a brief description of the accommodation"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="foodInclusions"
                  className="block text-lg font-medium leading-6 text-white"
                >
                  Food & Inclusions
                  <span className="text-gray-400 block text-xs mt-1">
                    Describe the food options and other inclusions provided by
                    the accommodation
                  </span>
                </label>
                <div className="mt-2">
                  <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                    <textarea
                      type="text"
                      name="foodInclusions"
                      id="foodInclusions"
                      value={changeableListing.foodInclusions}
                      onChange={handleChange}
                      className="block pl-3 flex-1 border-0 bg-transparent py-1.5 pl-1 text-white placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      placeholder="Describe Food & Inclusions"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="specificSurfSpots"
                  className="block text-lg font-medium leading-6 text-white"
                >
                  Specific Surfing Spots
                  <span className="text-gray-400 block text-xs mt-1">
                    List specific surfing spots related to the business
                  </span>
                </label>
                <div className="mt-2">
                  <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                    <textarea
                      type="text"
                      name="specificSurfSpots"
                      id="specificSurfSpots"
                      value={changeableListing.specificSurfSpots}
                      onChange={handleChange}
                      className="block pl-3 flex-1 border-0 bg-transparent py-1.5 pl-1 text-white placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      placeholder="List specific surfing spots related to the business"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="gettingThere"
                  className="block text-lg font-medium leading-6 text-white"
                >
                  Getting There
                  <span className="text-gray-400 block text-xs mt-1">
                    Describe how to get to the business address
                  </span>
                </label>
                <div className="mt-2">
                  <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                    <textarea
                      type="text"
                      name="gettingThere"
                      id="gettingThere"
                      value={changeableListing.gettingThere}
                      onChange={handleChange}
                      className="block pl-3 flex-1 border-0 bg-transparent py-1.5 pl-1 text-white placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      placeholder="Describe how to get to the business address"
                    />
                  </div>
                </div>
              </div>

              <FAQComponent
                faqs={changeableListing.faq}
                setFaqs={setChangeableListing}
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-x-6 border-t border-gray-500/10 px-4 py-4 sm:px-8">
            {/* <button
              type="submit"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Save
            </button> */}
          </div>
        </form>
      </div>

      {/* COmented code at /coments */}
    </div>
  );
}
