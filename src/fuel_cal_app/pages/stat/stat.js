
import { getAllRecords } from "../../services.js";

import {
    toNumber,
    toDate,
    formatNumber,
    formatDate,
    median,
    quantile,
    mean,
    sampleStandardDeviation,
    tCritical95,
} from "./stat_util.js";

export function init() {
    console.log("[Statistics] init!");
    loadStatistics();
}

function normalizeRecord(record, index) {
    const liters = toNumber(record["จำนวนลิตร"]);
    const distance = toNumber(record["ระยะทาง"]);
    const totalPrice = toNumber(record["ราคารวม"]);
    const pricePerLiter = toNumber(record["ราคาน้ำมันต่อลิตร"]);
    const rawDate = record["วันที่"];
    const parsedDate = toDate(rawDate);

    return {
        id: index,
        rawDate,
        date: parsedDate,
        liters,
        distance,
        totalPrice,
        pricePerLiter,
        efficiency: liters > 0 && distance > 0
            ? distance / liters
            : null,
    };
}

async function loadStatistics() {
    try {
        const records = await getAllRecords();

        if (!Array.isArray(records)) {
            throw new Error("API response is not an array");
        }

        console.log("[Statistics] Loaded records:", records.length);

        console.table(
            records.map((record) => ({
                sourceDate: record["วันที่"],
                parsedDate:
                    toDate(record["วันที่"])?.toString() ?? "Invalid Date",
            }))
        );

        const normalizedRecords = records
            .map(normalizeRecord)
            .sort((a, b) => {
                if (!a.date && !b.date) return 0;
                if (!a.date) return 1;
                if (!b.date) return -1;

                return b.date.getTime() - a.date.getTime();
            });

        renderStatistics(normalizedRecords);
    } catch (error) {
        console.error("[Statistics] โหลดข้อมูลไม่สำเร็จ:", error);
        renderError();
    }
}


function renderStatistics(records) {
    const allValidRecords = records.filter(
        (record) =>
            record.efficiency !== null &&
            Number.isFinite(record.efficiency) &&
            record.efficiency > 0
    );

    const allEfficiencies = allValidRecords.map(
        (record) => record.efficiency
    );

    // Calculate IQR bounds
    const q1 = allEfficiencies.length
        ? quantile(allEfficiencies, 0.25)
        : null;

    const q3 = allEfficiencies.length
        ? quantile(allEfficiencies, 0.75)
        : null;

    const iqr = q1 !== null && q3 !== null ? q3 - q1 : null;

    const lowerBound = iqr !== null
        ? q1 - 1.5 * iqr
        : null;

    const upperBound = iqr !== null
        ? q3 + 1.5 * iqr
        : null;

    // Exclude outliers from the summary cards
    const validEfficiencies = allValidRecords
        .filter(
            (record) =>
                lowerBound !== null &&
                upperBound !== null &&
                record.efficiency >= lowerBound &&
                record.efficiency <= upperBound
        )
        .map((record) => record.efficiency);

    // Typical efficiency: Median of non-outlier records
    const typicalEfficiency = validEfficiencies.length
        ? median(validEfficiencies)
        : null;

    // Normal range: Q1–Q3 of non-outlier records
    const normalQ1 = validEfficiencies.length
        ? quantile(validEfficiencies, 0.25)
        : null;

    const normalQ3 = validEfficiencies.length
        ? quantile(validEfficiencies, 0.75)
        : null;

    const normalRange =
        normalQ1 !== null && normalQ3 !== null
            ? `${formatNumber(normalQ1)} – ${formatNumber(normalQ3)}`
            : "-";

    // Average fuel price
    const totalLiters = records.reduce(
        (sum, record) => sum + Math.max(0, record.liters),
        0
    );

    const totalFuelCost = records.reduce(
        (sum, record) => sum + Math.max(0, record.totalPrice),
        0
    );

    const averagePrice = totalLiters > 0
        ? totalFuelCost / totalLiters
        : null;

    // Total distance
    const totalDistance = records.reduce(
        (sum, record) => sum + Math.max(0, record.distance),
        0
    );

    // Update summary cards
    setText(
        "#best-efficiency",
        typicalEfficiency === null
            ? "-"
            : formatNumber(typicalEfficiency)
    );

    setText("#worst-efficiency", normalRange);

    setText(
        "#average-price",
        averagePrice === null
            ? "-"
            : formatNumber(averagePrice, 2)
    );

    setText("#total-distance", formatNumber(totalDistance, 0));

    renderEfficiencyChart(records);
    analyzeEfficiency(records);
}

function setText(selector, value) {
    const element = document.querySelector(selector);

    if (element) {
        element.textContent = value;
    }
}

function renderEfficiencyChart(records) {
    const chart = document.querySelector("#efficiency-chart");

    if (!chart) {
        console.error("[Statistics] ไม่พบ element #efficiency-chart");
        return;
    }

    chart.replaceChildren();

    const chartRecords = records
        .filter((record) => record.efficiency !== null && record.date)
        .slice(0, 7)
        .reverse();

    if (chartRecords.length === 0) {
        const message = document.createElement("p");

        message.className =
            "w-full self-center py-4 text-center text-sm text-[#C88A58]";

        message.textContent =
            "ยังไม่มีข้อมูลวันที่และอัตราสิ้นเปลืองที่ใช้สร้างกราฟได้";

        chart.appendChild(message);
        return;
    }

    const maxEfficiency = Math.max(
        ...chartRecords.map((record) => record.efficiency)
    );

    chartRecords.forEach((record) => {
        const column = document.createElement("div");

        column.className =
            "flex min-w-0 flex-1 flex-col items-center justify-end gap-2";

        const value = document.createElement("span");

        value.className = "text-[10px] font-bold text-[#99512F]";
        value.textContent = formatNumber(record.efficiency);

        const barWrapper = document.createElement("div");

        barWrapper.className =
            "flex h-28 w-full items-end justify-center";

        const bar = document.createElement("div");

        const height = maxEfficiency > 0
            ? Math.max(8, (record.efficiency / maxEfficiency) * 100)
            : 8;

        bar.className =
            "w-full max-w-8 rounded-t-lg bg-[#EE988A] transition-all";

        bar.style.height = `${height}%`;
        bar.title = `${formatNumber(record.efficiency)} กม./ลิตร`;

        const date = document.createElement("span");

        date.className =
            "whitespace-nowrap text-[10px] text-[#C88A58]";

        date.textContent = formatDate(record.date);
        date.title = `วันที่จากชีต: ${record.rawDate ?? "-"}`;

        barWrapper.appendChild(bar);
        column.append(value, barWrapper, date);
        chart.appendChild(column);
    });
}

function renderError() {
    [
        "#best-efficiency",
        "#worst-efficiency",
        "#average-price",
        "#total-distance",
        "#median-efficiency",
        "#quartiles",
        "#iqr-bounds",
        "#efficiency-ci",
        "#outlier-count",
    ].forEach((selector) => setText(selector, "-"));

    setText(
        "#statistics-note",
        "โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
    );

    const chart = document.querySelector("#efficiency-chart");

    if (chart) {
        chart.replaceChildren();

        const message = document.createElement("p");

        message.className =
            "w-full self-center py-4 text-center text-sm text-[#C88A58]";

        message.textContent =
            "โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";

        chart.appendChild(message);
    }

    renderOutlierList([]);
}

function analyzeEfficiency(records) {
    const validRecords = records.filter(
        (record) =>
            record.efficiency !== null &&
            Number.isFinite(record.efficiency) &&
            record.efficiency > 0
    );

    const values = validRecords.map((record) => record.efficiency);

    if (values.length === 0) {
        setText("#median-efficiency", "-");
        setText("#quartiles", "-");
        setText("#iqr-bounds", "-");
        setText("#efficiency-ci", "-");
        setText("#outlier-count", "0");
        setText("#statistics-note", "ยังไม่มีข้อมูลเพียงพอ");

        renderOutlierList([]);
        return;
    }

    const q1 = quantile(values, 0.25);
    const q3 = quantile(values, 0.75);
    const med = median(values);
    const average = mean(values);
    const sd = sampleStandardDeviation(values);

    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const analyzedRecords = validRecords.map((record) => {
        const reasons = [];
        const value = record.efficiency;

        if (value < lowerBound || value > upperBound) {
            reasons.push("อยู่นอกขอบเขต IQR");
        }

        const zScore = sd !== null && sd > 0
            ? (value - average) / sd
            : null;

        if (zScore !== null && Math.abs(zScore) >= 3) {
            reasons.push("Z-score มีค่าสูงกว่า 3 ในค่าสัมบูรณ์");
        }

        return { ...record, reasons, zScore };
    });

    const outliers = analyzedRecords.filter(
        (record) => record.reasons.length > 0
    );

    const cleanValues = analyzedRecords
        .filter(
            (record) =>
                record.efficiency >= lowerBound &&
                record.efficiency <= upperBound
        )
        .map((record) => record.efficiency);

    let ciText = "ข้อมูลไม่เพียงพอ";

    if (cleanValues.length >= 2) {
        const cleanMean = mean(cleanValues);
        const cleanSD = sampleStandardDeviation(cleanValues);
        const critical = tCritical95(cleanValues.length - 1);
        const margin = critical * cleanSD / Math.sqrt(cleanValues.length);

        ciText =
            `${formatNumber(cleanMean - margin)} – ` +
            `${formatNumber(cleanMean + margin)} กม./ลิตร`;
    }

    setText("#median-efficiency", formatNumber(med));
    setText(
        "#quartiles",
        `${formatNumber(q1)} / ${formatNumber(q3)}`
    );

    setText(
        "#iqr-bounds",
        `${formatNumber(lowerBound)} – ${formatNumber(upperBound)}`
    );

    setText("#efficiency-ci", ciText);
    setText("#outlier-count", String(outliers.length));

    setText(
        "#statistics-note",
        `วิเคราะห์ได้ ${values.length} รายการ พบค่าที่ควรตรวจสอบ ` +
        `${outliers.length} รายการ รายการเหล่านี้ไม่ได้ถูกลบจากข้อมูลต้นฉบับ`
    );

    renderOutlierList(outliers);
}

function renderOutlierList(records) {
    const container = document.querySelector("#outlier-list");

    if (!container) return;

    container.replaceChildren();

    if (records.length === 0) {
        const message = document.createElement("p");

        message.className = "text-xs text-[#C88A58]";
        message.textContent = "ไม่พบค่าที่อยู่นอกเกณฑ์ที่ตั้งไว้";

        container.appendChild(message);
        return;
    }

    records.forEach((record) => {
        const item = document.createElement("div");

        item.className =
            "rounded-xl border border-[#F5D77A] px-3 py-2 text-xs";

        const date = document.createElement("p");

        date.className = "font-bold";
        date.textContent = formatDate(record.date);

        const efficiency = document.createElement("p");

        efficiency.className = "mt-1";
        efficiency.textContent =
            `${formatNumber(record.efficiency)} กม./ลิตร`;

        const reason = document.createElement("p");

        reason.className = "mt-1 text-[#C88A58]";
        reason.textContent = record.reasons.join(" · ");

        const sourceDate = document.createElement("p");

        sourceDate.className = "mt-1 text-[#C88A58]";
        sourceDate.textContent =
            `วันที่ต้นฉบับ: ${record.rawDate ?? "-"}`;

        item.append(date, efficiency, reason, sourceDate);
        container.appendChild(item);
    });
}