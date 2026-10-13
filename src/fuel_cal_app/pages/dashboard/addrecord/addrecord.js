
import {
    getLatestOdometer,
    createFuelRecord,
} from "../../../services.js";

import {
    calculateDistance,
    calculateFuelPrice,
    calculateExpectedDistance,
} from "../../../data.js";

const DEFAULT_FUEL_TYPE = "E20";
const DEFAULT_CAR_MODEL = "Mitsubishi Mirage";
const EXPECTED_KM_PER_LITER = 18.30;

function toNumber(value) {
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : NaN;
    }

    const number = Number(
        String(value ?? "").replace(/,/g, "").replace(/[^\d.-]/g, "")
    );

    return Number.isFinite(number) ? number : NaN;
}

function setText(selector, value) {
    const element = document.querySelector(selector);

    if (element) {
        element.textContent = value;
    }
}

function formatNumber(value, digits = 2) {
    return new Intl.NumberFormat("th-TH", {
        minimumFractionDigits: 0,
        maximumFractionDigits: digits,
    }).format(value);
}

function formatDateTime(date) {
    const pad = (value) => String(value).padStart(2, "0");

    return (
        `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
        `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    );
}

function getOdometer(record) {
    const value = toNumber(record["เลขไมล์ปัจจุบัน"]);

    return Number.isFinite(value) ? value : NaN;
}

async function getPreviousOdometer(valueOrRecords) {
    // รองรับทั้งกรณีได้รับค่าเลขไมล์ล่าสุดตรงจาก API และกรณีได้รับ array สำหรับข้อมูลเดิม
    if (
        typeof valueOrRecords === "number" ||
        typeof valueOrRecords === "string"
    ) {
        const odometer = toNumber(valueOrRecords);

        return Number.isFinite(odometer) && odometer >= 0 ? odometer : null;
    }

    if (!Array.isArray(valueOrRecords)) {
        return null;
    }

    for (let index = valueOrRecords.length - 1; index >= 0; index -= 1) {
        const odometer = getOdometer(valueOrRecords[index]);

        if (Number.isFinite(odometer) && odometer >= 0) {
            return odometer;
        }
    }

    return null;
}

export function init() {
    const form = document.querySelector("#addrecord-form");

    if (!form) {
        console.error("[AddRecord] ไม่พบฟอร์ม");
        return;
    }

    const currentOdometerInput = form.elements.currentOdometer;
    const litersInput = form.elements.liters;
    const totalPriceInput = form.elements.totalPrice;
    const saveButton = document.querySelector("#save-fuel-record");
    const message = document.querySelector("#addrecord-message");

    let previousOdometer = null;
    let isSaving = false;

    function showMessage(text, isError = false) {
        if (!message) return;

        message.textContent = text;
        message.className = isError
            ? "text-sm text-red-600"
            : "text-sm text-[#99512F]";
    }

    
    function calculatePreview() {
        const currentOdometer = toNumber(currentOdometerInput.value);
        let liters = toNumber(litersInput.value);
        const totalPrice = toNumber(totalPriceInput.value);

        // ต้องมีเลขไมล์ครั้งก่อนก่อนจึงคำนวณได้
        if (
            previousOdometer === null ||
            !Number.isFinite(currentOdometer) ||
            currentOdometer <= previousOdometer ||
            !Number.isFinite(totalPrice) ||
            totalPrice <= 0
        ) {
            setText("#preview-distance", "-");
            setText("#preview-price-per-liter", "-");
            setText("#preview-expected-distance", "-");
            return null;
        }

        // ถ้าไม่ได้กรอกจำนวนลิตร ให้คำนวณจากยอดเงิน
        // และราคาน้ำมันต่อลิตรที่กำหนดไว้
        const DEFAULT_PRICE_PER_LITER = 32.69;

        if (litersInput.value.trim() === "") {
            liters = totalPrice / DEFAULT_PRICE_PER_LITER;
        } else if (!Number.isFinite(liters) || liters <= 0) {
            setText("#preview-distance", "-");
            setText("#preview-price-per-liter", "-");
            setText("#preview-expected-distance", "-");
            return null;
        }

        const distance = calculateDistance(
            currentOdometer,
            previousOdometer
        );

        const pricePerLiter = calculateFuelPrice(totalPrice, liters);

        const expectedDistance = calculateExpectedDistance(
            liters,
            EXPECTED_KM_PER_LITER
        );

        setText("#preview-distance", `${formatNumber(distance, 0)} km`);
        setText(
            "#preview-price-per-liter",
            `${formatNumber(pricePerLiter)} บาท/L`
        );
        setText(
            "#preview-expected-distance",
            `${formatNumber(expectedDistance)} km`
        );

        return {
            currentOdometer,
            previousOdometer,
            distance,
            liters,
            totalPrice,
            pricePerLiter,
            expectedDistance,
        };
    }

    async function loadPreviousOdometer() {
        try {
            const latestOdometerResponse = await getLatestOdometer();
            const latestOdometer =
                latestOdometerResponse &&
                Object.prototype.hasOwnProperty.call(
                    latestOdometerResponse,
                    "เลขไมล์ปัจจุบัน"
                )
                    ? latestOdometerResponse["เลขไมล์ปัจจุบัน"]
                    : null;

            previousOdometer = await getPreviousOdometer(latestOdometer);

            if (previousOdometer === null) {
                setText(
                    "#previous-odometer",
                    "ไม่พบเลขไมล์เดิม กรุณาตรวจสอบข้อมูลใน Google Sheets"
                );

                showMessage(
                    "ไม่สามารถบันทึกได้จนกว่าจะมีเลขไมล์ครั้งก่อน",
                    true
                );

                if (saveButton) saveButton.disabled = true;
                return;
            }

            setText(
                "#previous-odometer",
                `เลขไมล์ครั้งก่อน: ${formatNumber(previousOdometer, 0)} km`
            );

            if (saveButton) saveButton.disabled = false;

            calculatePreview();
        } catch (error) {
            console.error("[AddRecord] โหลดเลขไมล์ไม่สำเร็จ:", error);

            setText("#previous-odometer", "โหลดเลขไมล์ครั้งก่อนไม่สำเร็จ");
            showMessage("ไม่สามารถโหลดข้อมูลจาก API ได้", true);

            if (saveButton) saveButton.disabled = true;
        }
    }

    [
        currentOdometerInput,
        litersInput,
        totalPriceInput,
    ].forEach((input) => {
        input.addEventListener("input", calculatePreview);
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (isSaving) return;

        const result = calculatePreview();

        if (!result) {
            showMessage(
                "กรุณาตรวจสอบเลขไมล์ จำนวนลิตร และยอดเงินให้ถูกต้อง",
                true
            );
            return;
        }

        if (result.currentOdometer <= result.previousOdometer) {
            showMessage(
                "เลขไมล์ปัจจุบันต้องมากกว่าเลขไมล์ครั้งก่อน",
                true
            );
            return;
        }

        isSaving = true;

        if (saveButton) {
            saveButton.disabled = true;
            saveButton.textContent = "กำลังบันทึก...";
        }

        try {
            const record = {
                "วันที่": formatDateTime(new Date()),
                "ประเภทเชื้อเพลิง": DEFAULT_FUEL_TYPE,
                "รุ่นรถ": DEFAULT_CAR_MODEL,
                "เลขไมล์ปัจจุบัน": result.currentOdometer,
                "เลขไมล์ครั้งก่อน": result.previousOdometer,
                "ระยะทาง": result.distance,
                "จำนวนลิตร": result.liters,
                "ราคาน้ำมันต่อลิตร": result.pricePerLiter,
                "ราคารวม": result.totalPrice,
                "ระยะทางที่คาดหวัง": result.expectedDistance,
            };

            await createFuelRecord(record);

            showMessage("บันทึกข้อมูลสำเร็จ");

            // เปลี่ยนกลับ Dashboard ผ่านระบบ navigation เดิม
            document.dispatchEvent(
                new CustomEvent("fuel-record:saved", {
                    detail: record,
                })
            );

            if (typeof window !== "undefined") {
                const dashboardButton = document.querySelector(
                    '[data-page="dashboard"]'
                );

                if (dashboardButton) {
                    dashboardButton.click();
                }
            }
        } catch (error) {
            console.error("[AddRecord] บันทึกไม่สำเร็จ:", error);
            showMessage(
                "บันทึกไม่สำเร็จ: " + error.message,
                true
            );
        } finally {
            isSaving = false;

            if (saveButton) {
                saveButton.disabled = false;
                saveButton.textContent = "บันทึกรายการ";
            }
        }
    });

    loadPreviousOdometer();
}