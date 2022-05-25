// SPDX-License-Identifier: MIT

pragma solidity 0.8.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract TrillioHeirs is ERC721, Ownable {
    using SafeMath for uint256;

    bool public paused = false;
    bool public presale = true;
    string public baseURI;

    uint256 public mintedAmount_1;
    uint256 public mintedAmount_2;
    uint256 public mintedAmount_3;
    uint256 public mintedAmount_4;

    uint256 public maxMint_presale = 3000;
    uint256 public maxMint_1 = 7000;
    uint256 public maxMint_2 = 1500;
    uint256 public maxMint_3 = 370;
    uint256 public maxMint_4 = 18;

    uint256 public presalePrice = 0.15 ether;
    uint256 public publicsalePrice = 0.18 ether;

    uint256 public presaleMaxMint = 10;
    uint256 public publicsaleMaxMint = 5;

    bytes32 private merkleTreeRoot_1;
    bytes32 private merkleTreeRoot_2;
    bytes32 private merkleTreeRoot_3;

    uint256 public ownerMintTotal = 206;
    uint256 ownerMint_1 = 0;
    uint256 ownerMint_2 = 0;
    uint256 ownerMint_3 = 0;
    uint256 ownerMint_4 = 0;

    struct SpecialWallet {
        uint256 level;
        uint256 maxMintAmount;
    }
    mapping(address => SpecialWallet) specialListInfo;

    constructor(string memory name, string memory symbol, string memory baseUrl) ERC721(name, symbol) {
        setBaseURI(baseUrl);
    }

    receive() external payable {}

    function withdrawAll() external onlyOwner {
        uint256 amount = address(this).balance;
        payable(owner()).transfer(amount);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }

    function setPresale(bool s_) public onlyOwner {
        require(presale == true, "TrillioHeirs: presale can be set only once");
        presale = s_;
    }

    modifier isPresale {
        require(presale, "TrillioHeirs: presale finished");
        _;
    }

    modifier isPublicsale {
        require(!presale, "TrillioHeirs: public sale not started");
        _;
    }

    function setPaused(bool s_) public onlyOwner {
        paused = s_;
    }

    modifier emergencyPause {
        require(!paused);
        _;
    }

    function _getRemainingForLvl(uint256 lvl) private view returns(uint256) {
        if (lvl == 1)
            return maxMint_1 - mintedAmount_1;
        else if (lvl == 2)
            return maxMint_2 - mintedAmount_2;
        else if (lvl == 3)
            return maxMint_3 - mintedAmount_3;
        else 
            return 0;
    }

    function addToSpecialList(address[] memory addresses, uint256[] memory levels, uint256[] memory maxMintCounts) public onlyOwner {
        require(addresses.length == levels.length && levels.length == maxMintCounts.length, "TrillioHeirs: arrays has different length");

        for (uint256 i = 0; i < addresses.length; i++) {
            require(levels[i] > 0 && levels[i] < 4, "TrillioHeirs: The level of special wallet can not be greater than 4");
            SpecialWallet memory item = SpecialWallet(levels[i], maxMintCounts[i]);
            specialListInfo[addresses[i]] = item;
        }
    }

    function _getPresoldAmount() private view returns(uint256) {
        return mintedAmount_1 + mintedAmount_2 + mintedAmount_3;
    }

    function _getPresaleCost(uint256 amount) private view returns(uint256) {
        return presalePrice.mul(amount);
    }

    function setMerkleTree(bytes32 root_, uint256 lvl) public onlyOwner {
        if (lvl == 1)
            merkleTreeRoot_1 = root_;
        else if (lvl == 2)
            merkleTreeRoot_2 = root_;
        else 
            merkleTreeRoot_3 = root_;
    }

    function _verifyWhitelist(bytes32[] memory proof, uint256 lvl) private view returns(bool) {
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        if(lvl == 1)
            return MerkleProof.verify(proof, merkleTreeRoot_1, leaf);
        else if (lvl == 2)
            return MerkleProof.verify(proof, merkleTreeRoot_2, leaf);
        else 
            return MerkleProof.verify(proof, merkleTreeRoot_3, leaf);
    }

    function presaleMint(uint256 amount, uint256 lvl, bytes32[] memory proof) public payable emergencyPause isPresale {
        uint256 estimatedAmount = balanceOf(msg.sender).add(amount);
        require(estimatedAmount <= presaleMaxMint, "TrillioHeirs: You have already minted max NFTs or you are going to mint too many NFTs now");
        require(_verifyWhitelist(proof, lvl), "TrillioHeirs: Only whitelisted wallet can attend in presale");
        require(_getPresoldAmount() < maxMint_presale, "TrillioHeirs: In presale, Only 3000 NFTs can be mint");
        require(_getRemainingForLvl(lvl) >= amount, "TrillioHeirs: Mint amount can not be greater than remaining NFT amount in each level");
        require(msg.value == _getPresaleCost(amount), "TrillioHeirs: Msg.value is less than the real value");
        if (lvl == 1) {
            for(uint256 i = 1 ; i <= amount ; i++)
                _safeMint(msg.sender, mintedAmount_1 + i);
            mintedAmount_1 += amount;
        } else if (lvl == 2) {
            for(uint256 i = 1 ; i <= amount ; i++)
                _safeMint(msg.sender, (mintedAmount_2 + maxMint_1 + i));
            mintedAmount_2 += amount;
        } else {
            for(uint256 i = 1 ; i <= amount ; i++)
                _safeMint(msg.sender, (mintedAmount_3 + maxMint_1 + maxMint_2 + i));
            mintedAmount_3 += amount;
        }
    }

    function _getRandomLevel() private view returns(uint256) {
        uint256 remain = _getRemainingForLvl(1).add(_getRemainingForLvl(2)).add(_getRemainingForLvl(3)).sub(_getRemainingOwnerMintAmount());
        require(remain >= 1, "TrillioHeirs: Remaining NFT is not enough");
        uint256 random = uint256(keccak256(abi.encodePacked(block.difficulty, block.timestamp, msg.sender, mintedAmount_1, mintedAmount_2, mintedAmount_3)));
        uint256 lvl = random.mod(3).add(1);
        uint256 count = 0;
        while (_getRemainingForLvl(lvl) < 1) {
            lvl = lvl.mod(3).add(1);
            if (count == 2)
                return 0;
            count++;
        }
        return lvl;
    }

    function _getPublicsaleCost(uint256 amount) private view returns(uint256) {
        return amount.mul(publicsalePrice);
    }

    function publicsaleMint(uint256 amount) public payable emergencyPause isPublicsale {
        uint256 estimatedAmount = balanceOf(msg.sender).add(amount);
        require(estimatedAmount <= publicsaleMaxMint, "TrillioHeirs: You have already minted max NFTs or you are going to mint too many NFTs now");
        require(msg.value == _getPublicsaleCost(amount), "TrillioHeirs: Msg.value is not enough");
        for (uint256 i = 1; i <= amount ; i++) {
            uint256 randomLvl = _getRandomLevel();
            require(randomLvl > 0, "TrillioHeirs: Amount of remaining NFT for each level is not enough");

            if (randomLvl == 1) {
                _safeMint(msg.sender, mintedAmount_1 + i);
                mintedAmount_1 += 1;
            } else if (randomLvl == 2) {
                _safeMint(msg.sender, (mintedAmount_2 + maxMint_1 + i));
                mintedAmount_2 += 1;
            } else {
                _safeMint(msg.sender, (mintedAmount_3 + maxMint_1 + maxMint_2 + i));
                mintedAmount_3 += 1;
            }
        }
    }

    function specialMint(uint256 amount) public emergencyPause isPublicsale {
        uint256 estimatedAmount = balanceOf(msg.sender).add(amount);
        uint256 remain = _getRemainingForLvl(1).add(_getRemainingForLvl(2)).add(_getRemainingForLvl(3));
        require(amount <= remain, "TrilloHeirs: Remaining NFT is not enough");
        uint256 maxMintAmount = specialListInfo[msg.sender].maxMintAmount;
        require(estimatedAmount <= maxMintAmount, "Trillioheirs: Amount can not be greater than max mint amount");
        uint256 lvl = specialListInfo[msg.sender].level;
        require(amount <= _getRemainingForLvl(lvl), "Trillioheirs: Remaining NFT for level is not enough");

        if (lvl == 1) {
            for(uint256 i = 1 ; i <= amount ; i++)
                _safeMint(msg.sender, mintedAmount_1 + i);
            mintedAmount_1 += amount;
        } else if (lvl == 2) {
            for(uint256 i = 1 ; i <= amount ; i++)
                _safeMint(msg.sender, (mintedAmount_2 + maxMint_1 + i));
            mintedAmount_2 += amount;
        } else {
            for(uint256 i = 1 ; i <= amount ; i++)
                _safeMint(msg.sender, (mintedAmount_3 + maxMint_1 + maxMint_2 + i));
            mintedAmount_3 += amount;
        }
    }

    function _getRemainingOwnerMintAmount() private view returns(uint256) {
        return (ownerMintTotal.sub(maxMint_4)).sub(ownerMint_1.add(ownerMint_2).add(ownerMint_3));
    }

    function ownerLvl4Mint() public onlyOwner {
        uint256 remaining = maxMint_4.sub(mintedAmount_4);
        require(remaining > 0, "TrillioHeirs: level 4 already minted");
        for(uint256 i = 1 ; i <= remaining ; i++)
            _safeMint(msg.sender, (mintedAmount_4 + maxMint_1 + maxMint_2 + maxMint_3 + i));
        mintedAmount_4 += remaining;
        ownerMint_4 += remaining;
    }
}