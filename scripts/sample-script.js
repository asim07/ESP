// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');
  const [signer1,signer2,signer3,signer4,signer5,signer6,signer7] = await ethers.getSigners();
  // We get the contract to deploy
  const ERC20Token = await hre.ethers.getContractFactory("erc20");
  const Distributer =  await hre.ethers.getContractFactory("distributer");
  const NFT = await hre.ethers.getContractFactory("NFT");
  const Holder = await hre.ethers.getContractFactory("holder");

  //token deploy
  const token = await ERC20Token.deploy();
  await token.deployed();
  console.log("Token : ",token.address);

  //distributer deployment
  const distributer = await Distributer.deploy(token.address);
  console.log("distributer : ",distributer.address);

  //NFt deployment
  const nft = await NFT.deploy("NFC","NFC","asdasd","asdasd",distributer.address);
  await nft.deployed();
  console.log("NFT : ",nft.address);

  //send tokens to the distributer server
  await token.connect(signer1).mint(distributer.address,ethers.utils.parseEther("20000"));

  //transfer ownership to smart contract NFT
  await distributer.connect(signer1).transferOwnership(nft.address);

  const holder = await Holder.deploy(token.address,nft.address);
  await holder.deployed();

  const options = {value: ethers.utils.parseEther("3")}
  console.log("working");

  await nft.connect(signer2).mint("3",options);
  await nft.connect(signer3).mint("3",options);

  await nft.connect(signer2).setApprovalForAll(holder.address);
  await nft.connect(signer3).setApprovalForAll(holder.address);
  
  console.log("working");
  
  await holder.connect(signer2).StakeNFt(1);
  // await holder.connect(signer3).StakeNFt("4");


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
