export const formatNumber = (num: string | number) => {
  if (!num) return "";

  const [integerPart, decimalPart] = num
    .toString()
    .replace(/,/g, "")
    .split(".");
  const formattedInteger = Number(integerPart).toLocaleString("en-US");
  // Format the decimal part to the desired decimal places
  // const formattedDecimal = decimalPart !== undefined
  //     ? (Number(`0.${decimalPart || 0}`))
  //     : decimalPart;

  return decimalPart !== undefined
    ? `${formattedInteger}.${decimalPart}`
    : formattedInteger;
};
