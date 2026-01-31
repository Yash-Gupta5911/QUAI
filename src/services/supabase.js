import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const dbRequest = {
  async getLatestBlocks(limit = 10) {
    const { data, error } = await supabase
      .from('blocks')
      .select('*')
      .order('block_number', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data
  },

  async getLatestTransactions(limit = 10) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data
  },

  async saveBlock(blockData) {
    const { error } = await supabase
      .from('blocks')
      .upsert(blockData, { onConflict: 'block_number' })
    if (error) console.error('Error saving block:', error)
  },

  async saveTransaction(txData) {
    const { error } = await supabase
      .from('transactions')
      .upsert(txData, { onConflict: 'tx_hash' })
    if (error) console.error('Error saving transaction:', error)
  }
}
