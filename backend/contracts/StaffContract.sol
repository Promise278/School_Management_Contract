// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract StaffContract {
    uint256 private nextId = 1;

    struct Staff {
        uint256 staffId;
        string name;
        string role;
        uint256 salary;
        bool active;
        uint256 createdAt;
    }

    Staff[] public staff;
    mapping(address => Staff) public staffMap;
    mapping(address => mapping(address => uint256)) public attendance;

    function registerStaff(
        address wallet,
        string calldata name,
        string calldata role,
        uint256 salary
    ) external {
        require(!staffMap[wallet].active, "Already registered");

        uint256 next = nextId;
        nextId++;

        staff.push(
            Staff({
                staffId: nextId,
                name: name,
                role: role,
                salary: salary,
                active: true,
                createdAt: block.timestamp
            })
        );

        staffMap[wallet] = staff[staff.length - 1];
    }

    function paySalary(address wallet) external {
        Staff storage s = staffMap[wallet];
        require(s.active, "Not active");
        require(address(this).balance >= s.salary, "Insufficient balance");
        payable(wallet).transfer(s.salary);
    }

    function markAttendance(address student) external {
        attendance[msg.sender][student]++;
    }

    function getStaffById(uint256 id) external view returns (Staff memory) {
        require(id > 0 && id <= staff.length, "Invalid ID");
        return staff[id - 1];
    }

    function getAllStaff() external view returns (Staff[] memory) {
        return staff;
    }

    function totalStaff() external view returns (uint256) {
        return staff.length;
    }

    function getAttendance(
        address staffAddress,
        address student
    ) external view returns (uint256) {
        return attendance[staffAddress][student];
    }
}
