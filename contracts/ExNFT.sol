// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ExNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    uint256 public mintFee;

    constructor() ERC721("ExNFT", "EXN") Ownable(msg.sender) {}

    function mint(address to, string memory tokenURI) public payable returns (uint256) {
        require(msg.value >= mintFee, "Insufficient fee");
        uint256 tokenId = ++_nextTokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        payable(owner()).transfer(msg.value);
        return tokenId;
    }

    function setMintFee(uint256 _fee) public onlyOwner {
        mintFee = _fee;
    }

    // Override supportsInterface to support URI storage
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // Override tokenURI
    function tokenURI(uint256 tokenId) public view virtual override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
}