// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StudentNFT is ERC721URIStorage, Ownable {

    uint256 public nextId;

    constructor()
        ERC721("Student NFT", "SNFT")
        Ownable(msg.sender)
    {}

    function mintStudentNFT(
        address student,
        string memory tokenURI
    ) external onlyOwner {

        _safeMint(student, nextId);

        _setTokenURI(nextId, tokenURI);

        nextId++;
    }
}