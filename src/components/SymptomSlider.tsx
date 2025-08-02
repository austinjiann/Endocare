import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface SymptomSliderProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  color: string;
  description?: string;
}

const SymptomSlider: React.FC<SymptomSliderProps> = ({
  label,
  value,
  onValueChange,
  color,
  description,
}) => {
  const getIntensityLabel = (val: number): string => {
    if (val <= 2) return 'Minimal';
    if (val <= 4) return 'Mild';
    if (val <= 6) return 'Moderate';
    if (val <= 8) return 'Severe';
    return 'Extreme';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.valueContainer}>
          <Text style={[styles.value, { color }]}>{value}</Text>
          <Text style={styles.intensityLabel}>{getIntensityLabel(value)}</Text>
        </View>
      </View>
      
      {/* Custom slider using touchable buttons */}
      <View style={styles.buttonContainer}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.scaleButton,
              value === num && { backgroundColor: color },
            ]}
            onPress={() => onValueChange(num)}
          >
            <Text
              style={[
                styles.scaleButtonText,
                value === num && { color: '#FFF' },
              ]}
            >
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.scaleLabels}>
        <Text style={styles.scaleText}>Minimal</Text>
        <Text style={styles.scaleText}>Moderate</Text>
        <Text style={styles.scaleText}>Extreme</Text>
      </View>
      
      {description && (
        <Text style={styles.description}>{description}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 25,
    backgroundColor: '#FEFEFE',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  valueContainer: {
    alignItems: 'center',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  intensityLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
    flexWrap: 'wrap',
  },
  scaleButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFE5F1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  scaleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  scaleText: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  description: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 10,
    fontStyle: 'italic',
  },
});

export default SymptomSlider;