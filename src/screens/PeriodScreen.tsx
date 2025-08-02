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

const PeriodScreen = () => {
  const { state, addPeriodLog } = useEndoCare();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [periodType, setPeriodType] = useState<'start' | 'end'>('start');
  const [flowLevel, setFlowLevel] = useState(1);
  const [nausea, setNausea] = useState(1);
  const [fatigue, setFatigue] = useState(1);
  const [pain, setPain] = useState(1);
  const [notes, setNotes] = useState('');

  const handleLogPeriod = async () => {
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date');
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
      setNotes('');
      Alert.alert('Success', 'Period log added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add period log. Please try again.');
    }
  };

  const TypeButton = ({ type, label }: { type: 'start' | 'end'; label: string }) => (
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
    const labels = ['', 'Spotting', 'Light', 'Medium', 'Heavy', 'Very Heavy'];
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
    if (recentPeriods.length < 2) return 'Track more cycles to see insights';
    
    const startDates = recentPeriods.filter(log => log.type === 'start');
    if (startDates.length < 2) return 'Need more cycle data for insights';
    
    // Calculate average pain during periods
    const avgPain = recentPeriods
      .filter(log => log.associatedSymptoms)
      .reduce((sum, log) => sum + (log.associatedSymptoms?.pain || 0), 0) / recentPeriods.length;
    
    let insight = '';
    if (avgPain > 7) {
      insight = '⚠️ High pain levels during periods. Consider discussing pain management with your healthcare provider.';
    } else if (avgPain > 4) {
      insight = '📊 Moderate pain levels detected. Track triggers and relief methods.';
    } else {
      insight = '✅ Pain levels appear manageable during recent cycles.';
    }
    
    return insight;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Period Tracker</Text>
      <Text style={styles.subheader}>Track your cycle and associated symptoms</Text>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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

        {/* Period Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Period Event</Text>
          <View style={styles.typeContainer}>
            <TypeButton type="start" label="Period Start" />
            <TypeButton type="end" label="Period End" />
          </View>
        </View>

        {/* Flow Level (only for start events) */}
        {periodType === 'start' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Flow Level</Text>
            <Text style={styles.sectionSubtitle}>How heavy is your flow today?</Text>
            <View style={styles.flowContainer}>
              {[1, 2, 3, 4, 5].map(level => (
                <FlowLevelButton key={level} level={level} />
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
          <Text style={styles.insightText}>{getCycleInsights()}</Text>
          {/* TODO: Add cycle length calculation, ovulation prediction */}
          <Text style={styles.futureFeature}>
            📅 Coming soon: Cycle length tracking, ovulation prediction, and symptom pattern analysis
          </Text>
        </View>

        {/* Recent Period Logs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Period Logs</Text>
          {state.periodLogs.length === 0 ? (
            <Text style={styles.emptyText}>No period logs yet</Text>
          ) : (
            state.periodLogs.slice(-8).reverse().map(log => (
              <View key={log.id} style={styles.logCard}>
                <View style={styles.logHeader}>
                  <Text style={styles.logDate}>{log.date}</Text>
                  <View style={styles.logTypeContainer}>
                    <Text style={[
                      styles.logType,
                      log.type === 'start' ? styles.startType : styles.endType
                    ]}>
                      {log.type === 'start' ? 'Start' : 'End'}
                    </Text>
                  </View>
                </View>
                
                {log.flowLevel && (
                  <Text style={styles.logDetail}>
                    Flow Level: {log.flowLevel}/5
                  </Text>
                )}
                
                {log.associatedSymptoms && (
                  <View style={styles.symptomRow}>
                    <Text style={styles.logDetail}>
                      Symptoms - Nausea: {log.associatedSymptoms.nausea}, 
                      Fatigue: {log.associatedSymptoms.fatigue}, 
                      Pain: {log.associatedSymptoms.pain}
                    </Text>
                  </View>
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
  typeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  typeButtonSelected: {
    backgroundColor: '#FFE5F1',
    borderColor: '#FF6B9D',
  },
  typeButtonText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  typeButtonTextSelected: {
    color: '#FF6B9D',
    fontWeight: '600',
  },
  flowContainer: {
    gap: 10,
  },
  flowButton: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  flowButtonSelected: {
    backgroundColor: '#FFE5F1',
    borderColor: '#FF6B9D',
  },
  flowButtonText: {
    fontSize: 14,
    color: '#2C3E50',
  },
  flowButtonTextSelected: {
    color: '#FF6B9D',
    fontWeight: '600',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#FFF',
    fontSize: 16,
    minHeight: 100,
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
  logTypeContainer: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  logType: {
    fontSize: 12,
    fontWeight: '600',
  },
  startType: {
    color: '#FF6B9D',
  },
  endType: {
    color: '#E91E63',
  },
  logDetail: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 4,
  },
  symptomRow: {
    marginBottom: 4,
  },
  logNotes: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 5,
    fontStyle: 'italic',
  },
});

export default PeriodScreen;