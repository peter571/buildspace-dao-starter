import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const editionDrop = sdk.getEditionDrop("0xCE11518dcDC1ABC1127D630Cb5A327bD53D7F3cf");

(async () => {
  try {
    await editionDrop.createBatch([
      {
        name: "Chelsea Fan",
        description: "This NFT will give you access to ChelseaFansDAO!",
        image: readFileSync("scripts/assets/chelsea.jpg"),
      },
    ]);
    console.log("✅ Successfully created a new NFT in the drop!");
  } catch (error) {
    console.error("failed to create the new NFT", error);
  }
})();