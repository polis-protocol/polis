// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {PolisArchive} from "../src/PolisArchive.sol";

contract RegisterIpe is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address archiveAddress = vm.envAddress("ARCHIVE_CONTRACT");

        vm.startBroadcast(deployerPrivateKey);

        PolisArchive archive = PolisArchive(archiveAddress);
        uint256 cityId = archive.registerCity("ipe");
        console2.log("Ipe City registered with cityId:", cityId);

        vm.stopBroadcast();
    }
}
