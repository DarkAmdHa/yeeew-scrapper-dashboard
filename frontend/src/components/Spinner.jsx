function Spinner({ width, height, border }) {
  return (
    <div
      className={`loader border-solid  ${width ? width : "w-[30px]"} ${
        height ? height : "h-[30px]"
      } ${border ? border : "border-4"}`}
    ></div>
  );
}

export default Spinner;
