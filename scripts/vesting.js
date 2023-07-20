const { ethers } = require('hardhat');

const DECIMAL = 12;
const DECIAML_MULT = 10 ** DECIMAL;
const TOTAL_SUPPLY = 1_400_000;

async function main() {

  const [beneficiaryAddress] = await ethers.getSigners();
  const startTimestamp = Math.round(Date.now() / 1000);
  const blockingTime = 7 * 30 * 24 * 60 * 60; // 7 months

  const sla = await ethers.deployContract('SLAVesting', [beneficiaryAddress, startTimestamp, blockingTime]);

  
  const vestingAmount = BigInt(TOTAL_SUPPLY * DECIAML_MULT * 0.07); // 7%
  await sla.mint(sla.target, vestingAmount);

  await sla.waitForDeployment();
  
  console.log(' - beneficiaryAddress>', beneficiaryAddress.address);
  console.log(' - vestingAmount: 7% >', vestingAmount);
  
  console.log(`SLA deployed to ${sla.target}`);

  const time = {
    oneMonth: 1 * 30 * 24 * 60 * 60,
    sixMonth: 6 * 30 * 24 * 60 * 60,
    sevenMonth: 7 * 30 * 24 * 60 * 60,
  };
  const result = {
    oneMonth: await sla['vestedAmount(address,uint64)'](sla.target, startTimestamp + time.oneMonth),
    sixMonth: await sla['vestedAmount(address,uint64)'](sla.target, startTimestamp + time.sixMonth),
    sevenMonth: await sla['vestedAmount(address,uint64)'](sla.target, startTimestamp + time.sevenMonth),
  };

  console.log(' - result:oneMonth >', result.oneMonth);
  console.log(' - result:sixMonth >', result.sixMonth);
  console.log(' - result:sevenMonth >', result.sevenMonth);

  return sla.target;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
