import { DocumentIcon, XCircleIcon } from "@heroicons/react/20/solid";
import { useContext, useRef, useState } from "react";
import Papa from "papaparse";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";

function BulkImport() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const { token } = useContext(AppContext);

  const handleFileChange = (e) => {
    setIsLoading(true);
    try {
      const newFile = e.target.files[0];
      if (newFile) {
        if (newFile.type === "text/csv" && newFile.size <= 5 * 1024 * 1024) {
          Papa.parse(newFile, {
            complete: (results) => {
              const headers = results.data[0];
              if (
                Object.keys(headers).includes("Business Name") &&
                Object.keys(headers).includes("Business URL")
              ) {
                setFile(newFile);
                setFileName(newFile.name);
                setIsValid(true);
              } else {
                setFile(null);
                setFileName("");
                setIsValid(false);
                toast.error(
                  "CSV must contain 'Business Name' and 'Business URL' columns."
                );
              }
            },
            header: true,
          });
        } else {
          setFile(null);
          setFileName("");
          setIsValid(false);
          toast.error("Please upload a valid CSV file less than 5MB in size.");
        }
      }
    } catch (error) {
      console.error("Something went wrong while parsing the file:", error);
      toast.error("Something went wrong while parsing the file.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileRemove = () => {
    setFile(null);
    setFileName("");
    setIsValid(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("No file selected.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsLoading(true);

    try {
      await axios.post("/api/listing/bulk-import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Businesses Added");
      navigate("/dashboard");
    } catch (error) {
      console.log(
        error.response && error.response.data.message
          ? error.response.data.message
          : "An error occurred during the upload. Please try again.",
        error
      );
      toast.error(
        error.response && error.response.data.message
          ? error.response.data.message
          : "An error occurred during the upload. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-h-[90vh] overflow-auto">
      <header className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 sticky top-0 bg-gray-900">
        <h1 className="text-base font-semibold leading-7 text-white">
          Bulk Import
        </h1>
      </header>
      <div className="border-white/10 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <form
          className="bg-gray-800 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2"
          onSubmit={handleImport}
        >
          <div className="px-4 py-6 sm:p-8">
            <div className="col-span-full">
              <label
                htmlFor="cover-photo"
                className="block text-sm font-medium leading-6 text-white"
              >
                Cover photo
              </label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-white/25 px-6 py-10 relative overflow-hidden">
                {isLoading && (
                  <div className="absolute top-0 left-0 bg-black bg-opacity-50 w-full h-full flex items-center justify-center z-20">
                    <Spinner />
                  </div>
                )}

                <div className="text-center">
                  <DocumentIcon
                    aria-hidden="true"
                    className="mx-auto h-12 w-12 text-gray-500"
                  />
                  <div className="mt-4 flex text-sm leading-6 text-gray-400 items-center">
                    <label
                      htmlFor="bulk-import-csv"
                      className="relative cursor-pointer rounded-md p-2 bg-gray-900 font-semibold text-white focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 hover:text-indigo-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="bulk-import-csv"
                        name="bulk-import-csv"
                        type="file"
                        accept=".csv"
                        className="sr-only"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  {fileName && (
                    <div className="mt-2 text-gray-400 flex items-center">
                      <p>{fileName}</p>
                      <button
                        type="button"
                        onClick={handleFileRemove}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                  <p className="text-xs leading-5 text-gray-400">
                    CSV of size up to 5MB
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-x-6 border-t border-gray-500/10 px-4 py-4 sm:px-8">
            <button
              type="submit"
              className={`rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                !isValid ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!isValid}
            >
              Import
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BulkImport;
