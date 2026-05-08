export const DEADLINE_REMINDER_OFFSETS = [3, 1];

function getProjectName(projectName) {
  return projectName?.trim() || "Untitled Project";
}

export const notificationMessages = {
  newProject(projectName) {
    return {
      title: "New Project Alert",
      body: `New Sustainability Project Added: ${getProjectName(projectName)}`,
    };
  },
  deadlineReminder(projectName, daysBefore) {
    return {
      title: "Upcoming Deadline Reminder",
      body:
        daysBefore === 1
          ? `Reminder: ${getProjectName(projectName)} deadline is tomorrow.`
          : `Reminder: ${getProjectName(projectName)} deadline is in ${daysBefore} days.`,
    };
  },
  projectStopped(projectName) {
    return {
      title: "Project Status Update",
      body: `Project ${getProjectName(projectName)} has been stopped by administrators.`,
    };
  },
  projectResumed(projectName) {
    return {
      title: "Project Status Update",
      body: `Project ${getProjectName(projectName)} has been resumed by administrators.`,
    };
  },
};
