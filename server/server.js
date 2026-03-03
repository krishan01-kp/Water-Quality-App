const express = require('express');
const cors = require('cors');
const xlsx = require('xlsx');
const path = require('path');
const db = require('./db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Serve React build in production
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));


// Routes
// Save or update record for a date
app.post('/api/records', (req, res) => {
    const { date, data, remarks } = req.body;

    if (!date || !data) {
        return res.status(400).json({ error: 'Date and data are required' });
    }

    try {
        const stmt = db.prepare(`
            INSERT INTO records (date, data, remarks) 
            VALUES (?, ?, ?)
            ON CONFLICT(date) DO UPDATE SET 
            data = excluded.data,
            remarks = excluded.remarks
        `);

        stmt.run(date, JSON.stringify(data), remarks || '');
        res.json({ success: true, message: 'Record saved successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get records within date range
app.get('/api/records', (req, res) => {
    const { startDate, endDate } = req.query;
    try {
        let stmt;
        let records;
        if (startDate && endDate) {
            stmt = db.prepare('SELECT * FROM records WHERE date >= ? AND date <= ? ORDER BY date DESC');
            records = stmt.all(startDate, endDate);
        } else {
            stmt = db.prepare('SELECT * FROM records ORDER BY date DESC');
            records = stmt.all();
        }

        const formattedRecords = records.map(r => ({
            ...r,
            data: JSON.parse(r.data)
        }));

        res.json(formattedRecords);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single record by date
app.get('/api/records/:date', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM records WHERE date = ?');
        const record = stmt.get(req.params.date);

        if (record) {
            res.json({
                ...record,
                data: JSON.parse(record.data)
            });
        } else {
            res.status(404).json({ error: 'Record not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Export Excel
app.get('/api/export/excel', (req, res) => {
    const { startDate, endDate } = req.query;

    try {
        let stmt;
        let records;
        if (startDate && endDate) {
            stmt = db.prepare('SELECT * FROM records WHERE date >= ? AND date <= ? ORDER BY date ASC');
            records = stmt.all(startDate, endDate);
        } else {
            stmt = db.prepare('SELECT * FROM records ORDER BY date ASC');
            records = stmt.all();
        }

        const excelData = [];
        const times = ['02:00', '06:00', '10:00', '14:00', '18:00', '22:00'];

        const sections = [
            { id: 'rawWater', name: 'Raw Water', params: [{ id: 'turbidity', name: 'turbidity', unit: 'NTU' }, { id: 'pH', name: 'pH', unit: '' }, { id: 'conductivity', name: 'conductivity', unit: 'mS/cm' }, { id: 'colour', name: 'colour', unit: 'Hazen' }] },
            { id: 'sedimentationOutlet', name: 'Sedimentation Out-let', params: [{ id: 'turbidity', name: 'turbidity', unit: 'NTU' }, { id: 'pH', name: 'pH', unit: '' }] },
            { id: 'filterOutlet', name: 'Filter Out-let', params: [{ id: 'turbidity', name: 'turbidity', unit: 'NTU' }] },
            { id: 'clearWater', name: 'Clear Water', params: [{ id: 'turbidity', name: 'turbidity', unit: 'NTU' }, { id: 'pH', name: 'pH', unit: '' }, { id: 'conductivity', name: 'conductivity', unit: 'mS/cm' }, { id: 'colour', name: 'colour', unit: 'Hazen' }] },
            { id: 'operationalParameters', name: 'Operational Parameters', params: [{ id: 'intakeFlow', name: 'Intake flow', unit: 'M/h' }, { id: 'pacAlum', name: 'PAC/ALUM', unit: 'Mg/l' }, { id: 'rcl2', name: 'RCL2', unit: 'Mg/l' }, { id: 'preChlorine', name: 'Pre chlorine', unit: 'Kg/h' }, { id: 'postChlorine', name: 'Post chlorine', unit: 'Kg/h' }, { id: 'postLime', name: 'Post lime', unit: 'Sec' }, { id: 'preLime', name: 'Pre lime', unit: 'Sec' }] }
        ];

        records.forEach(record => {
            const parsedData = JSON.parse(record.data);
            sections.forEach(section => {
                section.params.forEach(param => {
                    const row = {
                        'Date': record.date,
                        'Section': section.name,
                        'Parameter': param.name,
                        'Unit': param.unit,
                    };
                    times.forEach(time => {
                        row[time] = parsedData[section.id]?.[param.id]?.[time] ?? '';
                    });
                    row['Remarks'] = record.remarks;
                    excelData.push(row);
                });
            });
        });

        const ws = xlsx.utils.json_to_sheet(excelData);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, "Water Quality Data");

        // Auto column widths
        const colWidths = [
            { wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 10 },
            { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 },
            { wch: 30 }
        ];
        ws['!cols'] = colWidths;

        const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename="Water_Quality_Data.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buf);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Catch-all: serve React app for any non-API route
app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
