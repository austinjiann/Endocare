# EndoCare - Endometriosis Symptom Tracking App

A clean, mobile-first React Native app built with Expo for tracking endometriosis symptoms and treatment care.

## 🚀 Quick Start

### Prerequisites
- [Expo Go app](https://expo.dev/client) installed on your iOS/Android device
- Node.js installed on your computer

### Running the App

1. **Start the development server:**
   ```bash
   cd /Users/austinjian/terrahacks
   npx expo start
   ```

2. **Connect your mobile device:**
   - **iOS**: Open Camera app and scan the QR code
   - **Android**: Open Expo Go app and scan the QR code
   - **Alternative**: Use `npx expo start --tunnel` for connectivity issues

3. **View the app:**
   - The EndoCare dashboard should load immediately
   - Navigate between tabs: Dashboard, Period, Food, Sleep

## 📱 Features

### Dashboard
- Welcome screen with app overview
- Quick summary cards for each tracker
- Navigation to specific tracking screens
- Real-time stats display

### Period Tracker
- Log period start/end dates
- Record pain levels (1-10 scale)
- Track symptoms and notes
- View recent entries

### Food Tracker  
- Log meals and foods consumed
- Record reactions (good, neutral, bad, nausea, bloating, energy)
- Add detailed notes about how foods affect you
- View recent food logs

### Sleep Tracker
- Track hours slept
- Rate sleep quality (1-5 stars)
- Add sleep notes and observations
- View sleep statistics and patterns

## 🎨 Design

- **Mobile-first**: Optimized for iOS and Android devices
- **Pastel color scheme**: Soft pink (#FFE5F1), light blue (#E8F4FD), lavender (#F3E5F5)
- **Safe areas**: Proper display on all phone screen sizes
- **Touch-friendly**: Large buttons and inputs for mobile use

## 🏗️ Technical Stack

- **React Native** with Expo SDK 53
- **React Navigation** v7 (Bottom Tabs)
- **TypeScript** for type safety
- **Context API** for state management
- **SafeAreaView** for proper mobile display

## 📁 Project Structure

```
src/
├── context/
│   └── AppContext.tsx      # Global state management
├── navigation/
│   └── BottomTabNavigator.tsx  # Tab navigation setup
└── screens/
    ├── DashboardScreen.tsx     # Overview and stats
    ├── PeriodScreen.tsx        # Period tracking
    ├── FoodScreen.tsx          # Food tracking  
    └── SleepScreen.tsx         # Sleep tracking
```

## 🔧 Development

### Adding New Features
The app is structured for easy expansion:

```typescript
// Add new data types in AppContext.tsx
export interface NewEntry {
  id: string;
  date: string;
  // Add your fields here
}

// Add reducer actions
type AppAction = 
  | { type: 'ADD_NEW_ENTRY'; payload: NewEntry }
  // ... existing actions

// Create new screen in screens/
// Add to navigation in BottomTabNavigator.tsx
```

### Sample Data
The app includes sample entries for immediate testing:
- 2 period entries with different pain levels
- 3 food entries with various reactions  
- 3 sleep entries with different quality ratings

## 🐛 Troubleshooting

### App Won't Load on Device
1. Ensure phone and computer are on same WiFi network
2. Try tunnel mode: `npx expo start --tunnel`
3. Clear Metro cache: `npx expo start --clear`
4. Restart Expo Go app on your device

### Metro Bundler Issues
```bash
# Clear watchman cache
watchman watch-del '/Users/austinjian/terrahacks'
watchman watch-project '/Users/austinjian/terrahacks'

# Clear all caches
npx expo start --clear
```

### QR Code Not Working
- Make sure camera permissions are enabled
- Try the direct link from Expo Dev Tools in browser
- Use `npx expo start --tunnel` for network issues

## 📝 Next Steps

Ready-to-expand areas marked with comments:
- Add data persistence (AsyncStorage/SQLite)
- Implement user authentication
- Add export functionality  
- Include symptom correlations and insights
- Add medication tracking
- Implement appointment reminders

---

**Built with ❤️ for endometriosis awareness and better health tracking**