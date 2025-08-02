import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useEndoCare } from '../context/EndoCareContext';

const QuickSymptomLogger: React.FC = () => {
  const { addSymptomLog } = useEndoCare();
  const [nausea, setNausea] = useState(1);
  const [fatigue, setFatigue] = useState(1);
  const [pain, setPain] = useState(1);

  const handleQuickLog = () => {
    const today = new Date().toISOString().split('T')[0];
    
    addSymptomLog({
      date: today,
      nausea,
      fatigue,
      pain,
      notes: 'Quick log from dashboard'
    });

    Alert.alert('Success', 'Symptoms logged successfully!');
    
    // Reset to minimal levels
    setNausea(1);
    setFatigue(1);
    setPain(1);
  };

  const QuickSlider = ({ 
    label, 
    value, 
    onValueChange, 
    color 
  }: { 
    label: string; 
    value: number; 
    onValueChange: (val: number) => void; 
    color: string; 
  }) => (
    <View style={styles.quickSliderContainer}>
      <Text style={styles.quickSliderLabel}>{label}</Text>
      <View style={styles.quickButtonRow}>
        {[1, 2, 3, 4, 5].map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.quickButton,
              value === num && { backgroundColor: color },
            ]}
            onPress={() => onValueChange(num)}
          >
            <Text
              style={[
                styles.quickButtonText,
                value === num && { color: '#FFF' },
              ]}
            >
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Symptom Check</Text>
      <Text style={styles.subtitle}>How are you feeling right now?</Text>
      
      <QuickSlider
        label="Nausea"
        value={nausea}
        onValueChange={setNausea}
        color="#FF6B9D"
      />
      
      <QuickSlider
        label="Fatigue"
        value={fatigue}
        onValueChange={setFatigue}
        color="#E91E63"
      />
      
      <QuickSlider
        label="Pain"
        value={pain}
        onValueChange={setPain}
        color="#FF6B9D"
      />
      
      <TouchableOpacity style={styles.logButton} onPress={handleQuickLog}>
        <Text style={styles.logButtonText}>Log Symptoms</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFE5F1',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 20,
  },
  quickSliderContainer: {
    marginBottom: 15,
  },
  quickSliderLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
    marginBottom: 8,
  },
  quickButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickButton: {
    width: 35,
    height: 35,
    borderRadius: 17,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  logButton: {
    backgroundColor: '#FF6B9D',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  logButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QuickSymptomLogger;