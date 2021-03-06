// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const fs = require("fs");

async function main() {
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

  //send tokens to the distributer server
  await token
    .connect(signer1)
    .mint(distributer.address, ethers.utils.parseEther("20000"));

  await token
    .connect(signer1)
    .mint(signer2.address, ethers.utils.parseEther("10000"));
  await token
    .connect(signer1)
    .mint(signer3.address, ethers.utils.parseEther("10000"));

  const signer2tokenBalance = await token
    .connect(signer1)
    .balanceOf(signer2.address);
  const signer3tokenBalance = await token
    .connect(signer1)
    .balanceOf(signer3.address);

  console.log("Balance of token of signer 2 : ", signer2tokenBalance);
  console.log("Balance of token of signer 3 : ", signer3tokenBalance);

  //transfer ownership to smart contract NFT
  await distributer.connect(signer1).transferOwnership(nft.address);

  const holder = await Holder.deploy(
    token.address,
    nft.address,
    treasury.address
  );
  await holder.deployed();
  console.log("Holder : ",holder.address);
  obj["holder"]= holder.address;

  const options = { value: ethers.utils.parseEther("3") };
  console.log("Its Working....");

  await nft.connect(signer2).mint("3", options);
  await nft.connect(signer3).mint("3", options);

  await nft.connect(signer2).setApprovalForAll(holder.address, true);
  await nft.connect(signer3).setApprovalForAll(holder.address, true);

  await holder.connect(signer2).StakeNFt(1);
  await holder.connect(signer3).StakeNFt(4);

  const data = await holder
    .connect(signer2)
    .checkStatusNFT("1", signer2.address);
  const data2 = await holder
    .connect(signer2)
    .checkStatusNFT("4", signer3.address);
  console.log("data : ", data, "  data2 : ", data2);

  console.log(
    "\n before destribution blanace of signer3 : ",
    await nft.connect(signer1).balanceOf(signer3.address)
  );
  console.log("\n Now distribute the rewards");
  let d = await holder
    .connect(signer1)
    .rewardDistributionNFt(signer3.address, 1, 4);
  console.log(
    "After destribution blanace of signer3 : ",
    await nft.connect(signer1).balanceOf(signer3.address)
  );



  await token.connect(signer2).approve(holder.address,ethers.utils.parseEther("4"));
  await token.connect(signer2).approve(holder.address,ethers.utils.parseEther("4"));



  // console.log(obj);
  // obj = JSON.parse(obj);
  obj = JSON.stringify(obj);
  await fs.writeFileSync("../ESPDemo/src/utils/output.json", obj, "utf8", function (err) {
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
