// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/// @title PolisArchive
/// @notice Multi-tenant registry for pop-up city archives on Base.
/// @dev Each city has an admin who can record IPFS snapshots onchain.
contract PolisArchive is Ownable, Pausable {
    // ── Structs ─────────────────────────────────────────────────
    struct City {
        string slug;
        address admin;
        uint256 registeredAt;
    }

    struct Snapshot {
        bytes32 ipfsHash;
        uint256 timestamp;
    }

    // ── State ───────────────────────────────────────────────────
    mapping(uint256 => City) public cities;
    mapping(uint256 => Snapshot[]) internal _snapshots;
    mapping(string => bool) public slugTaken;
    uint256 public nextCityId = 1;

    // ── Events ──────────────────────────────────────────────────
    event CityRegistered(uint256 indexed cityId, string slug, address admin);
    event SnapshotRecorded(uint256 indexed cityId, uint256 timestamp, bytes32 ipfsHash);
    event AdminTransferred(uint256 indexed cityId, address oldAdmin, address newAdmin);

    // ── Errors ──────────────────────────────────────────────────
    error SlugAlreadyTaken(string slug);
    error EmptySlug();
    error NotCityAdmin(uint256 cityId, address caller);
    error EmptyHash();
    error CityNotFound(uint256 cityId);
    error ZeroAddress();

    // ── Constructor ─────────────────────────────────────────────
    constructor() Ownable(msg.sender) {}

    // ── Public functions ────────────────────────────────────────

    /// @notice Register a new city. Anyone can register.
    /// @param slug Unique lowercase identifier for the city.
    /// @return cityId The assigned city ID.
    function registerCity(string calldata slug) external whenNotPaused returns (uint256 cityId) {
        if (bytes(slug).length == 0) revert EmptySlug();
        if (slugTaken[slug]) revert SlugAlreadyTaken(slug);

        cityId = nextCityId++;
        cities[cityId] = City({slug: slug, admin: msg.sender, registeredAt: block.timestamp});
        slugTaken[slug] = true;

        emit CityRegistered(cityId, slug, msg.sender);
    }

    /// @notice Record an IPFS snapshot for a city. Only the city admin can call.
    /// @param cityId The city ID.
    /// @param ipfsHash The IPFS content hash (CIDv1 as bytes32).
    function recordSnapshot(uint256 cityId, bytes32 ipfsHash) external whenNotPaused {
        if (cities[cityId].admin == address(0)) revert CityNotFound(cityId);
        if (cities[cityId].admin != msg.sender) revert NotCityAdmin(cityId, msg.sender);
        if (ipfsHash == bytes32(0)) revert EmptyHash();

        _snapshots[cityId].push(Snapshot({ipfsHash: ipfsHash, timestamp: block.timestamp}));

        emit SnapshotRecorded(cityId, block.timestamp, ipfsHash);
    }

    /// @notice Transfer city admin to a new address. Only current admin can call.
    /// @param cityId The city ID.
    /// @param newAdmin The new admin address.
    function transferAdmin(uint256 cityId, address newAdmin) external {
        if (cities[cityId].admin == address(0)) revert CityNotFound(cityId);
        if (cities[cityId].admin != msg.sender) revert NotCityAdmin(cityId, msg.sender);
        if (newAdmin == address(0)) revert ZeroAddress();

        address oldAdmin = cities[cityId].admin;
        cities[cityId].admin = newAdmin;

        emit AdminTransferred(cityId, oldAdmin, newAdmin);
    }

    // ── View functions ──────────────────────────────────────────

    /// @notice Get the latest snapshot for a city.
    /// @param cityId The city ID.
    /// @return ipfsHash The IPFS hash of the latest snapshot.
    /// @return timestamp The timestamp of the latest snapshot.
    function getLatestSnapshot(uint256 cityId) external view returns (bytes32 ipfsHash, uint256 timestamp) {
        Snapshot[] storage snaps = _snapshots[cityId];
        if (snaps.length == 0) return (bytes32(0), 0);
        Snapshot storage latest = snaps[snaps.length - 1];
        return (latest.ipfsHash, latest.timestamp);
    }

    /// @notice Get the total number of snapshots for a city.
    /// @param cityId The city ID.
    /// @return count Number of snapshots.
    function getSnapshotCount(uint256 cityId) external view returns (uint256 count) {
        return _snapshots[cityId].length;
    }

    /// @notice Get a specific snapshot by index.
    /// @param cityId The city ID.
    /// @param index The snapshot index.
    /// @return ipfsHash The IPFS hash.
    /// @return timestamp The timestamp.
    function getSnapshot(uint256 cityId, uint256 index) external view returns (bytes32 ipfsHash, uint256 timestamp) {
        Snapshot storage snap = _snapshots[cityId][index];
        return (snap.ipfsHash, snap.timestamp);
    }

    // ── Admin functions ─────────────────────────────────────────

    /// @notice Pause the contract. Only owner.
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpause the contract. Only owner.
    function unpause() external onlyOwner {
        _unpause();
    }
}
