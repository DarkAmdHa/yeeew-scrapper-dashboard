import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";
import {
  ChevronUpDownIcon,
  PlayCircleIcon,
  TrashIcon,
  PlusCircleIcon,
  CheckIcon,
} from "@heroicons/react/20/solid";
import { Fragment } from "react";
import { ArrowRightEndOnRectangleIcon } from "@heroicons/react/16/solid";
import Pagination from "../components/Pagination";
import ConfirmationModal from "../components/ConfirmationModal";
import { getListings } from "../utils/getListings";
import { AppContext } from "../context/AppContext";
import CreateListingModal from "../components/CreateListingModal";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";
import axios from "axios";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function DashboardHome() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [confirm2, setConfirm2] = useState(false);
  const [confirm3, setConfirm3] = useState(false);
  const [currentPage, setCurrentPage] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sortBy, setSortBy] = useState("");
  const [regionFilters, setRegionFilters] = useState([]);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const pageParam = searchParams.get("page");
    const sortByParam = searchParams.get("sortBy");
    const regionFilterParam = searchParams.get("regionFilter");
    if (pageParam) {
      setCurrentPage(+pageParam);
    } else {
      setCurrentPage(1);
    }
    if (sortByParam) {
      setSortBy(sortByParam);
    }
    if (regionFilterParam) {
      setRegionFilters(regionFilterParam.split(","));
    }
  }, [searchParams]);

  const { token, setUser, setToken } = useContext(AppContext);

  const onCloseCreateModal = (created = false) => {
    setShowCreateModal(false);
    if (created) fetchListings();
  };

  const handleClose = (modal) => {
    setTimeout(() => {
      if (modal == "delete") setConfirm(false);
      if (modal == "export") setConfirm2(false);
      if (modal == "run") setConfirm3(false);
    }, 500);
  };

  const handleRun = async () => {
    setConfirm3(false);
    setLoading(true);
    try {
      const { data } = await axios.post(
        `/api/operations`,
        {
          data: {
            type: "Scrape",
            listings: selectedItems,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Scraping Operation Queued");
    } catch (error) {
      if (error.response && error.response.status == "401") {
        toast.info("Please login again as your token has expired");
        setUser(null);
        setToken(null);
        navigate("/login");
      } else {
        toast.error("Failed to create operation");
      }
    } finally {
      setSelectedItems([]);

      setLoading(false);
    }
  };
  const handleDelete = async () => {
    setConfirm(false);
    setLoading(true);
    try {
      const { data } = await axios.post(
        `/api/listing/delete-listings`,
        {
          data: {
            listings: selectedItems,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchListings();

      toast.success("Listings Deleted");
    } catch (error) {
      if (error.response && error.response.status == "401") {
        toast.info("Please login again as your token has expired");
        setUser(null);
        setToken(null);
        navigate("/login");
      } else {
        toast.error("Failed to delete listings");
      }
    } finally {
      setSelectedItems([]);
      setLoading(false);
    }
  };
  const handleExport = async () => {
    setConfirm2(false);
    setLoading(true);
    try {
      const { data } = await axios.post(
        `/api/operations`,
        {
          data: {
            type: "Export",
            listings: selectedItems,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Export Operation Queued");
    } catch (error) {
      if (error.response && error.response.status == "401") {
        toast.info("Please login again as your token has expired");
        setUser(null);
        setToken(null);
        navigate("/login");
      } else {
        toast.error("Failed to create operation");
      }
    } finally {
      setSelectedItems([]);

      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && currentPage) fetchListings();
  }, [currentPage, token, sortBy, regionFilters]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const data = await getListings(
        currentPage,
        10,
        sortBy,
        regionFilters,
        token
      );
      setListings(data.listings);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch (error) {
      console.error("Failed to fetch listings:", error);

      if (error.response && error.response.status == "401") {
        toast.info("Please login again as your token has expired");
        setUser(null);
        setToken(null);

        navigate("/login");
      } else {
        toast.error("Error fetching user data");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((item) => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleSortBy = (criteria) => {
    setSortBy(criteria);
    setCurrentPage(1);
    setSearchParams((prev) => ({
      ...prev,
      sortBy: criteria,
    }));
  };

  const handleRegionFilter = (value) => {
    let newRegionFilters;
    if (!regionFilters.includes(value)) {
      newRegionFilters = [...regionFilters, value];
    } else {
      newRegionFilters = regionFilters.filter((item) => item != value);
    }
    setRegionFilters(newRegionFilters);

    setSearchParams((prev) => ({
      ...prev,
      regionFilter: newRegionFilters.join(","),
    }));
  };
  const runScrapper = () => {
    console.log("Running");
    setConfirm3(true);
  };

  const exportToYeeew = () => {
    console.log("Running");
    setConfirm2(true);
  };

  const deleteBusinesses = () => {
    console.log("Running");
    setConfirm(true);
  };

  const sortOptions = [
    {
      name: "Business Name",
      value: "businessName",
    },
    {
      name: "Date Added",
      value: "-createdAt",
    },
    {
      name: "Scraped",
      value: "scraped",
    },
    {
      name: "Not Scraped",
      value: "notScraped",
    },
  ];

  const regionOptions = [
    {
      name: "Bali",
      value: "/bali",
    },
    {
      name: "Indonesia",
      value: "/indonesia",
    },
    {
      name: "Asia",
      value: "/asia",
    },
    {
      name: "Central Africa",
      value: "/central-africa",
    },
    {
      name: "Ghana",
      value: "/ghana",
    },
    {
      name: "Ivory Coast",
      value: "/ivory-coast",
    },
    {
      name: "Morocco",
      value: "/morocco",
    },
    {
      name: "Madagascar",
      value: "/madagascar",
    },
    {
      name: "Mozambique",
      value: "/mozambique",
    },
    {
      name: "Namibia",
      value: "/namibia",
    },
    {
      name: "South Africa",
      value: "/south-africa",
    },
    {
      name: "West Africa",
      value: "/west-africa",
    },
    {
      name: "China",
      value: "/china",
    },
    {
      name: "Japan",
      value: "/japan",
    },
    {
      name: "Korea",
      value: "/korea",
    },
    {
      name: "Philippines",
      value: "/philippines",
    },
    {
      name: "Malaysia",
      value: "/malaysia",
    },
    {
      name: "Thailand",
      value: "/thailand",
    },
    {
      name: "Vietnam",
      value: "/vietnam",
    },
    {
      name: "Taiwan",
      value: "/taiwan",
    },
    {
      name: "Australia",
      value: "/australia",
    },
    {
      name: "Caribbean",
      value: "/caribbean",
    },
    {
      name: "Bermuda",
      value: "/bermuda",
    },
    {
      name: "Bahamas",
      value: "/bahamas",
    },
    {
      name: "Cuba",
      value: "/cuba",
    },
    {
      name: "Dominican Republic",
      value: "/dominican-republic",
    },
    {
      name: "Haiti",
      value: "/haiti",
    },
    {
      name: "Jamaica",
      value: "/jamaica",
    },
    {
      name: "US Virgin Islands",
      value: "/us-virgin-islands",
    },
    {
      name: "Venezuela",
      value: "/venezuela",
    },
    {
      name: "Trinidad and Tobago",
      value: "/trinidad-tobago",
    },
    {
      name: "Barbados",
      value: "/barbados",
    },
    {
      name: "Martinique",
      value: "/martinique",
    },
    {
      name: "Central America",
      value: "/central-america",
    },
    {
      name: "El Salvador",
      value: "/el-salvador",
    },
    {
      name: "Guatemala",
      value: "/guatemala",
    },
    {
      name: "Costa Rica",
      value: "/costa-rica",
    },
    {
      name: "Nicaragua",
      value: "/nicaragua",
    },
    {
      name: "Panama",
      value: "/panama",
    },
    {
      name: "Baja California",
      value: "/baja-california",
    },
    {
      name: "Colima and Michoacan",
      value: "/colima-michoacan",
    },
    {
      name: "Oaxaca",
      value: "/oaxaca",
    },
    {
      name: "Sinaloa",
      value: "/sinaloa",
    },
    {
      name: "Europe",
      value: "/europe",
    },
    {
      name: "Algarve",
      value: "/algarve",
    },
    {
      name: "Azores",
      value: "/azores",
    },
    {
      name: "Baltic Sea",
      value: "/baltic-sea",
    },
    {
      name: "Canary Islands",
      value: "/canary-islands",
    },
    {
      name: "France",
      value: "/france",
    },
    {
      name: "Germany",
      value: "/germany",
    },
    {
      name: "Greece",
      value: "/greece",
    },
    {
      name: "Iceland",
      value: "/iceland",
    },
    {
      name: "Italy",
      value: "/italy",
    },
    {
      name: "Madeira",
      value: "/madeira",
    },
    {
      name: "Netherlands",
      value: "/netherlands",
    },
    {
      name: "Norway",
      value: "/norway",
    },
    {
      name: "Portugal",
      value: "/portugal",
    },
    {
      name: "Russia",
      value: "/russia",
    },
    {
      name: "Chile",
      value: "/chile",
    },
  ];

  return (
    <div className="max-h-[90vh] overflow-auto">
      <header className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 sticky top-0 bg-gray-900">
        <h1 className="text-base font-semibold leading-7 text-white">
          Businesses
        </h1>
        {confirm && (
          <ConfirmationModal
            ctaText={"Delete"}
            onCancel={handleClose.bind(this, "delete")}
            onAccept={handleDelete}
            heading="Are you sure ?"
            text="These business listings will be deleted."
            mode="danger"
          />
        )}
        {confirm2 && (
          <ConfirmationModal
            ctaText={"Export"}
            onCancel={handleClose.bind(this, "export")}
            onAccept={handleExport}
            heading="Are you sure ?"
            text="These business listings will be exported to Yeeew! with their scrapped data."
            mode=""
          />
        )}
        {confirm3 && (
          <ConfirmationModal
            ctaText={"Run Scrapper"}
            onCancel={handleClose.bind(this, "run")}
            onAccept={handleRun}
            heading="Are you sure ?"
            text="A new scrapping job will be queued up."
            mode=""
          />
        )}
        <div className=" items-center space-x-2 hidden lg:flex">
          <button
            onClick={(e) => setShowCreateModal(true)}
            className="bg-white text-black items-center rounded shadow-lg px-4 py-2 transition hover:bg-gray-400 cursor-pointer flex  gap-2 font-semibold"
          >
            <PlusCircleIcon width={20} /> New Listing
          </button>
          {selectedItems.length > 0 && (
            <>
              <button
                onClick={runScrapper}
                className=" btn btn-primary p-2 rounded flex items-center  gap-1 font-semibold transition hover:bg-green-800 bg-green-700 text-white"
              >
                <PlayCircleIcon width={20} />
                Run Scraper
              </button>
              <button
                onClick={exportToYeeew}
                className=" btn btn-primary p-2 rounded flex items-center  gap-1 font-semibold transition hover:bg-blue-700 bg-blue-700 text-white"
              >
                <ArrowRightEndOnRectangleIcon width={20} />
                Export to Yeeew!
              </button>
              <button
                onClick={deleteBusinesses}
                className="btn btn-primary p-2 rounded flex items-center  gap-1 font-semibold transition hover:bg-gray-800 bg-black text-white"
              >
                <TrashIcon width={20} />
                Delete
              </button>
              <button className="btn btn-primary">
                <Link to="/export"></Link>
              </button>
            </>
          )}
        </div>

        <div className="flex gap-4">
          {/* Sort dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-x-1 text-sm font-medium leading-6 text-white">
              {sortBy != ""
                ? sortOptions.find((item) => item.value == sortBy).name
                : "Sort By"}
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-500"
                aria-hidden="true"
              />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2.5 w-40 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                {sortOptions.map((option) => (
                  <Menu.Item key={option.name}>
                    <div
                      onClick={() => handleSortBy(option.value)}
                      className={classNames(
                        sortBy == option.value ? "bg-gray-100" : "",
                        " px-3 py-1 pl-8 text-sm leading-6 text-gray-900 cursor-pointer transition hover:bg-gray-100 flex gap-2 relative"
                      )}
                    >
                      {sortBy == option.value && (
                        <CheckIcon
                          width={15}
                          className="absolute left-2 top-1/2 -translate-y-1/2"
                        />
                      )}
                      {option.name}
                    </div>
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Transition>
          </Menu>

          {/* Region Filter Dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-x-1 text-sm font-medium leading-6 text-white">
              Filter By Region
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-500"
                aria-hidden="true"
              />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2.5 w-40 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none max-h-56 overflow-auto">
                {regionOptions.map((option) => (
                  <Menu.Item key={option.name}>
                    <div
                      onClick={() => handleRegionFilter(option.value)}
                      className={classNames(
                        sortBy == option.value ? "bg-gray-100" : "",
                        " px-3 py-1 pl-8 text-sm leading-6 text-gray-900 cursor-pointer transition hover:bg-gray-100 flex gap-2 relative"
                      )}
                    >
                      {regionFilters.includes(option.value) && (
                        <CheckIcon
                          width={15}
                          className="absolute left-2 top-1/2 -translate-y-1/2"
                        />
                      )}
                      {option.name}
                    </div>
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </header>
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Spinner width="w-12" height="h-12" />
        </div>
      ) : listings.length === 0 ? (
        <div className="flex justify-center items-center h-48">
          <p className="text-gray-600">No listings found.</p>
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
                  className="py-2 pl-4 pr-8 font-semibold sm:pl-6 lg:pl-8 flex gap-2"
                >
                  <input
                    type="checkbox"
                    className="rounded-sm"
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      setSelectedItems(
                        isChecked ? listings.map((item) => item._id) : []
                      );
                    }}
                  />
                  <p> Business Name</p>
                </th>
                <th
                  scope="col"
                  className="hidden py-2 pl-0 pr-8 font-semibold sm:table-cell"
                >
                  Business URL
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
                  Scraped At
                </th>
                {/* <th
                  scope="col"
                  className="hidden py-2 pl-0 pr-4 text-right font-semibold sm:table-cell sm:pr-6 lg:pr-8"
                >
                  Time To Scrape
                </th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {listings.map((item) => (
                <tr key={item.commit} className="transition hover:bg-slate-800">
                  <td className="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8 flex">
                    <div className="flex items-center gap-x-4">
                      <input
                        type="checkbox"
                        className="rounded-sm"
                        checked={selectedItems.includes(item._id)}
                        onChange={() => toggleSelectItem(item._id)}
                      />
                      <Link to={`/dashboard/business/${item._id}`}>
                        <div className="truncate text-sm font-medium leading-6 text-white flex">
                          {item.businessName}
                        </div>
                      </Link>
                    </div>
                  </td>
                  <td className="overflow-hidden">
                    <div className="flex items-center gap-x-4   max-w-52">
                      <Link
                        to={`/dashboard/business/${item._id}`}
                        className="hidden py-4 pl-0 pr-4 sm:flex sm:pr-8"
                      >
                        <div className="flex gap-x-3">
                          <div className="font-mono text-sm leading-6 text-blue-400 overflow-ellipsis  break-words">
                            {item.businessURL}
                            <span className="text-gray-500">
                              {!item.businessURL && "N/A"}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </td>
                  <td>
                    <Link
                      to={`/dashboard/business/${item._id}`}
                      className="py-4 pl-0 pr-4 text-sm leading-6 sm:pr-8 lg:pr-20 flex"
                    >
                      <div className="flex items-center justify-end gap-x-2 sm:justify-start">
                        <div
                          className={classNames(
                            item.scraped == true &&
                              "text-green-400 bg-green-400/10",
                            item.scraped == false &&
                              "text-gray-500 bg-gray-100/10",
                            "flex-none rounded-full p-1"
                          )}
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-current" />
                        </div>
                        <div
                          className={classNames(
                            item.scraped == false && "text-gray-500",
                            item.scraped == true && "text-green-400",
                            "hidden sm:block"
                          )}
                        >
                          {item.scraped == true ? "Scraped" : "Not Scraped"}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td>
                    <Link
                      to={`/dashboard/business/${item._id}`}
                      className="hidden py-4 pl-0 pr-8 text-sm leading-6 text-gray-400 md:flex lg:pr-20"
                    >
                      {item.scrapedAt &&
                        new Date(item.scrapedAt).toLocaleString()}

                      {!item.scrapedAt && (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </Link>
                  </td>
                  {/* <td>
                    <Link
                      to={`/dashboard/business/${item._id}`}
                      className="hidden py-4 pl-0 pr-4 text-right text-sm leading-6 text-gray-400 sm:flex sm:pr-6 lg:pr-8"
                    >
                      {item.timeToScrape && (
                        <time dateTime={item.timeToScrape}>
                          {item.timeToScrape}
                        </time>
                      )}

                      {!item.timeToScrape && (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </Link>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            perPage={10}
            prefixLink="/dashboard"
          />
        </div>
      )}

      {showCreateModal && <CreateListingModal onClose={onCloseCreateModal} />}

      <div className="absolute p-2 left-1/2 bottom-8 -translate-x-1/2 lg:hidden rounded shadow-xl  bg-gray-800 w-[95vw] grid grid-cols-4 gap-4 justify-between items-center whitespace-nowrap text-xs">
        <button
          onClick={(e) => setShowCreateModal(true)}
          className={`bg-white items-center justify-center  text-black ${
            !selectedItems.length ? "col-span-4" : ""
          } rounded shadow-lg  py-2 transition hover:bg-gray-400 cursor-pointer flex  gap-2 font-semibold`}
        >
          <PlusCircleIcon width={20} /> New
        </button>
        {selectedItems.length > 0 && (
          <>
            <button
              onClick={runScrapper}
              className=" btn btn-primary py-2 justify-center rounded flex items-center  gap-1 font-semibold transition hover:bg-green-800 bg-green-700 text-white"
            >
              <PlayCircleIcon width={20} />
              Run
            </button>
            <button
              onClick={exportToYeeew}
              className=" btn btn-primary justify-center py-2 rounded flex items-center  gap-1 font-semibold transition hover:bg-blue-700 bg-blue-700 text-white"
            >
              <ArrowRightEndOnRectangleIcon width={20} />
              Export
            </button>
            <button
              onClick={deleteBusinesses}
              className="btn justify-center btn-primary py-2 rounded flex items-center  gap-1 font-semibold transition hover:bg-gray-800 bg-black text-white"
            >
              <TrashIcon width={20} />
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
