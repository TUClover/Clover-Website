import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import "react-datepicker/dist/react-datepicker.css";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

/**
 * AdminDashboard component
 * This component is responsible for rendering the admin dashboard.
 * It includes a sidebar for selecting users and a details panel for displaying user information.
 * It also includes a data download section for downloading user data.
 * @returns {JSX.Element} The AdminDashboard component.
 */
export const AdminDashboard = () => {
  return <div>{/* User Section */}</div>;
};

export default AdminDashboard;
