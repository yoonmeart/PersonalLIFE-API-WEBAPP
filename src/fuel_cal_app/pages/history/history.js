
import { getAllRecords } from "../../services.js";

export function init() {
    console.log("[History] init!");

    const historyList = document.querySelector("#history-list");

    if (!historyList) {
        console.error("[History] ไม่พบ element #history-list");
        return;
    }

    // ใช้ Event Delegation สำหรับรายการที่สร้างด้วย JavaScript
    historyList.addEventListener("click", (event) => {
        const button = event.target.closest("[data-record-id]");

        if (!button) return;

        console.log(
            "[History] เลือกรายการ:",
            button.dataset.recordId
        );

        // TODO: เปิดหน้ารายละเอียดรายการเติมน้ำมัน
    });

    loadHistory();
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

    // รองรับ YYYY-MM-DD และ YYYY-MM-DD HH:mm:ss
    const isoMatch = text.match(
        /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/
    );

    if (isoMatch) {
        const [
            ,
            year,
            month,
            day,
            hour = "0",
            minute = "0",
            second = "0",
        ] = isoMatch;

        return createValidDate(
            Number(year),
            Number(month),
            Number(day),
            Number(hour),
            Number(minute),
            Number(second)
        );
    }

    // รองรับ D/M/YYYY, HH:mm:ss
    const localMatch = text.match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:,\s*(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/
    );

    if (localMatch) {
        const [
            ,
            day,
            month,
            year,
            hour = "0",
            minute = "0",
            second = "0",
        ] = localMatch;

        return createValidDate(
            Number(year),
            Number(month),
            Number(day),
            Number(hour),
            Number(minute),
            Number(second)
        );
    }

    // รูปแบบอื่นที่ JavaScript รองรับ
    const date = new Date(text);

    return Number.isNaN(date.getTime()) ? null : date;
}

function createValidDate(year, month, day, hour, minute, second) {
    const date = new Date(
        year,
        month - 1,
        day,
        hour,
        minute,
        second
    );

    // ป้องกันวันที่ผิด เช่น 31 กุมภาพันธ์ ถูกเลื่อนไปเดือนถัดไป
    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }

    return date;
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
        maximumFractionDigits: 2,
    }).format(value);
}

function formatNumber(value, digits = 1) {
    return new Intl.NumberFormat("th-TH", {
        maximumFractionDigits: digits,
    }).format(value);
}

function normalizeRecord(record, index) {
    return {
        id: String(index),
        date: toDate(record["วันที่"]),
        fuelType: record["ประเภทเชื้อเพลิง"] ?? "-",
        liters: toNumber(record["จำนวนลิตร"]),
        distance: toNumber(record["ระยะทาง"]),
        totalPrice: toNumber(record["ราคารวม"]),
        pricePerLiter: toNumber(record["ราคาน้ำมันต่อลิตร"]),
    };
}

async function loadHistory() {
    const container = document.querySelector("#history-list");

    if (!container) return;

    try {
        const records = await getAllRecords();

        if (!Array.isArray(records)) {
            throw new Error("API response is not an array");
        }

        console.log("[History] Loaded records:", records.length);

        const sortedRecords = records
            .map((record, index) => normalizeRecord(record, index))
            .sort((a, b) => {
                if (!a.date && !b.date) return 0;
                if (!a.date) return 1;
                if (!b.date) return -1;

                return b.date.getTime() - a.date.getTime();
            });

        renderHistory(sortedRecords);
    } catch (error) {
        console.error("[History] โหลดประวัติไม่สำเร็จ:", error);

        container.replaceChildren();

        const message = document.createElement("p");
        message.className =
            "py-4 text-center text-sm text-[#C88A58]";
        message.textContent =
            "โหลดประวัติไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";

        container.appendChild(message);
    }
}

function renderHistory(records) {
    const container = document.querySelector("#history-list");

    if (!container) return;

    container.replaceChildren();

    if (records.length === 0) {
        const message = document.createElement("p");
        message.className =
            "py-4 text-center text-sm text-[#C88A58]";
        message.textContent = "ยังไม่มีรายการเติมน้ำมัน";

        container.appendChild(message);
        return;
    }

    records.forEach((record) => {
        const efficiency =
            record.liters > 0 && record.distance > 0
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
            "active:scale-[0.99] hover:bg-[#FFF8D9]";

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
        container.appendChild(button);
    });
}

