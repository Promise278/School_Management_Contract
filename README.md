# School Management System

A blockchain-based school management system built with Solidity and Hardhat. The project contains smart contracts for managing students, staff, school fee payments, school tokens, and student identity NFTs.

## Overview

This project is designed to help a school manage important academic and administrative records on-chain. It includes contracts for registering students, registering staff, tracking attendance, handling school fee payments, and issuing digital student identity NFTs.

## Features

- Student registration with matric number generation
- Staff registration with role and salary records
- Attendance tracking between staff and students
- School fee payment using the school ERC20 token
- Student NFT minting for digital student identity
- School token minting and transfer support
- Hardhat setup for compiling, testing, and deploying contracts

## Contracts

### `StudentContract.sol`

Handles student registration, matric numbers, school fee status, and student record lookup.

### `StaffContract.sol`

Handles staff registration, staff records, salary payment logic, and attendance tracking.

### `SchoolToken.sol`

An ERC20 token named `School Token` with the symbol `SCH`. It can be used as the school payment token.

### `SchoolNFT.sol`

An ERC721 NFT contract for minting student identity NFTs.

## Tech Stack

- Solidity
- Hardhat
- OpenZeppelin Contracts

## Getting Started

Install dependencies:

```shell
npm install
```

Compile the contracts:

```shell
npx hardhat compile
```

Run tests:

```shell
npx hardhat test
```

Start a local Hardhat node:

```shell
npx hardhat node
```

Deploy with Hardhat Ignition:

```shell
npx hardhat ignition deploy ./ignition/modules/Lock.js
```

## Project Structure

```text
contracts/
  SchoolNFT.sol
  SchoolToken.sol
  StaffContract.sol
  StudentContract.sol

test/
  School.js
  Lock.js

ignition/
  modules/
    Lock.js
```

## Future Improvements

- Add admin access control to all management functions
- Connect the student contract directly to the school token and NFT contracts
- Add complete tests for student registration, staff registration, fee payment, and attendance
- Add deployment scripts for all school management contracts
- Build a frontend dashboard for admins, staff, and students

## License

This project is licensed under the ISC License.
