import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { SleepLog } from '../context/EndoCareContext';

const { width: screenWidth } = Dimensions.get('window');

// CUSTOMIZATION POINT: Adjust time range (14-30 days)
const TIME_RANGE_DAYS = 30; // Show last 30 days for detailed sleep tracking

// CUSTOMIZATION POINT: Sleep theme colors (teal palette)
const CHART_COLORS = {
  primary: '#9AE6E0',      // Teal - sleep duration bars
  secondary: '#4DB6AC',     // Darker teal - quality line
  accent: '#80CBC4',        // Light teal - highlights
  text: '#2C3E50',         // Dark text
  textLight: '#7F8C8D',    // Light text
  background: '#F2F9F8',   // Background
  white: '#FFFFFF',        // White backgrounds
  grid: '#E0F2F1',        // Grid lines
};

interface ChartDataPoint {
  duration: number;    // Sleep duration in hours (for bars)
  quality: number;     // Sleep quality (1-10 scale, for line)
  day: number;         // Day number (0-30)
  date: string;        // Original date string
  originalDate: Date;
  hasData: boolean;
}

interface SleepChartProps {
  sleepLogs: SleepLog[];
  title?: string;
}

const SleepChart: React.FC<SleepChartProps> = ({ 
  sleepLogs, 
  title = "Sleep Trends" 
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
    const generateSampleData = (date: Date, dayIndex: number): { duration: number; quality: number; hasData: boolean } => {
      // Create realistic sleep patterns with some variation
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Base sleep duration: longer on weekends, shorter mid-week
      let baseDuration = isWeekend ? 8.5 : 7.2;
      
      // Add some realistic variation based on day patterns
      const variation = (Math.sin(dayIndex * 0.3) * 1.2) + (Math.random() * 1.5 - 0.75);
      const duration = Math.max(4, Math.min(11, baseDuration + variation));
      
      // Quality correlates with duration but has its own patterns
      let baseQuality = duration > 8 ? 8 : duration > 6 ? 6.5 : 4.5;
      const qualityVariation = (Math.cos(dayIndex * 0.4) * 1.5) + (Math.random() * 2 - 1);
      const quality = Math.max(1, Math.min(10, baseQuality + qualityVariation));
      
      // Simulate some missing data (20% chance of no data)
      const hasData = Math.random() > 0.2;
      
      return {
        duration: hasData ? Math.round(duration * 10) / 10 : 0,
        quality: hasData ? Math.round(quality * 10) / 10 : 0,
        hasData
      };
    };
    
    // Create data points for each day in range
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayIndex = dataPoints.length;
      const sleepEntry = sleepLogs.find(log => log.date === dateStr);
      
      let duration, quality, hasData;
      
      if (sleepEntry) {
        // Use real data if available
        duration = sleepEntry.hoursSlept;
        quality = sleepEntry.sleepQuality;
        hasData = true;
      } else if (sleepLogs.length === 0) {
        // Generate sample data only if no real data exists at all
        const sample = generateSampleData(new Date(d), dayIndex);
        duration = sample.duration;
        quality = sample.quality;
        hasData = sample.hasData;
      } else {
        // Real data exists but not for this date
        duration = 0;
        quality = 0;
        hasData = false;
      }
      
      dataPoints.push({
        duration,
        quality,
        day: dayIndex,
        date: dateStr,
        originalDate: new Date(d),
        hasData,
      });
    }

    return dataPoints;
  }, [sleepLogs, currentMonth]);

  // Prepare data for simple bar visualization
  const maxDuration = 12; // 12 hours max
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
  const showingSampleData = sleepLogs.length === 0;

  // Calculate summary statistics
  const avgDuration = chartData.filter(d => d.hasData).length > 0 
    ? (chartData.filter(d => d.hasData).reduce((sum, d) => sum + d.duration, 0) / 
       chartData.filter(d => d.hasData).length).toFixed(1)
    : 'N/A';
  
  const avgQuality = chartData.filter(d => d.hasData).length > 0 
    ? (chartData.filter(d => d.hasData).reduce((sum, d) => sum + d.quality, 0) / 
       chartData.filter(d => d.hasData).length).toFixed(1)
    : 'N/A';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      {/* Sample Data Banner */}
      {showingSampleData && (
        <View style={styles.sampleDataBanner}>
          <Text style={styles.sampleDataText}>
            📊 Sample sleep data shown - Start logging sleep to see your actual trends!
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
          <Text style={styles.legendText}>Sleep Duration (hours)</Text>
        </View>
      </View>

      {/* Simple Chart Container */}
      <View style={styles.chartContainer}>
        {/* Y-Axis Labels */}
        <View style={styles.chartLabels}>
          <View style={styles.yAxisLabels}>
            {['12h', '9h', '6h', '3h', '0h'].map((label, index) => (
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
                const barHeight = point.hasData && point.duration > 0 
                  ? (point.duration / maxDuration) * chartHeight 
                  : 0;
                const barColor = point.hasData 
                  ? CHART_COLORS.primary
                  : CHART_COLORS.grid;
                
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

      {/* Sleep Summary Statistics */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>{TIME_RANGE_DAYS}-Day Sleep Summary</Text>
        <View style={styles.summaryStats}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{avgDuration}h</Text>
            <Text style={styles.summaryLabel}>Avg Duration</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{avgQuality}/10</Text>
            <Text style={styles.summaryLabel}>Avg Quality</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{chartData.filter(d => d.hasData).length}</Text>
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
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#FFB74D',
  },
  sampleDataText: {
    fontSize: 12,
    color: '#E65100',
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
    backgroundColor: CHART_COLORS.grid,
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
    backgroundColor: CHART_COLORS.accent,
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
    width: 35,
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
    backgroundColor: '#F8FCFC',
    borderWidth: 1,
    borderColor: '#4DB6AC',
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
    backgroundColor: '#4DB6AC',
  },
  xAxisLine: {
    width: '100%',
    height: 3,
    backgroundColor: '#2E7D7B',
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
    borderTopColor: CHART_COLORS.grid,
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

export default SleepChart;

// FUTURE EXTENSIONS (commented for reference):
// 1. Add sleep disruption indicators as overlay markers
// 2. Include bedtime/wake time tracking with additional timeline
// 3. Add morning symptom correlation heatmap overlay
// 4. Implement sleep debt calculation and visualization
// 5. Add pattern recognition annotations (weekday vs weekend trends)
// 6. Include sleep efficiency calculation (time in bed vs time asleep)
// 7. Add seasonal pattern analysis and insights
// 8. Include sleep goal tracking and achievement indicators
// 9. Add correlation analysis with other health metrics (period, food, symptoms)
// 10. Implement predictive sleep quality modeling based on historical patterns