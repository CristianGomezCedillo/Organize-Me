const OrganizerAlgorithm = {
    GetPriority: (dueDateString, isCompleted, taskLength) => {
      // Priority calculation logic
      const weightPerDay = 1; //+1 priority point per day up to a max of 5
      const weightOfDueToday = 7;
      const weightPerHour = 2; //+1 priority point per hour in the task session length
      const today = new Date();
      const dueDate = new Date(dueDateString);
      const daysTilDue = Math.floor((dueDate-today) / (1000*60*60*24));
      let score = 0;
      score += weightOfDueToday-(weightPerDay*daysTilDue);
      const length = parseFloat(taskLength,10);
      if(!isNaN(length)){
        score += weightPerHour*(taskLength - (taskLength*isCompleted));
      }
      if(!isNaN(score)) return score;
      else return 0;
    }
  };
  
  export default OrganizerAlgorithm;

