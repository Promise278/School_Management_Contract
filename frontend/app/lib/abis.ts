export const STUDENT_CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "uint256", name: "age", type: "uint256" },
    ],
    name: "registerStudent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "paySchoolFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "schoolFee",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalStudents",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "studentMap",
    outputs: [
      { internalType: "uint256", name: "matricNumber", type: "uint256" },
      { internalType: "string", name: "name", type: "string" },
      { internalType: "uint256", name: "age", type: "uint256" },
      { internalType: "bool", name: "registered", type: "bool" },
      { internalType: "bool", name: "feesPaid", type: "bool" },
      { internalType: "uint256", name: "createdAt", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export const STAFF_CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "address", name: "wallet", type: "address" },
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "role", type: "string" },
      { internalType: "uint256", name: "salary", type: "uint256" },
    ],
    name: "registerStaff",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "student", type: "address" }],
    name: "markAttendance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "staffAddress", type: "address" },
      { internalType: "address", name: "student", type: "address" },
    ],
    name: "getAttendance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalStaff",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "staffMap",
    outputs: [
      { internalType: "uint256", name: "staffId", type: "uint256" },
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "role", type: "string" },
      { internalType: "uint256", name: "salary", type: "uint256" },
      { internalType: "bool", name: "active", type: "bool" },
      { internalType: "uint256", name: "createdAt", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
];
