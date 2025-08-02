import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types for our data structures
export interface PeriodEntry {
  id: string;
  date: string;
  type: 'start' | 'end';
  painLevel?: number; // 1-10 scale
  symptoms?: string;
  notes?: string;
}

export interface FoodEntry {
  id: string;
  date: string;
  foodName: string;
  reaction?: string;
  notes?: string;
}

export interface SleepEntry {
  id: string;
  date: string;
  hoursSlept: number;
  quality: number; // 1-5 scale
  notes?: string;
}

// App state interface
interface AppState {
  periodEntries: PeriodEntry[];
  foodEntries: FoodEntry[];
  sleepEntries: SleepEntry[];
}

// Action types
type AppAction =
  | { type: 'ADD_PERIOD_ENTRY'; payload: PeriodEntry }
  | { type: 'ADD_FOOD_ENTRY'; payload: FoodEntry }
  | { type: 'ADD_SLEEP_ENTRY'; payload: SleepEntry }
  | { type: 'UPDATE_PERIOD_ENTRY'; payload: { id: string; updates: Partial<PeriodEntry> } }
  | { type: 'UPDATE_FOOD_ENTRY'; payload: { id: string; updates: Partial<FoodEntry> } }
  | { type: 'UPDATE_SLEEP_ENTRY'; payload: { id: string; updates: Partial<SleepEntry> } }
  | { type: 'DELETE_PERIOD_ENTRY'; payload: string }
  | { type: 'DELETE_FOOD_ENTRY'; payload: string }
  | { type: 'DELETE_SLEEP_ENTRY'; payload: string };

// Sample data for demonstration
const samplePeriodEntries: PeriodEntry[] = [
  {
    id: '1',
    date: '2025-01-28',
    type: 'start',
    painLevel: 6,
    symptoms: 'Cramps, headache',
    notes: 'Started in the morning, took ibuprofen'
  },
  {
    id: '2', 
    date: '2025-01-25',
    type: 'end',
    painLevel: 3,
    symptoms: 'Light cramps',
    notes: 'Feeling better'
  }
];

const sampleFoodEntries: FoodEntry[] = [
  {
    id: '1',
    date: '2025-01-30',
    foodName: 'Gluten-free pasta with tomato sauce',
    reaction: 'good',
    notes: 'No bloating or discomfort, felt energized'
  },
  {
    id: '2',
    date: '2025-01-29', 
    foodName: 'Dairy-free smoothie bowl',
    reaction: 'energy',
    notes: 'Great breakfast, lots of energy'
  },
  {
    id: '3',
    date: '2025-01-28',
    foodName: 'Regular pizza',
    reaction: 'bloating',
    notes: 'Felt bloated and uncomfortable after eating'
  }
];

const sampleSleepEntries: SleepEntry[] = [
  {
    id: '1',
    date: '2025-01-30',
    hoursSlept: 7.5,
    quality: 4,
    notes: 'Good deep sleep, woke up refreshed'
  },
  {
    id: '2',
    date: '2025-01-29',
    hoursSlept: 6,
    quality: 2,
    notes: 'Restless night due to cramps'
  },
  {
    id: '3',
    date: '2025-01-28',
    hoursSlept: 8,
    quality: 5,
    notes: 'Perfect sleep, felt amazing'
  }
];

// Initial state with sample data
const initialState: AppState = {
  periodEntries: samplePeriodEntries,
  foodEntries: sampleFoodEntries,
  sleepEntries: sampleSleepEntries,
};

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_PERIOD_ENTRY':
      return {
        ...state,
        periodEntries: [...state.periodEntries, action.payload],
      };
    case 'ADD_FOOD_ENTRY':
      return {
        ...state,
        foodEntries: [...state.foodEntries, action.payload],
      };
    case 'ADD_SLEEP_ENTRY':
      return {
        ...state,
        sleepEntries: [...state.sleepEntries, action.payload],
      };
    case 'UPDATE_PERIOD_ENTRY':
      return {
        ...state,
        periodEntries: state.periodEntries.map(entry =>
          entry.id === action.payload.id ? { ...entry, ...action.payload.updates } : entry
        ),
      };
    case 'UPDATE_FOOD_ENTRY':
      return {
        ...state,
        foodEntries: state.foodEntries.map(entry =>
          entry.id === action.payload.id ? { ...entry, ...action.payload.updates } : entry
        ),
      };
    case 'UPDATE_SLEEP_ENTRY':
      return {
        ...state,
        sleepEntries: state.sleepEntries.map(entry =>
          entry.id === action.payload.id ? { ...entry, ...action.payload.updates } : entry
        ),
      };
    case 'DELETE_PERIOD_ENTRY':
      return {
        ...state,
        periodEntries: state.periodEntries.filter(entry => entry.id !== action.payload),
      };
    case 'DELETE_FOOD_ENTRY':
      return {
        ...state,
        foodEntries: state.foodEntries.filter(entry => entry.id !== action.payload),
      };
    case 'DELETE_SLEEP_ENTRY':
      return {
        ...state,
        sleepEntries: state.sleepEntries.filter(entry => entry.id !== action.payload),
      };
    default:
      return state;
  }
}

// Context interface
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Helper functions for easier data access
  addPeriodEntry: (entry: Omit<PeriodEntry, 'id'>) => void;
  addFoodEntry: (entry: Omit<FoodEntry, 'id'>) => void;
  addSleepEntry: (entry: Omit<SleepEntry, 'id'>) => void;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Context provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Helper functions
  const addPeriodEntry = (entry: Omit<PeriodEntry, 'id'>) => {
    dispatch({
      type: 'ADD_PERIOD_ENTRY',
      payload: { ...entry, id: Date.now().toString() },
    });
  };

  const addFoodEntry = (entry: Omit<FoodEntry, 'id'>) => {
    dispatch({
      type: 'ADD_FOOD_ENTRY',
      payload: { ...entry, id: Date.now().toString() },
    });
  };

  const addSleepEntry = (entry: Omit<SleepEntry, 'id'>) => {
    dispatch({
      type: 'ADD_SLEEP_ENTRY',
      payload: { ...entry, id: Date.now().toString() },
    });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        addPeriodEntry,
        addFoodEntry,
        addSleepEntry,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}