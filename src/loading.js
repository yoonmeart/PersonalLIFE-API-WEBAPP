const LOADING_ID = "shared-app-loading";
let loadingCount = 0;

function ensureLoadingScreen() {
    if (typeof document === "undefined") {
        return null;
    }

    let overlay = document.getElementById(LOADING_ID);

    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = LOADING_ID;
        overlay.className =
            "fixed inset-0 z-50 hidden items-center justify-center bg-[#FFF9E9]/85 backdrop-blur-[1px]";
        overlay.innerHTML = `
            <div class="flex w-[90%] max-w-xs flex-col items-center justify-center gap-3 rounded-[28px] border border-[#EE988A]/40 bg-[#FFFBC3] px-6 py-8 shadow-[0_10px_30px_rgba(238,152,138,0.18)]">
                <div class="h-12 w-12 animate-spin rounded-full border-4 border-[#EE988A]/25 border-t-[#EE988A]"></div>
                <p data-loading-message class="text-center text-base font-bold tracking-wide text-[#99512F]">กำลังโหลดข้อมูล...</p>
            </div>
        `;

        const host = document.body || document.documentElement;

        if (host) {
            host.appendChild(overlay);
        }
    }

    return overlay;
}

export function showLoading(message = "กำลังโหลดข้อมูล...") {
    loadingCount += 1;

    const overlay = ensureLoadingScreen();

    if (!overlay) {
        return null;
    }

    const messageNode = overlay.querySelector("[data-loading-message]");

    if (messageNode) {
        messageNode.textContent = message;
    }

    overlay.classList.remove("hidden");
    overlay.classList.add("flex");

    return overlay;
}

export function hideLoading() {
    if (loadingCount > 0) {
        loadingCount -= 1;
    }

    if (loadingCount > 0) {
        return;
    }

    loadingCount = 0;

    const overlay = document.getElementById(LOADING_ID);

    if (overlay) {
        overlay.classList.add("hidden");
        overlay.classList.remove("flex");
    }
}

export function withLoading(task, message = "กำลังโหลดข้อมูล...") {
    showLoading(message);

    try {
        const operation = typeof task === "function" ? task() : task;

        return Promise.resolve(operation).finally(() => hideLoading());
    } catch (error) {
        hideLoading();
        return Promise.reject(error);
    }
}
