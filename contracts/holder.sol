// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract holder is Ownable {
    
    IERC20 token;
    IERC721 NFT;
    address treasury;

    uint platformfee;

    mapping (uint => address) private holders;
    mapping (address => uint) private amount;

    constructor(address _token,address _nft,address _treasury){
        token = IERC20(_token);
        NFT = IERC721(_nft);
        treasury = _treasury;
        platformfee = 5;
    }
    function EnterStake(uint _amount) public {
        require(!(token.balanceOf(msg.sender) >=50 ether));
        require(!(_amount == 50 ether) || !(_amount == 100 ether) || !(_amount == 500 ether ),"send valid amount, 50/100/500");
        require(NFT.balanceOf(msg.sender) > 0,"Not NFT Holder");
        token.transferFrom(msg.sender,address(this),_amount);
        amount[msg.sender] += _amount;
    }

    function rewardDistributionToken(address _winner,address _looser) public onlyOwner{
        uint winnerbalance = amount[_winner];
        uint looserbalance = amount[_looser];
        require(!(winnerbalance == looserbalance),"both have different balance");
        uint _Tax1 = cutTax(winnerbalance);
        uint _Tax2 = cutTax(looserbalance);
        uint winnigAmount = (winnerbalance + looserbalance) - (_Tax1 + _Tax2);
        token.transfer(treasury,_Tax1+_Tax2);
        token.transfer(_winner,winnigAmount);
    }

    function cutTax(uint _amount) internal view returns(uint) {
        uint tax = (_amount * platformfee) /100;
        return tax;
    }

    function StakeNFt(uint _nftId) external returns(bool){
        holders[_nftId] = msg.sender;
        NFT.transferFrom(msg.sender,address(this),_nftId);
        return true;
    }

    function rewardDistributionNFt(address recipient,uint _nftId,uint _nftId2) external onlyOwner{
        require(_nftId != 0 && _nftId2 != 0,"Invalid ids");
        NFT.transferFrom(address(this) , recipient , _nftId);
        NFT.transferFrom(address(this) , recipient , _nftId2);

    }

    function drawNFT(address p1,address p2, uint tp1, uint tp2) external onlyOwner {
        require(holders[tp1] == p1 && holders[tp2] == p2,"nft not belong to that address");
        NFT.transferFrom(address(this),p1,tp1);
        NFT.transferFrom(address(this),p2,tp2);
    }

    function drawTokens(address p1,address p2) external onlyOwner {
        require(amount[p1] == amount[p2],"Both should have same balance");
        (bool success1) = token.transferFrom(address(this),p1,amount[p1]);
        (bool success2) = token.transferFrom(address(this),p2,amount[p2]);
        amount[p1] = 0;
        amount[p2] = 0;
        require(success1,"transfer Failed");
        require(success2,"trasnfer Failed");
    }
    function checkStatusNFT(uint _id,address _holder) public view returns(bool){
        return holders[_id]== _holder;
    }

    function setTokenAddress(address _token) public onlyOwner{
        token = IERC20(_token);
    }
    function setNftAddress(address _nft) public onlyOwner{
        NFT = IERC721(_nft);
    }

    function setPlatformFee(uint _tax) external onlyOwner {
        platformfee = _tax;
    }

    function stakedAmount(address _ad) public view returns(uint) {
        return amount[_ad];
    }

}