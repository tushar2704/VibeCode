# ⛓️ Blockchain Development

> **By [Tushar Aggarwal](https://www.linkedin.com/in/tusharaggarwalinseec/)** - *Decentralized Application Development*
> 
> 🔗 **Connect**: [LinkedIn](https://www.linkedin.com/in/tusharaggarwalinseec/) | Follow for blockchain insights and best practices

---

## Overview

Blockchain development enables decentralized, transparent, and secure applications. This guide covers **Ethereum**, **Solidity smart contracts**, **Web3 integration**, **DeFi protocols**, and **Context Engineering** methodology for production-ready blockchain solutions.

## 🔗 Ethereum Smart Contracts

### Solidity Contract Development

```solidity
// Token.sol - ERC-20 token with advanced features
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract AdvancedToken is ERC20, ERC20Burnable, Ownable, Pausable, ReentrancyGuard {
    uint256 public constant MAX_SUPPLY = 1000000 * 10**18; // 1 million tokens
    uint256 public constant INITIAL_SUPPLY = 100000 * 10**18; // 100k tokens
    
    mapping(address => bool) public blacklisted;
    mapping(address => uint256) public stakingBalance;
    mapping(address => uint256) public stakingTimestamp;
    
    uint256 public stakingRewardRate = 10; // 10% annual rate
    uint256 public minimumStakingPeriod = 30 days;
    
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);
    event Blacklisted(address indexed account, bool status);
    
    constructor() ERC20("AdvancedToken", "ADV") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    modifier notBlacklisted(address account) {
        require(!blacklisted[account], "Account is blacklisted");
        _;
    }
    
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds maximum supply");
        _mint(to, amount);
    }
    
    function pause() public onlyOwner {
        _pause();
    }
    
    function unpause() public onlyOwner {
        _unpause();
    }
    
    function setBlacklist(address account, bool status) public onlyOwner {
        blacklisted[account] = status;
        emit Blacklisted(account, status);
    }
    
    function stake(uint256 amount) public notBlacklisted(msg.sender) nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // If user already has stakes, calculate and add pending rewards
        if (stakingBalance[msg.sender] > 0) {
            uint256 reward = calculateStakingReward(msg.sender);
            if (reward > 0) {
                _mint(msg.sender, reward);
            }
        }
        
        _transfer(msg.sender, address(this), amount);
        stakingBalance[msg.sender] += amount;
        stakingTimestamp[msg.sender] = block.timestamp;
        
        emit Staked(msg.sender, amount);
    }
    
    function unstake() public nonReentrant {
        uint256 stakedAmount = stakingBalance[msg.sender];
        require(stakedAmount > 0, "No staked tokens");
        require(
            block.timestamp >= stakingTimestamp[msg.sender] + minimumStakingPeriod,
            "Minimum staking period not met"
        );
        
        uint256 reward = calculateStakingReward(msg.sender);
        
        stakingBalance[msg.sender] = 0;
        stakingTimestamp[msg.sender] = 0;
        
        _transfer(address(this), msg.sender, stakedAmount);
        
        if (reward > 0) {
            _mint(msg.sender, reward);
        }
        
        emit Unstaked(msg.sender, stakedAmount, reward);
    }
    
    function calculateStakingReward(address account) public view returns (uint256) {
        uint256 stakedAmount = stakingBalance[account];
        if (stakedAmount == 0) return 0;
        
        uint256 stakingDuration = block.timestamp - stakingTimestamp[account];
        uint256 yearInSeconds = 365 days;
        
        return (stakedAmount * stakingRewardRate * stakingDuration) / (100 * yearInSeconds);
    }
    
    function getStakingInfo(address account) public view returns (
        uint256 stakedAmount,
        uint256 stakingTime,
        uint256 pendingReward,
        uint256 timeUntilUnlock
    ) {
        stakedAmount = stakingBalance[account];
        stakingTime = stakingTimestamp[account];
        pendingReward = calculateStakingReward(account);
        
        if (stakingTime > 0) {
            uint256 unlockTime = stakingTime + minimumStakingPeriod;
            timeUntilUnlock = unlockTime > block.timestamp ? unlockTime - block.timestamp : 0;
        }
    }
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused notBlacklisted(from) notBlacklisted(to) {
        super._beforeTokenTransfer(from, to, amount);
    }
}
```

### NFT Marketplace Contract

```solidity
// NFTMarketplace.sol - Comprehensive NFT marketplace
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTMarketplace is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;
    
    uint256 public listingFee = 0.025 ether;
    uint256 public platformFeePercentage = 250; // 2.5%
    
    struct MarketItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
        bool active;
    }
    
    struct Auction {
        uint256 itemId;
        uint256 startingBid;
        uint256 highestBid;
        address payable highestBidder;
        uint256 endTime;
        bool ended;
    }
    
    mapping(uint256 => MarketItem) private idToMarketItem;
    mapping(uint256 => Auction) private idToAuction;
    mapping(address => mapping(uint256 => uint256)) private nftToItemId;
    
    event MarketItemCreated(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price
    );
    
    event MarketItemSold(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address buyer,
        uint256 price
    );
    
    event AuctionCreated(
        uint256 indexed itemId,
        uint256 startingBid,
        uint256 endTime
    );
    
    event BidPlaced(
        uint256 indexed itemId,
        address indexed bidder,
        uint256 amount
    );
    
    event AuctionEnded(
        uint256 indexed itemId,
        address indexed winner,
        uint256 amount
    );
    
    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant {
        require(price > 0, "Price must be greater than 0");
        require(msg.value == listingFee, "Must pay listing fee");
        
        _itemIds.increment();
        uint256 itemId = _itemIds.current();
        
        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false,
            true
        );
        
        nftToItemId[nftContract][tokenId] = itemId;
        
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
        
        emit MarketItemCreated(
            itemId,
            nftContract,
            tokenId,
            msg.sender,
            address(0),
            price
        );
    }
    
    function createMarketSale(uint256 itemId) public payable nonReentrant {
        MarketItem storage item = idToMarketItem[itemId];
        require(item.active, "Item not active");
        require(!item.sold, "Item already sold");
        require(msg.value == item.price, "Incorrect price");
        
        uint256 platformFee = (item.price * platformFeePercentage) / 10000;
        uint256 sellerAmount = item.price - platformFee;
        
        item.seller.transfer(sellerAmount);
        payable(owner()).transfer(platformFee);
        
        IERC721(item.nftContract).transferFrom(address(this), msg.sender, item.tokenId);
        
        item.owner = payable(msg.sender);
        item.sold = true;
        item.active = false;
        
        _itemsSold.increment();
        
        emit MarketItemSold(
            itemId,
            item.nftContract,
            item.tokenId,
            item.seller,
            msg.sender,
            item.price
        );
    }
    
    function createAuction(
        address nftContract,
        uint256 tokenId,
        uint256 startingBid,
        uint256 duration
    ) public payable nonReentrant {
        require(startingBid > 0, "Starting bid must be greater than 0");
        require(duration > 0, "Duration must be greater than 0");
        require(msg.value == listingFee, "Must pay listing fee");
        
        _itemIds.increment();
        uint256 itemId = _itemIds.current();
        
        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            startingBid,
            false,
            true
        );
        
        idToAuction[itemId] = Auction(
            itemId,
            startingBid,
            0,
            payable(address(0)),
            block.timestamp + duration,
            false
        );
        
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
        
        emit AuctionCreated(itemId, startingBid, block.timestamp + duration);
    }
    
    function placeBid(uint256 itemId) public payable nonReentrant {
        Auction storage auction = idToAuction[itemId];
        require(auction.itemId != 0, "Auction does not exist");
        require(block.timestamp < auction.endTime, "Auction has ended");
        require(!auction.ended, "Auction already ended");
        require(msg.value > auction.highestBid, "Bid too low");
        require(msg.value >= auction.startingBid, "Bid below starting bid");
        
        // Refund previous highest bidder
        if (auction.highestBidder != address(0)) {
            auction.highestBidder.transfer(auction.highestBid);
        }
        
        auction.highestBid = msg.value;
        auction.highestBidder = payable(msg.sender);
        
        emit BidPlaced(itemId, msg.sender, msg.value);
    }
    
    function endAuction(uint256 itemId) public nonReentrant {
        Auction storage auction = idToAuction[itemId];
        MarketItem storage item = idToMarketItem[itemId];
        
        require(auction.itemId != 0, "Auction does not exist");
        require(block.timestamp >= auction.endTime, "Auction still active");
        require(!auction.ended, "Auction already ended");
        
        auction.ended = true;
        
        if (auction.highestBidder != address(0)) {
            uint256 platformFee = (auction.highestBid * platformFeePercentage) / 10000;
            uint256 sellerAmount = auction.highestBid - platformFee;
            
            item.seller.transfer(sellerAmount);
            payable(owner()).transfer(platformFee);
            
            IERC721(item.nftContract).transferFrom(
                address(this),
                auction.highestBidder,
                item.tokenId
            );
            
            item.owner = auction.highestBidder;
            item.sold = true;
            
            _itemsSold.increment();
            
            emit AuctionEnded(itemId, auction.highestBidder, auction.highestBid);
        } else {
            // No bids, return NFT to seller
            IERC721(item.nftContract).transferFrom(
                address(this),
                item.seller,
                item.tokenId
            );
        }
        
        item.active = false;
    }
    
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _itemIds.current();
        uint256 unsoldItemCount = _itemIds.current() - _itemsSold.current();
        uint256 currentIndex = 0;
        
        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        
        for (uint256 i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].active && !idToMarketItem[i + 1].sold) {
                MarketItem storage currentItem = idToMarketItem[i + 1];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        
        return items;
    }
    
    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }
        
        MarketItem[] memory items = new MarketItem[](itemCount);
        
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                MarketItem storage currentItem = idToMarketItem[i + 1];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        
        return items;
    }
    
    function getAuction(uint256 itemId) public view returns (Auction memory) {
        return idToAuction[itemId];
    }
    
    function updateListingFee(uint256 _listingFee) public onlyOwner {
        listingFee = _listingFee;
    }
    
    function updatePlatformFee(uint256 _platformFeePercentage) public onlyOwner {
        require(_platformFeePercentage <= 1000, "Fee too high"); // Max 10%
        platformFeePercentage = _platformFeePercentage;
    }
    
    function withdrawFees() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
```

## 🌐 Web3 Frontend Integration

### React Web3 Application

```typescript
// hooks/useWeb3.ts - Web3 integration hook
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

interface Web3State {
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  isLoading: boolean;
}

export const useWeb3 = () => {
  const [state, setState] = useState<Web3State>({
    provider: null,
    signer: null,
    account: null,
    chainId: null,
    isConnected: false,
    isLoading: false
  });

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast.error('MetaMask is not installed');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const account = await signer.getAddress();
      const network = await provider.getNetwork();

      setState({
        provider,
        signer,
        account,
        chainId: network.chainId,
        isConnected: true,
        isLoading: false
      });

      toast.success('Wallet connected successfully');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setState({
      provider: null,
      signer: null,
      account: null,
      chainId: null,
      isConnected: false,
      isLoading: false
    });
    toast.info('Wallet disconnected');
  }, []);

  const switchNetwork = useCallback(async (targetChainId: number) => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ethers.utils.hexValue(targetChainId) }]
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // Network not added to MetaMask
        toast.error('Please add this network to MetaMask');
      } else {
        toast.error('Failed to switch network');
      }
    }
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setState(prev => ({ ...prev, account: accounts[0] }));
      }
    };

    const handleChainChanged = (chainId: string) => {
      const newChainId = parseInt(chainId, 16);
      setState(prev => ({ ...prev, chainId: newChainId }));
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [disconnectWallet]);

  // Auto-connect if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      if (!window.ethereum) return;

      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await connectWallet();
        }
      } catch (error) {
        console.error('Auto-connect failed:', error);
      }
    };

    autoConnect();
  }, [connectWallet]);

  return {
    ...state,
    connectWallet,
    disconnectWallet,
    switchNetwork
  };
};

// components/NFTMarketplace.tsx - NFT marketplace component
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../hooks/useWeb3';
import { toast } from 'react-toastify';

interface NFT {
  itemId: string;
  nftContract: string;
  tokenId: string;
  seller: string;
  owner: string;
  price: string;
  sold: boolean;
  active: boolean;
}

const MARKETPLACE_ADDRESS = '0x...'; // Your deployed marketplace address
const MARKETPLACE_ABI = []; // Your marketplace ABI

export const NFTMarketplace: React.FC = () => {
  const { provider, signer, account, isConnected } = useWeb3();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    if (provider && signer) {
      const marketplaceContract = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        signer
      );
      setContract(marketplaceContract);
    }
  }, [provider, signer]);

  const loadNFTs = async () => {
    if (!contract) return;

    setLoading(true);
    try {
      const items = await contract.fetchMarketItems();
      const formattedItems: NFT[] = items.map((item: any) => ({
        itemId: item.itemId.toString(),
        nftContract: item.nftContract,
        tokenId: item.tokenId.toString(),
        seller: item.seller,
        owner: item.owner,
        price: ethers.utils.formatEther(item.price),
        sold: item.sold,
        active: item.active
      }));
      setNfts(formattedItems);
    } catch (error) {
      console.error('Error loading NFTs:', error);
      toast.error('Failed to load NFTs');
    }
    setLoading(false);
  };

  const buyNFT = async (nft: NFT) => {
    if (!contract || !signer) return;

    try {
      const transaction = await contract.createMarketSale(nft.itemId, {
        value: ethers.utils.parseEther(nft.price)
      });

      setLoading(true);
      await transaction.wait();
      
      toast.success('NFT purchased successfully!');
      await loadNFTs(); // Refresh the list
    } catch (error) {
      console.error('Error buying NFT:', error);
      toast.error('Failed to purchase NFT');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (contract) {
      loadNFTs();
    }
  }, [contract]);

  if (!isConnected) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p>Please connect your wallet to view the marketplace</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">NFT Marketplace</h1>
        <button
          onClick={loadNFTs}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {loading && nfts.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading NFTs...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {nfts.map((nft) => (
            <div key={nft.itemId} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">NFT #{nft.tokenId}</span>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">NFT #{nft.tokenId}</h3>
                <p className="text-gray-600 text-sm mb-2">
                  Contract: {nft.nftContract.slice(0, 10)}...
                </p>
                <p className="text-gray-600 text-sm mb-4">
                  Seller: {nft.seller.slice(0, 10)}...
                </p>
                
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {nft.price} ETH
                  </span>
                  <button
                    onClick={() => buyNFT(nft)}
                    disabled={loading}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {nfts.length === 0 && !loading && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">No NFTs Available</h3>
          <p className="text-gray-600">Check back later for new listings</p>
        </div>
      )}
    </div>
  );
};
```

## 🔧 Context Engineering for Blockchain

### System Context Template

```markdown
# Blockchain Development Context Template

## System Context Layer
- Senior Blockchain Developer with DeFi expertise
- Smart contract security specialist
- Web3 integration and frontend expert
- Tokenomics and protocol design focus

## Domain Context Layer
- Platforms: Ethereum, Polygon, Binance Smart Chain
- Languages: Solidity, Vyper, Rust (Solana)
- Tools: Hardhat, Truffle, Remix, OpenZeppelin
- Frontend: Web3.js, Ethers.js, React, Next.js
- Testing: Chai, Mocha, Waffle

## Task Context Layer
- Gas optimization requirements
- Security audit and testing needs
- Scalability and performance considerations
- Regulatory compliance requirements
- User experience and adoption goals
```

### Security Best Practices

```solidity
// SecurityChecklist.sol - Security patterns and checks
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract SecureContract is ReentrancyGuard, Pausable, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    mapping(address => uint256) private balances;
    
    event Withdrawal(address indexed user, uint256 amount);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    // ✅ Protected against reentrancy
    function withdraw(uint256 amount) external nonReentrant whenNotPaused {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        // ✅ State change before external call
        balances[msg.sender] -= amount;
        
        // ✅ Use call instead of transfer for gas flexibility
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Withdrawal(msg.sender, amount);
    }
    
    // ✅ Input validation and overflow protection
    function deposit() external payable whenNotPaused {
        require(msg.value > 0, "Must send ETH");
        
        // ✅ Check for overflow (Solidity 0.8+ has built-in protection)
        require(balances[msg.sender] + msg.value >= balances[msg.sender], "Overflow");
        
        balances[msg.sender] += msg.value;
    }
    
    // ✅ Access control for admin functions
    function emergencyPause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    function emergencyUnpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}
```

## 📚 Key Takeaways

1. **Security First**: Comprehensive testing and audit processes
2. **Gas Optimization**: Efficient code patterns and storage usage
3. **User Experience**: Seamless Web3 integration and error handling
4. **Interoperability**: Cross-chain compatibility and standards compliance
5. **Governance**: Decentralized decision-making and upgrade mechanisms
6. **Economic Models**: Sustainable tokenomics and incentive alignment

---

**Next**: [IoT Development →](iot-development.md)