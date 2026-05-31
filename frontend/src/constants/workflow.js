export const statuses = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

export const statusLabels = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  REVIEW: "Review",
  DONE: "Done",
};

export const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
export const roles = ["ADMIN", "MANAGER", "MEMBER"];

export const organizationIndustries = [
  { value: "GENERAL_BUSINESS", label: "General business" },
  { value: "INFORMATION_TECHNOLOGY", label: "Information technology" },
  { value: "PROFESSIONAL_SERVICES", label: "Professional services" },
  { value: "SALES_AND_CRM", label: "Sales and CRM" },
  { value: "OPERATIONS", label: "Operations" },
  { value: "HUMAN_RESOURCES", label: "Human resources" },
  { value: "FINANCE_AND_ACCOUNTING", label: "Finance and accounting" },
  { value: "EDUCATION", label: "Education" },
  { value: "HEALTHCARE", label: "Healthcare" },
  { value: "MANUFACTURING", label: "Manufacturing" },
  { value: "CONSTRUCTION", label: "Construction" },
  { value: "REAL_ESTATE", label: "Real estate" },
  { value: "RETAIL", label: "Retail" },
  { value: "NON_PROFIT", label: "Non-profit" },
  { value: "LAW_FIRM", label: "Law firm" },
  { value: "MARKETING_AGENCY", label: "Marketing agency" },
  { value: "CONSULTING", label: "Consulting" },
];

export const projectWorkTypes = [
  { value: "GENERAL", label: "General project" },
  { value: "CLIENT_PROJECT", label: "Client project" },
  { value: "INTERNAL_PROJECT", label: "Internal project" },
  { value: "OPERATIONS_WORK", label: "Operations work" },
  { value: "SALES_PIPELINE", label: "Sales pipeline" },
  { value: "HR_PROCESS", label: "HR process" },
  { value: "FINANCE_PROCESS", label: "Finance process" },
  { value: "PROCUREMENT", label: "Procurement" },
  { value: "CUSTOMER_SUPPORT", label: "Customer support" },
  { value: "PRODUCT_DELIVERY", label: "Product delivery" },
  { value: "IMPLEMENTATION", label: "Implementation" },
  { value: "EVENT", label: "Event" },
  { value: "TRAINING", label: "Training" },
  { value: "COMPLIANCE", label: "Compliance" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "LEGAL_MATTER", label: "Legal matter" },
  { value: "MARKETING_CAMPAIGN", label: "Marketing campaign" },
  { value: "RETAINER", label: "Retainer" },
  { value: "INTERNAL_OPERATIONS", label: "Internal operations" },
];

export const confidentialityLevels = [
  { value: "STANDARD", label: "Standard" },
  { value: "CONFIDENTIAL", label: "Confidential" },
  { value: "HIGHLY_CONFIDENTIAL", label: "Highly confidential" },
];

export const billingTypes = [
  { value: "NON_BILLABLE", label: "Non-billable" },
  { value: "FIXED_FEE", label: "Fixed fee" },
  { value: "HOURLY", label: "Hourly" },
  { value: "RETAINER", label: "Retainer" },
];

export const deliverableTypes = [
  { value: "GENERAL", label: "General task" },
  { value: "DOCUMENT", label: "Document" },
  { value: "APPROVAL", label: "Approval" },
  { value: "FOLLOW_UP", label: "Follow-up" },
  { value: "MEETING", label: "Meeting" },
  { value: "RESEARCH", label: "Research" },
  { value: "ANALYSIS", label: "Analysis" },
  { value: "DESIGN", label: "Design" },
  { value: "DEVELOPMENT", label: "Development" },
  { value: "TESTING", label: "Testing" },
  { value: "DELIVERY", label: "Delivery" },
  { value: "SUPPORT", label: "Support" },
  { value: "TRAINING", label: "Training" },
  { value: "PROCUREMENT", label: "Procurement" },
  { value: "FINANCE_REVIEW", label: "Finance review" },
  { value: "HR_ACTION", label: "HR action" },
  { value: "COMPLIANCE_CHECK", label: "Compliance check" },
  { value: "SITE_WORK", label: "Site work" },
  { value: "LEGAL_DRAFTING", label: "Legal drafting" },
  { value: "COURT_FILING", label: "Court filing" },
  { value: "HEARING_PREP", label: "Hearing prep" },
  { value: "CLIENT_REVIEW", label: "Client review" },
  { value: "CREATIVE", label: "Creative" },
  { value: "MEDIA_PLAN", label: "Media plan" },
  { value: "CONTENT", label: "Content" },
  { value: "CAMPAIGN_LAUNCH", label: "Campaign launch" },
  { value: "REPORTING", label: "Reporting" },
];

export const approvalStages = [
  { value: "NOT_REQUIRED", label: "Not required" },
  { value: "INTERNAL_REVIEW", label: "Internal review" },
  { value: "CLIENT_REVIEW", label: "Client review" },
  { value: "APPROVED", label: "Approved" },
  { value: "CHANGES_REQUESTED", label: "Changes requested" },
];

export function optionLabel(options, value) {
  return options.find((option) => option.value === value)?.label ?? value?.replaceAll("_", " ") ?? "";
}
