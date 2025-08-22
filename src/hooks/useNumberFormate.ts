  export const formatNumber = (num: number): string => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
    if (num <= 999) return (num).toFixed(2) ;
    return num.toLocaleString(); // adds commas
  };
