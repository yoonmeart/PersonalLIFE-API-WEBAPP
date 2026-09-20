import {
    generateRandomCharacter, getCurrentCharacter
} from "../../randomData.js"
import {
    loadPage
} from "../../app.js"



export function init() {
    console.log("random init!");
    const randomButton = document.querySelector("[data-rand]");
    const sentButton = document.querySelector("#sent_button") ;

    const result = document.querySelector("#result");

    const char = getCurrentCharacter();
    result.textContent= char.join(" / ");

    randomButton.addEventListener("click", () => {

        generateRandomCharacter();

        const char = getCurrentCharacter();
        result.textContent= char.join(" / ");

    });

    sentButton.addEventListener("click", () => {
        loadPage("saved");
    })
}

