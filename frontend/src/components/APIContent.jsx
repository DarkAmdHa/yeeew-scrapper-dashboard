function APIContent({ heading, content, subheading }) {
  return (
    <div className="sm:col-span-6">
      <p className="block text-lg font-medium leading-6 text-white pb-2">
        {heading}
      </p>
      {subheading && (
        <span className="text-gray-400 block text-xs mt-1">{subheading}</span>
      )}
      <div className="mt-2 text-white">{content}</div>
    </div>
  );
}

export default APIContent;
