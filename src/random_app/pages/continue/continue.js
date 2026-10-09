
import {
    generateRandomCharacter,
    getCurrentCharacter
} from "../../randomData.js";

import {
    saveCharacter
} from "../../characterStore.js";

import {
    loadPage
} from "../../app.js";

export function init() {
    console.log("continue init!");

    const randomButton = document.querySelector("[data-rand]");
    const sentButton = document.querySelector("#sent_button");
    const result = document.querySelector("#result");

    const char = getCurrentCharacter();

    if (char) {
        result.textContent = char.join(" / ");
    }

    randomButton.addEventListener("click", () => {
        generateRandomCharacter();

        const char = getCurrentCharacter();
        result.textContent = char.join(" / ");
    });

    sentButton.addEventListener("click", () => {
        console.log("กดปุ่มบันทึกแล้ว");

        const character = getCurrentCharacter();

        console.log("ข้อมูลที่จะบันทึก:", character);

        const saved = saveCharacter(character);

        if (saved) {
            console.log("บันทึกสำเร็จ:", saved);
            loadPage("saved");
        } else {
            console.log("บันทึกไม่สำเร็จ");
        }
    });
}