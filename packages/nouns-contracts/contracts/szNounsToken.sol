// SPDX-License-Identifier: GPL-3.0

/// @title The szNouns ERC-721 token

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

pragma solidity ^0.8.6;

import { INounsDescriptor } from './interfaces/INounsDescriptor.sol';
import { INounsSeeder } from './interfaces/INounsSeeder.sol';
import { IProxyRegistry } from './external/opensea/IProxyRegistry.sol';

import { NounsToken } from './NounsToken.sol';

contract szNounsToken is NounsToken {
    address public nounsDAO;
    address public sznsDAO;

    uint256 private _currentNounId;

    event NounsDAOUpdated(address nounsDAO);
    event sznsDAOUpdated(address sznsDAO);

    constructor(
        address _noundersDAO,
        address _minter,
        INounsDescriptor _descriptor,
        INounsSeeder _seeder,
        IProxyRegistry _proxyRegistry,
        address _nounsDAO,
        address _sznsDAO
    ) NounsToken(_noundersDAO, _minter, _descriptor, _seeder, _proxyRegistry) {
        nounsDAO = _nounsDAO;
        sznsDAO = _sznsDAO;
    }

    /**
     * @notice Set the Nouns DAO.
     * @dev Only callable by the nounders DAO when not locked.
     */
    function setNounsDAO(address _nounsDAO) external onlyNoundersDAO {
        nounsDAO = _nounsDAO;

        emit NounsDAOUpdated(_nounsDAO);
    }

    /**
     * @notice Set the szns DAO.
     * @dev Only callable by the nounders DAO when not locked.
     */
    function setSznsDAO(address _sznsDAO) external onlyNoundersDAO {
        sznsDAO = _sznsDAO;

        emit sznsDAOUpdated(_sznsDAO);
    }

    /**
     * @notice Mint a szNoun to the minter, along with a possible
     * reward for:
     *   - szNounder's reward (one per 50 minted)
     *   - NounDAO reward (one per 20 minted)
     *   - sznsDAO reward (one per 20 minted)
     * @dev Call _mintTo with the to address(es).
     */
    function mint() public override onlyMinter returns (uint256) {
        // TODO(szns) should rewards stop after a certain number minted?
        // (Nouns and Lilnouns do this)
        // Could also make these params adjustable by gov
        if (_currentNounId % 50 == 0) {
            _mintTo(noundersDAO, _currentNounId++);
        }
        if (_currentNounId % 20 == 1) {
            _mintTo(nounsDAO, _currentNounId++);
            _mintTo(sznsDAO, _currentNounId++);
        }
        return _mintTo(minter, _currentNounId++);
    }
}
