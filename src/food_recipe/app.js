
import { withLoading } from "../loading.js";

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

export async function loadPage(pageName) {
    const page = pages[pageName];

    if (!page) {
        console.error("[App] ไม่พบหน้า:", pageName);
        return;
    }

    return withLoading(async () => {
        try {
            const response = await fetch(page.html);

            if (!response.ok) {
                throw new Error(
                    `โหลดหน้าไม่สำเร็จ: ${page.html} (${response.status})`
                );
            }

            const html = await response.text();

            app.innerHTML = html;

            const module = await page.init();

            if (typeof module.init === "function") {
                await module.init();
            }
        } catch (error) {
            console.error("[App] เกิดข้อผิดพลาดขณะโหลดหน้า:", error);
            throw error;
        }
    }, "กำลังโหลดหน้า...");
}

// Navigation
document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-page]");

    if (!button) return;

    loadPage(button.dataset.page).catch(() => {
        // Error has already been logged in loadPage().
    });
});

// Initial page
loadPage("recipe").catch(() => {
    // Error has already been logged in loadPage().
});
