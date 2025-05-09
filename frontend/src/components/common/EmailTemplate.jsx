import React from "react";
import { Form, Select } from "antd";

const EmailTemplateSelector = () => {
  const templateOptions = [
    // Offer Communications
    { value: "offer1", label: "Standard Offer Letter" },
    { value: "offer2", label: "Executive Offer Package" },
    { value: "offer3", label: "Internship Offer" },
    { value: "offer4", label: "Contract Position Offer" },
    { value: "offer5", label: "Remote Work Offer" },

    // Rejection Communications
    { value: "reject1", label: "Polite Rejection" },
    { value: "reject2", label: "Future Consideration Rejection" },
    { value: "reject3", label: "Skills Mismatch Rejection" },
    { value: "reject4", label: "Culture Fit Rejection" },
    { value: "reject5", label: "Position Filled Notification" },

    // Hiring Process
    { value: "hire1", label: "Full-Time Hire Confirmation" },
    { value: "hire2", label: "Probationary Hire Notice" },
    { value: "hire3", label: "Promotion Announcement" },
    { value: "hire4", label: "Transfer Acceptance" },
    { value: "hire5", label: "Relocation Package Details" },

    // Interview Process
    { value: "scheduleInterview1", label: "Initial Interview Invitation" },
    { value: "scheduleInterview2", label: "Technical Round Invite" },
    { value: "scheduleInterview3", label: "Panel Interview Details" },
    { value: "scheduleInterview4", label: "Final Interview Schedule" },
    { value: "scheduleInterview5", label: "Interview Reschedule Request" },

    // Assessments
    { value: "assessmentAssigned1", label: "Technical Assessment" },
    { value: "assessmentAssigned2", label: "Case Study Assignment" },
    { value: "assessmentAssigned3", label: "Coding Challenge" },
    { value: "assessmentAssigned4", label: "Psychometric Test" },
    { value: "assessmentAssigned5", label: "Presentation Guidelines" },

    // Onboarding
    { value: "onboarding1", label: "First Day Instructions" },
    { value: "onboarding2", label: "Equipment Setup Guide" },
    { value: "onboarding3", label: "Company Policies Overview" },
    { value: "onboarding4", label: "Team Introduction" },
    { value: "onboarding5", label: "Training Schedule" },

    // Follow-ups
    { value: "followup1", label: "Application Received Confirmation" },
    { value: "followup2", label: "Interview Thank You" },
    { value: "followup3", label: "Status Update Request" },
    { value: "followup4", label: "Decision Timeline Notice" },
    { value: "followup5", label: "Feedback Request" },
  ];

  return (
    <Form.Item
      name="emailTemplate"
      label="Email Template"
      rules={[{ required: true, message: "Please select an email template" }]}
    >
      <Select
        showSearch
        placeholder="Search email templates..."
        optionFilterProp="children"
        placement="bottomLeft"
        filterOption={(input, option) =>
          option.children.toLowerCase().includes(input.toLowerCase())
        }
        style={{ width: "100%" }}
      >
        {templateOptions.map((option) => (
          <Select.Option key={option.value} value={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default EmailTemplateSelector;
