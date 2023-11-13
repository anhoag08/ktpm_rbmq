const axios = require("axios");
const fs = require("fs");
const sharp = require("sharp");
const imgbbUploader = require("imgbb-uploader");

exports.resizeAndUpload = async (res, url) => {
  const outputPath = `./${res}/img.jpg`;
  let resultResponse;
  try {
    await downloadImageAndResize(url, outputPath, res);
    try {
      const uploadRes = await upload(outputPath, res);
      resultResponse = uploadRes;
    } catch (error) {
      throw error; // Rethrow the error to be caught in the calling code
    }
    return resultResponse;
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
      .toFile(path.slice(0, path.length - 4) + "-" + res + "-resize.jpg");
    fs.unlinkSync(path);
  } catch (error) {
    console.error("Error downloading and resizing the image:", error);
  }
};

const upload = async (outputPath, res) => {
  try {
    const response = await imgbbUploader(
      "4b5afd5caf4c66ab6f10a723d2e48cbe",
      outputPath.slice(0, outputPath.length - 4) + "-" + res + "-resize.jpg"
    );
    return response.url;
  } catch (error) {
    throw error; // Rethrow the error to be caught in the calling code
  }
};
