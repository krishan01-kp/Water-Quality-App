import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Calendar, Save, CheckCircle2, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const TIMES = ['02:00', '06:00', '10:00', '14:00', '18:00', '22:00'];

const SECTIONS = [
    { id: 'rawWater', name: 'Raw Water', params: [{ id: 'turbidity', name: 'Turbidity', unit: 'NTU' }, { id: 'pH', name: 'pH', unit: '' }, { id: 'conductivity', name: 'Conductivity', unit: 'mS/cm' }, { id: 'colour', name: 'Colour', unit: 'Hazen' }] },
    { id: 'sedimentationOutlet', name: 'Sedimentation Out-let', params: [{ id: 'turbidity', name: 'Turbidity', unit: 'NTU' }, { id: 'pH', name: 'pH', unit: '' }] },
    { id: 'filterOutlet', name: 'Filter Out-let', params: [{ id: 'turbidity', name: 'Turbidity', unit: 'NTU' }] },
    { id: 'clearWater', name: 'Clear Water', params: [{ id: 'turbidity', name: 'Turbidity', unit: 'NTU' }, { id: 'pH', name: 'pH', unit: '' }, { id: 'conductivity', name: 'Conductivity', unit: 'mS/cm' }, { id: 'colour', name: 'Colour', unit: 'Hazen' }] },
    { id: 'operationalParameters', name: 'Operational Parameters', params: [{ id: 'intakeFlow', name: 'Intake flow', unit: 'M/h' }, { id: 'pacAlum', name: 'PAC/ALUM', unit: 'Mg/l' }, { id: 'rcl2', name: 'RCL2', unit: 'Mg/l' }, { id: 'preChlorine', name: 'Pre chlorine', unit: 'Kg/h' }, { id: 'postChlorine', name: 'Post chlorine', unit: 'Kg/h' }, { id: 'postLime', name: 'Post lime', unit: 'Sec' }, { id: 'preLime', name: 'Pre lime', unit: 'Sec' }] }
];

const initialDataState = () => {
    const data = {};
    SECTIONS.forEach(section => {
        data[section.id] = {};
        section.params.forEach(param => {
            data[section.id][param.id] = {};
            TIMES.forEach(time => {
                data[section.id][param.id][time] = '';
            });
        });
    });
    return data;
};

const DataEntry = () => {
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [data, setData] = useState(initialDataState());
    const [remarks, setRemarks] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchData(date);
    }, [date]);

    const fetchData = async (selectedDate) => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/records/${selectedDate}`);
            if (res.data) {
                // Merge fetched data with initial structure in case of missing fields
                const fetchedData = res.data.data;
                const mergedData = initialDataState();

                SECTIONS.forEach(section => {
                    section.params.forEach(param => {
                        TIMES.forEach(time => {
                            if (fetchedData[section.id] && fetchedData[section.id][param.id] && fetchedData[section.id][param.id][time] !== undefined) {
                                mergedData[section.id][param.id][time] = fetchedData[section.id][param.id][time];
                            }
                        });
                    });
                });

                setData(mergedData);
                setRemarks(res.data.remarks || '');
            }
        } catch (err) {
            if (err.response && err.response.status === 404) {
                // No record exists, reset to empty
                setData(initialDataState());
                setRemarks('');
            } else {
                showToast('Error loading data', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (sectionId, paramId, time, value) => {
        // Basic validation for non-negative numbers
        if (value !== '' && (isNaN(value) || Number(value) < 0)) return;

        setData(prev => ({
            ...prev,
            [sectionId]: {
                ...prev[sectionId],
                [paramId]: {
                    ...prev[sectionId][paramId],
                    [time]: value
                }
            }
        }));
    };

    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await axios.post(`${API_URL}/records`, {
                date,
                data,
                remarks
            });
            showToast('Record saved successfully', 'success');
        } catch (err) {
            showToast('Error saving record', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            {/* Header & Date Picker */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 flex flex-col md:flex-row items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Daily Data Entry</h2>
                    <p className="text-slate-500 text-sm mt-1">Record water quality parameters for the day</p>
                </div>

                <div className="mt-4 md:mt-0 flex items-center bg-blue-50 relative rounded-lg border border-blue-100 p-2 shadow-inner">
                    <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="bg-transparent font-medium text-slate-800 outline-none cursor-pointer"
                        max={format(new Date(), 'yyyy-MM-dd')}
                    />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {SECTIONS.map((section) => (
                    <div key={section.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-md">
                        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                            <h3 className="text-lg font-bold text-slate-800">{section.name}</h3>
                        </div>
                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider">
                                        <th className="p-4 font-semibold w-1/4">Parameter</th>
                                        {TIMES.map(time => (
                                            <th key={time} className="p-4 font-semibold text-center w-[12.5%]">{time}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {section.params.map(param => (
                                        <tr key={param.id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="p-4">
                                                <div className="font-medium text-slate-800">{param.name}</div>
                                                {param.unit && <div className="text-xs text-slate-500">({param.unit})</div>}
                                            </td>
                                            {TIMES.map(time => (
                                                <td key={time} className="p-2">
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        min="0"
                                                        value={data[section.id][param.id][time]}
                                                        onChange={(e) => handleInputChange(section.id, param.id, time, e.target.value)}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                                                        placeholder="-"
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}

                {/* Remarks Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                        <h3 className="text-lg font-bold text-slate-800">Remarks</h3>
                    </div>
                    <div className="p-6">
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all min-h-[100px]"
                            placeholder="Enter any observational remarks for this date..."
                        ></textarea>
                    </div>
                </div>

                {/* Submit */}
                <div className="sticky bottom-4 z-40 bg-white/80 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-lg flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <Save className="w-5 h-5 mr-2" />
                        )}
                        {loading ? 'Saving...' : 'Save Record'}
                    </button>
                </div>
            </form>

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-24 right-4 flex items-center p-4 rounded-lg shadow-xl text-white transform transition-all duration-300 ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-3" /> : <AlertCircle className="w-5 h-5 mr-3" />}
                    <span className="font-medium">{toast.message}</span>
                </div>
            )}
        </div>
    );
};

export default DataEntry;
