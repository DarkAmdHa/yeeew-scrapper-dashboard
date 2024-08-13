import { useContext, useState } from "react";
import { Dialog } from "@headlessui/react";
import { AppContext } from "../context/AppContext";
import { createListing } from "../utils/createListing";
import { toast } from "react-toastify";
import Spinner from "./Spinner";

export default function CreateListingModal({ onClose }) {
  const [open, setOpen] = useState(true);
  const [businessName, setBusinessName] = useState("");
  const [businessLocation, setBusinessLocation] = useState("");
  const [businessURL, setBusinessUrl] = useState("");
  const [errors, setErrors] = useState({});

  const [isAdding, setIsAdding] = useState(false);
  const { token } = useContext(AppContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = {};
    if (!businessName) {
      validationErrors.businessName = "Business name is required.";
    }

    if (!businessLocation)
      validationErrors.businessLocation = "Business location is required.";

    const urlPattern = new RegExp(
      "^(https?:\\/\\/)?" +
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" +
        "((\\d{1,3}\\.){3}\\d{1,3}))" +
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +
        "(\\?[;&a-z\\d%_.~+=-]*)?" +
        "(\\#[-a-z\\d_]*)?$",
      "i"
    );

    if (businessURL && !urlPattern.test(businessURL)) {
      validationErrors.businessURL = "Please enter a valid URL.";
    }
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length != 0) {
      return;
    }

    try {
      setIsAdding(true);
      const data = await createListing(
        { businessName, businessURL, businessLocation },
        token
      );

      setOpen(false);
      if (onClose) onClose(true);
      toast.success("Listing created successfully.");
    } catch (error) {
      console.error("Listing could not be created: ", error);
      toast.error("Listing could not be created.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    if (onClose) onClose();
  };

  const handleClose = () => {
    setOpen(false);
    if (onClose) onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-[51]">
      <Dialog.Backdrop
        transition
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in z-50"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <Dialog.Panel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-sm sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div>
              <div className="mt-3 text-center sm:mt-5">
                <Dialog.Title
                  as="h3"
                  className="text-base font-semibold leading-6 text-gray-900"
                >
                  Enter Business Details
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    A business name is required in order to find data about the
                    business. The URL is optional, but can help in getting
                    better data.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="businessName"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2">
                    <input
                      id="businessName"
                      name="businessName"
                      type="businessName"
                      placeholder="Business Name"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      required
                      autoComplete="business-name"
                      className="block w-full rounded-md border-2 bg-white/5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 px-2"
                    />
                    {errors.businessName && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.businessName}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="businessLocation"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Business Location <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2">
                    <input
                      id="businessLocation"
                      name="businessLocation"
                      type="businessLocation"
                      placeholder="Business Name"
                      value={businessLocation}
                      onChange={(e) => setBusinessLocation(e.target.value)}
                      required
                      autoComplete="business-location"
                      className="block w-full rounded-md border-2 bg-white/5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 px-2"
                    />
                    {errors.businessLocation && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.businessLocation}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="businessURL"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Business URL
                  </label>
                  <div className="mt-2">
                    <input
                      id="businessURL"
                      name="businessURL"
                      type="businessURL"
                      placeholder="Business URL"
                      value={businessURL}
                      onChange={(e) => setBusinessUrl(e.target.value)}
                      autoComplete="business-url"
                      className="block w-full px-2 border-2 rounded-md bg-white/5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                    />
                    {errors.businessURL && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.businessURL}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 sm:mt-6 flex gap-4 w-1/2 ml-auto">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex w-full justify-center rounded-md bg-gray-400 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    {isAdding ? (
                      <Spinner width="w-6" height="h-6" border="border-2" />
                    ) : (
                      "Create"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}
