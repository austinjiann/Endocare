import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEndoCare } from '../context/EndoCareContext';
import PredictionSummaryBoard from '../components/PredictionSummaryBoard';

const DashboardScreen = ({ navigation }: any) => {
  const { state, syncWithBackend } = useEndoCare();

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
        <Text style={styles.cardIcon}>{iconText}</Text>
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
          <Text style={[styles.symptomValue, { color: '#FF6B9D' }]}>
            {avgSymptoms.nausea}
          </Text>
          <Text style={styles.symptomLabel}>Nausea</Text>
        </View>
        <View style={styles.symptomItem}>
          <Text style={[styles.symptomValue, { color: '#E91E63' }]}>
            {avgSymptoms.fatigue}
          </Text>
          <Text style={styles.symptomLabel}>Fatigue</Text>
        </View>
        <View style={styles.symptomItem}>
          <Text style={[styles.symptomValue, { color: '#FF6B9D' }]}>
            {avgSymptoms.pain}
          </Text>
          <Text style={styles.symptomLabel}>Pain</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.header}>EndoCare</Text>
          <Text style={styles.subheader}>Managing endometriosis together</Text>
        </View>
        <View style={styles.statusContainer}>
          {state.isLoading && <ActivityIndicator size="small" color="#FF6B9D" />}
          <View style={[styles.statusDot, { 
            backgroundColor: 
              state.connectionStatus === 'online' ? '#E91E63' : 
              state.connectionStatus === 'checking' || state.connectionStatus === 'retrying' ? '#FF6B9D' : 
              '#FF6B9D' 
          }]} />
          <Text style={styles.statusText}>
            {state.connectionStatus === 'online' ? 'Online' : 
             state.connectionStatus === 'checking' ? 'Checking...' :
             state.connectionStatus === 'retrying' ? 'Connecting...' :
             'Offline'}
          </Text>
          {state.connectionStatus === 'offline' && (
            <TouchableOpacity onPress={syncWithBackend} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Prediction and summary board */}
        <PredictionSummaryBoard />
        
        {/* Symptom overview */}
        <SymptomOverviewCard />
        
        {/* Navigation cards */}
        <Text style={styles.sectionTitle}>Track Your Health</Text>
        
        <TrackerCard
          title="Period Tracker"
          subtitle={recentPeriodLog ? 
            `Last: ${recentPeriodLog.type} on ${new Date(recentPeriodLog.date).toLocaleDateString()}` : 
            'Start tracking your cycle'
          }
          backgroundColor="#FFE5F1"
          iconText="🩸"
          onPress={() => navigation.navigate('Period')}
        />
        
        <TrackerCard
          title="Food & Triggers"
          subtitle={recentFoodLog ? 
            `Last meal: ${recentFoodLog.foodItems.substring(0, 30)}...` : 
            'Track potential trigger foods'
          }
          backgroundColor="#FFE5F1"
          iconText="🍽️"
          onPress={() => navigation.navigate('Food')}
        />
        
        <TrackerCard
          title="Sleep Patterns"
          subtitle={recentSleepLog ? 
            `Last night: ${recentSleepLog.hoursSlept}h (${recentSleepLog.sleepQuality}/10)` : 
            'Monitor sleep quality'
          }
          backgroundColor="#FFE5F1"
          iconText="😴"
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
            📊 Total Entries: {state.symptomLogs.length + state.periodLogs.length + state.foodLogs.length + state.sleepLogs.length}
          </Text>
          <Text style={styles.statsText}>
            🩸 Period Logs: {state.periodLogs.length}
          </Text>
          <Text style={styles.statsText}>
            🍽️ Food Logs: {state.foodLogs.length}
          </Text>
          <Text style={styles.statsText}>
            😴 Sleep Logs: {state.sleepLogs.length}
          </Text>
          <Text style={styles.statsText}>
            📝 Symptom Logs: {state.symptomLogs.length}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFEFE',
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  retryText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '600',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  subheader: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  symptomOverviewCard: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B9D',
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
    color: '#2C3E50',
    marginBottom: 15,
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  detailedSymptomButton: {
    backgroundColor: '#FF6B9D',
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