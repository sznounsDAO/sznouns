// SPDX-License-Identifier: GPL-3.0

/// @title The SZNouns DAO auction house

/********************************************************************************
 * @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ *
 * @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ *
 * @@@@@@@@@@@@@@@       @@@@@@@@@@@@@@@@@@@@@@@      @@@@@@@@@@@@@@@@@@@@@@@@@ *
 * @@@@@@@@@@@               @@@@@@@@@@@@@@               @@@@@@@@@@@@@@@@@@@@@ *
 * @@@@@@@@@     \\\\@@@@@      @@@@@@@@@     \\\\@@@@      @@@@@@@@@@@@@@@@@@@ *
 * @@@@@@@     \\\\\\@@@@@@@     @@@@@@     \\\\\\@@@@@@@     @@@@@@@@@@@@@@@@@ *
 * @@@@@@     \\\\\\\@@@@@@@@              \\\\\\\@@@@@@@@                  @@@ *
 * @@@@@@    \\\\\\\\@@@@@@@@@    @@@@    \\\\\\\\@@@@@@@@@    @@@@@@@@     @@@ *
 * @@@@@@@    \\\\\\\@@@@@@@@     @@@@     \\\\\\\@@@@@@@@     @@@@@@@@     @@@ *
 * @@@@@@@@    \\\\\\@@@@@@@     @@@@@@     \\\\\\@@@@@@@     @@@@@@@@@     @@@ *
 * @@@@@@@@@      \\\@@@@      @@@@@@@@@@      \\\@@@@      @@@@@@@@@@@     @@@ *
 * @@@@@@@@@@@@              @@@@@@@@@@@@@@@              @@@@@@@@@@@@@@@@@@@@@ *
 * @@@@@@@@@@@@@@@       @@@@@@@@@@@@@@@@@@@@@@       @@@@@@@@@@@@@@@@@@@@@@@@@ *
 * @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ *
 * @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ *
 ********************************************************************************/

// LICENSE
// SZNounsAuctionHouse.sol is a modified version NounsAuctionHouse.sol, which is a modified version of Zora's AuctionHouse.sol:
// https://github.com/ourzora/auction-house/blob/54a12ec1a6cf562e49f0a4917990474b11350a2d/contracts/AuctionHouse.sol
//
// AuctionHouse.sol source code Copyright Zora licensed under the GPL-3.0 license.
// With modifications by szNounders DAO.

pragma solidity ^0.8.6;

import { NounsAuctionHouse } from './NounsAuctionHouse.sol';
import './libs/BokkyPooBahsDateTimeLibrary.sol';

contract SZNounsAuctionHouse is NounsAuctionHouse {
    enum SZN {
        WINTER,
        SPRING,
        SUMMER,
        FALL
    }

    // TODO: revisit this from here
    uint256 constant DEFAULT_WINTER_DURATION = 3 minutes;
    uint256 constant DEFAULT_FALL_SPRING_DURATION = 2 minutes;
    uint256 constant DEFAULT_SUMMER_DURATION = 1 minutes;

    // Length of 4, indices corresponding to int cast of enum value.
    uint256[4] durations;

    function getSzn() public view returns (SZN) {
        uint256 minute = BokkyPooBahsDateTimeLibrary.getMinute(block.timestamp);
        // Before March is winter.
        if (minute % 8 < 2) {
           return SZN.WINTER;
       }
       // After March and before May is Spring.
       if (minute % 8 < 4) {
           return SZN.SPRING;
       }
       // After May and before August is Summer.
       if (minute % 8 < 6) {
           return SZN.SUMMER;
       }
       // After August and before December is Fall.
       // TODO(szns) fall is currently 4 minutes, should one of those minutes be SPRING?
       if (minute % 8 < 8) {
           return SZN.FALL;
       }
    }
    // TODO: to here

    function getSznDuration(SZN szn) public view returns (uint256) {
        uint256 duration = durations[uint256(szn)];
        if (duration != 0) {
            return duration;
        }
        return getDefaultDuration(szn);
    }

    function setDuration(SZN szn, uint256 duration) external onlyOwner {
        durations[uint256(szn)] = duration;
    }

    function getDefaultDuration(SZN szn) public pure returns (uint256) {
        if (szn == SZN.WINTER) {
            return DEFAULT_WINTER_DURATION;
        }
        if (szn == SZN.SUMMER) {
            return DEFAULT_SUMMER_DURATION;
        }
        // szn is SZN.FALL or SZN.SPRING
        return DEFAULT_FALL_SPRING_DURATION;
    }

    function getDuration() public view override returns (uint256) {
        return getSznDuration(getSzn());
    }
}
