//app.js
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

export async  function loadPage(pageName) {
    const page = pages[pageName];

    const response = await fetch(page.html);
    const html = await response.text();

    app.innerHTML = html;

    const module = await page.init(); //import as module

    module.init(); //use function in module  
}

//for navigate

document.addEventListener("click" , (event) => {
    const button = event.target.closest("[data-page]");
    if(!button) return;

    const page = button.dataset.page;
    loadPage(page);

});

loadPage("dashboard");