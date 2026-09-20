import {
    generateRandomCharacter ,clearCurrentCharacter
} from "../../randomData.js"
import {
    loadPage
} from "../../app.js"



export function init() {
    clearCurrentCharacter();
    const randomButton = document.querySelector("[data-rand]");

    randomButton.addEventListener("click", () => {

        generateRandomCharacter();

        loadPage("continue");
    });
}