// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NFTMarketplace
 * @notice Multi-contract NFT marketplace supporting buy orders and fixed-price listings
 * @dev Supports: Buy Orders (offers), Fixed Price Listings, EIP-2981 Royalties
 * @author 0xAddress.com
 */
contract NFTMarketplace is IERC721Receiver, ReentrancyGuard, Pausable, Ownable {
    
    // ============================================
    // Structs
    // ============================================
    
    struct Order {
        uint256 orderId;
        address nftContract;
        uint256 tokenId;
        address buyer;
        uint256 price;
        uint256 createdAt;
        bool active;
    }
    
    struct Listing {
        address seller;
        uint256 price;
        uint256 createdAt;
        bool active;
    }
    
    struct Sale {
        address seller;
        address buyer;
        uint256 price;
        uint256 timestamp;
    }
    
    // ============================================
    // State Variables
    // ============================================
    
    uint256 public marketplaceFee; // basis points (250 = 2.5%)
    uint256 public constant MAX_FEE = 1000; // 10%
    address public feeRecipient;
    uint256 private _orderIdCounter;
    
    mapping(uint256 => Order) public orders;
    mapping(address => mapping(uint256 => Listing)) public listings;
    mapping(address => mapping(uint256 => Sale[])) private _salesHistory;
    mapping(address => mapping(uint256 => uint256[])) private _activeOrderIds;
    mapping(address => uint256[]) private _userOrderIds;
    
    // ============================================
    // Events
    // ============================================
    
    event OrderCreated(uint256 indexed orderId, address indexed nftContract, uint256 indexed tokenId, address buyer, uint256 price);
    event OrderAccepted(uint256 indexed orderId, address indexed nftContract, uint256 indexed tokenId, address seller, address buyer, uint256 price);
    event OrderCancelled(uint256 indexed orderId);
    event Listed(address indexed nftContract, uint256 indexed tokenId, address indexed seller, uint256 price);
    event ListingUpdated(address indexed nftContract, uint256 indexed tokenId, uint256 newPrice);
    event ListingCancelled(address indexed nftContract, uint256 indexed tokenId);
    event Purchased(address indexed nftContract, uint256 indexed tokenId, address indexed buyer, address seller, uint256 price);
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeRecipientUpdated(address oldRecipient, address newRecipient);
    
    // ============================================
    // Constructor
    // ============================================
    
    constructor(uint256 _marketplaceFee, address _feeRecipient) Ownable(msg.sender) {
        require(_marketplaceFee <= MAX_FEE, "Fee too high");
        require(_feeRecipient != address(0), "Invalid fee recipient");
        marketplaceFee = _marketplaceFee;
        feeRecipient = _feeRecipient;
    }
    
    // ============================================
    // Buy Orders
    // ============================================
    
    function createOrder(address nftContract, uint256 tokenId) external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "Price must be > 0");
        require(nftContract != address(0), "Invalid NFT contract");
        
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) != address(0), "Token does not exist");
        require(nft.ownerOf(tokenId) != msg.sender, "Cannot bid on own NFT");
        
        uint256 orderId = _orderIdCounter++;
        
        orders[orderId] = Order({
            orderId: orderId,
            nftContract: nftContract,
            tokenId: tokenId,
            buyer: msg.sender,
            price: msg.value,
            createdAt: block.timestamp,
            active: true
        });
        
        _activeOrderIds[nftContract][tokenId].push(orderId);
        _userOrderIds[msg.sender].push(orderId);
        
        emit OrderCreated(orderId, nftContract, tokenId, msg.sender, msg.value);
    }
    
    function acceptOrder(uint256 orderId) external nonReentrant whenNotPaused {
        Order storage order = orders[orderId];
        require(order.active, "Order not active");
        
        IERC721 nft = IERC721(order.nftContract);
        address owner = nft.ownerOf(order.tokenId);
        require(owner == msg.sender, "Not NFT owner");
        require(
            nft.isApprovedForAll(msg.sender, address(this)) || 
            nft.getApproved(order.tokenId) == address(this),
            "Marketplace not approved"
        );
        
        order.active = false;
        
        if (listings[order.nftContract][order.tokenId].active) {
            listings[order.nftContract][order.tokenId].active = false;
            emit ListingCancelled(order.nftContract, order.tokenId);
        }
        
        _executeSale(order.nftContract, order.tokenId, msg.sender, order.buyer, order.price);
        
        emit OrderAccepted(orderId, order.nftContract, order.tokenId, msg.sender, order.buyer, order.price);
    }
    
    function cancelOrder(uint256 orderId) external nonReentrant {
        Order storage order = orders[orderId];
        require(order.active, "Order not active");
        require(order.buyer == msg.sender, "Not order owner");
        
        order.active = false;
        
        (bool success, ) = payable(msg.sender).call{value: order.price}("");
        require(success, "ETH transfer failed");
        
        emit OrderCancelled(orderId);
    }
    
    // ============================================
    // Fixed Price Listings
    // ============================================
    
    function createListing(address nftContract, uint256 tokenId, uint256 price) external nonReentrant whenNotPaused {
        require(price > 0, "Price must be > 0");
        require(nftContract != address(0), "Invalid NFT contract");
        
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not NFT owner");
        require(
            nft.isApprovedForAll(msg.sender, address(this)) || 
            nft.getApproved(tokenId) == address(this),
            "Marketplace not approved"
        );
        
        listings[nftContract][tokenId] = Listing({
            seller: msg.sender,
            price: price,
            createdAt: block.timestamp,
            active: true
        });
        
        emit Listed(nftContract, tokenId, msg.sender, price);
    }
    
    function updateListing(address nftContract, uint256 tokenId, uint256 newPrice) external nonReentrant {
        Listing storage listing = listings[nftContract][tokenId];
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not listing owner");
        require(newPrice > 0, "Price must be > 0");
        
        listing.price = newPrice;
        emit ListingUpdated(nftContract, tokenId, newPrice);
    }
    
    function cancelListing(address nftContract, uint256 tokenId) external nonReentrant {
        Listing storage listing = listings[nftContract][tokenId];
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not listing owner");
        
        listing.active = false;
        emit ListingCancelled(nftContract, tokenId);
    }
    
    function buyNow(address nftContract, uint256 tokenId) external payable nonReentrant whenNotPaused {
        Listing storage listing = listings[nftContract][tokenId];
        require(listing.active, "Listing not active");
        require(msg.value >= listing.price, "Insufficient payment");
        require(listing.seller != msg.sender, "Cannot buy own NFT");
        
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == listing.seller, "Seller no longer owns NFT");
        
        listing.active = false;
        
        _executeSale(nftContract, tokenId, listing.seller, msg.sender, listing.price);
        
        if (msg.value > listing.price) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - listing.price}("");
            require(success, "Refund failed");
        }
        
        emit Purchased(nftContract, tokenId, msg.sender, listing.seller, listing.price);
    }
    
    // ============================================
    // Internal Functions
    // ============================================
    
    function _executeSale(address nftContract, uint256 tokenId, address seller, address buyer, uint256 price) internal {
        IERC721 nft = IERC721(nftContract);
        
        uint256 marketplaceCut = (price * marketplaceFee) / 10000;
        uint256 sellerAmount = price - marketplaceCut;
        
        uint256 royaltyAmount = 0;
        address royaltyReceiver = address(0);
        
        try IERC2981(nftContract).royaltyInfo(tokenId, price) returns (address receiver, uint256 amount) {
            if (receiver != address(0) && amount > 0 && amount <= sellerAmount) {
                royaltyReceiver = receiver;
                royaltyAmount = amount;
                sellerAmount -= royaltyAmount;
            }
        } catch {}
        
        nft.safeTransferFrom(seller, buyer, tokenId);
        
        if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
            (bool royaltySuccess, ) = payable(royaltyReceiver).call{value: royaltyAmount}("");
            require(royaltySuccess, "Royalty transfer failed");
        }
        
        (bool sellerSuccess, ) = payable(seller).call{value: sellerAmount}("");
        require(sellerSuccess, "Seller transfer failed");
        
        if (marketplaceCut > 0) {
            (bool feeSuccess, ) = payable(feeRecipient).call{value: marketplaceCut}("");
            require(feeSuccess, "Fee transfer failed");
        }
        
        _salesHistory[nftContract][tokenId].push(Sale({
            seller: seller,
            buyer: buyer,
            price: price,
            timestamp: block.timestamp
        }));
    }
    
    // ============================================
    // View Functions
    // ============================================
    
    function getActiveOrders(address nftContract, uint256 tokenId) external view returns (Order[] memory) {
        uint256[] storage orderIds = _activeOrderIds[nftContract][tokenId];
        
        uint256 activeCount = 0;
        for (uint256 i = 0; i < orderIds.length; i++) {
            if (orders[orderIds[i]].active) activeCount++;
        }
        
        Order[] memory activeOrders = new Order[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < orderIds.length; i++) {
            if (orders[orderIds[i]].active) {
                activeOrders[index] = orders[orderIds[i]];
                index++;
            }
        }
        
        return activeOrders;
    }
    
    function getHighestOrder(address nftContract, uint256 tokenId) external view returns (Order memory) {
        uint256[] storage orderIds = _activeOrderIds[nftContract][tokenId];
        
        Order memory highest;
        uint256 highestPrice = 0;
        
        for (uint256 i = 0; i < orderIds.length; i++) {
            Order storage order = orders[orderIds[i]];
            if (order.active && order.price > highestPrice) {
                highest = order;
                highestPrice = order.price;
            }
        }
        
        return highest;
    }
    
    function getUserOrders(address user) external view returns (Order[] memory) {
        uint256[] storage orderIds = _userOrderIds[user];
        
        Order[] memory userOrders = new Order[](orderIds.length);
        for (uint256 i = 0; i < orderIds.length; i++) {
            userOrders[i] = orders[orderIds[i]];
        }
        
        return userOrders;
    }
    
    function getSalesHistory(address nftContract, uint256 tokenId) external view returns (Sale[] memory) {
        return _salesHistory[nftContract][tokenId];
    }
    
    function getListing(address nftContract, uint256 tokenId) external view returns (Listing memory) {
        return listings[nftContract][tokenId];
    }
    
    function isListed(address nftContract, uint256 tokenId) external view returns (bool) {
        Listing storage listing = listings[nftContract][tokenId];
        if (!listing.active) return false;
        
        try IERC721(nftContract).ownerOf(tokenId) returns (address owner) {
            return owner == listing.seller;
        } catch {
            return false;
        }
    }
    
    function totalOrders() external view returns (uint256) {
        return _orderIdCounter;
    }
    
    // ============================================
    // Admin Functions
    // ============================================
    
    function setMarketplaceFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_FEE, "Fee too high");
        uint256 oldFee = marketplaceFee;
        marketplaceFee = newFee;
        emit FeeUpdated(oldFee, newFee);
    }
    
    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid address");
        address oldRecipient = feeRecipient;
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(oldRecipient, newRecipient);
    }
    
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
    
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdraw failed");
    }
    
    // ============================================
    // ERC721 Receiver
    // ============================================
    
    function onERC721Received(address, address, uint256, bytes calldata) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }
    
    receive() external payable {}
}

interface IERC2981 {
    function royaltyInfo(uint256 tokenId, uint256 salePrice) external view returns (address receiver, uint256 royaltyAmount);
}
