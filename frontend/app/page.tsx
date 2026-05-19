"use client";

import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { STAFF_CONTRACT_ADDRESS, STUDENT_CONTRACT_ADDRESS } from "./lib/constants";
import { STAFF_CONTRACT_ABI, STUDENT_CONTRACT_ABI } from "./lib/abis";

type StudentProfile = {
  matricNumber: bigint;
  name: string;
  age: bigint;
  registered: boolean;
  feesPaid: boolean;
  createdAt: bigint;
};

type StaffProfile = {
  staffId: bigint;
  name: string;
  role: string;
  salary: bigint;
  active: boolean;
  createdAt: bigint;
};

const formatDate = (timestamp: bigint) =>
  new Date(Number(timestamp) * 1000).toLocaleString();

const shortAddress = (address: string) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

export default function Home() {
  const [account, setAccount] = useState<string>("");
  const [status, setStatus] = useState<string>("Ready");
  const [error, setError] = useState<string>("");
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [totalStaff, setTotalStaff] = useState<number>(0);
  const [schoolFee, setSchoolFee] = useState<string>("0");
  const [attendanceCount, setAttendanceCount] = useState<number | null>(null);

  const [studentName, setStudentName] = useState<string>("");
  const [studentAge, setStudentAge] = useState<number>(18);
  const [staffName, setStaffName] = useState<string>("");
  const [staffRole, setStaffRole] = useState<string>("");
  const [staffSalary, setStaffSalary] = useState<number>(100);
  const [attendanceStudentAddress, setAttendanceStudentAddress] = useState<string>("");
  const [attendanceMessage, setAttendanceMessage] = useState<string>("");

  const isReady = Boolean(
    STUDENT_CONTRACT_ADDRESS && STAFF_CONTRACT_ADDRESS && typeof window !== "undefined" && (window as any).ethereum
  );

  const provider = useMemo(() => {
    if (typeof window === "undefined") return null;
    const ethereum = (window as any).ethereum;
    if (!ethereum) return null;
    return new ethers.BrowserProvider(ethereum);
  }, []);

  const getSigner = async () => {
    if (!provider) throw new Error("Ethereum provider not available.");
    return provider.getSigner();
  };

  const getContracts = async () => {
    const signer = await getSigner();
    return {
      studentContract: new ethers.Contract(
        STUDENT_CONTRACT_ADDRESS,
        STUDENT_CONTRACT_ABI,
        signer,
      ),
      staffContract: new ethers.Contract(
        STAFF_CONTRACT_ADDRESS,
        STAFF_CONTRACT_ABI,
        signer,
      ),
    };
  };

  const connectWallet = async () => {
    try {
      setError("");
      setStatus("Connecting wallet...");
      if (!provider) throw new Error("Please install MetaMask or another Web3 wallet.");
      await provider.send("eth_requestAccounts", []);
      const signer = await getSigner();
      const address = await signer.getAddress();
      setAccount(address);
      setStatus(`Connected to ${shortAddress(address)}`);
    } catch (err) {
      setError((err as Error).message || "Unable to connect wallet.");
      setStatus("Connection failed");
    }
  };

  const refreshData = async () => {
    try {
      setError("");
      setStatus("Fetching latest contract data...");
      if (!account) return;
      const { studentContract, staffContract } = await getContracts();
      const [fee, studentCount, staffCount, studentState, staffState] = await Promise.all([
        studentContract.schoolFee(),
        studentContract.totalStudents(),
        staffContract.totalStaff(),
        studentContract.studentMap(account),
        staffContract.staffMap(account),
      ]);

      setSchoolFee(ethers.formatUnits(fee, 18));
      setTotalStudents(Number(studentCount));
      setTotalStaff(Number(staffCount));
      setAttendanceCount(null);

      const studentProfile: StudentProfile = {
        matricNumber: BigInt(studentState.matricNumber ?? 0),
        name: studentState.name || "",
        age: BigInt(studentState.age ?? 0),
        registered: Boolean(studentState.registered),
        feesPaid: Boolean(studentState.feesPaid),
        createdAt: BigInt(studentState.createdAt ?? 0),
      };

      setStudentProfile(studentProfile.registered ? studentProfile : null);

      const staffProfile: StaffProfile = {
        staffId: BigInt(staffState.staffId ?? 0),
        name: staffState.name || "",
        role: staffState.role || "",
        salary: BigInt(staffState.salary ?? 0),
        active: Boolean(staffState.active),
        createdAt: BigInt(staffState.createdAt ?? 0),
      };

      setStaffProfile(Number(staffProfile.staffId) > 0 ? staffProfile : null);
      setStatus("Dashboard updated.");
    } catch (err) {
      setError((err as Error).message || "Unable to refresh data.");
      setStatus("Refresh failed");
    }
  };

  const registerStudent = async () => {
    try {
      setError("");
      setStatus("Registering student...");
      const { studentContract } = await getContracts();
      const tx = await studentContract.registerStudent(studentName, studentAge);
      await tx.wait();
      setStatus("Student registered successfully.");
      setStudentName("");
      setStudentAge(18);
      await refreshData();
    } catch (err) {
      setError((err as Error).message || "Student registration failed.");
      setStatus("Registration failed");
    }
  };

  const paySchoolFees = async () => {
    try {
      setError("");
      setStatus("Submitting school fee payment...");
      const { studentContract } = await getContracts();
      const tx = await studentContract.paySchoolFees();
      await tx.wait();
      setStatus("School fee payment confirmed.");
      await refreshData();
    } catch (err) {
      setError((err as Error).message || "Fee payment failed.");
      setStatus("Payment failed");
    }
  };

  const registerStaff = async () => {
    try {
      setError("");
      setStatus("Registering staff...");
      const { staffContract } = await getContracts();
      const tx = await staffContract.registerStaff(account, staffName, staffRole, BigInt(staffSalary));
      await tx.wait();
      setStatus("Staff registered successfully.");
      setStaffName("");
      setStaffRole("");
      setStaffSalary(100);
      await refreshData();
    } catch (err) {
      setError((err as Error).message || "Staff registration failed.");
      setStatus("Registration failed");
    }
  };

  const markAttendance = async () => {
    try {
      setError("");
      setAttendanceMessage("Submitting attendance...");
      const { staffContract } = await getContracts();
      const tx = await staffContract.markAttendance(attendanceStudentAddress);
      await tx.wait();
      setAttendanceMessage("Attendance recorded.");
      if (staffProfile) {
        const { staffContract: readOnly } = await getContracts();
        const count = await readOnly.getAttendance(account, attendanceStudentAddress);
        setAttendanceCount(Number(count));
      }
    } catch (err) {
      setError((err as Error).message || "Attendance submission failed.");
      setAttendanceMessage("Attendance failed");
    }
  };

  useEffect(() => {
    if (!provider) {
      setStatus("No wallet provider detected.");
      return;
    }

    const connectOnLoad = async () => {
      try {
        const accounts = await provider.send("eth_accounts", []);
        if (accounts.length > 0) {
          const signer = await getSigner();
          setAccount(await signer.getAddress());
          setStatus("Wallet connected.");
        }
      } catch {
        // silent
      }
    };

    connectOnLoad();
  }, [provider]);

  useEffect(() => {
    if (account) {
      refreshData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">School Management</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                On-chain student and staff operations.
              </h1>
              <p className="mt-4 max-w-2xl text-slate-400">
                Connect your wallet, register student and staff profiles, pay fees, and track attendance directly through your deployed school contracts.
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">Wallet status</p>
                  <p className="font-medium text-white">{account ? shortAddress(account) : "Not connected"}</p>
                </div>
                <button
                  className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={connectWallet}
                  disabled={!isReady}
                >
                  {account ? "Reconnect" : "Connect wallet"}
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-800/90 p-4">
                  <p className="text-xs uppercase text-slate-500">Students</p>
                  <p className="mt-2 text-xl font-semibold text-white">{totalStudents}</p>
                </div>
                <div className="rounded-3xl bg-slate-800/90 p-4">
                  <p className="text-xs uppercase text-slate-500">Staff</p>
                  <p className="mt-2 text-xl font-semibold text-white">{totalStaff}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
            <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Student dashboard</h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Register as a learner, pay school fees, and review your student profile.
                  </p>
                </div>
                <button
                  onClick={refreshData}
                  className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
                >
                  Refresh
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-900 p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-500">School fee</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{schoolFee} SCH</p>
                </div>
                <div className="rounded-3xl bg-slate-900 p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Connection</p>
                  <p className="mt-3 text-lg text-white">{isReady ? "Provider available" : "MetaMask required"}</p>
                </div>
              </div>

              {studentProfile ? (
                <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-400">Student registered</p>
                      <p className="text-xl font-semibold text-white">{studentProfile.name}</p>
                    </div>
                    <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm text-emerald-300">{studentProfile.feesPaid ? "Fees paid" : "Pending payment"}</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3 text-sm text-slate-300">
                    <div>
                      <p className="text-slate-500">Matric</p>
                      <p>{studentProfile.matricNumber.toString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Age</p>
                      <p>{studentProfile.age.toString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Created</p>
                      <p>{formatDate(studentProfile.createdAt)}</p>
                    </div>
                  </div>
                  <button
                    className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={paySchoolFees}
                    disabled={studentProfile.feesPaid}
                  >
                    {studentProfile.feesPaid ? "Fees already paid" : "Pay school fees"}
                  </button>
                </div>
              ) : (
                <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Register student profile</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-slate-200">
                      <span>Name</span>
                      <input
                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                        value={studentName}
                        onChange={(event) => setStudentName(event.target.value)}
                        placeholder="Jane Doe"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-200">
                      <span>Age</span>
                      <input
                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                        value={studentAge}
                        onChange={(event) => setStudentAge(Number(event.target.value))}
                        type="number"
                        min={10}
                        max={120}
                      />
                    </label>
                  </div>
                  <button
                    className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={registerStudent}
                    disabled={!studentName || studentAge < 10}
                  >
                    Register student
                  </button>
                </div>
              )}
            </section>

            <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
              <div>
                <h2 className="text-2xl font-semibold text-white">Staff operations</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Register staff, then mark attendance for registered students.
                </p>
              </div>

              {staffProfile ? (
                <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-400">Staff member</p>
                      <p className="text-xl font-semibold text-white">{staffProfile.name}</p>
                    </div>
                    <span className="rounded-full bg-amber-500/15 px-3 py-1 text-sm text-amber-300">{staffProfile.role}</span>
                  </div>
                  <div className="grid gap-3 text-sm text-slate-300">
                    <div>
                      <p className="text-slate-500">Salary</p>
                      <p>{staffProfile.salary.toString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Status</p>
                      <p>{staffProfile.active ? "Active" : "Inactive"}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Joined</p>
                      <p>{formatDate(staffProfile.createdAt)}</p>
                    </div>
                  </div>

                  <label className="space-y-2 text-sm text-slate-200">
                    <span>Student address for attendance</span>
                    <input
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                      value={attendanceStudentAddress}
                      onChange={(event) => setAttendanceStudentAddress(event.target.value)}
                      placeholder="0x..."
                    />
                  </label>
                  <button
                    className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={markAttendance}
                    disabled={!ethers.isAddress(attendanceStudentAddress)}
                  >
                    Mark attendance
                  </button>
                  {attendanceCount !== null && (
                    <p className="text-sm text-slate-400">Attendance count: {attendanceCount}</p>
                  )}
                  {attendanceMessage && (
                    <p className="text-sm text-slate-400">{attendanceMessage}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Register staff profile</p>
                  <div className="space-y-4">
                    <label className="space-y-2 text-sm text-slate-200">
                      <span>Name</span>
                      <input
                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                        value={staffName}
                        onChange={(event) => setStaffName(event.target.value)}
                        placeholder="Mr. Smith"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-200">
                      <span>Role</span>
                      <input
                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                        value={staffRole}
                        onChange={(event) => setStaffRole(event.target.value)}
                        placeholder="Teacher"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-200">
                      <span>Salary</span>
                      <input
                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                        value={staffSalary}
                        onChange={(event) => setStaffSalary(Number(event.target.value))}
                        type="number"
                        min={1}
                      />
                    </label>
                  </div>
                  <button
                    className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={registerStaff}
                    disabled={!staffName || !staffRole || staffSalary < 1}
                  >
                    Register staff
                  </button>
                </div>
              )}
            </section>
          </div>

          <section className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-900/95 p-6 md:grid-cols-3">
            <div className="space-y-2 rounded-3xl bg-slate-950 p-5">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Student contract</p>
              <p className="font-medium text-white">{STUDENT_CONTRACT_ADDRESS || "Missing address"}</p>
            </div>
            <div className="space-y-2 rounded-3xl bg-slate-950 p-5">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Staff contract</p>
              <p className="font-medium text-white">{STAFF_CONTRACT_ADDRESS || "Missing address"}</p>
            </div>
            <div className="space-y-2 rounded-3xl bg-slate-950 p-5">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Status</p>
              <p className="font-medium text-white">{status}</p>
              {error && <p className="text-sm text-rose-300">{error}</p>}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
