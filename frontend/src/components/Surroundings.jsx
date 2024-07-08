function Surroundings({ surroundings }) {
  return (
    <>
      {surroundings && surroundings.length ? (
        <div className="flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300 table-fixed">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0"
                    >
                      Surrounding Type
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                    >
                      Surroundings
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {surroundings.map((surrounding) => (
                    <tr key={surrounding.surroundingType}>
                      <td className="whitespace-normal break-words py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                        {surrounding.surroundingType}
                      </td>

                      <td className="whitespace-normal break-words px-3 py-4 text-sm text-white ">
                        {surrounding.surroundings.map((surr) => (
                          <div
                            className="border-b flex flex-col border-gray-700"
                            key={surr.type}
                          >
                            <div>Type: {surr.type}</div>
                            <div>Name: {surr.name}</div>
                            <div>Distance: {surr.distance}</div>
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-200 text-sm text-center">No surroundings</p>
      )}
    </>
  );
}

export default Surroundings;
