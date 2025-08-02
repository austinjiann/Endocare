import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEndoCare } from '../context/EndoCareContext';
import SymptomSlider from '../components/SymptomSlider';

// We’re using the EndoCareContext’s addSleepLog under the hood,
// so no need to import insertSleep/getAllSleep directly here.


const SleepScreen = () => {
  const { state, addSleepLog } = useEndoCare();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [hoursSlept, setHoursSlept] = useState('');
  const [sleepQuality, setSleepQuality] = useState(1);
  const [nausea, setNausea] = useState(1);
  const [fatigue, setFatigue] = useState(1);
  const [pain, setPain] = useState(1);
  const [sleepDisruptions, setSleepDisruptions] = useState('');
  const [notes, setNotes] = useState('');

  const handleLogSleep = async () => {
    const hours = parseFloat(hoursSlept);
    
    if (!selectedDate || !hoursSlept || isNaN(hours)) {
      Alert.alert('Error', 'Please enter a date and hours slept');
      return;
    }

    if (hours < 0 || hours > 24) {
      Alert.alert('Error', 'Hours slept must be between 0 and 24');
      return;
    }

   try {
      // match the InsertSleepRequest type exactly:
      await addSleepLog({
        date:        selectedDate,
        duration:    hours,           // formerly `hoursSlept`
        quality:     sleepQuality,    // formerly `sleepQuality`
        disruptions: sleepDisruptions.trim(),
        notes:       notes.trim(),
    });

      // Reset form
      setHoursSlept('');
      setSleepQuality(1);
      setNausea(1);
      setFatigue(1);
      setPain(1);
      setSleepDisruptions('');
      setNotes('');
      Alert.alert('Success', 'Sleep log added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add sleep log. Please try again.');
    }
  };

  const getSleepInsights = () => {
    const recentLogs = state.sleepLogs.slice(-7);
    if (recentLogs.length < 3) return 'Track more nights to see sleep patterns';
    
    const avgHours = recentLogs.reduce((sum, log) => sum + log.hoursSlept, 0) / recentLogs.length;
    const avgQuality = recentLogs.reduce((sum, log) => sum + log.sleepQuality, 0) / recentLogs.length;
    const avgMorningPain = recentLogs.reduce((sum, log) => 
      sum + (log.morningSymptoms?.pain || 0), 0) / recentLogs.length;
    
    let insight = '';
    
    if (avgHours < 6) {
      insight += '⚠️ Getting less than 6 hours of sleep regularly. Poor sleep can worsen endometriosis symptoms. ';
    } else if (avgHours > 9) {
      insight += '💤 Sleeping more than 9 hours regularly may indicate fatigue from symptoms. ';
    } else {
      insight += '✅ Sleep duration appears healthy (6-9 hours). ';
    }
    
    if (avgQuality < 4) {
      insight += '😴 Low sleep quality detected. Consider sleep hygiene improvements. ';
    }
    
    if (avgMorningPain > 5) {
      insight += '🌅 High morning pain levels may be disrupting sleep recovery. ';
    }
    
    // Check for disruption patterns
    const disruptedNights = recentLogs.filter(log => 
      log.sleepDisruptions && log.sleepDisruptions.toLowerCase().includes('pain')
    ).length;
    
    if (disruptedNights > recentLogs.length / 2) {
      insight += '📊 Pain is frequently disrupting your sleep. Consider discussing pain management with your healthcare provider.';
    }
    
    return insight || 'Sleep patterns appear stable. Keep tracking for better insights.';
  };

  const getAverageStats = () => {
    const recent = state.sleepLogs.slice(-7);
    if (recent.length === 0) return { hours: 0, quality: 0 };
    
    return {
      hours: (recent.reduce((sum, log) => sum + log.hoursSlept, 0) / recent.length).toFixed(1),
      quality: (recent.reduce((sum, log) => sum + log.sleepQuality, 0) / recent.length).toFixed(1),
    };
  };

  const avgStats = getAverageStats();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Sleep Tracker</Text>
      <Text style={styles.subheader}>Monitor sleep quality and morning symptoms</Text>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Sleep Stats */}
        {state.sleepLogs.length > 0 && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>7-Day Sleep Averages</Text>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{avgStats.hours}h</Text>
                <Text style={styles.statLabel}>Avg Hours</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{avgStats.quality}/10</Text>
                <Text style={styles.statLabel}>Avg Quality</Text>
              </View>
            </View>
          </View>
        )}

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date</Text>
          <TextInput
            style={styles.dateInput}
            value={selectedDate}
            onChangeText={setSelectedDate}
            placeholder="YYYY-MM-DD"
          />
        </View>

        {/* Hours Slept */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hours Slept</Text>
          <TextInput
            style={styles.hoursInput}
            value={hoursSlept}
            onChangeText={setHoursSlept}
            placeholder="e.g., 7.5"
            keyboardType="decimal-pad"
          />
        </View>

        {/* Sleep Quality */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sleep Quality</Text>
          <Text style={styles.sectionSubtitle}>
            Rate overall sleep quality (1-10 scale)
          </Text>
          
          <SymptomSlider
            label="Sleep Quality"
            value={sleepQuality}
            onValueChange={setSleepQuality}
            color="#FF6B9D"
            description="1 = Terrible sleep, 10 = Perfect sleep"
          />
        </View>

        
        {/* Sleep Disruptions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sleep Disruptions</Text>
          <TextInput
            style={styles.disruptionsInput}
            value={sleepDisruptions}
            onChangeText={setSleepDisruptions}
            placeholder="e.g., pain, bathroom trips, anxiety, hot flashes..."
          />
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sleep Notes</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Bedtime routine, medications taken, dreams, how you felt..."
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Log Button */}
        <TouchableOpacity style={styles.logButton} onPress={handleLogSleep}>
          <Text style={styles.logButtonText}>Log Sleep Data</Text>
        </TouchableOpacity>

        {/* Sleep Insights */}
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Sleep Pattern Analysis</Text>
          <Text style={styles.insightText}>{getSleepInsights()}</Text>
          {/* TODO: Add sleep pattern graphs, bedtime tracking */}
          <Text style={styles.futureFeature}>
            📈 Coming soon: Sleep pattern visualization, bedtime tracking, and correlation with symptom flares
          </Text>
        </View>

        {/* Recent Sleep Logs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Sleep Logs</Text>
          {state.sleepLogs.length === 0 ? (
            <Text style={styles.emptyText}>No sleep logs yet</Text>
          ) : (
            state.sleepLogs.slice(-7).reverse().map(log => (
              <View key={log.id} style={styles.logCard}>
                <View style={styles.logHeader}>
                  <Text style={styles.logDate}>{log.date}</Text>
                  <View style={styles.sleepMetrics}>
                    <Text style={styles.sleepHours}>{log.duration}h</Text>
                    <Text style={styles.sleepQuality}>Quality: {log.quality}/10</Text>
                  </View>
                </View>
                
                {log.morningSymptoms && (
                  <Text style={styles.logSymptoms}>
                    Morning - Nausea: {log.morningSymptoms.nausea}, 
                    Fatigue: {log.morningSymptoms.fatigue}, 
                    Pain: {log.morningSymptoms.pain}
                  </Text>
                )}
                
                {log.sleepDisruptions && (
                  <Text style={styles.logDisruptions}>
                    Disruptions: {log.sleepDisruptions}
                  </Text>
                )}
                
                {log.notes && (
                  <Text style={styles.logNotes}>{log.notes}</Text>
                )}
              </View>
            ))
          )}
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
  statsContainer: {
    backgroundColor: '#FFE5F1',
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B9D',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B9D',
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 15,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#FFF',
    fontSize: 16,
  },
  hoursInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#FFF',
    fontSize: 16,
  },
  disruptionsInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#FFF',
    fontSize: 16,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#FFF',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  logButton: {
    backgroundColor: '#FF6B9D',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 25,
  },
  logButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  insightCard: {
    backgroundColor: '#FFE5F1',
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B9D',
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 10,
  },
  insightText: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 10,
  },
  futureFeature: {
    fontSize: 12,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
  logCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B9D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  sleepMetrics: {
    alignItems: 'flex-end',
  },
  sleepHours: {
    fontSize: 16,
    color: '#FF6B9D',
    fontWeight: '600',
  },
  sleepQuality: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  logSymptoms: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 4,
  },
  logDisruptions: {
    fontSize: 14,
    color: '#FF6B9D',
    marginBottom: 4,
  },
  logNotes: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 5,
    fontStyle: 'italic',
  },
});

export default SleepScreen;