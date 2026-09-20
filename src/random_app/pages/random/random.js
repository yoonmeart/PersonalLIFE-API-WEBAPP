import {
    generateRandomCharacter
} from "../../randomData.js"
import {
    loadPage
} from "../../app.js"



export function init() {
    console.log("random init!");
    const randomButton = document.querySelector("[data-rand]");

    randomButton.addEventListener("click", () => {

        generateRandomCharacter();

        loadPage("continue");
    });
}