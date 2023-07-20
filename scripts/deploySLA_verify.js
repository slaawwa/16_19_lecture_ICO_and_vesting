// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require('hardhat');

async function main() {
  const slaTarget = '0xA21A7100ba6408322b96a8937f278435Ae10fC82';

  console.log(
    `SLA deployed to ${slaTarget}`
  );

  console.log(' - Start verification:25 >'); // eslint-disable-line no-console
  await hre.run('verify:verify', {
    address: slaTarget,
    constructorArguments: [],
    // libraries: { ... },
  });
  console.log(' - END verification:31 >'); // eslint-disable-line no-console

  return slaTarget;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
