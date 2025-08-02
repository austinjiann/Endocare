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

  const getMealColor = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '#FFD93D';
      case 'lunch': return '#4ECDC4';
      case 'dinner': return '#9B59B6';
      case 'snack': return '#FF8C42';
      default: return '#FF6B9D';
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
        mealType === type && { ...styles.mealTypeButtonSelected, backgroundColor: '#A8D5BA' }
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
      insight += `Potential triggers: ${commonTriggers.join(', ')}. `;
    }
    
    if (safeFoods.length > 0) {
      insight += `Well-tolerated foods include items you've logged with low scores. `;
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#A8D5BA" />
      <View style={styles.headerContainer}>
        <View style={styles.headerGradient}>
          <Text style={styles.header}>Food Tracker</Text>
          <Text style={styles.subheader}>Identify foods that may trigger symptoms</Text>
        </View>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date</Text>
          <DatePickerInput
            value={selectedDate}
            onDateChange={setSelectedDate}
            themeColor="#A8D5BA"
            placeholder="Select meal date"
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

        {/* FIX: Added Symptom Sliders for flare-up score and symptoms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Symptom Flare-up</Text>
          <Text style={styles.sectionSubtitle}>Rate symptoms after eating (1-10 scale)</Text>
          
          <SymptomSlider
            label="Overall Flare-up Score"
            value={flareUpScore}
            onValueChange={setFlareUpScore}
            color="#FF6B9D"
            description="1 = No symptoms, 10 = Severe flare-up"
          />

          <SymptomSlider
            label="Nausea"
            value={nausea}
            onValueChange={setNausea}
            color="#FF6B9D"
            description="1 = No nausea, 10 = Severe nausea"
          />
          <SymptomSlider
            label="Fatigue"
            value={fatigue}
            onValueChange={setFatigue}
            color="#FF6B9D"
            description="1 = Energized, 10 = Exhausted"
          />
          <SymptomSlider
            label="Pain"
            value={pain}
            onValueChange={setPain}
            color="#FF6B9D"
            description="1 = No pain, 10 = Severe pain"
          />
        </View>
        
        {/* FIX: Added TextInput for time after eating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time to Symptoms</Text>
          <Text style={styles.sectionSubtitle}>
            How long after eating did symptoms appear?
          </Text>
          <TextInput
            style={styles.timeInput}
            value={timeAfterEating}
            onChangeText={setTimeAfterEating}
            placeholder="e.g., 30 minutes, 2 hours..."
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
    </View>
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
    backgroundColor: '#F4FBF6',
  },
  headerContainer: {
    marginBottom: 0,
  },
  headerGradient: {
    backgroundColor: '#A8D5BA',
    paddingTop: 60,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    shadowColor: '#A8D5BA',
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
    color: '#6BBF59',
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 15,
  },
  dateInput: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    backgroundColor: '#F8F9FA',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  mealTypeButton: {
    flex: 1,
    minWidth: '45%',
    padding: 15,
    borderRadius: 15,
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  mealTypeButtonSelected: {
    borderColor: 'transparent',
    shadowColor: '#A8D5BA',
    shadowOpacity: 0.3,
    elevation: 4,
  },
  mealTypeButtonText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  mealTypeButtonTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  foodInput: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    backgroundColor: '#F8F9FA',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    backgroundColor: '#F8F9FA',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  logButton: {
    backgroundColor: '#A8D5BA',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#A8D5BA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  logButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  insightCard: {
    backgroundColor: '#A8D5BA',
    padding: 25,
    borderRadius: 20,
    marginBottom: 30,
    shadowColor: '#A8D5BA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  insightText: {
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 22,
  },
  futureFeature: {
    fontSize: 12,
    color: '#FFFFFF',
    fontStyle: 'italic',
    opacity: 0.8,
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
    borderLeftColor: '#A8D5BA',
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
    color: '#6BBF59',
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