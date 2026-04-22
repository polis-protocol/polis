// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {PolisArchive} from "../src/PolisArchive.sol";

contract DeployPolisArchive is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        PolisArchive archive = new PolisArchive();
        console2.log("PolisArchive deployed at:", address(archive));

        vm.stopBroadcast();
    }
}
