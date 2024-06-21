// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { CondominiumLib as Lib } from "./CondominiumLib.sol";

interface ICondominium {
    function addResident(address resident, uint16 residenceId) external;
    function removeResident(address resident) external;
    function setCounselor(address resident, bool isEntering) external;
    function setManager(address newManager) external;
    function addTopic(string memory title, string memory description) external;
    function removeTopic(string memory title) external;
    function openVoting(string memory title) external;
    function vote(string memory title, Lib.Options option) external;
    function closeVoting(string memory title) external;
}