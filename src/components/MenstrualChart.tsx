import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { PeriodLog } from '../context/EndoCareContext';

const { width: screenWidth } = Dimensions.get('window');

// CUSTOMIZATION POINT: Adjust time range (14-30 days)
const TIME_RANGE_DAYS = 30; // Show last 30 days for consistent comparison

// CUSTOMIZATION POINT: Menstrual cycle theme colors
const CHART_COLORS = {
  primary: '#F4A8C0',      // Pink - flow bars
  secondary: '#E91E63',     // Darker pink - period start markers
  tertiary: '#F8BBD9',     // Light pink - period end markers
  text: '#2C3E50',         // Dark text
  textLight: '#7F8C8D',    // Light text
  background: '#FAF4F7',   // Background
  white: '#FFFFFF',        // White backgrounds
};

// CUSTOMIZATION POINT: Flow level mapping for visualization
const FLOW_LEVEL_MAP = {
  0: { label: 'None', color: '#E8F5E8' },
  1: { label: 'Light', color: '#FFE0E6' },
  2: { label: 'Med', color: '#FFB3C1' },
  3: { label: 'Heavy', color: '#FF85A1' },
  4: { label: 'V.Heavy', color: '#FF5722' },
  5: { label: 'Extreme', color: '#D32F2F' },
};

interface ChartDataPoint {
  value: number;       // Flow level (0-5)
  date: string;        // Original date string
  periodType: 'none' | 'start' | 'end' | 'ongoing';
  originalDate: Date;
  hasData: boolean;
}

interface MenstrualChartProps {
  periodLogs: PeriodLog[];
  title?: string;
}

const MenstrualChart: React.FC<MenstrualChartProps> = ({ 
  periodLogs, 
  title = "Menstrual Cycle Trends" 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // CUSTOMIZATION POINT: Data processing and transformation
  const chartData = useMemo(() => {
    // Generate date range for TIME_RANGE_DAYS ending at currentMonth
    const endDate = new Date(currentMonth);
    const startDate = new Date(currentMonth);
    startDate.setDate(endDate.getDate() - TIME_RANGE_DAYS + 1);

    const dataPoints: ChartDataPoint[] = [];
    
    // Sample data generator for demonstration (when no real data exists)
    const generateSampleData = (date: Date, dayIndex: number): { flowLevel: number; periodType: 'none' | 'start' | 'end' | 'ongoing'; hasData: boolean } => {
      // Create realistic menstrual cycle patterns
      const daysSinceStart = dayIndex;
      
      // Generate cycles of 26-32 days (average 28)
      const cycleLength = 28 + Math.sin(dayIndex * 0.1) * 4;
      const dayInCycle = (daysSinceStart % cycleLength);
      
      // Period typically lasts 3-7 days at start of cycle
      const periodLength = 4 + Math.sin(dayIndex * 0.05) * 2;
      
      if (dayInCycle < periodLength) {
        // During period - create realistic flow pattern
        if (dayInCycle === 0) {
          return { flowLevel: 2, periodType: 'start', hasData: true }; // Light start
        } else if (dayInCycle === 1 || dayInCycle === 2) {
          return { flowLevel: 3, periodType: 'ongoing', hasData: true }; // Heavy days
        } else if (dayInCycle === periodLength - 1) {
          return { flowLevel: 1, periodType: 'end', hasData: true }; // Light end
        } else {
          return { flowLevel: 2, periodType: 'ongoing', hasData: true }; // Medium flow
        }
      }
      
      // Not during period - 80% chance of no data (realistic usage)
      const hasData = Math.random() > 0.8;
      return { flowLevel: 0, periodType: 'none', hasData };
    };
    
    // Create data points for each day in range
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayIndex = dataPoints.length;
      const periodEntry = periodLogs.find(log => log.date === dateStr);
      
      let flowLevel, periodType, hasData;
      
      if (periodEntry) {
        // Use real data if available
        flowLevel = periodEntry.flowLevel || 0;
        periodType = periodEntry.type === 'start' ? 'start' as const : 
                    periodEntry.type === 'end' ? 'end' as const : 'ongoing' as const;
        hasData = true;
      } else if (periodLogs.length === 0) {
        // Generate sample data only if no real data exists at all
        const sample = generateSampleData(new Date(d), dayIndex);
        flowLevel = sample.flowLevel;
        periodType = sample.periodType;
        hasData = sample.hasData;
      } else {
        // Real data exists but not for this date
        flowLevel = 0;
        periodType = 'none';
        hasData = false;
      }
      
      dataPoints.push({
        value: flowLevel,
        date: dateStr,
        periodType,
        originalDate: new Date(d),
        hasData,
      });
    }

    return dataPoints;
  }, [periodLogs, currentMonth]);

  // Prepare data for simple bar visualization
  const maxFlowLevel = 5;
  const chartHeight = 120;
  
  // Calculate actual available chart width accounting for layout
  const yAxisWidth = 38; // Reduced from 50px to shift chart left (35px width + 3px padding)
  const containerPadding = 30; // 15px * 2 container padding
  const availableChartWidth = screenWidth - containerPadding - yAxisWidth;

  // Navigation functions
  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setDate(newDate.getDate() - TIME_RANGE_DAYS);
    setCurrentMonth(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setDate(newDate.getDate() + TIME_RANGE_DAYS);
    setCurrentMonth(newDate);
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  // Calculate date range display
  const startDisplayDate = new Date(currentMonth);
  startDisplayDate.setDate(startDisplayDate.getDate() - TIME_RANGE_DAYS + 1);
  const endDisplayDate = new Date(currentMonth);
  
  const dateRangeText = `${startDisplayDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })} - ${endDisplayDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })}`;

  // Check navigation availability
  const today = new Date();
  const canGoNext = currentMonth < today;
  const canGoPrevious = true;

  // Show sample data info when no real data exists
  const showingSampleData = periodLogs.length === 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      {/* Sample Data Banner */}
      {showingSampleData && (
        <View style={styles.sampleDataBanner}>
          <Text style={styles.sampleDataText}>
            📊 Sample cycle data shown - Start logging periods to see your actual patterns!
          </Text>
        </View>
      )}

      {/* Date Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={[styles.navButton, !canGoPrevious && styles.navButtonDisabled]}
          onPress={goToPreviousMonth}
          disabled={!canGoPrevious}
        >
          <Text style={[styles.navButtonText, !canGoPrevious && styles.navButtonTextDisabled]}>
            ←
          </Text>
        </TouchableOpacity>
        
        <View style={styles.dateRangeContainer}>
          <Text style={styles.dateRangeText}>{dateRangeText}</Text>
          <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.navButton, !canGoNext && styles.navButtonDisabled]}
          onPress={goToNextMonth}
          disabled={!canGoNext}
        >
          <Text style={[styles.navButtonText, !canGoNext && styles.navButtonTextDisabled]}>
            →
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chart Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: CHART_COLORS.primary }]} />
          <Text style={styles.legendText}>Flow Level</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendMarker, { backgroundColor: CHART_COLORS.secondary }]} />
          <Text style={styles.legendText}>Period Days</Text>
        </View>
      </View>

      {/* Simple Chart Container */}
      <View style={styles.chartContainer}>
        {/* Y-Axis Labels */}
        <View style={styles.chartLabels}>
          <View style={styles.yAxisLabels}>
            {['Extreme', 'V.Heavy', 'Heavy', 'Med', 'Light', 'None'].map((label, index) => (
              <Text key={index} style={styles.yAxisText}>{label}</Text>
            ))}
          </View>
          
          {/* Chart Area */}
          <View style={styles.chartArea}>
            <View style={[styles.chartBackground, { height: chartHeight }]}>
              {/* Y-Axis Line */}
              <View style={styles.yAxisLine} />
              
              {/* Bars */}
              {chartData.map((point, index) => {
                const barHeight = point.hasData && point.value > 0 
                  ? (point.value / maxFlowLevel) * chartHeight 
                  : 0;
                const barColor = point.hasData && point.value > 0
                  ? FLOW_LEVEL_MAP[point.value as keyof typeof FLOW_LEVEL_MAP]?.color || CHART_COLORS.primary
                  : CHART_COLORS.background;
                
                return (
                  <View
                    key={index}
                    style={[
                      styles.chartBar,
                      {
                        left: `${(index / TIME_RANGE_DAYS) * 100}%`,
                        width: `${(1 / TIME_RANGE_DAYS) * 100 - 0.5}%`,
                        height: Math.max(2, barHeight),
                        backgroundColor: barColor,
                        opacity: point.hasData ? 0.8 : 0.3,
                      }
                    ]}
                  />
                );
              })}
            </View>
            
            {/* X-Axis Line */}
            <View style={styles.xAxisLine} />
          </View>
        </View>
        
        {/* X-Axis Labels - Outside chartArea to prevent clipping */}
        <View style={[styles.xAxisContainer, { marginLeft: yAxisWidth }]}>
          {[0, 5, 10, 15, 20, 25, 30].map((day, index, array) => {
            // Compress spacing between labels - use smaller area for distribution
            const compressedWidth = availableChartWidth * 0.7; // Use only 70% of available width
            const startOffset = availableChartWidth * 0.15; // Center the compressed labels
            const leftPosition = (index / (array.length - 1)) * compressedWidth + startOffset;
            
            return (
              <Text 
                key={index} 
                style={[
                  styles.xAxisText, 
                  { 
                    left: leftPosition,
                    marginLeft: -8  // Center text on tick mark
                  }
                ]}
              >
                {day}
              </Text>
            );
          })}
        </View>
      </View>

      {/* Cycle Insights Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Cycle Insights</Text>
        <View style={styles.summaryStats}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {chartData.filter(d => d.hasData && d.periodType === 'start').length}
            </Text>
            <Text style={styles.summaryLabel}>Periods Tracked</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {chartData.filter(d => d.hasData && d.value > 0).length > 0 
                ? (chartData.filter(d => d.hasData && d.value > 0).reduce((sum, d) => sum + d.value, 0) / 
                   chartData.filter(d => d.hasData && d.value > 0).length).toFixed(1)
                : 'N/A'}
            </Text>
            <Text style={styles.summaryLabel}>Avg Flow Level</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {chartData.filter(d => d.hasData).length}
            </Text>
            <Text style={styles.summaryLabel}>Days Logged</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: CHART_COLORS.white,
    padding: 15,
    borderRadius: 15,
    marginBottom: 25,
    borderLeftWidth: 4,
    borderLeftColor: CHART_COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: CHART_COLORS.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  sampleDataBanner: {
    backgroundColor: '#FFF0F5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: CHART_COLORS.primary,
  },
  sampleDataText: {
    fontSize: 12,
    color: '#C2185B',
    textAlign: 'center',
    fontWeight: '500',
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  navButton: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: CHART_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  navButtonDisabled: {
    backgroundColor: '#FCE4EC',
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CHART_COLORS.white,
  },
  navButtonTextDisabled: {
    color: CHART_COLORS.textLight,
  },
  dateRangeContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 15,
  },
  dateRangeText: {
    fontSize: 14,
    fontWeight: '600',
    color: CHART_COLORS.text,
    marginBottom: 4,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: CHART_COLORS.secondary,
  },
  todayButtonText: {
    fontSize: 11,
    color: CHART_COLORS.white,
    fontWeight: '500',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendMarker: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: CHART_COLORS.textLight,
  },
  chartContainer: {
    marginBottom: 15,
  },
  chartLabels: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  yAxisLabels: {
    width: 45,
    height: 120,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 3,
  },
  yAxisText: {
    fontSize: 9,
    color: CHART_COLORS.text,
    textAlign: 'right',
    fontWeight: '500',
  },
  chartArea: {
    flex: 1,
    alignItems: 'flex-start',
    overflow: 'hidden',
  },
  chartBackground: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#999999',
    borderRadius: 4,
    position: 'relative',
    flex: 1,
    overflow: 'hidden',
  },
  yAxisLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#666666',
  },
  xAxisLine: {
    width: '100%',
    height: 3,
    backgroundColor: '#333333',
    marginTop: 2,
    marginBottom: 2,
  },
  chartBar: {
    position: 'absolute',
    bottom: 0,
    borderRadius: 1,
  },
  xAxisContainer: {
    width: '100%',
    height: 20,
    position: 'relative',
    marginTop: 5,
  },
  xAxisText: {
    position: 'absolute',
    fontSize: 11,
    color: CHART_COLORS.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  summaryContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#FCE4EC',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: CHART_COLORS.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: CHART_COLORS.primary,
  },
  summaryLabel: {
    fontSize: 11,
    color: CHART_COLORS.textLight,
    marginTop: 2,
  },
});

export default MenstrualChart;