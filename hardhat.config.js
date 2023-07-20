require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

console.log(' - SEPOLIA_ETHERSCAN_API_KEY:4 >', `${process.env.SEPOLIA_ETHERSCAN_API_KEY}`); // eslint-disable-line no-console

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.18',
  etherscan: {
    apiKey: {
      // process.env.ETHERSCAN_API_KEY,
      sepolia: `${process.env.SEPOLIA_ETHERSCAN_API_KEY}`,
    },
  },
  networks: {
    // hardhat: {
    //   forking: {
    //     url: process.env.FORKING_RPC_URL,
    //     blockNumber: 3649985,
    //   },
    // },
    localhost: {
      url: 'http://127.0.0.1:8545/',
    },
    sepolia: {
      url: `${process.env.SEPOLIA_RPC_URL}${process.env.SEPOLIA_SECRET_KEY}`,
      accounts: [process.env.SEPOLIA_PRIVATE_KEY],
    },
  },
};
