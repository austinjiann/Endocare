import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { fetchFlareupPrediction, fetchRecommendations } from "../services/api";

const PredictionSummaryBoard: React.FC = () => {
    // Mock data - will be replaced with actual backend predictions
    const [recommendations, setRecommendations] = React.useState<string[]>(["Loading..."]);
    const [flarePrediction, setFlarePrediction] = React.useState({
        flareup_predictions: [
            "Loading..."
        ],
        flareup_probability: "Loading...",
    });
    React.useEffect(() => {
        const loadRecommendations = () => {
            try {
                const data = fetchRecommendations().then(response => setRecommendations(response));
            } catch (error) {
                console.error("Failed to fetch recommendations:", error);
            }
        };
        loadRecommendations();
    }, []);

    React.useEffect(() => {
        const loadFlarePrediction = () => {
            try {
                const data = fetchFlareupPrediction().then(response => setFlarePrediction(response));
            } catch (error) {
                console.error("Failed to fetch flare prediction:", error);
            }
        };
        loadFlarePrediction();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Health Predictions & Recommendations</Text>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recommendations</Text>
                </View>
                {recommendations.map((item, index) => (
                    <View key={index} style={styles.recommendationItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.recommendationText}>{item}</Text>
                    </View>
                ))}
            </View>

            {/* Flare Prediction Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Next Flare Prediction</Text>
                </View>
                <View style={styles.predictionContainer}>
                    {flarePrediction.flareup_predictions.map((cause, index) => (
                        <View style={styles.predictionRow} key={index}>
                            <Text key={index} style={styles.predictionValue}>
                                {cause}
                            </Text>
                        </View>
                    ))}
                    <View style={styles.predictionRow}>
                        <Text style={styles.predictionLabel}>Probability: {flarePrediction.flareup_probability}%</Text>
                    </View>
                </View>
            </View>

            <Text style={styles.disclaimer}>
                * Predictions based on your tracking data. Consult healthcare providers for medical decisions.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#F4F1F7",
        padding: 20,
        borderRadius: 15,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: "#C8A8D8",
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: "#2C3E50",
        marginBottom: 20,
        textAlign: "center",
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    sectionIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2C3E50",
    },
    recommendationItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 8,
        paddingLeft: 8,
    },
    bullet: {
        fontSize: 14,
        color: "#7F8C8D",
        marginRight: 8,
        marginTop: 2,
    },
    recommendationText: {
        fontSize: 14,
        color: "#2C3E50",
        flex: 1,
        lineHeight: 20,
    },
    predictionContainer: {
        backgroundColor: "#FFFFFF",
        padding: 15,
        borderRadius: 10,
        marginTop: 5,
    },
    predictionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    predictionLabel: {
        fontSize: 14,
        color: "#7F8C8D",
        fontWeight: "500",
    },
    predictionValue: {
        fontSize: 14,
        fontWeight: "600",
        color: "#2C3E50",
    },
    disclaimer: {
        fontSize: 11,
        color: "#C8A8D8",
        fontStyle: "italic",
        textAlign: "center",
        marginTop: 10,
    },
});

export default PredictionSummaryBoard;