// SPDX-License-Identifier: MIT

pragma solidity >=0.7.2;

import './IKeplerPair.sol';

interface IKeplerToken {

    function createSnapshot(uint256 id) external;

    function getUserSnapshot(address user) external view returns (uint256);

}
