// AI Progress Analysis & Sustainability Impact Prediction

interface ProjectData {
  projectName: string;
  completedTasks: number;
  totalTasks: number;
  startDate: Date;
  endDate: Date;
  projectType:
    | "Green_Spaces"
    | "Energy_Conservation"
    | "Water_Conservation"
    | "Recycling"
    | "Volunteer_Efforts"
    | "Awareness_Campaigns";
  resourcesUsed: number;
}

// 1. AI PROGRESS ANALYSIS - Analyzes how well the project is progressing
export function analyzeProgress(projectData: ProjectData) {
  const { completedTasks, totalTasks, startDate, endDate } = projectData;

  const percentComplete = (completedTasks / totalTasks) * 100;
  const today = new Date();

  // Calculate expected progress based on time elapsed
  const totalDays =
    (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
  const daysElapsed =
    (today.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
  const expectedProgress = (daysElapsed / totalDays) * 100;

  // AI Decision Logic
  let status: "Ahead" | "On Track" | "Behind" = "On Track";
  let message = "";
  let color = "#2196f3"; // Blue

  if (percentComplete >= expectedProgress + 15) {
    status = "Ahead";
    message =
      "🚀 Excellent progress! You are ahead of schedule. Keep up the great work!";
    color = "#4caf50"; // Green
  } else if (percentComplete <= expectedProgress - 15) {
    status = "Behind";
    message =
      "⚠️ Project is behind schedule. Consider increasing resources or adjusting timeline.";
    color = "#f44336"; // Red
  } else {
    status = "On Track";
    message = "✅ Project is on track. Good progress meeting deadlines.";
    color = "#2196f3"; // Blue
  }

  return {
    status,
    message,
    color,
    percentComplete: Math.round(percentComplete),
    expectedProgress: Math.round(expectedProgress),
    tasksRemaining: totalTasks - completedTasks,
  };
}

// 2. AI SUSTAINABILITY IMPACT PREDICTION - Predicts environmental impact
// Add this AFTER your existing predictImpact function in aiHelpers.ts

// NEW: Tree Planting specific analysis
export function analyzeGreenSpaces(
  treesPlanted: number = 0,
  survivalRate: number = 80,
  flowerBeds: number = 0,
  shrubsPlanted: number = 0,
  greenRoofs: number = 0,
  seatingAreas: number = 0,
) {
  // Tree-related metrics
  const co2Offset = treesPlanted * 22;
  const healthStatus =
    survivalRate >= 80
      ? "Healthy 🌳"
      : survivalRate >= 50
        ? "Moderate 🌱"
        : "Needs attention ⚠️";

  // Beautification metrics
  const biodiversityBoost = shrubsPlanted * 0.5 + flowerBeds * 2;
  const aestheticScore =
    flowerBeds * 5 + shrubsPlanted * 1 + greenRoofs * 20 + seatingAreas * 10;
  let beautyRating = "";
  if (aestheticScore > 50) beautyRating = "Campus Oasis 🌸";
  else if (aestheticScore > 20) beautyRating = "Pleasant Green 🌿";
  else beautyRating = "Starting to Bloom 🌱";

  // Generate badges and recommendations
  let badges = [];
  let recommendation = "";

  if (treesPlanted > 0) badges.push("🌳 Tree Planter");
  if (flowerBeds > 0) badges.push("🌼 Flower Beds Added");
  if (shrubsPlanted > 0) badges.push("🍃 Native Shrubs");
  if (greenRoofs > 0) badges.push("🏡 Green Roof Installed");
  if (seatingAreas > 0) badges.push("🪑 Community Seating");

  if (treesPlanted === 0 && flowerBeds === 0 && shrubsPlanted === 0) {
    recommendation = "Start with a small flower bed or two trees – big impact!";
  } else if (survivalRate < 70 && treesPlanted > 0) {
    recommendation = "Water young trees and add mulch to improve survival.";
  } else if (aestheticScore < 30) {
    recommendation =
      "Add seating areas or more flowering plants for student relaxation.";
  } else {
    recommendation =
      "Great work! Consider adding a green roof or pollinator garden next.";
  }

  // Total green coverage improvement estimate (m² equivalent)
  const totalGreenImpact =
    treesPlanted * 5 + flowerBeds * 2 + shrubsPlanted * 1 + greenRoofs * 30;

  return {
    // Tree specific
    treesPlanted: `${treesPlanted} trees`,
    co2Offset: `${co2Offset} kg CO2/year`,
    treeHealth: healthStatus,
    // Beautification specific
    flowerBeds: `${flowerBeds} bed(s)`,
    shrubsPlanted: `${shrubsPlanted} shrub(s)`,
    greenRoofs: `${greenRoofs} green roof(s)`,
    seatingAreas: `${seatingAreas} seating area(s)`,
    aestheticRating: beautyRating,
    totalGreenImpact: `~${totalGreenImpact} m² enhanced green space`,
    badges: badges.length > 0 ? badges.join(" • ") : "🌱 Just getting started",
    recommendation: recommendation,
    // Bonus tip
    tip:
      flowerBeds > 0
        ? "Add native flowering plants to attract pollinators."
        : "Even one flower bed makes a difference for mental well-being.",
  };
}

export function analyzeEnergyConservation(
  kwhSaved: number,
  solarPanels: number = 0,
  energyAudits: number = 0,
  studentMonitors: number = 0,
) {
  const co2Reduced = kwhSaved * 0.5;
  const moneySaved = (kwhSaved * 2.5).toFixed(0);
  const auditSavings = energyAudits * 100; // each audit saves ~100 kWh
  const monitorSavings = studentMonitors * 50; // each monitor reduces ~50 kWh
  const totalAdjustedSavings = kwhSaved + auditSavings + monitorSavings;
  const totalCo2Reduced = totalAdjustedSavings * 0.5;

  let recommendation = "";
  let badges = [];

  // Recommendations based on input
  if (solarPanels === 0 && energyAudits === 0 && studentMonitors === 0) {
    recommendation = "Start with a free energy audit to identify quick wins.";
    badges.push("🌱 Beginner Saver");
  } else {
    if (energyAudits > 0) {
      badges.push("🔍 Audit Completed");
      recommendation = "Use audit findings to replace old appliances.";
    }
    if (studentMonitors > 0) {
      badges.push("👥 Student Monitors Active");
      recommendation = "Empower monitors to run awareness campaigns.";
    }
    if (solarPanels > 0) {
      badges.push("☀️ Solar Early Adopter");
      recommendation = "Add battery storage to maximize solar benefits.";
    }
    if (solarPanels > 2 && studentMonitors > 5) {
      badges.push("🏆 Energy Champion");
      recommendation = "Share your model with other campus buildings!";
    }
  }

  return {
    // Original fields
    co2Reduced: `${Math.round(co2Reduced)} kg CO2 saved`,
    moneySaved: `R${moneySaved} per year`,
    energySaved: `${kwhSaved} kWh saved`,
    recommendation,
    // New detailed fields
    solarPanelsInstalled: `${solarPanels} panel(s) installed`,
    energyAuditsConducted: `${energyAudits} audit(s) completed`,
    studentMonitorTeams: `${studentMonitors} student(s) monitoring energy`,
    totalAdjustedSavings: `${Math.round(totalAdjustedSavings)} kWh total saved (incl. audits & monitors)`,
    totalCO2Reduction: `${Math.round(totalCo2Reduced)} kg CO2 reduced`,
    badges: badges.join(" • "),
    // Bonus tip
    tip:
      energyAudits === 0
        ? "Conduct an energy audit first – it's free and can save up to 30% on bills!"
        : studentMonitors === 0
          ? "Start a student energy monitor team to build long-term habits."
          : "Great team! Next step: track savings weekly and celebrate milestones.",
  };
}

// NEW: Water Conservation specific analysis
export function analyzeWaterConservation(
  litersSaved: number,
  tapsFixed: number = 0,
) {
  const moneySaved = (litersSaved * 0.02).toFixed(0);

  return {
    waterSaved: `${litersSaved.toLocaleString()} liters`,
    moneySaved: `R${moneySaved} per month`,
    tapsFixed:
      tapsFixed > 0 ? `${tapsFixed} leaks fixed` : "Check for dripping taps",
    level:
      litersSaved > 5000
        ? "💧 Water Hero"
        : litersSaved > 1000
          ? "💧 Water Saver"
          : "💧 Getting Started",
    recommendation:
      tapsFixed === 0
        ? "Fix one leaking tap - saves 1000L/year!"
        : "Consider a rain barrel",
  };
}
// NEW: Recycling specific analysis (different from waste reduction - focuses on material recovery)
export function analyzeRecycling(
  kgPaper: number,
  kgPlastic: number,
  kgGlass: number,
  kgMetal: number,
) {
  const totalRecycled = kgPaper + kgPlastic + kgGlass + kgMetal;
  const co2Saved = totalRecycled * 0.9; // 0.9 kg CO2 per kg recycled average
  const treesSaved = kgPaper * 0.02; // 1 tree per 50 kg paper
  const oilSaved = kgPlastic * 0.5; // liters of oil per kg plastic
  const energySaved = totalRecycled * 4; // kWh saved per kg

  let badge = "";
  let recommendation = "";

  if (totalRecycled > 500) {
    badge = "🏭 Industrial Recycler!";
    recommendation = "Partner with local回收中心 to scale impact.";
  } else if (totalRecycled > 100) {
    badge = "♻️ Recycling Champion!";
    recommendation = "Start a recycling competition in your community.";
  } else {
    badge = "🌱 Starting Recycler";
    recommendation = "Separate paper, plastic, glass, metal at source.";
  }

  return {
    totalRecycled: `${totalRecycled} kg`,
    co2Saved: `${Math.round(co2Saved)} kg CO2`,
    treesSaved: `${treesSaved.toFixed(1)} trees saved`,
    oilSaved: `${oilSaved.toFixed(1)} liters of oil`,
    energySaved: `${energySaved} kWh`,
    badge: badge,
    recommendation: recommendation,
    breakdown: `📄 Paper: ${kgPaper} kg | 🧴 Plastic: ${kgPlastic} kg | 🥤 Glass: ${kgGlass} kg | 🔩 Metal: ${kgMetal} kg`,
  };
}

export function analyseVolunteerEfforts(
  volunteers: number,
  bagsCollected: number,
  areaCovered: number,
  wasteTypes: string = "Mixed",
  cleanupEvents: number = 1, // how many separate cleanup days
  volunteerHours: number = 0, // total hours contributed by volunteers
  partneredWithNGO: boolean = false, // whether collaborating with an external org
  partnerName: string = "", // name of the NGO/partner
) {
  // Basic waste & CO2 calculations
  const kgEstimate = bagsCollected * 5;
  const co2Offset = kgEstimate * 0.2;
  const impactScore = bagsCollected * 2 + volunteers * 5 + cleanupEvents * 10;

  // Volunteer effort metrics
  const avgVolunteersPerEvent = Math.round(volunteers / cleanupEvents);
  const hoursPerVolunteer =
    volunteerHours > 0 ? (volunteerHours / volunteers).toFixed(1) : 0;
  const totalVolunteerHours =
    volunteerHours > 0 ? volunteerHours : volunteers * 2; // estimate if not provided

  // Determine ratings & badges
  let rating = "";
  let badge = "";
  let recommendation = "";
  let collaborationBadge = "";

  // Impact rating based on bags + volunteers + events
  if (bagsCollected > 50 || volunteers > 100 || cleanupEvents > 3) {
    rating = "🌟 Massive Impact";
    badge = "🏆 Campus Hero";
    recommendation = "Share your success story to inspire other campuses.";
  } else if (bagsCollected > 20 || volunteers > 30 || cleanupEvents > 1) {
    rating = "👍 Great Cleanup";
    badge = "🧹 Clean Leader";
    recommendation =
      "Map the cleaned area for future reference and target litter hotspots.";
  } else {
    rating = "🌱 Good Start";
    badge = "🌿 First Stepper";
    recommendation =
      "Invite friends or start a regular monthly cleanup schedule.";
  }

  // Collaboration badge & recommendation
  if (partneredWithNGO) {
    collaborationBadge = `🤝 Partnered with ${partnerName || "local environmental organization"}`;
    recommendation +=
      " Excellent collaboration! Consider co‑hosting educational workshops.";
  } else {
    collaborationBadge = "🌍 Open to partnerships";
    if (bagsCollected > 30) {
      recommendation +=
        " Reach out to local environmental NGOs – they often provide free equipment.";
    }
  }

  // Additional volunteer recognition
  let volunteerRecognition = "";
  if (cleanupEvents >= 3)
    volunteerRecognition = "💪 Consistent effort – multiple cleanups!";
  else if (volunteerHours > 100)
    volunteerRecognition = "⏱️ Dedicated volunteers – over 100 hours given!";
  else if (avgVolunteersPerEvent >= 20)
    volunteerRecognition = "👥 Strong team spirit – well attended events.";

  return {
    // Basic metrics
    volunteers: `${volunteers} people`,
    cleanupEvents: `${cleanupEvents} event(s)`,
    bagsCollected: `${bagsCollected} bags (${kgEstimate} kg)`,
    areaCovered: `${areaCovered} m²`,
    co2Offset: `${Math.round(co2Offset)} kg CO2 prevented`,
    impactScore: `${impactScore} points`,
    rating: rating,
    badge: badge,

    // Volunteer & organization details
    avgVolunteersPerEvent: `${avgVolunteersPerEvent} per cleanup`,
    totalVolunteerHours: `${totalVolunteerHours} hours (approx)`,
    volunteerRecognition: volunteerRecognition,
    collaborationStatus: collaborationBadge,
    partner: partneredWithNGO ? partnerName || "Local NGO" : "None",

    // Waste insights
    wasteHighlight:
      wasteTypes !== "Mixed"
        ? `Main waste type: ${wasteTypes}`
        : "Track waste types for better analytics",

    // Recommendations (combined)
    recommendation: recommendation,

    // Next step suggestion
    nextStep: partneredWithNGO
      ? "Apply for a campus sustainability grant together."
      : "Invite a local environmental group to co‑lead your next cleanup.",
  };
}

// NEW: Awareness Campaign specific analysis
export function analyzeAwarenessCampaign(
  attendees: number,
  postsShared: number,
  materialsDistributed: number,
  followUpActions: number,
) {
  const reachEstimate = attendees + postsShared * 100; // each post reaches ~100 people
  const engagementRate = ((followUpActions / attendees) * 100).toFixed(1);
  const carbonAwareness = attendees * 0.5 + materialsDistributed * 0.1;

  let effectiveness = "";
  let badge = "";
  let recommendation = "";

  if (attendees > 200 || postsShared > 50) {
    effectiveness = "📢 Viral Awareness";
    badge = "📣 Influencer";
    recommendation =
      "Create a challenge for participants to share their own actions.";
  } else if (attendees > 50 || followUpActions > 20) {
    effectiveness = "📈 High Engagement";
    badge = "🗣️ Change Maker";
    recommendation = "Collect feedback and testimonials for future campaigns.";
  } else {
    effectiveness = "🌱 Seed Stage";
    badge = "📖 Starting Out";
    recommendation = "Use social media ads to boost reach for next campaign.";
  }

  return {
    attendees: `${attendees} people`,
    postsShared: `${postsShared} posts (estimated reach ${reachEstimate})`,
    materialsDistributed: `${materialsDistributed} items`,
    followUpActions: `${followUpActions} actions taken`,
    engagementRate: `${engagementRate}% follow-up rate`,
    carbonAwarenessScore: `${Math.round(carbonAwareness)} points`,
    effectiveness: effectiveness,
    badge: badge,
    recommendation: recommendation,
    nextStep: `Consider a pre/post survey to measure knowledge gain.`,
  };
}
