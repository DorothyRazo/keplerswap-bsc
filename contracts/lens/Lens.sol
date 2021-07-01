// SPDX-License-Identifier: MIT

pragma solidity >=0.7.2;
pragma experimental ABIEncoderV2;

import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';
import '../interfaces/IKeplerPair.sol';
import '../interfaces/IMasterChef.sol';
import '../interfaces/IUser.sol';
import '../interfaces/IInviter.sol';
import 'hardhat/console.sol';

contract Lens is Ownable {
    using SafeMath for uint256;

    struct UserLockInfo {
        uint amount;
        string symbol0;
        string symbol1;
        uint amount0;
        uint amount1;
        uint shares;
        uint lockType;
        uint depositAt;
        uint expireAt;
    }

    function getLockInfoLength(IMasterChef _masterChef, IKeplerPair _pair, address user, uint from, uint size) external view returns (uint256) {
        return _masterChef.userLockNum(_pair, user);
    }

    function getLockInfo(IMasterChef _masterChef, IKeplerPair _pair, address user, uint from, uint size) external view returns (UserLockInfo[] memory) {
        string memory symbol0 = ERC20(_pair.token0()).symbol();
        string memory symbol1 = ERC20(_pair.token1()).symbol();
        uint balance0 = IERC20(_pair.token0()).balanceOf(address(_pair));
        uint balance1 = IERC20(_pair.token1()).balanceOf(address(_pair));
        uint totalSupply = _pair.totalSupply(); 
        uint totalNum = _masterChef.userLockNum(_pair, user);
        size = totalNum.sub(from) > size ? size : totalNum.sub(from);
        UserLockInfo[] memory res = new UserLockInfo[](size);
        uint currentId = 0;
        for (uint i = from; i < from.add(size); i ++) {
            (res[currentId].amount, res[currentId].shares, res[currentId].lockType, res[currentId].depositAt, res[currentId].expireAt) = _masterChef.userLockInfo(_pair, user, i);
            res[currentId].symbol0 = symbol0;
            res[currentId].symbol1 = symbol1;
            res[currentId].amount0 = res[currentId].amount.mul(balance0).div(totalSupply);
            res[currentId].amount1 = res[currentId].amount.mul(balance1).div(totalSupply);
            currentId = currentId.add(1);
        }
        return res;
    }

    function pendingMine(IMasterChef _masterChef, IKeplerPair _pair, address _token, address _user) external view returns (uint256) {
        address token0 = _pair.token0();
        address token1 = _pair.token1();
        if (_token == token0) {
            (, uint256 acc,) = _masterChef.getPoolInfo(_pair);
            (, uint256 shares, uint256 debt, , uint256 pending, ) = _masterChef.getUserInfo(_pair, _user);
            return acc.mul(shares).div(1e18).sub(debt).add(pending);
        } else if (_token == token1) {
            (, , uint256 acc) = _masterChef.getPoolInfo(_pair);
            (, uint256 shares, , uint256 debt, , uint256 pending) = _masterChef.getUserInfo(_pair, _user);
            return acc.mul(shares).div(1e18).sub(debt).add(pending);
        } else {
            require(false, "illegal token");
        }
    }

    function pendingInviteMine(IMasterChef _masterChef, IKeplerPair _pair, address _token, address _user) external view returns (uint256) {
        address token0 = _pair.token0();
        address token1 = _pair.token1();
        (uint amount, , , , ,) = _masterChef.getUserInfo(_pair, _user);
        if (amount == 0) {
            return 0;
        }
        if (_token == token0) {
            (, uint256 acc,) = _masterChef.getInvitePoolInfo(_pair);
            (, uint256 shares, uint256 debt, , uint256 pending, ) = _masterChef.getInviteUserInfo(_pair, _user);
            return acc.mul(shares).div(1e18).sub(debt).add(pending);
        } else if (_token == token1) {
            (, , uint256 acc) = _masterChef.getInvitePoolInfo(_pair);
            (, uint256 shares, , uint256 debt, , uint256 pending) = _masterChef.getInviteUserInfo(_pair, _user);
            return acc.mul(shares).div(1e18).sub(debt).add(pending);
        } else {
            require(false, "illegal token");
        }
    }

    function pendingInvite(IInviter _inviter, address _token, address _user) external view returns (uint256) {
        return _inviter.profits(_user, _token);
    }
}
