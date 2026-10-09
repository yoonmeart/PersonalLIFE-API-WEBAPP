
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

    let isSaving = false;

    // แสดงตัวละคร โดยแยกแต่ละหัวข้อเป็นคนละบรรทัด
    
function renderCharacter(character) {
    result.innerHTML = "";

    if (!Array.isArray(character) || character.length === 0) {
        result.textContent = "ยังไม่มีข้อมูลตัวละคร";
        return;
    }

    const groupedCharacter = {};

    character.forEach((item) => {
        // แยกชื่อหัวข้อและรายละเอียด
        const separatorIndex = item.indexOf(":");

        if (separatorIndex === -1) {
            // กรณีข้อมูลไม่มีชื่อหัวข้อ
            if (!groupedCharacter["ข้อมูลเพิ่มเติม"]) {
                groupedCharacter["ข้อมูลเพิ่มเติม"] = [];
            }

            groupedCharacter["ข้อมูลเพิ่มเติม"].push(item);
            return;
        }

        const title = item.slice(0, separatorIndex).trim();
        const value = item.slice(separatorIndex + 1).trim();

        if (!groupedCharacter[title]) {
            groupedCharacter[title] = [];
        }

        groupedCharacter[title].push(value);
    });

    // แสดงผลแต่ละหัวข้อ โดยรวมรายละเอียดไว้ในบรรทัดเดียวกัน
    Object.entries(groupedCharacter).forEach(([title, values]) => {
        const line = document.createElement("div");

        line.className = "w-full text-left";
        line.textContent = `${title}: ${values.join(", ")}`;

        result.appendChild(line);
    });
}

    // แสดงข้อมูลตัวละครปัจจุบันเมื่อเปิดหน้า
    const character = getCurrentCharacter();

    renderCharacter(character);

    // ปุ่มสุ่มข้อมูลเพิ่ม
    randomButton.addEventListener("click", () => {
        generateRandomCharacter();

        const character = getCurrentCharacter();

        renderCharacter(character);
    });

    // ปุ่มบันทึกตัวละคร
    sentButton.addEventListener("click", () => {
        // ป้องกันการกดซ้ำ
        if (isSaving) return;

        isSaving = true;
        sentButton.disabled = true;

        console.log("กดปุ่มบันทึกแล้ว");

        try {
            const character = getCurrentCharacter();

            console.log("ข้อมูลที่จะบันทึก:", character);

            const saved = saveCharacter(character);

            if (saved) {
                console.log("บันทึกสำเร็จ:", saved);

                loadPage("saved");
            } else {
                console.log("บันทึกไม่สำเร็จ");

                isSaving = false;
                sentButton.disabled = false;
            }
        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการบันทึก:", error);

            isSaving = false;
            sentButton.disabled = false;
        }
    });
}