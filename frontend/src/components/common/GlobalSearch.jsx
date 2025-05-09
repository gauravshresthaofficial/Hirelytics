import React, { useState, useMemo, useEffect } from "react";
import { AutoComplete, Input } from "antd";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { SearchOutlined } from "@ant-design/icons";

const GlobalSearch = () => {
  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const debounce = setTimeout(() => {
      setQuery(inputValue);
    }, 200);
    return () => {
      clearTimeout(debounce);
    };
  }, [inputValue]);

  // Fetching data from Redux
  const candidates = useSelector((state) => state.candidates.data || []);
  const interviews = useSelector((state) => state.interviews.data || []);
  const assessments = useSelector((state) => state.assessments.data || []);
  const positions = useSelector((state) => state.positions.data || []);
  const users = useSelector((state) => state.users.data || []);
  const evaluators = users.filter(
    (user) => user.role.toLowerCase() == "evaluator"
  );

  const filteredOptions = useMemo(() => {
    if (!query) return [];

    const lowerQuery = query.toLowerCase();

    const filterList = (list, labelKey, type) =>
      list
        .filter((item) => item[labelKey]?.toLowerCase().includes(lowerQuery))
        .map((item) => ({
          value: `${type}-${item._id}`,
          label: (
            <div>
              <strong>{item[labelKey]}</strong>
              <div style={{ fontSize: 12, color: "#888" }}>{type}</div>
            </div>
          ),
        }));

    const groupedOptions = [];

    const candidateMatches = filterList(candidates, "fullName", "candidate");
    const interviewMatches = filterList(
      interviews,
      "interviewName",
      "interview"
    );
    const assessmentMatches = filterList(
      assessments,
      "assessmentName",
      "assessment"
    );
    const positionMatches = filterList(positions, "positionName", "position");
    const evaluatorMatches = filterList(evaluators, "fullName", "evaluator");

    if (candidateMatches.length)
      groupedOptions.push({ label: "Candidates", options: candidateMatches });

    if (interviewMatches.length)
      groupedOptions.push({ label: "Interviews", options: interviewMatches });

    if (assessmentMatches.length)
      groupedOptions.push({ label: "Assessments", options: assessmentMatches });

    if (positionMatches.length)
      groupedOptions.push({ label: "Positions", options: positionMatches });
    if (evaluatorMatches.length)
      groupedOptions.push({ label: "Evaluators", options: evaluatorMatches });

    return groupedOptions;
  }, [query, candidates, interviews, assessments, positions, evaluators]);

  const handleSelect = (value) => {
    const [type, id] = value.split("-");
    const pathMap = {
      candidate: "/candidates/",
      interview: "/interviews/",
      assessment: "/assessments/",
      position: "/positions/",
      evaluator: "/evaluators/",
    };
    navigate(`${pathMap[type]}${id}`);
    setQuery("");
  };

  return (
    <div style={{ width: "100%", maxWidth: 500, margin: "1rem auto" }}>
      <AutoComplete
        options={filteredOptions}
        onSelect={handleSelect}
        onSearch={setInputValue}
        value={inputValue}
        style={{ width: "100%" }}
      >
        <Input
          size="large"
          placeholder="Search candidates, interviews, assessments, positions..."
          prefix={<SearchOutlined />}
          allowClear
        />
      </AutoComplete>
    </div>
  );
};

export default GlobalSearch;
