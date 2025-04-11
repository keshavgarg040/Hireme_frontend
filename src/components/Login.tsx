import { useNavigate } from "react-router-dom";
import { UserCircle2, Building2 } from "lucide-react"; // Import icons from lucide-react

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-5xl font-extrabold text-gray-800 mb-6 text-center">
        Welcome to <span className="text-indigo-600">JobPortal</span>
      </h1>
      <p className="text-lg text-gray-600 mb-10 text-center">
        Find your dream job or hire top talent easily!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
        {/* Candidate Section */}
        <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-blue-600 hover:shadow-xl transition cursor-pointer"
             onClick={() => navigate("/candidatelogin")}
        >
          <div className="flex flex-col items-center">
            <UserCircle2 className="w-16 h-16 text-blue-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">For Candidates</h2>
            <p className="text-gray-500">Looking for your next opportunity?</p>
          </div>
        </div>

        {/* Recruiter Section */}
        <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-green-600 hover:shadow-xl transition cursor-pointer"
             onClick={() => navigate("/recruiterlogin")}
        >
          <div className="flex flex-col items-center">
            <Building2 className="w-16 h-16 text-green-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">For Recruiters</h2>
            <p className="text-gray-500">Hire top talent for your company.</p>
          </div>
        </div>
      </div>
    </div>
  );
}