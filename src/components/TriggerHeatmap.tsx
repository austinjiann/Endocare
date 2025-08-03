import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fetchTriggers, fetchTriggerSummary } from "../services/api";
import type { DailySeverity, FindTriggersResponse, HeatmapCell, TriggerEntry } from "../types/TriggerTypes";

const { width: screenWidth } = Dimensions.get("window");

// CUSTOMIZATION POINT: Adjust color thresholds and hex values
const HEATMAP_CONFIG: {
    thresholds: { high: number; low: number; none: number; medium: number };
    colors: { high: string; low: string; none: string; medium: string }
} = {
    thresholds: {
        none: 0,      // No data
        low: 3,       // 1-3: Low severity
        medium: 6,    // 4-6: Medium severity
        high: 10,     // 7-10: High severity
    },
    colors: {
        none: "#eeecf6",    // Light lavender for no data
        low: "#B39DDB",     // Medium purple for low severity
        medium: "#7E57C2",  // Darker purple for medium severity
        high: "#4A148C",    // Deep purple for high severity
    },
};

interface CalendarCell extends HeatmapCell {
    dayNumber: number | null; // Day of month (1-31) or null for empty cells
    isEmpty: boolean; // True for padding cells
}

const TriggerHeatmap: React.FC = () => {
    const [triggerData, setTriggerData] = useState<FindTriggersResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date()); // Current displayed month

    // Calculate responsive cell size for monthly view
    const cellSize = useMemo(() => {
        const padding = 40; // Total horizontal padding
        const dayLabelWidth = 25; // Space for day labels
        const gaps = 6 * 4; // Gaps between 7 columns
        const availableWidth = screenWidth - padding - dayLabelWidth - gaps;
        return Math.max(Math.floor(availableWidth / 7), 25); // Minimum 25px cells for monthly view
    }, []);

    // Correctly type the heatmap data state
    const [heatmapData, setHeatmapData] = useState<DailySeverity[]>([]);

    function aggregateSeverityByDate(data: any): DailySeverity[] {
        const dateMap: Record<string, number> = {};

        const extractSeverities = (obj: any) => {
            if (Array.isArray(obj)) {
                for (const item of obj) {
                    if (item && typeof item === 'object' && 'trigger_severity' in item && 'date' in item) {
                        const date = item.date;
                        const severity = item.trigger_severity;
                        if (!dateMap[date]) {
                            dateMap[date] = 0;
                        }
                        dateMap[date] += severity;
                    }
                }
            } else if (obj && typeof obj === 'object') {
                for (const value of Object.values(obj)) {
                    extractSeverities(value);
                }
            }
        };

        for (const [key, value] of Object.entries(data)) {
            if (['standard_deviation', 'symptom_average', 'symptom_spike_threshold'].includes(key)) continue;
            extractSeverities(value);
        }

        const allDates = Object.keys(dateMap).sort();
        return allDates.map(date => ({
            date,
            severity: dateMap[date] || 0
        }));
    }

    useEffect(() => {
        fetchTriggerSummary().then((data) => {
            const aggregatedData = aggregateSeverityByDate(data);
            setHeatmapData(aggregatedData);
            console.log("Aggregated Heatmap Data:", aggregatedData);
        });
    }, []);

    useEffect(() => {
        fetchTriggerData();
    }, []);

    const fetchTriggerData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchTriggers();
            setTriggerData(data);
        } catch (err) {
            console.error("Failed to fetch trigger data:", err);
            setError("Failed to load trigger data");
        } finally {
            setLoading(false);
        }
    };

    /**
     * Extract all trigger entries from API response
     * CUSTOMIZATION POINT: Modify if API structure changes
     */
    const extractTriggerEntries = (data: FindTriggersResponse): TriggerEntry[] => {
        const entries: TriggerEntry[] = [];

        // Extract from common_food_items
        Object.values(data.common_food_items.details).forEach(foodEntries => {
            entries.push(...foodEntries);
        });

        // Extract from flow_levels
        Object.values(data.flow_levels.details).forEach(flowEntries => {
            entries.push(...flowEntries);
        });

        // Extract from menstrual_events
        Object.values(data.menstrual_events.details).forEach(menstrualEntries => {
            entries.push(...menstrualEntries);
        });

        // Extract from low_sleep_hours if available
        if (data.low_sleep_hours.details) {
            entries.push(...data.low_sleep_hours.details);
        }

        return entries;
    };

    /**
     * Generate color based on severity value
     * CUSTOMIZATION POINT: Adjust color mapping logic
     */
    const getSeverityColor = (severity: number | null): string => {
        if (severity === null || severity === 0) return HEATMAP_CONFIG.colors.none;
        if (severity <= HEATMAP_CONFIG.thresholds.low) return HEATMAP_CONFIG.colors.low;
        if (severity <= HEATMAP_CONFIG.thresholds.medium) return HEATMAP_CONFIG.colors.medium;
        return HEATMAP_CONFIG.colors.high;
    };

    /**
     * Get available months that have data
     */
    const availableMonths = useMemo(() => {
        if (!triggerData) return [];

        const entries = extractTriggerEntries(triggerData);
        const months = new Set<string>();

        entries.forEach(entry => {
            const date = new Date(entry.date);
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
            months.add(monthKey);
        });

        return Array.from(months).sort().map(monthKey => {
            const [year, month] = monthKey.split("-").map(Number);
            return new Date(year, month, 1);
        });
    }, [triggerData]);

    /**
     * Generate calendar grid for current month using heatmapData
     */
    const monthCalendarData = useMemo(() => {
        if (!heatmapData.length) return [];

        // Filter heatmapData for current month
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const dailySeverities = heatmapData.filter(({ date }) => {
            const d = new Date(date);
            return d.getFullYear() === year && d.getMonth() === month;
        });

        // Create severity map for quick lookup
        const severityMap = new Map<string, number>();
        dailySeverities.forEach(({ date, severity }) => {
            severityMap.set(date, severity);
        });

        // Get current month details
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0

        // Create calendar grid
        const grid: CalendarCell[][] = Array(6).fill(null).map(() => []);
        let currentDay = 1;

        for (let week = 0; week < 6; week++) {
            for (let day = 0; day < 7; day++) {
                if (week === 0 && day < startDayOfWeek) {
                    grid[week].push({
                        date: "",
                        severity: null,
                        color: HEATMAP_CONFIG.colors.none,
                        dayNumber: null,
                        isEmpty: true
                    });
                } else if (currentDay <= daysInMonth) {
                    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(currentDay).padStart(2, "0")}`;
                    const severity = severityMap.get(dateString) ?? null;

                    grid[week].push({
                        date: dateString,
                        severity,
                        color: getSeverityColor(severity),
                        dayNumber: currentDay,
                        isEmpty: false
                    });
                    currentDay++;
                } else {
                    grid[week].push({
                        date: "",
                        severity: null,
                        color: HEATMAP_CONFIG.colors.none,
                        dayNumber: null,
                        isEmpty: true
                    });
                }
            }
        }

        return grid.filter(week => week.some(cell => !cell.isEmpty));
    }, [heatmapData, currentMonth]);

    /**
     * Navigation functions
     */
    const goToPreviousMonth = () => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(newMonth.getMonth() - 1);
        setCurrentMonth(newMonth);
    };

    const goToNextMonth = () => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(newMonth.getMonth() + 1);
        setCurrentMonth(newMonth);
    };

    /**
     * Check if navigation is available - allow navigation within reasonable date range
     */
    const canGoToPrevious = useMemo(() => {
        // Allow navigation back 2 years from current date
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

        const currentMonthKey = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}`;
        const limitKey = `${twoYearsAgo.getFullYear()}-${twoYearsAgo.getMonth()}`;
        return currentMonthKey > limitKey;
    }, [currentMonth]);

    const canGoToNext = useMemo(() => {
        // Allow navigation up to current month
        const today = new Date();

        const currentMonthKey = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}`;
        const todayKey = `${today.getFullYear()}-${today.getMonth()}`;
        return currentMonthKey < todayKey;
    }, [currentMonth]);

    const renderCell = (cell: CalendarCell, rowIndex: number, cellIndex: number) => (
        <TouchableOpacity
            key={`${rowIndex}-${cellIndex}`}
            style={[
                styles.cell,
                {
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: cell.isEmpty ? "transparent" : cell.color,
                    opacity: cell.isEmpty ? 0 : 1,
                }
            ]}
            onPress={() => {
                if (!cell.isEmpty) {
                    console.log(`Date: ${cell.date}, Day: ${cell.dayNumber}, Severity: ${cell.severity}`);
                }
            }}
            disabled={cell.isEmpty}
        >
            {!cell.isEmpty && (
                <Text style={styles.dayNumber}></Text>
            )}
        </TouchableOpacity>
    );

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Trigger Severity Over Time</Text>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#C8A8D8"/>
                    <Text style={styles.loadingText}>Loading trigger data...</Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Trigger Severity Over Time</Text>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchTriggerData}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Trigger Severity Over Time</Text>

            {/* Month Navigation */}
            <View style={styles.monthNavigation}>
                <TouchableOpacity
                    style={[styles.navButton, !canGoToPrevious && styles.navButtonDisabled]}
                    onPress={goToPreviousMonth}
                    disabled={!canGoToPrevious}
                >
                    <Ionicons
                        name="chevron-back"
                        size={20}
                        color={canGoToPrevious ? "#C8A8D8" : "#E0E0E0"}
                    />
                </TouchableOpacity>

                <Text style={styles.monthTitle}>
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </Text>

                <TouchableOpacity
                    style={[styles.navButton, !canGoToNext && styles.navButtonDisabled]}
                    onPress={goToNextMonth}
                    disabled={!canGoToNext}
                >
                    <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={canGoToNext ? "#C8A8D8" : "#E0E0E0"}
                    />
                </TouchableOpacity>
            </View>

            {/* Day of Week Headers */}
            <View style={styles.dayHeaders}>
                {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                    <Text key={index} style={[styles.dayHeader, { width: cellSize }]}>
                        {day}
                    </Text>
                ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
                {monthCalendarData.map((week, weekIndex) => (
                    <View key={weekIndex} style={styles.calendarRow}>
                        {week.map((cell, cellIndex) => renderCell(cell, weekIndex, cellIndex))}
                    </View>
                ))}
            </View>

            {/* Legend */}
            <View style={styles.legend}>
                <Text style={styles.legendLabel}>Less</Text>
                <View style={styles.legendColors}>
                    <View style={[styles.legendCell, { backgroundColor: HEATMAP_CONFIG.colors.none }]}/>
                    <View style={[styles.legendCell, { backgroundColor: HEATMAP_CONFIG.colors.low }]}/>
                    <View style={[styles.legendCell, { backgroundColor: HEATMAP_CONFIG.colors.medium }]}/>
                    <View style={[styles.legendCell, { backgroundColor: HEATMAP_CONFIG.colors.high }]}/>
                </View>
                <Text style={styles.legendLabel}>More</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#F4F1F7",
        padding: 20,
        borderRadius: 15,
        marginBottom: 25,
        borderLeftWidth: 4,
        borderLeftColor: "#C8A8D8",
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: "#2C3E50",
        marginBottom: 15,
        textAlign: "center",
    },
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 30,
    },
    loadingText: {
        marginLeft: 10,
        color: "#7F8C8D",
        fontSize: 14,
    },
    errorContainer: {
        alignItems: "center",
        paddingVertical: 20,
    },
    errorText: {
        color: "#E74C3C",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 10,
    },
    retryButton: {
        backgroundColor: "#C8A8D8",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    retryText: {
        color: "#FFF",
        fontSize: 12,
        fontWeight: "600",
    },
    monthNavigation: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 15,
    },
    navButton: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: "#FEFEFE",
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    navButtonDisabled: {
        backgroundColor: "#F8F9FA",
    },
    monthTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2C3E50",
    },
    dayHeaders: {
        flexDirection: "row",
        marginBottom: 8,
    },
    dayHeader: {
        fontSize: 12,
        color: "#7F8C8D",
        textAlign: "center",
        fontWeight: "500",
        marginRight: 4,
    },
    calendarGrid: {
        marginBottom: 15,
    },
    calendarRow: {
        flexDirection: "row",
        marginBottom: 4,
    },
    cell: {
        marginRight: 4,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#F0F0F0",
    },
    dayNumber: {
        fontSize: 10,
        color: "#FFF",
        fontWeight: "600",
    },
    legend: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    legendLabel: {
        fontSize: 11,
        color: "#7F8C8D",
        marginHorizontal: 8,
    },
    legendColors: {
        flexDirection: "row",
        gap: 2,
    },
    legendCell: {
        width: 12,
        height: 12,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
});

export default TriggerHeatmap;