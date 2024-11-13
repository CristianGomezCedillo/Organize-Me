import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Picker, TouchableOpacity, StyleSheet } from 'react-native';

const RecurrencePicker = ({ 
    onChange,
    initialRepeatType = '',
    initialRepeatInterval = 1,
    initialWeeklyDay = [],
    initialMonthlyOption = '',
    initialMonthlyDay = '',
    initialMonthlyWeek = '',
    initialMonthlyWeekday = '',
    initialYearlyMonth = 'january',
    initialYearlyWeek = 'first',
    initialYearlyWeekday = 'sunday'
}) => {
  const [repeatType, setRepeatType] = useState(initialRepeatType);
  const [repeatInterval, setRepeatInterval] = useState(initialRepeatInterval);
  const [weeklyDay, setWeeklyDay] = useState(initialWeeklyDay);
  const [monthlyOption, setMonthlyOption] = useState(initialMonthlyOption);
  const [monthlyDay, setMonthlyDay] = useState(initialMonthlyDay);
  const [monthlyWeek, setMonthlyWeek] = useState(initialMonthlyWeek);
  const [monthlyWeekday, setMonthlyWeekday] = useState(initialMonthlyWeekday);
  const [yearlyMonth, setYearlyMonth] = useState(initialYearlyMonth);
  const [yearlyWeek, setYearlyWeek] = useState(initialYearlyWeek);
  const [yearlyWeekday, setYearlyWeekday] = useState(initialYearlyWeekday);

  const handleRepeatTypeChange = (type) => {
    setRepeatType(type);
    // Reset values when changing repeat types
    setRepeatInterval(1);
    setWeeklyDay([]);
    setMonthlyOption('');
    setMonthlyDay(null);
    setMonthlyWeek('');
    setMonthlyWeekday('');
    setYearlyMonth('january');
    setYearlyWeek('first');
    setYearlyWeekday('sunday');
  };

  const handleChange = () => {
    const pattern = {
      repeat_type: repeatType,
      repeat_interval: repeatInterval,
      weekly_day: repeatType === 'weekly' ? weeklyDay : null,
      monthly_option: repeatType === 'monthly' ? monthlyOption : null,
      monthly_day: repeatType === 'monthly' && monthlyOption === 'each' ? monthlyDay : null,
      monthly_week: repeatType === 'monthly' && monthlyOption === 'onthe' ? monthlyWeek : null,
      monthly_weekday: repeatType === 'monthly' && monthlyOption === 'onthe' ? monthlyWeekday : null,
      yearly_month: repeatType === 'yearly' ? yearlyMonth : null,
      yearly_week: repeatType === 'yearly' ? yearlyWeek : null,
      yearly_weekday: repeatType === 'yearly' ? yearlyWeekday : null,
    };
    onChange(pattern);
  };
  

  // Trigger handleChange whenever any relevant state changes
  useEffect(handleChange, [repeatType, repeatInterval, weeklyDay, monthlyOption, monthlyDay, monthlyWeek, monthlyWeekday, yearlyMonth, yearlyWeek, yearlyWeekday]);

  return (
    <View style={styles.container}>
      {/* Frequency Picker */}
      <Picker selectedValue={repeatType} onValueChange={handleRepeatTypeChange} style={styles.picker}>
        <Picker.Item label="Select Frequency" value="" />
        <Picker.Item label="Daily" value="daily" />
        <Picker.Item label="Weekly" value="weekly" />
        <Picker.Item label="Monthly" value="monthly" />
        <Picker.Item label="Yearly" value="yearly" />
      </Picker>

        {/* Interval Input */}
        {repeatType && (
        <View style={styles.inputRow}>
            <Text>Every:</Text>
            <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={repeatInterval ? repeatInterval.toString() : ''}
            onChangeText={(value) => {
                const parsedValue = parseInt(value);
                // Update state only if the input is a valid positive number or empty
                if (value === '' || (!isNaN(parsedValue) && parsedValue > 0)) {
                setRepeatInterval(value === '' ? '' : parsedValue); // Keep it as a string for deletion
                }
            }}
            onBlur={() => {
                // On blur, set to 1 if the input is empty
                if (repeatInterval === '') {
                setRepeatInterval(1);
                }
            }}
            />
          <Text>{repeatType === 'daily' ? 'day(s)' : repeatType === 'weekly' ? 'week(s)' : repeatType === 'monthly' ? 'month(s)' : 'year(s)'}</Text>
        </View>
      )}

      {/* Weekly Options */}
      {repeatType === 'weekly' && (
        <View>
          <Text>Select Day(s) of the Week:</Text>
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
            <TouchableOpacity
              key={day}
              onPress={() =>
                setWeeklyDay((prev) =>
                  prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
                )
              }
              style={[styles.dayButton, weeklyDay.includes(day) && styles.dayButtonSelected]}
            >
              <Text style={styles.dayText}>{day}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Monthly Options */}
      {repeatType === 'monthly' && (
        <>
          <Text>Repeat on:</Text>
          <Picker selectedValue={monthlyOption} onValueChange={setMonthlyOption} style={styles.picker}>
            <Picker.Item label="Each (specific date)" value="each" />
            <Picker.Item label="On the..." value="onthe" />
          </Picker>
          {monthlyOption === 'each' && (
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Day of the month (1-31)"
              value={monthlyDay ? monthlyDay.toString() : ''}
              onChangeText={(value) => setMonthlyDay(parseInt(value) || null)}
            />
          )}
          {monthlyOption === 'onthe' && (
            <>
              <Picker selectedValue={monthlyWeek} onValueChange={setMonthlyWeek} style={styles.picker}>
                <Picker.Item label="First" value="first" />
                <Picker.Item label="Second" value="second" />
                <Picker.Item label="Third" value="third" />
                <Picker.Item label="Fourth" value="fourth" />
                <Picker.Item label="Fifth" value="fifth" />
                <Picker.Item label="Last" value="last" />
              </Picker>
              <Picker selectedValue={monthlyWeekday} onValueChange={setMonthlyWeekday} style={styles.picker}>
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Day', 'Weekday', 'Weekend Day'].map((option) => (
                  <Picker.Item label={option} value={option.toLowerCase()} key={option} />
                ))}
              </Picker>
            </>
          )}
        </>
      )}

      {/* Yearly Options */}
      {repeatType === 'yearly' && (
        <>
          <Text>Repeat in:</Text>
          <Picker selectedValue={yearlyMonth} onValueChange={setYearlyMonth} style={styles.picker}>
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
              <Picker.Item label={month} value={month.toLowerCase()} key={month} />
            ))}
          </Picker>
          <Text>On the:</Text>
          <Picker selectedValue={yearlyWeek} onValueChange={setYearlyWeek} style={styles.picker}>
            <Picker.Item label="First" value="first" />
            <Picker.Item label="Second" value="second" />
            <Picker.Item label="Third" value="third" />
            <Picker.Item label="Fourth" value="fourth" />
            <Picker.Item label="Fifth" value="fifth" />
            <Picker.Item label="Last" value="last" />
          </Picker>
          <Picker selectedValue={yearlyWeekday} onValueChange={setYearlyWeekday} style={styles.picker}>
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Day', 'Weekday', 'Weekend Day'].map((option) => (
              <Picker.Item label={option} value={option.toLowerCase()} key={option} />
            ))}
          </Picker>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10, zIndex: -9 },
  picker: { marginBottom: 10, padding: 5 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  input: { borderBottomWidth: 1, flex: 1, marginRight: 5, padding: 5 },
  dayButton: { padding: 10, marginVertical: 5, backgroundColor: '#f0f0f0' },
  dayButtonSelected: { backgroundColor: '#007AFF' },
  dayText: { color: '#333' },
});

export default RecurrencePicker;
