import { Fragment, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function ConfirmationModal({
  onAccept,
  onCancel,
  mode,
  heading,
  text,
  ctaText,
  checkbox,
  handleCheckboxChange,
  checkboxText,
  inputValue,
  onInputValueChange,
  inputError,
}) {
  const [open, setOpen] = useState(true);

  const cancelButtonRef = useRef(null);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        className="relative z-50"
        initialFocus={cancelButtonRef}
        onClose={(e) => {
          setOpen(false);
          onCancel();
        }}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon
                      className={`h-6 w-6 ${
                        mode === "danger" ? "text-red-600" : "text-green-600"
                      }`}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 text-gray-900"
                    >
                      {heading}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">{text}</p>
                    </div>
                    {checkboxText && (
                      <div className="mt-2">
                        <label
                          htmlFor={`${checkboxText}`}
                          className="text-sm text-gray-500 flex gap-2 items-center justify-center"
                        >
                          <input
                            type="checkbox"
                            value={checkbox}
                            onChange={() =>
                              handleCheckboxChange((prev) => !prev)
                            }
                            id={`${checkboxText}`}
                          />
                          {checkboxText}
                        </label>
                      </div>
                    )}
                    {onInputValueChange && (
                      <div className="mt-2 flex flex-col">
                        <label
                          htmlFor={`modal-input-field`}
                          className="text-sm mb-1 mt-4"
                        >
                          Business Name
                        </label>
                        <input
                          className="border p-2 outline-none"
                          type="text"
                          placeholder="Business Name"
                          value={inputValue}
                          onChange={(e) => onInputValueChange(e.target.value)}
                          id={`modal-input-field`}
                        />
                        {inputError && (
                          <p className="text-red-500">{inputError}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-5 sm:ml-10 sm:mt-4 sm:flex sm:pl-4">
                  <button
                    type="button"
                    className={`inline-flex w-full justify-center rounded-md ${
                      mode === "danger"
                        ? "bg-red-600 hover:bg-red-500 "
                        : "bg-green-600 hover:bg-green-500 "
                    } px-3 py-2 text-sm font-semibold  shadow-sm  sm:w-auto text-white`}
                    onClick={() => {
                      if (
                        !onInputValueChange ||
                        (onInputValueChange && inputValue)
                      ) {
                        setOpen(false);
                      }
                      onAccept();
                    }}
                  >
                    {ctaText}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:ml-3 sm:mt-0 sm:w-auto"
                    onClick={() => {
                      setOpen(false);
                      onCancel();
                    }}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
