// API service layer for EndoCare backend integration
// Base URL for the ngrok tunnel
const API_BASE_URL = "https://e40dbaa9a15f.ngrok-free.app"; // ngrok tunnel to backend server

// Type definitions for API requests (from backend engineer)
export type InsertSleepRequest = {
    date: string;        // ISO 8601 format (e.g., "2025-08-02T10:00:00Z")
    duration: number;    // in hours, e.g., 7.5
    quality: number;     // 0–10
    disruptions: string; // description of any disturbances
    notes: string;
};

export type InsertDietRequest = {
    meal: string;        // e.g., "breakfast", "dinner"
    date: string;        // ISO 8601 format
    items: string[];     // e.g., ["eggs", "toast"]
    notes: string;
};

export type InsertMenstrualRequest = {
    period_event: string; // e.g., "start" or "end"
    date: string;         // ISO 8601 format
    flow_level: string;   // e.g., "light", "moderate", "heavy"
    notes: string;
};

export type InsertSymptomsRequest = {
    date: string;     // ISO 8601 format
    nausea: number;   // 0–10 scale
    fatigue: number;  // 0–10 scale
    pain: number;     // 0–10 scale
    notes: string;
};

// API Response types (from backend engineer)
export type SleepEntry = {
    id: number;
    date: string; // ISO 8601 timestamp
    duration: number; // in hours
    quality: number; // 1 - 10
    disruptions: string; // e.g., "2 awakenings"
    notes: string;
};

export type DietEntry = {
    id: number;
    meal: string; // e.g., "breakfast", "lunch", etc.
    date: string; // ISO 8601 timestamp
    items: string[]; // array of food items
    notes: string;
};

export type MenstrualEntry = {
    id: number;
    period_event: "start" | "end"; // if your data is normalized like this
    date: string; // ISO 8601 timestamp
    flow_level: string; // low, heavy etc
    notes: string;
};

export type SymptomEntry = {
    id: number;
    date: string; // ISO 8601 timestamp
    nausea: number; // 0–10 scale
    fatigue: number; // 0–10 scale
    pain: number; // 0–10 scale
    notes: string;
};

// List types
export type SleepList = SleepEntry[];
export type DietList = DietEntry[];
export type MenstrualList = MenstrualEntry[];
export type SymptomList = SymptomEntry[];

// Custom API Error class for better error handling
export class ApiError extends Error {
    constructor(
        public endpoint: string,
        public status: number,
        public body: string,
        public isRetryable: boolean = false
    ) {
        super(`API Error: ${status} on ${endpoint}`);
        this.name = "ApiError";
    }
}

// Legacy interface for backward compatibility
export interface ApiErrorInterface {
    message: string;
    status?: number;
}

// React Native compatible timeout implementation
// AbortSignal.timeout() is not available in React Native, so we create our own
function createTimeoutSignal(timeoutMs: number): AbortSignal {
    const controller = new AbortController();

    // Set up timeout to abort the request
    const timeout = setTimeout(() => {
        controller.abort();
    }, timeoutMs);

    // Clean up timeout when request completes to prevent memory leaks
    // This ensures the timeout doesn't fire after a successful/failed request
    const cleanup = () => clearTimeout(timeout);
    controller.signal.addEventListener("abort", cleanup);

    return controller.signal;
}

// Enhanced API fetch with retry logic and exponential backoff
async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {},
    maxRetries: number = 3
): Promise<T> {
    const delays = [500, 1000, 2000]; // Exponential backoff: 500ms, 1s, 2s
    const fullUrl = `${API_BASE_URL}${endpoint}`;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const startTime = Date.now();
        const method = options.method || "GET";

        try {
            // Log request attempt
            if (attempt === 0) {
                console.log(`[api] ${method} ${endpoint}`);
            } else {
                console.log(`[api] ${method} ${endpoint} (attempt ${attempt + 1}/${maxRetries + 1})`);
            }

            const response = await fetch(fullUrl, {
                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true", // Skip ngrok browser warning
                    "Accept": "application/json",
                    ...options.headers,
                },
                // Add timeout for mobile networks (React Native compatible)
                signal: createTimeoutSignal(10000), // 10 second timeout
                ...options,
            });

            const duration = Date.now() - startTime;

            if (response.ok) {
                console.log(`[api] ${method} ${endpoint} → ${response.status} (${duration}ms)`);
                const data = await response.json();
                return data;
            }

            // Get error response body
            let errorBody = "";
            try {
                errorBody = await response.text();
            } catch (e) {
                errorBody = `Could not read response body: ${e instanceof Error ? e.message : "Unknown error"}`;
            }

            // Determine if error is retryable
            const isRetryable = response.status >= 500 ||
                errorBody.includes("conn closed") ||
                errorBody.includes("timeout") ||
                errorBody.includes("ECONNRESET");

            // Don't retry on 4xx errors (client errors)
            if (response.status >= 400 && response.status < 500) {
                console.log(`[api] ${method} ${endpoint} → ${response.status} (${duration}ms) - Client error, not retrying`);
                throw new ApiError(endpoint, response.status, errorBody, false);
            }

            // If this is the last attempt, throw the error
            if (attempt === maxRetries) {
                console.log(`[api] ${method} ${endpoint} → ${response.status} (${duration}ms) - Max retries reached`);
                throw new ApiError(endpoint, response.status, errorBody, isRetryable);
            }

            // Log retry attempt
            if (isRetryable) {
                console.log(`[api] ${method} ${endpoint} → ${response.status} (retry ${attempt + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delays[attempt]));
                continue;
            } else {
                throw new ApiError(endpoint, response.status, errorBody, false);
            }

        } catch (error) {
            const duration = Date.now() - startTime;

            // If it's already an ApiError, re-throw it
            if (error instanceof ApiError) {
                throw error;
            }

            // Handle network errors (fetch failures)
            if (attempt === maxRetries) {
                console.log(`[api] ${method} ${endpoint} → Network Error (${duration}ms) - Max retries reached`);
                throw new ApiError(endpoint, 0, error instanceof Error ? error.message : "Unknown error", true);
            }

            // Retry network errors
            console.log(`[api] ${method} ${endpoint} → Network Error (retry ${attempt + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delays[attempt]));
        }
    }

    // This should never be reached, but TypeScript requires it
    throw new ApiError(endpoint, 0, "Unexpected error in retry loop", true);
}

// Legacy apiCall function for backward compatibility - now uses apiFetch
async function apiCall<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    return apiFetch<T>(endpoint, options, 3);
}

// ============================================================================
// SLEEP API FUNCTIONS
// ============================================================================

export async function insertSleep(sleepData: InsertSleepRequest): Promise<SleepEntry> {
    return await apiCall<SleepEntry>("/insert_sleep", {
        method: "POST",
        body: JSON.stringify(sleepData),
    });
}

export async function getAllSleep(): Promise<SleepList> {
    const result = await apiCall<SleepList | null>("/get_all_sleep");
    return result || []; // Handle null response by returning empty array
}

// ============================================================================
// DIET API FUNCTIONS
// ============================================================================

export async function insertDiet(dietData: InsertDietRequest): Promise<DietEntry> {
    return await apiCall<DietEntry>("/insert_diet", {
        method: "POST",
        body: JSON.stringify(dietData),
    });
}

export async function getAllDiet(): Promise<DietList> {
    const result = await apiCall<DietList | null>("/get_all_diet");
    return result || []; // Handle null response by returning empty array
}

// ============================================================================
// MENSTRUAL API FUNCTIONS
// ============================================================================

export async function insertMenstrual(menstrualData: InsertMenstrualRequest): Promise<MenstrualEntry> {
    return await apiCall<MenstrualEntry>("/insert_menstrual", {
        method: "POST",
        body: JSON.stringify(menstrualData),
    });
}

export async function getAllMenstrual(): Promise<MenstrualList> {
    const result = await apiCall<MenstrualList | null>("/get_all_menstrual");
    return result || []; // Handle null response by returning empty array
}

// ============================================================================
// SYMPTOMS API FUNCTIONS
// ============================================================================

export async function insertSymptoms(symptomsData: InsertSymptomsRequest): Promise<SymptomEntry> {
    return await apiCall<SymptomEntry>("/insert_symptoms", {
        method: "POST",
        body: JSON.stringify(symptomsData),
    });
}

export async function getAllSymptoms(): Promise<SymptomList> {
    const result = await apiCall<SymptomList | null>("/get_all_symptoms");
    return result || []; // Handle null response by returning empty array
}

// ============================================================================
// TRIGGER SEVERITY API FUNCTIONS
// ============================================================================

// Import trigger types for response structure
import type { FindTriggersResponse } from "../types/TriggerTypes";

/**
 * Fetch trigger severity data for heatmap visualization
 * CUSTOMIZATION POINT: Adjust endpoint URL if backend changes
 *
 * @returns Promise<FindTriggersResponse> - Trigger data with severity scores by date
 * @throws ApiError if request fails or response is invalid
 */
export async function fetchTriggers(): Promise<FindTriggersResponse> {
    console.log("[api] Fetching trigger severity data...");

    try {
        const result = await apiCall<FindTriggersResponse>("/find_triggers", {
            method: "GET",
        });

        console.log("[api] Trigger data fetched successfully");
        return result;
    } catch (error) {
        console.error("[api] Failed to fetch trigger data:", error);
        throw error;
    }
}

export async function fetchRecommendations(): Promise<string[]> {
    console.log("[api] Fetching recommendations...");

    try {
        const result = await apiCall<string>("/recommendations", {
            method: "GET",
        });

        // Parse the result as an array of strings
        const recommendations: string[] = Array.isArray(result) ? result : [result];
        console.log("[api] Recommendations fetched successfully:", recommendations);
        return recommendations;
    } catch (error) {
        console.error("[api] Failed to fetch recommendations:", error);
        throw error;
    }
}

interface sevenDayAverage {
    average_fatigue: number; // 0-10 scale
    average_nausea: number; // 0-10 scale
    average_pain: number; // 0-10 scale
}

export async function fetchSevenDayAverage(): Promise<sevenDayAverage> {
    console.log("[api] Fetching 7-day symptom averages...");

    try {
        const result = await apiCall<sevenDayAverage>("/seven_day_average", {
            method: "GET",
        });

        console.log("[api] 7-day averages fetched successfully:", result);
        return result;
    } catch (error) {
        console.error("[api] Failed to fetch 7-day averages:", error);
        throw error;
    }
}

interface TriggerDetail {
    date: string; // ISO date string, e.g., "2025-08-11"
    trigger_severity: number;
}

interface CategoryWithCountsAndDetails {
    counts: Record<string, number>;
    details: Record<string, TriggerDetail[]>;
}

interface LowSleepHours {
    count: number;
    details: TriggerDetail[];
}

interface TriggerSummary {
    common_food_items: CategoryWithCountsAndDetails;
    flow_levels: CategoryWithCountsAndDetails;
    low_sleep_hours: LowSleepHours;
    menstrual_events: CategoryWithCountsAndDetails;
    standard_deviation: number;
    symptom_average: number;
    symptom_spike_threshold: number;
}
export async function fetchTriggerSummary(): Promise<TriggerSummary> {
    console.log("[api] Fetching trigger summary...");

    try {
        const result = await apiCall<TriggerSummary>("/find_triggers", {
            method: "GET",
        });

        console.log("[api] Trigger summary fetched successfully:", result);
        return result;
    } catch (error) {
        console.error("[api] Failed to fetch trigger summary:", error);
        throw error;
    }
}

interface flareupPrediction {
    flareup_predictions: string[];
    flareup_probability: number; // 1-100
}

export const fetchFlareupPrediction = async (): Promise<flareupPrediction> => {
    console.log("[api] Fetching flareup prediction...");

    try {
        const result = await apiCall<flareupPrediction>("/predict_flareups", {
            method: "GET",
        });

        console.log("[api] Flareup prediction fetched successfully:", result);
        return result;
    } catch (error) {
        console.error("[api] Failed to fetch flareup prediction:", error);
        throw error;
    }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Health check with GET request and retry logic
// HEAD requests often fail with ngrok, so we use GET but ignore the response body
export async function pingBackend(): Promise<boolean> {
    const maxRetries = 2;
    const delays = [500, 1000]; // 500ms, 1s backoff

    console.log("[api] Backend health check...");

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const startTime = Date.now();

        try {
            // Use GET instead of HEAD for better ngrok compatibility
            // Pass 0 retries to apiFetch since we handle retries here
            const response = await fetch(`${API_BASE_URL}/get_all_sleep`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true",
                    "Accept": "application/json",
                },
                // Use shorter timeout for health check (2 seconds)
                signal: createTimeoutSignal(2000),
            });

            const duration = Date.now() - startTime;

            if (response.ok) {
                console.log(`[api] GET /get_all_sleep → ${response.status} (${duration}ms)`);
                console.log("[api] Backend health check ✅");
                return true;
            } else {
                // Server responded but with error status
                if (attempt < maxRetries) {
                    console.log(`[api] GET /get_all_sleep → ${response.status} (retry ${attempt + 1}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, delays[attempt]));
                    continue;
                } else {
                    console.log(`[api] GET /get_all_sleep → ${response.status} (${duration}ms)`);
                    console.log("[api] Backend health check ❌: Server error");
                    return false;
                }
            }
        } catch (error) {
            const duration = Date.now() - startTime;

            if (attempt < maxRetries) {
                console.log(`[api] GET /get_all_sleep → Network Error (retry ${attempt + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delays[attempt]));
                continue;
            } else {
                console.log(`[api] GET /get_all_sleep → Network Error (${duration}ms)`);
                console.log("[api] Backend health check ❌:", error instanceof Error ? error.message : "Unknown error");
                return false;
            }
        }
    }

    return false; // This should never be reached, but TypeScript requires it
}

// Test API connection (legacy function - now uses pingBackend)
export async function testApiConnection(): Promise<boolean> {
    return await pingBackend();
}

// Bulk fetch all data at once
export async function fetchAllData(): Promise<{
    sleep: SleepList;
    diet: DietList;
    menstrual: MenstrualList;
    symptoms: SymptomList;
}> {
    try {
        const [sleep, diet, menstrual, symptoms] = await Promise.all([
            getAllSleep(),
            getAllDiet(),
            getAllMenstrual(),
            getAllSymptoms(),
        ]);

        return { sleep, diet, menstrual, symptoms };
    } catch (error) {
        console.error("Failed to fetch all data:", error);
        throw error;
    }
}

// Debug function to test each endpoint individually
export async function debugEndpoints(): Promise<void> {
    console.log("🧪 Testing each endpoint individually...");

    const endpoints = [
        { name: "Sleep", fn: getAllSleep },
        { name: "Diet", fn: getAllDiet },
        { name: "Menstrual", fn: getAllMenstrual },
        { name: "Symptoms", fn: getAllSymptoms }
    ];

    for (const endpoint of endpoints) {
        try {
            console.log(`\n🔍 Testing ${endpoint.name}...`);
            const result = await endpoint.fn();
            console.log(`✅ ${endpoint.name} success:`, result.length, "entries");
        } catch (error) {
            console.error(`❌ ${endpoint.name} failed:`, error);
        }
    }
}