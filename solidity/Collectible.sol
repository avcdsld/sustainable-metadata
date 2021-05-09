// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Collectible is ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Burnable, Ownable {
    constructor() ERC721("Collectible", "COL") {}

    mapping (uint256 => string) private _proposingTokenURIs;
    mapping (uint256 => address) private _tokenMaintainers;

    function mint(address to, uint256 tokenId, string memory metadataURI) public onlyOwner {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
        _tokenMaintainers[tokenId] = _msgSender();
    }

    function mintWithMaintainer(address to, uint256 tokenId, string memory metadataURI, address maintainer) public onlyOwner {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
        _tokenMaintainers[tokenId] = maintainer;
    }

    // NOTE: You can save Gas by using signature verifications, but we have made it a function for simplicity.
    function proposeNewTokenURI(uint256 tokenId, string memory _tokenURI) public {
        require(_tokenMaintainers[tokenId] == _msgSender(), "Collectible: caller is not the maintainer");
        _proposingTokenURIs[tokenId] = _tokenURI;
    }

    function acceptNewTokenURI(uint256 tokenId, string memory _tokenURI) public {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "Collectible: caller is not owner nor approved");
        require(bytes(_proposingTokenURIs[tokenId]).length > 0, "Collectible: proposingTokenURI does not exist");
        require(keccak256(abi.encodePacked(_proposingTokenURIs[tokenId])) == keccak256(abi.encodePacked(_tokenURI)),
            "Collectible: Not the expected tokenURI");
        _setTokenURI(tokenId, _tokenURI);
        delete _proposingTokenURIs[tokenId];
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://ipfs.fleek.co/ipfs/";
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
