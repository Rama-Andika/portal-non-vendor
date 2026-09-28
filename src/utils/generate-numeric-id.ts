export const generateNumericId = () => {
  const timestamp = Date.now(); // contoh: 1727702400000
  const random = Math.floor(Math.random() * 1000); // 0–999
  return Number(`${timestamp}${random}`).toString();
};
