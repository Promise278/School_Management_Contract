// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SchoolToken is ERC20, Ownable {

    constructor()
        ERC20("School Token", "SCH")
        Ownable(msg.sender)
    {
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount)
        external
        onlyOwner
    {
        _mint(to, amount);
    }
}