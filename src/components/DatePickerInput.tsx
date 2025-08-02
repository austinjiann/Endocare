import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DatePickerInputProps {
  value: string; // ISO date string
  onDateChange: (date: string) => void;
  placeholder?: string;
  themeColor?: string;
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({
  value,
  onDateChange,
  placeholder = "Select Date",
  themeColor = "#C8A8D8"
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const formatDate = (dateString: string): string => {
    if (!dateString) return placeholder;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    
    if (selectedDate) {
      const isoString = selectedDate.toISOString().split('T')[0];
      onDateChange(isoString);
    }
  };

  const openPicker = () => {
    setShowPicker(true);
  };

  return (
    <View>
      <TouchableOpacity 
        style={[styles.dateButton, { borderColor: themeColor }]} 
        onPress={openPicker}
      >
        <Text style={[styles.dateText, { color: value ? '#2C3E50' : '#7F8C8D' }]}>
          {formatDate(value)}
        </Text>
        <Text style={[styles.calendarIcon, { color: themeColor }]}>📅</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#FFF',
  },
  dateText: {
    fontSize: 16,
    flex: 1,
  },
  calendarIcon: {
    fontSize: 18,
    marginLeft: 10,
  },
});

export default DatePickerInput;