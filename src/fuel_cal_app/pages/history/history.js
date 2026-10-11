
export function init() {
    console.log("[History] init!");

    const historyList = document.querySelectorAll("[data-record-id]");

    historyList.forEach((record) => {
        record.addEventListener("click", () => {
            const recordId = record.dataset.recordId;

            console.log("[History] เลือกรายการ:", recordId);

            // TODO: เปิดรายละเอียดรายการเติมน้ำมัน
        });
    });
}