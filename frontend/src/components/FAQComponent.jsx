import { useState } from "react";

const FAQComponent = ({ faqs, setFaqs }) => {
  return (
    <div>
      <label
        htmlFor="faq"
        className="block text-sm font-medium leading-6 text-white"
      >
        FAQ
        <span className="text-gray-400 block text-xs mt-1">
          Frequently Asked Questions
        </span>
      </label>
      {faqs.map((faq, index) => (
        <div key={index} className="py-3">
          <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
            <div className="bg-gray-900 w-20 justify-center bg-opacity-80 text-white text-xs border  flex items-center px-2 border-white rounded-tl-lg rounded-bl-lg">
              Question:
            </div>
            <input
              type="text"
              name="question"
              id={`question-${index}`}
              value={faq.faq_question}
              onChange={(e) => {
                setFaqs((prev) => {
                  const newFaqs = [...prev.faq];
                  newFaqs[index].faq_question = e.target.value;
                  return {
                    ...prev,
                    faq: newFaqs,
                  };
                });
              }}
              placeholder="Question"
              className="block pl-3 flex-1 border-0 bg-transparent py-1.5 pl-1 text-white placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
            />
          </div>
          <div className="mt-2">
            <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
              <div className="bg-gray-900 w-20 justify-center bg-opacity-80 text-white text-xs border  flex items-center px-2 border-white rounded-tl-lg rounded-bl-lg">
                Answer:
              </div>
              <textarea
                type="text"
                name="answer"
                id={`answer-${index}`}
                value={faq.faq_answer}
                onChange={(e) => {
                  setFaqs((prev) => {
                    const newFaqs = [...prev.faq];
                    newFaqs[index].faq_answer = e.target.value;
                    return {
                      ...prev,
                      faq: newFaqs,
                    };
                  });
                }}
                placeholder="Answer"
                className="block pl-3 flex-1 border-0 bg-transparent py-1.5 pl-1 text-white placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
        </div>
      ))}
      <div
        onClick={(e) => {
          setFaqs((prev) => ({
            ...prev,
            faq: [...prev["faq"], { faq_question: "", faq_answer: "" }],
          }));
        }}
        className="mt-3 w-fit cursor-pointer px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:bg-indigo-700"
      >
        Add FAQ
      </div>
    </div>
  );
};

export default FAQComponent;
