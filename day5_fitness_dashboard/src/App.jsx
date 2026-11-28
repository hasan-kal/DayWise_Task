
import { useEffect, useState } from "react";
import "./App.css";

// Reusable component for loading, empty and error messages
function StateMessage({ type, message, action, onAction }) {
  return (
    <div className={`state-message ${type}`}>
      <h3>{message}</h3>
      {action && (
        <button onClick={onAction}>{action}</button>
      )}
    </div>
  );
}

// Reusable component for one workout
function WorkoutCard({ workout, onToggle }) {
  return (
    <div className="workout-card">
      <div>
        <span className="day">{workout.day}</span>
        <h3>{workout.name}</h3>
        <p>{workout.duration} minutes</p>
      </div>

      <button
        className={workout.completed ? "completed" : ""}
        onClick={() => onToggle(workout.id)}
      >
        {workout.completed ? "Completed ✓" : "Mark complete"}
      </button>
    </div>
  );
}

// Reusable component for progress analytics
function ProgressSummary({ workouts }) {
  const completed = workouts.filter(
    (workout) => workout.completed
  ).length;

  const total = workouts.length;

  const percentage = total
    ? Math.round((completed / total) * 100)
    : 0;

  return (
    <div className="progress-card">
      <h2>Weekly Progress</h2>
      <div className="progress-number">
        {completed} / {total}
      </div>
      <p>Workouts completed</p>

      <div className="progress-bar">
        <div style={{ width: `${percentage}%` }} />
      </div>

      <strong>{percentage}% completed</strong>
    </div>
  );
}

function WorkoutDashboard() {
  // Parent component owns the shared workout data and UI states
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Simulate fetching workout data
    const timer = setTimeout(() => {
      setWorkouts([
        {
          id: 1,
          day: "MONDAY",
          name: "Chest & Biceps",
          duration: 60,
          completed: true,
        },
        {
          id: 2,
          day: "TUESDAY",
          name: "Back & Triceps",
          duration: 55,
          completed: true,
        },
        {
          id: 3,
          day: "WEDNESDAY",
          name: "Legs & Shoulders",
          duration: 65,
          completed: false,
        },
        {
          id: 4,
          day: "THURSDAY",
          name: "Cardio & Core",
          duration: 40,
          completed: false,
        },
      ]);

      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  function toggleWorkout(id) {
    setWorkouts((current) =>
      current.map((workout) =>
        workout.id === id
          ? { ...workout, completed: !workout.completed }
          : workout
      )
    );
  }

  function clearWorkouts() {
    setWorkouts([]);
    setError(false);
    setLoading(false);
  }

  function simulateError() {
    setError(true);
    setLoading(false);
  }

  function resetDashboard() {
    setError(false);
    setLoading(true);

    setTimeout(() => {
      setWorkouts([
        {
          id: 1,
          day: "MONDAY",
          name: "Chest & Biceps",
          duration: 60,
          completed: true,
        },
        {
          id: 2,
          day: "TUESDAY",
          name: "Back & Triceps",
          duration: 55,
          completed: true,
        },
        {
          id: 3,
          day: "WEDNESDAY",
          name: "Legs & Shoulders",
          duration: 65,
          completed: false,
        },
        {
          id: 4,
          day: "THURSDAY",
          name: "Cardio & Core",
          duration: 40,
          completed: false,
        },
      ]);
      setLoading(false);
    }, 800);
  }

  return (
    <div className="dashboard">
      <header>
        <div>
          <p className="eyebrow">FITNESS COACH</p>
          <h1>My Workout Plan</h1>
          <p className="subtitle">
            Stay consistent. Track your progress.
          </p>
        </div>

        <div className="header-icon">💪</div>
      </header>

      <div className="demo-controls">
        <button onClick={resetDashboard}>Reset</button>
        <button onClick={clearWorkouts}>Show empty state</button>
        <button onClick={simulateError}>Show error state</button>
      </div>

      {loading ? (
        <StateMessage
          type="loading"
          message="Loading your workout plan..."
        />
      ) : error ? (
        <StateMessage
          type="error"
          message="Something went wrong while loading workouts."
          action="Try again"
          onAction={resetDashboard}
        />
      ) : workouts.length === 0 ? (
        <StateMessage
          type="empty"
          message="No workouts planned yet."
          action="Add plan"
          onAction={resetDashboard}
        />
      ) : (
        <>
          <ProgressSummary workouts={workouts} />

          <section className="workout-section">
            <h2>This Week</h2>

            {workouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onToggle={toggleWorkout}
              />
            ))}
          </section>
        </>
      )}

      <footer>
        Day 5 • React State & Component Design
      </footer>
    </div>
  );
}

export default WorkoutDashboard;
