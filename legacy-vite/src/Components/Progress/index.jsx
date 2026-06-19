import "./index.css";

const Progress = ({ value }) => {
  return (
    <div className="progress">
      <div className="progress__label">
        <span>{value}%</span>
      </div>

      <div className="progress__bar">
        <div
          className="progress__fill"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

export default Progress;
