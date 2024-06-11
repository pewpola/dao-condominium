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
                    residences[(i * 1000) + (j * 100) + k] = true;
                }
            }
        }
    }
}
