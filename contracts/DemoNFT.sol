// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title DemoNFT
 * @dev ERC-721 NFT Contract for the NFT Marketplace Demo
 * @author 0xAddress.com
 */
contract DemoNFT is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Base URI for metadata
    string private _baseTokenURI;
    
    // Max supply (0 = unlimited)
    uint256 public maxSupply;
    
    // Mint price
    uint256 public mintPrice;
    
    // Is minting public?
    bool public publicMintEnabled;
    
    // Royalty info (EIP-2981)
    address public royaltyReceiver;
    uint96 public royaltyFeeNumerator; // Out of 10000 (e.g., 250 = 2.5%)
    
    // Events
    event Minted(address indexed to, uint256 indexed tokenId, string tokenURI);
    event BaseURIUpdated(string newBaseURI);
    event MintPriceUpdated(uint256 newPrice);
    event PublicMintToggled(bool enabled);
    event RoyaltyUpdated(address receiver, uint96 feeNumerator);
    
    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        uint256 maxSupply_,
        uint256 mintPrice_,
        address royaltyReceiver_,
        uint96 royaltyFee_
    ) ERC721(name_, symbol_) Ownable(msg.sender) {
        _baseTokenURI = baseURI_;
        maxSupply = maxSupply_;
        mintPrice = mintPrice_;
        royaltyReceiver = royaltyReceiver_;
        royaltyFeeNumerator = royaltyFee_;
        publicMintEnabled = false;
    }
    
    // ============================================
    // Minting Functions
    // ============================================
    
    /**
     * @dev Mint a new NFT (owner only when public mint is disabled)
     * @param to Address to mint to
     * @param uri Token metadata URI
     */
    function mint(address to, string memory uri) public payable returns (uint256) {
        // Check public mint or owner
        if (!publicMintEnabled) {
            require(msg.sender == owner(), "Public minting not enabled");
        } else {
            require(msg.value >= mintPrice, "Insufficient payment");
        }
        
        // Check max supply
        if (maxSupply > 0) {
            require(_tokenIdCounter.current() < maxSupply, "Max supply reached");
        }
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        emit Minted(to, tokenId, uri);
        
        return tokenId;
    }
    
    /**
     * @dev Batch mint NFTs (owner only)
     * @param to Address to mint to
     * @param uris Array of token URIs
     */
    function batchMint(address to, string[] memory uris) external onlyOwner returns (uint256[] memory) {
        uint256[] memory tokenIds = new uint256[](uris.length);
        
        for (uint256 i = 0; i < uris.length; i++) {
            tokenIds[i] = mint(to, uris[i]);
        }
        
        return tokenIds;
    }
    
    // ============================================
    // Admin Functions
    // ============================================
    
    /**
     * @dev Set base URI for all tokens
     */
    function setBaseURI(string memory baseURI_) external onlyOwner {
        _baseTokenURI = baseURI_;
        emit BaseURIUpdated(baseURI_);
    }
    
    /**
     * @dev Set mint price
     */
    function setMintPrice(uint256 price_) external onlyOwner {
        mintPrice = price_;
        emit MintPriceUpdated(price_);
    }
    
    /**
     * @dev Toggle public minting
     */
    function setPublicMintEnabled(bool enabled_) external onlyOwner {
        publicMintEnabled = enabled_;
        emit PublicMintToggled(enabled_);
    }
    
    /**
     * @dev Set royalty info (EIP-2981)
     */
    function setRoyaltyInfo(address receiver_, uint96 feeNumerator_) external onlyOwner {
        require(feeNumerator_ <= 1000, "Fee too high"); // Max 10%
        royaltyReceiver = receiver_;
        royaltyFeeNumerator = feeNumerator_;
        emit RoyaltyUpdated(receiver_, feeNumerator_);
    }
    
    /**
     * @dev Withdraw contract balance
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        payable(owner()).transfer(balance);
    }
    
    // ============================================
    // View Functions
    // ============================================
    
    /**
     * @dev Get total minted tokens
     */
    function totalMinted() external view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    /**
     * @dev Get all tokens owned by an address
     */
    function tokensOfOwner(address owner_) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner_);
        uint256[] memory tokens = new uint256[](balance);
        
        for (uint256 i = 0; i < balance; i++) {
            tokens[i] = tokenOfOwnerByIndex(owner_, i);
        }
        
        return tokens;
    }
    
    /**
     * @dev EIP-2981 royalty info
     */
    function royaltyInfo(uint256, uint256 salePrice) external view returns (address, uint256) {
        uint256 royaltyAmount = (salePrice * royaltyFeeNumerator) / 10000;
        return (royaltyReceiver, royaltyAmount);
    }
    
    // ============================================
    // Override Functions
    // ============================================
    
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, ERC721Enumerable) returns (bool) {
        // EIP-2981 interface ID
        return interfaceId == 0x2a55205a || super.supportsInterface(interfaceId);
    }
    
    function _update(address to, uint256 tokenId, address auth) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }
    
    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }
}
