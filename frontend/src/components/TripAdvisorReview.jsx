import { useRef, useState } from "react";

function FilledStar() {
  return (
    <div
      style={{ backgroundColor: "#00aa6c", borderColor: "#00aa6c" }}
      className="w-4 h-4  border-2 rounded-full "
    ></div>
  );
}
function UnFilledStar() {
  return (
    <div
      style={{ borderColor: "#00aa6c" }}
      className="w-4 h-4  border-2 rounded-full"
    ></div>
  );
}

function TripAdvisorReview({ review }) {
  const [expanded, setExpanded] = useState(false);

  const reviewBody = useRef(null);
  return (
    <div className={`flex border rounded bg-white flex-col text-gray-600 `}>
      <div className="review__header px-4 py-2 flex gap-2 items-center">
        <a
          target="_blank"
          href={`https://www.tripadvisor.com${review.userProfile.profileLink}`}
        >
          <img
            src={review.userProfile.avatar}
            alt="User Profile"
            className="rounded-full"
            width={40}
            height={40}
          />
        </a>
        <div className="flex flex-col gap-2">
          <p>
            <a
              target="_blank"
              href={`https://www.tripadvisor.com${review.userProfile.profileLink}`}
              className="font-bold text-gray-800 hover:underline"
            >
              {review.userProfile.displayName}
            </a>{" "}
            wrote a review
          </p>
          <p>{review.userProfile.contributionCount}</p>
        </div>
      </div>

      <div className="review__photos grid grid-cols-4 gap-4">
        {review.userProfile.photos &&
          review.userProfile.photos.map((photo, index) => (
            <a
              href={`https://www.tripadvisor.com${photo.link}`}
              target="_blank"
              key={`photos-${photo.link}-${index}`}
            >
              <img src={photo.photo} alt="Photos" />
            </a>
          ))}
      </div>
      <div
        ref={reviewBody}
        className={`review__body px-6 py-2   ${
          reviewBody.current && reviewBody.current.offsetHeight > 300
            ? expanded
              ? "max-h-[1000px]"
              : "max-h-[300px]"
            : ""
        } transition overflow-hidden relative`}
      >
        <div className="flex gap-0.5 py-2">
          {[...Array(5)].map((star, index) =>
            index <= review.reviewRating ? <FilledStar /> : <UnFilledStar />
          )}
        </div>

        <p className="text-lg font-bold text-black py-1">
          {review.reviewTitle}
        </p>
        <p
          className="text-md text-black"
          dangerouslySetInnerHTML={{ __html: review.reviewText }}
        />

        <hr className="mt-4 mb-2" />

        <p className="italic text-sm font-thin">{review.disclaimer}</p>

        {reviewBody.current && reviewBody.current.offsetHeight > 300 && (
          <div
            className="absolute bottom-0 left-0 text-center cursor-pointer z-20 text-gray-500 font-semibold w-full py-4 bg-gray-500"
            style={{
              background: "linear-gradient(180deg, #ffffff, #bababacc)",
              boxShadow: "0px -19px 20px 7px rgb(255 255 255 / 33%)",
              paddingTop: expanded ? "20px" : "0px",
            }}
            onClick={() => setExpanded(!expanded)}
          >
            {!expanded ? "Read More" : "Read Less"}
          </div>
        )}
      </div>
    </div>
  );
}

export default TripAdvisorReview;
