import React, { useState } from 'react';
import { format, subDays } from 'date-fns';
import { FileDown, Calendar, Database, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const ExportExcel = () => {
    const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const handleDownload = async () => {
        try {
            setLoading(true);

            const response = await axios.get(`${API_URL}/export/excel`, {
                params: { startDate, endDate },
                responseType: 'blob', // Important for downloading files
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Water_Quality_Data_${startDate}_to_${endDate}.xlsx`);

            // Append to html link element page
            document.body.appendChild(link);

            // Start download
            link.click();

            // Clean up and remove the link
            link.parentNode.removeChild(link);
            showToast('Download started successfully');
        } catch (error) {
            console.error('Error downloading the file', error);
            alert('Error downloading Excel file. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-12 mt-8">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">

                {/* Banner */}
                <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 text-white relative overflow-hidden">
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="bg-white/20 p-4 rounded-full mb-4 ring-4 ring-white/10 backdrop-blur-sm">
                            <FileDown className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-extrabold tracking-tight mb-2">Export Data Reports</h2>
                        <p className="text-blue-100 max-w-lg mx-auto">
                            Download comprehensive water quality parameter records as an Excel spreadsheet for easy sharing and analysis.
                        </p>
                    </div>

                    {/* Decorative shapes */}
                    <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl mix-blend-overlay pointer-events-none"></div>
                    <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-white/5 rounded-full blur-2xl mix-blend-overlay pointer-events-none"></div>
                </div>

                {/* Content */}
                <div className="p-8 md:p-12">
                    <div className="max-w-xl mx-auto space-y-8">

                        {/* Date Pickers */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                                <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                                Select Date Range
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-600 px-1">Start Date</label>
                                    <div className="relative rounded-lg bg-white border border-slate-300 shadow-sm overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full pl-4 pr-10 py-3 bg-transparent text-slate-800 font-medium outline-none"
                                            max={endDate}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-600 px-1">End Date</label>
                                    <div className="relative rounded-lg bg-white border border-slate-300 shadow-sm overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full pl-4 pr-10 py-3 bg-transparent text-slate-800 font-medium outline-none"
                                            min={startDate}
                                            max={format(new Date(), 'yyyy-MM-dd')}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Features list */}
                        <div className="px-4 py-2 space-y-3">
                            <div className="flex items-start">
                                <Database className="w-5 h-5 text-indigo-500 mt-0.5 mr-3 flex-shrink-0" />
                                <p className="text-sm text-slate-600 leading-relaxed">Includes all parameter data from Raw Water, Filter Out-let, Clear Water, and Operational indices.</p>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 mr-3 flex-shrink-0" />
                                <p className="text-sm text-slate-600 leading-relaxed">Automatically formatted with bold headers, proper column widths, and remarks for seamless printing.</p>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="pt-4 border-t border-slate-100 flex justify-center">
                            <button
                                onClick={handleDownload}
                                disabled={loading}
                                className="group relative inline-flex items-center justify-center px-10 py-4 font-bold text-white transition-all duration-200 bg-blue-600 font-pj rounded-xl shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed w-full sm:w-auto overflow-hidden"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generating Excel...
                                    </>
                                ) : (
                                    <>
                                        <FileDown className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                                        Download Excel Report
                                    </>
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            {toast && (
                <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 flex items-center p-4 bg-slate-800 text-white rounded-lg shadow-xl animate-in slide-in-from-bottom-5 duration-300">
                    <CheckCircle2 className="w-5 h-5 mr-3 text-emerald-400" />
                    <span className="font-medium mr-4">{toast}</span>
                </div>
            )}
        </div>
    );
};

export default ExportExcel;
