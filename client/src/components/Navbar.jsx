import { Link, useLocation } from 'react-router-dom';
import { Droplets, LayoutDashboard, FileSpreadsheet, Activity } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-600 hover:text-white';
    };

    return (
        <nav className="bg-blue-800 text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center py-4">
                    <div className="flex items-center space-x-3 mb-4 md:mb-0">
                        <div className="bg-white p-2 rounded-full">
                            <Droplets className="h-6 w-6 text-blue-800" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Water Treatment Plant Asupini Ella</h1>
                            <p className="text-xs text-blue-200 uppercase tracking-widest font-semibold">Water Quality Data System</p>
                        </div>
                    </div>

                    <div className="flex space-x-1 sm:space-x-2">
                        <Link
                            to="/"
                            className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/')}`}
                        >
                            <Activity className="h-4 w-4" />
                            <span>Data Entry</span>
                        </Link>
                        <Link
                            to="/dashboard"
                            className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/dashboard')}`}
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            <span>Dashboard</span>
                        </Link>
                        <Link
                            to="/export"
                            className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/export')}`}
                        >
                            <FileSpreadsheet className="h-4 w-4" />
                            <span>Export Excel</span>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
