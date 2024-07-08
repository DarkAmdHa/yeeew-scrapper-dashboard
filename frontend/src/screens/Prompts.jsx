import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import SpinnerOverlay from "../components/SpinnerOverlay";
import { AppContext } from "../context/AppContext";

function Prompts() {
  const [prompts, setPrompts] = useState({
    adminPrompt: "",
    fullScrapperPrompt: "",
    slugBuilderPrompt: "",
    contentGenerationPromptWithJson: "",
    platformDataRetreivalPrompt: "",
    _id: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { token } = useContext(AppContext);

  useEffect(() => {
    async function fetchPrompts() {
      try {
        const response = await axios.get("/api/prompts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }); // Adjust the endpoint as necessary
        setPrompts(response.data);
      } catch (error) {
        console.error("Error fetching prompts:", error);
        toast.error("Could not get the prompts");
      } finally {
        setLoading(false);
      }
    }
    fetchPrompts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPrompts((prevPrompts) => ({
      ...prevPrompts,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`/api/prompts/${prompts._id}`, prompts, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }); // Adjust the endpoint as necessary
      toast.success("Prompts saved successfully!");
    } catch (error) {
      console.error("Error saving prompts:", error);
      toast.error("Failed to save prompts.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-h-[90vh] overflow-auto">
      {/* {loading && <SpinnerOverlay width="w-12" height="h-12" />} */}

      <header className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 sticky top-0 bg-gray-900">
        <h1 className="text-base font-semibold leading-7 text-white">
          Prompts
        </h1>
      </header>
      <div className="border-white/10 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <form
          className={`bg-gray-800 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2 opacity-1 transition relative  before:transition ${
            saving
              ? "pointer-events-none before:top-0 before:left-0 before:bg-gray-900 before:bg-opacity-90 before:absolute before:w-full before:h-full"
              : "before:bg-opacity-0"
          }`}
          onSubmit={handleSubmit}
        >
          {saving && (
            <div className="flex justify-center items-center h-48 absolute top-32 left-1/2 -translate-x-1/2 ">
              <Spinner width="w-12" height="h-12" />
            </div>
          )}
          <div className="px-4 py-6 sm:p-8">
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label
                  htmlFor="adminPrompt"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Admin Prompt for the scrapper
                </label>
                <div className="mt-2">
                  <textarea
                    rows={6}
                    id="adminPrompt"
                    name="adminPrompt"
                    value={prompts.adminPrompt}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <div className="sm:col-span-6">
                <label
                  htmlFor="fullScrapperPrompt"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Full Scrapper Prompt
                </label>
                <div className="mt-2">
                  <textarea
                    rows={6}
                    id="fullScrapperPrompt"
                    name="fullScrapperPrompt"
                    value={prompts.fullScrapperPrompt}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <div className="sm:col-span-6">
                <label
                  htmlFor="slugBuilderPrompt"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Slug Builder Prompt
                </label>
                <div className="mt-2">
                  <textarea
                    rows={6}
                    id="slugBuilderPrompt"
                    name="slugBuilderPrompt"
                    value={prompts.slugBuilderPrompt}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <div className="sm:col-span-6">
                <label
                  htmlFor="contentGenerationPromptWithJson"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Content Generation Prompt
                </label>
                <div className="mt-2">
                  <textarea
                    rows={6}
                    id="contentGenerationPromptWithJson"
                    name="contentGenerationPromptWithJson"
                    value={prompts.contentGenerationPromptWithJson}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <div className="sm:col-span-6">
                <label
                  htmlFor="platformDataRetreivalPrompt"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Platform Data Retreival
                </label>
                <div className="mt-2">
                  <textarea
                    rows={6}
                    id="platformDataRetreivalPrompt"
                    name="platformDataRetreivalPrompt"
                    value={prompts.platformDataRetreivalPrompt}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-1.5 pl-3 bg-transparent text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-x-6 border-t border-gray-500/10 px-4 py-4 sm:px-8">
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Prompts;
