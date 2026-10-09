
import {
    getSavedCharacters,
    deleteCharacter
} from "../../characterStore.js";

export function init() {
    console.log("[Saved] saved init!");

    const result = document.querySelector("#result");

    if (!result) {
        console.error("[Saved] ไม่พบ element #result");
        return;
    }

    renderSavedCharacters();

    // แสดงรายการตัวละครทั้งหมด
    function renderSavedCharacters() {
        console.log("[Saved] กำลังโหลดรายการตัวละคร");

        const savedList = getSavedCharacters();

        console.log("[Saved] จำนวนตัวละคร:", savedList.length);

        result.innerHTML = "";

        if (savedList.length === 0) {
            result.textContent = "ยังไม่มีตัวละครที่บันทึกไว้";
            return;
        }

        savedList.forEach((character) => {
            const card = document.createElement("button");

            card.type = "button";
            card.className =
                "w-[90%] bg-[#FFFBC3] text-center p-4 rounded-2xl " +
                "text-[#EE988A] border mt-4 flex cursor-pointer " +
                "hover:scale-105 transition";

            card.dataset.characterId = character.id;

            const title = document.createElement("h1");
            title.className = "font-bold";
            title.textContent = character.data.join(" / ");

            card.appendChild(title);
            result.appendChild(card);
        });
    }

    // คลิกการ์ดเพื่อเปิด Confirmation DIV
    result.addEventListener("click", (event) => {
        const card = event.target.closest("[data-character-id]");

        if (!card || !result.contains(card)) {
            return;
        }

        const characterId = card.dataset.characterId;

        console.log("[Saved] คลิกตัวละคร:", characterId);

        showDeleteModal(characterId);
    });

    // สร้าง Confirmation DIV
    function showDeleteModal(characterId) {
        console.log("[Modal] กำลังเปิด Confirmation DIV");
        console.log("[Modal] Character ID:", characterId);

        // ป้องกันการสร้าง Modal ซ้ำ
        if (document.querySelector("#delete-modal")) {
            console.log("[Modal] มี Confirmation DIV อยู่แล้ว");
            return;
        }

        let isConfirming = false;

        const overlay = document.createElement("div");

        overlay.id = "delete-modal";
        overlay.className =
            "fixed inset-0 z-[9999] flex items-center justify-center " +
            "bg-black/60 p-5";

        console.log("[Modal] สร้าง DIV แล้ว:", overlay);

        overlay.innerHTML = `
            <div
                class="w-full max-w-sm rounded-3xl bg-[#FFF9E9] p-6
                       text-center shadow-2xl"
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-modal-title"
            >
                <h2
                    id="delete-modal-title"
                    class="mb-3 text-xl font-bold text-[#EE988A]"
                >
                    Delete Character?
                </h2>

                <p
                    id="delete-modal-warning"
                    class="mb-5 hidden text-sm text-red-600"
                >
                    This cannot be undone.
                </p>

                <div class="flex gap-3">
                    <button
                        id="cancel-delete"
                        type="button"
                        class="flex-1 rounded-full border border-[#EE988A]
                               bg-transparent px-4 py-3 text-[#EE988A]
                               hover:bg-[#FFFBC3]"
                    >
                        Cancel
                    </button>

                    <button
                        id="confirm-delete"
                        type="button"
                        class="flex-1 rounded-full bg-[#EE988A] px-4 py-3
                               text-white hover:opacity-80"
                    >
                        Delete
                    </button>
                </div>
            </div>
        `;

        // เพิ่ม Confirmation DIV เข้า DOM
        document.body.appendChild(overlay);

        console.log("[Modal] เพิ่ม Confirmation DIV เข้า DOM แล้ว");
        console.log(
            "[Modal] Element:",
            document.querySelector("#delete-modal")
        );

        const cancelButton = overlay.querySelector("#cancel-delete");
        const deleteButton = overlay.querySelector("#confirm-delete");
        const warning = overlay.querySelector("#delete-modal-warning");

        // ปิด Modal
        function closeModal() {
            console.log("[Modal] กำลังปิด Confirmation DIV");

            overlay.remove();

            console.log(
                "[Modal] ปิดสำเร็จ:",
                !document.querySelector("#delete-modal")
            );
        }

        // ปุ่ม Cancel
        cancelButton.addEventListener("click", () => {
            console.log("[Modal] กด Cancel");

            closeModal();
        });

        // ปุ่ม Delete และ Confirm Delete
        deleteButton.addEventListener("click", () => {
            console.log("[Modal] กด Delete");
            console.log("[Modal] isConfirming:", isConfirming);

            // ครั้งแรก: แสดงคำเตือน
            if (!isConfirming) {
                isConfirming = true;

                warning.classList.remove("hidden");
                deleteButton.textContent = "Confirm Delete";

                console.log(
                    "[Modal] แสดงคำเตือน: This cannot be undone."
                );

                return;
            }

            // ครั้งที่สอง: ลบตัวละครจริง
            console.log(
                "[Modal] กำลังลบ Character ID:",
                characterId
            );

            try {
                const deleted = deleteCharacter(characterId);

                console.log("[Modal] ลบสำเร็จ:", deleted);

                if (deleted) {
                    closeModal();
                    renderSavedCharacters();
                } else {
                    console.error(
                        "[Modal] ไม่พบตัวละครที่ต้องการลบ:",
                        characterId
                    );
                }
            } catch (error) {
                console.error("[Modal] เกิดข้อผิดพลาดขณะลบ:", error);
            }
        });

        // คลิกพื้นที่มืดด้านนอกเพื่อปิด Modal
        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) {
                console.log("[Modal] คลิกพื้นที่ด้านนอก");

                closeModal();
            }
        });
    }
}