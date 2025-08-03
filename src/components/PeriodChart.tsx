import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { PeriodLog } from '../context/EndoCareContext';

const { width: screenWidth } = Dimensions.get('window');

// CUSTOMIZATION POINT: Adjust time range (30 days to match sleep chart)
const TIME_RANGE_DAYS = 30; // Show last 30 days (consistent with sleep chart)

// CUSTOMIZATION POINT: Period theme colors
const CHART_COLORS = {
  primary: '#F4A8C0',      // Pink - flow bars
  secondary: '#E91E63',     // Darker pink - start markers
  tertiary: '#F8BBD9',     // Light pink - end markers
  cycleLines: '#FCE4EC',   // Very light pink - cycle connection lines
  text: '#2C3E50',         // Dark text
  textLight: '#7F8C8D',    // Light text
  background: '#FAF4F7',   // Background
  white: '#FFFFFF',        // White backgrounds
  grid: '#FCE4EC',        // Grid lines
};

// CUSTOMIZATION POINT: Chart dimensions
const CHART_CONFIG = {
  height: 220,
  maxBarHeight: 150,
  barWidth: 8,  // Same as sleep chart for consistency
  spacing: 1,   // Same as sleep chart for consistency
  markerSize: 8, // Size of start/end markers
};

interface ChartDataPoint {
  date: string;
  day: number;
  flowLevel: number; // 0-5 scale (0 = no period, 1-5 = flow levels)
  periodType: 'none' | 'start' | 'end' | 'ongoing';
  originalDate: Date;
  hasData: boolean;
  cycleDay?: number; // Day in current cycle (1-based)
  cycleLength?: number; // Length of cycle this day belongs to
}

interface TooltipData {
  visible: boolean;
  data: ChartDataPoint | null;
}

interface PeriodChartProps {
  periodLogs: PeriodLog[];
  title?: string;
}

const PeriodChart: React.FC<PeriodChartProps> = ({ 
  periodLogs, 
  title = "Menstrual Cycle Trends" 
}) => {
  const [tooltip, setTooltip] = useState<TooltipData>({
    visible: false,
    data: null,
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // CUSTOMIZATION POINT: Data processing and transformation
  const chartData = useMemo(() => {
    // Generate date range for TIME_RANGE_DAYS ending at currentMonth
    const endDate = new Date(currentMonth);
    const startDate = new Date(currentMonth);
    startDate.setDate(endDate.getDate() - TIME_RANGE_DAYS + 1);

    const dataPoints: ChartDataPoint[] = [];
    
    // Sample data generator for demonstration (when no real data exists)
    const generateSampleData = (date: Date, index: number): { flowLevel: number; periodType: 'none' | 'start' | 'end' | 'ongoing'; hasData: boolean } => {
      // Create realistic menstrual cycle patterns
      const daysSinceStart = index;
      
      // Generate cycles of 26-32 days (average 28)
      const cycleLength = 28 + Math.sin(index * 0.1) * 4;
      const dayInCycle = (daysSinceStart % cycleLength);
      
      // Period typically lasts 3-7 days at start of cycle
      const periodLength = 4 + Math.sin(index * 0.05) * 2;
      
      if (dayInCycle < periodLength) {
        // During period - create realistic flow pattern
        if (dayInCycle === 0) {
          return { flowLevel: 2, periodType: 'start', hasData: true }; // Light start
        } else if (dayInCycle === 1 || dayInCycle === 2) {
          return { flowLevel: 4, periodType: 'ongoing', hasData: true }; // Heavy days
        } else if (dayInCycle === periodLength - 1) {
          return { flowLevel: 1, periodType: 'end', hasData: true }; // Light end
        } else {
          return { flowLevel: 3, periodType: 'ongoing', hasData: true }; // Medium flow
        }
      }
      
      // Not during period - 80% chance of no data (realistic usage)
      const hasData = Math.random() > 0.8;
      return { flowLevel: 0, periodType: 'none', hasData };
    };
    
    // Create data points for each day in range
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const periodEntry = periodLogs.find(log => log.date === dateStr);
      
      let flowLevel, periodType, hasData;
      
      if (periodEntry) {
        // Use real data if available
        flowLevel = periodEntry.flowLevel || 0;
        periodType = periodEntry.type === 'start' ? 'start' : 
                    periodEntry.type === 'end' ? 'end' : 'ongoing';
        hasData = true;
      } else if (periodLogs.length === 0) {
        // Generate sample data only if no real data exists at all
        const sample = generateSampleData(new Date(d), dataPoints.length);
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
        date: dateStr,
        day: dataPoints.length,
        flowLevel,
        periodType,
        originalDate: new Date(d),
        hasData,
      });
    }

    return dataPoints;
  }, [periodLogs, currentMonth]);

  // Navigation functions
  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setDate(newDate.getDate() - 30); // Move by month
    setCurrentMonth(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setDate(newDate.getDate() + 30);
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

  // Calculate cycle insights
  const cycleInsights = useMemo(() => {
    const periodStartDates = chartData.filter(d => d.periodType === 'start' && d.hasData);
    
    if (periodStartDates.length < 2) {
      return {
        avgCycleLength: 'N/A',
        periodsTracked: periodStartDates.length,
        avgFlowLevel: 'N/A',
      };
    }

    // Calculate average cycle length
    const cycleLengths: number[] = [];
    for (let i = 1; i < periodStartDates.length; i++) {
      const prevDate = new Date(periodStartDates[i - 1].date);
      const currDate = new Date(periodStartDates[i].date);
      const diffTime = currDate.getTime() - prevDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      cycleLengths.push(diffDays);
    }

    const avgCycleLength = cycleLengths.reduce((sum, len) => sum + len, 0) / cycleLengths.length;
    
    // Calculate average flow level
    const flowData = chartData.filter(d => d.hasData && d.flowLevel > 0);
    const avgFlowLevel = flowData.length > 0 
      ? flowData.reduce((sum, d) => sum + d.flowLevel, 0) / flowData.length 
      : 0;

    return {
      avgCycleLength: avgCycleLength.toFixed(0),
      periodsTracked: periodStartDates.length,
      avgFlowLevel: avgFlowLevel.toFixed(1),
    };
  }, [chartData]);

  // Handle chart interactions
  const handleBarPress = (point: ChartDataPoint) => {
    if (!point.hasData) return;
    
    setTooltip({
      visible: true,
      data: point,
    });

    setTimeout(() => {
      setTooltip({ visible: false, data: null });
    }, 3000);
  };

  const hideTooltip = () => {
    setTooltip({ visible: false, data: null });
  };

  // Calculate chart metrics
  const chartWidth = chartData.length * (CHART_CONFIG.barWidth + CHART_CONFIG.spacing);
  const needsScroll = chartWidth > screenWidth - 40;

  // Show sample data info when no real data exists
  const showingSampleData = periodLogs.length === 0;

  // Get flow level label
  const getFlowLabel = (level: number): string => {
    const labels = ['No Period', 'Spotting', 'Light', 'Medium', 'Heavy', 'Very Heavy'];
    return labels[level] || 'Unknown';
  };

  return (
    <TouchableOpacity style={styles.container} onPress={hideTooltip} activeOpacity={1}>
      <Text style={styles.title}>{title}</Text>
      
      {/* Sample Data Banner */}
      {showingSampleData && (
        <View style={styles.sampleDataBanner}>
          <Text style={styles.sampleDataText}>
            🩸 Sample cycle data shown - Start logging periods to see your actual patterns!
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
          <Text style={styles.legendText}>Period Start</Text>
        </View>
      </View>

      {/* Y-axis Labels */}
      <View style={styles.yAxisContainer}>
        <Text style={styles.yAxisLabel}>Heavy</Text>
        <Text style={styles.yAxisLabel}>Med</Text>
        <Text style={styles.yAxisLabel}>Light</Text>
        <Text style={styles.yAxisLabel}>None</Text>
      </View>

      {/* Scrollable Chart Area */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.chartScrollContainer,
          !needsScroll && { justifyContent: 'center' }
        ]}
        style={styles.chartScroll}
      >
        <View style={styles.chartContainer}>
          {/* Grid Lines */}
          <View style={styles.gridContainer}>
            {[0, 1, 2, 3, 4].map(line => (
              <View 
                key={line} 
                style={[
                  styles.gridLine, 
                  { bottom: (line * CHART_CONFIG.maxBarHeight) / 4 }
                ]} 
              />
            ))}
          </View>

          {/* Chart Bars and Markers */}
          <View style={styles.barsContainer}>
            {chartData.map((point, index) => {
              const barHeight = point.hasData && point.flowLevel > 0
                ? (point.flowLevel / 5) * CHART_CONFIG.maxBarHeight 
                : 0;

              return (
                <TouchableOpacity
                  key={point.date}
                  style={styles.barContainer}
                  onPress={() => handleBarPress(point)}
                  disabled={!point.hasData}
                >
                  {/* Flow Level Bar */}
                  {barHeight > 0 && (
                    <View 
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          backgroundColor: CHART_COLORS.primary,
                          opacity: 0.8,
                        }
                      ]} 
                    />
                  )}
                  
                  {/* Period Start/End Markers */}
                  {point.hasData && point.periodType === 'start' && (
                    <View 
                      style={[
                        styles.startMarker,
                        {
                          backgroundColor: CHART_COLORS.secondary,
                          bottom: Math.max(barHeight, 5),
                        }
                      ]} 
                    />
                  )}
                  
                  {point.hasData && point.periodType === 'end' && (
                    <View 
                      style={[
                        styles.endMarker,
                        {
                          backgroundColor: CHART_COLORS.tertiary,
                          borderColor: CHART_COLORS.secondary,
                          bottom: Math.max(barHeight, 5),
                        }
                      ]} 
                    />
                  )}
                  
                  {/* Date Label (show scale every 5 days: 0, 5, 10, 15, 20, 25, 30) */}
                  {index % 5 === 0 && index <= 30 && (
                    <Text style={styles.dateLabel}>
                      {index === 0 ? '0' : index.toString()}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Tooltip */}
      {tooltip.visible && tooltip.data && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipDate}>
            {tooltip.data.originalDate.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </Text>
          <Text style={styles.tooltipValue}>
            {getFlowLabel(tooltip.data.flowLevel)}
          </Text>
          <Text style={styles.tooltipValue}>
            {tooltip.data.periodType === 'start' ? 'Period Start' :
             tooltip.data.periodType === 'end' ? 'Period End' :
             tooltip.data.periodType === 'ongoing' ? 'Period Day' : ''}
          </Text>
        </View>
      )}

      {/* Cycle Insights */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>
          Cycle Insights
        </Text>
        <View style={styles.summaryStats}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {cycleInsights.avgCycleLength} days
            </Text>
            <Text style={styles.summaryLabel}>Avg Cycle</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {cycleInsights.periodsTracked}
            </Text>
            <Text style={styles.summaryLabel}>Periods Tracked</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {cycleInsights.avgFlowLevel}
            </Text>
            <Text style={styles.summaryLabel}>Avg Flow Level</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: CHART_COLORS.white,
    padding: 20,
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
  yAxisContainer: {
    position: 'absolute',
    left: 5,
    top: 170,
    height: CHART_CONFIG.maxBarHeight,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  yAxisLabel: {
    fontSize: 9,
    color: CHART_COLORS.textLight,
    textAlign: 'right',
    width: 35,
  },
  chartScroll: {
    marginLeft: 35,
  },
  chartScrollContainer: {
    paddingHorizontal: 10,
  },
  chartContainer: {
    height: CHART_CONFIG.height,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  gridContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: CHART_CONFIG.maxBarHeight,
    bottom: 30,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: CHART_COLORS.grid,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: CHART_CONFIG.maxBarHeight + 30,
  },
  barContainer: {
    width: CHART_CONFIG.barWidth,
    marginRight: CHART_CONFIG.spacing,
    alignItems: 'center',
    position: 'relative',
  },
  bar: {
    width: CHART_CONFIG.barWidth,
    borderRadius: 2,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  startMarker: {
    position: 'absolute',
    width: CHART_CONFIG.markerSize,
    height: CHART_CONFIG.markerSize,
    borderRadius: CHART_CONFIG.markerSize / 2,
    left: (CHART_CONFIG.barWidth - CHART_CONFIG.markerSize) / 2,
  },
  endMarker: {
    position: 'absolute',
    width: CHART_CONFIG.markerSize,
    height: CHART_CONFIG.markerSize,
    borderRadius: CHART_CONFIG.markerSize / 2,
    borderWidth: 2,
    left: (CHART_CONFIG.barWidth - CHART_CONFIG.markerSize) / 2,
  },
  dateLabel: {
    fontSize: 8,
    color: CHART_COLORS.textLight,
    marginTop: 5,
    textAlign: 'center',
    width: CHART_CONFIG.barWidth + CHART_CONFIG.spacing,
    numberOfLines: 1,
  },
  tooltip: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: CHART_COLORS.text,
    padding: 10,
    borderRadius: 8,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  tooltipDate: {
    color: CHART_COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  tooltipValue: {
    color: CHART_COLORS.white,
    fontSize: 11,
    marginBottom: 2,
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

export default PeriodChart;

// FUTURE EXTENSIONS (commented for reference):
// 1. Add ovulation prediction markers
// 2. Include PMS symptom correlation
// 3. Add cycle irregularity warnings
// 4. Implement fertility window visualization
// 5. Add period prediction for next cycle
// 6. Include mood tracking correlation
// 7. Add contraceptive method tracking
// 8. Include pregnancy possibility indicators