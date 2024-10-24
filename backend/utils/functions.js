import axios from "axios";
import imageSize from "image-size";

export const formatDate = (date) => {
  const options = {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };

  return date.toLocaleDateString("en-AU", options).replace(",", "");
};

export const scrapePricesAndDataFromPlatforms = async (page) => {
  const scrapedData = await page.evaluate(() => {
    const handlePriceScrape = () => {
      const perfectWaveFunction = () => {
        let minimum_price, nights, packagePrice, pricePerDay;
        if (
          document.querySelector(
            ".price-package-grid .price-package-item p strong"
          )
        ) {
          const text = document.querySelector(".price-package-item p strong");
          const packagePriceDiv = text.querySelector(
            ".text-strike .wpcs_price"
          );
          if (packagePriceDiv) {
            packagePrice = packagePriceDiv.innerText
              .toLowerCase()
              .replace("usd $", "");
          }

          const pricePerDayDiv = text.querySelector(".text-gold .wpcs_price");
          if (pricePerDayDiv) {
            pricePerDay = pricePerDayDiv.innerText
              .toLowerCase()
              .replace("usd $", "");
          }
          nights = text.innerText.split(" from ")[0];
        }

        return {
          minimum_price: packagePrice ? packagePrice : pricePerDay,
          nights,
        };
      };

      const luexFunction = () => {
        let minimum_price, nights, packagePrice, pricePerDay;

        document.querySelectorAll("#profile-menu-currency a").forEach((a) => {
          if (
            a.innerText.toLowerCase().includes("us dollar") &&
            !a.parentElement.classList.contains("active")
          )
            a.click();
        });

        if (document.querySelector(".wrap-total-price .symbol")) {
          minimum_price = document
            .querySelector(".wrap-total-price .symbol")
            .innerText.toLowerCase()
            .replace("us$ ", "");
        }

        return { minimum_price };
      };

      const waterwaysFunction = () => {
        let minimum_price, nights, packagePrice, pricePerDay;

        const pricingDiv = document.querySelector("#pricing");
        if (!pricingDiv) {
          return {};
        }

        const priceElements = pricingDiv.querySelectorAll("td.ninja_column_2");
        if (!priceElements.length) {
          return {};
        }

        const prices = Array.from(priceElements).map((td) => {
          const priceText = td.textContent.trim();
          const cleanedPrice = priceText.replace(/[^0-9.]/g, "");
          return parseFloat(cleanedPrice);
        });

        minimum_price = Math.min(...prices);

        return { minimum_price };
      };

      const atollTravel = () => {
        let minimum_price, nights, packagePrice, pricePerDay;

        // Find all elements that might contain the price text
        const elements = document.querySelectorAll(
          ".elementor-widget-container"
        );

        let prices = [];

        elements.forEach((element) => {
          // Check if the element contains the word "PRICE" (case insensitive)
          if (element.textContent.toUpperCase().includes("PRICE")) {
            // Find and extract the price text
            const priceMatch = element.textContent.match(
              /[$€£]?\s?(\d+[\d,.]*)/
            );

            if (priceMatch) {
              // Extract and clean the price
              let priceText = priceMatch[0];
              priceText = priceText.replace(/[^0-9.]/g, ""); // Remove non-numeric characters

              // Convert to a number and add to the prices array
              const price = parseFloat(priceText);
              prices.push(price);
            }
          }
        });

        if (prices.length === 0) {
          console.log("No prices found.");
          return {};
        }

        return { minimum_price: prices[0] };
      };

      const surfHolidaysFunction = () => {
        let minimum_price, nights, packagePrice, pricePerDay;
        /*if (
            !document
              .querySelector('[data-currency="USD"]')
              .classList.contains("active")
          ) {
            document.querySelector('[data-currency="USD"]').click();
          } else {*/
        // Initialize variables

        // Try to find the price using the class name
        const priceTag = document.querySelector(".price-from--price");
        if (priceTag) {
          minimum_price = priceTag.textContent.trim();
        }

        // Try to find the nights using the class name
        const nightsTag = document.querySelector("#hotel-description h4");
        nights = nightsTag.innerText;

        if (minimum_price) minimum_price = minimum_price.replace(/[^0-9]/g, "");

        return { minimum_price, nights };
        /*}*/
      };

      const thermalTravelFunction = () => {
        let minimum_price;

        const priceElement = document.querySelector(".Actions_price__behIO");

        if (priceElement) {
          minimum_price = priceElement.textContent.trim();
        } else {
          // Fallback: search all divs for a mention of "From $"
          const divs = document.querySelectorAll("div");
          for (let div of divs) {
            if (/From\s+\$\d+/.test(div.textContent)) {
              minimum_price = div.textContent.trim();
              break;
            }
          }
        }

        // Strip everything but numbers
        if (minimum_price) minimum_price = minimum_price.replace(/[^0-9]/g, "");

        return { minimum_price };
      };

      const soulsurftravelFunction = () => {
        let minimum_price, nights;

        document.querySelectorAll("td").forEach((cell) => {
          if (cell.innerText.toLowerCase().includes("2 guests")) {
            cell.parentElement.querySelectorAll("td").forEach((el) => {
              if (el.innerText.includes("$") && !minimum_price) {
                minimum_price = el.innerText;
              }
            });
          }
        });

        const priceString = document.querySelector(
          ".meta-block.last.pricing .price"
        );
        if (priceString.innerText.includes("nights"))
          nights = priceString.innerText.split(" nights ")[0] + " nights";
        if (!minimum_price) {
          minimum_price = priceString.querySelector("span").innerText;
        }

        if (minimum_price) minimum_price = minimum_price.replace(/[^0-9]/g, "");

        return { minimum_price, nights };
      };

      const bookSurfCampFunction = () => {
        let minimum_price, nights;
        const priceWrapper = document.querySelector(".listing-price-wrapper");
        if (priceWrapper) {
          if (priceWrapper.querySelector(".listing-query-box__duration")) {
            nights = priceWrapper.querySelector(
              ".listing-query-box__duration"
            ).innerText;
          }
          if (priceWrapper.querySelector(".price")) {
            minimum_price = priceWrapper.querySelector(".price").innerText;
          }
        }
        if (minimum_price) minimum_price = minimum_price.replace(/[^0-9]/g, "");

        return { minimum_price, nights };
      };

      let data;
      switch (window.location.host) {
        case "www.perfectwavetravel.com": {
          data = perfectWaveFunction();
          break;
        }
        case "www.luex.com": {
          data = luexFunction();
          break;
        }
        case "www.waterwaystravel.com": {
          data = waterwaysFunction();
          break;
        }
        case "atolltravel.com": {
          data = atollTravel();
          break;
        }
        case "www.surfholidays.com": {
          data = surfHolidaysFunction();
          break;
        }
        case "www.thermal.travel": {
          data = thermalTravelFunction();
          break;
        }
        case "soulsurftravel.com.au": {
          data = soulsurftravelFunction();
          break;
        }
        case "www.booksurfcamps.com": {
          data = bookSurfCampFunction();
          break;
        }
        default: {
          break;
        }
      }

      return data;
    };
    const data = handlePriceScrape();
    return data;
  });

  return scrapedData;
};

export const logToConsole = (error) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      console.error("Axios Response Error:");
      console.error("Data:", error.response.data);
    } else if (error.request) {
      console.error("Axios Request Error:", error.request);
    } else {
      console.error("Axios Error Message:", error.message);
    }
  } else {
    console.error("General Error:", error.message);
    console.error("Stack Trace:", error.stack);
  }
};

export const findTypeName = (obj, typename) => {
  if (obj && obj.__typename == typename) {
    return obj;
  }

  if (Array.isArray(obj)) {
    for (let item of obj) {
      const found = findTypeName(item, typename);
      if (found) return found;
    }
  } else if (obj && typeof obj == "object") {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        const found = findTypeName(obj[key], typename);
        if (found) return found;
      }
    }
  }

  return null;
};

export const findPlatformPrice = (apiData, platform) => {
  if (
    !apiData.tripadvisor ||
    !apiData.tripadvisor.data ||
    !apiData.tripadvisor.data.offers
  )
    return null;

  const priceObject = apiData.tripadvisor.data.offers.find((offer) =>
    offer.providerName.toLowerCase().includes(platform.toLowerCase())
  );
  return priceObject;
};
