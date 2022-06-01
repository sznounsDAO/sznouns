// SPDX-License-Identifier: GPL-3.0

/// @title The szNouns DAO auction house

// TODO(szns) pixel art
/*********************************
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 * ░░░░░░█████████░░█████████░░░ *
 * ░░░░░░██░░░████░░██░░░████░░░ *
 * ░░██████░░░████████░░░████░░░ *
 * ░░██░░██░░░████░░██░░░████░░░ *
 * ░░██░░██░░░████░░██░░░████░░░ *
 * ░░░░░░█████████░░█████████░░░ *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 * ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ *
 *********************************/

// LICENSE
// szNounsAuctionHouse.sol is a modified version NounsAuctionHouse.sol, which is a modified version of Zora's AuctionHouse.sol:
// https://github.com/ourzora/auction-house/blob/54a12ec1a6cf562e49f0a4917990474b11350a2d/contracts/AuctionHouse.sol
//
// AuctionHouse.sol source code Copyright Zora licensed under the GPL-3.0 license.
// With modifications by szNounders DAO.

pragma solidity ^0.8.6;

import { NounsAuctionHouse } from './NounsAuctionHouse.sol';
import './libs/BokkyPooBahsDateTimeLibrary.sol';

contract szNounsAuctionHouse is NounsAuctionHouse {
    enum SZN {
        WINTER,
        SPRING,
        SUMMER,
        FALL
    }

    uint256 constant DEFAULT_WINTER_DURATION = 48 hours;
    uint256 constant DEFAULT_FALL_SPRING_DURATION = 24 hours;
    uint256 constant DEFAULT_SUMMER_DURATION = 12 hours;

    // Length of 4, indices corresponding to int cast of enum value.
    uint256[4] durations;

    function getSzn() public view returns (SZN) {
        uint256 month = BokkyPooBahsDateTimeLibrary.getMonth(block.timestamp);
        // Before March is winter.
        if (month < 3) {
            return SZN.WINTER;
        }
        // After March and before May is Spring.
        if (month < 5) {
            return SZN.SPRING;
        }
        // Afer May and before August is Summer.
        if (month < 8) {
            return SZN.SUMMER;
        }
        // After August and before December is Fall.
        // TODO(szns) fall is currently 4 months, should one of those months be SPRING?
        if (month < 12) {
            return SZN.FALL;
        }
        // December is winter.
        return SZN.WINTER;
    }

    function getDuration(SZN szn) public view returns (uint256) {
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

    function _createAuction() internal override {
        try nouns.mint() returns (uint256 nounId) {
            uint256 startTime = block.timestamp;
            uint256 endTime = startTime + getDuration(getSzn());

            auction = Auction({
                nounId: nounId,
                amount: 0,
                startTime: startTime,
                endTime: endTime,
                bidder: payable(0),
                settled: false
            });

            emit AuctionCreated(nounId, startTime, endTime);
        } catch Error(string memory) {
            _pause();
        }
    }
}
