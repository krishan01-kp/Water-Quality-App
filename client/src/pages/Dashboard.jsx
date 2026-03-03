import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, subDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, Maximize2, X, Activity } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';
const TIMES = ['02:00', '06:00', '10:00', '14:00', '18:00', '22:00'];

const SECTIONS = [
    { id: 'rawWater', name: 'Raw Water', params: [{ id: 'turbidity', name: 'Turbidity', unit: 'NTU' }, { id: 'pH', name: 'pH', unit: '' }, { id: 'conductivity', name: 'Conductivity', unit: 'mS/cm' }, { id: 'colour', name: 'Colour', unit: 'Hazen' }] },
    { id: 'sedimentationOutlet', name: 'Sedimentation Out-let', params: [{ id: 'turbidity', name: 'Turbidity', unit: 'NTU' }, { id: 'pH', name: 'pH', unit: '' }] },
    { id: 'filterOutlet', name: 'Filter Out-let', params: [{ id: 'turbidity', name: 'Turbidity', unit: 'NTU' }] },
    { id: 'clearWater', name: 'Clear Water', params: [{ id: 'turbidity', name: 'Turbidity', unit: 'NTU' }, { id: 'pH', name: 'pH', unit: '' }, { id: 'conductivity', name: 'Conductivity', unit: 'mS/cm' }, { id: 'colour', name: 'Colour', unit: 'Hazen' }] },
    { id: 'operationalParameters', name: 'Operational Parameters', params: [{ id: 'intakeFlow', name: 'Intake flow', unit: 'M/h' }, { id: 'pacAlum', name: 'PAC/ALUM', unit: 'Mg/l' }, { id: 'rcl2', name: 'RCL2', unit: 'Mg/l' }, { id: 'preChlorine', name: 'Pre chlorine', unit: 'Kg/h' }, { id: 'postChlorine', name: 'Post chlorine', unit: 'Kg/h' }, { id: 'postLime', name: 'Post lime', unit: 'Sec' }, { id: 'preLime', name: 'Pre lime', unit: 'Sec' }] }
];

const Dashboard = () => {
    const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [chartData, setChartData] = useState({});
    const [loading, setLoading] = useState(false);
    const [expandedChart, setExpandedChart] = useState(null);

    useEffect(() => {
        fetchData();
    }, [startDate, endDate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/records`, {
                params: { startDate, endDate }
            });

            const records = res.data.reverse(); // Ensure chronological order for charts (oldest first)
            const formattedData = {};

            SECTIONS.forEach(section => {
                formattedData[section.id] = {};
                section.params.forEach(param => {
                    const dataPoints = [];
                    records.forEach(record => {
                        const dateStr = format(new Date(record.date), 'MMM dd');
                        TIMES.forEach(time => {
                            const val = record.data?.[section.id]?.[param.id]?.[time];
                            if (val !== undefined && val !== '') {
                                dataPoints.push({
                                    name: `${dateStr} ${time}`,
                                    value: Number(val),
                                    date: record.date,
                                    time
                                });
                            }
                        });
                    });
                    formattedData[section.id][param.id] = dataPoints;
                });
            });

            setChartData(formattedData);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const MetricChart = ({ data, title, unit, isExpanded = false, onExpand }) => {
        if (!data || data.length === 0) {
            return (
                <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center ${isExpanded ? 'h-full' : 'h-80'}`}>
                    <Activity className="w-12 h-12 text-slate-200 mb-4" />
                    <p className="text-slate-400 font-medium">No data available for {title}</p>
                </div>
            );
        }

        return (
            <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative group transition-all duration-300 ${isExpanded ? 'h-full max-h-[80vh]' : 'h-80 hover:shadow-md'}`}>
                {!isExpanded && (
                    <button
                        onClick={onExpand}
                        className="absolute top-4 right-4 p-2 bg-slate-50 hover:bg-slate-100 rounded-md text-slate-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100 z-10"
                        title="Expand Chart"
                    >
                        <Maximize2 className="w-4 h-4" />
                    </button>
                )}

                <div className="mb-6">
                    <h3 className="font-bold text-slate-800 flex items-center">{title}</h3>
                    {unit && <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full mt-1 inline-block">{unit}</span>}
                </div>

                <div className="w-full h-[calc(100%-4rem)]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 10, fill: '#64748b' }}
                                tickMargin={10}
                                axisLine={false}
                                tickLine={false}
                                minTickGap={30}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: '#64748b' }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(val) => val.toFixed(1)}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
                                formatter={(value) => [`${value} ${unit}`, 'Value']}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#2563eb"
                                strokeWidth={3}
                                dot={{ r: 3, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#1d4ed8' }}
                                animationDuration={1500}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto pb-12">
            {/* Header & Date Range Picker */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0">
                    <h2 className="text-2xl font-bold text-slate-800">Analytics Dashboard</h2>
                    <p className="text-slate-500 text-sm mt-1">Visualize water quality trends over time</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="flex items-center bg-blue-50 relative rounded-lg border border-blue-100 p-2 shadow-inner w-full sm:w-auto">
                        <Calendar className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-xs text-slate-500 mr-2 font-medium">From:</span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent font-medium text-slate-800 outline-none cursor-pointer text-sm w-full"
                            max={endDate}
                        />
                    </div>
                    <div className="flex items-center bg-blue-50 relative rounded-lg border border-blue-100 p-2 shadow-inner w-full sm:w-auto">
                        <span className="text-xs text-slate-500 mr-2 ml-1 font-medium">To:</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent font-medium text-slate-800 outline-none cursor-pointer text-sm w-full"
                            min={startDate}
                            max={format(new Date(), 'yyyy-MM-dd')}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="space-y-12">
                    {SECTIONS.map((section) => (
                        <div key={section.id}>
                            <div className="flex items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-800 tracking-tight">{section.name}</h2>
                                <div className="flex-1 h-px bg-slate-200 ml-4"></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {section.params.map(param => (
                                    <MetricChart
                                        key={`${section.id}-${param.id}`}
                                        data={chartData[section.id]?.[param.id]}
                                        title={param.name}
                                        unit={param.unit}
                                        onExpand={() => setExpandedChart({ sectionId: section.id, paramId: param.id, title: `${section.name} - ${param.name}`, unit: param.unit })}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Expanded Chart Modal */}
            {expandedChart && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">{expandedChart.title}</h2>
                                <div className="text-sm text-slate-500 mt-1">
                                    {format(new Date(startDate), 'MMM dd, yyyy')} - {format(new Date(endDate), 'MMM dd, yyyy')}
                                </div>
                            </div>
                            <button
                                onClick={() => setExpandedChart(null)}
                                className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-slate-500 hover:text-slate-800 transition-colors shadow-sm"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 p-6 relative">
                            <MetricChart
                                data={chartData[expandedChart.sectionId]?.[expandedChart.paramId]}
                                title={expandedChart.title.split('-')[1].trim()}
                                unit={expandedChart.unit}
                                isExpanded={true}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
