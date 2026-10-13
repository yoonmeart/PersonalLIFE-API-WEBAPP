
const API_BASE_URL =
    "https://personallife-api-webapp-api-backend.onrender.com";

export async function getAllRecords() {
    const response = await fetch(`${API_BASE_URL}/api/records`);

    if (!response.ok) {
        throw new Error(
            `Failed to fetch fuel records: HTTP ${response.status}`
        );
    }

    return await response.json();
}

export async function checkAPIHealth() {
    const response = await fetch(`${API_BASE_URL}/api/health`);

    if (!response.ok) {
        throw new Error(
            `Backend health check failed: HTTP ${response.status}`
        );
    }

    return await response.json();
}


export async function createFuelRecord(record) {
    const response = await fetch(`${API_BASE_URL}/api/records`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(record),
    });

    if (!response.ok) {
        const message = await response.text();

        throw new Error(
            `Failed to save fuel record: HTTP ${response.status} ${message}`
        );
    }

    return await response.json();
}