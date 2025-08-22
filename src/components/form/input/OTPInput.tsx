import React, { useRef, useState, KeyboardEvent, ClipboardEvent } from 'react';

interface OTPInputProps {
  length?: number;
  onChange: (otp: string) => void;
}

const OTPInput: React.FC<OTPInputProps> = ({ length = 4, onChange }) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize refs array
  if (inputRefs.current.length !== length) {
    inputRefs.current = new Array(length).fill(null);
  }

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Combine and send value to parent
    const combinedOtp = newOtp.join('');
    onChange(combinedOtp);

    // Move to next input if value is entered
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace if current input is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    if (!/^\d+$/.test(pastedData)) return; // Only allow digits

    const pastedArray = pastedData.split('').slice(0, length);
    const newOtp = [...otp];
    
    pastedArray.forEach((value, index) => {
      newOtp[index] = value;
      if (inputRefs.current[index]) {
        inputRefs.current[index]!.value = value;
      }
    });

    setOtp(newOtp);
    onChange(newOtp.join(''));

    // Focus the next empty input or the last input
    const nextEmptyIndex = pastedArray.length < length ? pastedArray.length : length - 1;
    inputRefs.current[nextEmptyIndex]?.focus();
  };

  return (
    <div className="flex gap-4 justify-center">
      {otp.map((value, index) => (
        <input
          key={index}
          ref={el => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="w-12 h-12 text-center text-xl font-semibold rounded-lg border border-gray-300 bg-transparent text-gray-800 shadow-sm focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
          autoComplete="off"
        />
      ))}
    </div>
  );
};

export default OTPInput; 