import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PredictionSummaryBoard: React.FC = () => {
  // Mock data - will be replaced with actual backend predictions
  const avoidanceRecommendations = [
    "High inflammatory foods (dairy, gluten)",
    "Excessive stress and lack of sleep",
    "Intense physical activity during flare-ups"
  ];

  const flareprediction = {
    severity: "Moderate",
    timeframe: "3-5 days",
    confidence: "75%"
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Health Predictions & Recommendations</Text>
      
      {/* Things to Avoid Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Things to Avoid</Text>
        </View>
        {avoidanceRecommendations.map((item, index) => (
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
          <View style={styles.predictionRow}>
            <Text style={styles.predictionLabel}>Severity:</Text>
            <Text style={[styles.predictionValue, { color: '#C8A8D8' }]}>
              {flareprediction.severity}
            </Text>
          </View>
          <View style={styles.predictionRow}>
            <Text style={styles.predictionLabel}>Expected in:</Text>
            <Text style={styles.predictionValue}>{flareprediction.timeframe}</Text>
          </View>
          <View style={styles.predictionRow}>
            <Text style={styles.predictionLabel}>Confidence:</Text>
            <Text style={[styles.predictionValue, { color: '#C8A8D8' }]}>
              {flareprediction.confidence}
            </Text>
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
    backgroundColor: '#F4F1F7',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#C8A8D8',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 14,
    color: '#7F8C8D',
    marginRight: 8,
    marginTop: 2,
  },
  recommendationText: {
    fontSize: 14,
    color: '#2C3E50',
    flex: 1,
    lineHeight: 20,
  },
  predictionContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginTop: 5,
  },
  predictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  predictionLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  predictionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  disclaimer: {
    fontSize: 11,
    color: '#C8A8D8',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default PredictionSummaryBoard;