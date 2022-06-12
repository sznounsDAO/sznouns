// SPDX-License-Identifier: GPL-3.0

/// @title The SZNouns ERC-721 token

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

contract SZNounsToken is NounsToken {
    // The sznounders DAO address (creators org)
    address public sznoundersDAO;
    address public nounsDAO;
    address public sznsDAO;

    uint256 private _currentNounId;

    event NounsDAOUpdated(address nounsDAO);
    event sznsDAOUpdated(address sznsDAO);

    constructor(
        address _sznoundersDAO,
        address _minter,
        INounsDescriptor _descriptor,
        INounsSeeder _seeder,
        IProxyRegistry _proxyRegistry,
        address _nounsDAO,
        address _sznsDAO
    ) NounsToken(_sznoundersDAO, _minter, _descriptor, _seeder, _proxyRegistry) {
        sznoundersDAO = _sznoundersDAO;
        nounsDAO = _nounsDAO;
        sznsDAO = _sznsDAO;
    }

    /**
     * @notice Require that the sender is the nounders DAO.
     */
    modifier onlySZNoundersDAO() {
        require(msg.sender == sznoundersDAO, 'Sender is not the nounders DAO');
        _;
    }

    /**
     * @notice Set the Nouns DAO.
     * @dev Only callable by the nounders DAO when not locked.
     */
    function setNounsDAO(address _nounsDAO) external onlySZNoundersDAO {
        nounsDAO = _nounsDAO;

        emit NounsDAOUpdated(_nounsDAO);
    }

    /**
     * @notice Set the szns DAO.
     * @dev Only callable by the nounders DAO when not locked.
     */
    function setSznsDAO(address _sznsDAO) external onlySZNoundersDAO {
        sznsDAO = _sznsDAO;

        emit sznsDAOUpdated(_sznsDAO);
    }

    /**
     * @notice Mint a SZNoun to the minter, along with a possible
     * reward for:
     *   - SZNounders' reward (one per 50 minted)
     *   - NounsDAO reward (one per 20 minted)
     *   - sznsDAO reward (one per 20 minted)
     * @dev Call _mintTo with the to address(es).
     */
    function mint() public override onlyMinter returns (uint256) {
        // TODO(szns) should rewards stop after a certain number minted?
        // (Nouns and Lilnouns do this)
        // Could also make these params adjustable by gov
        if (_currentNounId % 50 == 0) {
            _mintTo(sznoundersDAO, _currentNounId++);
        }
        if (_currentNounId % 20 == 1) {
            _mintTo(nounsDAO, _currentNounId++);
            _mintTo(sznsDAO, _currentNounId++);
        }
        return _mintTo(minter, _currentNounId++);
    }
}
