const COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-teal-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-pink-500",
  "bg-indigo-500",
];

export const hashStringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
};
