import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useEndoCare } from '../context/EndoCareContext';
import PredictionSummaryBoard from '../components/PredictionSummaryBoard';
import TriggerHeatmap from '../components/TriggerHeatmap';

const DashboardScreen = ({ navigation }: any) => {
  const { state } = useEndoCare();

  // Get recent data for overview cards
  const recentSymptomLog = state.symptomLogs[state.symptomLogs.length - 1];
  const recentPeriodLog = state.periodLogs[state.periodLogs.length - 1];
  const recentFoodLog = state.foodLogs[state.foodLogs.length - 1];
  const recentSleepLog = state.sleepLogs[state.sleepLogs.length - 1];

  // Calculate average symptom levels from recent logs (last 7 days)
  const getAverageSymptomLevels = () => {
    const recent = state.symptomLogs.slice(-7);
    if (recent.length === 0) return { nausea: 0, fatigue: 0, pain: 0 };
    
    const totals = recent.reduce(
      (acc, log) => ({
        nausea: acc.nausea + log.nausea,
        fatigue: acc.fatigue + log.fatigue,
        pain: acc.pain + log.pain,
      }),
      { nausea: 0, fatigue: 0, pain: 0 }
    );
    
    return {
      nausea: (totals.nausea / recent.length).toFixed(1),
      fatigue: (totals.fatigue / recent.length).toFixed(1),
      pain: (totals.pain / recent.length).toFixed(1),
    };
  };

  const avgSymptoms = getAverageSymptomLevels();

  const TrackerCard = ({ 
    title, 
    subtitle, 
    onPress, 
    backgroundColor, 
    iconText 
  }: any) => (
    <TouchableOpacity 
      style={[styles.trackerCard, { backgroundColor }]} 
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );

  const SymptomOverviewCard = () => (
    <View style={styles.symptomOverviewCard}>
      <Text style={styles.overviewTitle}>7-Day Symptom Averages</Text>
      <View style={styles.symptomRow}>
        <View style={styles.symptomItem}>
          <Text style={[styles.symptomValue, { color: '#C8A8D8' }]}>
            {avgSymptoms.nausea}
          </Text>
          <Text style={styles.symptomLabel}>Nausea</Text>
        </View>
        <View style={styles.symptomItem}>
          <Text style={[styles.symptomValue, { color: '#C8A8D8' }]}>
            {avgSymptoms.fatigue}
          </Text>
          <Text style={styles.symptomLabel}>Fatigue</Text>
        </View>
        <View style={styles.symptomItem}>
          <Text style={[styles.symptomValue, { color: '#C8A8D8' }]}>
            {avgSymptoms.pain}
          </Text>
          <Text style={styles.symptomLabel}>Pain</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#C8A8D8" />
      <View style={styles.headerContainer}>
        <View style={styles.headerGradient}>
          <Text style={styles.header}>EndoCare Dashboard</Text>
          <Text style={styles.subheader}>Managing endometriosis together</Text>
        </View>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Prediction and summary board */}
        <PredictionSummaryBoard />
        
        {/* Symptom overview */}
        <SymptomOverviewCard />
        
        {/* Trigger Severity Heatmap */}
        <TriggerHeatmap />
        
        {/* Navigation cards */}
        <Text style={styles.sectionTitle}>Track Your Health</Text>
        
        <TrackerCard
          title="Period Tracker"
          subtitle={recentPeriodLog ? 
            `Last: ${recentPeriodLog.type} on ${new Date(recentPeriodLog.date).toLocaleDateString()}` : 
            'Start tracking your cycle'
          }
          backgroundColor="#F4F1F7"
          iconText=""
          onPress={() => navigation.navigate('Period')}
        />
        
        <TrackerCard
          title="Food & Triggers"
          subtitle={recentFoodLog ? 
            `Last meal: ${recentFoodLog.foodItems.substring(0, 30)}...` : 
            'Track potential trigger foods'
          }
          backgroundColor="#F4F1F7"
          iconText=""
          onPress={() => navigation.navigate('Food')}
        />
        
        <TrackerCard
          title="Sleep Patterns"
          subtitle={recentSleepLog ? 
            `Last night: ${recentSleepLog.hoursSlept}h (${recentSleepLog.sleepQuality}/10)` : 
            'Monitor sleep quality'
          }
          backgroundColor="#F4F1F7"
          iconText=""
          onPress={() => navigation.navigate('Sleep')}
        />
        
        {/* Quick access to detailed symptom logging */}
        <TouchableOpacity 
          style={styles.detailedSymptomButton}
          onPress={() => navigation.navigate('Symptoms')}
        >
          <Text style={styles.detailedSymptomText}>
            Detailed Symptom Tracker
          </Text>
          <Text style={styles.detailedSymptomSubtext}>
            Log comprehensive symptom data
          </Text>
        </TouchableOpacity>
        
        {/* Stats summary */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Tracking Progress</Text>
          <Text style={styles.statsText}>
            Total Entries: {state.symptomLogs.length + state.periodLogs.length + state.foodLogs.length + state.sleepLogs.length}
          </Text>
          <Text style={styles.statsText}>
            Period Logs: {state.periodLogs.length}
          </Text>
          <Text style={styles.statsText}>
            Food Logs: {state.foodLogs.length}
          </Text>
          <Text style={styles.statsText}>
            Sleep Logs: {state.sleepLogs.length}
          </Text>
          <Text style={styles.statsText}>
            Symptom Logs: {state.symptomLogs.length}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F1F7',
    paddingHorizontal: 0,
  },
  headerContainer: {
    marginBottom: 0,
    position: 'relative',
  },
  headerGradient: {
    backgroundColor: '#C8A8D8',
    paddingTop: 60,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    shadowColor: '#C8A8D8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subheader: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  symptomOverviewCard: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
    borderLeftWidth: 4,
    borderLeftColor: '#C8A8D8',
  },
  overviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 15,
  },
  symptomRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  symptomItem: {
    alignItems: 'center',
  },
  symptomValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  symptomLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#C8A8D8',
    marginBottom: 20,
    marginTop: 10,
  },
  trackerCard: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#C8A8D8',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  detailedSymptomButton: {
    backgroundColor: '#C8A8D8',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 25,
  },
  detailedSymptomText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  detailedSymptomSubtext: {
    color: '#E8E8E8',
    fontSize: 14,
    marginTop: 5,
  },
  statsContainer: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 15,
  },
  statsText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 5,
  },
});

export default DashboardScreen;