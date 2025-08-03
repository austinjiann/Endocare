import React, { useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useEndoCare } from "../context/EndoCareContext";
import { useAlert } from "../context/AlertContext";
import DatePickerInput from "../components/DatePickerInput";
import MenstrualChart from "../components/MenstrualChart";

const PeriodScreen = () => {
    const { state, addPeriodLog } = useEndoCare();
    const { showAlert } = useAlert();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [periodType, setPeriodType] = useState<"start" | "end">("start");
    const [flowLevel, setFlowLevel] = useState(1);
    const [nausea, setNausea] = useState(1);
    const [fatigue, setFatigue] = useState(1);
    const [pain, setPain] = useState(1);
    const [notes, setNotes] = useState("");

    const handleLogPeriod = async () => {
        if (!selectedDate) {
            showAlert({
                title: "Error",
                message: "Please select a date",
                type: "error",
                themeColor: "#F4A8C0"
            });
            return;
        }

        try {
            await addPeriodLog({
                date: selectedDate,
                type: periodType,
                flowLevel,
                associatedSymptoms: {
                    nausea,
                    fatigue,
                    pain,
                },
                notes: notes.trim(),
            });

            // Reset form
            setFlowLevel(1);
            setNausea(1);
            setFatigue(1);
            setPain(1);
            setNotes("");
            showAlert({
                title: "Success",
                message: "Period log added successfully!",
                type: "success",
                themeColor: "#F4A8C0"
            });
        } catch (error) {
            showAlert({
                title: "Error",
                message: "Failed to add period log. Please try again.",
                type: "error",
                themeColor: "#F4A8C0"
            });
        }
    };

    const TypeButton = ({ type, label }: {
        type: "menstruation" | "follicular" | "ovulation" | "luteal";
        label: string
    }) => (
        <TouchableOpacity
            style={[
                styles.typeButton,
                periodType === type && styles.typeButtonSelected
            ]}
            onPress={() => setPeriodType(type)}
        >
            <Text style={[
                styles.typeButtonText,
                periodType === type && styles.typeButtonTextSelected
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    const FlowLevelButton = ({ level }: { level: number }) => {
        const labels = ["", "Spotting", "Light", "Medium", "Heavy", "Very Heavy"];
        return (
            <TouchableOpacity
                style={[
                    styles.flowButton,
                    flowLevel === level && styles.flowButtonSelected
                ]}
                onPress={() => setFlowLevel(level)}
            >
                <Text style={[
                    styles.flowButtonText,
                    flowLevel === level && styles.flowButtonTextSelected
                ]}>
                    {level}: {labels[level]}
                </Text>
            </TouchableOpacity>
        );
    };

    const getCycleInsights = () => {
        const recentPeriods = state.periodLogs.slice(-6); // Last 3 cycles
        if (recentPeriods.length < 2) return "Track more cycles to see insights";

        const startDates = recentPeriods.filter(log => log.type === "start");
        if (startDates.length < 2) return "Need more cycle data for insights";

        // Calculate average pain during periods
        const avgPain = recentPeriods
            .filter(log => log.associatedSymptoms)
            .reduce((sum, log) => sum + (log.associatedSymptoms?.pain || 0), 0) / recentPeriods.length;

        let insight = "";
        if (avgPain > 7) {
            insight = "High pain levels during periods. Consider discussing pain management with your healthcare provider.";
        } else if (avgPain > 4) {
            insight = "Moderate pain levels detected. Track triggers and relief methods.";
        } else {
            insight = "Pain levels appear manageable during recent cycles.";
        }

        return insight;
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#F4A8C0"/>
            <View style={styles.headerContainer}>
                <View style={styles.headerGradient}>
                    <Text style={styles.header}>Period Tracker</Text>
                    <Text style={styles.subheader}>Track your cycle and associated symptoms</Text>
                </View>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Date Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Date</Text>
                    <DatePickerInput
                        value={selectedDate}
                        onDateChange={setSelectedDate}
                        themeColor="#F4A8C0"
                        placeholder="Select period date"
                    />
                </View>

                {/* Period Type */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Period Event</Text>
                    <View style={styles.typeContainer}>
                        <TypeButton type="menstruation" label="Menstruation"/>
                        <TypeButton type="follicular" label="Follicular"/>
                    </View>
                    <Text>​</Text>
                    <View style={styles.typeContainer}>
                        <TypeButton type="ovulation" label="Ovulation"/>
                        <TypeButton type="luteal" label="Luteal"/>
                    </View>
                </View>

                {/* Flow Level (only for start events) */}
                {periodType === "start" && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Flow Level</Text>
                        <Text style={styles.sectionSubtitle}>How heavy is your flow today?</Text>
                        <View style={styles.flowContainer}>
                            {[1, 2, 3, 4, 5].map(level => (
                                <FlowLevelButton key={level} level={level}/>
                            ))}
                        </View>
                    </View>
                )}


                {/* Notes */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notes</Text>
                    <TextInput
                        style={styles.notesInput}
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Medications taken, mood, other symptoms, etc..."
                        multiline
                        numberOfLines={4}
                    />
                </View>

                {/* Log Button */}
                <TouchableOpacity style={styles.logButton} onPress={handleLogPeriod}>
                    <Text style={styles.logButtonText}>Log Period Data</Text>
                </TouchableOpacity>

                {/* Cycle Insights */}
                <View style={styles.insightCard}>
                    <Text style={styles.insightTitle}>Cycle Insights</Text>
                    <Text style={styles.insightText}>Average flow level: Medium</Text>

                </View>

                {/* Menstrual Cycle Chart */}
                <MenstrualChart
                    periodLogs={[
                        {
                            id: "1",
                            date: "2023-10-01",
                            type: "menstruation",
                            flowLevel: "light",
                            notes: "Started period, mild cramps",
                        }
                    ]}
                    title="Menstrual Cycle Trends"
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FAF4F7",
    },
    headerContainer: {
        marginBottom: 0,
    },
    headerGradient: {
        backgroundColor: "#F4A8C0",
        paddingTop: 60,
        paddingBottom: 25,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 35,
        shadowColor: "#F4A8C0",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    header: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 8,
        textAlign: "center",
    },
    subheader: {
        fontSize: 16,
        color: "#FFFFFF",
        textAlign: "center",
        opacity: 0.9,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    section: {
        marginBottom: 30,
        backgroundColor: "#FFFFFF",
        borderRadius: 15,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#F4A8C0",
        marginBottom: 15,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: "#7F8C8D",
        marginBottom: 15,
    },
    dateInput: {
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 10,
        padding: 15,
        backgroundColor: "#FFF",
        fontSize: 16,
    },
    typeContainer: {
        flexDirection: "row",
        gap: 10,
    },
    typeButton: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#E0E0E0",
        alignItems: "center",
    },
    typeButtonSelected: {
        backgroundColor: "#FBEDF2",
        borderColor: "#F4A8C0",
    },
    typeButtonText: {
        fontSize: 16,
        color: "#2C3E50",
    },
    typeButtonTextSelected: {
        color: "#F4A8C0",
        fontWeight: "600",
    },
    flowContainer: {
        gap: 10,
    },
    flowButton: {
        padding: 12,
        borderRadius: 10,
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#E0E0E0",
        alignItems: "center",
    },
    flowButtonSelected: {
        backgroundColor: "#FBEDF2",
        borderColor: "#F4A8C0",
    },
    flowButtonText: {
        fontSize: 14,
        color: "#2C3E50",
    },
    flowButtonTextSelected: {
        color: "#F4A8C0",
        fontWeight: "600",
    },
    notesInput: {
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 10,
        padding: 15,
        backgroundColor: "#FFF",
        fontSize: 16,
        minHeight: 100,
        textAlignVertical: "top",
    },
    logButton: {
        backgroundColor: "#F4A8C0",
        padding: 18,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 25,
    },
    logButtonText: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "600",
    },
    insightCard: {
        backgroundColor: "#FBEDF2",
        padding: 20,
        borderRadius: 15,
        marginBottom: 25,
        borderLeftWidth: 4,
        borderLeftColor: "#F4A8C0",
    },
    insightTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2C3E50",
        marginBottom: 10,
    },
    insightText: {
        fontSize: 14,
        color: "#2C3E50",
        marginBottom: 10,
    },
    futureFeature: {
        fontSize: 12,
        color: "#7F8C8D",
        fontStyle: "italic",
    },
});

export default PeriodScreen;