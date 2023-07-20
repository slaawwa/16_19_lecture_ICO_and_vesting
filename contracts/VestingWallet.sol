// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/finance/VestingWallet.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract SLAVesting is ERC20, ERC20Capped, ERC20Burnable, Ownable, VestingWallet {
  constructor(address beneficiaryAddress, uint64 startTimestamp, uint64 durationSeconds)
    ERC20("SLA Token", "SLA")
    ERC20Capped(1_400_000 * 10 ** decimals())
    VestingWallet(beneficiaryAddress, startTimestamp, durationSeconds)
  {}

  function mint(address to, uint256 amount) public onlyOwner {
    _mint(to, amount);
  }

  function _mint(address to, uint256 amount) internal override (ERC20, ERC20Capped) {
    require(totalSupply() + amount <= cap(), "Max number of tokens minted");
    super._mint(to, amount);
  }

  function decimals() public pure override returns (uint8) {
    return 12;
  }
}
