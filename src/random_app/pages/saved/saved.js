import {
    getSavedList
} from "../../randomData.js";


export function init() {
    console.log("saved init!");

    const result = document.querySelector("#result");

    const savedList = getSavedList();

    result.innerHTML = "";

    savedList.forEach((character) => {

        result.innerHTML += `
            <button class="w-[90%] bg-[#FFFBC3] text-center p-4 rounded-2xl text-[#EE988A] border mt-4 flex cursor-pointer hover:scale-105 transition">
                <div class="font-bold">
                    <h1>${character.join(" / ")}</h1>
                </div>
            </button>
        `;

    });
}