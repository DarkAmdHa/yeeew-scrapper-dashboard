function SpinnerOverlay() {
  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-gray-900 backdrop-blur-sm bg-opacity-75 transition flex items-center justify-center z-50">
      <div className="loader border-solid border-white w-[60px] h-[60px] border-[5px]"></div>
    </div>
  );
}

export default SpinnerOverlay;
