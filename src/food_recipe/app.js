//app.js
import {
    getAllRecords,
    getRecordCacheState,
    refreshRecords,
} from "./services.js";
import {
    hideLoading,
    withLoading,
} from "./loading.js";

const app = document.querySelector("#app");

const pages = {
    recipe: {
        html: "./pages/recipe/recipe.html",
        init: () => import("./pages/recipe/recipe.js")
    },

    random: {
        html: "./pages/random/random.html",
        init: () => import("./pages/random/random.js")
    },

    planner: {
        html: "./pages/planner/planner.html",
        init: () => import("./pages/planner/planner.js")
    }
};

const initialRecordLoad = (async () => {
    const cacheState = getRecordCacheState();

    if (cacheState.records) {
        return cacheState.records;
    }

    return withLoading(getAllRecords(), "กำลังโหลดข้อมูล...");
})();

export async function loadPage(pageName) {
    const page = pages[pageName];

    if (!page) {
        console.error("[App] ไม่พบหน้า:", pageName);
        return;
    }

    try {
        await initialRecordLoad;
    } finally {
        if (getRecordCacheState().records) {
            hideLoading();
        }
    }

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