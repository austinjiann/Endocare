# EndoCare - Endometriosis Symptom Tracking App

A mobile-first React Native app built with Expo for comprehensive endometriosis symptom tracking and trigger identification.

## 🚀 Quick Start

### Running the App

1. **Start the development server:**
   ```bash
   npx expo start
   ```
   
2. **For connectivity issues, use tunnel mode:**
   ```bash
   npx expo start --tunnel
   ```

3. **Connect your mobile device:**
   - **iOS**: Open Camera app and scan the QR code
   - **Android**: Open Expo Go app and scan the QR code

## 📱 Core Features

### 🏠 Dashboard
- **Quick Symptom Logger**: Fast 1-5 scale logging for immediate use
- **7-Day Symptom Averages**: Visual overview of nausea, fatigue, and pain levels
- **Navigation Cards**: Quick access to all tracking features
- **Progress Statistics**: Total entries across all trackers

### 🩺 Symptom Tracker
- **1-10 Scale Sliders**: Precise symptom tracking for nausea, fatigue, and pain
- **Pattern Insights**: Automatic analysis of recent symptom trends
- **Historical Log View**: Recent symptom entries with detailed breakdowns
- **Expandable**: Ready for mood tracking, specific pain locations

### 🩸 Period Tracker
- **Cycle Logging**: Start/end dates with flow level tracking (1-5 scale)
- **Associated Symptoms**: Link period events to symptom levels
- **Cycle Insights**: Pain level analysis and healthcare recommendations
- **Future Ready**: Designed for cycle length and ovulation prediction

### 🍽️ Food & Trigger Tracker
- **Meal Logging**: Breakfast, lunch, dinner, and snack tracking
- **Flare-up Scoring**: 1-10 scale for trigger identification
- **Ingredient Analysis**: Automatic detection of common triggers (dairy, gluten, etc.)
- **Symptom Correlation**: Track symptoms after eating with timing
- **Trigger Insights**: Pattern recognition for elimination diet guidance

### 😴 Sleep Tracker
- **Sleep Quality**: Hours slept + 1-10 quality rating
- **Morning Symptoms**: Track how you feel upon waking
- **Disruption Tracking**: Log pain, bathroom trips, anxiety
- **Sleep Insights**: Analysis of sleep-symptom correlations
- **Healthcare Alerts**: Recommendations for sleep-related issues

## 🎨 Design System

### Pastel Color Palette
- **Soft Pink** (#FFE5F1): Period tracking
- **Light Blue** (#E8F4FD): Food tracking  
- **Beige/Cream** (#F5F5DC): Sleep tracking
- **Lavender** (#F3E5F5): Symptom tracking
- **Clean White** (#FEFEFE): Background

### Mobile-First Design
- SafeAreaView for proper display on all devices
- Touch-friendly buttons and sliders
- Responsive flexbox layouts
- No heavy emojis (minimal, clean icons only)

## 🏗️ Technical Architecture

### Tech Stack
- **React Native** with Expo SDK 53
- **TypeScript** for type safety
- **React Navigation** v7 (Bottom Tabs + Navigation)
- **Context API** for global state management
- **SafeAreaView** for mobile optimization
- **No web dependencies** (mobile-only)

### File Structure
```
src/
├── components/
│   ├── SymptomSlider.tsx       # 1-10 scale slider component
│   └── QuickSymptomLogger.tsx  # Dashboard quick logger
├── context/
│   └── EndoCareContext.tsx     # Global state management
├── navigation/
│   └── BottomTabNavigator.tsx  # 5-tab navigation
└── screens/
    ├── DashboardScreen.tsx     # Overview + quick actions
    ├── PeriodScreen.tsx        # Cycle + symptom tracking
    ├── FoodScreen.tsx          # Meals + trigger scores
    ├── SleepScreen.tsx         # Sleep + morning symptoms
    └── SymptomScreen.tsx       # Detailed symptom logging
```

### Data Types
```typescript
interface SymptomEntry {
  id: string;
  date: string;
  nausea: number;     // 1-10 scale
  fatigue: number;    // 1-10 scale  
  pain: number;       // 1-10 scale
  notes?: string;
}

interface FoodLog {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodItems: string;
  flareUpScore: number;   // 1-10 scale (trigger severity)
  symptomsAfter?: {
    nausea: number;
    fatigue: number;
    pain: number;
  };
  timeAfterEating?: string;
  notes?: string;
}
```

## 📊 Sample Data Included

The app includes realistic sample data for immediate testing:

### Symptom Logs
- Various pain/nausea/fatigue combinations
- Different severity levels and scenarios
- Notes describing flare triggers

### Period Logs  
- Start/end events with symptom correlations
- Flow level variations
- Pain level progressions

### Food Logs
- Trigger foods (dairy, gluten) with high flare scores
- Safe foods with low scores
- Meal timing and reaction patterns

### Sleep Logs
- Sleep disruption scenarios
- Quality vs. symptom correlations
- Morning pain patterns

## 🔮 Expansion Ready

### Immediate Extensions (Marked with TODO comments)
- **Symptom Graphing**: Visual trend charts
- **Food-Symptom Correlation**: ML-ready data structure
- **Cycle Length Calculation**: Ovulation prediction
- **Sleep Pattern Visualization**: Bedtime tracking
- **Export Functionality**: Healthcare provider sharing

### Advanced Features
```typescript
// Ready for mood tracking
interface MoodEntry {
  id: string;
  date: string;
  mood: number;
  anxiety: number;
  depression: number;
}

// Ready for medication tracking
interface MedicationLog {
  id: string;
  date: string;
  medication: string;
  dosage: string;
  effectiveness: number;
}
```

## 🩺 Healthcare Integration

### Pattern Recognition
- Automatic trigger identification
- Pain level healthcare alerts
- Sleep disruption warnings
- Cycle irregularity detection

### Data Export (Future)
- PDF summary reports
- CSV data export
- Symptom timeline graphs
- Healthcare provider sharing

## 🔧 Development

### Adding New Features
1. **New Data Type**: Add to `EndoCareContext.tsx`
2. **New Screen**: Create in `src/screens/`
3. **Navigation**: Update `BottomTabNavigator.tsx`
4. **Components**: Reuse `SymptomSlider` for consistency

### Sample Component Usage
```tsx
import SymptomSlider from '../components/SymptomSlider';

<SymptomSlider
  label="Pain Level"
  value={pain}
  onValueChange={setPain}
  color="#FF8E53"
  description="Rate your current pain level"
/>
```

## 📱 Testing

### Expo Go Testing
```bash
# Standard mode
npx expo start

# Tunnel mode (for network issues)
npx expo start --tunnel

# Clear cache if needed
npx expo start --clear
```

### Device Compatibility
- **iOS**: iPhone 6s+ (iOS 13+)
- **Android**: Android 6.0+ (API level 23+)
- **Tablets**: iPad and Android tablets supported

## 🎯 Focus Areas

### Endometriosis-Specific Features
- **Trigger Identification**: Food and lifestyle triggers
- **Pain Pattern Recognition**: Cycle and daily pain tracking
- **Sleep-Symptom Correlation**: Sleep quality impact analysis
- **Healthcare Communication**: Data ready for provider discussions

### User Experience
- **Minimal Friction**: Quick daily logging
- **Pattern Insights**: Automatic trend identification
- **Progressive Enhancement**: Start simple, add complexity
- **Privacy-First**: Local data storage (no cloud by default)

---

**Built specifically for endometriosis management and trigger identification**