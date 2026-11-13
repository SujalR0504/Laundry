export function numberToWordsINR(amount: number): string {
  const num = Math.round(Math.abs(amount));
  if (num === 0) return 'Zero Rupees';

  const units = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  const convertGroup = (n: number): string => {
    let output = '';
    if (n >= 100) {
      output += units[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n > 0) {
      if (n < 20) {
        output += units[n] + ' ';
      } else {
        output += tens[Math.floor(n / 10)] + ' ';
        if (n % 10 > 0) {
          output += units[n % 10] + ' ';
        }
      }
    }
    return output;
  };

  let words = '';
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const remainder = num % 1000;

  if (crore > 0) words += convertGroup(crore) + 'Crore ';
  if (lakh > 0) words += convertGroup(lakh) + 'Lakh ';
  if (thousand > 0) words += convertGroup(thousand) + 'Thousand ';
  if (remainder > 0) words += convertGroup(remainder);

  return words.trim() + ' Rupees';
}
