import React, { useState } from 'react';
import { View, Text, TextInput, Picker, TouchableOpacity, StyleSheet } from 'react-native';

const RecurrencePicker = ({ onChange }) => {
  const [repeat_type, setRepeatType] = useState('');
  const [repeat_interval, setRepeatInterval] = useState(1);
  const [weekly_day, setWeeklyDay] = useState([]);
  const [monthly_option, setMonthlyOption] = useState('');
  const [monthly_day, setMonthlyDay] = useState(null);
  const [monthly_week, setMonthlyWeek] = useState('');
  const [monthly_weekday, setMonthlyWeekday] = useState('');
  const [yearly_month, setYearlyMonth] = useState('january'); // Default to January
  const [yearly_week, setYearlyWeek] = useState('first'); // Default to first week
  const [yearly_weekday, setYearlyWeekday] = useState('sunday'); // Default to Sunday

  const handleRepeatTypeChange = (type) => {
    setRepeatType(type);
    // Reset values when changing repeat types
    if (type === 'monthly') {
      setMonthlyOption('each');
    } else {
      setMonthlyOption('');
    }
    if (type !== 'yearly') {
      setYearlyMonth(''); // Reset yearly month if not yearly
      setYearlyWeek(''); // Reset yearly week if not yearly
      setYearlyWeekday(''); // Reset yearly weekday if not yearly
    }
  };

  const handleChange = () => {
    const pattern = {
      repeat_type,
      repeat_interval,
      weekly_day: repeat_type === 'weekly' ? weekly_day : null,
      monthly_option: repeat_type === 'monthly' ? monthly_option : null,
      monthly_day: repeat_type === 'monthly' && monthly_option === 'each' ? monthly_day : null,
      monthly_week: repeat_type === 'monthly' && monthly_option === 'onthe' ? monthly_week : null,
      monthly_weekday: repeat_type === 'monthly' && monthly_option === 'onthe' ? monthly_weekday : null,
      yearly_month: repeat_type === 'yearly' ? yearly_month : null,
      yearly_week: repeat_type === 'yearly' ? yearly_week : null,
      yearly_weekday: repeat_type === 'yearly' ? yearly_weekday : null,
    };
    onChange(pattern);
  };

  React.useEffect(handleChange, [repeat_type, repeat_interval, weekly_day, monthly_option, monthly_day, monthly_week, monthly_weekday, yearly_month, yearly_week, yearly_weekday]);

  return (
    <View style={styles.container}>
      {/* Frequency Picker */}
      <Text>Frequency:</Text>
      <Picker selectedValue={repeat_type} onValueChange={handleRepeatTypeChange} style={styles.picker}>
        <Picker.Item label="Select Frequency" value="" />
        <Picker.Item label="Daily" value="daily" />
        <Picker.Item label="Weekly" value="weekly" />
        <Picker.Item label="Monthly" value="monthly" />
        <Picker.Item label="Yearly" value="yearly" />
      </Picker>

      {/* Interval Input */}
      {repeat_type && (
        <View style={styles.inputRow}>
          <Text>Every:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={repeat_interval.toString()}
            onChangeText={(value) => setRepeatInterval(parseInt(value) || 1)}
          />
          <Text>{repeat_type === 'daily' ? 'day(s)' : repeat_type === 'weekly' ? 'week(s)' : repeat_type === 'monthly' ? 'month(s)' : 'year(s)'}</Text>
        </View>
      )}

      {/* Weekly Options */}
      {repeat_type === 'weekly' && (
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
              style={[
                styles.dayButton,
                weekly_day.includes(day) && styles.dayButtonSelected,
              ]}
            >
              <Text style={styles.dayText}>{day}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Monthly Options */}
      {repeat_type === 'monthly' && (
        <>
          <Text>Repeat on:</Text>
          <Picker selectedValue={monthly_option} onValueChange={setMonthlyOption} style={styles.picker}>
            <Picker.Item label="Each (specific date)" value="each" />
            <Picker.Item label="On the..." value="onthe" />
          </Picker>
          {monthly_option === 'each' && (
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Day of the month (1-31)"
              value={monthly_day ? monthly_day.toString() : ''}
              onChangeText={(value) => setMonthlyDay(parseInt(value) || null)}
            />
          )}
          {monthly_option === 'onthe' && (
            <>
              <Picker selectedValue={monthly_week} onValueChange={setMonthlyWeek} style={styles.picker}>
                <Picker.Item label="First" value="first" />
                <Picker.Item label="Second" value="second" />
                <Picker.Item label="Third" value="third" />
                <Picker.Item label="Fourth" value="fourth" />
                <Picker.Item label="Fifth" value="fifth" />
                <Picker.Item label="Last" value="last" />
              </Picker>
              <Picker selectedValue={monthly_weekday} onValueChange={setMonthlyWeekday} style={styles.picker}>
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Day', 'Weekday', 'Weekend Day'].map((option) => (
                  <Picker.Item label={option} value={option.toLowerCase()} key={option} />
                ))}
              </Picker>
            </>
          )}
        </>
      )}

      {/* Yearly Options */}
      {repeat_type === 'yearly' && (
        <>
          <Text>Repeat in:</Text>
          <Picker selectedValue={yearly_month} onValueChange={setYearlyMonth} style={styles.picker}>
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
              <Picker.Item label={month} value={month.toLowerCase()} key={month} />
            ))}
          </Picker>
          <Text>On the:</Text>
          <Picker selectedValue={yearly_week} onValueChange={setYearlyWeek} style={styles.picker}>
            <Picker.Item label="First" value="first" />
            <Picker.Item label="Second" value="second" />
            <Picker.Item label="Third" value="third" />
            <Picker.Item label="Fourth" value="fourth" />
            <Picker.Item label="Fifth" value="fifth" />
            <Picker.Item label="Last" value="last" />
          </Picker>
          <Picker selectedValue={yearly_weekday} onValueChange={setYearlyWeekday} style={styles.picker}>
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
  container: { padding: 10 },
  picker: { marginBottom: 10 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  input: { borderBottomWidth: 1, flex: 1, marginRight: 5, padding: 5 },
  dayButton: { padding: 10, marginVertical: 5, backgroundColor: '#f0f0f0' },
  dayButtonSelected: { backgroundColor: '#007AFF' },
  dayText: { color: '#333' },
});

export default RecurrencePicker;
