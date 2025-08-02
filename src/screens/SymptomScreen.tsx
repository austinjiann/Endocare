import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  StatusBar 
} from 'react-native';
import { useEndoCare } from '../context/EndoCareContext';
import SymptomSlider from '../components/SymptomSlider';
import DatePickerInput from '../components/DatePickerInput';

const SymptomScreen = () => {
  const { state, addSymptomLog } = useEndoCare();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [nausea, setNausea] = useState(1);
  const [fatigue, setFatigue] = useState(1);
  const [pain, setPain] = useState(1);
  const [notes, setNotes] = useState('');

  const handleLogSymptoms = async () => {
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date');
      return;
    }

    try {
      await addSymptomLog({
        date: selectedDate,
        nausea,
        fatigue,
        pain,
        notes: notes.trim(),
      });

      // Reset form
      setNausea(1);
      setFatigue(1);
      setPain(1);
      setNotes('');
      Alert.alert('Success', 'Symptoms logged successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to log symptoms. Please try again.');
    }
  };

  const getSymptomInsight = () => {
    const recent = state.symptomLogs.slice(-7);
    if (recent.length === 0) return 'Start tracking to see insights';
    
    const avgPain = recent.reduce((sum, log) => sum + log.pain, 0) / recent.length;
    const avgNausea = recent.reduce((sum, log) => sum + log.nausea, 0) / recent.length;
    const avgFatigue = recent.reduce((sum, log) => sum + log.fatigue, 0) / recent.length;
    
    let insight = 'Recent averages: ';
    if (avgPain > 6) insight += 'High pain levels detected. ';
    if (avgNausea > 5) insight += 'Significant nausea patterns. ';
    if (avgFatigue > 7) insight += 'Elevated fatigue levels. ';
    
    return insight === 'Recent averages: ' ? 
      'Symptoms appear well-managed recently' : insight;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FFB380" />
      <View style={styles.headerContainer}>
        <View style={styles.headerGradient}>
          <Text style={styles.header}>Symptom Tracker</Text>
          <Text style={styles.subheader}>Record how you're feeling today</Text>
        </View>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date</Text>
          <DatePickerInput
            value={selectedDate}
            onDateChange={setSelectedDate}
            themeColor="#FFB380"
            placeholder="Select symptom date"
          />
        </View>

        {/* Symptom Sliders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Symptom Levels</Text>
          <Text style={styles.sectionSubtitle}>
            Rate each symptom from 1 (minimal) to 10 (extreme)
          </Text>
          
          <SymptomSlider
            label="Nausea"
            value={nausea}
            onValueChange={setNausea}
            color="#FFB380"
            description="Feeling sick, queasy, or wanting to vomit"
          />
          
          <SymptomSlider
            label="Fatigue"
            value={fatigue}
            onValueChange={setFatigue}
            color="#FFB380"
            description="Tiredness, exhaustion, lack of energy"
          />
          
          <SymptomSlider
            label="Pain"
            value={pain}
            onValueChange={setPain}
            color="#FFB380"
            description="Cramping, aching, sharp or dull pain"
          />
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Describe your symptoms, triggers, or how you're feeling..."
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Log Button */}
        <TouchableOpacity style={styles.logButton} onPress={handleLogSymptoms}>
          <Text style={styles.logButtonText}>Log Symptoms</Text>
        </TouchableOpacity>

        {/* Insights Card */}
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Recent Pattern Insight</Text>
          <Text style={styles.insightText}>{getSymptomInsight()}</Text>
          {/* TODO: Add graphical trend visualization */}
          <Text style={styles.futureFeature}>
            Coming soon: Visual symptom trends and correlation analysis
          </Text>
        </View>

        {/* Recent Symptom Logs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Symptom Logs</Text>
          {state.symptomLogs.length === 0 ? (
            <Text style={styles.emptyText}>No symptom logs yet</Text>
          ) : (
            state.symptomLogs.slice(-5).reverse().map(log => (
              <View key={log.id} style={styles.logCard}>
                <View style={styles.logHeader}>
                  <Text style={styles.logDate}>{log.date}</Text>
                  <View style={styles.logSymptoms}>
                    <View style={styles.symptomBadge}>
                      <Text style={[styles.symptomBadgeText, { color: '#FF8C42' }]}>
                        N: {log.nausea}
                      </Text>
                    </View>
                    <View style={styles.symptomBadge}>
                      <Text style={[styles.symptomBadgeText, { color: '#FF8C42' }]}>
                        F: {log.fatigue}
                      </Text>
                    </View>
                    <View style={styles.symptomBadge}>
                      <Text style={[styles.symptomBadgeText, { color: '#FF8C42' }]}>
                        P: {log.pain}
                      </Text>
                    </View>
                  </View>
                </View>
                {log.notes && (
                  <Text style={styles.logNotes}>{log.notes}</Text>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF6F2',
  },
  headerContainer: {
    marginBottom: 0,
  },
  headerGradient: {
    backgroundColor: '#FFB380',
    paddingTop: 60,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    shadowColor: '#FFB380',
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
  section: {
    marginBottom: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFB380',
    marginBottom: 15,
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
    backgroundColor: '#FFB380',
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
    backgroundColor: '#FFF2EB',
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB380',
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
    borderLeftColor: '#FFB380',
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
    marginBottom: 5,
  },
  logDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  logSymptoms: {
    flexDirection: 'row',
    gap: 8,
  },
  symptomBadge: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  symptomBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  logNotes: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 5,
  },
});

export default SymptomScreen;