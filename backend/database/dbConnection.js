import mongoose from "mongoose";
import dns from 'dns';

// ⭐ Kiểm tra DNS trước khi kết nối
async function checkDNS() {
    return new Promise((resolve) => {
        dns.lookup('cluster0.tz8r5dl.mongodb.net', (err, address, family) => {
            if (err) {
                console.error('❌ DNS lookup failed:', err.message);
                console.log('🔧 Trying to set DNS servers...');

                // Thiết lập DNS servers thủ công
                dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);
                resolve(false);
            } else {
                console.log('✅ DNS lookup successful:', address, `(IPv${family})`);
                resolve(true);
            }
        });
    });
}

export const dbConnection = async () => {
    console.log("🔍 Checking DNS resolution...");
    await checkDNS();

    console.log("👉 MONGO_URI:", process.env.MONGO_URI?.replace(/\/\/.*:.*@/, '//***:***@'));

    const connectionOptions = {
        dbName: "hospitalDB",

        // ⭐ Network và DNS options
        family: 4,                       // Force IPv4
        serverSelectionTimeoutMS: 30000, // 30 seconds
        socketTimeoutMS: 45000,          // 45 seconds  
        connectTimeoutMS: 30000,         // 30 seconds

        // ⭐ Connection pool options
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,

        // ⭐ Retry options
        retryWrites: true,
        retryReads: true,

        // ⭐ Heartbeat
        heartbeatFrequencyMS: 10000,

        // ⭐ Buffer options
        bufferCommands: false,
        bufferMaxEntries: 0,

        // ⭐ Authentication
        authSource: 'admin',

        // ⭐ SSL/TLS
        tls: true,
        tlsAllowInvalidCertificates: false,
        tlsAllowInvalidHostnames: false,
    };

    try {
        console.log("🔄 Attempting MongoDB connection...");

        await mongoose.connect(process.env.MONGO_URI, connectionOptions);

        console.log("✅ Connected to database successfully");

        // Test the connection
        await mongoose.connection.db.admin().ping();
        console.log("🏓 Database ping successful");

    } catch (err) {
        console.error(`❌ Database connection error: ${err.message}`);

        // Log thêm thông tin debug
        if (err.name === 'MongooseServerSelectionError') {
            console.error('🔍 Server Selection Error Details:');
            console.error('- Check if your IP is whitelisted');
            console.error('- Check if credentials are correct');
            console.error('- Check DNS resolution');
            console.error('- Check firewall settings');
        }

        throw err;
    }
}