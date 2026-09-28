export function formatNumberWithDecimals(value: number): string {
  if (!value) return "0";
  const [integerPart, decimalPart] = value
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
}
