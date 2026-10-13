
import { getAllRecords } from "../../services.js";

export function init() {
    console.log("[Dashboard] init!");

    // const addFuelButton = document.querySelector(
    //     '[data-action="add-fuel"]'
    // );

    // if (addFuelButton) {
    //     addFuelButton.addEventListener("click", () => {
    //         console.log("[Dashboard] กด Add Fuel Record");
    //         // TODO: เปิดหน้า/Modal สำหรับเพิ่มข้อมูล
    //     });
    // }

    // Event Delegation สำหรับรายการที่สร้างด้วย JavaScript
    const recordsContainer = document.querySelector(
        "#recent-fuel-records"
    );

    if (recordsContainer) {
        recordsContainer.addEventListener("click", (event) => {
            const button = event.target.closest("[data-record-id]");

            if (!button) return;

            console.log(
                "[Dashboard] เลือกรายการ:",
                button.dataset.recordId
            );
        });
    }

    loadFuelRecords();
}

function toNumber(value) {
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : 0;
    }

    const cleaned = String(value ?? "")
        .replace(/,/g, "")
        .replace(/[^\d.-]/g, "");

    const number = Number(cleaned);

    return Number.isFinite(number) ? number : 0;
}


function toDate(value) {
    if (!value) return null;

    const text = String(value).trim();

    // รูปแบบ D/M/YYYY, HH:mm:ss
    // ตัวอย่าง: 6/9/2026, 10:04:49
    const localMatch = text.match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:,\s*(\d{1,2}):(\d{2}):(\d{2}))?$/
    );

    if (localMatch) {
        const day = Number(localMatch[1]);
        const month = Number(localMatch[2]);
        const year = Number(localMatch[3]);
        const hour = Number(localMatch[4] ?? 0);
        const minute = Number(localMatch[5] ?? 0);
        const second = Number(localMatch[6] ?? 0);

        const date = new Date(
            year, month - 1, day, hour, minute, second
        );

        if (
            date.getFullYear() !== year ||
            date.getMonth() !== month - 1 ||
            date.getDate() !== day
        ) {
            return null;
        }

        return date;
    }

    // รูปแบบ YYYY-MM-DD หรือ YYYY-MM-DD HH:mm:ss
    const isoMatch = text.match(
        /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/
    );

    if (isoMatch) {
        const year = Number(isoMatch[1]);
        const month = Number(isoMatch[2]);
        const day = Number(isoMatch[3]);
        const hour = Number(isoMatch[4] ?? 0);
        const minute = Number(isoMatch[5] ?? 0);
        const second = Number(isoMatch[6] ?? 0);

        const date = new Date(
            year, month - 1, day, hour, minute, second
        );

        if (
            date.getFullYear() !== year ||
            date.getMonth() !== month - 1 ||
            date.getDate() !== day
        ) {
            return null;
        }

        return date;
    }

    // รองรับ ISO datetime ที่มี timezone
    const parsed = new Date(text);

    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(date) {
    if (!date) return "-";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatMoney(value) {
    return new Intl.NumberFormat("th-TH", {
        style: "currency",
        currency: "THB",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

function formatNumber(value, digits = 1) {
    return new Intl.NumberFormat("th-TH", {
        maximumFractionDigits: digits,
    }).format(value);
}

async function loadFuelRecords() {
    try {
        const records = await getAllRecords();

        if (!Array.isArray(records)) {
            throw new Error("API response is not an array");
        }

        // ตรวจสอบข้อมูลดิบที่ได้รับจาก API
        console.log("[Dashboard] Raw fuel records:", records);

        console.table(
            records.map((record, index) => ({
                index,
                dateFromSheet: record["วันที่"],
                totalPrice: record["ราคารวม"],
                liters: record["จำนวนลิตร"],
                distance: record["ระยะทาง"],
            }))
        );

        const normalized = records.map((record, index) => ({
            ...normalizeRecord(record),
            id: String(index),
            originalIndex: index,
        }));

        console.table(
            normalized.map((record) => ({
                originalIndex: record.originalIndex,
                parsedDate: record.date
                    ? record.date.toISOString()
                    : null,
                displayedDate: formatDate(record.date),
                totalPrice: record.totalPrice,
            }))
        );

        renderSummary(normalized);
        renderRecentRecords(normalized);
    } catch (error) {
        console.error(
            "[Dashboard] โหลดข้อมูลน้ำมันไม่สำเร็จ:",
            error
        );

        const container = document.querySelector(
            "#recent-fuel-records"
        );

        if (container) {
            container.textContent = "โหลดข้อมูลไม่สำเร็จ";
        }
    }
}

function normalizeRecord(record) {
    return {
        date: toDate(record["วันที่"]),
        fuelType: record["ประเภทเชื้อเพลิง"] ?? "-",
        carModel: record["รุ่นรถ"] ?? "-",
        liters: toNumber(record["จำนวนลิตร"]),
        distance: toNumber(record["ระยะทาง"]),
        totalPrice: toNumber(record["ราคารวม"]),
        pricePerLiter: toNumber(record["ราคาน้ำมันต่อลิตร"]),
        expectedDistance: toNumber(record["ระยะทางที่คาดหวัง"]),
    };
}

function renderSummary(records) {
    const validEfficiencyRecords = records.filter(
        (record) => record.liters > 0 && record.distance > 0
    );

    // อัตราสิ้นเปลืองรวม = ระยะทางรวม / ลิตรที่ใช้รวม
    const totalDistance = validEfficiencyRecords.reduce(
        (sum, record) => sum + record.distance,
        0
    );

    const totalLiters = validEfficiencyRecords.reduce(
        (sum, record) => sum + record.liters,
        0
    );

    const averageEfficiency =
        totalLiters > 0
            ? totalDistance / totalLiters
            : 0;

    // ค่าใช้จ่ายของเดือนปัจจุบัน ตามเวลาท้องถิ่นของอุปกรณ์
    const now = new Date();

    const monthlyRecords = records.filter((record) => {
        return (
            record.date &&
            record.date.getFullYear() === now.getFullYear() &&
            record.date.getMonth() === now.getMonth()
        );
    });

    const monthlyExpense = monthlyRecords.reduce(
        (sum, record) => sum + record.totalPrice,
        0
    );

    const efficiencyElement = document.querySelector(
        "#average-efficiency"
    );

    const expenseElement = document.querySelector(
        "#monthly-expense"
    );

    const countElement = document.querySelector(
        "#record-count"
    );

    if (efficiencyElement) {
        efficiencyElement.textContent =
            formatNumber(averageEfficiency);
    }

    if (expenseElement) {
        expenseElement.textContent =
            formatMoney(monthlyExpense);
    }

    if (countElement) {
        countElement.textContent = String(records.length);
    }
}

function renderRecentRecords(records) {
    const container = document.querySelector(
        "#recent-fuel-records"
    );

    if (!container) return;

    // เรียงตามวันที่ใหม่ไปเก่า
    // ถ้าวันที่เท่ากัน ให้รักษาลำดับข้อมูลเดิม
    const sortedRecords = [...records].sort((a, b) => {
        if (!a.date && !b.date) {
            return a.originalIndex - b.originalIndex;
        }

        if (!a.date) return 1;
        if (!b.date) return -1;

        const difference = b.date.getTime() - a.date.getTime();

        return difference !== 0
            ? difference
            : a.originalIndex - b.originalIndex;
    });

    console.log(
        "[Dashboard] Sorted records:",
        sortedRecords.map((record) => ({
            date: formatDate(record.date),
            totalPrice: record.totalPrice,
            originalIndex: record.originalIndex,
        }))
    );

    const recentRecords = sortedRecords.slice(0, 3);

    if (recentRecords.length === 0) {
        container.textContent = "ยังไม่มีรายการเติมน้ำมัน";
        return;
    }

    container.replaceChildren();

    recentRecords.forEach((record) => {
        const efficiency =
            record.liters > 0
                ? record.distance / record.liters
                : 0;

        const costPerKm =
            record.distance > 0
                ? record.totalPrice / record.distance
                : 0;

        const button = document.createElement("button");

        button.type = "button";
        button.dataset.recordId = record.id;

        button.className =
            "w-full rounded-2xl border border-[#F5D77A] " +
            "bg-[#FFFDF3] px-3 py-2 text-left transition " +
            "hover:bg-[#FFF8D9] active:scale-[0.99]";

        // แถวบน: วันที่และยอดเงิน
        const top = document.createElement("div");

        top.className =
            "flex items-center justify-between gap-3";

        const date = document.createElement("span");

        date.className = "text-sm";
        date.textContent = formatDate(record.date);

        const price = document.createElement("span");

        price.className = "text-sm font-bold";
        price.textContent = formatMoney(record.totalPrice);

        top.append(date, price);

        // แถวล่าง: จำนวนลิตร ระยะทาง และอัตราสิ้นเปลือง
        const bottom = document.createElement("div");

        bottom.className =
            "flex items-center justify-between gap-2 " +
            "text-[11px] text-[#C88A58]";

        const left = document.createElement("span");

        left.textContent =
            `${formatNumber(record.liters, 2)} ลิตร · ` +
            `${formatNumber(record.distance, 0)} กม.`;

        const right = document.createElement("span");

        right.className = "text-right";

        right.textContent =
            `${formatNumber(efficiency)} กม./ลิตร · ` +
            `${formatNumber(costPerKm, 2)} บาท/กม.`;

        bottom.append(left, right);
        button.append(top, bottom);
        container.append(button);
    });
}

