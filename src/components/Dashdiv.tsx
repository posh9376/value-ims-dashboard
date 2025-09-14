import { useNavigate } from "react-router-dom"
import { useState } from "react"

interface DashdivProps {
    heading: string
    text: string
    footer: string
    color: string
    route: string
}

function Dashdiv({ heading, text, footer, color, route }: DashdivProps) {
  const navigate = useNavigate();
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => {
      setClicked(false);
      navigate(route);
    }, 200); // wait for animation before navigating
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-lg shadow p-6 cursor-pointer transition transform 
        hover:shadow-md ${clicked ? "scale-95 bg-gray-100" : ""}`}
    >
      <h3 className="text-sm font-medium text-gray-500">{heading}</h3>
      <p className={`text-2xl font-bold ${color} mt-2`}>{text}</p>
      <p className={`text-xs ${color} mt-1`}>{footer}</p>
    </div>
  );
}

export default Dashdiv