// SPDX-License-Identifier: MIT

pragma solidity >=0.7.2;

import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '../interfaces/IKeplerFactory.sol';
import '../interfaces/IKeplerToken.sol';
import '../interfaces/IKeplerPair.sol';
import '../interfaces/IMasterChef.sol';
import '../interfaces/IUser.sol';

contract Crycle is Ownable {
    using SafeMath for uint256;

    struct CrycleInfo {
        address creator;
        string title;
        string mainfest;
        uint256 userNum;
    }

    struct VoteInfo {
        uint voteId;
        uint beginAt;
        uint countAt;
        uint finishAt;
    }

    VoteInfo[] public voteInfo;
    mapping(uint256 => mapping(uint256 => uint256)) crycleVotes;
    mapping(uint256 => mapping(uint256 => uint256)) crycleVoteUserNum;
    mapping(uint256 => mapping(address => uint256)) userVotes;


    CrycleInfo[] public crycleInfo;
    mapping(uint256 => mapping(address => uint256)) public crycleUsers;
    mapping(address => uint256) public userCrycle;
    uint256 currentVoteId;

    IUser public user;
    IMasterChef public masterChef;
    IKeplerPair public pair;
    IERC20 public busd;
    IERC20 public sds;
    IKeplerFactory public factory;

    uint256 constant public MIN_LOCK_AMOUNT = 500 * 1e18;
    uint256 constant public MIN_INVITER_AMOUNT = 5000 * 1e18;

    constructor(IUser _user, IMasterChef _masterChef, IKeplerPair _pair, IERC20 _busd, IERC20 _sds, IKeplerFactory _factory) {
        crycleInfo.push(CrycleInfo({
            creator: address(this),
            title: "",
            mainfest: "",
            userNum: 0
        }));
        voteInfo.push(VoteInfo({
            voteId: 0,
            beginAt: block.timestamp,
            countAt: block.timestamp,
            finishAt: block.timestamp
        }));
        user = _user;
        masterChef = _masterChef;
        pair = _pair;
        busd = _busd;
        sds = _sds;
        factory = _factory;
    }

    function getPairTokenPrice(IKeplerPair _pair, IERC20 token) internal view returns(uint price) {
        address token0 = _pair.token0();
        address token1 = _pair.token1();
        require(token0 == address(token) || token1 == address(token), "illegal token");
        (uint reserve0, uint reserve1,) = _pair.getReserves();
        if (address(token) == token0) {
            if (reserve0 != 0) {
                return IERC20(token0).balanceOf(address(_pair)).mul(1e18).div(reserve0);
            }
        } else if (address(token) == token1) {
            if (reserve1 != 0) {
                return IERC20(token1).balanceOf(address(_pair)).mul(1e18).div(reserve1);
            }
        }
        return 0;
    }

    function canCreateCrycle(address _user) internal view returns (bool) {
        uint price = getPairTokenPrice(pair, busd);
        uint balanceUser = masterChef.getUserAmount(pair, _user, 3);
        uint balanceInviter = masterChef.getInviterAmount(pair, _user);
        if (balanceUser.mul(price).div(1e18) >= MIN_LOCK_AMOUNT || balanceInviter.mul(price).div(1e18) >= MIN_INVITER_AMOUNT) {
            return true;
        } else {
            return false;
        }
    }

    function createCrycle(string memory title, string memory mainfest) external {
        require(bytes(title).length <= 32, "title too long");
        require(bytes(mainfest).length <= 1024, "mainfest too long");
        require(canCreateCrycle(msg.sender), "at lease lock 500 BUSD and SDS or invite 5000 BUSD and SDS");
        crycleInfo.push(CrycleInfo({
            creator: msg.sender,
            title: title,
            mainfest: mainfest,
            userNum: 0
        }));
    }

    function addCrycle(uint256 crycleId) external {
        require(crycleId > 0 && crycleId < crycleInfo.length, "illegal crycleId");
        require(userCrycle[msg.sender] == 0, "already in crycle");
        crycleUsers[crycleId][msg.sender] = block.timestamp;
        userCrycle[msg.sender] = crycleId;
        crycleInfo[crycleId].userNum = crycleInfo[crycleId].userNum.add(1);
    }

    function startVote() external onlyOwner {
        uint _currentVoteId = nextVoteId();
        setNextVoteId();
        if (_currentVoteId > 1 && voteInfo[_currentVoteId - 1].finishAt > block.timestamp) {
            require(false, "last vote not finish");
        }
        masterChef.createSnapshot(_currentVoteId);
        IKeplerToken(address(sds)).createSnapshot(_currentVoteId);
        factory.createSnapshot(address(pair), _currentVoteId);
        voteInfo.push(VoteInfo({
            voteId: _currentVoteId,
            beginAt: block.timestamp,
            countAt: block.timestamp + 5 * 24 * 3600,
            finishAt: block.timestamp + 7 * 24 * 3600
        }));
    }

    function doVote(uint num) external {
        uint tokenVotes = IKeplerToken(address(sds)).getUserSnapshot(msg.sender);
        (uint price0, uint price1) = factory.getSnapshotPrice(pair);
        uint price = address(sds) == pair.token0() ? price0 : price1;
        uint pairVotes = factory.getSnapshotBalance(pair, msg.sender);
        uint lockVotes = masterChef.getUserSnapshot(address(pair), msg.sender);
        uint totalVotes = tokenVotes.add(price.mul(pairVotes.div(1e18))).add(price.mul(lockVotes).div(1e18)).mul(100);
        if (crycleVotes[currentVoteId][userCrycle[msg.sender]] == 0) {
            crycleVoteUserNum[currentVoteId][userCrycle[msg.sender]] = crycleVoteUserNum[currentVoteId][userCrycle[msg.sender]].add(1);
        }
        crycleVotes[currentVoteId][userCrycle[msg.sender]] = crycleVotes[currentVoteId][userCrycle[msg.sender]].add(num);
        userVotes[currentVoteId][msg.sender] = userVotes[currentVoteId][msg.sender].add(num);
        require(userVotes[currentVoteId][msg.sender] <= totalVotes, "illegal vote num");
    }

    function nextVoteId() public view returns (uint256) {
        return currentVoteId.add(1);
    }

    function setNextVoteId() internal {
        currentVoteId = currentVoteId.add(1);
    }

}
