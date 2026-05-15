// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract StudentContract {

    uint256 public schoolFee = 100 * 10 ** 18;
    uint256 private nextMatric = 1;

    struct Student {
        uint256 matricNumber;
        string name;
        uint256 age;
        bool registered;
        bool feesPaid;
        uint256 createdAt;
    }

    Student[] public students;
    mapping(address => Student) public studentMap;

    function registerStudent(string memory name, uint256 age) external {
        require(bytes(name).length > 3, "Name too short");
        require(!studentMap[msg.sender].registered, "Already registered");

        student.push(Student({ nextMatric++, name, age, registered: false, feesPaid: false, createdAt: block.timestamp }));
        studentMap[msg.sender] = students[students.length - 1];
    }

    function paySchoolFees() external {
        Student storage students_info = studentMap[msg.sender];
        require(students_info.registered, "Not registered");
        require(!students_info.feesPaid, "Already paid");
        require(studentNFT.balanceOf(msg.sender) > 0, "Student NFT required");

        students_info.feesPaid = true;
        require(
            schoolToken.transferFrom(msg.sender, address(this), schoolFee),
            "Payment failed"
        );
    }

    function getStudent(uint256 index) external view returns (Student memory) {
        return students[index];
    }

    function totalStudents() external view returns (uint256) {
        return students.length;
    }
}
