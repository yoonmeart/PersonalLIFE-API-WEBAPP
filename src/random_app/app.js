const app = document.querySelector("#app");


const pages = {
    random: {
        html: "./pages/random/random.html",
        init: () => import("./pages/random/random.js")
    },

    continue: {
        html: "./pages/continue/continue.html",
        init: () => import("./pages/continue/continue.js")
    },

    saved: {
        html: "./pages/saved/saved.html",
        init: () => import("./pages/saved/saved.js")
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

loadPage("random");