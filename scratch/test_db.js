const mongoose = require('mongoose');
const Company = require('./server/models/Company');
require('dotenv').config({ path: './server/.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance';

async function test() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');
        
        const testCode = 'TEST' + Date.now().toString().slice(-4);
        const company = new Company({
            companyName: 'Test Company',
            companyCode: testCode,
            password: 'password123'
        });
        
        await company.save();
        console.log('Success: Company created with code', testCode);
        
        await Company.deleteOne({ companyCode: testCode });
        console.log('Cleaned up test company');
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

test();
