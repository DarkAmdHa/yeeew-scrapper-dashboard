function TypesArray({ items, handleChangeMain, nameInMain, name }) {
  return (
    <>
      {items && items.length ? (
        items.map((item, index) => (
          <div className="my-2 flex gap-4" key={`trip-type-input-${index}`}>
            <input
              type="text"
              value={item}
              onChange={(e) => {
                handleChangeMain((prev) => {
                  const newHighlights = [...prev[nameInMain]];
                  newHighlights[index] = e.target.value;
                  return {
                    ...prev,
                    [nameInMain]: newHighlights,
                  };
                });
              }}
              autoComplete="off"
              className="block w-full rounded-md border-0 py-1.5 text-white pl-3 shadow-sm ring-1 ring-inset bg-transparent ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />

            <div
              onClick={(e) => {
                handleChangeMain((prev) => {
                  const newItemInMain = prev[nameInMain].filter(
                    (item, index2) => index2 != index
                  );
                  return {
                    ...prev,
                    [nameInMain]: newItemInMain,
                  };
                });
              }}
              className="border p-2 rounded transition cursor-pointer w-10 text-white flex items-center justify-center hover:bg-white hover:text-black"
            >
              -
            </div>
          </div>
        ))
      ) : (
        <p className="text-white mb-4">No {name}</p>
      )}
      <div
        className="bg-blue-500 text-white px-4 py-2 transition hover:bg-blue-700 rounded cursor-pointer w-fit"
        onClick={(e) => {
          handleChangeMain((prev) => ({
            ...prev,
            [nameInMain]: [...prev[nameInMain], ""],
          }));
        }}
      >
        Add
      </div>
    </>
  );
}

export default TypesArray;
