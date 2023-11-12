const axios = require("axios");
const fs = require("fs");
const sharp = require("sharp");
const imgbbUploader = require("imgbb-uploader");

exports.resizeAndUpload = async (res, url) => {
  const outputPath = `./${res}/img.jpg`;
  try {
    downloadImageAndResize(url, outputPath, res)
      .then(async () => {
        try {
          const response = await this.upload(outputPath);
          console.log(response)
          return response;
        } catch (error) {
          throw error; // Rethrow the error to be caught in the calling code
        }
      })
      .catch((err) => {
        console.error("Error downloading and resizing the image:", err);
      });
  } catch (error) {
    console.error("Error downloading and resizing the image:", error);
  }
};

const downloadImageAndResize = async (url, path, res) => {
  try {
    const response = await axios.get(url, {
      responseType: "stream",
    });

    // Download the original image
    const writer = fs.createWriteStream(path);

    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    const wh = res.split("x");

    // Resize the image to the specified resolution
    await sharp(path)
      .resize(parseInt(wh[0]), parseInt(wh[1]))
      .toFile(path.slice(0, path.length - 4) + "-resize.jpg");
    fs.unlinkSync(path);
  } catch (error) {
    console.error("Error downloading and resizing the image:", error);
  }
};

exports.upload = async (outputPath) => {
  try {
    const response = await imgbbUploader(
      "4b5afd5caf4c66ab6f10a723d2e48cbe",
      outputPath.slice(0, outputPath.length - 4) + "-resize.jpg"
    );
    return response.medium.url;
  } catch (error) {
    throw error; // Rethrow the error to be caught in the calling code
  }
};
