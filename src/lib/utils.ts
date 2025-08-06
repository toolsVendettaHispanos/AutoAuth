import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function formatNumber(num: number): string {
    const numberValue = Math.floor(num);
    if (numberValue < 1000) {
      return numberValue.toLocaleString('de-DE');
    }
    const suffixes = ["", "K", "M", "B", "T"];
    const i = Math.floor(Math.log10(numberValue) / 3);
    const shortValue = (numberValue / Math.pow(1000, i));
    return shortValue.toFixed(i > 0 ? 2 : 0) + suffixes[i];
  }
  


export function formatDuration(seconds: number): string {
    if (seconds <= 0) return "0s";

    const units: {name: string, seconds: number}[] = [
        { name: 'año', seconds: 31536000 },
        { name: 'sem', seconds: 604800 },
        { name: 'd', seconds: 86400 },
        { name: 'h', seconds: 3600 },
        { name: 'm', seconds: 60 },
        { name: 's', seconds: 1 }
    ];

    let remainingSeconds = seconds;
    let result = '';
    let parts = 0;

    for (const unit of units) {
        if (remainingSeconds >= unit.seconds && parts < 2) { // show 2 largest units
            const amount = Math.floor(remainingSeconds / unit.seconds);
            if (amount > 0) {
                result += `${amount}${unit.name} `;
                remainingSeconds %= unit.seconds;
                parts++;
            }
        }
    }

    return result.trim() || '0s';
}
