import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Users, Phone, Trophy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate    = useNavigate();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signup(email, password, name);
      navigate('/select-role');
    } catch (err) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 grid grid-cols-1 md:grid-cols-2">
      {/* Left branding + features */}
      <div className="hidden md:flex flex-col justify-center px-16">
        <div className="flex items-center mb-8">
          <Trophy className="w-10 h-10 text-purple-500" />
          <h1 className="text-4xl font-bold text-white ml-3">
            Huddle<span className="text-purple-500">Up</span>
          </h1>
        </div>
        <h2 className="text-3xl font-semibold text-white mb-4">Create Your Account</h2>
        <p className="text-gray-400 mb-8">
          Join your coach and teammates—get real-time updates on matches,
          training, and team activities.
        </p>

        <div className="space-y-4">
          <div className="flex items-center p-4 border border-gray-700 rounded-lg hover:border-purple-500 transition">
            <Users className="w-6 h-6 text-purple-500 mr-3" />
            <span className="text-gray-200">Connect with Team</span>
          </div>
          <div className="flex items-center p-4 border border-gray-700 rounded-lg hover:border-purple-500 transition">
            <Phone className="w-6 h-6 text-purple-500 mr-3" />
            <span className="text-gray-200">Stay Updated</span>
          </div>
          <div className="flex items-center p-4 border border-gray-700 rounded-lg hover:border-purple-500 transition">
            <Trophy className="w-6 h-6 text-purple-500 mr-3" />
            <span className="text-gray-200">Track Performance</span>
          </div>
        </div>
      </div>

      {/* Right form card */}
      <div className="flex flex-col justify-center p-8">
        <div className="bg-gray-800 bg-opacity-80 backdrop-blur-md p-8 rounded-2xl shadow-lg max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Sign Up</h2>
          <p className="text-gray-400 mb-6 text-center">
            Create your HuddleUp account to get started
          </p>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full p-3 pl-10 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full p-3 pl-10 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full p-3 pl-10 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-transform hover:scale-105"
            >
              {loading ? 'Creating…' : 'Sign Up'}
            </button>
          </form>

          <p className="text-gray-400 text-sm text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}