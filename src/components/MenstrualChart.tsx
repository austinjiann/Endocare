import React from "react";
import { StyleSheet, View } from "react-native";
import { PeriodLog } from "../context/EndoCareContext";
import { LineChart } from "react-native-wagmi-charts";

const flowLevelMap = {
    "Very Heavy": 5,
    "Heavy": 4,
    "Medium": 3,
    "Light": 2,
    "None": 1
};

interface MenstrualChartProps {
    periodLogs: PeriodLog[];
    title?: string;
}

const MenstrualChart: React.FC<MenstrualChartProps> = ({
                                                           periodLogs,
                                                           title = "Menstrual Cycle Trends"
                                                       }) => {
    const data = [
        {
            timestamp: 1625945400000,
            value: 33575.25,
        },
        {
            timestamp: 1625946300000,
            value: 33545.25,
        },
        {
            timestamp: 1625947200000,
            value: 33510.25,
        },
        {
            timestamp: 1625948100000,
            value: 33215.25,
        },
    ];

    return (
        <View>
            <LineChart.Provider data={data}>
                <LineChart>
                    <LineChart.Path/>
                </LineChart>
            </LineChart.Provider>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 15,
    },
    sampleDataBanner: {
        backgroundColor: "#FFF0F5",
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
        borderLeftWidth: 3,
    },
    sampleDataText: {
        fontSize: 12,
        color: "#C2185B",
        textAlign: "center",
        fontWeight: "500",
    },
    navigationContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 15,
        paddingHorizontal: 5,
    },
    navButton: {
        width: 35,
        height: 35,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    navButtonDisabled: {
        backgroundColor: "#FCE4EC",
    },
    navButtonText: {
        fontSize: 18,
        fontWeight: "bold",
    },
    navButtonTextDisabled: {},
    dateRangeContainer: {
        alignItems: "center",
        flex: 1,
        marginHorizontal: 15,
    },
    dateRangeText: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 4,
    },
    todayButton: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    todayButtonText: {
        fontSize: 11,
        fontWeight: "500",
    },
    legendContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 15,
        gap: 20,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 2,
    },
    legendMarker: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 12,
    },
    chartContainer: {
        marginBottom: 15,
    },
    chartLabels: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    yAxisLabels: {
        width: 45,
        height: 120,
        justifyContent: "space-between",
        alignItems: "flex-end",
        paddingRight: 3,
    },
    yAxisText: {
        fontSize: 9,
        textAlign: "right",
        fontWeight: "500",
    },
    chartArea: {
        flex: 1,
        alignItems: "flex-start",
        overflow: "hidden",
    },
    chartBackground: {
        backgroundColor: "#FAFAFA",
        borderWidth: 1,
        borderColor: "#999999",
        borderRadius: 4,
        position: "relative",
        flex: 1,
        overflow: "hidden",
    },
    yAxisLine: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: 2,
        backgroundColor: "#666666",
    },
    xAxisLine: {
        width: "100%",
        height: 3,
        backgroundColor: "#333333",
        marginTop: 2,
        marginBottom: 2,
    },
    chartBar: {
        position: "absolute",
        bottom: 0,
        borderRadius: 1,
    },
    xAxisContainer: {
        width: "100%",
        height: 20,
        position: "relative",
        marginTop: 5,
    },
    xAxisText: {
        position: "absolute",
        fontSize: 11,
        fontWeight: "500",
        textAlign: "center",
    },
    summaryContainer: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: "#FCE4EC",
    },
    summaryTitle: {
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 10,
    },
    summaryStats: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    summaryItem: {
        alignItems: "center",
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: "bold",
    },
    summaryLabel: {
        fontSize: 11,
        marginTop: 2,
    },
});

export default MenstrualChart;