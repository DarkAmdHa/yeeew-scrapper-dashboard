import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import Spinner from "./Spinner";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

export default function RunningOperation() {
  const [runningOperation, setRunningOperation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  const { token } = useContext(AppContext);

  useEffect(() => {
    const fetchRunningOperation = async (firstTime = false) => {
      if (firstTime) setIsLoading(true);
      try {
        const { data } = await axios.get("/api/operations/recent-scrape", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (data._id) {
          setRunningOperation(data);
        } else {
          setRunningOperation(null);
        }
      } catch (error) {
        console.error("Error fetching running operation:", error);
      } finally {
        if (firstTime) setIsLoading(false);
      }
    };

    fetchRunningOperation(true);
    const interval = setInterval(fetchRunningOperation, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleCancelOperation = async () => {
    if (!runningOperation) return;
    if (window.confirm("Are you sure you'd like to cancel this operation ?")) {
      try {
        await axios.put(
          `/api/operations/${runningOperation._id}/cancel`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success("Operation cancelled successfully");
        setRunningOperation(null);
      } catch (error) {
        toast.error("Error cancelling operation");
        console.error("Error cancelling operation:", error);
      }
    }
  };

  return (
    <div className="fixed bottom-4 hidden lg:block left-1/2 -translate-x-1/2 bg-gray-800 text-white rounded-lg p-4 shadow-lg z-50 w-72">
      <h3
        className="text-md font-semibold mb-2 flex justify-between items-center cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <span>Currently Running Operation</span>
        {runningOperation && <p className=" text-green-500">(1)</p>}
        <ChevronDownIcon
          className={`w-5 h-5 transform transition-transform ${
            !showDetails ? "rotate-180" : "rotate-0"
          }`}
        />
      </h3>
      {isLoading ? (
        <div className="w-full flex justify-center items-center py-2">
          <Spinner width="w-12" height="h-12" />
        </div>
      ) : runningOperation ? (
        showDetails && (
          <div>
            <div className="relative pt-1  mb-4">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-200">
                <div
                  style={{
                    width: `${
                      (runningOperation.processedListings /
                        runningOperation.totalListings) *
                      100
                    }%`,
                  }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                ></div>
              </div>
              <p className="text-gray-500 text-sm">
                Scraped {runningOperation.processedListings || 0} of{" "}
                {runningOperation.totalListings}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <Link
                to={`/dashboard/operations/${runningOperation._id}`}
                className="text-blue-500 hover:underline"
              >
                View Details
              </Link>
              <button
                onClick={handleCancelOperation}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )
      ) : (
        <p className="text-gray-500">No operation currently underway</p>
      )}
    </div>
  );
}
