function Amenities({ amenities }) {
  return (
    <>
      {amenities && amenities.length ? (
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300 table-fixed">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0"
                    >
                      Amenities
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                    >
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {amenities.map((amenity) => (
                    <tr key={amenity.type}>
                      <td className="whitespace-normal break-words py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                        {amenity.type}
                      </td>
                      <td className="whitespace-normal break-words px-3 py-4 text-sm text-gray-300">
                        {amenity.amenities.join(",")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-200 text-sm text-center">No amenities</p>
      )}
    </>
  );
}

export default Amenities;
