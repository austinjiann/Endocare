import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

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
      
      {/* Slider component */}
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={value}
          onValueChange={onValueChange}
          minimumTrackTintColor={color}
          maximumTrackTintColor="#E0E0E0"
          thumbStyle={{ backgroundColor: color, width: 20, height: 20 }}
        />
      </View>
      
      {/* Scale numbers */}
      <View style={styles.scaleNumbers}>
        <Text style={styles.scaleNumberText}>1</Text>
        <Text style={styles.scaleNumberText}>5</Text>
        <Text style={styles.scaleNumberText}>10</Text>
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
  sliderContainer: {
    marginVertical: 15,
    paddingHorizontal: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  scaleNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: -5,
    marginBottom: 5,
  },
  scaleNumberText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500',
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