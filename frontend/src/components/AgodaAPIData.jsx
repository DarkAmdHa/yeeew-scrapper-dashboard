import { clsx } from "yet-another-react-lightbox";
import APIContent from "./APIContent";
import Spinner from "./Spinner";
import { ArrowPathIcon } from "@heroicons/react/20/solid";
import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import ConfirmationModal from "./ConfirmationModal";

function AgodaAPIData({ agodaData, listingId, listingName }) {
  const [isRefetching, setIsRefetching] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [customName, setCustomName] = useState(listingName);
  const [inputError, setInputError] = useState("");
  const { token } = useContext(AppContext);
  const navigate = useNavigate();

  const refetchReviews = async () => {
    if (isRefetching) return;
    if (!customName) {
      setInputError("A business name is required");
      return;
    }
    setShowModal(false);
    setIsRefetching(true);
    setInputError("");
    try {
      //Refetch Reviews
      const { data } = await axios.post(
        `/api/listing/${listingId}/refetchAgoda`,
        {
          customName,
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
      toast.error("Failed to refetch Agoda data");
    } finally {
      setIsRefetching(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setInputError("");
  };

  return (
    <div className=" py-6 sm:py-4">
      <div className="grid grid-cols-1 gap-x-2 gap-y-4 sm:grid-cols-6">
        <div className="col-span-6 flex justify-between items-center">
          <div className="block text-2xl font-medium leading-6 text-white">
            Agoda Data
          </div>
          <button
            onClick={() => {
              setShowModal(true);
            }}
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
            Refetch On Agoda
          </button>
        </div>
        <div className="col-span-6 h-[1px] w-full bg-gray-500"></div>

        {agodaData ? (
          <>
            <p className="text-sm text-white col-span-4">
              This data is coming from the Agoda Data File (CSV).
            </p>
            <APIContent content={agodaData.id} heading="Agoda Hotel Id" />
            <APIContent
              content={agodaData.data.hotelName}
              heading="Hotel Name"
            />
            <APIContent content={agodaData.data.address} heading="Address" />
            <APIContent content={agodaData.data.zipCode} heading="Zip Code" />
            <APIContent content={agodaData.data.city} heading="City" />
            <APIContent content={agodaData.data.state} heading="State" />
            <APIContent content={agodaData.data.country} heading="Country" />
            <APIContent
              content={agodaData.data.longitude}
              heading="Longitude"
            />
            <APIContent content={agodaData.data.latitude} heading="Latitude" />
            <APIContent content={agodaData.data.url} heading="Affiliate URL" />
            <APIContent
              content={agodaData.data.numberOfRooms}
              heading="Number Of Rooms"
            />
            <APIContent content={agodaData.data.overview} heading="Overview" />
            <APIContent
              content={agodaData.data.numberOfReviews}
              heading="Number Of Reviews"
            />
            <APIContent
              content={agodaData.data.accommodationType}
              heading="Accommodation Type"
            />
          </>
        ) : (
          <p className="text-sm text-white col-span-4">
            Looks like this business could not be found on Agoda. Please check
            the business name.
          </p>
        )}

        {showModal && (
          <ConfirmationModal
            ctaText={"Refetch On Agoda"}
            onCancel={handleClose}
            onAccept={refetchReviews}
            heading="Would you like to change the name by which the listing is to be looked up on Agoda's Data File ?"
            text="Sometimes, the name you used to create the listing is different than the one used on Agoda's Data File. Change the name by which to look up the business here."
            mode=""
            inputValue={customName}
            onInputValueChange={setCustomName}
            inputError={inputError}
          />
        )}
      </div>
    </div>
  );
}

export default AgodaAPIData;
