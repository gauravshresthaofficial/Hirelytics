import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import dayjs from "dayjs";
import {
  Modal,
  Typography,
  Button,
  Space,
  Tag,
  Descriptions,
  Card,
  Flex,
  List,
  Tooltip,
  Grid,
  FloatButton,
  Switch,
} from "antd";
import {
  ClockCircleOutlined,
  CustomerServiceOutlined,
  PlusOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { fetchCandidates } from "../../features/candidate/candidateSlice";
import { fetchInterviews } from "../../features/interview/interviewSlice";
import AssignAssessmentModal from "../Candidates/AssignAssessmentModal";
import ScheduleInterviewModal from "../Candidates/ScheduleInterviewModal";

const { Text } = Typography;
const { useBreakpoint } = Grid;
const localizer = momentLocalizer(moment);

const CalendaComponent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const { data: candidates } = useSelector((state) => state.candidates);
  const { data: interviews } = useSelector((state) => state.interviews);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCandidates());
    dispatch(fetchInterviews());
  }, [dispatch]);

  useEffect(() => {
    if (candidates?.length) {
      const events = [];
      const now = new Date();
      const upcoming = [];

      candidates.forEach((candidate) => {
        candidate.assessments?.forEach((assessment) => {
          if (assessment.scheduledDate) {
            const event = {
              title: `${assessment.assessmentName} - ${candidate.fullName}`,
              start: new Date(assessment.scheduledDate),
              end: new Date(
                new Date(assessment.scheduledDate).getTime() + 30 * 60000
              ),
              type: "assessment",
              data: assessment,
              candidate,
              candidateId: candidate._id,
            };
            events.push(event);

            if (new Date(assessment.scheduledDate) > now) {
              upcoming.push({
                ...event,
                candidate: candidate.fullName,
                date: assessment.scheduledDate,
              });
            }
          }
        });

        candidate.interviews?.forEach((interview) => {
          const duration =
            interviews.find((i) => i._id === interview.interviewId)?.duration ||
            60;

          if (interview.scheduledDatetime) {
            const event = {
              title: `${interview.interviewName} - ${candidate.fullName}`,
              start: new Date(interview.scheduledDatetime),
              end: new Date(
                new Date(interview.scheduledDatetime).getTime() +
                  duration * 60000
              ),
              type: "interview",
              data: interview,
              candidate,
              candidateId: candidate._id,
            };
            events.push(event);

            if (new Date(interview.scheduledDatetime) > now) {
              upcoming.push({
                ...event,
                candidate: candidate.fullName,
                date: interview.scheduledDatetime,
              });
            }
          }
        });
      });

      setCalendarEvents(events);
      setUpcomingEvents(
        upcoming.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 4)
      );
    }
  }, [candidates, interviews, dispatch]);

  const handleEventClick = (candidateId, type) => {
    navigate(`/candidates/${candidateId}`, { state: { type } });
  };

  const handleCandidateClick = () => {
    if (selectedEvent?.candidateId) {
      navigate(`/candidates/${selectedEvent.candidateId}`, {
        state: { type: selectedEvent.type },
      });
    }
  };

  return (
    <Flex
      gap="large"
      wrap
      style={{
        width: "100%",
        flexDirection: screens.xs ? "column" : "row",
      }}
    >
      {/* Calendar */}
      <Card
        style={{
          flex: 1,
          minWidth: 300,
          overflow: "hidden",
          position: "relative",
          body: { padding: screens.xs ? 10 : 20 },
        }}
      >
        <FloatButton.Group
          open={open}
          trigger="hover"
          closeIcon={<CloseOutlined />}
          onClick={() => setOpen((prev) => !prev)}
          style={{ position: "absolute", right: 36, bottom: 36, zIndex: 10 }}
          icon={<PlusOutlined />}
          type="primary"
          placement="left"
        >
          <AssignAssessmentModal />
          <ScheduleInterviewModal />
        </FloatButton.Group>
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ minHeight: 500, width: "100%" }}
          onSelectEvent={(event) => {
            setSelectedEvent(event);
            setEventModalVisible(true);
          }}
          eventPropGetter={(event) => {
            let backgroundColor =
              event.type === "interview" ? "#0858d9" : "#389e0e";
            return {
              style: {
                backgroundColor,
                color: "white",
                borderRadius: "4px",
                border: "none",
                padding: "2px 4px",
              },
            };
          }}
        />
      </Card>

      {/* Upcoming Events */}
      <Card
        title={
          <Space>
            <ClockCircleOutlined />
            <span>Upcoming Events (Next 4)</span>
          </Space>
        }
        style={{
          width: screens.xs ? "100%" : 350,
          // maxHeight: 550,
          overflowY: "auto",
          flexShrink: 0,
        }}
        bodyStyle={{ padding: screens.xs ? 10 : 20 }}
      >
        {upcomingEvents.length > 0 ? (
          <List
            itemLayout="vertical"
            dataSource={upcomingEvents}
            renderItem={(event) => (
              <Tooltip title="View Full Details">
                <List.Item
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    handleEventClick(event.candidateId, event.type)
                  }
                >
                  <List.Item.Meta
                    title={
                      <Flex wrap gap="small">
                        <Tag
                          color={event.type === "interview" ? "blue" : "green"}
                        >
                          {event.type.toUpperCase()}
                        </Tag>
                        <Text ellipsis style={{ maxWidth: 220 }}>
                          {event.title}
                        </Text>
                      </Flex>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <Text
                          type="secondary"
                          ellipsis
                          style={{ maxWidth: 220 }}
                        >
                          Candidate: {event.candidate}
                        </Text>
                        <Text>
                          {dayjs(event.date).format("MMM D, YYYY h:mm A")}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              </Tooltip>
            )}
          />
        ) : (
          <Text type="secondary">No upcoming events found</Text>
        )}
      </Card>

      {/* Event Modal */}
      <Modal
        centered
        open={eventModalVisible}
        onCancel={() => setEventModalVisible(false)}
        footer={null}
        width={screens.xs ? "95%" : 600}
        title={
          selectedEvent && (
            <Space>
              <Tag
                color={selectedEvent.type === "interview" ? "blue" : "green"}
              >
                {selectedEvent.type.toUpperCase()}
              </Tag>
              <Text strong>{selectedEvent.title}</Text>
            </Space>
          )
        }
      >
        {selectedEvent && (
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Card size="small">
              <Descriptions column={1} colon={false}>
                <Descriptions.Item label="Candidate">
                  <Text>{selectedEvent.candidate?.fullName}</Text>
                </Descriptions.Item>

                <Descriptions.Item label="Time">
                  <Space>
                    <Text>
                      {dayjs(selectedEvent.start).format("MMM D, YYYY")}
                    </Text>
                    <Text>
                      {dayjs(selectedEvent.start).format("h:mm A")} -{" "}
                      {dayjs(selectedEvent.end).format("h:mm A")}
                    </Text>
                  </Space>
                </Descriptions.Item>

                {selectedEvent.type === "interview" && (
                  <Descriptions.Item label="Duration">
                    <Text>
                      {dayjs(selectedEvent.end).diff(
                        dayjs(selectedEvent.start),
                        "minute"
                      )}{" "}
                      minutes
                    </Text>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            <Card
              size="small"
              title={
                selectedEvent.type === "interview"
                  ? "Interview Details"
                  : "Assessment Details"
              }
            >
              <Descriptions column={1} colon={false}>
                {selectedEvent.data.evaluatedBy && (
                  <Descriptions.Item label="Evaluator">
                    <Text>{selectedEvent.data.evaluatedBy}</Text>
                  </Descriptions.Item>
                )}

                {selectedEvent.data.status && (
                  <Descriptions.Item label="Status">
                    <Tag
                      color={
                        selectedEvent.data.status === "Completed"
                          ? "green"
                          : selectedEvent.data.status === "Scheduled"
                          ? "blue"
                          : "orange"
                      }
                    >
                      {selectedEvent.data.status}
                    </Tag>
                  </Descriptions.Item>
                )}

                {selectedEvent.data.maxScore && (
                  <Descriptions.Item label="Max Score">
                    <Text>{selectedEvent.data.maxScore}</Text>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            <div style={{ textAlign: "right" }}>
              <Button
                type="primary"
                onClick={handleCandidateClick}
                style={{ minWidth: 120 }}
              >
                View Full Details
              </Button>
            </div>
          </Space>
        )}
      </Modal>
    </Flex>
  );
};

export default CalendaComponent;
