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

  const [imageUrls, setImageUrls] = useState([
    {
      src: "https://yeeew-scraper-bucket.s3.amazonaws.com/funky-fish-beach--surf-resort/landscape/1714094799568_image.jpg",
      width: 800,
      height: 600,
    },
    {
      src: "https://yeeew-scraper-bucket.s3.amazonaws.com/funky-fish-beach--surf-resort/landscape/1714094803135_image.jpg",
      width: 800,
      height: 600,
    },
    {
      src: "https://yeeew-scraper-bucket.s3.amazonaws.com/funky-fish-beach--surf-resort/others/1714094802634_image.jpg",
      width: 800,
      height: 600,
    },
    {
      src: "https://yeeew-scraper-bucket.s3.amazonaws.com/funky-fish-beach--surf-resort/food/1714094802165_image.jpg",
      width: 800,
      height: 600,
    },
    {
      src: "https://yeeew-scraper-bucket.s3.amazonaws.com/funky-fish-beach--surf-resort/landscape/1714094801672_image.jpg",
      width: 800,
      height: 600,
    },
    {
      src: "https://yeeew-scraper-bucket.s3.amazonaws.com/funky-fish-beach--surf-resort/landscape/1714094801187_image.jpg",
      width: 800,
      height: 600,
    },
    {
      src: "https://yeeew-scraper-bucket.s3.amazonaws.com/funky-fish-beach--surf-resort/accomodation/1714094800440_image.jpg",
      width: 800,
      height: 600,
    },
    {
      src: "https://yeeew-scraper-bucket.s3.amazonaws.com/funky-fish-beach--surf-resort/accomodation/1714094800073_image.jpg",
      width: 800,
      height: 600,
    },
  ]);

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
                  className="block text-sm font-medium leading-6 text-white"
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
                  className="block text-sm font-medium leading-6 text-white"
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
                  className="block text-sm font-medium leading-6 text-white"
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
                  className="block text-sm font-medium leading-6 text-white"
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
                  className="block text-sm font-medium leading-6 text-white"
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

      {/* <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
        <div className="px-4 sm:px-0">
          <h2 className="text-base font-semibold leading-7 text-white">
            Platform Specific Data
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-400">
            All data scrapped from individual platforms can be found here
          </p>
        </div>

        <form className="bg-gray-800 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
          <div className="px-4 py-6 sm:p-8">
            <div className="max-w-2xl space-y-10">
              <fieldset>
                <legend className="text-sm font-semibold leading-6 text-white">
                  Booking.com
                </legend>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="booking-url"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      URL
                      <span className="text-gray-400 block text-xs mt-1">
                        URL of this business on the Booking.com platform
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="booking-url"
                        name="bookingUrl"
                        type="text"
                        autoComplete="off"
                        value={platformForm.bookingUrl}
                        onChange={handleChangePlatformInfo}
                        placeholder="Business URL"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="booking-highlights"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Highlights
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Highlights scrapped from Booking.com
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="booking-highlights"
                        name="bookingHighlights"
                        type="text"
                        autoComplete="off"
                        value={platformForm.bookingHighlights}
                        onChange={handleChangePlatformInfo}
                        placeholder="Highlights"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="booking-summary"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Summary
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Summary scrapped from Booking.com
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="booking-summary"
                        name="bookingHighlights"
                        type="text"
                        autoComplete="off"
                        value={platformForm.bookingSummary}
                        onChange={handleChangePlatformInfo}
                        placeholder="Summary"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-semibold leading-6 text-white">
                  Agoda
                </legend>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="agoda-url"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      URL
                      <span className="text-gray-400 block text-xs mt-1">
                        URL of this business on the Agoda platform
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="agoda-url"
                        name="agodaUrl"
                        type="text"
                        autoComplete="off"
                        value={platformForm.agodaUrl}
                        onChange={handleChangePlatformInfo}
                        placeholder="Business URL"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="agoda-highlights"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Highlights
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Highlights scraped from Agoda
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="agoda-highlights"
                        name="agodaHighlights"
                        type="text"
                        autoComplete="off"
                        value={platformForm.agodaHighlights}
                        onChange={handleChangePlatformInfo}
                        placeholder="Highlights"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="agoda-summary"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Summary
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Summary scraped from Agoda
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="agoda-summary"
                        name="agodaSummary"
                        type="text"
                        autoComplete="off"
                        value={platformForm.agodaSummary}
                        onChange={handleChangePlatformInfo}
                        placeholder="Summary"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-semibold leading-6 text-white">
                  Trip.com
                </legend>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="trip-url"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      URL
                      <span className="text-gray-400 block text-xs mt-1">
                        URL of this business on the Trip.com platform
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="trip-url"
                        name="tripUrl"
                        type="text"
                        autoComplete="off"
                        value={platformForm.tripUrl}
                        onChange={handleChangePlatformInfo}
                        placeholder="Business URL"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="trip-highlights"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Highlights
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Highlights scraped from Trip.com
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="trip-highlights"
                        name="tripHighlights"
                        type="text"
                        autoComplete="off"
                        value={platformForm.tripHighlights}
                        onChange={handleChangePlatformInfo}
                        placeholder="Highlights"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="trip-summary"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Summary
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Summary scraped from Trip.com
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="trip-summary"
                        name="tripSummary"
                        type="text"
                        autoComplete="off"
                        value={platformForm.tripSummary}
                        onChange={handleChangePlatformInfo}
                        placeholder="Summary"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-semibold leading-6 text-white">
                  Trivago
                </legend>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="trivago-url"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      URL
                      <span className="text-gray-400 block text-xs mt-1">
                        URL of this business on the Trivago platform
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="trivago-url"
                        name="trivagoUrl"
                        type="text"
                        autoComplete="off"
                        value={platformForm.trivagoUrl}
                        onChange={handleChangePlatformInfo}
                        placeholder="Business URL"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="trivago-highlights"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Highlights
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Highlights scraped from Trivago
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="trivago-highlights"
                        name="trivagoHighlights"
                        type="text"
                        autoComplete="off"
                        value={platformForm.trivagoHighlights}
                        onChange={handleChangePlatformInfo}
                        placeholder="Highlights"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="trivago-summary"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Summary
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Summary scraped from Trivago
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="trivago-summary"
                        name="trivagoSummary"
                        type="text"
                        autoComplete="off"
                        value={platformForm.trivagoSummary}
                        onChange={handleChangePlatformInfo}
                        placeholder="Summary"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-semibold leading-6 text-white">
                  Expedia
                </legend>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="expedia-url"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      URL
                      <span className="text-gray-400 block text-xs mt-1">
                        URL of this business on the Expedia platform
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="expedia-url"
                        name="expediaUrl"
                        type="text"
                        autoComplete="off"
                        value={platformForm.expediaUrl}
                        onChange={handleChangePlatformInfo}
                        placeholder="Business URL"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="expedia-highlights"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Highlights
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Highlights scraped from Expedia
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="expedia-highlights"
                        name="expediaHighlights"
                        type="text"
                        autoComplete="off"
                        value={platformForm.expediaHighlights}
                        onChange={handleChangePlatformInfo}
                        placeholder="Highlights"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="expedia-summary"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Summary
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Summary scraped from Expedia
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="expedia-summary"
                        name="expediaSummary"
                        type="text"
                        autoComplete="off"
                        value={platformForm.expediaSummary}
                        onChange={handleChangePlatformInfo}
                        placeholder="Summary"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-semibold leading-6 text-white">
                  Perfect Wave
                </legend>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="perfect-wave-url"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      URL
                      <span className="text-gray-400 block text-xs mt-1">
                        URL of this business on the Perfect Wave platform
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="perfect-wave-url"
                        name="perfectWaveUrl"
                        type="text"
                        autoComplete="off"
                        value={platformForm.perfectWaveUrl}
                        onChange={handleChangePlatformInfo}
                        placeholder="Business URL"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="perfect-wave-highlights"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Highlights
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Highlights scraped from Perfect Wave
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="perfect-wave-highlights"
                        name="perfectWaveHighlights"
                        type="text"
                        autoComplete="off"
                        value={platformForm.perfectWaveHighlights}
                        onChange={handleChangePlatformInfo}
                        placeholder="Highlights"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="perfect-wave-summary"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Summary
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Summary scraped from Perfect Wave
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="perfect-wave-summary"
                        name="perfectWaveSummary"
                        type="text"
                        autoComplete="off"
                        value={platformForm.perfectWaveSummary}
                        onChange={handleChangePlatformInfo}
                        placeholder="Summary"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-semibold leading-6 text-white">
                  Luex
                </legend>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="luex-url"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      URL
                      <span className="text-gray-400 block text-xs mt-1">
                        URL of this business on the Luex platform
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="luex-url"
                        name="luexUrl"
                        type="text"
                        autoComplete="off"
                        value={platformForm.luexUrl}
                        onChange={handleChangePlatformInfo}
                        placeholder="Business URL"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="luex-highlights"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Highlights
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Highlights scraped from Luex
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="luex-highlights"
                        name="luexHighlights"
                        type="text"
                        autoComplete="off"
                        value={platformForm.luexHighlights}
                        onChange={handleChangePlatformInfo}
                        placeholder="Highlights"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="luex-summary"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Summary
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Summary scraped from Luex
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="luex-summary"
                        name="luexSummary"
                        type="text"
                        autoComplete="off"
                        value={platformForm.luexSummary}
                        onChange={handleChangePlatformInfo}
                        placeholder="Summary"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-semibold leading-6 text-white">
                  Waterways Surf
                </legend>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="waterways-surf-url"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      URL
                      <span className="text-gray-400 block text-xs mt-1">
                        URL of this business on the Waterways Surf platform
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="waterways-surf-url"
                        name="waterwaysSurfUrl"
                        type="text"
                        autoComplete="off"
                        value={platformForm.waterwaysSurfUrl}
                        onChange={handleChangePlatformInfo}
                        placeholder="Business URL"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="waterways-surf-highlights"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Highlights
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Highlights scraped from Waterways Surf
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="waterways-surf-highlights"
                        name="waterwaysSurfHighlights"
                        type="text"
                        autoComplete="off"
                        value={platformForm.waterwaysSurfHighlights}
                        onChange={handleChangePlatformInfo}
                        placeholder="Highlights"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="waterways-surf-summary"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Summary
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Summary scraped from Waterways Surf
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="waterways-surf-summary"
                        name="waterwaysSurfSummary"
                        type="text"
                        autoComplete="off"
                        value={platformForm.waterwaysSurfSummary}
                        onChange={handleChangePlatformInfo}
                        placeholder="Summary"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-semibold leading-6 text-white">
                  World Surfaris
                </legend>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="world-surfaris-url"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      URL
                      <span className="text-gray-400 block text-xs mt-1">
                        URL of this business on the World Surfaris platform
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="world-surfaris-url"
                        name="worldSurfarisUrl"
                        type="text"
                        autoComplete="off"
                        value={platformForm.worldSurfarisUrl}
                        onChange={handleChangePlatformInfo}
                        placeholder="Business URL"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="world-surfaris-highlights"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Highlights
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Highlights scraped from World Surfaris
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="world-surfaris-highlights"
                        name="worldSurfarisHighlights"
                        type="text"
                        autoComplete="off"
                        value={platformForm.worldSurfarisHighlights}
                        onChange={handleChangePlatformInfo}
                        placeholder="Highlights"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="world-surfaris-summary"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Summary
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Summary scraped from World Surfaris
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="world-surfaris-summary"
                        name="worldSurfarisSummary"
                        type="text"
                        autoComplete="off"
                        value={platformForm.worldSurfarisSummary}
                        onChange={handleChangePlatformInfo}
                        placeholder="Summary"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-semibold leading-6 text-white">
                  AWAVE
                </legend>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="awave-url"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      URL
                      <span className="text-gray-400 block text-xs mt-1">
                        URL of this business on the AWAVE platform
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="awave-url"
                        name="awaveUrl"
                        type="text"
                        autoComplete="off"
                        value={platformForm.awaveUrl}
                        onChange={handleChangePlatformInfo}
                        placeholder="Business URL"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="awave-highlights"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Highlights
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Highlights scraped from AWAVE
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="awave-highlights"
                        name="awaveHighlights"
                        type="text"
                        autoComplete="off"
                        value={platformForm.awaveHighlights}
                        onChange={handleChangePlatformInfo}
                        placeholder="Highlights"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="awave-summary"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Summary
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Summary scraped from AWAVE
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="awave-summary"
                        name="awaveSummary"
                        type="text"
                        autoComplete="off"
                        value={platformForm.awaveSummary}
                        onChange={handleChangePlatformInfo}
                        placeholder="Summary"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-semibold leading-6 text-white">
                  Atoll Travel
                </legend>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="atoll-travel-url"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      URL
                      <span className="text-gray-400 block text-xs mt-1">
                        URL of this business on the Atoll Travel platform
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="atoll-travel-url"
                        name="atollTravelUrl"
                        type="text"
                        autoComplete="off"
                        value={platformForm.atollTravelUrl}
                        onChange={handleChangePlatformInfo}
                        placeholder="Business URL"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="atoll-travel-highlights"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Highlights
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Highlights scraped from Atoll Travel
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="atoll-travel-highlights"
                        name="atollTravelHighlights"
                        type="text"
                        autoComplete="off"
                        value={platformForm.atollTravelHighlights}
                        onChange={handleChangePlatformInfo}
                        placeholder="Highlights"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="atoll-travel-summary"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Summary
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Summary scraped from Atoll Travel
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="atoll-travel-summary"
                        name="atollTravelSummary"
                        type="text"
                        autoComplete="off"
                        value={platformForm.atollTravelSummary}
                        onChange={handleChangePlatformInfo}
                        placeholder="Summary"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-semibold leading-6 text-white">
                  Surf Holidays
                </legend>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="surf-holidays-url"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      URL
                      <span className="text-gray-400 block text-xs mt-1">
                        URL of this business on the Surf Holidays platform
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="surf-holidays-url"
                        name="surfHolidaysUrl"
                        type="text"
                        autoComplete="off"
                        value={platformForm.surfHolidaysUrl}
                        onChange={handleChangePlatformInfo}
                        placeholder="Business URL"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="surf-holidays-highlights"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Highlights
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Highlights scraped from Surf Holidays
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="surf-holidays-highlights"
                        name="surfHolidaysHighlights"
                        type="text"
                        autoComplete="off"
                        value={platformForm.surfHolidaysHighlights}
                        onChange={handleChangePlatformInfo}
                        placeholder="Highlights"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="surf-holidays-summary"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Summary
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Summary scraped from Surf Holidays
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="surf-holidays-summary"
                        name="surfHolidaysSummary"
                        type="text"
                        autoComplete="off"
                        value={platformForm.surfHolidaysSummary}
                        onChange={handleChangePlatformInfo}
                        placeholder="Summary"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-semibold leading-6 text-white">
                  Surfline
                </legend>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="surfline-url"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      URL
                      <span className="text-gray-400 block text-xs mt-1">
                        URL of this business on the Surfline platform
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="surfline-url"
                        name="surflineUrl"
                        type="text"
                        autoComplete="off"
                        value={platformForm.surflineUrl}
                        onChange={handleChangePlatformInfo}
                        placeholder="Business URL"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="surfline-highlights"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Highlights
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Highlights scraped from Surfline
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="surfline-highlights"
                        name="surflineHighlights"
                        type="text"
                        autoComplete="off"
                        value={platformForm.surflineHighlights}
                        onChange={handleChangePlatformInfo}
                        placeholder="Highlights"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="surfline-summary"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Summary
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Summary scraped from Surfline
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="surfline-summary"
                        name="surflineSummary"
                        type="text"
                        autoComplete="off"
                        value={platformForm.surflineSummary}
                        onChange={handleChangePlatformInfo}
                        placeholder="Summary"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-semibold leading-6 text-white">
                  Lush Palm
                </legend>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="lush-palm-url"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      URL
                      <span className="text-gray-400 block text-xs mt-1">
                        URL of this business on the Lush Palm platform
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="lush-palm-url"
                        name="lushPalmUrl"
                        type="text"
                        autoComplete="off"
                        value={platformForm.lushPalmUrl}
                        onChange={handleChangePlatformInfo}
                        placeholder="Business URL"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="lush-palm-highlights"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Highlights
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Highlights scraped from Lush Palm
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="lush-palm-highlights"
                        name="lushPalmHighlights"
                        type="text"
                        autoComplete="off"
                        value={platformForm.lushPalmHighlights}
                        onChange={handleChangePlatformInfo}
                        placeholder="Highlights"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="lush-palm-summary"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Summary
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Summary scraped from Lush Palm
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="lush-palm-summary"
                        name="lushPalmSummary"
                        type="text"
                        autoComplete="off"
                        value={platformForm.lushPalmSummary}
                        onChange={handleChangePlatformInfo}
                        placeholder="Summary"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-semibold leading-6 text-white">
                  Book Surf Camps
                </legend>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="surf-camps-url"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      URL
                      <span className="text-gray-400 block text-xs mt-1">
                        URL of this business on the Book Surf Camps platform
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="surf-camps-url"
                        name="surfCampsUrl"
                        type="text"
                        autoComplete="off"
                        value={platformForm.surfCampsUrl}
                        onChange={handleChangePlatformInfo}
                        placeholder="Business URL"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="surf-camps-highlights"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Highlights
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Highlights scraped from Book Surf Camps
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="surf-camps-highlights"
                        name="surfCampsHighlights"
                        type="text"
                        autoComplete="off"
                        value={platformForm.surfCampsHighlights}
                        onChange={handleChangePlatformInfo}
                        placeholder="Highlights"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="surf-camps-summary"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Summary
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Summary scraped from Book Surf Camps
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="surf-camps-summary"
                        name="surfCampsSummary"
                        type="text"
                        autoComplete="off"
                        value={platformForm.surfCampsSummary}
                        onChange={handleChangePlatformInfo}
                        placeholder="Summary"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-sm font-semibold leading-6 text-white">
                  Thermal
                </legend>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="thermal-url"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      URL
                      <span className="text-gray-400 block text-xs mt-1">
                        URL of this business on the Thermal platform
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="thermal-url"
                        name="thermalUrl"
                        type="text"
                        autoComplete="off"
                        value={platformForm.thermalUrl}
                        onChange={handleChangePlatformInfo}
                        placeholder="Business URL"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="thermal-highlights"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Highlights
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Highlights scraped from Thermal
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="thermal-highlights"
                        name="thermalHighlights"
                        type="text"
                        autoComplete="off"
                        value={platformForm.thermalHighlights}
                        onChange={handleChangePlatformInfo}
                        placeholder="Highlights"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="thermal-summary"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Summary
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Summary scraped from Thermal
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="thermal-summary"
                        name="thermalSummary"
                        type="text"
                        autoComplete="off"
                        value={platformForm.thermalSummary}
                        onChange={handleChangePlatformInfo}
                        placeholder="Summary"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-semibold leading-6 text-white">
                  Stoked Surf Adventures
                </legend>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="stoked-surf-url"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      URL
                      <span className="text-gray-400 block text-xs mt-1">
                        URL of this business on the Stoked Surf Adventures
                        platform
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="stoked-surf-url"
                        name="stokedSurfUrl"
                        type="text"
                        autoComplete="off"
                        value={platformForm.stokedSurfUrl}
                        onChange={handleChangePlatformInfo}
                        placeholder="Business URL"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="stoked-surf-highlights"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Highlights
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Highlights scraped from Stoked Surf Adventures
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="stoked-surf-highlights"
                        name="stokedSurfHighlights"
                        type="text"
                        autoComplete="off"
                        value={platformForm.stokedSurfHighlights}
                        onChange={handleChangePlatformInfo}
                        placeholder="Highlights"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="stoked-surf-summary"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Summary
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Summary scraped from Stoked Surf Adventures
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="stoked-surf-summary"
                        name="stokedSurfSummary"
                        type="text"
                        autoComplete="off"
                        value={platformForm.stokedSurfSummary}
                        onChange={handleChangePlatformInfo}
                        placeholder="Summary"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-semibold leading-6 text-white">
                  Soul Surf Travel
                </legend>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="soul-surf-url"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      URL
                      <span className="text-gray-400 block text-xs mt-1">
                        URL of this business on the Soul Surf Travel platform
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="soul-surf-url"
                        name="soulSurfUrl"
                        type="text"
                        autoComplete="off"
                        value={platformForm.soulSurfUrl}
                        onChange={handleChangePlatformInfo}
                        placeholder="Business URL"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="soul-surf-highlights"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Highlights
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Highlights scraped from Soul Surf Travel
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="soul-surf-highlights"
                        name="soulSurfHighlights"
                        type="text"
                        autoComplete="off"
                        value={platformForm.soulSurfHighlights}
                        onChange={handleChangePlatformInfo}
                        placeholder="Highlights"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="soul-surf-summary"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Summary
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Summary scraped from Soul Surf Travel
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="soul-surf-summary"
                        name="soulSurfSummary"
                        type="text"
                        autoComplete="off"
                        value={platformForm.soulSurfSummary}
                        onChange={handleChangePlatformInfo}
                        placeholder="Summary"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-semibold leading-6 text-white">
                  SurfersHype
                </legend>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="surfershype-url"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      URL
                      <span className="text-gray-400 block text-xs mt-1">
                        URL of this business on the SurfersHype platform
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="surfershype-url"
                        name="surfersHypeUrl"
                        type="text"
                        autoComplete="off"
                        value={platformForm.surfersHypeUrl}
                        onChange={handleChangePlatformInfo}
                        placeholder="Business URL"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="surfershype-highlights"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Highlights
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Highlights scraped from SurfersHype
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="surfershype-highlights"
                        name="surfersHypeHighlights"
                        type="text"
                        autoComplete="off"
                        value={platformForm.surfersHypeHighlights}
                        onChange={handleChangePlatformInfo}
                        placeholder="Highlights"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="surfershype-summary"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Summary
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Summary scraped from SurfersHype
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="surfershype-summary"
                        name="surfersHypeSummary"
                        type="text"
                        autoComplete="off"
                        value={platformForm.surfersHypeSummary}
                        onChange={handleChangePlatformInfo}
                        placeholder="Summary"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-semibold leading-6 text-white">
                  Nomad Surfers
                </legend>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="nomad-surfer-url"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      URL
                      <span className="text-gray-400 block text-xs mt-1">
                        URL of this business on the Nomad Surfers platform
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="nomad-surfer-url"
                        name="nomadSurferUrl"
                        type="text"
                        autoComplete="off"
                        value={platformForm.nomadSurferUrl}
                        onChange={handleChangePlatformInfo}
                        placeholder="Business URL"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="nomad-surfer-highlights"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Highlights
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Highlights scraped from Nomad Surfers
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="nomad-surfer-highlights"
                        name="nomadSurferHighlights"
                        type="text"
                        autoComplete="off"
                        value={platformForm.nomadSurferHighlights}
                        onChange={handleChangePlatformInfo}
                        placeholder="Highlights"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="nomad-surfer-summary"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Summary
                      <span className="text-gray-400 block text-xs mt-1">
                        Business Summary scraped from Nomad Surfers
                      </span>
                    </label>
                    <div className="mt-2">
                      <input
                        id="nomad-surfer-summary"
                        name="nomadSurferSummary"
                        type="text"
                        autoComplete="off"
                        value={platformForm.nomadSurferSummary}
                        onChange={handleChangePlatformInfo}
                        placeholder="Summary"
                        className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
          </div>
          <div className="flex items-center justify-end gap-x-6 border-t border-gray-500/10 px-4 py-4 sm:px-8">
            <button
              type="button"
              className="text-sm font-semibold leading-6 text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Save
            </button>
          </div>
        </form>
      </div> */}
    </div>
  );
}
