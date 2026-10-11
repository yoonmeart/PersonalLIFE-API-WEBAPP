
export function init() {
    console.log("[Stat] init!");

    const chart = document.querySelector("#efficiency-chart");

    if (!chart) {
        console.error("[Stat] ไม่พบ element #efficiency-chart");
        return;
    }

    // Mock data เรียงจากรายการล่าสุด
    const records = [
        { date: "09-15", efficiency: 11.7 },
        { date: "09-01", efficiency: 12.0 },
        { date: "08-18", efficiency: 11.8 }
    ];

    const minEfficiency = Math.min(
        ...records.map((record) => record.efficiency)
    );

    const maxEfficiency = Math.max(
        ...records.map((record) => record.efficiency)
    );

    chart.innerHTML = "";

    records.forEach((record) => {
        const column = document.createElement("div");

        column.className =
            "flex h-full min-w-0 flex-1 flex-col items-center justify-end";

        const value = document.createElement("span");

        value.className = "mb-1 text-[9px]";
        value.textContent = record.efficiency.toFixed(1);

        const barContainer = document.createElement("div");

        barContainer.className =
            "flex h-[45px] w-full items-end";

        const bar = document.createElement("div");

        // ปรับความสูงของแท่งตามค่า efficiency
        const range = maxEfficiency - minEfficiency;

        const height = range === 0
            ? 50
            : 30 + ((record.efficiency - minEfficiency) / range) * 70;

        bar.style.height = `${height}%`;

        bar.className =
            "w-full rounded-t-full bg-[#FFE58A]";

        barContainer.appendChild(bar);

        const date = document.createElement("span");

        date.className = "mt-1 text-[9px] text-[#C88A58]";
        date.textContent = record.date;

        column.append(value, barContainer, date);
        chart.appendChild(column);
    });

    console.log("[Stat] สร้างกราฟเรียบร้อย");
}