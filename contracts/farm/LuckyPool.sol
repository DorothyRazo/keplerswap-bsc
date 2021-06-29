// SPDX-License-Identifier: MIT

pragma solidity >=0.7.2;

import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';
import '../interfaces/IKeplerPair.sol';
import '../interfaces/IUser.sol';
import 'hardhat/console.sol';

contract LuckyPool is Ownable {
    using SafeMath for uint256;

    uint256 constant public TOTAL_WINER_NUM = 11;
    uint256 constant public WINER_NUM = 10;
    uint256 constant public BEST_WINER_NUM = 1;

    IUser user;
    IERC20[] rewardToken;
    bytes32 data;

    struct PoolInfo {
        uint256 beginAt;
        uint256 openAt;
        uint256 countAt;
        uint256 finishAt;
        uint256 userNum;
        uint256 claimNum;
        uint256 winers;
        address bestUser;
    }

    PoolInfo[] public poolInfo;
    uint256 public currentLuckyId;
    mapping(uint256 => IERC20[]) poolRewardToken;
    mapping(uint256 => mapping(IERC20 => uint256)) poolRewardAmount;

    mapping(address => uint256) luckyUser;
    mapping(uint256 => mapping(address => uint8)) winers;

    constructor(IUser _user) {
        user = _user;
    }

    modifier onlyOwnerOrSelf() {
        require(msg.sender == owner() || msg.sender == address(this), "only owner or self can do this");
        _;
    }

    function addRewardToken(IERC20 _rewardToken) public onlyOwnerOrSelf {
        rewardToken.push(_rewardToken);
    }

    function delRewardToken(uint256 _id) public onlyOwnerOrSelf {
        require(_id < rewardToken.length, "illegal id");
        if (_id != rewardToken.length - 1) {
            rewardToken[_id] = rewardToken[rewardToken.length - 1];
        }
        rewardToken.pop();
    }

    function nextLuckyId() public view returns (uint256) {
        return currentLuckyId.add(1);
    }

    function setNextLuckyId() internal {
        currentLuckyId = currentLuckyId.add(1);
    }

    function beginLuckyPool(uint256 timestamp) public onlyOwnerOrSelf {
        require(timestamp >= block.timestamp, "illegal timestamp");
        if (poolInfo.length > 0) {
            PoolInfo memory _lastPoolInfo = poolInfo[poolInfo.length - 1];
            require(_lastPoolInfo.countAt != 0 && _lastPoolInfo.countAt <= timestamp, "last luckyPool not finish");
        }
        uint256 luckyId = currentLuckyId; 
        setNextLuckyId();
        PoolInfo storage _poolInfo = poolInfo[luckyId];
        _poolInfo.beginAt = timestamp;
    }

    function openLuckyPool() public onlyOwnerOrSelf {
        uint _currentLuckyId = currentLuckyId.sub(1);
        PoolInfo memory _currentPoolInfo = poolInfo[_currentLuckyId];
        require(block.timestamp > _currentPoolInfo.beginAt && _currentPoolInfo.openAt == 0, "not the right time");
        poolInfo[_currentLuckyId].openAt = block.timestamp;
        poolInfo[_currentLuckyId].countAt = block.timestamp + 2 * 24 * 3600;
        poolInfo[_currentLuckyId].finishAt = block.timestamp + 5 * 24 * 3600;
        IERC20[] memory _rewardToken = rewardToken;
        for (uint i = 0; i < _rewardToken.length; i ++) {
            poolRewardToken[_currentLuckyId].push(_rewardToken[i]);
            poolRewardAmount[_currentLuckyId][_rewardToken[i]] = rewardToken[i].balanceOf(address(this));
        }
        beginLuckyPool(block.timestamp + 5 * 24 * 3600);
    }

    function countUser(address[] memory _users) public onlyOwnerOrSelf {
        uint256 _currentLuckyId = currentLuckyId.sub(2);
        PoolInfo memory _poolInfo = poolInfo[_currentLuckyId];
        require(_poolInfo.openAt != 0 && block.timestamp >= _poolInfo.openAt && block.timestamp <= _poolInfo.finishAt, "not the right time");
        for (uint i = 0; i < _users.length; i ++) {
            luckyUser[_users[i]] = _currentLuckyId;
        }
        poolInfo[_currentLuckyId].userNum = _poolInfo.userNum.add(_users.length);
    }

    function win(string memory r) internal returns (bool) {
        bytes32 data1 = keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender, block.coinbase, block.number)); 
        bytes32 data2 = keccak256(abi.encodePacked(msg.data, gasleft(), tx.gasprice));
        uint8 num = uint8(uint256(keccak256(abi.encodePacked(data, data1, data2, r)))%10);
        data = keccak256(abi.encodePacked(data1, data2));
        return (num == 1);
    }

    function doReward(uint _poolId, uint8 _type, address to) internal {
        IERC20[] memory _rewardToken = poolRewardToken[_poolId];
        if (_type == 2) {
            for (uint i = 0; i < _rewardToken.length; i ++) {
                uint256 _rewardAmount = poolRewardAmount[_poolId][_rewardToken[i]];
                if (_rewardAmount > 0) {
                    SafeERC20.safeTransfer(_rewardToken[i], to, _rewardAmount.div(2).div(WINER_NUM));
                }
            }
        } else if (_type == 3) {
            for (uint i = 0; i < _rewardToken.length; i ++) {
                uint256 _rewardAmount = poolRewardAmount[_poolId][_rewardToken[i]];
                if (_rewardAmount > 0) {
                    SafeERC20.safeTransfer(_rewardToken[i], to, _rewardAmount.div(2));
                }
                poolInfo[_poolId].bestUser = to;
            }
        }
        poolInfo[_poolId].winers = poolInfo[_poolId].winers.add(1);
    }

    function claim(string memory r) external {
        uint256 _currentLuckyId = currentLuckyId.sub(2);
        PoolInfo memory _poolInfo = poolInfo[_currentLuckyId];
        require(block.timestamp >= _poolInfo.countAt && block.timestamp <= _poolInfo.finishAt, "not the right time");
        require(luckyUser[msg.sender] == _currentLuckyId, "do not have the ops");
        require(winers[_currentLuckyId][msg.sender] == 0, "already do this");
        poolInfo[_currentLuckyId].claimNum = _poolInfo.claimNum.add(1);
        bool _win = true;
        if (_poolInfo.userNum.sub(_poolInfo.claimNum) > TOTAL_WINER_NUM.sub(_poolInfo.winers)) {
            _win = win(r);
        }
        if (!_win) {
            winers[_currentLuckyId][msg.sender] = 1;
            return;
        }
        if (_poolInfo.winers < 4 || _poolInfo.bestUser != address(0)) {
            winers[_currentLuckyId][msg.sender] = 2;
            doReward(_currentLuckyId, 2, msg.sender);
        } else {
            winers[_currentLuckyId][msg.sender] = 3;
            doReward(_currentLuckyId, 3, msg.sender);
        }
    }

}
