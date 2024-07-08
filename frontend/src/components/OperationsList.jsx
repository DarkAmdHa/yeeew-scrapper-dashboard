import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
// import usePolling from "../hooks/usePolling";
import { AppContext } from "../context/AppContext";
import Pagination from "./Pagination";
import Spinner from "./Spinner";
import { ArrowRightCircleIcon } from "@heroicons/react/20/solid";

function OperationsList() {
  const [operations, setOperations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [isCancelling, setIsCancelling] = useState(false);

  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  useEffect(() => {
    const page = searchParams.get("page");
    if (page) {
      setCurrentPage(+page);
    }
  }, [searchParams]);

  const { token, setUser, setToken } = useContext(AppContext);

  const fetchRunningOperation = async () => {
    try {
      const { data } = await axios.get("/api/operations/recent-export", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (data && data.length > 0) {
        // Perform necessary actions with the running operation data
      }
    } catch (error) {
      if (error.response && error.response.status == "401") {
        toast.info("Please login again as your token has expired");
        setUser(null);
        setToken(null);
        navigate("/login");
      } else {
        toast.error("Failed to fetch running operation");
      }
    }
  };

  // usePolling(fetchRunningOperation, 5000); // Poll every 5 seconds

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  useEffect(() => {
    fetchOperations();
  }, [currentPage]);

  const fetchOperations = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`/api/operations?page=${currentPage}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setOperations(data.operations);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch (error) {
      if (error.response && error.response.status == "401") {
        toast.info("Please login again as your token has expired");
        setUser(null);
        setToken(null);
        navigate("/login");
      } else {
        toast.error("Failed to fetch operations");
      }
    } finally {
      setIsLoading(false);
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
        fetchOperations();
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

  return (
    <div>
      <header className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 sticky top-0 bg-gray-900">
        <h1 className="text-base font-semibold leading-7 text-white">
          Operations
        </h1>
      </header>
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Spinner width="w-12" height="h-12" />
        </div>
      ) : !operations.length ? (
        <div className="text-center py-8">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="mx-auto h-12 w-12 text-gray-400"
          >
            <path
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-white">
            No Operations Initiated Yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by heading to the dashboard.
          </p>
          <div className="mt-6">
            <Link
              to="/dashboard"
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <ArrowRightCircleIcon
                aria-hidden="true"
                className="-ml-0.5 mr-1.5 h-5 w-5"
              />
              Head To Businesses
            </Link>
          </div>
        </div>
      ) : (
        <div className=" border-white/10">
          <table className="w-full whitespace-nowrap text-left">
            <colgroup>
              <col className="w-full sm:w-4/12" />
              <col className="lg:w-4/12" />
              <col className="lg:w-2/12" />
              <col className="lg:w-1/12" />
              <col className="lg:w-1/12" />
            </colgroup>
            <thead className="border-b border-white/10 text-sm leading-6 text-white">
              <tr>
                <th
                  scope="col"
                  className="hidden py-2 px-8 font-semibold sm:table-cell"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="hidden py-2 pl-0 pr-8 font-semibold sm:table-cell"
                >
                  Total Listings
                </th>
                <th
                  scope="col"
                  className="py-2 pl-0 pr-4 text-right font-semibold sm:pr-8 sm:text-left lg:pr-20"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="hidden py-2 pl-0 pr-8 font-semibold md:table-cell lg:pr-20"
                >
                  Initiated By
                </th>
                <th
                  scope="col"
                  className="hidden py-2 pl-0 pr-8 font-semibold md:table-cell lg:pr-20"
                ></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {operations.map((operation) => (
                <tr
                  key={operation._id}
                  className="transition hover:bg-slate-800"
                >
                  <td className="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8 flex">
                    <div className="flex items-center gap-x-4">
                      <Link to={`/dashboard/operations/${operation._id}`}>
                        <div className="truncate text-sm font-medium leading-6 text-white flex">
                          {operation.type}
                        </div>
                      </Link>
                    </div>
                  </td>
                  <td>
                    <Link
                      to={`/dashboard/operations/${operation._id}`}
                      className="hidden py-4 pl-0 pr-4 sm:flex sm:pr-8"
                    >
                      <div className="flex gap-x-3">
                        <div className="font-mono text-sm leading-6 text-blue-400 overflow-ellipsis max-w-12">
                          {operation.totalListings}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td>
                    <Link
                      to={`/dashboard/operations/${operation._id}`}
                      className="py-4 pl-0 pr-4 text-sm leading-6 sm:pr-8 lg:pr-20 flex"
                    >
                      <div className="flex items-center justify-end gap-x-2 sm:justify-start">
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
                      </div>
                    </Link>
                  </td>
                  <td>
                    <Link
                      to={`/dashboard/operations/${operation._id}`}
                      className="hidden py-4 pl-0 pr-8 text-sm leading-6 text-gray-400 md:flex lg:pr-20"
                    >
                      {operation.initiatedBy && operation.initiatedBy.name ? (
                        operation.initiatedBy.name
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </Link>
                  </td>
                  <td>
                    {(operation.status == "running" ||
                      operation.status == "queued") && (
                      <button
                        className={classNames(
                          isCancelling && "pointer-events-none opacity-50",
                          "bg-gray-500 px-2 py-1 text-sm rounded transition opacity-70 hover:opacity-100 cursor-pointer text-white flex gap-2 items-center"
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            perPage={10}
            prefixLink="/dashboard/operations"
          />
        </div>
      )}
    </div>
  );
}

export default OperationsList;
