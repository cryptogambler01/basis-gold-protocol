import chai, { expect } from 'chai';
import { ethers } from 'hardhat';
import { solidity } from 'ethereum-waffle';
import { Contract, ContractFactory, BigNumber, utils } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';

chai.use(solidity);

describe('Tokens', () => {
  const ETH = utils.parseEther('1');
  const MINT_BALANCE = utils.parseEther('0.001');
  const ZERO = BigNumber.from(0);
  const ZERO_ADDR = '0x0000000000000000000000000000000000000000';

  const { provider } = ethers;

  let operator: SignerWithAddress;

  before('setup accounts', async () => {
    [operator] = await ethers.getSigners();
  });

  let Bond: ContractFactory;
  let Gold: ContractFactory;
  let Share: ContractFactory;

  before('fetch contract factories', async () => {
    Bond = await ethers.getContractFactory('Bond');
    Gold = await ethers.getContractFactory('Gold');
    Share = await ethers.getContractFactory('Share');
  });

  describe('Bond', () => {
    let token: Contract;

    before('deploy token', async () => {
      token = await Bond.connect(operator).deploy();
    });

    it('mint', async () => {
      const mintAmount = ETH.mul(2);
      await expect(token.connect(operator).mint(operator.address, mintAmount))
        .to.emit(token, 'Transfer')
        .withArgs(ZERO_ADDR, operator.address, mintAmount);
      expect(await token.balanceOf(operator.address)).to.eq(mintAmount);
    });

    it('burn', async () => {
      await expect(token.connect(operator).burn(ETH))
        .to.emit(token, 'Transfer')
        .withArgs(operator.address, ZERO_ADDR, ETH);
      expect(await token.balanceOf(operator.address)).to.eq(ETH);
    });

    it('burnFrom', async () => {
      await expect(token.connect(operator).approve(operator.address, ETH));
      await expect(token.connect(operator).burnFrom(operator.address, ETH))
        .to.emit(token, 'Transfer')
        .withArgs(operator.address, ZERO_ADDR, ETH);
      expect(await token.balanceOf(operator.address)).to.eq(ZERO);
    });
  });

  describe('Gold', () => {
    let token: Contract;

    before('deploy token', async () => {
      token = await Gold.connect(operator).deploy();
    });

    it('mint', async () => {
      await expect(token.connect(operator).mint(operator.address, ETH))
        .to.emit(token, 'Transfer')
        .withArgs(ZERO_ADDR, operator.address, ETH);
      expect(await token.balanceOf(operator.address)).to.eq(ETH.add(MINT_BALANCE));
    });

    it('burn', async () => {
      await expect(token.connect(operator).burn(ETH))
        .to.emit(token, 'Transfer')
        .withArgs(operator.address, ZERO_ADDR, ETH);
      expect(await token.balanceOf(operator.address)).to.eq(MINT_BALANCE);
    });

    it('burnFrom', async () => {
      await expect(token.connect(operator).approve(operator.address, MINT_BALANCE));
      await expect(token.connect(operator).burnFrom(operator.address, MINT_BALANCE))
        .to.emit(token, 'Transfer')
        .withArgs(operator.address, ZERO_ADDR, MINT_BALANCE);
      expect(await token.balanceOf(operator.address)).to.eq(ZERO);
    });
  });

  describe('Share', () => {
    let token: Contract;

    before('deploy token', async () => {
      token = await Share.connect(operator).deploy();
    });

    it('mint', async () => {
      await expect(token.connect(operator).mint(operator.address, ETH))
        .to.emit(token, 'Transfer')
        .withArgs(ZERO_ADDR, operator.address, ETH);
      expect(await token.balanceOf(operator.address)).to.eq(ETH.mul(2));
    });

    it('burn', async () => {
      await expect(token.connect(operator).burn(ETH))
        .to.emit(token, 'Transfer')
        .withArgs(operator.address, ZERO_ADDR, ETH);
      expect(await token.balanceOf(operator.address)).to.eq(ETH);
    });

    it('burnFrom', async () => {
      await expect(token.connect(operator).approve(operator.address, ETH));
      await expect(token.connect(operator).burnFrom(operator.address, ETH))
        .to.emit(token, 'Transfer')
        .withArgs(operator.address, ZERO_ADDR, ETH);
      expect(await token.balanceOf(operator.address)).to.eq(ZERO);
    });
  });
});
