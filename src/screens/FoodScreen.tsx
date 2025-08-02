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

const FoodScreen = () => {
  const { state, addFoodLog } = useEndoCare();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [foodItems, setFoodItems] = useState('');
  const [flareUpScore, setFlareUpScore] = useState(1);
  const [nausea, setNausea] = useState(1);
  const [fatigue, setFatigue] = useState(1);
  const [pain, setPain] = useState(1);
  const [timeAfterEating, setTimeAfterEating] = useState('');
  const [notes, setNotes] = useState('');

  const handleLogFood = async () => {
    console.log('[FoodScreen] handleLogFood called with:', {
      selectedDate,
      mealType,
      foodItems: foodItems.trim(),
      flareUpScore
    });

    if (!selectedDate || !foodItems.trim()) {
      console.log('[FoodScreen] Validation failed - missing date or food items');
      Alert.alert('Error', 'Please enter a date and food items');
      return;
    }

    try {
      console.log('[FoodScreen] About to call addFoodLog...');
      await addFoodLog({
        date: selectedDate,
        mealType,
        foodItems: foodItems.trim(),
        flareUpScore,
        symptomsAfter: {
          nausea,
          fatigue,
          pain,
        },
        timeAfterEating: timeAfterEating.trim(),
        notes: notes.trim(),
      });

      console.log('[FoodScreen] addFoodLog completed successfully');

      // Reset form
      setFoodItems('');
      setFlareUpScore(1);
      setNausea(1);
      setFatigue(1);
      setPain(1);
      setTimeAfterEating('');
      setNotes('');
      Alert.alert('Success', 'Food log added successfully!');
    } catch (error) {
      console.error('[FoodScreen] Error in handleLogFood:', error);
      Alert.alert('Error', 'Failed to add food log. Please try again.');
    }
  };

  const MealTypeButton = ({ 
    type, 
    label 
  }: { 
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack'; 
    label: string 
  }) => (
    <TouchableOpacity
      style={[
        styles.mealTypeButton,
        mealType === type && styles.mealTypeButtonSelected
      ]}
      onPress={() => setMealType(type)}
    >
      <Text style={[
        styles.mealTypeButtonText,
        mealType === type && styles.mealTypeButtonTextSelected
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const getTriggerInsights = () => {
    const recentLogs = state.foodLogs.slice(-10);
    if (recentLogs.length < 5) return 'Log more meals to identify potential triggers';
    
    // Find foods with high flare-up scores
    const triggerFoods = recentLogs.filter(log => log.flareUpScore >= 7);
    const safeFoods = recentLogs.filter(log => log.flareUpScore <= 3);
    
    let insight = '';
    if (triggerFoods.length > 0) {
      const commonTriggers = triggerFoods.map(log => log.foodItems).slice(0, 3);
      insight += `⚠️ Potential triggers: ${commonTriggers.join(', ')}. `;
    }
    
    if (safeFoods.length > 0) {
      insight += `✅ Well-tolerated foods include items you've logged with low scores. `;
    }
    
    // Check for common endometriosis trigger ingredients
    const allFoods = recentLogs.map(log => log.foodItems.toLowerCase()).join(' ');
    const commonTriggers = ['dairy', 'gluten', 'wheat', 'caffeine', 'alcohol', 'processed'];
    const foundTriggers = commonTriggers.filter(trigger => allFoods.includes(trigger));
    
    if (foundTriggers.length > 0) {
      insight += `📝 You've been consuming common triggers: ${foundTriggers.join(', ')}. Consider elimination testing.`;
    }
    
    return insight || 'Keep tracking to identify your personal trigger patterns';
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Food & Trigger Tracker</Text>
      <Text style={styles.subheader}>Identify foods that may trigger symptoms</Text>
      
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

        {/* Meal Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meal Type</Text>
          <View style={styles.mealTypeContainer}>
            <MealTypeButton type="breakfast" label="Breakfast" />
            <MealTypeButton type="lunch" label="Lunch" />
            <MealTypeButton type="dinner" label="Dinner" />
            <MealTypeButton type="snack" label="Snack" />
          </View>
        </View>

        {/* Food Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Food & Ingredients</Text>
          <Text style={styles.sectionSubtitle}>
            List specific foods and ingredients consumed
          </Text>
          <TextInput
            style={styles.foodInput}
            value={foodItems}
            onChangeText={setFoodItems}
            placeholder="e.g., Gluten-free pasta with tomato sauce, parmesan cheese..."
            multiline
            numberOfLines={3}
          />
        </View>

        

        

        

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Cooking method, brands, portion size, other observations..."
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Log Button */}
        <TouchableOpacity style={styles.logButton} onPress={handleLogFood}>
          <Text style={styles.logButtonText}>Log Food Entry</Text>
        </TouchableOpacity>

        {/* Trigger Insights */}
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Trigger Pattern Analysis</Text>
          <Text style={styles.insightText}>{getTriggerInsights()}</Text>
          {/* TODO: Add ingredient analysis, elimination diet suggestions */}
          <Text style={styles.futureFeature}>
            🔬 Coming soon: Ingredient analysis, elimination diet tracking, and trigger correlation graphs
          </Text>
        </View>

        {/* Recent Food Logs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Food Logs</Text>
          {state.foodLogs.length === 0 ? (
            <Text style={styles.emptyText}>No food logs yet</Text>
          ) : (
            state.foodLogs.slice(-8).reverse().map(log => (
              <View key={log.id} style={styles.logCard}>
                <View style={styles.logHeader}>
                  <Text style={styles.logDate}>{log.date}</Text>
                  <View style={styles.mealTypeBadge}>
                    <Text style={styles.mealTypeBadgeText}>
                      {log.mealType.charAt(0).toUpperCase() + log.mealType.slice(1)}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.logFood}>{log.foodItems}</Text>
                
                <View style={styles.logScores}>
                  <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(log.flareUpScore) }]}>
                    <Text style={styles.scoreBadgeText}>
                      Flare: {log.flareUpScore}/10
                    </Text>
                  </View>
                  {log.symptomsAfter && (
                    <Text style={styles.logSymptoms}>
                      N:{log.symptomsAfter.nausea} F:{log.symptomsAfter.fatigue} P:{log.symptomsAfter.pain}
                    </Text>
                  )}
                </View>
                
                {log.timeAfterEating && (
                  <Text style={styles.logDetail}>
                    Symptoms started: {log.timeAfterEating}
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

// Helper function to get color based on flare-up score
const getScoreColor = (score: number): string => {
  if (score <= 3) return '#C8E6C9'; // Green
  if (score <= 6) return '#FFF9C4'; // Yellow
  return '#FFCDD2'; // Red
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
  mealTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  mealTypeButton: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  mealTypeButtonSelected: {
    backgroundColor: '#FFE5F1',
    borderColor: '#FF6B9D',
  },
  mealTypeButtonText: {
    fontSize: 14,
    color: '#2C3E50',
  },
  mealTypeButtonTextSelected: {
    color: '#FF6B9D',
    fontWeight: '600',
  },
  foodInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#FFF',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  timeInput: {
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
  mealTypeBadge: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mealTypeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B9D',
  },
  logFood: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 8,
    fontWeight: '500',
  },
  logScores: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    gap: 10,
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E50',
  },
  logSymptoms: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  logDetail: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 5,
  },
  logNotes: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 5,
    fontStyle: 'italic',
  },
});

export default FoodScreen;