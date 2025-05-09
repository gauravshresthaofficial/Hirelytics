import React from "react";
import { Select } from "antd";

const { Option } = Select;

const FilterOptions = ({
  filterMode,
  setFilterMode,
  filterDuration,
  setFilterDuration,
}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
        gap: "16px",
      }}
    >
      <Select
        value={filterMode}
        onChange={setFilterMode}
        style={{ width: 200 }}
        placeholder="Filter by mode"
        allowClear
      >
        {/* <Option value="All">All Modes</Option> */}
        <Option value="Online">Online</Option>
        <Option value="Offline">Offline</Option>
      </Select>
      <Select
        value={filterDuration}
        onChange={setFilterDuration}
        style={{ width: 200 }}
        allowClear
        placeholder="Filter by duration"
      >
        {/* <Option value="All">All Durations</Option> */}
        <Option value="<30">Less than 30 mins</Option>
        <Option value="30-60">30 mins to 1 hour</Option>
        <Option value=">60">More than 1 hour</Option>
      </Select>
    </div>
  );
};

export default FilterOptions;
