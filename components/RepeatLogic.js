import { RRule } from 'rrule';
import { supabase } from './supabaseClient'; // Update this import according to your setup

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

  if (!repeat_type) {
    console.warn("No repeat_type provided. Exiting handleRepeatLogic.");
    return; // Exit early if repeat_type is null or undefined
  }

  const ruleOptions = {
    freq: null,
    interval: repeat_interval || 1,
    dtstart: new Date(due_date),
  };

  if (isNaN(ruleOptions.dtstart)) {
    console.error("Invalid due_date provided:", due_date);
    return;
  }

  // Set the frequency based on repeat_type
  switch (repeat_type.toLowerCase()) {
    case 'daily':
      ruleOptions.freq = RRule.DAILY;
      break;
    case 'weekly':
      ruleOptions.freq = RRule.WEEKLY;
      if (Array.isArray(weekly_day) && weekly_day.length > 0) {
        ruleOptions.byweekday = weekly_day.map(day => getWeekday(day)).filter(Boolean);
      }
      break;
    case 'monthly':
      ruleOptions.freq = RRule.MONTHLY;
      if (monthly_option === 'day of the month' && monthly_day) {
        ruleOptions.bymonthday = [parseInt(monthly_day, 10)];
      } else if (monthly_option === 'nth week' && monthly_week && monthly_weekday) {
        ruleOptions.byweekno = [parseInt(monthly_week, 10)];
        ruleOptions.byweekday = [getWeekday(monthly_weekday)];
      }
      break;
    case 'yearly':
      ruleOptions.freq = RRule.YEARLY;
      if (yearly_month) {
        ruleOptions.bymonth = [getMonth(yearly_month)];
      }
      if (yearly_week && yearly_weekday) {
        ruleOptions.byweekno = [parseInt(yearly_week, 10)];
        ruleOptions.byweekday = [getWeekday(yearly_weekday)];
      }
      break;
    default:
      console.warn("Invalid repeat_type:", repeat_type);
      return;
  }

  // Create the rule and generate the next occurrence
  const rule = new RRule(ruleOptions);
  const nextDate = rule.after(new Date(due_date));

  if (!nextDate) {
    console.warn("No next date generated. Check your RRule configuration.");
    return;
  }

  // Create the new task with the next due date and remove the id
  const { id, ...newTaskData } = task; // Destructure and exclude the 'id' field
  const newTask = {
    ...newTaskData, // Copy existing task properties without 'id'
    due_date: nextDate.toISOString() + 1,
    is_completed: 0, // Mark as not completed
  };

  // Save the new task to the database
  try {
    const { error } = await supabase.from('tasks_table').insert(newTask);

    if (error) {
      console.error("Error inserting new task:", error);
    } else {
      console.log("New task inserted successfully.");
    }
  } catch (error) {
    console.error("Error during task insertion:", error);
  }
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
  };
  return weekdays[weekday.toLowerCase()] || null;
};
