const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const isAuthenticated = require("../Middlewares/isAuthenticated");

const Offer = require("../Models/Offer");
const User = require("../Models/User");
const convertToBase64 = require("../Utils/convertToBase64");

router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      const { title, description, price, condition, city, brand, size, color } =
        req.body;

      if (
        title &&
        description &&
        price &&
        condition &&
        city &&
        brand &&
        size &&
        color
      ) {
        if (title.length < 50) {
          if (description.length < 500) {
            if (price < 10000) {
              const user = await User.findOne({ token: req.token });

              const newOffer = new Offer({
                product_name: title,
                product_description: description,
                product_price: price,
                product_details: [
                  { BRAND: brand },
                  { SIZE: size },
                  { CONDITION: condition },
                  { COLOR: color },
                  { CITY: city },
                ],
                product_image: [],
                owner: user,
              });
              if (req.files) {
                const { picture } = req.files;
                if (picture.length === undefined) {
                  const result = await cloudinary.uploader.upload(
                    convertToBase64(picture),
                    {
                      public_id: picture.name.split(".")[0],
                      folder: `/vinted/offers/${newOffer._id}`,
                    }
                  );

                  const name = picture.name.split(".")[0];
                  newOffer.product_image.push({
                    ["secure_url"]: result.secure_url,
                    ["public_id"]: result.public_id,
                  });
                } else {
                  const pictureToUpload = req.files.picture;

                  // const name = pictureToUpload.name.split(".")[0];

                  const arrayOfPomises = pictureToUpload.map((picture) => {
                    return cloudinary.uploader.upload(
                      convertToBase64(picture),
                      {
                        public_id: picture.name.split(".")[0],
                        folder: `/vinted/offers/${newOffer._id}`,
                      }
                    );
                  });

                  const result = await Promise.all(arrayOfPomises);

                  for (let i = 0; i < result.length; i++) {
                    const name = pictureToUpload[i].name.split(".")[0];
                    newOffer.product_image.push({
                      ["secure_url"]: result[i].secure_url,
                      ["public_id"]: result[i].public_id,
                    });
                  }
                }
              }

              await newOffer.save();

              return res.status(200).json(newOffer);
            } else {
              throw {
                status: 400,
                message:
                  "the price is higher, you must write a price below 10000",
              };
            }
          } else {
            throw {
              status: 400,
              message:
                "The description is too long, you must write 500 characters or less",
            };
          }
        } else {
          throw {
            status: 400,
            message:
              "The title is too long, you must write 50 characters or less",
          };
        }
      } else {
        throw { status: 400, message: "Missing parameters" };
      }
    } catch (error) {
      return res.status(error.status || 500).json({ message: error.message });
    }
  }
);

router.put("/offer/modify", isAuthenticated, async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      condition,
      city,
      brand,
      size,
      color,
      id,
    } = req.body;

    const filters = Object.keys(req.body);
    const offerFound = await Offer.findById(id);

    if (offerFound) {
      const userAgree = await User.findById(offerFound.owner);

      if (req.token === userAgree.token) {
        for (let key in filters) {
          if (filters.hasOwnProperty(key)) {
            if (filters[key] === "title" && title) {
              offerFound.product_name = title;
            } else if (filters[key] === "description" && description) {
              offerFound.product_description = description;
            } else if (filters[key] === "price" && price) {
              offerFound.product_price = price;
            } else if (filters[key] === "brand" && brand) {
              offerFound.product_details[0] = { BRAND: brand };
            } else if (filters[key] === "size" && size) {
              offerFound.product_details[1] = { SIZE: size };
            } else if (filters[key] === "condition" && condition) {
              offerFound.product_details[2] = { CONDITION: condition };
            } else if (filters[key] === "color" && color) {
              offerFound.product_details[3] = { COLOR: color };
            } else if (filters[key] === "city" && city) {
              offerFound.product_details[4] = { CITY: city };
            }
          }
        }
        offerFound.markModified("product_details");
        await offerFound.save();
        res.status(200).json(offerFound);
      } else {
        throw { status: 401, message: "Unauthorized" };
      }
    } else {
      throw { status: 400, message: "No offer is found" };
    }
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
});

router.delete("/offer/delete", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      const offerFound = await Offer.findById(id);

      if (offerFound) {
        const userAgree = await User.findById(offerFound.owner);
        if (req.token === userAgree.token) {
          const keyPicture = [];
          offerFound.product_image.forEach((element) => {
            let key = element.public_id.split("/");
            key = key[key.length - 1];
            keyPicture.push(`vinted/offers/${id}/` + key);
          });

          const search = await cloudinary.api.resources({
            type: "upload",
            prefix: `vinted/offers/${id}`,
          });

          if (search) {
            await cloudinary.api.delete_resources(keyPicture);
            await cloudinary.api.delete_folder(`vinted/offers/${id}/`);
          }
          await Offer.findByIdAndDelete(id);
          return res.status(200).json({ message: "delete" });
        } else {
          throw { status: 401, message: "unauthorized" };
        }
      } else {
        throw { status: 400, message: "The offer doesen't exist" };
      }
    } else {
      throw { status: 400, message: "Missing parameters" };
    }
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
});

router.get("/offers", async (req, res) => {
  try {
    const { title, priceMax, priceMin, sort, page } = req.query;

    const limit = 20;
    let formule = limit * (page - 1);

    let filters = {};
    let sortObject = {};

    if (priceMax && priceMin) {
      filters["product_price"] = {
        $lte: priceMax,
        $gte: priceMin,
      };
    } else {
      if (priceMax) {
        filters["product_price"] = { $lte: priceMax };
      } else if (req.query.priceMin) {
        filters["product_price"] = { $gte: priceMin };
      }
    }

    if (title) {
      filters["product_name"] = new RegExp(title, "i");
    }

    if (sort) {
      if (sort === "price-asc" || sort === "1") {
        sortObject.product_price = "asc";
      } else if (sort === "price-desc" || sort === "-1") {
        sortObject.product_price = "desc";
      }
    }

    const offers = await Offer.find(filters)
      .sort(sortObject)
      .limit(limit)
      .skip(formule)
      .populate({ path: "owner", select: "account" });

    const count = await Offer.countDocuments(filters);

    return res.status(200).json({ count, offers });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "account",
    });

    res.status(200).json(offer);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
});

module.exports = router;
