
export function toNumber(value) {
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : 0;
    }

    const cleaned = String(value ?? "")
        .replace(/,/g, "")
        .replace(/[^\d.-]/g, "");

    const number = Number(cleaned);
    return Number.isFinite(number) ? number : 0;
}

export function toDate(value) {
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
        const date = new Date(Math.round((value - 25569) * 86400000));
        return Number.isNaN(date.getTime()) ? null : date;
    }

    if (value == null || value === "") return null;

    const text = String(value).trim();

    // ISO: YYYY-MM-DD HH:mm:ss
    const iso = text.match(
        /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/
    );

    if (iso) {
        const [, year, month, day, hour = "0", minute = "0", second = "0"] = iso;

        return createValidDate(
            Number(year),
            Number(month),
            Number(day),
            Number(hour),
            Number(minute),
            Number(second)
        );
    }

    // Slash format: MM/DD/YYYY or legacy DD/MM/YYYY
    const slash = text.match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:,\s*(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/
    );

    if (slash) {
        const [, first, second, year, hour = "0", minute = "0", sec = "0"] = slash;

        const a = Number(first);
        const b = Number(second);

        let month;
        let day;

        if (a > 12 && b <= 12) {
            // Legacy format: DD/MM/YYYY, e.g. 28/8/2026
            day = a;
            month = b;
        } else if (b > 12 && a <= 12) {
            // Unambiguous month-first format, e.g. 8/28/2026
            month = a;
            day = b;
        } else {
            // Ambiguous dates use DD/MM/YYYY for legacy Google Sheets records.
            day = a;
            month = b;
        }

        return createValidDate(
            Number(year),
            month,
            day,
            Number(hour),
            Number(minute),
            Number(sec)
        );
    }

    console.warn("[Statistics] Unsupported date format:", value);
    return null;
}

function createValidDate(year, month, day, hour = 0, minute = 0, second = 0) {
    if (
        month < 1 || month > 12 ||
        day < 1 || day > 31 ||
        hour < 0 || hour > 23 ||
        minute < 0 || minute > 59 ||
        second < 0 || second > 59
    ) {
        return null;
    }

    const date = new Date(year, month - 1, day, hour, minute, second);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day ||
        date.getHours() !== hour ||
        date.getMinutes() !== minute ||
        date.getSeconds() !== second
    ) {
        return null;
    }

    return date;
}

export function formatNumber(value, digits = 1) {
    return new Intl.NumberFormat("th-TH", {
        minimumFractionDigits: 0,
        maximumFractionDigits: digits,
    }).format(value);
}

export function formatDate(date) {
    if (!date) return "-";

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${month}/${day}`;
}

export function median(values) {
    if (values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    return sorted.length % 2 === 0
        ? (sorted[middle - 1] + sorted[middle]) / 2
        : sorted[middle];
}

export function quantile(values, q) {
    if (values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const position = (sorted.length - 1) * q;
    const lower = Math.floor(position);
    const fraction = position - lower;

    if (sorted[lower + 1] === undefined) return sorted[lower];

    return sorted[lower] +
        fraction * (sorted[lower + 1] - sorted[lower]);
}

export function mean(values) {
    if (values.length === 0) return null;

    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function sampleStandardDeviation(values) {
    if (values.length < 2) return null;

    const average = mean(values);

    const variance = values.reduce(
        (sum, value) => sum + (value - average) ** 2,
        0
    ) / (values.length - 1);

    return Math.sqrt(variance);
}

export function tCritical95(degreesOfFreedom) {
    const table = {
        1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
        6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228,
        11: 2.201, 12: 2.179, 13: 2.160, 14: 2.145, 15: 2.131,
        16: 2.120, 17: 2.110, 18: 2.101, 19: 2.093, 20: 2.086,
        21: 2.080, 22: 2.074, 23: 2.069, 24: 2.064, 25: 2.060,
        26: 2.056, 27: 2.052, 28: 2.048, 29: 2.045, 30: 2.042,
    };

    return table[degreesOfFreedom] ?? 1.96;
}