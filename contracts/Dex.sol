// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Dex {
    IERC20 public token;
    address public owner;

    uint256 public reserveETH;
    uint256 public reserveToken;

    constructor(address _token) {
        token = IERC20(_token);
        owner = msg.sender;
    }

    function addLiquidity(uint256 tokenAmount) external payable {
        require(token.transferFrom(msg.sender, address(this), tokenAmount), "Token transfer failed");

        reserveETH += msg.value;
        reserveToken += tokenAmount;
    }

    function swapEthToToken() external payable {
        require(msg.value > 0, "Send ETH");

        uint256 tokensOut = getAmountOut(msg.value, reserveETH, reserveToken);
        require(token.transfer(msg.sender, tokensOut), "Token transfer failed");

        reserveETH += msg.value;
        reserveToken -= tokensOut;
    }

    function swapTokenToEth(uint256 tokenAmount) external {
        require(token.transferFrom(msg.sender, address(this), tokenAmount), "Token transfer failed");

        uint256 ethOut = getAmountOut(tokenAmount, reserveToken, reserveETH);
        payable(msg.sender).transfer(ethOut);

        reserveToken += tokenAmount;
        reserveETH -= ethOut;
    }

    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256) {
        uint256 amountInWithFee = amountIn * 997; // 0.3% fee
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = reserveIn * 1000 + amountInWithFee;
        return numerator / denominator;
    }

    receive() external payable {}
}