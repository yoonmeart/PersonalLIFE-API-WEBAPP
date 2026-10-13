//app.js
import { getAllRecords, refreshRecords } from "./services.js";

const app = document.querySelector("#app");

const pages = {
    dashboard: {
        html: "./pages/dashboard/dashboard.html",
        init: () => import("./pages/dashboard/dashboard.js")
    },

    addrecord: {
        html: "./pages/dashboard/addrecord/addrecord.html",
        init: () => import("./pages/dashboard/addrecord/addrecord.js")
    },

    history: {
        html: "./pages/history/history.html",
        init: () => import("./pages/history/history.js")
    },

    stat: {
        html: "./pages/stat/stat.html",
        init: () => import("./pages/stat/stat.js")
    }
};


//loading page

const initialRecordLoad = getAllRecords();

export async function loadPage(pageName) {
    const page = pages[pageName];

    if (!page) {
        console.error("[App] ไม่พบหน้า:", pageName);
        return;
    }

    await initialRecordLoad;

    const response = await fetch(page.html);
    const html = await response.text();

    app.innerHTML = html;

    const module = await page.init();
    module.init();
}

//for navigate

document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-page]");
    if (!button) return;

    const page = button.dataset.page;
    loadPage(page);
});

document.addEventListener("fuel-record:saved", async () => {
    try {
        await refreshRecords();
    } catch (error) {
        console.error("[App] Refresh cache หลังบันทึกไม่สำเร็จ:", error);
    }
});

loadPage("dashboard");