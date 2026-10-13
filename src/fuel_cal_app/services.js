
const API_BASE_URL =
    "https://personallife-api-webapp-api-backend.onrender.com";

const recordStore = {
    records: null,
    loading: false,
    error: null,
    request: null,
};

function setRecordStoreData(records) {
    recordStore.records = records;
    recordStore.error = null;
}

export async function refreshRecords() {
    recordStore.records = null;
    recordStore.error = null;
    recordStore.request = null;

    return getAllRecords({ forceRefresh: true });
}

export async function getAllRecords(options = {}) {
    const { forceRefresh = false } = options;

    if (!forceRefresh && recordStore.records) {
        return recordStore.records;
    }

    if (recordStore.request) {
        return recordStore.request;
    }

    recordStore.loading = true;
    recordStore.error = null;

    recordStore.request = (async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/records`);

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch fuel records: HTTP ${response.status}`
                );
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error("API response is not an array");
            }

            setRecordStoreData(data);
            return data;
        } catch (error) {
            recordStore.error = error;
            throw error;
        } finally {
            recordStore.loading = false;
            recordStore.request = null;
        }
    })();

    return recordStore.request;
}

export function getRecordCacheState() {
    return {
        records: recordStore.records,
        loading: recordStore.loading,
        error: recordStore.error,
    };
}

export async function getLatestOdometer() {
    const response = await fetch(`${API_BASE_URL}/api/records/latest`);

    if (!response.ok) {
        throw new Error(
            `Failed to fetch latest odometer: HTTP ${response.status}`
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

    const savedRecord = await response.json();

    if (recordStore.records) {
        recordStore.records = [...recordStore.records, record];
    }

    return savedRecord;
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