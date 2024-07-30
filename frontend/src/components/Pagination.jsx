import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

export default function Pagination({
  currentPage,
  totalPages,
  totalCount,
  perPage,
  prefixLink,
}) {
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const sortVal = searchParams.get("sortBy");
    if (sortVal) {
      setSortBy(sortVal);
    }
    const queryParam = searchParams.get("query");
    if (queryParam) {
      setQuery(queryParam);
    }
  }, [searchParams]);

  const renderPagination = () => {
    let PaginationComp = <></>;

    if (totalPages > 1) {
      if (totalPages > 7) {
        let firstElipsisAdded = false;
        let secondElipsisAdded = false;
        {
          PaginationComp = [...Array(totalPages)].map((i, index) => {
            if (
              index < 2 ||
              index > totalPages - 2 ||
              index === currentPage - 1 ||
              index === currentPage + 1 ||
              index === currentPage
            ) {
              return (
                <Link
                  to={`${prefixLink}?${
                    sortBy != "" ? "sortBy=" + sortBy + "&" : ""
                  }${query != "" ? "query=" + query + "&" : ""}page=${
                    index + 1
                  }`}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-300  focus:z-20 ring-1 ring-inset ring-gray-300 hover:bg-gray-600 transition-all focus:outline-offset-0 ${
                    index + 1 === currentPage &&
                    "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  }`}
                  key={index + 1}
                >
                  {index + 1}
                </Link>
              );
            } else if (
              !firstElipsisAdded &&
              index >= 2 &&
              index < currentPage - 1
            ) {
              firstElipsisAdded = true;
              return (
                <div key={index} className="text-gray-500 items-end  px-2">
                  ...
                </div>
              );
            } else if (
              !secondElipsisAdded &&
              index <= totalPages - 3 &&
              index > currentPage + 1
            ) {
              secondElipsisAdded = true;
              return (
                <div key={index} className="text-gray-500 items-end  px-2">
                  ...
                </div>
              );
            }
          });
        }
      } else {
        PaginationComp = (
          <>
            {[...Array(totalPages)].map((i, index) => (
              <Link
                to={`${prefixLink}?${
                  sortBy != "" ? "sortBy=" + sortBy + "&" : ""
                }${query != "" ? "query=" + query + "&" : ""}page=${index + 1}`}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-300  focus:z-20 ring-1 ring-inset ring-gray-300 hover:bg-gray-600 transition-all focus:outline-offset-0 ${
                  index + 1 === currentPage &&
                  "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                }`}
                key={index + 1}
              >
                {index + 1}
              </Link>
            ))}
          </>
        );
      }
    }
    return PaginationComp;
  };

  return (
    <div className="flex items-center justify-between border-t border-gray-700 bg-gray-900 px-4 py-3 sm:px-6 ">
      <div className="flex flex-1 justify-between sm:hidden">
        <Link
          to={`${prefixLink}?${sortBy != "" ? "sortBy=" + sortBy + "&" : ""}${
            query != "" ? "query=" + query + "&" : ""
          }page=${currentPage === 1 ? "1" : currentPage - 1}`}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-600 transition-all disabled:opacity-40 disabled:pointer-events-none"
          disabled={currentPage === 1}
        >
          Previous
        </Link>
        <Link
          to={`${prefixLink}?${sortBy != "" ? "sortBy=" + sortBy + "&" : ""}${
            query != "" ? "query=" + query + "&" : ""
          }page=${currentPage === totalPages ? totalPages : currentPage + 1}`}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-600 transition-all disabled:opacity-40 disabled:pointer-events-none"
          disabled={currentPage === totalPages}
        >
          Next
        </Link>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-400">
            Showing{" "}
            <span className="font-medium">
              {perPage * (currentPage - 1) + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {perPage * currentPage > totalCount
                ? totalCount
                : perPage * currentPage}
            </span>{" "}
            of <span className="font-medium">{totalCount}</span> results
          </p>
        </div>
        {totalPages > 1 && (
          <div>
            <nav
              className="isolate inline-flex -space-x-px rounded-md shadow-sm"
              aria-label="Pagination"
            >
              <Link
                to={`${prefixLink}?${
                  sortBy != "" ? "sortBy=" + sortBy + "&" : ""
                }${query != "" ? "query=" + query + "&" : ""}page=${
                  currentPage === 1 ? "1" : currentPage - 1
                }`}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-600 transition-all focus:z-20 focus:outline-offset-0 disabled:opacity-40 disabled:pointer-events-none"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
              </Link>
              {renderPagination()}

              <Link
                to={`${prefixLink}?${
                  sortBy != "" ? "sortBy=" + sortBy + "&" : ""
                }${query != "" ? "query=" + query + "&" : ""}page=${
                  currentPage === totalPages ? totalPages : currentPage + 1
                }`}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-600 transition-all focus:z-20 focus:outline-offset-0  disabled:opacity-40 disabled:pointer-events-none"
              >
                <span className="sr-only">Next</span>
                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
              </Link>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
