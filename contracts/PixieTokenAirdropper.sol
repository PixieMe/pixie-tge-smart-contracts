pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/ownership/HasNoEther.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/ERC20Basic.sol';

contract PixieTokenAirdropper is Ownable, HasNoEther {

  // The token which is already deployed to the network
  ERC20Basic public token;

  event AirDroppedTokens(uint256 addressCount);
  event AirDrop(address indexed receiver, uint256 total);

  // After this contract is deployed, we will grant access to this contract
  // by calling methods on the token since we are using the same owner
  // and granting the distribution of tokens to this contract
  constructor(address _token) public payable {
    require(_token != address(0), "Must be a non-zero address");

    token = ERC20Basic(_token);
  }

  function transfer(address[] _address, uint256[] _values) onlyOwner public {
    require(_address.length == _values.length, "Address array and values array must be same length");

    for (uint i = 0; i < _address.length; i += 1) {
      _transfer(_address[i], _values[i]);
    }

    emit AirDroppedTokens(_address.length);
  }

  function transferSingle(address _address, uint256 _value) onlyOwner public {
    _transfer(_address, _value);

    emit AirDroppedTokens(1);
  }

  function _transfer(address _address, uint256 _value) internal {
    require(_address != address(0), "Address invalid");
    require(_value > 0, "Value invalid");

    token.transfer(_address, _value);

    emit AirDrop(_address, _value);
  }

  function remainingBalance() public view returns (uint256) {
    return token.balanceOf(address(this));
  }

  // after we distribute the bonus tokens, we will send them back to the coin itself
  function ownerRecoverTokens(address _beneficiary) external onlyOwner {
    require(_beneficiary != address(0));
    require(_beneficiary != address(token));

    uint256 _tokensRemaining = token.balanceOf(address(this));
    if (_tokensRemaining > 0) {
      token.transfer(_beneficiary, _tokensRemaining);
    }
  }

}
