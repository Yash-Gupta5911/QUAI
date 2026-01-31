// Test Supabase Connection
// Run this to verify your Supabase setup

import { supabase } from './src/services/supabaseClient.js';

async function testSupabaseConnection() {
    console.log('🔍 Testing Supabase Connection...');
    console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('Key (first 20 chars):', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...');

    try {
        // Test 1: Check if tables exist
        console.log('\n📋 Test 1: Checking if tables exist...');
        const { data: blocksTest, error: blocksError } = await supabase
            .from('blocks')
            .select('*')
            .limit(1);

        if (blocksError) {
            console.error('❌ Blocks table error:', blocksError.message);
            console.log('👉 You need to run SUPABASE_SETUP.sql in your Supabase SQL Editor!');
        } else {
            console.log('✅ Blocks table exists!');
        }

        // Test 2: Try to insert a test block
        console.log('\n📋 Test 2: Testing insert permissions...');
        const testBlock = {
            number: 999999,
            hash: '0xTEST',
            miner: '0xTEST',
            timestamp: Date.now(),
            tx_count: 0
        };

        const { data: insertData, error: insertError } = await supabase
            .from('blocks')
            .upsert([testBlock], { onConflict: 'number' });

        if (insertError) {
            console.error('❌ Insert error:', insertError.message);
            console.log('👉 Check your RLS policies in Supabase!');
        } else {
            console.log('✅ Insert works! Supabase is ready!');
        }

    } catch (err) {
        console.error('❌ Connection failed:', err.message);
    }
}

testSupabaseConnection();
