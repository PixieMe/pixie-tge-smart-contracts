pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/ownership/HasNoEther.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/ERC20Basic.sol';

contract PixieTokenAirdropper is Ownable, HasNoEther {

  // The token which is already deployed to the network
  ERC20Basic token;

  event AirDroppedTokens(uint256 addressCount);

  // After this contract is deployed, we will grant access to this contract
  // by calling methods on the token since we are using the same owner
  // and granting the distribution of tokens to this contract
  constructor(address _token) public payable {
    require(_token != 0x0, "Must be a non-zero address");

    token = ERC20Basic(_token);
  }

  function transfer(address[] _address, uint256[] _values) onlyOwner public {
    require(_address.length == _values.length, "Address array and values array must be same length");

    for (uint i = 0; i < _address.length; i += 1) {
      token.transfer(_address[i], _values[i]);
    }

    emit AirDroppedTokens(_address.length);
  }

  // after we distribute the bonus tokens, we will send them back to the coin itself
  function ownerRecoverTokens(address _beneficiary) external onlyOwner {
    require(_beneficiary != 0x0);
    require(_beneficiary != address(token));

    uint256 _tokensRemaining = token.balanceOf(address(this));
    if (_tokensRemaining > 0) {
      token.transfer(_beneficiary, _tokensRemaining);
    }
  }

}
