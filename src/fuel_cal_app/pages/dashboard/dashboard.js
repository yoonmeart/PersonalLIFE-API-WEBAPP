
export function init() {
    console.log("[Dashboard] init!");

    // ป้องกันกรณีโหลด HTML ไม่ครบ
    const dashboard = document.querySelector("[data-dashboard]");

    if (!dashboard) {
        console.log("[Dashboard] ใช้พื้นที่ Dashboard ที่โหลดเข้ามา");
    }

    // ปุ่มเพิ่มรายการเติมน้ำมัน
    const addFuelButton = document.querySelector('[data-action="add-fuel"]');

    if (addFuelButton) {
        addFuelButton.addEventListener("click", () => {
            console.log("[Dashboard] กด Add Fuel Record");

            // TODO: เปิดหน้า/Modal สำหรับเพิ่มข้อมูลเติมน้ำมัน
        });
    }

    // คลิกรายการเติมน้ำมัน
    const recordButtons = document.querySelectorAll("[data-record-id]");

    recordButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const recordId = button.dataset.recordId;

            console.log("[Dashboard] เลือกรายการ:", recordId);

            // TODO: แสดงรายละเอียดรายการเติมน้ำมัน
        });
    });

    // ไปหน้า History
    const historyButton = document.querySelector('[data-page="history"]');

    if (historyButton) {
        historyButton.addEventListener("click", () => {
            console.log("[Dashboard] ไปหน้า History");

            // TODO:
            // ถ้า app.js จัดการ data-page อยู่แล้ว
            // ไม่จำเป็นต้องเรียก loadPage() ซ้ำที่นี่
        });
    }
}