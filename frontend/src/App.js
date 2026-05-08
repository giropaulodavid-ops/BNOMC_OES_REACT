import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import StudentDashboard from './studentDashboard';
import EnrollTo from './EnrollTo';
import Enrollment from './Enrollment';
import Documents from './Documents';
import Payment from './Payment';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import AdminStudentProfile from './AdminStudentProfile';
import EditProfile from './editProfile';
import AdminVerify from './AdminVerify';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/enroll-to" element={<EnrollTo />} />
        <Route path="/enrollment" element={<Enrollment />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/student/:id" element={<AdminStudentProfile />} />
        <Route path="/admin/verify/:id" element={<AdminVerify />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;