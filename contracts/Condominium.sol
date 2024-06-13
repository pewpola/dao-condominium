// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Condominium {
    address public manager; // Ownable
    mapping(uint16 => bool) public residences; // unidade => true
    mapping(address => uint16) public residents; // wallet => unidade (1001) -> (2505)
    mapping(address => bool) public counselors; // conselheiro => true

    constructor() {
        manager = msg.sender;

        for (uint8 i = 1; i <= 2; i++) {
            // blocos
            for (uint8 j = 1; j <= 5; j++) {
                // apartamentos
                for (uint8 k = 1; k <= 5; k++) {
                    // unidades
                    unchecked {
                        residences[(i * 1000) + (j * 100) + k] = true;
                    }
                }
            }
        }
    }

    modifier onlyManager() {
        require(msg.sender == manager, "Only the manager can do this");
        _;
    }

    modifier onlyCouncil() {
        require(msg.sender == manager || counselors[msg.sender], "Only the manager or the council can do this");
        _;
    }

    modifier onlyResidents() {
        require(msg.sender == manager || isResident(msg.sender), "Only the manager or the residents can do this");
        _;
    }

    function isResident(address resident) public view returns (bool) {
        return residents[resident] > 0;
    }

    function residenceExists(uint16 residenceId) public view returns (bool) {
        return residences[residenceId];
    }

    function addResident(address resident, uint16 residenceId) external onlyCouncil {
        require(residenceExists(residenceId), "This residence does not exist");

        residents[resident] = residenceId;
    }

    function removeResident(address resident) external onlyManager {
        require(!counselors[resident], "A counselor cannot be removed");

        if (counselors[resident]) delete residents[resident];
    }

    function setCounselor(address resident, bool isEntering) external onlyManager {
        if (isEntering) {
            require(isResident(resident), "The counselor must be a resident");
            counselors[resident] = true;
        } else delete counselors[resident];
    } 
}
