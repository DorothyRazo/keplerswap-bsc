// SPDX-License-Identifier: MIT

pragma solidity >=0.7.2;

import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';
import '../interfaces/IKeplerPair.sol';
import '../interfaces/IMasterChef.sol';
import '../interfaces/IUser.sol';
import '../interfaces/IInviter.sol';
import 'hardhat/console.sol';

contract Lens is Ownable {
    using SafeMath for uint256;

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
