// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const fs = require("fs");

async function  main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');
  const [signer1, signer2, signer3, treasury, signer5, signer6, signer7] =
    await ethers.getSigners();
  // We get the contract to deploy
  const ERC20Token = await hre.ethers.getContractFactory("erc20");
  const Distributer = await hre.ethers.getContractFactory("distributer");
  const NFT = await hre.ethers.getContractFactory("NFT");
  const Holder = await hre.ethers.getContractFactory("holder");

  let obj = {};

  //token deploy
  const token = await ERC20Token.deploy();
  await token.deployed();
  console.log("Token : ", token.address);
  obj["Token"] = token.address;
  //distributer deployment
  const distributer = await Distributer.deploy(token.address);
  console.log("distributer : ", distributer.address);
  obj["distributer"] = distributer.address;
  //NFt deployment
  const nft = await NFT.deploy(
    "NFC",
    "NFC",
    "asdasd",
    "asdasd",
    distributer.address
  );
  await nft.deployed();
  console.log("NFT : ", nft.address);
  obj["NFT"] = nft.address;



  //transfer ownership to smart contract NFT
  await distributer.connect(signer1).transferOwnership(nft.address);

  const holder = await Holder.deploy(
    token.address,
    nft.address,
    signer1.address
  );
  await holder.deployed();
  console.log("Holder : ",holder.address);
  obj["holder"]= holder.address;





  // console.log(obj);
  // obj = JSON.parse(obj);
  obj = JSON.stringify(obj);
   fs.writeFileSync("../ESPDemo/src/utils/output.json", obj, "utf8", function (err) {
    if (err) {
      console.log("An error occured while writing JSON Object to File.");
      return console.log(err);
    }

    console.log("JSON file has been saved.");
  });



}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
