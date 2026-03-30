const statusData = [
  {
    id: 1,
    value: "ONLINE",
    label: "En ligne",
    style:
      "border border-transparent text-green-400 text-xs bg-green-200 rounded-md px-2 hover:border hover:border-green-400",
    color: "green-400",
    dotClass: "bg-green-400",
  },
  {
    id: 2,
    value: "BUSY",
    label: "Occupé(e)",
    style:
      "border border-transparent text-yellow-400 text-xs bg-yellow-200 rounded-md px-2 hover:border hover:border-yellow-400",
    color: "yellow-400",
    dotClass: "bg-yellow-400",
  },
  {
    id: 3,
    value: "IN_GAME",
    label: "En partie",
    style:
      "border border-transparent text-violet-400 text-xs bg-violet-200 rounded-md px-2 hover:border hover:border-violet-400",
    color: "violet-400",
    dotClass: "bg-violet-400",
  },
  {
    id: 4,
    value: "AWAY",
    label: "Absent",
    style:
      "border border-transparent text-gray-400 text-xs bg-gray-300 rounded-md px-2 hover:border hover:border-gray-400",
    color: "gray-400",
    dotClass: "bg-gray-400",
  },
  {
    id: 5,
    value: "OFFLINE",
    label: "Déconnecté(e)",
    style:
      "border border-transparent text-red-400 text-xs bg-red-200 rounded-md px-2 hover:border hover:border-red-400",
    color: "red-400",
    dotClass: "bg-red-400",
  },
];

export default statusData;
