import { RRule, RRuleSet, rrulestr } from 'rrule';
import { supabase } from './supabaseClient'; // Update this import according to your setup

// Function to create new tasks based on repeating logic
export const handleRepeatLogic = async (task) => {
  const {
    repeat_type,
    repeat_interval,
    weekly_day,
    monthly_option,
    monthly_day,
    monthly_week,
    monthly_weekday,
    yearly_month,
    yearly_week,
    yearly_weekday,
    due_date,
  } = task;

  const ruleSet = new RRuleSet();
  const ruleOptions = {
    freq: null,
    interval: repeat_interval || 1,
    dtstart: new Date(due_date),
  };

  // Set the frequency based on repeat_type
  switch (repeat_type) {
    case 'daily':
      ruleOptions.freq = RRule.DAILY;
      break;
    case 'weekly':
      ruleOptions.freq = RRule.WEEKLY;
      if (weekly_day && weekly_day.length > 0) {
        ruleOptions.byweekday = weekly_day.map((day) => {
          switch (day) {
            case 'sunday': return RRule.SU;
            case 'monday': return RRule.MO;
            case 'tuesday': return RRule.TU;
            case 'wednesday': return RRule.WE;
            case 'thursday': return RRule.TH;
            case 'friday': return RRule.FR;
            case 'saturday': return RRule.SA;
            default: return null;
          }
        }).filter(Boolean);
      }
      break;
    case 'monthly':
      ruleOptions.freq = RRule.MONTHLY;
      if (monthly_option === 'day of the month') {
        ruleOptions.bymonthday = [parseInt(monthly_day, 10)];
      } else if (monthly_option === 'nth week') {
        ruleOptions.byweekno = [parseInt(monthly_week, 10)];
        ruleOptions.byweekday = [getWeekday(monthly_weekday)];
      }
      break;
    case 'yearly':
      ruleOptions.freq = RRule.YEARLY;
      if (yearly_month) {
        ruleOptions.bymonth = [getMonth(yearly_month)];
      }
      if (yearly_week) {
        ruleOptions.byweekno = [parseInt(yearly_week, 10)];
        ruleOptions.byweekday = [getWeekday(yearly_weekday)];
      }
      break;
    default:
      return; // Exit if no valid repeat type
  }

  // Add the rule to the rule set
  ruleSet.rrule(new RRule(ruleOptions));

  // Create new tasks based on the rule
  const newTasks = ruleSet.all().map(date => {
    return {
      ...task, // Copy existing task properties
      due_date: date.toISOString(),
      is_completed: 0, // Mark as not completed
    };
  });

  // Save the new tasks to the database
  await Promise.all(newTasks.map(async (newTask) => {
    const { error } = await supabase
      .from('tasks_table')
      .insert(newTask);

    if (error) {
      console.error('Error inserting new task:', error);
    }
  }));
};

// Helper functions to convert month and weekday strings to numbers
const getMonth = (month) => {
  const months = {
    january: 1,
    february: 2,
    march: 3,
    april: 4,
    may: 5,
    june: 6,
    july: 7,
    august: 8,
    september: 9,
    october: 10,
    november: 11,
    december: 12,
  };
  return months[month.toLowerCase()] || null;
};

const getWeekday = (weekday) => {
  const weekdays = {
    sunday: RRule.SU,
    monday: RRule.MO,
    tuesday: RRule.TU,
    wednesday: RRule.WE,
    thursday: RRule.TH,
    friday: RRule.FR,
    saturday: RRule.SA,
    weekday: RRule.MO | RRule.TU | RRule.WE | RRule.TH | RRule.FR,
    weekend: RRule.SA | RRule.SU,
  };
  return weekdays[weekday.toLowerCase()] || null;
};
