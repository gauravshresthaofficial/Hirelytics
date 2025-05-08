import React from "react";
import InterviewCard from "./InterviewCard";

const InterviewList = ({ interviews, onEdit, onDelete }) => {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "flex-start", // Ensures the cards align to the left
        gap: "16px",
        padding: "16px",
        overflowY: "auto",
        height: "100%",
        maxHeight: "calc(100vh - 180px)", // Adjust height based on surrounding content
      }}
    >
      {interviews.map((interview) => (
        <div
          key={interview._id}
          style={{
            flex: "1 1 calc(33.33% - 16px)", // Makes the cards responsive
            maxWidth: "calc(33.33% - 16px)",
            boxSizing: "border-box",
            minWidth: "250px", // Ensures each card has a minimum width
          }}
        >
          <InterviewCard
            interview={interview}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
};

export default InterviewList;
