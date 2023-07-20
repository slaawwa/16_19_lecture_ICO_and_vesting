const { loadFixture } = require('@nomicfoundation/hardhat-toolbox/network-helpers');
const { expect } = require('chai');

const NAME = 'SLA Token';
const SYMBOL = 'SLA';
const DECIMAL = 12;
const DECIAML_MULT = 10 ** DECIMAL;
const TOTAL_SUPPLY_HUMAN = 0 && 1_400_000;
const INIT_TOTAL_SUPPLY = TOTAL_SUPPLY_HUMAN;
const INIT_TOTAL_SUPPLY_HUMAN = INIT_TOTAL_SUPPLY && `${TOTAL_SUPPLY_HUMAN.toLocaleString()} x 10e${DECIMAL}`;

describe('SLA Contract', () => {
  describe('Tests. Lecture #16', () => {
    const deploySLA = async () => {
      const [owner] = await hre.ethers.getSigners();
  
      const sla = await hre.ethers.deployContract('SLA');
  
      await sla.waitForDeployment();
  
      // console.log(` - SLA deployed to ${sla.target}`);
  
      return { sla, owner };
    }
    it(`Should be correct name: "${NAME}"`, async function () {
      const { sla } = await loadFixture(deploySLA);

      expect(await sla.name()).to.equal(NAME);
    });

    it(`Should be correct symbol: "${SYMBOL}"`, async function () {
      const { sla } = await loadFixture(deploySLA);

      expect(await sla.symbol()).to.equal(SYMBOL);
    });

    it(`Should be correct decimals: ${DECIMAL}`, async function () {
      const { sla } = await loadFixture(deploySLA);

      expect(await sla.decimals()).to.equal(DECIMAL);
    });

    it(`Should be correct totalSupply: ${INIT_TOTAL_SUPPLY_HUMAN}`, async function () {
      const { sla } = await loadFixture(deploySLA);

      expect(await sla.totalSupply()).to.equal(INIT_TOTAL_SUPPLY);
    });

    it('Should be equal owner balance totalSupply', async function () {
      const { sla, owner } = await loadFixture(deploySLA);

      const ownerBalance = await sla.balanceOf(owner);
      expect(await sla.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe('Tests. Lecture #17', () => {
    const deploySLA = async () => {
      const [owner, otherAccount, thirdAccount] = await hre.ethers.getSigners();

      const sla = await hre.ethers.deployContract('SLA');

      const mintValueOwner = BigInt(75 * DECIAML_MULT);
      await sla.mint(owner, mintValueOwner);

      const mintValueAcc2 = BigInt(25 * DECIAML_MULT);
      await sla.mint(otherAccount, mintValueAcc2);

      await sla.waitForDeployment();

      return { sla, owner, otherAccount, thirdAccount };
    }

    it('Should "transfer" work correctly', async function () {
      const { sla, owner, otherAccount } = await loadFixture(deploySLA);
      const sentAmount = BigInt(5 * DECIAML_MULT);
  
      // 1. Save old otherAccount and owner balances
      const otherAccBalance = await sla.balanceOf(otherAccount); // 25 tokens
      const ownerBalance = await sla.balanceOf(owner); // 75 tokens
      // 2. Send balance (5 tokens) to owner account
      await sla.connect(otherAccount).transfer(owner, sentAmount);
      // 3. Check if otherAccount update balance (20 tokens)
      expect(await sla.balanceOf(otherAccount)).to.equal(otherAccBalance - sentAmount);
      // 4. Check if owner update balance (80 tokens)
      expect(await sla.balanceOf(owner)).to.equal(ownerBalance + sentAmount);
    });

    it('Should "approve" work correctly', async () => {
      const { sla, owner, otherAccount } = await loadFixture(deploySLA);
      const sentAmount = BigInt(15 * DECIAML_MULT);

      // 1. Call "approve" with 15 tokens for otherAccount
      await sla.connect(otherAccount).approve(owner, sentAmount);
      // 2. Check with "allowance"
      expect(await sla.allowance(otherAccount, owner)).to.equal(sentAmount);
    });

    it('Should "transferFrom" work correctly', async () => {
      const { sla, owner, otherAccount, thirdAccount } = await loadFixture(deploySLA);
      const amount = BigInt(15 * DECIAML_MULT);

      // 1. Give approve owner to thirdAccount
      await sla.approve(thirdAccount, amount);
      // 2. Save old otherAccount balance
      const otherAccBalance = await sla.balanceOf(otherAccount);
      // 3. Sent from thirdAccount to otherAccount
      await sla.connect(thirdAccount).transferFrom(owner, otherAccount, amount);
      // 4. Check balance on otherAccount
      expect(await sla.balanceOf(otherAccount)).to.be.equal(otherAccBalance + amount);
    });

    it('Should "transferFrom" can\'t call if not enough balance', async () => {
      const { sla, owner, otherAccount, thirdAccount } = await loadFixture(deploySLA);
      const amount = BigInt(15 * DECIAML_MULT);

      // 1. Give approve owner to thirdAccount
      await sla.approve(thirdAccount, amount);
      // 2. Save old otherAccount balance
      const otherAccBalance = await sla.balanceOf(otherAccount);
      // 3. Sent from thirdAccount to otherAccount
      const thirdAccAllowance = await sla.allowance(owner, thirdAccount);
      const moreThanAllowance = thirdAccAllowance + BigInt(1);
      const tx = sla.connect(thirdAccount).transferFrom(owner, otherAccount, moreThanAllowance);
      // 4. Check balance on otherAccount
      expect(tx).to.be.rejectedWith('ERC20: insufficient allowance');
    });

    it('Should "burn" work correctly', async () => {
      const { sla, owner } = await loadFixture(deploySLA);
      const amount = BigInt(15 * DECIAML_MULT);
      
      const balance = await sla.balanceOf(owner);
      await sla.burn(amount);
      expect(await sla.balanceOf(owner)).to.be.equal(balance - amount);
    });

    it('Should "owner" equal contract owner', async () => {
      const { sla, owner } = await loadFixture(deploySLA);

      expect(await sla.owner()).to.be.equal(owner.address);
    });

    it('Should only "owner" mint new tokens', async () => {
      const { sla, otherAccount } = await loadFixture(deploySLA);
      const amount = BigInt(15 * DECIAML_MULT);

      expect(await sla.mint(otherAccount, amount)).not.to.be.reverted;
    });

    it('Should "otherAccount" can\'t mint new tokens', async () => {
      const { sla, owner, otherAccount } = await loadFixture(deploySLA);
      const amount = BigInt(15 * DECIAML_MULT);

      await expect(sla.connect(otherAccount).mint(owner, amount))
        .to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('Should max totalSupply is capitalization', async () => {
      const { sla, otherAccount } = await loadFixture(deploySLA);
      
      const amount = await sla.cap() + BigInt(1);
      await expect(sla.mint(otherAccount, amount))
        .to.be.revertedWith('Max number of tokens minted');
    });

  });

});