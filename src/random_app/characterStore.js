
const STORAGE_KEY = "adopt_random_saved_characters";

// อ่านตัวละครที่บันทึกไว้ทั้งหมด
export function getSavedCharacters() {
    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) {
        return [];
    }

    try {
        const characters = JSON.parse(data);
        return Array.isArray(characters) ? characters : [];
    } catch (error) {
        console.error("Failed to read saved characters:", error);
        return [];
    }
}

// บันทึกตัวละครใหม่

export function saveCharacter(character) {
    if (!Array.isArray(character) || character.length === 0) {
        console.error("Invalid character");
        return false;
    }

    console.log("ก่อนบันทึก:", getSavedCharacters().length);

    const savedCharacters = getSavedCharacters();

    const newCharacter = {
        id: crypto.randomUUID(),
        data: [...character],
        savedAt: new Date().toISOString()
    };

    savedCharacters.push(newCharacter);

    console.log("หลังเพิ่ม:", savedCharacters.length);

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(savedCharacters)
    );

    console.log(
        "จำนวนใน localStorage:",
        getSavedCharacters().length
    );

    return newCharacter;
}

// ลบตัวละครด้วย ID

export function deleteCharacter(id) {
    const savedCharacters = getSavedCharacters();

    const updatedCharacters = savedCharacters.filter(
        character => character.id !== id
    );

    if (updatedCharacters.length === savedCharacters.length) {
        return false;
    }

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedCharacters)
    );

    return true;
}

// ลบตัวละครที่บันทึกไว้ทั้งหมด
export function clearSavedCharacters() {
    localStorage.removeItem(STORAGE_KEY);
}