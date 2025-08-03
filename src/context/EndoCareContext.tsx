import React, { createContext, ReactNode, useContext, useEffect, useReducer } from "react";
import * as API from "../services/api";
import { useAlert } from "./AlertContext";

// Core data types for endometriosis tracking
export interface SymptomEntry {
    id: string;
    date: string;
    nausea: number;    // 1-10 scale
    fatigue: number;   // 1-10 scale
    pain: number;      // 1-10 scale
    notes?: string;
    // TODO: Add mood tracking, specific pain locations
}

export interface PeriodLog {
    id: string;
    date: string;
    type: string;
    flowLevel?: string;
    notes?: string;
    // TODO: Add cycle length tracking, ovulation indicators
}

export interface FoodLog {
    id: string;
    date: string;
    mealType: "breakfast" | "lunch" | "dinner" | "snack";
    foodItems: string;
    flareUpScore: number;   // 1-10 scale (1 = no reaction, 10 = severe flare)
    symptomsAfter?: {
        nausea: number;
        fatigue: number;
        pain: number;
    };
    timeAfterEating?: string; // e.g., "2 hours"
    notes?: string;
    // TODO: Add ingredient tracking, elimination diet support
}

export interface SleepLog {
    id: string;
    date: string;
    hoursSlept: number;
    sleepQuality: number;    // 1-10 scale
    morningSymptoms?: {
        nausea: number;
        fatigue: number;
        pain: number;
    };
    sleepDisruptions?: string; // e.g., "pain", "bathroom", "anxiety"
    notes?: string;
    // TODO: Add sleep pattern analysis, bedtime tracking
}

// App state interface
interface EndoCareState {
    symptomLogs: SymptomEntry[];
    periodLogs: PeriodLog[];
    foodLogs: FoodLog[];
    sleepLogs: SleepLog[];
    // Enhanced API state
    isLoading: boolean;
    connectionStatus: "online" | "offline" | "checking" | "retrying";
    lastSyncTime: string | null;
    lastError: string | null;
}

// Action types for state management
type EndoCareAction =
    | { type: "ADD_SYMPTOM_LOG"; payload: SymptomEntry }
    | { type: "ADD_PERIOD_LOG"; payload: PeriodLog }
    | { type: "ADD_FOOD_LOG"; payload: FoodLog }
    | { type: "ADD_SLEEP_LOG"; payload: SleepLog }
    | { type: "UPDATE_SYMPTOM_LOG"; payload: { id: string; updates: Partial<SymptomEntry> } }
    | { type: "UPDATE_PERIOD_LOG"; payload: { id: string; updates: Partial<PeriodLog> } }
    | { type: "UPDATE_FOOD_LOG"; payload: { id: string; updates: Partial<FoodLog> } }
    | { type: "UPDATE_SLEEP_LOG"; payload: { id: string; updates: Partial<SleepLog> } }
    | { type: "DELETE_SYMPTOM_LOG"; payload: string }
    | { type: "DELETE_PERIOD_LOG"; payload: string }
    | { type: "DELETE_FOOD_LOG"; payload: string }
    | { type: "DELETE_SLEEP_LOG"; payload: string }
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_CONNECTION_STATUS"; payload: "online" | "offline" | "checking" | "retrying" }
    | { type: "SET_LAST_SYNC"; payload: string }
    | { type: "SET_LAST_ERROR"; payload: string | null }
    | {
    type: "LOAD_API_DATA";
    payload: { sleep: SleepLog[]; diet: FoodLog[]; menstrual: PeriodLog[]; symptoms: SymptomEntry[] }
};

// Sample data for endometriosis tracking scenarios
const sampleSymptomLogs: SymptomEntry[] = [
    {
        id: "1",
        date: "2025-02-02",
        nausea: 7,
        fatigue: 8,
        pain: 6,
        notes: "Woke up feeling nauseous, period starting soon"
    },
    {
        id: "2",
        date: "2025-02-01",
        nausea: 3,
        fatigue: 5,
        pain: 4,
        notes: "Better day, mild discomfort"
    },
    {
        id: "3",
        date: "2025-01-31",
        nausea: 9,
        fatigue: 9,
        pain: 8,
        notes: "Very bad flare after eating dairy yesterday"
    }
];

const samplePeriodLogs: PeriodLog[] = [
    {
        id: "1",
        date: "2025-02-02",
        type: "start",
        flowLevel: 3,
        associatedSymptoms: {
            nausea: 7,
            fatigue: 8,
            pain: 6
        },
        notes: "Heavy cramping, took ibuprofen"
    },
    {
        id: "2",
        date: "2025-01-25",
        type: "end",
        flowLevel: 1,
        associatedSymptoms: {
            nausea: 2,
            fatigue: 3,
            pain: 2
        },
        notes: "Finally feeling better"
    }
];

const sampleFoodLogs: FoodLog[] = [
    {
        id: "1",
        date: "2025-02-01",
        mealType: "lunch",
        foodItems: "Gluten-free quinoa salad with vegetables",
        flareUpScore: 2,
        symptomsAfter: {
            nausea: 2,
            fatigue: 3,
            pain: 2
        },
        timeAfterEating: "1 hour",
        notes: "Felt good, no major reactions"
    },
    {
        id: "2",
        date: "2025-01-30",
        mealType: "dinner",
        foodItems: "Pizza with regular cheese and wheat crust",
        flareUpScore: 8,
        symptomsAfter: {
            nausea: 9,
            fatigue: 7,
            pain: 8
        },
        timeAfterEating: "3 hours",
        notes: "Major flare - dairy and gluten trigger confirmed"
    },
    {
        id: "3",
        date: "2025-01-29",
        mealType: "breakfast",
        foodItems: "Oatmeal with almond milk and berries",
        flareUpScore: 1,
        symptomsAfter: {
            nausea: 1,
            fatigue: 2,
            pain: 1
        },
        timeAfterEating: "30 minutes",
        notes: "Safe breakfast option"
    }
];

const sampleSleepLogs: SleepLog[] = [
    {
        id: "1",
        date: "2025-02-01",
        hoursSlept: 6.5,
        sleepQuality: 4,
        morningSymptoms: {
            nausea: 3,
            fatigue: 6,
            pain: 4
        },
        sleepDisruptions: "Mild cramping, woke up twice",
        notes: "Period starting, restless sleep"
    },
    {
        id: "2",
        date: "2025-01-31",
        hoursSlept: 4,
        sleepQuality: 2,
        morningSymptoms: {
            nausea: 9,
            fatigue: 9,
            pain: 8
        },
        sleepDisruptions: "Severe pain, nausea, bathroom trips",
        notes: "Terrible night after dairy trigger"
    },
    {
        id: "3",
        date: "2025-01-30",
        hoursSlept: 8,
        sleepQuality: 8,
        morningSymptoms: {
            nausea: 2,
            fatigue: 3,
            pain: 2
        },
        sleepDisruptions: "None",
        notes: "Great sleep, felt refreshed"
    }
];

// Initial state with realistic endometriosis sample data
const initialState: EndoCareState = {
    symptomLogs: sampleSymptomLogs,
    periodLogs: samplePeriodLogs,
    foodLogs: sampleFoodLogs,
    sleepLogs: sampleSleepLogs,
    isLoading: false,
    connectionStatus: "offline", // Start offline until we check
    lastSyncTime: null,
    lastError: null,
};

// Reducer function for state management
function endoCareReducer(state: EndoCareState, action: EndoCareAction): EndoCareState {
    switch (action.type) {
        case "ADD_SYMPTOM_LOG":
            return {
                ...state,
                symptomLogs: [...state.symptomLogs, action.payload],
            };
        case "ADD_PERIOD_LOG":
            return {
                ...state,
                periodLogs: [...state.periodLogs, action.payload],
            };
        case "ADD_FOOD_LOG":
            return {
                ...state,
                foodLogs: [...state.foodLogs, action.payload],
            };
        case "ADD_SLEEP_LOG":
            return {
                ...state,
                sleepLogs: [...state.sleepLogs, action.payload],
            };
        case "UPDATE_SYMPTOM_LOG":
            return {
                ...state,
                symptomLogs: state.symptomLogs.map(log =>
                    log.id === action.payload.id ? { ...log, ...action.payload.updates } : log
                ),
            };
        case "UPDATE_PERIOD_LOG":
            return {
                ...state,
                periodLogs: state.periodLogs.map(log =>
                    log.id === action.payload.id ? { ...log, ...action.payload.updates } : log
                ),
            };
        case "UPDATE_FOOD_LOG":
            return {
                ...state,
                foodLogs: state.foodLogs.map(log =>
                    log.id === action.payload.id ? { ...log, ...action.payload.updates } : log
                ),
            };
        case "UPDATE_SLEEP_LOG":
            return {
                ...state,
                sleepLogs: state.sleepLogs.map(log =>
                    log.id === action.payload.id ? { ...log, ...action.payload.updates } : log
                ),
            };
        case "DELETE_SYMPTOM_LOG":
            return {
                ...state,
                symptomLogs: state.symptomLogs.filter(log => log.id !== action.payload),
            };
        case "DELETE_PERIOD_LOG":
            return {
                ...state,
                periodLogs: state.periodLogs.filter(log => log.id !== action.payload),
            };
        case "DELETE_FOOD_LOG":
            return {
                ...state,
                foodLogs: state.foodLogs.filter(log => log.id !== action.payload),
            };
        case "DELETE_SLEEP_LOG":
            return {
                ...state,
                sleepLogs: state.sleepLogs.filter(log => log.id !== action.payload),
            };
        case "SET_LOADING":
            return {
                ...state,
                isLoading: action.payload,
            };
        case "SET_CONNECTION_STATUS":
            return {
                ...state,
                connectionStatus: action.payload,
                // Clear error when going online
                lastError: action.payload === "online" ? null : state.lastError,
            };
        case "SET_LAST_SYNC":
            return {
                ...state,
                lastSyncTime: action.payload,
            };
        case "SET_LAST_ERROR":
            return {
                ...state,
                lastError: action.payload,
            };
        case "LOAD_API_DATA":
            return {
                ...state,
                symptomLogs: action.payload.symptoms,
                periodLogs: action.payload.menstrual,
                foodLogs: action.payload.diet,
                sleepLogs: action.payload.sleep,
                lastSyncTime: new Date().toISOString(),
                connectionStatus: "online",
                lastError: null,
            };
        default:
            return state;
    }
}

// Context interface with helper functions
interface EndoCareContextType {
    state: EndoCareState;
    dispatch: React.Dispatch<EndoCareAction>;
    // Helper functions for easier data management
    addSymptomLog: (log: Omit<SymptomEntry, "id">) => Promise<void>;
    addPeriodLog: (log: Omit<PeriodLog, "id">) => Promise<void>;
    addFoodLog: (log: Omit<FoodLog, "id">) => Promise<void>;
    addSleepLog: (log: Omit<SleepLog, "id">) => Promise<void>;
    // API functions
    loadInitialData: () => Promise<void>;
    syncWithBackend: () => Promise<void>;
    // TODO: Add helper functions for data analysis
    // getSymptomTrends: () => any;
    // getFoodTriggers: () => any;
    // getWorstSymptomDays: () => any;
}

// Create context
const EndoCareContext = createContext<EndoCareContextType | undefined>(undefined);

// Data transformation functions
function transformApiSleepToLocal(apiSleep: API.SleepList): SleepLog[] {
    return apiSleep.map(sleep => ({
        id: sleep.id.toString(),
        date: sleep.date.split("T")[0], // Convert ISO to YYYY-MM-DD
        hoursSlept: sleep.duration,
        sleepQuality: Math.min(10, Math.max(1, Math.round(sleep.quality / 10))), // Convert 0-100 to 1-10 scale
        sleepDisruptions: sleep.disruptions,
        notes: sleep.notes,
        // Note: API doesn't have morningSymptoms, keeping undefined
    }));
}

function transformApiDietToLocal(apiDiet: API.DietList): FoodLog[] {
    return apiDiet.map(diet => ({
        id: diet.id.toString(),
        date: diet.date.split("T")[0],
        mealType: diet.meal as "breakfast" | "lunch" | "dinner" | "snack",
        foodItems: diet.items.join(", "),
        flareUpScore: 1, // Default value since API doesn't have this
        notes: diet.notes,
        // Note: API doesn't have symptomsAfter or timeAfterEating
    }));
}

function transformApiMenstrualToLocal(apiMenstrual: API.MenstrualList): PeriodLog[] {
    return apiMenstrual.map(menstrual => ({
        id: menstrual.id.toString(),
        date: menstrual.date.split("T")[0],
        type: menstrual.period_event as "start" | "end",
        flowLevel: menstrual.flow_level === "light" ? 1 : menstrual.flow_level === "moderate" ? 3 : 5,
        notes: menstrual.notes,
        // Note: API doesn't have associatedSymptoms
    }));
}

function transformApiSymptomsToLocal(apiSymptoms: API.SymptomList): SymptomEntry[] {
    return apiSymptoms.map(symptom => ({
        id: symptom.id.toString(),
        date: symptom.date.split("T")[0],
        // Convert backend 0-10 scale to frontend 1-10 scale
        nausea: Math.max(1, symptom.nausea + 1),
        fatigue: Math.max(1, symptom.fatigue + 1),
        pain: Math.max(1, symptom.pain + 1),
        notes: symptom.notes,
    }));
}

// Context provider component
export function EndoCareProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(endoCareReducer, initialState);
    const { showAlert } = useAlert();

    // Load initial data from API with health check and enhanced error handling
    const loadInitialData = async () => {
        dispatch({ type: "SET_LOADING", payload: true });
        dispatch({ type: "SET_CONNECTION_STATUS", payload: "checking" });

        try {
            // First, check if backend is healthy using direct fetch
            console.log("[context] Checking backend health with direct fetch...");
            const healthResponse = await fetch("https://e40dbaa9a15f.ngrok-free.app/get_all_sleep", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true"
                }
            });

            if (!healthResponse.ok) {
                console.log("[context] Health check failed - response not ok:", healthResponse.status);
                dispatch({ type: "SET_CONNECTION_STATUS", payload: "offline" });
                dispatch({ type: "SET_LAST_ERROR", payload: "Backend health check failed" });
                showAlert({
                    title: "Server Unavailable",
                    message: "Cannot reach the server. Pull down to retry when connection is available.",
                    type: "error",
                    themeColor: "#C8A8D8",
                    buttons: [{ text: "OK" }]
                });
                return;
            }

            console.log("[context] Health check passed, setting online");

            // Backend is healthy, try to load data using direct fetch
            dispatch({ type: "SET_CONNECTION_STATUS", payload: "retrying" });
            console.log("[context] Loading data from backend with direct fetch...");

            // Load all data using direct fetch calls
            const [sleepResponse, dietResponse, menstrualResponse, symptomsResponse] = await Promise.all([
                fetch("https://e40dbaa9a15f.ngrok-free.app/get_all_sleep", {
                    headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" }
                }),
                fetch("https://e40dbaa9a15f.ngrok-free.app/get_all_diet", {
                    headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" }
                }),
                fetch("https://e40dbaa9a15f.ngrok-free.app/get_all_menstrual", {
                    headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" }
                }),
                fetch("https://e40dbaa9a15f.ngrok-free.app/get_all_symptoms", {
                    headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" }
                })
            ]);

            const sleepData = await sleepResponse.json();
            const dietData = await dietResponse.json();
            const menstrualData = await menstrualResponse.json();
            const symptomsData = await symptomsResponse.json();

            const apiData = {
                sleep: sleepData || [],
                diet: dietData || [],
                menstrual: menstrualData || [],
                symptoms: symptomsData || []
            };

            const transformedData = {
                sleep: transformApiSleepToLocal(apiData.sleep),
                diet: transformApiDietToLocal(apiData.diet),
                menstrual: transformApiMenstrualToLocal(apiData.menstrual),
                symptoms: transformApiSymptomsToLocal(apiData.symptoms),
            };

            dispatch({ type: "LOAD_API_DATA", payload: transformedData });
            console.log("[context] Data loaded successfully - connection status should now be online");

        } catch (error) {
            console.trace("[context] Error loading initial data:", error);

            // Network or other error
            dispatch({ type: "SET_CONNECTION_STATUS", payload: "offline" });
            dispatch({ type: "SET_LAST_ERROR", payload: error instanceof Error ? error.message : "Unknown error" });
            showAlert({
                title: "Network Error",
                message: "Check your internet connection and try again.",
                type: "error",
                themeColor: "#C8A8D8",
                buttons: [{ text: "OK" }]
            });
        } finally {
            dispatch({ type: "SET_LOADING", payload: false });
        }
    };

    // Sync with backend
    const syncWithBackend = async () => {
        await loadInitialData();
    };

    // Load data on app start
    useEffect(() => {
        loadInitialData();

        // Debug: Test individual endpoints
        // Uncomment this line to debug endpoints individually:
        // API.debugEndpoints();
    }, []);

    // Helper functions for adding new logs with API integration
    const addSymptomLog = async (log: Omit<SymptomEntry, "id">) => {
        const localEntry = { ...log, id: Date.now().toString() };

        // Add to local state immediately
        dispatch({ type: "ADD_SYMPTOM_LOG", payload: localEntry });

        // Debug logging
        console.log("[context] addSymptomLog - Always attempting POST request");
        console.log("[context] Symptom log data:", log);

        // Always attempt to sync with API using direct fetch
        try {
            console.log("[context] Making direct fetch call to insert_symptoms...");
            const response = await fetch("https://e40dbaa9a15f.ngrok-free.app/insert_symptoms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date: new Date(log.date + "T12:00:00Z").toISOString(),
                    nausea: log.nausea,
                    fatigue: log.fatigue,
                    pain: log.pain,
                    notes: log.notes || "Symptoms logged",
                }),
            });

            if (response.ok) {
                const result = await response.json();
                console.log("[context] insert_symptoms success:", result);
            } else {
                console.error("[context] insert_symptoms failed:", response.status, response.statusText);
                showAlert({
                    title: "Sync Warning",
                    message: "Data saved locally but server sync failed.",
                    type: "warning",
                    themeColor: "#FFB380"
                });
            }
        } catch (error) {
            console.error("[context] Failed to sync symptom log:", error);
            console.log("[context] Data saved locally, server may be unreachable");
            // Don't show alert for network errors - data is saved locally
        }
    };

    const addPeriodLog = async (log: Omit<PeriodLog, "id">) => {
        const localEntry = { ...log, id: Date.now().toString() };

        // Add to local state immediately
        dispatch({ type: "ADD_PERIOD_LOG", payload: localEntry });

        // Debug logging
        console.log("[context] addPeriodLog - Always attempting POST request");
        console.log("[context] Period log data:", log);

        // Always attempt to sync with API using direct fetch
        try {
            console.log("[context] Making direct fetch call to insert_menstrual...");
            const flowLevel = log.flowLevel === 1 ? "light" : log.flowLevel === 3 ? "moderate" : "heavy";
            const response = await fetch("https://e40dbaa9a15f.ngrok-free.app/insert_menstrual", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    period_event: log.type,
                    date: new Date(log.date + "T00:00:00Z").toISOString(),
                    flow_level: flowLevel,
                    notes: log.notes || "Period log",
                }),
            });

            if (response.ok) {
                const result = await response.json();
                console.log("[context] insert_menstrual success:", result);
            } else {
                console.error("[context] insert_menstrual failed:", response.status, response.statusText);
                showAlert({
                    title: "Sync Warning",
                    message: "Data saved locally but server sync failed.",
                    type: "warning",
                    themeColor: "#F4A8C0"
                });
            }
        } catch (error) {
            console.error("[context] Failed to sync period log:", error);
            console.log("[context] Data saved locally, server may be unreachable");
            // Don't show alert for network errors - data is saved locally
        }
    };

    const addFoodLog = async (log: Omit<FoodLog, "id">) => {
        const localEntry = { ...log, id: Date.now().toString() };

        // Add to local state immediately
        dispatch({ type: "ADD_FOOD_LOG", payload: localEntry });

        // Debug logging
        console.log("[context] addFoodLog - Always attempting POST request");
        console.log("[context] Food log data:", log);

        // Always attempt to sync with API using direct fetch
        try {
            console.log("[context] Making direct fetch call to insert_diet...");
            const response = await fetch("https://e40dbaa9a15f.ngrok-free.app/insert_diet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    meal: log.mealType,
                    date: new Date(log.date + "T08:00:00Z").toISOString(),
                    items: log.foodItems.split(",").map(item => item.trim()),
                    notes: log.notes || "Had a meal",
                }),
            });

            if (response.ok) {
                const result = await response.json();
                console.log("[context] insert_diet success:", result);
            } else {
                console.error("[context] insert_diet failed:", response.status, response.statusText);
                showAlert({
                    title: "Sync Warning",
                    message: "Data saved locally but server sync failed.",
                    type: "warning",
                    themeColor: "#A8D5BA"
                });
            }
        } catch (error) {
            console.error("[context] Failed to sync food log:", error);
            console.log("[context] Data saved locally, server may be unreachable");
            // Don't show alert for network errors - data is saved locally
        }
    };

    const addSleepLog = async (log: Omit<SleepLog, "id">) => {
        const localEntry = { ...log, id: Date.now().toString() };

        // Add to local state immediately
        dispatch({ type: "ADD_SLEEP_LOG", payload: localEntry });

        // Debug logging
        console.log("[context] addSleepLog - Always attempting POST request");
        console.log("[context] Sleep log data:", log);

        // Always attempt to sync with API using direct fetch
        try {
            console.log("[context] Making direct fetch call to insert_sleep...");
            const response = await fetch("https://e40dbaa9a15f.ngrok-free.app/insert_sleep", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date: new Date(log.date + "T07:30:00Z").toISOString(),
                    duration: log.hoursSlept,
                    quality: log.sleepQuality,
                    disruptions: log.sleepDisruptions || "None",
                    notes: log.notes || "Sleep logged",
                }),
            });

            if (response.ok) {
                const result = await response.json();
                console.log("[context] insert_sleep success:", result);
            } else {
                console.error("[context] insert_sleep failed:", response.status, response.statusText);
                showAlert({
                    title: "Sync Warning",
                    message: "Data saved locally but server sync failed.",
                    type: "warning",
                    themeColor: "#9AE6E0"
                });
            }
        } catch (error) {
            console.error("[context] Failed to sync sleep log:", error);
            console.log("[context] Data saved locally, server may be unreachable");
            // Don't show alert for network errors - data is saved locally
        }
    };

    return (
        <EndoCareContext.Provider
            value={{
                state,
                dispatch,
                addSymptomLog,
                addPeriodLog,
                addFoodLog,
                addSleepLog,
                loadInitialData,
                syncWithBackend,
            }}
        >
            {children}
        </EndoCareContext.Provider>
    );
}

// Custom hook to use the EndoCare context
export function useEndoCare() {
    const context = useContext(EndoCareContext);
    if (context === undefined) {
        throw new Error("useEndoCare must be used within an EndoCareProvider");
    }
    return context;
}