// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract ffreecap is Ownable {

    address admin;
    IERC20 token;

    uint private reward = 100;
    uint private nftcounter;
    mapping(address => uint) private rewards;
    mapping(address => bool) private rewardholder;


    constructor(address _token) {
        token = IERC20(_token);
    }

    function addreward(address _address,uint _amount) external onlyOwner {
        require(_address != address(0),"cant not send to address 0");
        uint currentBalance = rewards[_address];
        uint rewardamount = _amount * reward;
        rewards[_address] = currentBalance + rewardamount;
    }
    
    function removeReward(address _address)external onlyOwner{
        require(_address != address(0),"cant not send to address 0");
        if(rewards[_address] != 0){
        rewards[_address] -= reward;
            }    
            }

    function showrewards(address ad) public view returns(uint){
        return rewards[ad];
    }

    function claimReward()external{
        require(rewards[msg.sender] > 0,"rewards");
        token.transfer(msg.sender,rewards[msg.sender]);
        rewards[msg.sender] = 0;
    }
    
  
     
}