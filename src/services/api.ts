// src/services/api.ts

import Constants from 'expo-constants';

// Set the base URL for the API.
export const API_BASE_URL =
  Constants.manifest?.extra?.apiUrl /* from app.json */ ||
  'http://127.0.0.1:8000';

/**
 * A generic function to handle API calls, providing a consistent
 * way to make requests and handle responses.
 * @param path The API endpoint path (e.g., '/insert_sleep').
 * @param options The fetch options, like method, headers, and body.
 * @returns A promise that resolves to the JSON response from the API.
 */
async function apiCall<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API call failed with status: ${response.status}`);
  }

  // Check if the response has content before parsing as JSON
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  } else {
    // Return a default value or handle non-JSON responses
    return {} as T; // Return an empty object for cases with no JSON body
  }
}


// SLEEP

export type SleepEntry = {
  id: number;
  date: string;
  duration: number;
  quality: number;
  disruptions: string;
  notes: string;
};
export type InsertSleep = Omit<SleepEntry, 'id'>;

export async function insertSleep(payload: InsertSleep): Promise<SleepEntry> {
  return apiCall<SleepEntry>('/insert_sleep', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getAllSleep(): Promise<SleepEntry[]> {
  return apiCall<SleepEntry[]>('/get_all_sleep');
}


// Diet

export type DietEntry = {
  id: number;
  meal: string;
  date: string;
  items: string[];
  notes: string;
};
export type InsertDiet = Omit<DietEntry, 'id'>;

export async function insertDiet(payload: InsertDiet): Promise<DietEntry> {
  return apiCall<DietEntry>('/insert_diet', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getAllDiet(): Promise<DietEntry[]> {
  return apiCall<DietEntry[]>('/get_all_diet');
}


// Menstrual

export type MenstrualEntry = {
  id: number;
  period_event: 'start' | 'end';
  date: string;
  flow_level: string;
  notes: string;
};
export type InsertMenstrual = Omit<MenstrualEntry, 'id'>;

export async function insertMenstrual(payload: InsertMenstrual): Promise<MenstrualEntry> {
  return apiCall<MenstrualEntry>('/insert_menstrual', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getAllMenstrual(): Promise<MenstrualEntry[]> {
  return apiCall<MenstrualEntry[]>('/get_all_menstrual');
}


// Symptoms

export type SymptomEntry = {
  id: number;
  date: string;
  nausea: number;
  fatigue: number;
  pain: number;
  notes: string;
};
export type InsertSymptoms = Omit<SymptomEntry, 'id'>;

export async function insertSymptoms(payload: InsertSymptoms): Promise<SymptomEntry> {
  return apiCall<SymptomEntry>('/insert_symptoms', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getAllSymptoms(): Promise<SymptomEntry[]> {
  return apiCall<SymptomEntry[]>('/get_all_symptoms');
}


// ML Prediction

export type PredictRequest = {
  date: string;
  duration_h: number;
  quality_pct: number;
  cycle_day: number;
  pain_today: number;
  processed_sugar: number;
  caffeine_evening: number;
};

export type PredictResponse = {
  flareProbability: number;
};

export async function predictFlare(payload: PredictRequest): Promise<PredictResponse> {
  return apiCall<PredictResponse>('/predict-flare', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}