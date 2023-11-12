const imgbbUploader = require("imgbb-uploader");

// Define an asynchronous function to call resizeAndUpload
const main = async () => {
  try {
    const response = await this.resizeAndUpload();
    console.log(response);
  } catch (error) {
    console.error(error);
  }
};

exports.resizeAndUpload = async () => {
  try {
    const response = await imgbbUploader(
      "4b5afd5caf4c66ab6f10a723d2e48cbe",
      "./2560x1440/img.-resize.jpg"
    );
    return response.medium.url;
  } catch (error) {
    throw error; // Rethrow the error to be caught in the calling code
  }
};

main(); // Call the main function to start the process
