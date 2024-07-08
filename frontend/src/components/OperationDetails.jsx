import { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import SpinnerOverlay from "./SpinnerOverlay";
import Spinner from "./Spinner";

function OperationDetails() {
  const { id } = useParams();
  const [operation, setOperation] = useState(null);
  const [isLoading, setisLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  const { token, setUser, setToken } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOperation();
  }, []);

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  const fetchOperation = async () => {
    setisLoading(true);
    try {
      const { data } = await axios.get(`/api/operations/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOperation(data);
    } catch (error) {
      if (error.response && error.response.status == "401") {
        toast.info("Please login again as your token has expired");
        setUser(null);
        setToken(null);
        navigate("/login");
      } else {
        toast.error("Failed to fetch operation details");
      }
    } finally {
      setisLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm("Are you sure you'd like to cancel this operation ?")) {
      setIsCancelling(true);
      try {
        await axios.put(
          `/api/operations/${id}/cancel`,
          {},
          {
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success("Operation cancelled");
        fetchOperation();
      } catch (error) {
        if (error.response && error.response.status == "401") {
          toast.info("Please login again as your token has expired");
          setUser(null);
          setToken(null);
          navigate("/login");
        } else {
          toast.error("Failed to cancel operation");
        }
      } finally {
        setIsCancelling(false);
      }
    }
  };

  if (isLoading) return <SpinnerOverlay />;

  return (
    <div className="space-y-10 divide-y divide-gray-900/10  px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
        <div className="px-4 sm:px-0">
          <h2 className="text-base font-semibold leading-7 text-white">
            Operation Details
          </h2>
        </div>

        <div className="bg-gray-800 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
          <div className="px-4 py-6 sm:p-8">
            <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-6 w-full">
              <div className="sm:col-span-6 border-b py-4 border-gray-700 w-full">
                <div className="block text-xs font-medium leading-6 text-white">
                  Operation Type
                </div>
                <div className="mt-0">
                  <div className="text-white text-base">
                    <p>{operation.type}</p>
                  </div>
                </div>
              </div>
              <div className="sm:col-span-6 border-b py-4 border-gray-700 w-full">
                <div className="block text-xs font-medium leading-6 text-white">
                  Operation Status
                </div>
                <div className="mt-0">
                  <div className="text-white text-base">
                    <div
                      className={classNames(
                        operation.status == "timed-out" && "text-red-700",
                        operation.status == "queued" && "text-gray-500",
                        operation.status == "finished" && "text-green-500",
                        operation.status == "cancelled" && "text-red-500",
                        operation.status == "running" && "text-green-500",
                        "hidden sm:block capitalize"
                      )}
                    >
                      {operation.status}
                    </div>

                    {(operation.status == "running" ||
                      operation.status == "queued") && (
                      <button
                        className={classNames(
                          isCancelling && "pointer-events-none opacity-50",
                          "bg-gray-500 px-2 py-1 text-sm rounded transition opacity-70 hover:opacity-100 cursor-pointer text-white flex gap-2 items-center mt-2"
                        )}
                        disabled={isCancelling}
                        onClick={handleCancel.bind(this, operation._id)}
                      >
                        {isCancelling && (
                          <Spinner width="w-4" height="h-4" border="border-2" />
                        )}
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {operation.status == "running" && (
                <div className="sm:col-span-6 border-b py-4 border-gray-700 w-full">
                  <div className="block text-xs font-medium leading-6 text-white">
                    Listings Scraped
                  </div>
                  <div className="mt-0">
                    <div className="text-white text-base">
                      {operation.processedListings || 0}
                    </div>
                  </div>
                </div>
              )}
              <div className="sm:col-span-6 border-b py-4 border-gray-700 w-full">
                <div className="block text-xs font-medium leading-6 text-white">
                  Listings To Be Scrapped
                </div>
                <div className="mt-0">
                  <div className="text-white text-base">
                    <div className="flex flex-col">
                      {operation.listings.map((listing, index) => (
                        <Link
                          key={`listing-${index}`}
                          to={`/dashboard/business/${listing._id}`}
                          className="text-blue-500 text-sm hover:underline"
                        >
                          {listing.businessName}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {operation.startedAt && (
                <div className="sm:col-span-6 border-b py-4 border-gray-700 w-full">
                  <div className="block text-xs font-medium leading-6 text-white">
                    Started At
                  </div>
                  <div className="mt-0">
                    <div className="text-white text-base">
                      {new Date(operation.startedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
              {operation.finishedAt && (
                <div className="sm:col-span-6 border-b py-4 border-gray-700 w-full">
                  <div className="block text-xs font-medium leading-6 text-white">
                    Finished At
                  </div>
                  <div className="text-white text-base">
                    {new Date(operation.finishedAt).toLocaleString()}
                  </div>
                </div>
              )}

              <div className="sm:col-span-6 border-b py-4 border-gray-700 w-full">
                <div className="block text-xs font-medium leading-6 text-white">
                  Initiated By
                </div>
                <div className="mt-0">
                  <div className="text-white text-base">
                    {operation.initiatedBy && operation.initiatedBy.name ? (
                      <div className="flex justify-between w-full max-w-[350px]">
                        <div>{operation.initiatedBy.name}</div>
                        <div className="h-[20px] w-[1px] bg-gray-600"></div>
                        <div>{operation.initiatedBy.email}</div>
                      </div>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </div>
                </div>
              </div>
              {operation.errorListings.length ? (
                <div className="sm:col-span-6 border-b py-4 border-gray-700 w-full">
                  <div className="block text-xs font-medium leading-6 text-white">
                    Error Logs
                  </div>
                  <div className="mt-0">
                    <div className="text-white text-base">
                      {operation.errorListings.map((errorLog) => (
                        <div
                          className="flex gap-4"
                          key={`listing-${errorLog.listingId._id}`}
                        >
                          <p className="text-lg">
                            {errorLog.listingId.businessName}
                          </p>
                          <div className="flex flex-col gap-2">
                            {errorLog.errors.map((error, index) => (
                              <p
                                className="text-red-500"
                                key={`listing-error-${index}`}
                              >
                                {error}
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OperationDetails;
