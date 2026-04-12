import { useState } from "react";

const questions = [
  { key: "burglar_alarms",                   label: "How many burglar alarms are installed in your home?" },
  { key: "exterior_security_cameras",        label: "How many exterior security cameras does your home have?" },
  { key: "smoke_detectors",                  label: "How many working smoke detectors are installed in your home?" },
  { key: "monitored_fire_alarm_systems",     label: "How many monitored fire alarm systems does your home have?" },
  { key: "water_leak_detectors",             label: "How many water leak detectors are installed in your home?" },
  { key: "smart_water_shutoff_valves",       label: "How many smart water shutoff valves does your home have?" },
  { key: "fire_extinguishers",               label: "How many fire extinguishers are accessible in your home?" },
  { key: "storm_shutters_or_impact_windows", label: "How many windows or openings have storm shutters or impact-resistant glass?" },
  { key: "backup_generators",                label: "How many backup generators does your home have?" },
];

export default function QuizPage() {
  const [answers, setAnswers] = useState<Record<string, number>>(
    Object.fromEntries(questions.map(q => [q.key, 0]))
  );
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState("");

  const handleChange = (key: string, value: string) => {
    const num = parseInt(value) || 0;
    setAnswers(prev => ({ ...prev, [key]: Math.max(0, num) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/quiz", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(answers),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Could not connect to server.");
    }
  };

  if (submitted) {
    return (
      <div>
        <h2>Thank you!</h2>
        <p>Your answers have been saved.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Protection &amp; Prevention</h2>
      <p>Optional — answer what you can. Enter 0 if you don't have it.</p>

      {questions.map(q => (
        <div key={q.key}>
          <label>{q.label}</label>
          <input
            type="number"
            min="0"
            value={answers[q.key]}
            onChange={e => handleChange(q.key, e.target.value)}
          />
        </div>
      ))}

      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit">Submit</button>
    </form>
  );
}
