// TypeScript interfaces for trigger severity heatmap data
// Based on /find_triggers API endpoint response structure

export interface TriggerEntry {
  date: string; // ISO date string (e.g., "2025-08-11")
  trigger_severity: number; // 0-10 scale
}

export interface TriggerCategory {
  counts: Record<string, number>; // e.g., { "bacon": 1, "eggs": 1 }
  details: Record<string, TriggerEntry[]>; // e.g., { "bacon": [{ date: "2025-08-11", trigger_severity: 6.6666 }] }
}

export interface LowSleepCategory {
  count: number;
  details: TriggerEntry[] | null;
}

// Main API response structure from /find_triggers endpoint
export interface FindTriggersResponse {
  common_food_items: TriggerCategory;
  flow_levels: TriggerCategory;
  low_sleep_hours: LowSleepCategory;
  menstrual_events: TriggerCategory;
  standard_deviation: number;
  symptom_average: number;
  symptom_spike_threshold: number;
}

// Processed data for heatmap rendering
export interface DailySeverity {
  date: string; // ISO date string
  severity: number; // 0-10 scale (averaged if multiple entries per day)
}

// Color configuration for heatmap cells
// CUSTOMIZATION POINT: Adjust these thresholds and colors as needed
export interface HeatmapColorConfig {
  thresholds: {
    none: 0;      // No data
    low: 3;       // 1-3: Low severity
    medium: 6;    // 4-6: Medium severity 
    high: 10;     // 7-10: High severity
  };
  colors: {
    none: '#EDE7F6';    // Light lavender for no data
    low: '#B39DDB';     // Medium purple for low severity
    medium: '#7E57C2';  // Darker purple for medium severity
    high: '#4A148C';    // Deep purple for high severity
  };
}

// Heatmap cell data for rendering
export interface HeatmapCell {
  date: string; // ISO date string
  severity: number | null; // null if no data for this date
  color: string; // Hex color based on severity
}

export default {
  TriggerEntry,
  TriggerCategory,
  LowSleepCategory,
  FindTriggersResponse,
  DailySeverity,
  HeatmapColorConfig,
  HeatmapCell
};