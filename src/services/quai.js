import { quais } from 'quais'

const QUAI_RPC_URL = import.meta.env.VITE_QUAI_RPC_URL

// Connect to a remote node
export const provider = new quais.JsonRpcProvider(QUAI_RPC_URL, undefined, {
    usePathing: true
})

export const quaiService = {
    async getBlockNumber() {
        return await provider.getBlockNumber()
    },

    async getBlock(blockHashOrNumber) {
        return await provider.getBlock(blockHashOrNumber, true)
    },

    async getBalance(address) {
        const balance = await provider.getBalance(address)
        return quais.formatEther(balance)
    },

    async getTransaction(hash) {
        return await provider.getTransaction(hash)
    },

    async getGasPrice() {
        const feeData = await provider.getFeeData()
        return feeData.gasPrice ? quais.formatUnits(feeData.gasPrice, 'gwei') : '0'
    }
}
