// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {PolisArchive} from "../src/PolisArchive.sol";

contract PolisArchiveTest is Test {
    PolisArchive public archive;

    address public owner = address(this);
    address public alice = address(0xA11CE);
    address public bob = address(0xB0B);

    event CityRegistered(uint256 indexed cityId, string slug, address admin);
    event SnapshotRecorded(uint256 indexed cityId, uint256 timestamp, bytes32 ipfsHash);
    event AdminTransferred(uint256 indexed cityId, address oldAdmin, address newAdmin);

    function setUp() public {
        archive = new PolisArchive();
    }

    // ── registerCity ────────────────────────────────────────────

    function test_registerCity() public {
        vm.prank(alice);
        vm.expectEmit(true, false, false, true);
        emit CityRegistered(1, "ipe", alice);
        uint256 cityId = archive.registerCity("ipe");

        assertEq(cityId, 1);
        (string memory slug, address admin, uint256 registeredAt) = archive.cities(1);
        assertEq(slug, "ipe");
        assertEq(admin, alice);
        assertGt(registeredAt, 0);
        assertTrue(archive.slugTaken("ipe"));
    }

    function test_registerCity_incrementsId() public {
        vm.prank(alice);
        uint256 id1 = archive.registerCity("city-a");
        vm.prank(bob);
        uint256 id2 = archive.registerCity("city-b");

        assertEq(id1, 1);
        assertEq(id2, 2);
        assertEq(archive.nextCityId(), 3);
    }

    function test_registerCity_revertsDuplicateSlug() public {
        vm.prank(alice);
        archive.registerCity("ipe");

        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(PolisArchive.SlugAlreadyTaken.selector, "ipe"));
        archive.registerCity("ipe");
    }

    function test_registerCity_revertsEmptySlug() public {
        vm.expectRevert(PolisArchive.EmptySlug.selector);
        archive.registerCity("");
    }

    // ── recordSnapshot ──────────────────────────────────────────

    function test_recordSnapshot() public {
        vm.prank(alice);
        uint256 cityId = archive.registerCity("ipe");

        bytes32 hash = keccak256("ipfs://QmTest");

        vm.prank(alice);
        vm.expectEmit(true, false, false, true);
        emit SnapshotRecorded(cityId, block.timestamp, hash);
        archive.recordSnapshot(cityId, hash);

        (bytes32 latestHash, uint256 ts) = archive.getLatestSnapshot(cityId);
        assertEq(latestHash, hash);
        assertEq(ts, block.timestamp);
        assertEq(archive.getSnapshotCount(cityId), 1);
    }

    function test_recordSnapshot_multipleSnapshots() public {
        vm.prank(alice);
        uint256 cityId = archive.registerCity("ipe");

        bytes32 hash1 = keccak256("snapshot-1");
        bytes32 hash2 = keccak256("snapshot-2");

        vm.prank(alice);
        archive.recordSnapshot(cityId, hash1);

        vm.warp(block.timestamp + 1 days);

        vm.prank(alice);
        archive.recordSnapshot(cityId, hash2);

        assertEq(archive.getSnapshotCount(cityId), 2);
        (bytes32 latestHash,) = archive.getLatestSnapshot(cityId);
        assertEq(latestHash, hash2);

        (bytes32 firstHash, uint256 firstTs) = archive.getSnapshot(cityId, 0);
        assertEq(firstHash, hash1);
        assertGt(firstTs, 0);
    }

    function test_recordSnapshot_revertsNonAdmin() public {
        vm.prank(alice);
        uint256 cityId = archive.registerCity("ipe");

        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(PolisArchive.NotCityAdmin.selector, cityId, bob));
        archive.recordSnapshot(cityId, keccak256("test"));
    }

    function test_recordSnapshot_revertsEmptyHash() public {
        vm.prank(alice);
        uint256 cityId = archive.registerCity("ipe");

        vm.prank(alice);
        vm.expectRevert(PolisArchive.EmptyHash.selector);
        archive.recordSnapshot(cityId, bytes32(0));
    }

    function test_recordSnapshot_revertsCityNotFound() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(PolisArchive.CityNotFound.selector, 999));
        archive.recordSnapshot(999, keccak256("test"));
    }

    // ── transferAdmin ───────────────────────────────────────────

    function test_transferAdmin() public {
        vm.prank(alice);
        uint256 cityId = archive.registerCity("ipe");

        vm.prank(alice);
        vm.expectEmit(true, false, false, true);
        emit AdminTransferred(cityId, alice, bob);
        archive.transferAdmin(cityId, bob);

        (, address admin,) = archive.cities(cityId);
        assertEq(admin, bob);
    }

    function test_transferAdmin_revertsNonAdmin() public {
        vm.prank(alice);
        uint256 cityId = archive.registerCity("ipe");

        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(PolisArchive.NotCityAdmin.selector, cityId, bob));
        archive.transferAdmin(cityId, bob);
    }

    function test_transferAdmin_revertsZeroAddress() public {
        vm.prank(alice);
        uint256 cityId = archive.registerCity("ipe");

        vm.prank(alice);
        vm.expectRevert(PolisArchive.ZeroAddress.selector);
        archive.transferAdmin(cityId, address(0));
    }

    // ── getLatestSnapshot (empty) ───────────────────────────────

    function test_getLatestSnapshot_returnsZeroWhenEmpty() public {
        vm.prank(alice);
        uint256 cityId = archive.registerCity("ipe");

        (bytes32 hash, uint256 ts) = archive.getLatestSnapshot(cityId);
        assertEq(hash, bytes32(0));
        assertEq(ts, 0);
    }

    // ── Pause ───────────────────────────────────────────────────

    function test_pause_blocksRegister() public {
        archive.pause();

        vm.prank(alice);
        vm.expectRevert();
        archive.registerCity("ipe");
    }

    function test_pause_blocksSnapshot() public {
        vm.prank(alice);
        uint256 cityId = archive.registerCity("ipe");

        archive.pause();

        vm.prank(alice);
        vm.expectRevert();
        archive.recordSnapshot(cityId, keccak256("test"));
    }

    function test_unpause_restoresFunctionality() public {
        archive.pause();
        archive.unpause();

        vm.prank(alice);
        uint256 cityId = archive.registerCity("ipe");
        assertEq(cityId, 1);
    }

    function test_pause_onlyOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        archive.pause();
    }

    // ── Fuzz tests ──────────────────────────────────────────────

    function testFuzz_registerCity_uniqueSlugs(string calldata slug1, string calldata slug2) public {
        vm.assume(bytes(slug1).length > 0);
        vm.assume(bytes(slug2).length > 0);
        vm.assume(keccak256(bytes(slug1)) != keccak256(bytes(slug2)));

        vm.prank(alice);
        uint256 id1 = archive.registerCity(slug1);

        vm.prank(bob);
        uint256 id2 = archive.registerCity(slug2);

        assertEq(id1, 1);
        assertEq(id2, 2);
        assertTrue(archive.slugTaken(slug1));
        assertTrue(archive.slugTaken(slug2));
    }

    function testFuzz_recordSnapshot_anyHash(bytes32 hash) public {
        vm.assume(hash != bytes32(0));

        vm.prank(alice);
        uint256 cityId = archive.registerCity("fuzz-city");

        vm.prank(alice);
        archive.recordSnapshot(cityId, hash);

        (bytes32 latestHash,) = archive.getLatestSnapshot(cityId);
        assertEq(latestHash, hash);
    }

    // ── Gas snapshot ────────────────────────────────────────────

    function test_gas_recordSnapshot() public {
        vm.prank(alice);
        uint256 cityId = archive.registerCity("gas-test");

        bytes32 hash = keccak256("gas-snapshot");

        vm.prank(alice);
        uint256 gasBefore = gasleft();
        archive.recordSnapshot(cityId, hash);
        uint256 gasUsed = gasBefore - gasleft();

        console2.log("Gas used for recordSnapshot:", gasUsed);
        assertLt(gasUsed, 80_000, "recordSnapshot should use < 80k gas");
    }
}
