// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract holder is Ownable {
    
    IERC20 token;
    IERC721 NFT;

    mapping (uint => address) private holders;

    constructor(address _token,address _nft){
        token = IERC20(_token);
        NFT = IERC721(_nft);
    }

    function StakeNFt(uint _nftId) external returns(bool){
        holders[_nftId] = msg.sender;
        NFT.transferFrom(msg.sender,address(this),_nftId);
        return true;
    }

    function reward(address recipient,uint _nftId,uint _nftId2) external onlyOwner{
        require(_nftId != 0 && _nftId2 != 0,"Invalid ids");
        NFT.transferFrom(address(this) , recipient , _nftId);
        NFT.transferFrom(address(this) , recipient , _nftId2);

    }

    function draw(address p1,address p2, uint tp1, uint tp2) external onlyOwner {
        require(holders[tp1] == p1 && holders[tp2] == p2,"nft not belong to that address");
        NFT.transferFrom(address(this),p1,tp1);
        NFT.transferFrom(address(this),p2,tp2);
    }

    function checkStatus(uint _id,address _holder) public view returns(bool){
        return holders[_id]== _holder;
    }

    function setTokenAddress(address _token) public onlyOwner{
        token = IERC20(_token);
    }
    function setNftAddress(address _nft) public onlyOwner{
        NFT = IERC721(_nft);
    }

}