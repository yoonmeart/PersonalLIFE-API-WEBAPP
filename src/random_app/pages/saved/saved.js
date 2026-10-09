
import {
    getSavedCharacters
} from "../../characterStore.js";

export function init() {
    console.log("saved init!");

    const result = document.querySelector("#result");

    const savedList = getSavedCharacters();

    result.innerHTML = "";

    if (savedList.length === 0) {
        result.textContent = "ยังไม่มีตัวละครที่บันทึกไว้";
        return;
    }

    savedList.forEach((character) => {
        result.innerHTML += `
            <button
                class="w-[90%] bg-[#FFFBC3] text-center p-4 rounded-2xl text-[#EE988A] border mt-4 flex cursor-pointer hover:scale-105 transition"
                data-character-id="${character.id}"
            >
                <div class="font-bold">
                    <h1>${character.data.join(" / ")}</h1>
                </div>
            </button>
        `;
    });
}