import { useEffect, useRef, useState } from "react";

import PhotoAlbum from "react-photo-album";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/plugins/thumbnails.css";

import { toast } from "react-toastify";

const ScrappedImagesComponent = ({ imageUrls }) => {
  const [selectedImages, setSelectedImages] = useState([]);

  const [index, setIndex] = useState(-1);
  const imageGallery = useRef();

  const handleCheckboxChange = (e) => {
    const url = e.target.value;
    if (selectedImages.includes(url)) {
      setSelectedImages(selectedImages.filter((image) => image !== url));
    } else {
      setSelectedImages([...selectedImages, url]);
    }
  };

  const handleDelete = () => {
    // Implement delete functionality
    console.log("Delete selected images:", selectedImages);
    setSelectedImages([]);
    imageGallery.current
      .querySelectorAll('input[type="checkbox"]')
      .forEach((check) => (check.checked = false));

    toast("Images Deleted");
  };

  const handleDownload = () => {
    //Download the images:
    selectedImages.forEach((imageUrl) => {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = imageUrl.split("/").pop(); // Use the image name as the download filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
    setSelectedImages([]);

    //uncheck
    imageGallery.current
      .querySelectorAll('input[type="checkbox"]')
      .forEach((check) => (check.checked = false));

    toast("🦄 Images downloaded");
  };

  return (
    <div ref={imageGallery}>
      {selectedImages.length ? (
        <div className="w-full bg-gray-700 shadow-lg  py-2 px-4 flex justify-between items-center">
          <p className="text-lg font-semibold text-white">
            {selectedImages.length} image
            {selectedImages.length > 1 ? "s " : " "}
            selected
          </p>
          <div className="flex gap-2 py-2">
            <button
              onClick={handleDownload}
              className="border-blue-500 border  text-blue-500 transition hover:bg-blue-500 hover:text-white py-1 px-2 mr-2 rounded"
            >
              Download
            </button>

            <button
              onClick={handleDelete}
              className="border-red-500 border  text-red-500 transition hover:bg-red-500 hover:text-white py-1 px-2 mr-2 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        ""
      )}
      <PhotoAlbum
        photos={imageUrls}
        layout="masonry"
        targetRowHeight={150}
        onClick={({ index }) => setIndex(index)}
        renderPhoto={({ photo, wrapperStyle, renderDefaultPhoto }) => (
          <div style={{ position: "relative", ...wrapperStyle }}>
            {renderDefaultPhoto({ wrapped: true })}

            <div className="bg-gray-900 top-0.5  flex items-center justify-center left-0.5 absolute">
              <input
                id="comments"
                aria-describedby="comments-description"
                name="comments"
                type="checkbox"
                value={photo.src}
                onChange={handleCheckboxChange}
                className=" h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
              />
            </div>
          </div>
        )}
      />

      <Lightbox
        slides={imageUrls}
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        // enable optional lightbox plugins
        plugins={[Fullscreen, Slideshow, Thumbnails, Zoom]}
      />
    </div>
  );
};

export default ScrappedImagesComponent;
