const { expect } = require("chai");
const { ethers }  = require("hardhat");

describe("School Management System", () => {
  let token, nft, staffContract, studentContract;
  let admin, staffWallet, studentWallet, other;

  beforeEach(async () => {
    [admin, staffWallet, studentWallet, other] = await ethers.getSigners();

    // Deploy all 4 contracts
    token           = await (await ethers.getContractFactory("SchoolToken")).deploy();
    nft             = await (await ethers.getContractFactory("StudentNFT")).deploy();
    staffContract   = await (await ethers.getContractFactory("StaffContract")).deploy();
    studentContract = await (await ethers.getContractFactory("StudentContract")).deploy();

    // Give student wallet some tokens to pay fees
    await token.transfer(studentWallet.address, ethers.parseUnits("500", 18));
  });

  // ── SchoolToken ──────────────────────────────────────────────

  describe("SchoolToken", () => {
    it("mints 1 million tokens to deployer", async () => {
      const balance = await token.balanceOf(admin.address);
      expect(balance).to.be.gt(0);
    });

    it("owner can mint more tokens", async () => {
      await token.mint(other.address, ethers.parseUnits("100", 18));
      expect(await token.balanceOf(other.address)).to.equal(ethers.parseUnits("100", 18));
    });

    it("non-owner cannot mint", async () => {
      await expect(
        token.connect(other).mint(other.address, 100n)
      ).to.be.reverted;
    });

    it("can transfer tokens between wallets", async () => {
      await token.transfer(other.address, ethers.parseUnits("100", 18));
      expect(await token.balanceOf(other.address)).to.equal(ethers.parseUnits("100", 18));
    });
  });

  // ── StudentNFT ───────────────────────────────────────────────

  describe("StudentNFT", () => {
    it("owner can mint an NFT to a student", async () => {
      await nft.mintStudentNFT(studentWallet.address, "ipfs://QmTest");
      expect(await nft.balanceOf(studentWallet.address)).to.equal(1);
    });

    it("token URI is set correctly", async () => {
      await nft.mintStudentNFT(studentWallet.address, "ipfs://QmTest");
      expect(await nft.tokenURI(0)).to.equal("ipfs://QmTest");
    });

    it("nextId increments after each mint", async () => {
      await nft.mintStudentNFT(studentWallet.address, "ipfs://Qm1");
      await nft.mintStudentNFT(other.address, "ipfs://Qm2");
      expect(await nft.nextId()).to.equal(2);
    });

    it("non-owner cannot mint", async () => {
      await expect(
        nft.connect(other).mintStudentNFT(other.address, "ipfs://QmTest")
      ).to.be.reverted;
    });
  });

  // ── StudentContract ──────────────────────────────────────────

  describe("StudentContract", () => {
    it("registers a student", async () => {
      await studentContract.connect(studentWallet).registerStudent("Alice Smith", 20);
      const s = await studentContract.getStudentByAddress(studentWallet.address);
      expect(s.name).to.equal("Alice Smith");
      expect(s.registered).to.equal(true);
      expect(s.feesPaid).to.equal(false);
    });

    it("assigns incrementing matric numbers", async () => {
      await studentContract.connect(studentWallet).registerStudent("Alice Smith", 20);
      await studentContract.connect(other).registerStudent("John Doe", 22);
      const s1 = await studentContract.getStudentByAddress(studentWallet.address);
      const s2 = await studentContract.getStudentByAddress(other.address);
      expect(s1.matricNumber).to.equal(1);
      expect(s2.matricNumber).to.equal(2);
    });

    it("cannot register with a short name", async () => {
      await expect(
        studentContract.connect(studentWallet).registerStudent("Ali", 20)
      ).to.be.revertedWith("Name too short");
    });

    it("cannot register twice", async () => {
      await studentContract.connect(studentWallet).registerStudent("Alice Smith", 20);
      await expect(
        studentContract.connect(studentWallet).registerStudent("Alice Smith", 20)
      ).to.be.revertedWith("Already registered");
    });

    it("getStudent returns student by index", async () => {
      await studentContract.connect(studentWallet).registerStudent("Alice Smith", 20);
      const s = await studentContract.getStudent(0);
      expect(s.name).to.equal("Alice Smith");
    });

    it("totalStudents returns correct count", async () => {
      expect(await studentContract.totalStudents()).to.equal(0);
      await studentContract.connect(studentWallet).registerStudent("Alice Smith", 20);
      expect(await studentContract.totalStudents()).to.equal(1);
    });

    it("getAllStudents returns all", async () => {
      await studentContract.connect(studentWallet).registerStudent("Alice Smith", 20);
      await studentContract.connect(other).registerStudent("John Doe", 22);
      const all = await studentContract.getAllStudents();
      expect(all.length).to.equal(2);
    });

    it("student pays fees with ETH", async () => {
      await studentContract.connect(studentWallet).registerStudent("Alice Smith", 20);
      const fee = await studentContract.schoolFee();
      await studentContract.connect(studentWallet).paySchoolFees({ value: fee });
      const s = await studentContract.getStudentByAddress(studentWallet.address);
      expect(s.feesPaid).to.equal(true);
    });

    it("cannot pay fees twice", async () => {
      await studentContract.connect(studentWallet).registerStudent("Alice Smith", 20);
      const fee = await studentContract.schoolFee();
      await studentContract.connect(studentWallet).paySchoolFees({ value: fee });
      await expect(
        studentContract.connect(studentWallet).paySchoolFees({ value: fee })
      ).to.be.revertedWith("Already paid");
    });

    it("cannot pay fees if not registered", async () => {
      const fee = await studentContract.schoolFee();
      await expect(
        studentContract.connect(other).paySchoolFees({ value: fee })
      ).to.be.revertedWith("Not registered");
    });

    it("cannot pay with not enough ETH", async () => {
      await studentContract.connect(studentWallet).registerStudent("Alice Smith", 20);
      await expect(
        studentContract.connect(studentWallet).paySchoolFees({ value: 100n })
      ).to.be.revertedWith("Not enough ETH");
    });
  });

  // ── StaffContract ────────────────────────────────────────────

  describe("StaffContract", () => {
    it("admin registers a staff member", async () => {
      await staffContract.registerStaff(
        staffWallet.address, "Mr Bob", "Teacher", ethers.parseEther("1")
      );
      const s = await staffContract.getStaffByAddress(staffWallet.address);
      expect(s.name).to.equal("Mr Bob");
      expect(s.active).to.equal(true);
    });

    it("assigns incrementing staff IDs", async () => {
      await staffContract.registerStaff(staffWallet.address, "Mr Bob", "Teacher", 100n);
      await staffContract.registerStaff(other.address, "Ms Ann", "Principal", 200n);
      expect((await staffContract.getStaffByAddress(staffWallet.address)).staffId).to.equal(1);
      expect((await staffContract.getStaffByAddress(other.address)).staffId).to.equal(2);
    });

    it("cannot register same staff twice", async () => {
      await staffContract.registerStaff(staffWallet.address, "Mr Bob", "Teacher", 100n);
      await expect(
        staffContract.registerStaff(staffWallet.address, "Mr Bob", "Teacher", 100n)
      ).to.be.revertedWith("Already registered");
    });

    it("removes a staff member", async () => {
      await staffContract.registerStaff(staffWallet.address, "Mr Bob", "Teacher", 100n);
      await staffContract.removeStaff(staffWallet.address);
      expect((await staffContract.getStaffByAddress(staffWallet.address)).active).to.equal(false);
    });

    it("getStaffById returns correct staff", async () => {
      await staffContract.registerStaff(staffWallet.address, "Mr Bob", "Teacher", 100n);
      const s = await staffContract.getStaffById(1);
      expect(s.name).to.equal("Mr Bob");
    });

    it("getStaffById reverts on invalid ID", async () => {
      await expect(staffContract.getStaffById(99)).to.be.revertedWith("Invalid ID");
    });

    it("getAllStaff returns all", async () => {
      await staffContract.registerStaff(staffWallet.address, "Mr Bob", "Teacher", 100n);
      await staffContract.registerStaff(other.address, "Ms Ann", "Principal", 200n);
      expect((await staffContract.getAllStaff()).length).to.equal(2);
    });

    it("totalStaff returns correct count", async () => {
      expect(await staffContract.totalStaff()).to.equal(0);
      await staffContract.registerStaff(staffWallet.address, "Mr Bob", "Teacher", 100n);
      expect(await staffContract.totalStaff()).to.equal(1);
    });

    it("admin can pay salary in ETH", async () => {
      const salary = ethers.parseEther("1");
      await staffContract.registerStaff(staffWallet.address, "Mr Bob", "Teacher", salary);
      await staffContract.deposit({ value: ethers.parseEther("5") });
      const before = await ethers.provider.getBalance(staffWallet.address);
      await staffContract.paySalary(staffWallet.address);
      const after = await ethers.provider.getBalance(staffWallet.address);
      expect(after).to.be.gt(before);
    });

    it("cannot pay salary with insufficient balance", async () => {
      await staffContract.registerStaff(
        staffWallet.address, "Mr Bob", "Teacher", ethers.parseEther("10")
      );
      await expect(
        staffContract.paySalary(staffWallet.address)
      ).to.be.revertedWith("Insufficient balance");
    });

    it("staff can mark attendance", async () => {
      await staffContract.registerStaff(staffWallet.address, "Mr Bob", "Teacher", 100n);
      await studentContract.connect(studentWallet).registerStudent("Alice Smith", 20);
      await staffContract.connect(staffWallet).markAttendance(studentWallet.address);
      expect(
        await staffContract.getAttendance(staffWallet.address, studentWallet.address)
      ).to.equal(1);
    });

    it("non-staff cannot mark attendance", async () => {
      await expect(
        staffContract.connect(other).markAttendance(studentWallet.address)
      ).to.be.revertedWith("Not a staff member");
    });
  });
});